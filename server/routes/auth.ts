import express from 'express';

const router = express.Router();

router.post('/signup', async (req, res) => {
  return res.status(410).json({ error: 'SQLite auth removed. Use Supabase Auth.' });
});

router.post('/login', async (req, res) => {
  return res.status(410).json({ error: 'SQLite auth removed. Use Supabase Auth.' });
});

router.post('/refresh', async (req, res) => {
  return res.status(410).json({ error: 'SQLite auth removed. Use Supabase Auth.' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', async (req, res) => {
  return res.status(410).json({ error: 'SQLite auth removed. Use Supabase Auth.' });
});

export default router;
