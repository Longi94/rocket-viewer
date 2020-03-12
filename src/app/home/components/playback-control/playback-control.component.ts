import { Component, OnInit } from '@angular/core';
import { PlaybackService } from '../../../service/playback.service';
import { ChangeContext, Options } from 'ng5-slider';
import { PlayerPlaybackInfo } from '../../../model/playback-info';
import { CameraType } from '../../../scene/camera/camera-type';
import { VRSupport, VRUtils } from '../../../util/vr';
import { ThreeService } from '../../../service/three.service';
import { MatDialog } from '@angular/material/dialog';
import { AboutComponent } from '../about/about.component';

@Component({
  selector: 'app-playback-control',
  templateUrl: './playback-control.component.html',
  styleUrls: ['./playback-control.component.scss']
})
export class PlaybackControlComponent implements OnInit {

  isPlaying = false;

  currentTime: number;
  maxTime: number;
  sliderOptions: Options = this.createSliderOption(0, 100);
  isSliding = false;

  playbackSpeeds = [0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  selectedSpeed = 1;
  players: PlayerPlaybackInfo[];

  // VR
  inVr = false;
  vrSupported = false;
  vrButtonText = 'VR not supported';

  constructor(private readonly playbackService: PlaybackService,
              private readonly threeService: ThreeService,
              private readonly dialog: MatDialog) {
    this.playbackService.onPlaybackInfo.subscribe(info => {
      this.players = info.players;
      this.sliderOptions = this.createSliderOption(info.minTime, info.maxTime);
    });
    this.playbackService.onTimeUpdate.subscribe(t => {
      if (!this.isSliding) {
        this.currentTime = t.time;
      }

      if (t.time >= this.sliderOptions.ceil) {
        this.isPlaying = false;
      }
    });
    this.threeService.onVrEnter.subscribe(() => {
      this.vrButtonText = 'Leave VR';
      this.inVr = true;
    });
    this.threeService.onVrLeave.subscribe(() => {
      this.vrButtonText = 'Enter VR';
      this.inVr = false;
    });
    this.playbackService.onCloseReplay.subscribe(() => {
      this.sliderOptions = this.createSliderOption(0, 100);
      this.selectedSpeed = 1;
      this.isPlaying = false;
      this.players = [];
    });
  }

  createSliderOption(min: number, max: number): Options {
    this.currentTime = min;
    this.maxTime = max;
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
    VRUtils.detect().then(result => {
      switch (result) {
        case VRSupport.SUPPORTED:
          this.vrSupported = true;
          this.vrButtonText = 'Enter VR';
          break;
        case VRSupport.VR_NOT_SUPPORTED:
          this.vrButtonText = 'VR not supported';
          break;
        case VRSupport.WEBXR_NOT_AVAILABLE:
          this.vrButtonText = 'WEBXR not available';
          break;
        case VRSupport.NEEDS_HTTPS:
          this.vrButtonText = 'WEBXR needs HTTPS';
          break;
      }
    });
  }

  playClick() {
    if (this.isPlaying) {
      this.playbackService.pause();
    } else {
      this.playbackService.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  slideStart() {
    this.isSliding = true;
  }

  slideEnd() {
    this.isSliding = false;
  }

  slideChange($event: ChangeContext) {
    this.playbackService.scrollToTime(Math.min($event.value, this.maxTime));
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

  enterVR() {
    if (this.inVr) {
      this.playbackService.leaveVr();
    } else {
      this.playbackService.enterVr();
    }
  }

  closeReplay() {
    this.playbackService.closeReplay();
  }

  openAbout() {
    this.dialog.open(AboutComponent, {width: '400px'});
  }
}
