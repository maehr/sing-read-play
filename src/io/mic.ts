import { PitchDetector } from 'pitchy';
import type { PitchSample } from '../engine/stability.js';

/** Thrown when the browser gives no microphone stream. */
export class MicrophoneError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'MicrophoneError';
  }
}

export interface Microphone {
  /** Turns the pitch analysis on or off without releasing the microphone. */
  setActive(active: boolean): void;
  /** Stops the loop and releases the microphone. */
  stop(): Promise<void>;
}

// A frame of 4096 samples holds about 7 periods of E2 (82.41 Hz) at 48 kHz.
// The McLeod method needs several periods for a stable result.
const FFT_SIZE = 4096;
const CLARITY_THRESHOLD = 0.6;

function rootMeanSquare(frame: Float32Array): number {
  let sum = 0;
  for (const value of frame) sum += value * value;
  return Math.sqrt(sum / frame.length);
}

/**
 * Opens the microphone and reports one pitch sample per animation frame.
 * The browser needs a user gesture before it starts the audio context.
 */
export async function startMicrophone(
  onSample: (sample: PitchSample) => void,
): Promise<Microphone> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
  } catch (error) {
    throw new MicrophoneError('Microphone access required', error);
  }

  const context = new AudioContext();
  const release = async (): Promise<void> => {
    for (const track of stream.getTracks()) track.stop();
    await context.close();
  };

  try {
    await context.resume();
  } catch (error) {
    await release();
    throw new MicrophoneError('Could not start the audio input', error);
  }

  const analyser = context.createAnalyser();
  analyser.fftSize = FFT_SIZE;
  context.createMediaStreamSource(stream).connect(analyser);

  const detector = PitchDetector.forFloat32Array(analyser.fftSize);
  detector.clarityThreshold = CLARITY_THRESHOLD;
  const frame = new Float32Array(analyser.fftSize);

  let active = true;
  let frameHandle = 0;
  const read = (): void => {
    // Skip the analysis while the app waits for the keyboard. It saves battery.
    if (active) {
      analyser.getFloatTimeDomainData(frame);
      const [frequency, clarity] = detector.findPitch(frame, context.sampleRate);
      onSample({
        frequency: frequency > 0 ? frequency : null,
        clarity,
        rms: rootMeanSquare(frame),
        timeMs: performance.now(),
      });
    }
    frameHandle = requestAnimationFrame(read);
  };
  frameHandle = requestAnimationFrame(read);

  return {
    setActive(next) {
      active = next;
    },
    async stop() {
      cancelAnimationFrame(frameHandle);
      await release();
    },
  };
}

/** Reads the microphone permission without opening a stream. */
export async function microphonePermission(): Promise<PermissionState | 'unknown'> {
  if (!navigator.permissions?.query) return 'unknown';
  try {
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return status.state;
  } catch {
    return 'unknown';
  }
}
