const { Router } = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { optionalAuth } = require('../middleware/auth');

const router = Router();

// GET /api/notifications
router.get('/notifications', optionalAuth, async (req, res) => {
  let query = supabaseAdmin.from('notifications').select('id, type, title, body, is_read, created_at').order('id', { ascending: false });
  if (req.user?.id) query = query.eq('user_id', req.user.id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json((data || []).map(r => ({ id: r.id, type: r.type, title: r.title, body: r.body, isRead: r.is_read, createdAt: r.created_at })));
});

// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', async (req, res) => {
  const id = Number(req.params.id);
  await supabaseAdmin.from('notifications').update({ is_read: true }).eq('id', id);
  const { data } = await supabaseAdmin.from('notifications').select('id, type, title, body, is_read, created_at').eq('id', id).single();
  if (!data) return res.status(404).json({ message: 'Notification not found' });
  res.json({ id: data.id, type: data.type, title: data.title, body: data.body, isRead: data.is_read, createdAt: data.created_at });
});

// GET /api/education
router.get('/education', async (_req, res) => {
  const { data } = await supabaseAdmin.from('education_contents').select('*').order('id');
  res.json(data || []);
});

// GET /api/payment-methods
router.get('/payment-methods', async (_req, res) => {
  const { data } = await supabaseAdmin.from('payment_methods').select('code, label, description').order('id');
  res.json(data || []);
});

// GET /api/partner-applications (public)
router.get('/partner-applications', async (_req, res) => {
  const { data } = await supabaseAdmin.from('partner_applications').select('*').order('created_at', { ascending: false });
  res.json((data || []).map(r => ({ id: r.id, fullName: r.full_name, phone: r.phone, area: r.area, field: r.field, experience: r.experience, description: r.description, address: r.address, status: r.status, documents: r.documents_json || [], createdAt: r.created_at })));
});

// POST /api/partner-applications (public)
router.post('/partner-applications', async (req, res) => {
  const { fullName, phone, area, field, experience, description, address, documents = [] } = req.body || {};
  if (!fullName || !phone || !area || !field || !experience || !description || !address) {
    return res.status(400).json({ message: 'fullName, phone, area, field, experience, description, and address are required' });
  }
  const createdAt = new Date().toISOString();
  const { data: row, error } = await supabaseAdmin.from('partner_applications').insert({ full_name: fullName, phone, area, field, experience, description, address, status: 'pending', documents_json: documents, created_at: createdAt }).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json({ id: row.id, fullName, phone, area, field, experience, description, address, status: 'pending', documents, createdAt });
});

module.exports = router;
