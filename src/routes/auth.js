const { Router } = require('express');
const { supabaseAdmin, supabasePublic } = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone = '' } = req.body || {};
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'email, password, dan fullName wajib diisi' });
    }

    // Create in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'user' },
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // Insert into users table
    const { data: userRow, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_uid: authData.user.id,
        full_name: fullName,
        email,
        phone,
        role: 'user',
        status: 'active',
      })
      .select()
      .single();

    if (dbError) {
      return res.status(400).json({ message: dbError.message });
    }

    return res.status(201).json({
      message: 'Registrasi berhasil',
      user: { id: userRow.id, email: userRow.email, fullName: userRow.full_name, role: userRow.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email dan password wajib diisi' });
    }

    const { data, error } = await supabasePublic.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Get app user
    const { data: appUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_uid', data.user.id)
      .single();

    return res.json({
      user: appUser ? {
        id: appUser.id,
        email: appUser.email,
        fullName: appUser.full_name,
        phone: appUser.phone,
        role: appUser.role,
        status: appUser.status,
      } : { email: data.user.email, role: data.user.user_metadata?.role || 'user' },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_uid', req.user.authUid)
      .single();

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', verifyToken, async (req, res) => {
  // Supabase handles session on client side; backend can invalidate if needed
  return res.json({ message: 'Logout berhasil' });
});

module.exports = router;
