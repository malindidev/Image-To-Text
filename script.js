const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const extractBtn = document.getElementById('extractBtn');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');
const resultContainer = document.querySelector('.result');

const cameraBtn = document.getElementById('cameraBtn');
const cameraModal = document.getElementById('cameraModal');
const cameraVideo = document.getElementById('cameraVideo');
const captureBtn = document.getElementById('captureBtn');
const closeCamera = document.getElementById('closeCamera');

const toastContainer = document.getElementById('toastContainer');

let imageSrc = '';
let stream;

function showToast(message, type = 'error') {
  const toast = document.createElement('div');
  toast.classList.add('toast');
  if (type === 'success') toast.style.background = '#00bfa6';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  imageSrc = URL.createObjectURL(file);
  preview.src = imageSrc;
});

cameraBtn.addEventListener('click', async () => {
  cameraModal.setAttribute('aria-hidden', 'false');
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraVideo.srcObject = stream;
  } catch {
    showToast('Camera access denied or not available.');
    cameraModal.setAttribute('aria-hidden', 'true');
  }
});

captureBtn.addEventListener('click', () => {
  if (!stream) {
    showToast('No camera stream available.');
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;
  canvas.getContext('2d').drawImage(cameraVideo, 0, 0);
  imageSrc = canvas.toDataURL('image/png');
  preview.src = imageSrc;
  stopCamera();
});

closeCamera.addEventListener('click', stopCamera);

function stopCamera() {
  cameraModal.setAttribute('aria-hidden', 'true');
  if (stream) stream.getTracks().forEach(track => track.stop());
}

extractBtn.addEventListener('click', () => {
  if (!imageSrc) {
    showToast('Please select or capture an image first.');
    return;
  }
  resultContainer.setAttribute('aria-hidden', 'true');
  resultText.textContent = 'Processing...';
  Tesseract.recognize(imageSrc, 'eng', { logger: m => console.log(m) })
    .then(({ data: { text } }) => {
      resultText.textContent = text.trim() || 'No text detected.';
      resultContainer.setAttribute('aria-hidden', 'false');
    })
    .catch(() => {
      showToast('Error extracting text. Try another image.');
    });
});

copyBtn.addEventListener('click', () => {
  if (!resultText.textContent.trim()) {
    showToast('Nothing to copy.');
    return;
  }
  navigator.clipboard.writeText(resultText.textContent)
    .then(() => showToast('Text copied!', 'success'))
    .catch(() => showToast('Failed to copy.'));
});
