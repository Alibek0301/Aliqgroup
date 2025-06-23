const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const webpush = require('web-push');
const morgan = require('morgan');

const app = express();
const upload = multer().array('files');
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

const rateMap = {};
const LIMIT = 3;
const WINDOW = 10 * 60 * 1000;

const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@aliqgroup.kz';
const EMAIL_TO = process.env.EMAIL_TO || 'aliguard.kz@gmail.com';
const TAWK_ID = process.env.TAWK_ID || 'YOUR_ID';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const GA_ID = process.env.GA_ID || 'GA_MEASUREMENT_ID';
const CALENDAR_ID = process.env.CALENDAR_ID || 'your_calendar_id';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:admin@aliqgroup.kz', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const subscriptions = [];


app.use('/api/feedback', (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!rateMap[ip]) rateMap[ip] = [];
  rateMap[ip] = rateMap[ip].filter(t => now - t < WINDOW);
  if (rateMap[ip].length >= LIMIT) {
    console.warn('Rate limit exceeded for', ip);
    if(subscriptions.length) {
      const payload = JSON.stringify({ title: 'AliQ Group', body: 'Превышен лимит отправки заявок' });
      subscriptions.forEach(s => webpush.sendNotification(s, payload).catch(()=>{}));
    }
    return res.status(429).json({ error: 'rate_limit' });
  }
  rateMap[ip].push(now);
  next();
});

setInterval(() => {
  const now = Date.now();
  for (const ip in rateMap) {
    rateMap[ip] = rateMap[ip].filter(t => now - t < WINDOW);
    if (rateMap[ip].length === 0) delete rateMap[ip];
  }
}, WINDOW);

app.get('/config.js', (req, res) => {
  res.type('application/javascript').send(
    `window.TAWK_ID=${JSON.stringify(TAWK_ID)};\n`+
    `window.GA_ID=${JSON.stringify(GA_ID)};\n`+
    `window.CALENDAR_ID=${JSON.stringify(CALENDAR_ID)};`);
});

app.get('/sitemap.xml', (req, res) => {
  const urls = [
    '',
    'services.html',
    'schedule.html',
    'faq.html',
    'privacy.html',
    'services/mvp.html',
    'services/integration.html',
    'services/websites.html',
    'services/consulting.html',
    'services/automation.html',
    'services/security.html'
  ];
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(u => `  <url><loc>https://aliqgroup.kz/${u}</loc></url>`), '</urlset>'].join('\n');
  res.type('application/xml').send(xml);
});

app.get('/vapidPublicKey', (req, res) => {
  res.json({ key: VAPID_PUBLIC_KEY });
});

app.post('/subscribe', express.json(), (req, res) => {
  subscriptions.push(req.body);
  res.json({ ok: true });
});

app.post('/notify', async (req, res) => {
  const payload = JSON.stringify({ title: req.body.title, body: req.body.body });
  const results = await Promise.all(subscriptions.map(s => webpush.sendNotification(s, payload).catch(()=>null)));
  res.json({ sent: results.length });
});

app.post('/api/feedback', upload, async (req, res) => {
  const { name, phone, email, service, question, messenger } = req.body;
  if (!name || !phone || !question) return res.status(400).json({ error: 'missing' });
  const text = `Имя: ${name}\nТелефон: ${phone}\nEmail: ${email || ''}\nУслуга: ${service || ''}\nВопрос: ${question}\nМессенджер: ${messenger}`;
  try {
    const transporter = nodemailer.createTransport({ sendmail: true });
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: 'Заявка с сайта',
      text,
      attachments: (req.files || []).map(f => ({ filename: f.originalname, content: f.buffer }))
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'fail' });
  }
});

// Serve main page explicitly to avoid README being shown by hosting platforms
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));
// Serve mobile assets (e.g., logo) without moving files
app.use('/mobile', express.static(path.join(__dirname, 'mobile')));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log('Server listening on', PORT));
}

module.exports = app;
