import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MeetingRecorder } from './components/meeting-recorder/meeting-recorder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MeetingRecorder],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
