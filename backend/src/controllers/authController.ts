import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';

export const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username)
    return res.status(400).json({ error: 'Email, password, and username required' });

  // Validate username length and format
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 3-20 characters long' });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens, and underscores' });
  }

  try {
    const existingEmail = await db('users').where({ email }).first();
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const existingUsername = await db('users').where({ username }).first();
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db('users').insert({ email, password: hashed, username });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("Registration error:", err); 
    res.status(500).json({ error: 'Registration failed' });
  }

};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  // Validate username format
  if (username.length < 3 || username.length > 20) {
    return res.json({ available: false, error: 'Username must be 3-20 characters long' });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.json({ available: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' });
  }

  try {
    const existing = await db('users').where({ username }).first();
    res.json({ 
      available: !existing,
      error: existing ? 'Username already taken' : null
    });
  } catch (err) {
    console.error("Username check error:", err);
    res.status(500).json({ error: 'Failed to check username availability' });
  }
};
