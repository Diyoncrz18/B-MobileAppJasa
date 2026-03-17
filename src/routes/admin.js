const { Router } = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

// Admin authentication & role guard
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Akses admin diperlukan' });
  }
  next();
}
router.use(verifyToken, requireAdmin);

function formatCurrency(amount) {
  return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
}

function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function isWithinRange(value, start, end) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date >= start && date < end;
}

function resolveEcoScoreValue(label) {
  switch (String(label || '').toUpperCase()) {
    case 'A+':
      return 5;
    case 'A':
      return 4;
    case 'B+':
      return 3;
    case 'B':
      return 2;
    case 'C':
      return 1;
    default:
      return 0;
  }
}

function resolveEcoScoreLabel(value) {
  if (value >= 4.5) return 'A+';
  if (value >= 3.5) return 'A';
  if (value >= 2.5) return 'B+';
  if (value >= 1.5) return 'B';
  if (value > 0) return 'C';
  return '-';
}

function toneToColor(tone) {
  switch (tone) {
    case 'accent':
      return '#17b38a';
    case 'amber':
      return '#f59e0b';
    case 'blue':
      return '#3b82f6';
    case 'orange':
      return '#f97316';
    case 'rose':
      return '#e11d48';
    case 'eco':
      return '#16a34a';
    case 'brand':
    default:
      return '#2578f5';
  }
}

// GET /api/admin/dashboard
router.get('/dashboard', async (_req, res) => {
  const startOfToday = getStartOfToday();
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [
    usersResult,
    providersResult,
    partnerAppsResult,
    complaintsResult,
    ordersResult,
    paymentsResult,
    servicesResult,
    categoriesResult,
  ] = await Promise.all([
    supabaseAdmin.from('users').select('id, role').neq('role', 'admin'),
    supabaseAdmin.from('providers').select('id'),
    supabaseAdmin.from('partner_applications').select('id, status'),
    supabaseAdmin.from('complaints').select('id, status'),
    supabaseAdmin
      .from('orders')
      .select(
        'id, service_id, total_estimate, scheduled_at, status, created_at, services(title), providers(full_name)'
      )
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('payments').select('id, status, amount, paid_at'),
    supabaseAdmin.from('services').select('id, category_id, eco_score'),
    supabaseAdmin.from('service_categories').select('id, title, tone'),
  ]);

  const failedQuery = [
    usersResult,
    providersResult,
    partnerAppsResult,
    complaintsResult,
    ordersResult,
    paymentsResult,
    servicesResult,
    categoriesResult,
  ].find((result) => result.error);

  if (failedQuery?.error) {
    return res.status(500).json({ message: failedQuery.error.message });
  }

  const users = usersResult.data || [];
  const providers = providersResult.data || [];
  const partnerApplications = partnerAppsResult.data || [];
  const complaints = complaintsResult.data || [];
  const orders = ordersResult.data || [];
  const payments = paymentsResult.data || [];
  const services = servicesResult.data || [];
  const categories = categoriesResult.data || [];

  const serviceById = new Map(
    services.map((service) => [
      service.id,
      {
        categoryId: service.category_id,
        ecoScore: service.eco_score,
      },
    ])
  );
  const categoryById = new Map(
    categories.map((category) => [
      category.id,
      {
        title: category.title,
        tone: category.tone,
      },
    ])
  );

  const totalUsers = users.length;
  const activePartners = providers.length;
  const pendingPartnerApplications = partnerApplications.filter(
    (application) => application.status === 'pending'
  ).length;
  const approvedPartnerApplications = partnerApplications.filter(
    (application) => application.status === 'approved'
  ).length;
  const activeComplaints = complaints.filter(
    (complaint) => complaint.status !== 'resolved'
  ).length;
  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === 'resolved'
  ).length;

  const ordersToday = orders.filter((order) =>
    isWithinRange(order.scheduled_at || order.created_at, startOfToday, startOfTomorrow)
  );
  const processingOrders = orders.filter((order) =>
    ['submitted', 'accepted', 'traveling', 'arrived', 'in_progress', 'processing'].includes(
      order.status
    )
  ).length;
  const completedOrders = orders.filter((order) => order.status === 'completed').length;

  const paidPaymentsToday = payments.filter(
    (payment) =>
      payment.status === 'paid' &&
      isWithinRange(payment.paid_at, startOfToday, startOfTomorrow)
  );
  const revenueToday = paidPaymentsToday.reduce(
    (total, payment) => total + (payment.amount || 0),
    0
  );

  const orderCountByCategory = new Map();
  const ecoScores = [];

  orders.forEach((order) => {
    const service = serviceById.get(order.service_id);

    if (service?.ecoScore) {
      ecoScores.push(resolveEcoScoreValue(service.ecoScore));
    }

    const category = service ? categoryById.get(service.categoryId) : null;
    const categoryLabel = category?.title || 'Lainnya';

    orderCountByCategory.set(categoryLabel, (orderCountByCategory.get(categoryLabel) || 0) + 1);
  });

  const ecoScoreAverageSource = ecoScores.length
    ? ecoScores
    : services
        .map((service) => resolveEcoScoreValue(service.eco_score))
        .filter(Boolean);
  const ecoScoreAverage =
    ecoScoreAverageSource.length > 0
      ? ecoScoreAverageSource.reduce((total, value) => total + value, 0) /
        ecoScoreAverageSource.length
      : 0;

  const distribution = categories
    .map((category) => {
      const count = orderCountByCategory.get(category.title) || 0;
      return {
        color: toneToColor(category.tone),
        count,
        label: category.title,
        value: orders.length ? Math.round((count / orders.length) * 100) : 0,
      };
    })
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

  const totalOrders = orders.length;
  const completionRate = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const estimatedCarbonSavedKg = completedOrders * 3;

  res.json({
    quickStats: {
      activeComplaints,
      approvedPartnerApplications,
      ordersToday: ordersToday.length,
      paidOrdersToday: paidPaymentsToday.length,
      pendingPartnerApplications,
      processingOrders,
      resolvedComplaints,
      revenueToday,
    },
    hero: {
      activePartners,
      completedOrders,
      completionRate,
      ecoImpactLabel: resolveEcoScoreLabel(ecoScoreAverage),
      lastUpdatedAt: new Date().toISOString(),
      totalOrders,
      totalUsers,
    },
    distribution,
    ecoImpact: [
      { label: 'Servis selesai', value: String(completedOrders) },
      { label: 'Estimasi CO2 hemat', value: `${estimatedCarbonSavedKg} kg` },
      { label: 'Completion rate', value: `${completionRate}%` },
    ],
    latestOrders: orders.slice(0, 5).map((order) => ({
      id: order.id,
      providerName: order.providers?.full_name || null,
      scheduledAt: order.scheduled_at,
      status: order.status,
      title: order.services?.title || 'Layanan tidak diketahui',
      totalEstimateLabel: formatCurrency(order.total_estimate || 0),
    })),
  });
});

// GET /api/admin/partner-applications
router.get('/partner-applications', async (_req, res) => {
  const { data } = await supabaseAdmin.from('partner_applications').select('*').order('created_at', { ascending: false });
  res.json((data || []).map(r => ({ id: r.id, name: r.full_name, field: r.field, area: r.area, experience: r.experience, status: r.status, docs: r.documents_json || [], createdAt: r.created_at })));
});

// POST /api/admin/partner-applications/:id/approve
router.post('/partner-applications/:id/approve', async (req, res) => {
  const id = Number(req.params.id);
  await supabaseAdmin.from('partner_applications').update({ status: 'approved' }).eq('id', id);
  const { data } = await supabaseAdmin.from('partner_applications').select('id, status').eq('id', id).single();
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.json(data);
});

// POST /api/admin/partner-applications/:id/reject
router.post('/partner-applications/:id/reject', async (req, res) => {
  const id = Number(req.params.id);
  await supabaseAdmin.from('partner_applications').update({ status: 'rejected' }).eq('id', id);
  const { data } = await supabaseAdmin.from('partner_applications').select('id, status').eq('id', id).single();
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.json(data);
});

// GET /api/admin/complaints
router.get('/complaints', async (_req, res) => {
  const { data } = await supabaseAdmin.from('complaints').select('*').order('created_at', { ascending: false });
  res.json((data || []).map(r => ({ id: r.id, userName: r.user_name, title: r.title, complaint: r.complaint, service: r.service, vendor: r.vendor, priority: r.priority, status: r.status, resolutionNote: r.resolution_note, createdAt: r.created_at })));
});

// POST /api/admin/complaints/:id/process
router.post('/complaints/:id/process', async (req, res) => {
  const id = Number(req.params.id);
  await supabaseAdmin.from('complaints').update({ status: 'processing' }).eq('id', id);
  const { data } = await supabaseAdmin.from('complaints').select('id, status').eq('id', id).single();
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.json(data);
});

// GET /api/admin/users
router.get('/users', async (_req, res) => {
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, full_name, email, phone, role, status, created_at')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });

  if (usersError) {
    return res.status(500).json({ message: usersError.message });
  }

  const userIds = (users || []).map((user) => user.id);
  let orderCountByUser = {};

  if (userIds.length > 0) {
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .in('user_id', userIds);

    if (ordersError) {
      return res.status(500).json({ message: ordersError.message });
    }

    orderCountByUser = (orders || []).reduce((acc, order) => {
      acc[order.user_id] = (acc[order.user_id] || 0) + 1;
      return acc;
    }, {});
  }

  res.json((users || []).map((user) => ({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
    orderCount: orderCountByUser[user.id] || 0,
  })));
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'ID user tidak valid' });
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, full_name, email, phone, role, status, created_at')
    .eq('id', id)
    .single();

  if (userError) {
    if (userError.code === 'PGRST116') {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    return res.status(500).json({ message: userError.message });
  }

  const [
    ordersResult,
    addressesResult,
    diagnosesResult,
    reviewsResult,
    notificationsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select(
        'id, code, status, scheduled_at, total_estimate, total_final, payment_method, created_at, services(title), providers(full_name)'
      )
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('addresses')
      .select('id, label, address_line, city, province, postal_code, is_primary')
      .eq('user_id', id)
      .order('is_primary', { ascending: false }),
    supabaseAdmin.from('diagnoses').select('id').eq('user_id', id),
    supabaseAdmin.from('reviews').select('id, overall_rating').eq('user_id', id),
    supabaseAdmin.from('notifications').select('id, is_read').eq('user_id', id),
  ]);

  const failedQuery = [
    ordersResult,
    addressesResult,
    diagnosesResult,
    reviewsResult,
    notificationsResult,
  ].find((result) => result.error);

  if (failedQuery?.error) {
    return res.status(500).json({ message: failedQuery.error.message });
  }

  const orders = ordersResult.data || [];
  const addresses = addressesResult.data || [];
  const diagnoses = diagnosesResult.data || [];
  const reviews = reviewsResult.data || [];
  const notifications = notificationsResult.data || [];

  const orderIds = orders.map((order) => order.id);
  let payments = [];

  if (orderIds.length > 0) {
    const { data: paymentsData, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('id, order_id, amount, status, paid_at')
      .in('order_id', orderIds);

    if (paymentsError) {
      return res.status(500).json({ message: paymentsError.message });
    }

    payments = paymentsData || [];
  }

  const paidPayments = payments.filter((payment) => payment.status === 'paid');
  const averageRating =
    reviews.length > 0
      ? Number(
          (
            reviews.reduce(
              (total, review) => total + Number(review.overall_rating || 0),
              0
            ) / reviews.length
          ).toFixed(1)
        )
      : null;
  const activeOrderCount = orders.filter((order) =>
    ['submitted', 'accepted', 'traveling', 'arrived', 'in_progress', 'processing'].includes(
      order.status
    )
  ).length;
  const completedOrderCount = orders.filter(
    (order) => order.status === 'completed'
  ).length;
  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;
  const totalSpent = paidPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  res.json({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
    orderCount: orders.length,
    completedOrderCount,
    activeOrderCount,
    addressCount: addresses.length,
    totalSpent,
    totalSpentLabel: formatCurrency(totalSpent),
    averageRating,
    activity: {
      diagnosisCount: diagnoses.length,
      reviewCount: reviews.length,
      totalNotificationCount: notifications.length,
      unreadNotificationCount,
    },
    addresses: addresses.map((address) => ({
      id: address.id,
      label: address.label,
      addressLine: address.address_line,
      city: address.city,
      province: address.province,
      postalCode: address.postal_code,
      isPrimary: Boolean(address.is_primary),
    })),
    recentOrders: orders.slice(0, 5).map((order) => ({
      id: order.id,
      code: order.code,
      status: order.status,
      scheduledAt: order.scheduled_at,
      createdAt: order.created_at,
      paymentMethod: order.payment_method,
      serviceTitle: order.services?.title || null,
      providerName: order.providers?.full_name || null,
      totalEstimateLabel: formatCurrency(order.total_estimate || 0),
      totalFinalLabel: formatCurrency(order.total_final || 0),
    })),
  });
});

module.exports = router;
