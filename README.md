# Image to Text Tool (Client-Side)

A modern, fully client-side web application to extract text from images. Supports file upload, pasting images, and capturing images from your camera. No data is uploaded—100% processed in your browser.

## Features

- Upload images from your device.
- Paste images directly from the clipboard.
- Capture images using your camera.
- Extract text instantly with **Tesseract.js**.
- Editable result text.
- Copy text to clipboard with interactive toast notifications.
- Randomised animated logo for a playful touch.
- Fully responsive and mobile-friendly.
- Modern, professional design with smooth animations.

## Demo

**[Click me!](https://itt.bbnerds.com)**

## Installation

1. Clone or download the repository.
2. Ensure the following files exist in the same directory:
   - `index.html`
   - `style.css`
   - `script.js`
   - `cat1.gif` … `cat7.gif` (logo images)
3. Open `index.html` in a browser.

## Usage

1. **Upload Image**: Click the "Choose File" button and select an image.
2. **Paste Image**: Copy an image from another application and paste it directly into the page.
3. **Camera Capture**: Click "Capture from Camera" to take a photo.
4. **Extract Text**: Click "Extract Text" to process the image.
5. **Edit Text**: The extracted text is editable directly in the result box.
6. **Copy**: Click the clipboard button to copy the text to your clipboard.
7. **Error Notifications**: Any errors (invalid file, camera denied, etc.) appear as toast notifications.

## Dependencies

- [Tesseract.js](https://github.com/naptha/tesseract.js) (CDN used in HTML)

## Notes

- All processing is client-side; no data is sent to a server.
- Works in modern browsers with camera access support.
- For best results, use high-contrast images with clear text.
