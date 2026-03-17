const { Router } = require('express');
const { supabaseAdmin } = require('../config/supabase');

const router = Router();

// GET /api/service-categories
router.get('/service-categories', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('service_categories').select('*').order('id');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data.map(r => ({ id: r.id, slug: r.slug, title: r.title, description: r.description, icon: r.icon, ecoScore: r.eco_score, tone: r.tone, priceLabel: r.price_label })));
});

// GET /api/services
router.get('/services', async (req, res) => {
  const { slug, category } = req.query;
  let query = supabaseAdmin.from('services').select('*, service_categories!inner(slug, title, icon, eco_score, tone, price_label)').order('id');
  if (category) query = query.eq('service_categories.slug', category);
  if (slug) query = query.eq('slug', slug);
  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json(data.map(mapService));
});

// GET /api/services/:slug
router.get('/services/:slug', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('services').select('*, service_categories!inner(slug, title, icon, eco_score, tone, price_label)').eq('slug', req.params.slug).single();
  if (error || !data) return res.status(404).json({ message: 'Service not found' });

  // Get providers
  const { data: links } = await supabaseAdmin.from('provider_services').select('provider_id, providers(*)').eq('service_id', data.id);
  const providers = (links || []).map(l => mapProvider(l.providers)).sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));

  res.json({ ...mapService(data), providers });
});

// GET /api/services/:slug/providers
router.get('/services/:slug/providers', async (req, res) => {
  const { data: svc } = await supabaseAdmin.from('services').select('id').eq('slug', req.params.slug).single();
  if (!svc) return res.status(404).json({ message: 'Service not found' });

  const { data: links } = await supabaseAdmin.from('provider_services').select('provider_id, providers(*)').eq('service_id', svc.id);
  const providers = (links || []).map(l => mapProvider(l.providers)).sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
  res.json(providers);
});

function mapService(row) {
  const cat = row.service_categories;
  return {
    id: row.id, slug: row.slug, title: row.title, description: row.description, about: row.about,
    duration: row.duration, price: row.price, ecoScore: row.eco_score, guarantee: row.guarantee,
    coverage: row.coverage, response: row.response, jobs: row.jobs, rating: row.rating,
    benefits: row.benefits_json || [], includes: row.includes_json || [],
    process: row.process_json || [], reviews: row.reviews_json || [],
    category: cat ? { slug: cat.slug, title: cat.title, icon: cat.icon, ecoScore: cat.eco_score, tone: cat.tone, priceLabel: cat.price_label } : null,
  };
}

function mapProvider(p) {
  if (!p) return null;
  return {
    id: p.id, name: p.full_name, company: p.company, address: p.address,
    distance: p.distance, eta: p.eta, response: p.response, jobs: p.jobs,
    rating: p.rating, price: p.price, availability: p.availability,
    tags: p.tags_json || [], recommended: Boolean(p.is_recommended),
  };
}

module.exports = router;
