const uploadInput = document.getElementById('uploadInput');
const userPhoto = document.getElementById('userPhoto');
const scaleDisplay = document.getElementById('scaleDisplay');

let uploadedImageSrc = "";
let scale = 1;
let posX = 0;
let posY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

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

function updateTransform() {
  userPhoto.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  scaleDisplay.textContent = Math.round(scale * 100) + '%';
}

function resetTransform() {
  scale = 1;
  posX = 0;
  posY = 0;
  updateTransform();
}

function zoomIn() {
  scale = Math.min(Math.round((scale + 0.01) * 100) / 100, 3);
  updateTransform();
}

function zoomOut() {
  scale = Math.max(Math.round((scale - 0.01) * 100) / 100, 0.3);
  updateTransform();
}

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
    ctx.translate(canvas.width / 2 + posX, canvas.height / 2 + posY);
    ctx.scale(scale, scale);
    ctx.drawImage(photo, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.restore();

    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = "framed-image.jpg";
    link.href = canvas.toDataURL("image/jpeg");
    link.click();
  } catch (err) {
    alert("មានបញ្ហាក្នុងការទាញយក។ សូមពិនិត្យ Frame.png");
    console.error(err);
  }
}
