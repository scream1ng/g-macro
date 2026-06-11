const { put, del, list } = require('@vercel/blob');

const PREFIX = 'profiles/';

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
    const { blobs } = await list({ prefix: PREFIX });
    const profiles = await Promise.all(
      blobs.map(blob => fetch(blob.url).then(r => r.json()))
    );
    return res.status(200).json(profiles);
  }

  const body = await parseBody(req);

  if (req.method === 'POST') {
    const { profile, ownerId } = body;
    if (!profile || !ownerId) return res.status(400).json({ error: 'Missing fields' });

    const { blobs } = await list({ prefix: `${PREFIX}${profile.id}.json` });
    let publishedAt = Date.now();
    if (blobs.length > 0) {
      const existing = await fetch(blobs[0].url).then(r => r.json());
      if (existing.ownerId !== ownerId) return res.status(403).json({ error: 'Not owner' });
      publishedAt = existing.publishedAt ?? publishedAt;
    }

    const data = { ...profile, ownerId, publishedAt };
    await put(`${PREFIX}${profile.id}.json`, JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { id, ownerId } = body;
    if (!id || !ownerId) return res.status(400).json({ error: 'Missing fields' });

    const { blobs } = await list({ prefix: `${PREFIX}${id}.json` });
    if (blobs.length === 0) return res.status(404).json({ error: 'Not found' });

    const existing = await fetch(blobs[0].url).then(r => r.json());
    if (existing.ownerId !== ownerId) return res.status(403).json({ error: 'Not owner' });

    await del(blobs[0].url);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
