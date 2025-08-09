document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-btn');
  const downloadBtn = document.getElementById('download-btn');
  const qrInput = document.getElementById('qr-input');
  const qrCodeContainer = document.getElementById('qrcode');
  const colorPicker = document.getElementById('color-picker');
  const backgroundPicker = document.getElementById('background-picker');
  const sizeInput = document.getElementById('size-input');
  const roundedInput = document.getElementById('rounded-input');

  let currentCanvas = null;

  generateBtn.addEventListener('click', () => {
    const text = qrInput.value.trim();
    if (!text) {
      alert('Please enter some text or URL to generate a QR code.');
      return;
    }

    qrCodeContainer.innerHTML = '';

    const size = parseInt(sizeInput.value, 10) || 250;
    const fill = colorPicker.value || '#000000';
    const back = backgroundPicker.value || '#ffffff';
    const rounded = parseInt(roundedInput.value, 10) || 10;

    const qr = kjua({
      text,
      size,
      fill,
      back,
      rounded,
      quiet: 2,
      render: 'canvas', // use canvas for PNG
    });

    qrCodeContainer.appendChild(qr);
    currentCanvas = qr;

    // Enable download button now that QR is generated
    downloadBtn.disabled = false;
  });

  downloadBtn.addEventListener('click', () => {
    if (!currentCanvas) {
      alert('Please generate a QR code first.');
      return;
    }

    const pngUrl = currentCanvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = 'qrcode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});
