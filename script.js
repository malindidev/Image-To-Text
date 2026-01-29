const logoImg = document.querySelector('.logo');
const logoCount = 7;
logoImg.src = `cat${Math.floor(Math.random() * logoCount) + 1}.gif`;

const fileInput = document.getElementById('fileInput');
const extractBtn = document.getElementById('extractBtn');
const resultText = document.getElementById('resultText');
const resultContainer = document.querySelector('.result');
const copyBtn = document.getElementById('copyBtn');

const cameraBtn = document.getElementById('cameraBtn');
const cameraModal = document.getElementById('cameraModal');
const cameraVideo = document.getElementById('cameraVideo');
const captureBtn = document.getElementById('captureBtn');
const closeCamera = document.getElementById('closeCamera');

const toastContainer = document.getElementById('toastContainer');
const fileBtn = document.querySelector('.file-btn');

let imageSrc = '';
let stream;

const previewCard = document.createElement('div');
previewCard.className = 'preview-card';
previewCard.style.display = 'none';

const previewImg = document.createElement('img');
previewCard.appendChild(previewImg);

document.querySelector('.card').insertBefore(
  previewCard,
  document.querySelector('.result-card')
);

function showToast(msg, type = 'error') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'success') toast.classList.add('success');
  toast.textContent = msg;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

fileBtn.addEventListener('click', () => fileInput.click());

function setImage(src) {
  imageSrc = src;
  previewImg.src = src;
  previewCard.style.display = 'block';
  resultContainer.setAttribute('aria-hidden', 'true');
  resultText.textContent = '';
}

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) {
    showToast('Invalid file type.');
    return;
  }
  setImage(URL.createObjectURL(file));
});

document.addEventListener('paste', e => {
  const items = (e.clipboardData || e.originalEvent.clipboardData)?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.includes('image')) {
      const blob = item.getAsFile();
      setImage(URL.createObjectURL(blob));
      e.preventDefault();
      break;
    }
  }
});

cameraBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraVideo.srcObject = stream;
    cameraModal.classList.add('show');
  } catch {
    showToast('Camera access denied.');
  }
});

captureBtn.addEventListener('click', () => {
  if (!stream) return;
  const canvas = document.createElement('canvas');
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;
  canvas.getContext('2d').drawImage(cameraVideo, 0, 0);
  setImage(canvas.toDataURL('image/png'));
  stopCamera();
});

closeCamera.addEventListener('click', stopCamera);

function stopCamera() {
  cameraModal.classList.remove('show');
  if (stream) stream.getTracks().forEach(t => t.stop());
}

extractBtn.addEventListener('click', async () => {
  if (!imageSrc) {
    showToast('Please select or capture an image.');
    return;
  }
  extractBtn.disabled = true;
  resultText.textContent = 'Processing...';
  try {
    const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng');
    resultText.textContent = text.trim() || 'No text detected.';
    resultContainer.setAttribute('aria-hidden', 'false');
  } catch {
    showToast('Failed to extract text.');
  }
  extractBtn.disabled = false;
});

copyBtn.addEventListener('click', () => {
  const text = resultText.textContent.trim();
  if (!text) {
    showToast('Nothing to copy.');
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => showToast('Text copied!', 'success'))
    .catch(() => showToast('Failed to copy.'));
});
