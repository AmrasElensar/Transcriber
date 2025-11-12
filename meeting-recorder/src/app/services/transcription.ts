import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface TranscriptSegment {
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Transcription {
  private recognition: any = null;
  private isListening = false;

  private transcript$ = new Subject<TranscriptSegment>();
  private fullTranscript$ = new BehaviorSubject<string>('');
  private isListening$ = new BehaviorSubject<boolean>(false);
  private error$ = new Subject<string>();

  private fullTranscriptText = '';

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.error$.next('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';

          this.fullTranscriptText += transcript + ' ';
          this.fullTranscript$.next(this.fullTranscriptText);

          this.transcript$.next({
            text: transcript,
            timestamp: new Date(),
            isFinal: true
          });
        } else {
          interimTranscript += transcript;

          this.transcript$.next({
            text: transcript,
            timestamp: new Date(),
            isFinal: false
          });
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'no-speech') {
        this.error$.next('No speech detected. Please speak into the microphone.');
      } else if (event.error === 'audio-capture') {
        this.error$.next('Microphone access error. Please check your microphone.');
      } else if (event.error === 'not-allowed') {
        this.error$.next('Microphone permission denied. Please allow microphone access.');
      } else {
        this.error$.next(`Speech recognition error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Restart recognition if it stops unexpectedly
        try {
          this.recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      } else {
        this.isListening$.next(false);
      }
    };
  }

  startTranscription(): void {
    if (!this.recognition) {
      this.error$.next('Speech recognition is not initialized.');
      return;
    }

    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      this.isListening$.next(true);
    } catch (error: any) {
      this.error$.next(`Failed to start transcription: ${error.message}`);
    }
  }

  stopTranscription(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    this.isListening = false;
    this.recognition.stop();
    this.isListening$.next(false);
  }

  resetTranscript(): void {
    this.fullTranscriptText = '';
    this.fullTranscript$.next('');
  }

  getTranscriptSegments(): Observable<TranscriptSegment> {
    return this.transcript$.asObservable();
  }

  getFullTranscript(): Observable<string> {
    return this.fullTranscript$.asObservable();
  }

  getListeningState(): Observable<boolean> {
    return this.isListening$.asObservable();
  }

  getErrors(): Observable<string> {
    return this.error$.asObservable();
  }

  isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  getCurrentTranscript(): string {
    return this.fullTranscriptText;
  }
}
