import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ message: 'Identifier is required' });
  }

  const salt = process.env.RYBBIT_SALT;
  if (!salt) {
    console.error("RYBBIT_SALT environment variable is not defined");
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const hash = crypto.createHash('sha256').update(identifier + salt).digest('hex');
  res.status(200).json({ hash });
}
