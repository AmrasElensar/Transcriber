import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type AudioSourceType = 'microphone' | 'system' | 'both';

@Injectable({
  providedIn: 'root',
})
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private systemStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;

  private recordingState$ = new BehaviorSubject<'idle' | 'recording' | 'paused'>('idle');
  private audioData$ = new Subject<Blob>();
  private error$ = new Subject<string>();

  getRecordingState(): Observable<'idle' | 'recording' | 'paused'> {
    return this.recordingState$.asObservable();
  }

  getAudioData(): Observable<Blob> {
    return this.audioData$.asObservable();
  }

  getErrors(): Observable<string> {
    return this.error$.asObservable();
  }

  async startRecording(audioSource: AudioSourceType = 'microphone'): Promise<void> {
    try {
      this.audioChunks = [];

      switch (audioSource) {
        case 'microphone':
          await this.startMicrophoneRecording();
          break;
        case 'system':
          await this.startSystemAudioRecording();
          break;
        case 'both':
          await this.startMixedRecording();
          break;
      }

      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream!, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioData$.next(audioBlob);
        this.cleanup();
      };

      this.mediaRecorder.onerror = (event: any) => {
        this.error$.next(`Recording error: ${event.error}`);
        this.cleanup();
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.recordingState$.next('recording');

    } catch (error: any) {
      this.error$.next(`Failed to start recording: ${error.message}`);
      this.recordingState$.next('idle');
      this.cleanup();
    }
  }

  private async startMicrophoneRecording(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });
  }

  private async startSystemAudioRecording(): Promise<void> {
    try {
      // @ts-ignore - getDisplayMedia exists but TypeScript might not recognize audio option
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Required for getDisplayMedia
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100,
          // @ts-ignore
          suppressLocalAudioPlayback: false
        }
      });

      // Remove video track since we only want audio
      const videoTracks = this.stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.stop();
        this.stream!.removeTrack(track);
      });

      // Check if we got audio
      if (this.stream.getAudioTracks().length === 0) {
        throw new Error('No audio track available. Make sure to select "Share tab audio" or "Share system audio" when prompted.');
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Screen sharing permission denied. Please allow screen sharing and select "Share tab audio" or "Share system audio".');
      }
      throw error;
    }
  }

  private async startMixedRecording(): Promise<void> {
    try {
      // Get microphone stream
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Get system audio stream
      // @ts-ignore
      this.systemStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100,
          // @ts-ignore
          suppressLocalAudioPlayback: false
        }
      });

      // Remove video track from system stream
      const videoTracks = this.systemStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.stop();
        this.systemStream!.removeTrack(track);
      });

      // Check if we got system audio
      if (this.systemStream.getAudioTracks().length === 0) {
        throw new Error('No system audio available. Make sure to select "Share tab audio" or "Share system audio" when prompted.');
      }

      // Mix both audio streams
      this.stream = await this.mixAudioStreams(this.micStream, this.systemStream);

    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Permission denied. Please allow both microphone and screen sharing access.');
      }
      throw error;
    }
  }

  private async mixAudioStreams(stream1: MediaStream, stream2: MediaStream): Promise<MediaStream> {
    this.audioContext = new AudioContext();

    // Create sources from both streams
    const source1 = this.audioContext.createMediaStreamSource(stream1);
    const source2 = this.audioContext.createMediaStreamSource(stream2);

    // Create destination
    const destination = this.audioContext.createMediaStreamDestination();

    // Connect both sources to destination
    source1.connect(destination);
    source2.connect(destination);

    return destination.stream;
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.recordingState$.next('paused');
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.recordingState$.next('recording');
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.recordingState$.next('idle');
    }
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }

    if (this.systemStream) {
      this.systemStream.getTracks().forEach(track => track.stop());
      this.systemStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private getSupportedMimeType(): string {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return 'audio/webm';
  }

  getStream(): MediaStream | null {
    return this.stream;
  }
}
