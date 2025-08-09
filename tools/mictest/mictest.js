const videoSelect = document.getElementById('videoSelect');
  const audioSelect = document.getElementById('audioSelect');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const videoElem = document.getElementById('video');
  const micLevelElem = document.getElementById('mic-level');
  const errorMsg = document.getElementById('errorMsg');

  let stream = null;
  let audioContext = null;
  let analyser = null;
  let microphone = null;
  let rafId = null;

  // List devices
async function getDevices() {
  try {
    // Request permission by getting any media stream (audio or video)
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

    const devices = await navigator.mediaDevices.enumerateDevices();

    videoSelect.innerHTML = '';
    audioSelect.innerHTML = '';

    devices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;

      // Use actual device label or fallback text
      option.text = device.label || 
                    (device.kind === 'videoinput' ? 'Camera ' : 'Microphone ') + (device.kind === 'videoinput' ? videoSelect.length + 1 : audioSelect.length + 1);

      if (device.kind === 'videoinput') videoSelect.appendChild(option);
      else if (device.kind === 'audioinput') audioSelect.appendChild(option);
    });
  } catch (err) {
    errorMsg.textContent = 'Error fetching devices: ' + err.message;
  }
}


  // Visualize mic level
  function visualizeMic() {
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    let values = 0;
    for(let i=0; i < dataArray.length; i++) values += dataArray[i];
    const average = values / dataArray.length;
    const levelPercent = Math.min(100, (average / 255) * 100);
    micLevelElem.style.width = levelPercent + '%';
    rafId = requestAnimationFrame(visualizeMic);
  }

  // Start stream
  async function startTest() {
    errorMsg.textContent = '';
    stopTest();

    const videoDeviceId = videoSelect.value;
    const audioDeviceId = audioSelect.value;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined },
        audio: { deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined }
      });
      videoElem.srcObject = stream;

      // Setup audio context & analyser for mic level
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      microphone = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      microphone.connect(analyser);
      visualizeMic();

      startBtn.disabled = true;
      stopBtn.disabled = false;
    } catch (err) {
      errorMsg.textContent = 'Error accessing media devices: ' + err.message;
    }
  }

  function stopTest() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    videoElem.srcObject = null;
    micLevelElem.style.width = '0%';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  startBtn.addEventListener('click', startTest);
  stopBtn.addEventListener('click', stopTest);

  navigator.mediaDevices.ondevicechange = getDevices;

  getDevices();

document.addEventListener('DOMContentLoaded', () => {
  const micSelect = document.getElementById('mic-select');
  const startBtn = document.getElementById('start-record-btn');
  const stopBtn = document.getElementById('stop-record-btn');
  const downloadBtn = document.getElementById('download-record-btn');
  const meterFill = document.getElementById('audio-meter-fill');
  const playback = document.getElementById('playback');

  let audioContext;
  let mediaStream;
  let mediaRecorder;
  let audioChunks = [];
  let analyser;
  let dataArray;
  let animationId;

  async function populateMicList() {
    try {
      // Request mic permission first to get labels
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter(device => device.kind === 'audioinput');
      micSelect.innerHTML = '';
      mics.forEach((mic, i) => {
        const option = document.createElement('option');
        option.value = mic.deviceId;
        option.text = mic.label || `Microphone ${i + 1}`;
        micSelect.appendChild(option);
      });
      startBtn.disabled = mics.length === 0;
      console.log('Mic list populated:', mics.map(m => m.label));
    } catch (err) {
      console.error('Error accessing microphone devices:', err);
      alert('Please allow microphone access to select your device.');
      startBtn.disabled = true;
    }
  }

  function setupMeter(stream) {
    if (audioContext) {
      audioContext.close();
      cancelAnimationFrame(animationId);
    }

    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    function updateMeter() {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const percent = Math.min(100, (avg / 255) * 100);
      meterFill.style.width = percent + '%';
      animationId = requestAnimationFrame(updateMeter);
    }
    updateMeter();
  }

  async function startMicAndRecorder() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    const deviceId = micSelect.value;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId } });
      setupMeter(mediaStream);

      mediaRecorder = new MediaRecorder(mediaStream);
      audioChunks = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        playback.src = url;
        playback.style.display = 'block';
        downloadBtn.href = url;
        downloadBtn.download = 'recording.webm';
        downloadBtn.disabled = false;
        console.log('Recording stopped, ready for playback/download');
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e.error);
        alert('Recording error: ' + e.error.message);
        stopBtn.disabled = true;
        startBtn.disabled = false;
      };

      mediaRecorder.start();
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start media stream:', err);
      alert('Could not start recording: ' + err.message);
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  }

  startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    downloadBtn.disabled = true;
    playback.style.display = 'none';
    startMicAndRecorder();
  });

  stopBtn.addEventListener('click', () => {
    stopBtn.disabled = true;
    startBtn.disabled = false;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      console.log('Stopping recording...');
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      console.log('Media stream tracks stopped');
    }
    if (audioContext) {
      audioContext.close();
      cancelAnimationFrame(animationId);
      console.log('Audio context closed');
    }
    meterFill.style.width = '0%';
  });

  downloadBtn.addEventListener('click', () => {
  if (!downloadBtn.href || downloadBtn.disabled) return;

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = downloadBtn.href;
  a.download = downloadBtn.download || 'recording.webm';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});


  populateMicList();
  navigator.mediaDevices.addEventListener('devicechange', populateMicList);
});
