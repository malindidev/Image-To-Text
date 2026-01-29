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
const fileBtn = document.querySelector('.file-btn');

let imageSrc = '';
let stream;

function showToast(message, type='error') {
  const toast = document.createElement('div');
  toast.classList.add('toast');
  if(type==='success') toast.classList.add('success');
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(()=>{ toast.remove(); },3500);
}

fileBtn.addEventListener('click', ()=>fileInput.click());

fileInput.addEventListener('change', e=>{
  const file=e.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')) return showToast('Invalid file type.');
  imageSrc=URL.createObjectURL(file);
  preview.src=imageSrc;
});

document.addEventListener('paste', e=>{
  const items = e.clipboardData.items;
  for(const item of items){
    if(item.type.startsWith('image/')){
      const blob=item.getAsFile();
      imageSrc=URL.createObjectURL(blob);
      preview.src=imageSrc;
      return;
    }
  }
});

cameraBtn.addEventListener('click', async()=>{
  cameraModal.setAttribute('aria-hidden','false');
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:true});
    cameraVideo.srcObject=stream;
  }catch{
    showToast('Camera access denied.');
    cameraModal.setAttribute('aria-hidden','true');
  }
});

captureBtn.addEventListener('click', ()=>{
  if(!stream) return showToast('No camera stream.');
  const canvas=document.createElement('canvas');
  canvas.width=cameraVideo.videoWidth;
  canvas.height=cameraVideo.videoHeight;
  canvas.getContext('2d').drawImage(cameraVideo,0,0);
  imageSrc=canvas.toDataURL('image/png');
  preview.src=imageSrc;
  stopCamera();
});

closeCamera.addEventListener('click', stopCamera);

function stopCamera(){
  cameraModal.setAttribute('aria-hidden','true');
  if(stream) stream.getTracks().forEach(t=>t.stop());
}

extractBtn.addEventListener('click', ()=>{
  if(!imageSrc) return showToast('Please select or capture an image.');
  resultContainer.setAttribute('aria-hidden','true');
  resultText.textContent='Processing...';
  Tesseract.recognize(imageSrc,'eng',{logger:m=>console.log(m)})
    .then(({data:{text}})=>{
      resultText.textContent=text.trim()||'No text detected.';
      resultContainer.setAttribute('aria-hidden','false');
    })
    .catch(()=>showToast('Failed to extract text.'));
});

copyBtn.addEventListener('click', ()=>{
  if(!resultText.textContent.trim()) return showToast('Nothing to copy.');
  navigator.clipboard.writeText(resultText.textContent)
    .then(()=>showToast('Text copied!','success'))
    .catch(()=>showToast('Failed to copy.'));
});
