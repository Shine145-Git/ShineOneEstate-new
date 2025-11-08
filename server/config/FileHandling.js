const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// ==============================
// Cloudinary Configuration (Multi-Account with Round-Robin + Fallback)
// ==============================
const cloudAccounts = [
  {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.Cloudinary_name,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.Cloudinary_api_key,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.Cloudinary_api_secret,
  },
  process.env.CLOUDINARY_CLOUD_NAME_2 && {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_2,
    api_key: process.env.CLOUDINARY_API_KEY_2,
    api_secret: process.env.CLOUDINARY_API_SECRET_2,
  },
  process.env.CLOUDINARY_CLOUD_NAME_3 && {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_3,
    api_key: process.env.CLOUDINARY_API_KEY_3,
    api_secret: process.env.CLOUDINARY_API_SECRET_3,
  },
  process.env.CLOUDINARY_CLOUD_NAME_4 && {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_4,
    api_key: process.env.CLOUDINARY_API_KEY_4,
    api_secret: process.env.CLOUDINARY_API_SECRET_4,
  },
  process.env.CLOUDINARY_CLOUD_NAME_5 && {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_5,
    api_key: process.env.CLOUDINARY_API_KEY_5,
    api_secret: process.env.CLOUDINARY_API_SECRET_5,
  },
  process.env.CLOUDINARY_CLOUD_NAME_6 && {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_6,
    api_key: process.env.CLOUDINARY_API_KEY_6,
    api_secret: process.env.CLOUDINARY_API_SECRET_6,
  },
].filter(Boolean);

if (cloudAccounts.length === 0) {
  throw new Error('No Cloudinary credentials found.');
}

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

// Multi-account round-robin + fallback uploader
const uploadWithFallback = async (path, sectorOrFolder, preferredIndex = null, address = null) => {
  let unlinkPath = path;
  let lastError = null;
  const baseFolder = (sectorOrFolder || 'Uncategorized').toString().replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 80);
  const addressFolder = address ? address.toString().replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 80) : null;
  const folderName = addressFolder ? `${baseFolder}/${addressFolder}` : baseFolder;
  const start = (Number.isInteger(preferredIndex) && preferredIndex >= 0) ? (preferredIndex % cloudAccounts.length) : getNextStartIndex();

  for (let attempt = 0; attempt < cloudAccounts.length; attempt++) {
    const i = (start + attempt) % cloudAccounts.length;
    const acct = cloudAccounts[i];
    try {
      cloudinary.config(acct);
      const result = await cloudinary.uploader.upload(path, {
        resource_type: 'auto',
        folder: `properties/${folderName}`,
        unique_filename: true,
        overwrite: false,
      });
      console.log(`✅ Uploaded ${path} to Cloudinary account #${i + 1} (${acct.cloud_name}) at ${result.secure_url}`);
      return { ...result, accountIndex: i, cloudName: acct.cloud_name };
    } catch (err) {
      lastError = err;
      console.error(`Cloudinary upload failed on account #${i + 1} (${acct.cloud_name}):`, err?.message || err);
    }
  }

  try { if (unlinkPath) fs.unlinkSync(unlinkPath); } catch (_) {}
  throw lastError || new Error('Cloudinary upload failed on all configured accounts');
};

module.exports = { uploadoncloudinary, uploadWithFallback };