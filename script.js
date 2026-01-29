const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const context = canvas.getContext('2d');

// Load face-api.js models from GitHub raw via CDN
async function loadModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights';
  
  // Load tiny face detector model
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  // Load tiny landmarks model
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
}

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    video.srcObject = stream;
  } catch (err) {
    console.error("Camera access error:", err);
    alert("Unable to access camera.");
  }
}

async function renderFace() {
  if (video.readyState !== 4) {
    requestAnimationFrame(renderFace);
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const detections = await faceapi.detectAllFaces(
    video,
    new faceapi.TinyFaceDetectorOptions()
  ).withFaceLandmarks(true);

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (detections.length > 0) {
    detections.forEach(({ landmarks }) => {
      const points = landmarks.positions;

      context.strokeStyle = 'lime';
      context.lineWidth = 2;
      context.beginPath();
      points.forEach((pt, i) => {
        if (i === 0) context.moveTo(pt.x, pt.y);
        else context.lineTo(pt.x, pt.y);
      });
      context.closePath();
      context.stroke();

      points.forEach(pt => {
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        context.fill();
      });
    });
  }

  requestAnimationFrame(renderFace);
}

loadModels().then(() => {
  startVideo();
  video.addEventListener('play', renderFace);
});
