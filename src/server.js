require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const ordersRoutes = require('./routes/orders');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const miscRoutes = require('./routes/misc');

const PORT = Number(process.env.PORT || 3000);
const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Health check ──
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', database: 'supabase', timestamp: new Date().toISOString() });
});

app.get('/api/meta', (_req, res) => {
  res.json({ app: 'SmartEco Service Backend', version: '2.0.0', database: 'supabase' });
});

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api', servicesRoutes);
app.use('/api', ordersRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', miscRoutes);

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Error handler ──
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', detail: err.message });
});

// ── Start ──
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SmartEco backend running on http://localhost:${PORT}`);
    console.log('Database: Supabase PostgreSQL');
  });
}

module.exports = { app };
