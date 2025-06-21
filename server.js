const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

const rateMap = {};
const LIMIT = 3;
const WINDOW = 10 * 60 * 1000;

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

app.use('/api/feedback', (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!rateMap[ip]) rateMap[ip] = [];
  rateMap[ip] = rateMap[ip].filter(t => now - t < WINDOW);
  if (rateMap[ip].length >= LIMIT) return res.status(429).json({ error: 'rate_limit' });
  rateMap[ip].push(now);
  next();
});

app.post('/api/feedback', async (req, res) => {
  const { name, question, messenger, token } = req.body;
  if (!name || !question) return res.status(400).json({error: 'missing'});
  if (RECAPTCHA_SECRET) {
    try {
      const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${RECAPTCHA_SECRET}&response=${token}`
      });
      const data = await r.json();
      if (!data.success) return res.status(400).json({ error: 'captcha' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'captcha' });
    }
  }
  const text = `Имя: ${name}\nВопрос: ${question}\nМессенджер: ${messenger}`;
  try {
    const transporter = nodemailer.createTransport({ sendmail: true });
    await transporter.sendMail({
      from: 'no-reply@aliqgroup.kz',
      to: 'aliguard.kz@gmail.com',
      subject: 'Заявка с сайта',
      text
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'fail' });
  }
});

app.use(express.static('.'));

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log('Server listening on', PORT));
}

module.exports = app;
