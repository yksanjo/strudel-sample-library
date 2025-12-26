/**
 * Audio utility functions for sample playback and analysis
 */

export interface AudioAnalysis {
  duration: number;
  sampleRate: number;
  channels: number;
}

/**
 * Get audio file duration
 */
export async function getAudioDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });

    audio.addEventListener('error', () => {
      resolve(null);
    });

    audio.src = url;
  });
}

/**
 * Generate waveform data from audio buffer
 */
export async function generateWaveform(
  audioBuffer: AudioBuffer,
  samples: number = 100
): Promise<number[]> {
  const rawData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(rawData.length / samples);
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[start + j]);
    }
    waveform.push(sum / blockSize);
  }

  return waveform;
}

/**
 * Load audio file and return AudioBuffer
 */
export async function loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    console.error('Error loading audio buffer:', error);
    return null;
  }
}

/**
 * Validate audio file format
 */
export function isValidAudioFile(file: File): boolean {
  const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm'];
  return validTypes.includes(file.type) || /\.(wav|mp3|ogg|webm)$/i.test(file.name);
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

