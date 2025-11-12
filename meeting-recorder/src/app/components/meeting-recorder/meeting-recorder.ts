import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AudioRecorder } from '../../services/audio-recorder';
import { Transcription, TranscriptSegment } from '../../services/transcription';
import { Summary, MeetingSummary, SummaryConfig } from '../../services/summary';

@Component({
  selector: 'app-meeting-recorder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting-recorder.html',
  styleUrl: './meeting-recorder.scss',
})
export class MeetingRecorder implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Recording state
  recordingState: 'idle' | 'recording' | 'paused' = 'idle';
  isTranscribing = false;

  // Transcript data
  transcript = '';
  transcriptSegments: TranscriptSegment[] = [];

  // Summary data
  summary: MeetingSummary | null = null;
  isSummaryLoading = false;

  // Errors
  errorMessage = '';

  // Timer
  recordingDuration = 0;
  private timerInterval: any = null;

  // Settings
  showSettings = false;
  aiProvider: 'basic' | 'openai' | 'anthropic' | 'ollama' | 'llamacpp' = 'basic';
  apiKey = '';
  endpoint = '';
  modelName = '';

  // UI state
  activeTab: 'transcript' | 'summary' = 'transcript';

  constructor(
    private audioRecorder: AudioRecorder,
    private transcriptionService: Transcription,
    private summaryService: Summary
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopTimer();
  }

  private setupSubscriptions(): void {
    // Subscribe to recording state
    this.audioRecorder.getRecordingState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.recordingState = state;
        if (state === 'recording') {
          this.startTimer();
        } else if (state === 'idle') {
          this.stopTimer();
        }
      });

    // Subscribe to audio recorder errors
    this.audioRecorder.getErrors()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error;
        setTimeout(() => this.errorMessage = '', 5000);
      });

    // Subscribe to transcription state
    this.transcriptionService.getListeningState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isListening => {
        this.isTranscribing = isListening;
      });

    // Subscribe to transcript updates
    this.transcriptionService.getFullTranscript()
      .pipe(takeUntil(this.destroy$))
      .subscribe(transcript => {
        this.transcript = transcript;
      });

    // Subscribe to transcript segments
    this.transcriptionService.getTranscriptSegments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(segment => {
        if (segment.isFinal) {
          this.transcriptSegments.push(segment);
        }
      });

    // Subscribe to transcription errors
    this.transcriptionService.getErrors()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error;
        setTimeout(() => this.errorMessage = '', 5000);
      });

    // Subscribe to summary updates
    this.summaryService.getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.summary = summary;
      });

    // Subscribe to summary loading state
    this.summaryService.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isSummaryLoading = loading;
      });

    // Subscribe to summary errors
    this.summaryService.getError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.errorMessage = error;
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
  }

  async startRecording(): Promise<void> {
    try {
      await this.audioRecorder.startRecording();
      this.transcriptionService.startTranscription();
      this.transcriptSegments = [];
      this.summary = null;
      this.recordingDuration = 0;
    } catch (error: any) {
      this.errorMessage = `Failed to start recording: ${error.message}`;
    }
  }

  pauseRecording(): void {
    this.audioRecorder.pauseRecording();
  }

  resumeRecording(): void {
    this.audioRecorder.resumeRecording();
  }

  stopRecording(): void {
    this.audioRecorder.stopRecording();
    this.transcriptionService.stopTranscription();
  }

  async generateSummary(): Promise<void> {
    if (!this.transcript || this.transcript.trim().length === 0) {
      this.errorMessage = 'No transcript available to summarize';
      return;
    }

    try {
      await this.summaryService.generateSummary(this.transcript);
      this.activeTab = 'summary';
    } catch (error: any) {
      console.error('Error generating summary:', error);
    }
  }

  clearAll(): void {
    this.transcript = '';
    this.transcriptSegments = [];
    this.summary = null;
    this.recordingDuration = 0;
    this.transcriptionService.resetTranscript();
    this.summaryService.clearSummary();
  }

  downloadTranscript(): void {
    const blob = new Blob([this.transcript], { type: 'text/plain' });
    this.downloadFile(blob, 'meeting-transcript.txt');
  }

  downloadSummary(): void {
    if (!this.summary) return;

    const summaryText = this.formatSummaryForDownload(this.summary);
    const blob = new Blob([summaryText], { type: 'text/plain' });
    this.downloadFile(blob, 'meeting-summary.txt');
  }

  private formatSummaryForDownload(summary: MeetingSummary): string {
    let text = '=== MEETING SUMMARY ===\n\n';

    if (summary.duration) {
      text += `Duration: ${summary.duration}\n\n`;
    }

    text += '--- KEY POINTS ---\n';
    summary.keyPoints.forEach((point, i) => {
      text += `${i + 1}. ${point}\n`;
    });

    text += '\n--- ACTION ITEMS ---\n';
    summary.actionItems.forEach((item, i) => {
      text += `${i + 1}. ${item}\n`;
    });

    text += '\n--- DECISIONS ---\n';
    summary.decisions.forEach((decision, i) => {
      text += `${i + 1}. ${decision}\n`;
    });

    text += '\n--- FULL SUMMARY ---\n';
    text += summary.fullSummary;

    return text;
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.recordingDuration++;
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get formattedDuration(): string {
    const hours = Math.floor(this.recordingDuration / 3600);
    const minutes = Math.floor((this.recordingDuration % 3600) / 60);
    const seconds = this.recordingDuration % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  get isRecording(): boolean {
    return this.recordingState === 'recording';
  }

  get isPaused(): boolean {
    return this.recordingState === 'paused';
  }

  get canGenerateSummary(): boolean {
    return this.transcript.trim().length > 0 && !this.isRecording && !this.isSummaryLoading;
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  saveSettings(): void {
    const config: SummaryConfig = {
      provider: this.aiProvider,
      apiKey: this.apiKey || undefined,
      endpoint: this.endpoint || undefined,
      model: this.modelName || undefined
    };
    this.summaryService.setConfig(config);
    this.showSettings = false;
  }

  get speechRecognitionSupported(): boolean {
    return this.transcriptionService.isSupported();
  }
}
