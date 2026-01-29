const logoImg = document.querySelector('.logo');
const logoCount = 7;
const randomIndex = Math.floor(Math.random() * logoCount) + 1;
logoImg.src = `cat${randomIndex}.gif`;

const fileInput = document.getElementById('fileInput');
const preview = document.createElement('img'); // hidden preview
preview.style.display='none';
document.body.appendChild(preview);

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

function showToast(msg,type='error'){
  const toast=document.createElement('div');
  toast.className='toast';
  if(type==='success') toast.classList.add('success');
  toast.textContent=msg;
  toastContainer.appendChild(toast);
  setTimeout(()=>toast.remove(),3500);
}

fileBtn.addEventListener('click',()=>fileInput.click());

fileInput.addEventListener('change',e=>{
  const file=e.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')) return showToast('Invalid file type.');
  imageSrc=URL.createObjectURL(file);
  preview.src=imageSrc;
});

document.addEventListener('paste', e=>{
  const items=(e.clipboardData||e.originalEvent.clipboardData).items;
  if(!items) return;
  for(const item of items){
    if(item.type.indexOf('image')!==-1){
      const blob=item.getAsFile();
      imageSrc=URL.createObjectURL(blob);
      preview.src=imageSrc;
      e.preventDefault();
      return;
    }
  }
});

cameraBtn.addEventListener('click', async ()=>{
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:true});
    cameraVideo.srcObject=stream;
    cameraModal.classList.add('show');
  }catch{
    showToast('Camera access denied.');
  }
});

captureBtn.addEventListener('click',()=>{
  if(!stream) return showToast('No camera stream.');
  const canvas=document.createElement('canvas');
  canvas.width=cameraVideo.videoWidth;
  canvas.height=cameraVideo.videoHeight;
  canvas.getContext('2d').drawImage(cameraVideo,0,0);
  imageSrc=canvas.toDataURL('image/png');
  preview.src=imageSrc;
  stopCamera();
});

closeCamera.addEventListener('click',stopCamera);

function stopCamera(){
  cameraModal.classList.remove('show');
  if(stream) stream.getTracks().forEach(t=>t.stop());
}

extractBtn.addEventListener('click',()=>{
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

copyBtn.addEventListener('click',()=>{
  const text=resultText.textContent.trim();
  if(!text) return showToast('Nothing to copy.');
  navigator.clipboard.writeText(text)
    .then(()=>showToast('Text copied!','success'))
    .catch(()=>showToast('Failed to copy.'));
});
