const { Router } = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { optionalAuth } = require('../middleware/auth');

const router = Router();

// POST /api/diagnoses
router.post('/diagnoses', optionalAuth, async (req, res) => {
  const { serviceSlug, title, problemDescription, urgency = 'Sedang', locationText = '', scheduledAt = null } = req.body || {};
  if (!serviceSlug || !problemDescription) return res.status(400).json({ message: 'serviceSlug and problemDescription are required' });

  const { data: svc } = await supabaseAdmin.from('services').select('*').eq('slug', serviceSlug).single();
  if (!svc) return res.status(404).json({ message: 'Service not found' });

  const { data: row, error } = await supabaseAdmin.from('diagnoses').insert({
    user_id: req.user?.id || null, service_id: svc.id, title: title || svc.title,
    problem_description: problemDescription, urgency, location_text: locationText, scheduled_at: scheduledAt,
    recommendation: svc.title, estimated_price: svc.price, estimated_duration: svc.duration,
  }).select().single();

  if (error) return res.status(500).json({ message: error.message });

  res.status(201).json({
    id: row.id, serviceSlug: svc.slug, title: row.title, complaint: problemDescription, urgency,
    recommendation: svc.title, estimatedPrice: svc.price, estimatedDuration: svc.duration,
    probableCauses: ['Perlu inspeksi kondisi aktual di lokasi', 'Kemungkinan ada penurunan performa karena perawatan rutin belum dilakukan', 'Pengecekan teknisi diperlukan untuk memastikan akar masalah'],
    nextAction: 'Pilih mitra terdekat dan konfirmasi jadwal layanan.',
  });
});

// GET /api/orders
router.get('/orders', optionalAuth, async (req, res) => {
  let query = supabaseAdmin.from('orders')
    .select('id, code, status, scheduled_at, total_estimate, services(title), providers(full_name)')
    .order('id', { ascending: false });
  if (req.user?.id) query = query.eq('user_id', req.user.id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json(data.map(r => ({
    id: r.id, code: r.code, status: r.status, scheduledAt: r.scheduled_at,
    totalEstimate: r.total_estimate, totalEstimateLabel: formatCurrency(r.total_estimate),
    serviceTitle: r.services?.title, providerName: r.providers?.full_name,
  })));
});

// GET /api/orders/:id
router.get('/orders/:id', async (req, res) => {
  const order = await getOrderSummary(Number(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// GET /api/orders/:id/tracking
router.get('/orders/:id/tracking', async (req, res) => {
  const order = await getOrderSummary(Number(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order.tracking);
});

// POST /api/orders
router.post('/orders', optionalAuth, async (req, res) => {
  const { serviceSlug, providerId, diagnosisId = null, scheduledAt, problemDescription, addressLine, city = 'Bandung', province = 'Jawa Barat', postalCode = '', paymentMethod = 'cash' } = req.body || {};
  if (!serviceSlug || !providerId || !scheduledAt || !problemDescription || !addressLine) {
    return res.status(400).json({ message: 'serviceSlug, providerId, scheduledAt, problemDescription, and addressLine are required' });
  }

  const { data: svc } = await supabaseAdmin.from('services').select('*').eq('slug', serviceSlug).single();
  if (!svc) return res.status(404).json({ message: 'Service not found' });
  const { data: prov } = await supabaseAdmin.from('providers').select('*').eq('id', providerId).single();
  if (!prov) return res.status(404).json({ message: 'Provider not found' });

  // Get or find user
  let userId = req.user?.id;
  if (!userId) {
    const { data: u } = await supabaseAdmin.from('users').select('id').limit(1).single();
    userId = u?.id;
  }

  const { data: addr } = await supabaseAdmin.from('addresses').insert({
    user_id: userId, label: 'Lokasi layanan', address_line: addressLine, city, province, postal_code: postalCode, is_primary: false,
  }).select().single();

  const serviceFee = parsePriceToInt(svc.price);
  const visitFee = 15000;
  const totalEstimate = serviceFee + visitFee;
  const code = `ORD-${Date.now()}`;

  const { data: orderRow, error } = await supabaseAdmin.from('orders').insert({
    code, user_id: userId, service_id: svc.id, provider_id: prov.id, address_id: addr.id,
    diagnosis_id: diagnosisId, status: 'submitted', scheduled_at: scheduledAt,
    problem_description: problemDescription, service_fee: serviceFee, visit_fee: visitFee,
    material_fee_estimate: 0, total_estimate: totalEstimate, total_final: totalEstimate, payment_method: paymentMethod,
  }).select().single();

  if (error) return res.status(500).json({ message: error.message });

  const trackingEvents = [
    { status: 'submitted', label: 'Menunggu konfirmasi', description: 'Pesanan sudah dikirim ke penyedia jasa.', happened_at: new Date().toISOString(), sort_order: 1 },
    { status: 'accepted', label: 'Diterima penyedia jasa', description: `${prov.full_name} menerima pesanan Anda.`, happened_at: null, sort_order: 2 },
    { status: 'traveling', label: 'Dalam perjalanan', description: 'Penyedia jasa sedang menuju lokasi Anda.', happened_at: null, sort_order: 3 },
    { status: 'arrived', label: 'Tiba di lokasi', description: 'Teknisi sudah berada di alamat tujuan.', happened_at: null, sort_order: 4 },
    { status: 'in_progress', label: 'Sedang dikerjakan', description: 'Layanan sedang berjalan.', happened_at: null, sort_order: 5 },
    { status: 'completed', label: 'Selesai', description: 'Pembayaran tersedia setelah pekerjaan diverifikasi.', happened_at: null, sort_order: 6 },
  ].map(e => ({ order_id: orderRow.id, ...e }));

  await supabaseAdmin.from('order_tracking_events').insert(trackingEvents);
  await supabaseAdmin.from('payments').insert({ order_id: orderRow.id, method: paymentMethod, amount: totalEstimate, status: 'pending', note: null });

  const summary = await getOrderSummary(orderRow.id);
  res.status(201).json(summary);
});

// POST /api/orders/:id/payments/confirm
router.post('/orders/:id/payments/confirm', async (req, res) => {
  const orderId = Number(req.params.id);
  const paidAt = new Date().toISOString();
  await supabaseAdmin.from('payments').update({ status: 'paid', paid_at: paidAt }).eq('order_id', orderId);
  await supabaseAdmin.from('orders').update({ status: 'completed' }).eq('id', orderId);
  await supabaseAdmin.from('order_tracking_events').update({ happened_at: paidAt }).eq('order_id', orderId).eq('status', 'completed');
  const summary = await getOrderSummary(orderId);
  if (!summary) return res.status(404).json({ message: 'Order not found' });
  res.json(summary);
});

// POST /api/orders/:id/reviews
router.post('/orders/:id/reviews', optionalAuth, async (req, res) => {
  const orderId = Number(req.params.id);
  const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const { overallRating, timelinessRating, qualityRating, friendlinessRating, reviewText = '' } = req.body || {};
  if (!overallRating || !timelinessRating || !qualityRating || !friendlinessRating) {
    return res.status(400).json({ message: 'All ratings are required' });
  }

  const createdAt = new Date().toISOString();
  const userId = req.user?.id || order.user_id;
  const { data: row, error } = await supabaseAdmin.from('reviews').insert({
    order_id: orderId, service_id: order.service_id, provider_id: order.provider_id, user_id: userId,
    overall_rating: overallRating, timeliness_rating: timelinessRating, quality_rating: qualityRating,
    friendliness_rating: friendlinessRating, review_text: reviewText, created_at: createdAt,
  }).select().single();

  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json({ id: row.id, orderId, createdAt });
});

// ── helpers ──
function formatCurrency(amount) {
  return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
}
function parsePriceToInt(priceText) {
  const match = String(priceText || '').match(/(\d+[\d.]*)/);
  if (!match) return 0;
  return Number(match[1].replace(/\./g, '')) * 1000;
}

async function getOrderSummary(id) {
  const { data: o } = await supabaseAdmin.from('orders')
    .select('*, users(full_name, email), services(slug, title, description), providers(full_name, company, rating, jobs, eta), addresses(address_line, city, province), diagnoses(recommendation, urgency)')
    .eq('id', id).single();
  if (!o) return null;

  const { data: tracking } = await supabaseAdmin.from('order_tracking_events').select('*').eq('order_id', id).order('sort_order');
  const { data: payment } = await supabaseAdmin.from('payments').select('*').eq('order_id', id).single();
  const { data: review } = await supabaseAdmin.from('reviews').select('*').eq('order_id', id).maybeSingle();

  return {
    id: o.id, code: o.code, status: o.status, scheduledAt: o.scheduled_at, problemDescription: o.problem_description,
    user: { name: o.users?.full_name, email: o.users?.email },
    service: { slug: o.services?.slug, title: o.services?.title, description: o.services?.description, recommendation: o.diagnoses?.recommendation, urgency: o.diagnoses?.urgency },
    provider: { name: o.providers?.full_name, company: o.providers?.company, rating: o.providers?.rating, jobs: o.providers?.jobs, eta: o.providers?.eta },
    address: `${o.addresses?.address_line}, ${o.addresses?.city}`,
    pricing: { serviceFee: o.service_fee, visitFee: o.visit_fee, materialFeeEstimate: o.material_fee_estimate, totalEstimate: o.total_estimate, totalFinal: o.total_final },
    payment: payment ? { id: payment.id, status: payment.status, amount: payment.amount, method: payment.method, note: payment.note } : null,
    tracking: (tracking || []).map(t => ({ status: t.status, label: t.label, description: t.description, happenedAt: t.happened_at, done: Boolean(t.happened_at), active: o.status === t.status })),
    review: review ? { overallRating: review.overall_rating, timelinessRating: review.timeliness_rating, qualityRating: review.quality_rating, friendlinessRating: review.friendliness_rating, reviewText: review.review_text, createdAt: review.created_at } : null,
  };
}

module.exports = router;
