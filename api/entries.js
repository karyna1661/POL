import Redis from 'ioredis';

const redis = new Redis(process.env.KV_URL || process.env.REDIS_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all entries
      const keys = await redis.keys('entry:*');
      const entries = [];
      
      for (const key of keys) {
        const entryStr = await redis.get(key);
        if (entryStr) entries.push(JSON.parse(entryStr));
      }
      
      entries.sort((a, b) => b.number - a.number);
      res.status(200).json({ entries });
      
    } else if (req.method === 'POST') {
      // Create new entry
      const { entry } = req.body;
      await redis.set(`entry:${entry.id}`, JSON.stringify(entry));
      res.status(201).json({ success: true, entry });
      
    } else if (req.method === 'DELETE') {
      // Delete entry
      const { id } = req.body;
      await redis.del(`entry:${id}`);
      res.status(200).json({ success: true });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
