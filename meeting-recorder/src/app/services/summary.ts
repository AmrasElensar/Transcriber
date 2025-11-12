import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SummaryConfig {
  provider: 'openai' | 'anthropic' | 'basic';
  apiKey?: string;
}

export interface MeetingSummary {
  keyPoints: string[];
  actionItems: string[];
  decisions: string[];
  participants?: string[];
  duration?: string;
  fullSummary: string;
}

@Injectable({
  providedIn: 'root',
})
export class Summary {
  private config: SummaryConfig = {
    provider: 'basic'
  };

  private summary$ = new BehaviorSubject<MeetingSummary | null>(null);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  getSummary(): Observable<MeetingSummary | null> {
    return this.summary$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }

  setConfig(config: SummaryConfig): void {
    this.config = config;
  }

  async generateSummary(transcript: string): Promise<MeetingSummary> {
    this.loading$.next(true);
    this.error$.next(null);

    try {
      let summary: MeetingSummary;

      switch (this.config.provider) {
        case 'openai':
          summary = await this.generateWithOpenAI(transcript);
          break;
        case 'anthropic':
          summary = await this.generateWithAnthropic(transcript);
          break;
        case 'basic':
        default:
          summary = this.generateBasicSummary(transcript);
          break;
      }

      this.summary$.next(summary);
      this.loading$.next(false);
      return summary;

    } catch (error: any) {
      const errorMsg = `Failed to generate summary: ${error.message}`;
      this.error$.next(errorMsg);
      this.loading$.next(false);
      throw new Error(errorMsg);
    }
  }

  private async generateWithOpenAI(transcript: string): Promise<MeetingSummary> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a meeting summarizer. Analyze the transcript and provide a structured summary with key points, action items, and decisions.'
          },
          {
            role: 'user',
            content: `Please summarize this meeting transcript and provide:
1. Key Points (main topics discussed)
2. Action Items (tasks to be done)
3. Decisions Made
4. Brief overall summary

Transcript: ${transcript}`
          }
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const summaryText = data.choices[0].message.content;

    return this.parseSummaryText(summaryText);
  }

  private async generateWithAnthropic(transcript: string): Promise<MeetingSummary> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Please summarize this meeting transcript and provide:
1. Key Points (main topics discussed)
2. Action Items (tasks to be done)
3. Decisions Made
4. Brief overall summary

Transcript: ${transcript}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const summaryText = data.content[0].text;

    return this.parseSummaryText(summaryText);
  }

  private generateBasicSummary(transcript: string): MeetingSummary {
    // Basic client-side summarization using text processing
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Extract potential action items (sentences with modal verbs)
    const actionWords = ['will', 'should', 'need to', 'must', 'have to', 'going to'];
    const actionItems = sentences
      .filter(s => actionWords.some(word => s.toLowerCase().includes(word)))
      .slice(0, 5)
      .map(s => s.trim());

    // Extract potential decisions (sentences with decision keywords)
    const decisionWords = ['decided', 'agreed', 'concluded', 'resolved', 'determined'];
    const decisions = sentences
      .filter(s => decisionWords.some(word => s.toLowerCase().includes(word)))
      .slice(0, 5)
      .map(s => s.trim());

    // Key points: Extract longer, substantive sentences
    const keyPoints = sentences
      .filter(s => s.split(' ').length > 8 && s.split(' ').length < 30)
      .slice(0, 5)
      .map(s => s.trim());

    const wordCount = transcript.split(' ').length;
    const estimatedDuration = Math.ceil(wordCount / 150); // Assuming ~150 words per minute

    return {
      keyPoints: keyPoints.length > 0 ? keyPoints : ['No key points identified. The transcript may be too short.'],
      actionItems: actionItems.length > 0 ? actionItems : ['No action items identified.'],
      decisions: decisions.length > 0 ? decisions : ['No specific decisions identified.'],
      duration: `~${estimatedDuration} minutes`,
      fullSummary: this.createBasicSummaryText(transcript, wordCount)
    };
  }

  private createBasicSummaryText(transcript: string, wordCount: number): string {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summaryLength = Math.min(3, sentences.length);
    const summarySentences = sentences.slice(0, summaryLength).join('. ');

    return `Meeting transcript containing ${wordCount} words. ${summarySentences}${summaryLength < sentences.length ? '...' : ''}`;
  }

  private parseSummaryText(text: string): MeetingSummary {
    // Parse AI-generated summary text into structured format
    const keyPointsMatch = text.match(/key points?:?\s*([\s\S]*?)(?=action items?:|decisions?:|$)/i);
    const actionItemsMatch = text.match(/action items?:?\s*([\s\S]*?)(?=decisions?:|key points?:|$)/i);
    const decisionsMatch = text.match(/decisions?:?\s*([\s\S]*?)(?=action items?:|key points?:|overall|$)/i);

    const extractList = (match: RegExpMatchArray | null): string[] => {
      if (!match || !match[1]) return [];
      return match[1]
        .split(/\n+/)
        .map(item => item.replace(/^[-*•]\s*/, '').trim())
        .filter(item => item.length > 0)
        .slice(0, 10);
    };

    return {
      keyPoints: extractList(keyPointsMatch),
      actionItems: extractList(actionItemsMatch),
      decisions: extractList(decisionsMatch),
      fullSummary: text
    };
  }

  clearSummary(): void {
    this.summary$.next(null);
    this.error$.next(null);
  }
}
