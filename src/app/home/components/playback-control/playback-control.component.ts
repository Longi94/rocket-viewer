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
  lastSliderUpdate: number = 0;
  currentTime: number;
  sliderOptions: Options = this.createSliderOption(0, 100);
  isSliding = false;

  constructor(private readonly playbackService: PlaybackService) {
    this.playbackService.onTimeLimit.subscribe(v => {
      this.sliderOptions = this.createSliderOption(v.min, v.max);
      this.currentTime = v.min;
    });
    this.playbackService.onTimeUpdate.subscribe(t => {
      this.currentTime = t;
      if (!this.isSliding) {
        this.sliderValue = t;
      }
    });
  }

  createSliderOption(min: number, max: number): Options {
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
}
