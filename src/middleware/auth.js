const { supabaseAdmin } = require('../config/supabase');

/**
 * Verify Supabase JWT token.
 * Sets req.user = { id, authUid, email, role }
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token diperlukan' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }

    // Fetch app user from our users table
    const { data: appUser } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('auth_uid', user.id)
      .single();

    req.user = {
      id: appUser?.id || null,
      authUid: user.id,
      email: user.email,
      role: appUser?.role || user.user_metadata?.role || 'user',
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
}

/**
 * Same as verifyToken but doesn't reject — just sets req.user if token present.
 */
async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      const { data: appUser } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('auth_uid', user.id)
        .single();
      req.user = {
        id: appUser?.id || null,
        authUid: user.id,
        email: user.email,
        role: appUser?.role || 'user',
      };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { verifyToken, optionalAuth };
