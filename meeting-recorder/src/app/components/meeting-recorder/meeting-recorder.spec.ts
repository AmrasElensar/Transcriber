import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingRecorder } from './meeting-recorder';

describe('MeetingRecorder', () => {
  let component: MeetingRecorder;
  let fixture: ComponentFixture<MeetingRecorder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingRecorder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingRecorder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
