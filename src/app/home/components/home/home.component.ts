import { Component, OnInit } from '@angular/core';
import { BoxcarsService } from '../../../service/boxcars.service';
import { PlaybackService } from '../../../service/playback.service';
import { ThreeService } from '../../../service/three.service';
import { MatDialog } from '@angular/material/dialog';
import { AboutComponent } from '../about/about.component';

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
  inVr = false;

  constructor(private readonly boxcarsService: BoxcarsService,
              private readonly playbackService: PlaybackService,
              private readonly threeService: ThreeService,
              private dialog: MatDialog) {
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
    this.threeService.onVrEnter.subscribe(() => this.inVr = true);
    this.threeService.onVrLeave.subscribe(() => this.inVr = false);
    this.threeService.onSceneReset.subscribe(() => {
      this.replayLoaded = false;
      this.replayReady = false;
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

  leaveVr() {
    this.playbackService.leaveVr();
  }

  openAbout() {
    this.dialog.open(AboutComponent, {width: '400px'});
  }
}
