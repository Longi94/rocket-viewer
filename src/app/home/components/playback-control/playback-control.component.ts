import { Component, OnInit } from '@angular/core';
import { PlaybackService } from '../../../service/playback.service';

@Component({
  selector: 'app-playback-control',
  templateUrl: './playback-control.component.html',
  styleUrls: ['./playback-control.component.scss']
})
export class PlaybackControlComponent implements OnInit {

  isPlaying = false;

  currentTime: number;
  maxTime: number;
  minTime: number;

  constructor(private readonly playbackService: PlaybackService) {
    this.playbackService.onTimeLimit.subscribe(v => {
      this.maxTime = v.max;
      this.minTime = v.min;
      this.currentTime = v.min;
    });
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
}
