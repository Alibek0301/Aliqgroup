    // Языки
    const langs = {
      ru: {
        siteTitle: "AliQ Group",
        slogan: "IT-решения для бизнеса и безопасности.<br>Компетентность. Скорость. Надёжность.",
        heroDesc: "Молодая ИТ-компания. Запускаем цифровые продукты, интегрируем сервисы, делаем ваш бизнес защищённым и современным.<br><b>Первый проект: AliGuard (MVP, платформа для охранных агентств).</b>",
        requestBtn: "Оставить заявку",
        servicesTitle: "Наши услуги",
        services: [
          "Разработка MVP (цифровых продуктов)",
          "Интеграция сервисов (CRM, облако, чаты, API)",
          "Создание современных сайтов и лендингов",
          "IT-консалтинг и аудит",
          "Автоматизация бизнес-процессов",
          "Информбезопасность и защита данных"
        ],
        projectsTitle: "Проекты и опыт",
        projects: [
          "AliGuard — цифровая платформа для поиска охранных услуг (MVP)",
          "Чат-боты для бизнеса (Telegram, WhatsApp)",
          "Внедрение облачных сервисов и автоматизация",
          "Сайты для учебных центров, сервисных компаний"
        ],
        advTitle: "Почему выбирают нас?",
        adv: [
          "Комплексный подход: от идеи до запуска",
          "Гибкость, работа без бюрократии",
          "Глубокое понимание ИТ и безопасности",
          "Прозрачная коммуникация и честность",
          "Реальный опыт работы в Казахстане и СНГ"
        ],
        founderTitle: "Руководитель: Алибек Уразов",
        founderDesc: "Офицер запаса, инженер. 20+ лет в безопасности и ИТ. Эксперт в вопросах физической и цифровой защиты.",
        contactsTitle: "Контакты",
        phoneLabel: "Телефон (WhatsApp):",
        namePlaceholder: "Ваше имя",
        questionPlaceholder: "Ваш вопрос",
        messengerLabel: "Отправить через:",
        submitBtn: "Отправить",
        formSuccess: "Спасибо! Ваша заявка отправлена.",
        qrText: "Сканируйте QR код или скопируйте ссылку на сайт:",
        langBtn: "Қазақша"
      },
      kz: {
        siteTitle: "AliQ Group",
        slogan: "Бизнес пен қауіпсіздікке арналған IT-шешімдер.<br>Кәсібилік. Жылдамдық. Сенімділік.",
        heroDesc: "Жас IT-компания. Цифрлық өнімдерді іске қосамыз, сервистерді біріктіреміз, бизнесіңізді заманауи әрі қорғалған етеміз.<br><b>Бірінші жоба: AliGuard (MVP, күзет агенттіктеріне арналған платформа).</b>",
        requestBtn: "Өтініш қалдыру",
        servicesTitle: "Қызметтеріміз",
        services: [
          "MVP әзірлеу (цифрлық өнімдер)",
          "Сервистерді біріктіру (CRM, бұлт, чаттар, API)",
          "Заманауи сайттар мен лендингтер жасау",
          "IT-кеңес және аудит",
          "Бизнес-процестерді автоматтандыру",
          "Информқауіпсіздік және деректерді қорғау"
        ],
        projectsTitle: "Жобалар мен тәжірибе",
        projects: [
          "AliGuard — күзет агенттіктеріне арналған цифрлық платформа (MVP)",
          "Бизнеске арналған чат-боттар (Telegram, WhatsApp)",
          "Бұлттық сервистерді енгізу және автоматтандыру",
          "Оқу орталықтарына, сервис компанияларға сайттар"
        ],
        advTitle: "Бізді не үшін таңдайды?",
        adv: [
          "Идеядан іске қосуға дейін толық цикл",
          "Икемділік, бюрократиясыз жұмыс",
          "IT және қауіпсіздікті терең түсіну",
          "Ашық және әділ коммуникация",
          "Қазақстан мен ТМД-дағы нақты тәжірибе"
        ],
        founderTitle: "Басшы: Әлібек Уразов",
        founderDesc: "Запастағы офицер, инженер. 20+ жыл қауіпсіздік және IT саласында. Физикалық және цифрлық қорғаныс жөніндегі сарапшы.",
        contactsTitle: "Байланыс",
        phoneLabel: "Телефон (WhatsApp):",
        namePlaceholder: "Атыңыз",
        questionPlaceholder: "Сұрағыңыз",
        messengerLabel: "Қай мессенджер арқылы жіберу:",
        submitBtn: "Жіберу",
        formSuccess: "Рақмет! Өтінішіңіз жіберілді.",
        qrText: "QR кодын сканерлеңіз немесе сілтемені көшіріңіз:",
        langBtn: "Русский"
      }
    };
    let curLang = 'ru';
    function setLang(lang) {
      curLang = lang;
      const l = langs[lang];
      document.getElementById('siteTitle').innerText = l.siteTitle;
      document.getElementById('slogan').innerHTML = l.slogan;
      document.getElementById('heroDesc').innerHTML = l.heroDesc;
      document.querySelectorAll('#requestBtn, #requestBtn2').forEach(btn => btn.innerText = l.requestBtn);
      document.getElementById('servicesTitle').innerText = l.servicesTitle;
      document.getElementById('servicesList').innerHTML = l.services.map(s=>`<li>${s}</li>`).join('');
      document.getElementById('projectsTitle').innerText = l.projectsTitle;
      document.getElementById('projectsList').innerHTML = l.projects.map(p=>`<li>${p}</li>`).join('');
      document.getElementById('advTitle').innerText = l.advTitle;
      document.getElementById('advList').innerHTML = l.adv.map(a=>`<li>${a}</li>`).join('');
      document.getElementById('founderTitle').innerText = l.founderTitle;
      document.getElementById('founderDesc').innerText = l.founderDesc;
      document.getElementById('contactsTitle').innerText = l.contactsTitle;
      document.getElementById('phoneLabel').innerText = l.phoneLabel;
      document.getElementById('nameInput').placeholder = l.namePlaceholder;
      document.getElementById('questionInput').placeholder = l.questionPlaceholder;
      document.getElementById('messengerLabel').innerText = l.messengerLabel;
      document.getElementById('submitBtn').innerText = l.submitBtn;
      document.getElementById('langBtn').innerText = l.langBtn;
      document.getElementById('formMsg').innerText = l.formSuccess;
      document.getElementById('qrText').innerText = l.qrText;
    }
    document.getElementById('langBtn').onclick = function() {
      setLang(curLang==='ru' ? 'kz':'ru');
    };
  document.getElementById('year').innerText = new Date().getFullYear();
  document.getElementById('qrCode').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' + encodeURIComponent(window.location.href);
  document.getElementById('siteLink').value = window.location.href;

    // Модалка
    function openModal() {
      document.getElementById('modalBg').style.display = 'flex';
      document.getElementById('formMsg').style.display = 'none';
      document.querySelector('#modalBg form').reset();
    }
    function closeModal() {
      document.getElementById('modalBg').style.display = 'none';
    }
    window.openModal = openModal; window.closeModal = closeModal;

    // Отправка формы в выбранный мессенджер
    async function sendForm(e) {
      e.preventDefault();
      const name = document.getElementById('nameInput').value;
      const question = document.getElementById('questionInput').value;
      const messenger = document.getElementById('messengerSelect').value;
      const text = `Имя: ${name}\nВопрос: ${question}`;
      let url = '';
      if (messenger === 'telegram') {
        url = 'https://t.me/aliqgroup?text=' + encodeURIComponent(text);
      } else {
        url = 'https://wa.me/77052546613?text=' + encodeURIComponent(text);
      }
      window.open(url, '_blank');
      const msg = document.getElementById('formMsg');
      msg.style.display = 'block';
      msg.style.color = '#37ff86';
      document.querySelector('#modalBg form').reset();
      setTimeout(closeModal, 1800);
    }
    window.sendForm = sendForm;

    // Первичная установка языка
    setLang(curLang);
