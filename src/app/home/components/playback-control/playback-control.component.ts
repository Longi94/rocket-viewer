import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PlaybackService } from '../../../service/playback.service';
import { ChangeContext, Options } from 'ng5-slider';
import { PlayerPlaybackInfo } from '../../../model/playback-info';
import { CameraType } from '../../../scene/camera/camera-type';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { ThreeService } from '../../../service/three.service';

@Component({
  selector: 'app-playback-control',
  templateUrl: './playback-control.component.html',
  styleUrls: ['./playback-control.component.scss']
})
export class PlaybackControlComponent implements OnInit {

  @ViewChild('vrButtonDiv', {static: true})
  vrButtonDiv: ElementRef<HTMLDivElement>;

  isPlaying = false;

  currentTime: number;
  maxTime: number;
  sliderOptions: Options = this.createSliderOption(0, 100);
  isSliding = false;

  playbackSpeeds = [0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  selectedSpeed = 1;
  players: PlayerPlaybackInfo[];

  constructor(private readonly playbackService: PlaybackService,
              private readonly threeService: ThreeService) {
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
    this.threeService.onRendererReady.subscribe(renderer => {
      this.vrButtonDiv.nativeElement.appendChild(VRButton.createButton(renderer));
    })
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
}
