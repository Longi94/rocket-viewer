import { Component, OnInit } from '@angular/core';
import { PlaybackService } from '../../../service/playback.service';
import { ChangeContext, Options } from 'ng5-slider';
import { PlayerPlaybackInfo } from '../../../model/playback-info';
import { CameraType } from '../../../scene/camera/camera-type';

@Component({
  selector: 'app-playback-control',
  templateUrl: './playback-control.component.html',
  styleUrls: ['./playback-control.component.scss']
})
export class PlaybackControlComponent implements OnInit {

  isPlaying = false;

  currentTime: number;
  sliderOptions: Options = this.createSliderOption(0, 100);
  isSliding = false;

  playbackSpeeds = [0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  selectedSpeed = 1;
  players: PlayerPlaybackInfo[];

  constructor(private readonly playbackService: PlaybackService) {
    this.playbackService.onPlaybackInfo.subscribe(info => {
      this.players = info.players;
      this.sliderOptions = this.createSliderOption(info.minTime, info.maxTime);
    });
    this.playbackService.onTimeUpdate.subscribe(t => {
      if (!this.isSliding) {
        this.currentTime = t;
      }

      if (t >= this.sliderOptions.ceil) {
        this.isPlaying = false;
      }
    });
  }

  createSliderOption(min: number, max: number): Options {
    this.currentTime = min;
    return {
      animate: false,
      floor: min,
      ceil: max,
      step: 0.01,
      hidePointerLabels: true,
      hideLimitLabels: true
    };
  }

  ngOnInit(): void {
  }

  playClick() {
    if (this.isPlaying) {
      this.playbackService.pause();
    } else {
      this.playbackService.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  slideStart($event: ChangeContext) {
    this.isSliding = true;
    this.playbackService.scrollToTime($event.value);
  }

  slideEnd($event: ChangeContext) {
    this.isSliding = false;
    this.playbackService.scrollToTime($event.value);
  }

  slideChange($event: ChangeContext) {
    this.playbackService.scrollToTime($event.value);
  }

  setSpeed(speed: number) {
    this.selectedSpeed = speed;
    this.playbackService.setSpeed(speed);
  }

  setCameraOrbital() {
    this.playbackService.setCamera(CameraType.ORBITAL);
  }

  setPlayerCamera(playerId: number) {
    this.playbackService.setCamera(CameraType.PLAYER_VIEW, playerId);
  }
}
