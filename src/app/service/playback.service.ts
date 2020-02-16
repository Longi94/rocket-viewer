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

  private timeLimitSubject = new Subject<number>();
  onTimeLimit = this.timeLimitSubject.asObservable();

  private timeUpdateSubject = new Subject<number>();
  onTimeUpdate = this.timeUpdateSubject.asObservable();

  private timeScrollSubject = new Subject<number>();
  onTimeScroll = this.timeScrollSubject.asObservable();

  private speedSubject = new Subject<number>();
  onSpeed = this.speedSubject.asObservable();

  constructor() {
  }

  play() {
    this.playSubject.next();
  }

  pause() {
    this.pauseSubject.next();
  }

  setLimits(max: number) {
    this.timeLimitSubject.next(max);
  }

  updateTime(time: number) {
    this.timeUpdateSubject.next(time);
  }

  scrollToTime(time: number) {
    this.timeScrollSubject.next(time);
  }

  setSpeed(speed: number) {
    this.speedSubject.next(speed);
  }
}
