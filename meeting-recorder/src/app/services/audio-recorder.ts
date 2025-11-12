import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

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

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      this.audioChunks = [];

      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

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
    }
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
