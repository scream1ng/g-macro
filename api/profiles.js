const { put, head } = require('@vercel/blob');

const BLOB_PATH = 'gmacro-profiles.json';

async function readProfiles() {
  try {
    const blob = await head(BLOB_PATH);
    const res = await fetch(blob.url, { cache: 'no-store' });
    if (!res.ok) { console.error('readProfiles fetch failed:', res.status, blob.url); return []; }
    return await res.json();
  } catch (e) {
    console.error('readProfiles error:', e.message);
    return [];
  }
}

async function writeProfiles(profiles) {
  await put(BLOB_PATH, JSON.stringify(profiles), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

async function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    let data = '';
    req.on('data', c => data += c);
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json(await readProfiles());
  }

  const body = await parseBody(req);

  if (req.method === 'POST') {
    const { profile, ownerId } = body;
    if (!profile || !ownerId) return res.status(400).json({ error: 'Missing fields' });
    const all = await readProfiles();
    const idx = all.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      if (all[idx].ownerId !== ownerId) return res.status(403).json({ error: 'Not owner' });
      all[idx] = { ...profile, ownerId };
    } else {
      all.push({ ...profile, ownerId, publishedAt: Date.now() });
    }
    try {
      await writeProfiles(all);
    } catch (e) {
      console.error('writeProfiles error:', e.message);
      return res.status(500).json({ error: e.message });
    }
    return res.status(200).json(all);
  }

  if (req.method === 'DELETE') {
    const { id, ownerId } = body;
    if (!id || !ownerId) return res.status(400).json({ error: 'Missing fields' });
    const all = await readProfiles();
    const idx = all.findIndex(p => p.id === id);
    if (idx < 0) return res.status(404).json({ error: 'Not found' });
    if (all[idx].ownerId !== ownerId) return res.status(403).json({ error: 'Not owner' });
    all.splice(idx, 1);
    await writeProfiles(all);
    return res.status(200).json(all);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
