const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

app.post('/api/feedback', async (req, res) => {
  const { name, question, messenger } = req.body;
  if (!name || !question) return res.status(400).json({error: 'missing'});
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
