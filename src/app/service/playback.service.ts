import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaybackService {

  private playSubject = new Subject<any>();
  onPlay = this.playSubject.asObservable();

  private pauseSubject = new Subject<any>();
  onPause = this.pauseSubject.asObservable();

  private timeLimitSubject = new Subject<any>();
  onTimeLimit = this.timeLimitSubject.asObservable();

  constructor() {
  }

  play() {
    this.playSubject.next();
  }

  pause() {
    this.pauseSubject.next();
  }

  setLimits(min: number, max: number) {
    this.timeLimitSubject.next({min, max});
  }
}
