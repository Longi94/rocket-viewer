import { Component, OnInit } from '@angular/core';
import { BoxcarsService } from '../../../service/boxcars.service';
import { PlaybackService } from '../../../service/playback.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  replayLoaded = false;
  replayReady = false;
  dragging = false;
  errorMessage: string;

  constructor(private readonly boxcarsService: BoxcarsService,
              private readonly playbackService: PlaybackService) {
    this.boxcarsService.onResult.subscribe(result => {
      if (typeof result === 'string') {
        this.errorMessage = result;
      } else {
        this.replayLoaded = true;
      }
    });
    this.playbackService.onPlaybackInfo.subscribe(() => {
      this.replayReady = true;
    });
  }

  ngOnInit(): void {
  }

  onFileDrop($event: DragEvent) {
    $event.preventDefault();
    this.dragging = false;

    const file = $event.dataTransfer.files[0];
    this.boxcarsService.parse(file);
  }

  onFileSelect($event: Event) {
    const target = $event.target as HTMLInputElement;
    const file = target.files[0];
    this.boxcarsService.parse(file);
  }

  onDragEnter($event: DragEvent) {
    this.dragging = true;
  }

  onDragLeave($event: DragEvent) {
    this.dragging = false;
  }

  onDragOver($event: DragEvent) {
    $event.stopPropagation();
    $event.preventDefault();
  }
}
