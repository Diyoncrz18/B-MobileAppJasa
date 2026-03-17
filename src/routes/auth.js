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

// PATCH /api/auth/profile
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const fullName = String(req.body?.fullName || '').trim();
    const phone = String(req.body?.phone || '').trim();

    if (!fullName) {
      return res.status(400).json({ message: 'Nama lengkap wajib diisi' });
    }

    const { data: currentUser, error: currentUserError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, status, created_at')
      .eq('auth_uid', req.user.authUid)
      .single();

    if (currentUserError || !currentUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        full_name: fullName,
        phone: phone || null,
      })
      .eq('auth_uid', req.user.authUid)
      .select('*')
      .single();

    if (updateError || !updatedUser) {
      return res.status(400).json({ message: updateError?.message || 'Gagal memperbarui profil' });
    }

    const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.authUid,
      {
        user_metadata: {
          full_name: fullName,
          role: updatedUser.role,
        },
      }
    );

    if (metadataError) {
      console.warn('Failed to sync auth metadata:', metadataError.message);
    }

    return res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.full_name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.created_at,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Password lama dan password baru wajib diisi' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password baru minimal 8 karakter' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Password baru harus berbeda dari password lama' });
    }

    const { data: currentUser, error: currentUserError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('auth_uid', req.user.authUid)
      .single();

    if (currentUserError || !currentUser?.email) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const { data: loginData, error: loginError } = await supabasePublic.auth.signInWithPassword({
      email: currentUser.email,
      password: currentPassword,
    });

    if (loginError || !loginData?.user || loginData.user.id !== req.user.authUid) {
      return res.status(400).json({ message: 'Password lama tidak sesuai' });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.authUid,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      return res.status(400).json({ message: updateError.message });
    }

    return res.json({ message: 'Password berhasil diperbarui' });
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
