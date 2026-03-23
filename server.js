const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const webpush = require('web-push');
const morgan = require('morgan');

const app = express();
const upload = multer({
  limits: {
    files: 3,
    fileSize: 5 * 1024 * 1024
  }
}).array('files');

function uploadFeedback(req, res, next) {
  upload(req, res, err => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'file_too_large' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(413).json({ error: 'too_many_files' });
      }
      return res.status(400).json({ error: 'invalid_upload' });
    }
    return res.status(400).json({ error: 'invalid_upload' });
  });
}

app.use(express.json());
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked'));
  }
}));
app.use(morgan('combined'));

const rateMap = {};
const LIMIT = 3;
const WINDOW = 10 * 60 * 1000;

const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@aliqgroup.kz';
const EMAIL_TO = process.env.EMAIL_TO || 'aliqgroup.kz@gmail.com';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const TAWK_ID = process.env.TAWK_ID || 'YOUR_ID';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const GA_ID = process.env.GA_ID || 'GA_MEASUREMENT_ID';
const CALENDAR_ID = process.env.CALENDAR_ID || 'your_calendar_id';
const NOTIFY_TOKEN = process.env.NOTIFY_TOKEN || '';

function createMailTransport() {
  if (SMTP_HOST) {
    const smtpConfig = {
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE
    };
    if (SMTP_USER && SMTP_PASS) {
      smtpConfig.auth = { user: SMTP_USER, pass: SMTP_PASS };
    }
    return nodemailer.createTransport(smtpConfig);
  }
  return nodemailer.createTransport({ sendmail: true });
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:admin@aliqgroup.kz', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const subscriptions = [];

function isValidSubscription(sub) {
  return !!(
    sub &&
    typeof sub === 'object' &&
    typeof sub.endpoint === 'string' &&
    sub.endpoint.startsWith('https://') &&
    sub.keys &&
    typeof sub.keys.p256dh === 'string' &&
    typeof sub.keys.auth === 'string'
  );
}


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
  if (!isValidSubscription(req.body)) {
    return res.status(400).json({ error: 'invalid_subscription' });
  }
  if (!subscriptions.some(s => s.endpoint === req.body.endpoint)) {
    subscriptions.push(req.body);
  }
  res.json({ ok: true });
});

app.post('/notify', async (req, res) => {
  if (!NOTIFY_TOKEN || req.get('x-notify-token') !== NOTIFY_TOKEN) {
    return res.status(403).json({ error: 'forbidden' });
  }
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(400).json({ error: 'push_not_configured' });
  }
  const payload = JSON.stringify({ title: req.body.title, body: req.body.body });
  const results = await Promise.all(
    subscriptions.map(s => webpush.sendNotification(s, payload).catch(() => null))
  );
  res.json({ sent: results.length });
});

app.post('/api/feedback', uploadFeedback, async (req, res) => {
  const {
    name,
    phone,
    email,
    service,
    question,
    messenger,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    gclid,
    fbclid,
    landing_path,
    referrer_url,
    first_seen_at
  } = req.body;
  if (!name || !phone || !question) return res.status(400).json({ error: 'missing' });

  const attributionLines = [
    ['utm_source', utm_source],
    ['utm_medium', utm_medium],
    ['utm_campaign', utm_campaign],
    ['utm_content', utm_content],
    ['utm_term', utm_term],
    ['gclid', gclid],
    ['fbclid', fbclid],
    ['landing_path', landing_path],
    ['referrer_url', referrer_url],
    ['first_seen_at', first_seen_at]
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`);

  const text = [
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Email: ${email || ''}`,
    `Услуга: ${service || ''}`,
    `Вопрос: ${question}`,
    `Мессенджер: ${messenger}`,
    attributionLines.length ? `\nАтрибуция:\n${attributionLines.join('\n')}` : ''
  ].join('\n');
  try {
    const transporter = createMailTransport();
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
