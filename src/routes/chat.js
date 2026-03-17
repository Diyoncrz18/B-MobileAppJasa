const { Router } = require('express');
const { supabaseAdmin } = require('../config/supabase');

const router = Router();

// GET /api/chat/threads
router.get('/threads', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('chat_threads').select('*').order('pinned', { ascending: false }).order('id');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data.map(r => ({ id: r.id, title: r.title, label: r.label, description: r.description, time: r.time_label, unreadCount: r.unread_count, pinned: r.pinned })));
});

// GET /api/chat/threads/:id/messages
router.get('/threads/:id/messages', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('chat_messages').select('id, sender_role, body, sent_at').eq('thread_id', Number(req.params.id)).order('id');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data.map(r => ({ id: r.id, senderRole: r.sender_role, body: r.body, sentAt: r.sent_at })));
});

// POST /api/chat/threads/:id/messages
router.post('/threads/:id/messages', async (req, res) => {
  const threadId = Number(req.params.id);
  const { data: thread } = await supabaseAdmin.from('chat_threads').select('id').eq('id', threadId).single();
  if (!thread) return res.status(404).json({ message: 'Chat thread not found' });

  const { senderRole = 'user', body } = req.body || {};
  if (!body) return res.status(400).json({ message: 'body is required' });

  const sentAt = new Date().toISOString();
  const { data: row, error } = await supabaseAdmin.from('chat_messages').insert({ thread_id: threadId, sender_role: senderRole, body, sent_at: sentAt }).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json({ id: row.id, threadId, senderRole, body, sentAt });
});

module.exports = router;
