import Redis from 'ioredis';

const redis = new Redis(process.env.KV_URL || process.env.REDIS_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
      // Get auth
      const authStr = await redis.get('author-auth');
      const auth = authStr ? JSON.parse(authStr) : null;
      res.status(200).json({ auth });
      
    } else if (req.method === 'POST') {
      // Set auth
      const { password } = req.body;
      await redis.set('author-auth', JSON.stringify({ password }));
      res.status(200).json({ success: true });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
