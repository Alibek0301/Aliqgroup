const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const app = express();
const upload = multer();
app.use(express.json());
app.use(cors());

const rateMap = {};
const LIMIT = 3;
const WINDOW = 10 * 60 * 1000;

const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@aliqgroup.kz';
const EMAIL_TO = process.env.EMAIL_TO || 'aliguard.kz@gmail.com';
const TAWK_ID = process.env.TAWK_ID || 'YOUR_ID';


app.use('/api/feedback', (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!rateMap[ip]) rateMap[ip] = [];
  rateMap[ip] = rateMap[ip].filter(t => now - t < WINDOW);
  if (rateMap[ip].length >= LIMIT) return res.status(429).json({ error: 'rate_limit' });
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
  res.type('application/javascript').send(`window.TAWK_ID=${JSON.stringify(TAWK_ID)};`);
});

app.post('/api/feedback', upload.single('file'), async (req, res) => {
  const { name, phone, email, service, question, messenger } = req.body;
  const file = req.file;
  if (!name || !phone || !question) return res.status(400).json({error: 'missing'});
  const text = `Имя: ${name}\nТелефон: ${phone}\nEmail: ${email || ''}\nУслуга: ${service || ''}\nВопрос: ${question}\nМессенджер: ${messenger}`;
  try {
    const transporter = nodemailer.createTransport({ sendmail: true });
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: 'Заявка с сайта',
      text,
      attachments: file ? [{ filename: file.originalname, content: file.buffer }] : []
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

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log('Server listening on', PORT));
}

module.exports = app;
