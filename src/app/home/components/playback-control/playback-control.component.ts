import { Component, OnInit } from '@angular/core';
import { PlaybackService } from '../../../service/playback.service';
import { ChangeContext, Options } from 'ng5-slider';

@Component({
  selector: 'app-playback-control',
  templateUrl: './playback-control.component.html',
  styleUrls: ['./playback-control.component.scss']
})
export class PlaybackControlComponent implements OnInit {

  isPlaying = false;

  sliderValue: number;
  currentTime: number;
  sliderOptions: Options = this.createSliderOption(0, 100);
  isSliding = false;

  playbackSpeeds = [0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  selectedSpeed = 1;

  constructor(private readonly playbackService: PlaybackService) {
    this.playbackService.onTimeLimit.subscribe(limits => {
      this.sliderOptions = this.createSliderOption(limits[0], limits[1]);
      this.currentTime = limits[0];
    });
    this.playbackService.onTimeUpdate.subscribe(t => {
      this.currentTime = t;
      if (!this.isSliding) {
        this.sliderValue = t;
      }
    });
  }

  createSliderOption(min: number, max: number): Options {
    this.sliderValue = min;
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
    console.log($event);
  }

  slideEnd($event: ChangeContext) {
    this.isSliding = false;
    this.playbackService.scrollToTime($event.value);
  }

  setSpeed(speed: number) {
    this.selectedSpeed = speed;
    this.playbackService.setSpeed(speed);
  }
}
