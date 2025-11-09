const { v2: cloudinary } = require('cloudinary');
const https = require('https');

/**
 * Admin – Cloudinary multi‑account usage controller
 * -------------------------------------------------
 * Exposes aggregated usage for all configured Cloudinary accounts.
 * Also contains a Brevo usage helper to fetch email usage.
 *
 * ENV supported formats for Cloudinary accounts:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *   CLOUDINARY_CLOUD_NAME_2, CLOUDINARY_API_KEY_2, CLOUDINARY_API_SECRET_2
 *   CLOUDINARY_CLOUD_NAME_3, ... (and so on – dynamic detection)
 * Also supports legacy: Cloudinary_name / Cloudinary_api_key / Cloudinary_api_secret
 */

// --- Discover accounts from env dynamically (any number: 1..N) ---
function loadAccountsFromEnv(env = process.env) {
  const accounts = [];

  // Find suffixes from CLOUDINARY_CLOUD_NAME(_\d+)?
  const suffixes = new Set();
  for (const key of Object.keys(env)) {
    const m = key.match(/^CLOUDINARY_CLOUD_NAME(_\d+)?$/);
    if (m) suffixes.add(m[1] || '');
  }

  // Sort suffixes so base ("") comes first, then _2, _3, ...
  const ordered = Array.from(suffixes).sort((a, b) => {
    const ai = a ? parseInt(a.slice(1), 10) : 0;
    const bi = b ? parseInt(b.slice(1), 10) : 0;
    return ai - bi;
  });

  for (const sfx of ordered) {
    const cloud_name = env[`CLOUDINARY_CLOUD_NAME${sfx}`];
    const api_key = env[`CLOUDINARY_API_KEY${sfx}`];
    const api_secret = env[`CLOUDINARY_API_SECRET${sfx}`];
    if (cloud_name && api_key && api_secret) {
      accounts.push({ cloud_name, api_key, api_secret });
    }
  }

  // Backward‑compat (single legacy set)
  if (
    accounts.length === 0 &&
    env.Cloudinary_name &&
    env.Cloudinary_api_key &&
    env.Cloudinary_api_secret
  ) {
    accounts.push({
      cloud_name: env.Cloudinary_name,
      api_key: env.Cloudinary_api_key,
      api_secret: env.Cloudinary_api_secret,
    });
  }

  return accounts;
}

const ACCOUNTS = loadAccountsFromEnv();

if (!ACCOUNTS.length) {
  // Don't throw here – controller might be imported during build. We will error on request.
  console.warn('[CloudinaryUsage] No Cloudinary accounts detected from environment.');
}

// --- Simple in‑memory cache (per process) ---
const CACHE = {
  when: 0,
  data: null,
};
const CACHE_MS = 60 * 1000; // 60 seconds – tweak as needed

// --- Helper: derive credits if API doesn't return them explicitly ---
function deriveCreditsFromUsage(usageObj) {
  if (!usageObj) return { used: 0, from: 'none' };
  const storageBytes = usageObj?.storage?.usage || 0; // bytes
  const bandwidthBytes = usageObj?.bandwidth?.usage || 0; // bytes
  const transformations = usageObj?.transformations?.usage || 0; // count
  const gb = (bytes) => bytes / (1024 ** 3);
  const used = gb(storageBytes) + gb(bandwidthBytes) + (transformations / 1000);
  return { used, from: 'derived' };
}

// --- Core fetcher for all accounts ---
async function fetchAllAccountsUsage() {
  if (!ACCOUNTS.length) throw new Error('No Cloudinary accounts configured');

  const out = [];
  for (let i = 0; i < ACCOUNTS.length; i++) {
    const acct = ACCOUNTS[i];
    try {
      cloudinary.config(acct);
      const usage = await cloudinary.api.usage(); // Admin API call

      // Prefer explicit credits if present
      const apiCreditsUsage = usage?.credits?.usage;
      const apiCreditsLimit = usage?.credits?.limit;

      let usedCredits;
      let creditsFrom = 'api';
      if (typeof apiCreditsUsage === 'number') {
        usedCredits = apiCreditsUsage;
      } else {
        const d = deriveCreditsFromUsage(usage);
        usedCredits = d.used;
        creditsFrom = d.from;
      }

      // Fallback plan limit (free plan is typically 25 credits)
      const planLimit = (typeof apiCreditsLimit === 'number' && apiCreditsLimit > 0) ? apiCreditsLimit : 25;
      const remaining = Math.max(0, planLimit - usedCredits);

      out.push({
        index: i,
        cloudName: acct.cloud_name,
        credits: {
          used: usedCredits,
          limit: planLimit,
          remaining,
          source: creditsFrom,
        },
        storage: {
          bytes: usage?.storage?.usage || 0,
          limit: usage?.storage?.limit ?? null,
        },
        bandwidth: {
          bytes: usage?.bandwidth?.usage || 0,
          limit: usage?.bandwidth?.limit ?? null,
        },
        transformations: {
          count: usage?.transformations?.usage || 0,
          limit: usage?.transformations?.limit ?? null,
        },
        raw: usage, // keep full payload for debugging (do not forward to client if you don't want to)
      });
    } catch (err) {
      out.push({
        index: i,
        cloudName: acct.cloud_name,
        error: err?.message || String(err),
      });
    }
  }
  return out;
}

// --- Express controller (Cloudinary usage) ---
async function getAccountsUsage(req, res) {
  try {
    const force = req.query.force === '1' || req.query.force === 'true';
    const onlyCredits = req.query.onlyCredits === '1' || req.query.onlyCredits === 'true';

    const now = Date.now();
    if (!force && CACHE.data && now - CACHE.when < CACHE_MS) {
      return res.json({
        success: true,
        cached: true,
        refreshedAt: new Date(CACHE.when).toISOString(),
        accounts: ACCOUNTS.map((a, i) => ({ index: i, cloudName: a.cloud_name })),
        data: sanitize(CACHE.data, onlyCredits),
      });
    }

    const data = await fetchAllAccountsUsage();
    CACHE.when = Date.now();
    CACHE.data = data;

    res.json({
      success: true,
      cached: false,
      refreshedAt: new Date(CACHE.when).toISOString(),
      accounts: ACCOUNTS.map((a, i) => ({ index: i, cloudName: a.cloud_name })),
      data: sanitize(data, onlyCredits),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to fetch Cloudinary usage' });
  }
}

// Keep response lean if onlyCredits=true
function sanitize(arr, onlyCredits) {
  if (!onlyCredits) return arr.map(stripRaw);
  return arr.map((r) => ({
    index: r.index,
    cloudName: r.cloudName,
    credits: r.credits,
    error: r.error,
  }));
}

function stripRaw(r) {
  const { raw, ...rest } = r || {};
  return rest;
}

// ----------------------
// Brevo usage helper
// ----------------------
// Small HTTPS helper so we don't add new deps
function brevoFetch(path) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return reject(new Error('BREVO_API_KEY missing in environment'));

    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: `/v3${path}`,
        method: 'GET',
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const json = body ? JSON.parse(body) : {};
              resolve(json);
            } catch (e) {
              reject(new Error(`Brevo ${path} JSON parse error: ${e.message}`));
            }
          } else {
            reject(new Error(`Brevo ${path} ${res.statusCode}: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

/**
 * GET /api/admin/brevo/usage
 * Query params:
 *   days: number (default 30, max 90)
 *   debug: 1 => logs raw payloads to server console
 */
async function getBrevoUsage(req, res) {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days || '30', 10) || 30, 1), 90);
    const debug = req.query.debug === '1' || req.query.debug === 'true';

    // 1) Account details (plan info, sometimes credits info available here)
    const account = await brevoFetch('/account');

    // 2) Aggregated SMTP stats over the requested period
    const agg = await brevoFetch(`/smtp/statistics/aggregatedReport?days=${days}`);

    // Optionally: daily breakdown (commented; uncomment if you need it)
    // const byDay = await brevoFetch(`/smtp/statistics/reports?days=${days}`);

    const plan = Array.isArray(account?.plan) ? account.plan[0] : account?.plan || {};

    // Some plans expose a credits number; many do not. We compute remaining if we have a limit.
    const creditsLimit = typeof plan.credits === 'number' ? plan.credits : null;

    const stats = agg?.statistics || {};
    const sent = stats.sent || 0;
    const delivered = stats.delivered || 0;
    const opens = stats.opens || 0;
    const hardBounces = stats.hardBounces || 0;

    const creditsRemaining = creditsLimit != null ? Math.max(0, creditsLimit - sent) : null;

    if (debug) {
      console.log('[Brevo][DEBUG] account:', JSON.stringify(account, null, 2));
      console.log('[Brevo][DEBUG] aggregatedReport:', JSON.stringify(agg, null, 2));
    }

    return res.json({
      success: true,
      days,
      account: {
        company: account?.companyName || null,
        email: account?.email || null,
        planType: plan?.type || null,
        creditsLimit,            // might be null depending on plan
        creditsRemaining,        // computed if creditsLimit exists
        planStart: plan?.startDate || null,
        planEnd: plan?.endDate || null,
      },
      usage: {
        sent,
        delivered,
        opens,
        hardBounces,
      },
      // byDay, // include if you fetched it
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}
function locationIqFetch(path, region = 'us1', key) {
  return new Promise((resolve, reject) => {
    if (!key) return reject(new Error('LOCATIONIQ_KEY missing in environment'));

    const hostname = region === 'eu1' ? 'eu1.locationiq.com' : `${region}.locationiq.com`;
    const req = https.request(
      {
        hostname,
        path: `/v1${path}`,
        method: 'GET',
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const json = body ? JSON.parse(body) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) return resolve(json);
            return reject(new Error(`LocationIQ ${path} ${res.statusCode}: ${body}`));
          } catch (err) {
            return reject(new Error(`LocationIQ ${path} parse error: ${err.message}`));
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    // add query via path already e.g. /balance?key=KEY&format=json
    req.end();
  });
}

/**
 * GET /api/admin/locationiq/usage
 * Query params:
 *  - region (optional): 'us1' | 'eu1' (default 'us1')
 *  - debug (optional): 1 to console.log raw response
 *
 * Response example (normalised):
 * { success: true, balance: { day: 4996, bonus: 0 }, raw: {...} }
 */
const getLocationIQUsage = async (req, res) => {
  try {
    const region = (req.query.region || process.env.LOCATIONIQ_REGION || 'us1').toLowerCase();
    const key = process.env.LOCATIONIQ_KEY || process.env.LOCATIONIQ_API_KEY;
    if (!key) return res.status(500).json({ success: false, message: 'LOCATIONIQ_KEY missing in env' });

    // LocationIQ balance path: /balance?key=KEY&format=json
    const path = `/balance?key=${encodeURIComponent(key)}&format=json`;
    // Use small timeout wrapper
    const raw = await Promise.race([
      locationIqFetch(path, region, key),
      new Promise((_, rej) => setTimeout(() => rej(new Error('LocationIQ request timeout')), 10000)),
    ]);

    if (req.query.debug === '1' || req.query.debug === 'true') {
      console.log('[LocationIQ][DEBUG] raw balance:', JSON.stringify(raw, null, 2));
    }

    // LocationIQ returns shape: { status: 'ok', balance: { day: N, bonus: M } }
    const balance = raw?.balance || null;
    return res.json({ success: true, balance, raw });
  } catch (err) {
    console.error('[LocationIQ] usage error:', err.message || err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch LocationIQ usage' });
  }
};

module.exports = {
  getAccountsUsage,
  // Export helpers for tests or advanced use
  loadAccountsFromEnv,
  fetchAllAccountsUsage,
    getBrevoUsage, 
    getLocationIQUsage,
};