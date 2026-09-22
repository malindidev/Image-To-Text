const logoImg = document.querySelector('.logo');
const logoCount = 8;
logoImg.src = `cat${Math.floor(Math.random() * logoCount) + 1}.gif`;

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const previewCard = document.querySelector('.preview-card');
const previewImage = document.getElementById('previewImage');
const clearBtn = document.getElementById('clearBtn');

const extractBtn = document.getElementById('extractBtn');
const resultText = document.getElementById('resultText');
const resultContainer = document.querySelector('.result');
const resultLabel = document.getElementById('resultLabel');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const charCount = document.getElementById('charCount');
const langSelect = document.getElementById('langSelect');

const progress = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const progressLabel = document.getElementById('progressLabel');

const cameraBtn = document.getElementById('cameraBtn');
const cameraModal = document.getElementById('cameraModal');
const cameraVideo = document.getElementById('cameraVideo');
const captureBtn = document.getElementById('captureBtn');
const closeCamera = document.getElementById('closeCamera');

const fileBtn = document.querySelector('.file-btn');
const toastContainer = document.getElementById('toastContainer');

let imageSrc = '';
let stream;

function showToast(msg, type = 'error') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'success') toast.classList.add('success');
  toast.textContent = msg;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

fileBtn.addEventListener('click', () => fileInput.click());

function handleImage(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) return showToast('Invalid file type.');
  if (imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
  imageSrc = URL.createObjectURL(file);
  previewImage.src = imageSrc;
  previewCard.setAttribute('aria-hidden', 'false');
  resultContainer.setAttribute('aria-hidden', 'true');
  resultText.textContent = '';
  updateCharCount();
}

fileInput.addEventListener('change', e => handleImage(e.target.files[0]));

clearBtn.addEventListener('click', () => {
  if (imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
  imageSrc = '';
  previewImage.src = '';
  previewCard.setAttribute('aria-hidden', 'true');
  resultContainer.setAttribute('aria-hidden', 'true');
  resultText.textContent = '';
  fileInput.value = '';
  updateCharCount();
});

document.addEventListener('paste', e => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  if (!items) return;
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      handleImage(blob);
      e.preventDefault();
      return;
    }
  }
});

['dragenter', 'dragover'].forEach(evt => {
  dropzone.addEventListener(evt, e => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach(evt => {
  dropzone.addEventListener(evt, e => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('dragover');
  });
});

dropzone.addEventListener('drop', e => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  handleImage(file);
});

cameraBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraVideo.srcObject = stream;
    cameraModal.classList.add('show');
    cameraModal.setAttribute('aria-hidden', 'false');
  } catch {
    showToast('Camera access denied.');
  }
});

captureBtn.addEventListener('click', () => {
  if (!stream) return showToast('No camera stream.');
  const canvas = document.createElement('canvas');
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;
  canvas.getContext('2d').drawImage(cameraVideo, 0, 0);
  canvas.toBlob(blob => handleImage(blob), 'image/png');
  stopCamera();
});

closeCamera.addEventListener('click', stopCamera);

function stopCamera() {
  cameraModal.classList.remove('show');
  cameraModal.setAttribute('aria-hidden', 'true');
  if (stream) stream.getTracks().forEach(t => t.stop());
}

function updateCharCount() {
  const len = resultText.textContent.length;
  charCount.textContent = `${len} character${len === 1 ? '' : 's'}`;
}

resultText.addEventListener('input', updateCharCount);

function setProgress(pct, label) {
  progress.setAttribute('aria-hidden', 'false');
  progressBar.style.width = `${pct}%`;
  progressLabel.textContent = label || `${pct}%`;
}

function hideProgress() {
  progress.setAttribute('aria-hidden', 'true');
  progressBar.style.width = '0%';
}

extractBtn.addEventListener('click', async () => {
  if (!imageSrc) return showToast('Please select or capture an image.');
  extractBtn.disabled = true;
  resultContainer.setAttribute('aria-hidden', 'true');
  resultText.textContent = '';
  setProgress(0, 'Starting...');
  const lang = langSelect.value;
  const startTime = performance.now();

  try {
    const { data: { text } } = await Tesseract.recognize(imageSrc, lang, {
      logger: m => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
        } else if (m.status) {
          setProgress(0, m.status.replace(/_/g, ' '));
        }
      }
    });
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
    resultText.textContent = text.trim() || 'No text detected.';
    resultLabel.textContent = `Extracted Text (${elapsed}s)`;
    resultContainer.setAttribute('aria-hidden', 'false');
    updateCharCount();
    showToast('Text extracted!', 'success');
  } catch {
    showToast('Failed to extract text.');
  }

  hideProgress();
  extractBtn.disabled = false;
});

copyBtn.addEventListener('click', () => {
  const text = resultText.textContent.trim();
  if (!text) return showToast('Nothing to copy.');
  navigator.clipboard.writeText(text)
    .then(() => showToast('Text copied!', 'success'))
    .catch(() => showToast('Failed to copy.'));
});

downloadBtn.addEventListener('click', () => {
  const text = resultText.textContent.trim();
  if (!text) return showToast('Nothing to download.');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'extracted-text.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Downloaded!', 'success');
});
