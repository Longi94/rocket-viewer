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
  sliderOptions: Options = this.createSliderOption(100);
  isSliding = false;

  constructor(private readonly playbackService: PlaybackService) {
    this.playbackService.onTimeLimit.subscribe(max => {
      this.sliderOptions = this.createSliderOption(max);
      this.currentTime = 0;
    });
    this.playbackService.onTimeUpdate.subscribe(t => {
      this.currentTime = t;
      if (!this.isSliding) {
        this.sliderValue = t;
      }
    });
  }

  createSliderOption(max: number): Options {
    return {
      animate: false,
      floor: 0,
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
