/**
 * SmartEco Service — Seed Script
 * Usage:
 *   node --dns-result-order=ipv4first src/db/seed.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { supabaseAdmin, supabasePublic } = require('../config/supabase');

const seedData = require('./seedData');

// ── Helpers ──
async function upsert(table, data, conflict) {
  const { data: row, error } = await supabaseAdmin.from(table).upsert(data, { onConflict: conflict, ignoreDuplicates: true }).select().single();
  if (error && error.code !== '23505') { console.error(`  ❌ ${table}:`, error.message); return null; }
  return row;
}
async function insert(table, data) {
  const { data: row, error } = await supabaseAdmin.from(table).insert(data).select().single();
  if (error) { if (error.code === '23505') return null; console.error(`  ❌ ${table}:`, error.message); return null; }
  return row;
}
async function insertMany(table, rows) {
  const { data, error } = await supabaseAdmin.from(table).insert(rows).select();
  if (error) { if (error.code === '23505') return []; console.error(`  ❌ ${table}:`, error.message); return []; }
  return data || [];
}

// Use signUp (works with anon key) instead of admin.createUser (needs service_role secret)
async function createAuthUser(email, password, fullName, role) {
  // Try signUp first
  const { data, error } = await supabasePublic.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) {
    if (error.message.includes('already registered')) {
      // Try to sign in to get user id
      const { data: loginData } = await supabasePublic.auth.signInWithPassword({ email, password });
      if (loginData?.user) {
        console.log(`  ↳ ${email} sudah ada, login OK`);
        return loginData.user.id;
      }
      console.log(`  ↳ ${email} sudah terdaftar`);
      return null;
    }
    console.error(`  ❌ auth ${email}:`, error.message);
    return null;
  }
  console.log(`  ✅ ${email} created`);
  return data.user?.id || null;
}

// ── Main seed ──
async function seed() {
  console.log('\n🌱 Seeding SmartEco database …\n');

  // Check if already seeded
  const { data: existCats, error: catErr } = await supabaseAdmin.from('service_categories').select('id').limit(1);
  if (catErr) {
    console.error('❌ Tabel belum dibuat! Jalankan migration.sql di Supabase SQL Editor dulu.');
    console.error('   Error:', catErr.message);
    process.exit(1);
  }
  if (existCats?.length > 0) { console.log('ℹ️  Database sudah ada datanya. Skip seed.'); return; }

  const D = seedData;

  // 1. Auth users — admin@gmail.com / admin123
  console.log('👤 Membuat auth users …');
  const adminUid = await createAuthUser('admin@gmail.com', 'admin123', 'Admin SmartEco', 'admin');
  const userUid = await createAuthUser('user@gmail.com', 'user123', 'Nabila Putri Rahma', 'user');

  // 2. Insert users to our users table
  console.log('👤 Insert users table …');
  const adminRow = await upsert('users', {
    auth_uid: adminUid, full_name: 'Admin SmartEco', email: 'admin@gmail.com',
    phone: '+62 811 0000 0000', role: 'admin', status: 'active',
  }, 'email');
  const userRow = await upsert('users', {
    auth_uid: userUid, full_name: 'Nabila Putri Rahma', email: 'user@gmail.com',
    phone: '+62 812 3456 7890', role: 'user', status: 'active',
  }, 'email');
  const userId = userRow?.id;

  // 3. Address
  console.log('📍 Address …');
  const addrRow = await insert('addresses', { user_id: userId, ...D.orderSeed.address });

  // 4. Categories
  console.log('📂 Categories …');
  const catIds = {};
  for (const c of D.categories) {
    const r = await upsert('service_categories', c, 'slug');
    if (r) catIds[c.slug] = r.id;
  }

  // 5. Services
  console.log('🔧 Services …');
  const svcIds = {};
  for (const s of D.services) {
    const { category_slug, benefits, includes, process, reviews, ...rest } = s;
    const r = await upsert('services', {
      category_id: catIds[category_slug],
      benefits_json: benefits, includes_json: includes,
      process_json: process, reviews_json: reviews, ...rest,
    }, 'slug');
    if (r) svcIds[s.slug] = r.id;
  }

  // 6. Providers
  console.log('👷 Providers …');
  const provIds = {};
  for (const [slug, provs] of Object.entries(D.providersByService)) {
    for (const p of provs) {
      const key = `${p.company}::${p.name}`;
      if (!provIds[key]) {
        const { name, tags, is_recommended, ...rest } = p;
        const r = await insert('providers', { full_name: name, tags_json: tags, is_recommended, ...rest });
        if (r) provIds[key] = r.id;
      }
      if (provIds[key] && svcIds[slug]) {
        await insert('provider_services', { provider_id: provIds[key], service_id: svcIds[slug] });
      }
    }
  }

  // 7. Diagnosis + Order
  console.log('📋 Order …');
  const diagRow = await insert('diagnoses', {
    user_id: userId, service_id: svcIds[D.orderSeed.order.service_slug],
    ...D.orderSeed.diagnosis,
  });
  const provKey = `${D.orderSeed.order.provider_company}::${D.orderSeed.order.provider_name}`;
  const { service_slug, provider_company, provider_name, ...orderRest } = D.orderSeed.order;
  const orderRow = await insert('orders', {
    user_id: userId, service_id: svcIds[service_slug],
    provider_id: provIds[provKey], address_id: addrRow?.id,
    diagnosis_id: diagRow?.id, ...orderRest,
  });
  const orderId = orderRow?.id;

  if (orderId) {
    await insertMany('order_tracking_events', D.orderSeed.tracking.map((t, i) => ({ order_id: orderId, ...t, sort_order: i + 1 })));
    await insert('payments', { order_id: orderId, ...D.orderSeed.payment });
    await insert('reviews', { order_id: orderId, service_id: svcIds[service_slug], provider_id: provIds[provKey], user_id: userId, ...D.orderSeed.review });
  }

  // 8. Misc data
  console.log('📝 Misc data …');
  for (const p of D.partnerApplications) {
    const { documents, ...rest } = p;
    await insert('partner_applications', { documents_json: documents, ...rest });
  }
  for (const c of D.complaints) await insert('complaints', c);
  if (userId) for (const n of D.notifications) await insert('notifications', { user_id: userId, ...n });
  await insertMany('education_contents', D.educationContents);
  for (const pm of D.paymentMethods) await upsert('payment_methods', pm, 'code');

  // 9. Chat
  console.log('💬 Chat …');
  const threadIds = {};
  for (const t of D.chatSeed.threads) {
    const r = await insert('chat_threads', t);
    if (r) threadIds[t.title] = r.id;
  }
  for (const m of D.chatSeed.messages) {
    const tid = threadIds[m.thread_title];
    if (tid) {
      const { thread_title, ...rest } = m;
      await insert('chat_messages', { thread_id: tid, ...rest });
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Akun login:');
  console.log('   Admin: admin@gmail.com / admin123');
  console.log('   User:  user@gmail.com / user123\n');
}

async function main() {
  try {
    await seed();
  } catch (err) {
    console.error('💥 Seed failed:', err.message);
    process.exit(1);
  }
}
main();
