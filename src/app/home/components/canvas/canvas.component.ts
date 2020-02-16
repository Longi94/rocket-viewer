import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Cache, DefaultLoadingManager } from 'three';
import { BoxcarsService } from '../../../service/boxcars.service';
import { Replay } from '../../../model/replay/replay';
import { SceneManager } from '../../../scene/scene-manager';
import { PlaybackService } from '../../../service/playback.service';
import { environment } from '../../../../environments/environment';
import * as Stats from 'stats.js';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {

  @ViewChild('canvas', {static: true})
  canvas: ElementRef<HTMLCanvasElement>;

  @ViewChild('canvasContainer', {static: true})
  canvasContainer: ElementRef<HTMLDivElement>;

  @ViewChild('statsDiv', {static: true})
  statsDiv: ElementRef<HTMLDivElement>;

  // Loading stuff
  isLoading = true;
  progress = {
    percent: 0,
    start: 0,
    total: 0,
    current: 0
  };

  isDebug = !environment.production;

  sceneManager = new SceneManager(this.isDebug);

  stats: Stats;

  constructor(private readonly boxcarsService: BoxcarsService,
              private readonly playbackService: PlaybackService) {
    this.boxcarsService.onResult.subscribe(replay => this.onReplayLoaded(replay));
    this.playbackService.onPlay.subscribe(() => this.sceneManager.play());
    this.playbackService.onPause.subscribe(() => this.sceneManager.pause());
    this.playbackService.onTimeScroll.subscribe(t => this.sceneManager.scrollToTime(t));
    this.playbackService.onSpeed.subscribe(t => this.sceneManager.setSpeed(t));

    this.sceneManager.onTimeUpdate = time => this.playbackService.updateTime(time);

    Cache.enabled = true;
  }

  onReplayLoaded(replay: Replay | string) {
    if (typeof replay !== 'string') {
      this.resetProgress();
      this.isLoading = true;
      this.sceneManager.prepareReplay(replay).then(() => {
        this.isLoading = false;
        this.playbackService.setLimits(this.sceneManager.maxTime);
      });
    }
  }

  ngOnInit() {
    DefaultLoadingManager.onProgress = (item, loaded, total) => {
      this.progress.total = total;
      this.progress.current = loaded;

      this.progress.percent = 100 * (this.progress.current - this.progress.start) /
        (this.progress.total - this.progress.start);
    };

    if (this.isDebug) {
      this.stats = new Stats();
      this.stats.dom.style.removeProperty('left');
      this.stats.dom.style.right = 0;
      this.statsDiv.nativeElement.appendChild(this.stats.dom);
    }

    this.sceneManager.init(this.canvas.nativeElement, this.canvasContainer.nativeElement).then(() => {
      this.isLoading = false;
      requestAnimationFrame(t => this.animate(t));
    }).catch(console.log);
  }

  private animate(time: number) {
    requestAnimationFrame(t => this.animate(t));

    this.stats?.begin();
    this.sceneManager.resizeCanvas(this.canvas.nativeElement, this.canvasContainer.nativeElement);
    this.sceneManager.render(time);
    this.stats?.end();
  }

  private resetProgress() {
    this.progress.start = this.progress.current;
    this.progress.percent = 0;
  }
}
