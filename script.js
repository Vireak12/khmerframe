// ─── 1. Translations dictionary ───────────────────────────────────────────
const translations = {
  km: {
    appTitle: '📸 កម្មវិធីដាក់ស៊ុមរូបភាព',
    chooseFile: 'ជ្រើសឯកសារ…',
    scaleLabel: 'កម្រិតពង្រីក៖',
    zoomIn: 'ពង្រីក',
    zoomOut: 'បង្រួម',
    reset: 'កំណត់ឡើងវិញ',
    download: 'ទាញយករូបភាព',
    contactTitle: '📣 ទំនាក់ទំនងមកកាន់យើង',
    contactText: 'សូមចូលទៅកាន់បណ្តាញសង្គម...',
    facebook: 'Facebook',
    telegram: 'Telegram',
    tiktok: 'TikTok'
  },
  en: {
    appTitle: '📸 Frame Image Generator',
    chooseFile: 'Choose File…',
    scaleLabel: 'Scale:',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    reset: 'Reset',
    download: 'Download Image',
    contactTitle: '📣 Contact Us',
    contactText: 'Find us on social media:',
    facebook: 'Facebook',
    telegram: 'Telegram',
    tiktok: 'TikTok'
  },
  ch: {
    appTitle:     '📸 框架圖像生成器',
    scaleLabel:   '縮放：',
    zoomIn:       '放大',
    zoomOut:      '縮小',
    reset:        '重置',
    download:     '下載圖像',
    contactTitle: '📣 聯繫我們',
    contactText:  '在社交媒體上聯繫我們：',
    facebook:     'Facebook',
    telegram:     'Telegram',
    tiktok:       'TikTok'
  }
};

// ─── 2. Apply translations ────────────────────────────────────────────────
function setLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = translations[lang][key] || el.textContent;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', translations[lang][key] || '');
  });
  document.querySelectorAll('.lang-switch button')
    .forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
}

// ─── 3. Core image‐transform logic ───────────────────────────────────────
let uploadedImageSrc = "";
let scale = 1, posX = 0, posY = 0;
let isDragging = false, dragStartX = 0, dragStartY = 0;
let userPhoto, scaleDisplay, uploadInput;

function updateTransform() {
  userPhoto.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  scaleDisplay.textContent = Math.round(scale * 100) + '%';
}
function resetTransform() {
  scale = 1; posX = 0; posY = 0; updateTransform();
}
function zoomIn() {
  scale = Math.min(Math.round((scale + 0.01) * 100) / 100, 3);
  updateTransform();
}
function zoomOut() {
  scale = Math.max(Math.round((scale - 0.01) * 100) / 100, 0.3);
  updateTransform();
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
async function downloadImage() {
  if (!uploadedImageSrc) {
    alert("សូមជ្រើសរើសរូបភាពជាមុនសិន។");
    return;
  }
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  try {
    const [photo, frame] = await Promise.all([
      loadImage(uploadedImageSrc),
      loadImage("Frame.png")
    ]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width/2 + posX, canvas.height/2 + posY);
    ctx.scale(scale, scale);
    ctx.drawImage(photo, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
    ctx.restore();

    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = "framed-image.jpg";
    link.href = canvas.toDataURL("image/jpg");
    link.click();
  } catch (err) {
    alert("មានបញ្ហាក្នុងការទាញយក។ សូមពិនិត្យ Frame.png");
    console.error(err);
  }
}

// ─── 4. Initialize on DOM ready ─────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // — Language switcher
  const defaultLang = localStorage.getItem('lang') || 'km';
  setLanguage(defaultLang);
  document.querySelectorAll('.lang-switch button')
    .forEach(btn => btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      localStorage.setItem('lang', lang);
      setLanguage(lang);
    }));

  // — Welcome alert (once)
  if (!localStorage.getItem("welcomed")) {
    alert("👋 សូមស្វាគមន៍មកកាន់គេហទំព័រ!\nWelcome to the Frame Image Generator!");
    localStorage.setItem("welcomed", "yes");
  }

  // — Grab DOM nodes
  uploadInput   = document.getElementById('uploadInput');
  userPhoto     = document.getElementById('userPhoto');
  scaleDisplay  = document.getElementById('scaleDisplay');

  // — File‐upload & reset
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadedImageSrc = evt.target.result;
        userPhoto.src = uploadedImageSrc;
        userPhoto.style.display = 'block';
        resetTransform();
      };
      reader.readAsDataURL(file);
    }
  });

  // — Drag to reposition
  userPhoto.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX - posX;
    dragStartY = e.clientY - posY;
    userPhoto.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      posX = e.clientX - dragStartX;
      posY = e.clientY - dragStartY;
      updateTransform();
    }
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    userPhoto.style.cursor = 'grab';
  });
});
