const cloudinary = require("cloudinary").v2;
const fs = require("fs");

let sharp = null;
try { sharp = require("sharp"); } catch (_) {
  console.warn("⚠️ 'sharp' not installed — large images won't be auto-compressed. Run: npm i sharp");
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB Cloudinary hard limit for images

// ==============================
// Cloudinary Configuration (Multi-Account with Round-Robin + Fallback)
// ==============================
// Build accounts dynamically from env so any number of accounts works
const loadAccountsFromEnv = () => {
  const env = process.env;
  const accounts = [];

  // 1) Support legacy base (no suffix) keys
  const legacyBase = env.Cloudinary_name && env.Cloudinary_api_key && env.Cloudinary_api_secret
    ? {
        cloud_name: env.Cloudinary_name,
        api_key: env.Cloudinary_api_key,
        api_secret: env.Cloudinary_api_secret,
      }
    : null;

  // 2) Collect suffixes for CLOUDINARY_ vars ("", "_2", "_3", ...)
  const suffixes = new Set();
  Object.keys(env).forEach((k) => {
    const m = k.match(/^CLOUDINARY_CLOUD_NAME(_\d+)?$/);
    if (m) suffixes.add(m[1] || "");
  });

  // 3) Build accounts from primary (CLOUDINARY_*) keys
  for (const sfx of Array.from(suffixes).sort((a,b) => {
    // sort: base "" first, then numeric order
    const ai = a ? parseInt(a.slice(1), 10) : 0;
    const bi = b ? parseInt(b.slice(1), 10) : 0;
    return ai - bi;
  })) {
    const nameKey = `CLOUDINARY_CLOUD_NAME${sfx}`;
    const keyKey = `CLOUDINARY_API_KEY${sfx}`;
    const secKey = `CLOUDINARY_API_SECRET${sfx}`;
    const cloud_name = env[nameKey];
    const api_key = env[keyKey];
    const api_secret = env[secKey];
    if (cloud_name && api_key && api_secret) {
      accounts.push({ cloud_name, api_key, api_secret });
    } else {
      if (cloud_name || api_key || api_secret) {
        console.warn(`⚠️ Incomplete Cloudinary env for suffix "${sfx}": expected ${nameKey}, ${keyKey}, ${secKey}`);
      }
    }
  }

  // 4) If no CLOUDINARY_* accounts found, fall back to legacy base
  if (accounts.length === 0 && legacyBase) accounts.push(legacyBase);

  return accounts;
};

const cloudAccounts = loadAccountsFromEnv();

if (cloudAccounts.length === 0) {
  throw new Error('No Cloudinary credentials found.');
}

console.log(`🔧 Cloudinary: loaded ${cloudAccounts.length} account(s)`);
cloudinary.config(cloudAccounts[0]);

// Round-robin pointer for balancing uploads
let rrIndex = 0;
const getNextStartIndex = () => {
  const idx = rrIndex;
  rrIndex = (rrIndex + 1) % cloudAccounts.length;
  return idx;
};

// Backwards-compatible alias: always uses multi-account uploader
const uploadoncloudinary = async (path, sectorOrFolder) => {
  return uploadWithFallback(path, sectorOrFolder);
};

// Compress oversized images to fit under Cloudinary's 10MB limit
async function ensureUnderLimit(srcPath) {
  try {
    const stat = fs.statSync(srcPath);
    if (stat.size <= MAX_UPLOAD_BYTES || !sharp) return { path: srcPath, temp: null };

    // Try progressively lower quality WebP encodes
    const qualities = [80, 72, 65, 58, 50];
    let lastTemp = null;
    for (const q of qualities) {
      // cleanup previous attempt
      if (lastTemp) { try { fs.unlinkSync(lastTemp); } catch (_) {} }
      const tempPath = srcPath.replace(/(\.[A-Za-z0-9]+)?$/, `-cmp-q${q}-${Date.now()}.webp`);
      await sharp(srcPath)
        .rotate()
        .webp({ quality: q })
        .toFile(tempPath);
      const s2 = fs.statSync(tempPath);
      if (s2.size <= MAX_UPLOAD_BYTES) {
        return { path: tempPath, temp: tempPath };
      }
      lastTemp = tempPath;
    }
    // As a last resort, also try resizing width down if still too big
    const tempPath = srcPath.replace(/(\.[A-Za-z0-9]+)?$/, `-cmp-resized-${Date.now()}.webp`);
    await sharp(srcPath)
      .rotate()
      .resize({ width: 8000, withoutEnlargement: true })
      .webp({ quality: 60 })
      .toFile(tempPath);
    const s3 = fs.statSync(tempPath);
    if (s3.size <= MAX_UPLOAD_BYTES) return { path: tempPath, temp: tempPath };
    // If still too large, return the smallest attempt anyway
    return { path: tempPath, temp: tempPath };
  } catch (e) {
    console.warn("ensureUnderLimit error:", e?.message || e);
    return { path: srcPath, temp: null };
  }
}

// Multi-account round-robin + fallback uploader
const uploadWithFallback = async (path, sectorOrFolder, preferredIndex = null, address = null) => {
  let unlinkPath = path;
  let tempToUnlink = null;
  let lastError = null;
  if (!path) {
    console.warn("[uploadWithFallback] No file path provided.");
    return null;
  }
  // If needed, compress to stay under 10MB
  const prepared = await ensureUnderLimit(path);
  const uploadPath = prepared.path;
  tempToUnlink = prepared.temp; // cleanup after upload

  const baseFolder = (sectorOrFolder || 'Uncategorized').toString().replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 80);
  const addressFolder = address ? address.toString().replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 80) : null;
  const folderName = addressFolder ? `${baseFolder}/${addressFolder}` : baseFolder;
  const start = (Number.isInteger(preferredIndex) && preferredIndex >= 0) ? (preferredIndex % cloudAccounts.length) : getNextStartIndex();

  for (let attempt = 0; attempt < cloudAccounts.length; attempt++) {
    const i = (start + attempt) % cloudAccounts.length;
    const acct = cloudAccounts[i];
    try {
      cloudinary.config(acct);
      const result = await cloudinary.uploader.upload(uploadPath, {
        resource_type: 'auto',
        folder: `properties/${folderName}`,
        unique_filename: true,
        overwrite: false,
      });
      // Best-effort cleanup of temp/original files after successful upload
      try { if (tempToUnlink && fs.existsSync(tempToUnlink)) fs.unlinkSync(tempToUnlink); } catch (_) {}
      try { if (unlinkPath && fs.existsSync(unlinkPath) && unlinkPath !== tempToUnlink) fs.unlinkSync(unlinkPath); } catch (_) {}
      // console.log(`✅ Uploaded ${path} to Cloudinary account #${i + 1} (${acct.cloud_name}) at ${result.secure_url}`);
      return { ...result, accountIndex: i, cloudName: acct.cloud_name };
    } catch (err) {
      lastError = err;
      // console.error(`Cloudinary upload failed on account #${i + 1} (${acct.cloud_name}):`, err?.message || err);
    }
  }

  try { if (tempToUnlink && fs.existsSync(tempToUnlink)) fs.unlinkSync(tempToUnlink); } catch (_) {}
  try { if (unlinkPath && fs.existsSync(unlinkPath) && unlinkPath !== tempToUnlink) fs.unlinkSync(unlinkPath); } catch (_) {}
  throw lastError || new Error('Cloudinary upload failed on all configured accounts');
};

module.exports = { uploadoncloudinary, uploadWithFallback };