import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PlaybackCameraChange, PlaybackInfo } from '../model/playback-info';
import { CameraType } from '../scene/camera/camera-type';
import { Tick } from '../model/tick';

@Injectable({
  providedIn: 'root'
})
export class PlaybackService {

  private playSubject = new Subject<void>();
  onPlay = this.playSubject.asObservable();

  private pauseSubject = new Subject<void>();
  onPause = this.pauseSubject.asObservable();

  private playbackInfoSubject = new Subject<PlaybackInfo>();
  onPlaybackInfo = this.playbackInfoSubject.asObservable();

  private timeUpdateSubject = new Subject<Tick>();
  onTimeUpdate = this.timeUpdateSubject.asObservable();

  private timeScrollSubject = new Subject<number>();
  onTimeScroll = this.timeScrollSubject.asObservable();

  private speedSubject = new Subject<number>();
  onSpeed = this.speedSubject.asObservable();

  private cameraChangeSubject = new Subject<PlaybackCameraChange>();
  onCameraChange = this.cameraChangeSubject.asObservable();

  constructor() {
  }

  play() {
    this.playSubject.next();
  }

  pause() {
    this.pauseSubject.next();
  }

  setPlaybackInfo(playbackInfo: PlaybackInfo) {
    this.playbackInfoSubject.next(playbackInfo);
  }

  updateTime(tick: Tick) {
    this.timeUpdateSubject.next(tick);
  }

  scrollToTime(time: number) {
    this.timeScrollSubject.next(time);
  }

  setSpeed(speed: number) {
    this.speedSubject.next(speed);
  }

  setCamera(type: CameraType, playerId?: number) {
    this.cameraChangeSubject.next({
      type,
      targetPlayer: playerId
    });
  }
}
