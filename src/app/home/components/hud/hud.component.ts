import { Component, OnInit } from '@angular/core';
import { PlaybackService } from '../../../service/playback.service';

@Component({
  selector: 'app-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss']
})
export class HudComponent implements OnInit {

  scoreBlue = 0;
  scoreOrange = 0;
  minutes = 5;
  seconds = 0;

  constructor(private readonly playbackService: PlaybackService) {
    this.playbackService.onTimeUpdate.subscribe(tick => {
      this.scoreBlue = tick.hudData.scoreBlue;
      this.scoreOrange = tick.hudData.scoreOrange;
      this.minutes = Math.floor(tick.hudData.remainingSeconds / 60);
      this.seconds = tick.hudData.remainingSeconds % 60;
    });
  }

  ngOnInit(): void {
  }

}
