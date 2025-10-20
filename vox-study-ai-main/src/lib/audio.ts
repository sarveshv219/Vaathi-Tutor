export const recordAudio = async (durationMs?: number): Promise<Blob> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      const blob = new Blob(chunks, { type: 'audio/webm' });
      resolve(blob);
    };

    mediaRecorder.onerror = (e) => {
      stream.getTracks().forEach(track => track.stop());
      reject(e);
    };

    mediaRecorder.start();

    if (durationMs) {
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, durationMs);
    }

    // Return early if no duration specified - caller must stop manually
    if (!durationMs) {
      // Store recorder reference for manual stop
      (window as any).__currentRecorder = mediaRecorder;
    }
  });
};

export const stopRecording = () => {
  const recorder = (window as any).__currentRecorder as MediaRecorder | undefined;
  if (recorder && recorder.state === 'recording') {
    recorder.stop();
    (window as any).__currentRecorder = null;
  }
};

export const playBlob = (blob: Blob, onEnded?: () => void): HTMLAudioElement => {
  const audio = new Audio(URL.createObjectURL(blob));
  
  if (onEnded) {
    audio.addEventListener('ended', onEnded);
  }

  audio.play();
  return audio;
};
