import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { signToken, requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { createUser, findUserByEmail } from '../services/listService.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, name, password } = req.body as {
    email?: string;
    name?: string;
    password?: string;
  };

  if (!email?.trim() || !name?.trim() || !password) {
    res.status(400).json({ error: 'Email, name, and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const existing = findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser(email, name.trim(), passwordHash);
  const token = signToken({ userId: user.id, email: user.email });

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;
