import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Cache, Clock, DefaultLoadingManager } from 'three';
import { BoxcarsService } from '../../../service/boxcars.service';
import { Replay } from '../../../model/replay/replay';
import { SceneEvent, SceneManager } from '../../../scene/scene-manager';
import { PlaybackService } from '../../../service/playback.service';
import { environment } from '../../../../environments/environment';
import * as Stats from 'stats.js';
import { ThreeService } from '../../../service/three.service';

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
  isLoading = false;
  progress = {
    percent: 0,
    start: 0,
    total: 0,
    current: 0
  };

  isDebug = !environment.production;

  sceneManager = new SceneManager(this.isDebug);

  stats: Stats;
  clock = new Clock();

  constructor(private readonly boxcarsService: BoxcarsService,
              private readonly playbackService: PlaybackService,
              private readonly threeService: ThreeService) {
    this.boxcarsService.onResult.subscribe(replay => this.onReplayLoaded(replay));
    this.playbackService.onPlay.subscribe(() => this.sceneManager.play());
    this.playbackService.onPause.subscribe(() => this.sceneManager.pause());
    this.playbackService.onTimeScroll.subscribe(t => this.sceneManager.scrollToTime(t));
    this.playbackService.onSpeed.subscribe(t => this.sceneManager.setSpeed(t));
    this.playbackService.onCameraChange.subscribe(e => this.sceneManager.changeCamera(e.type, e.targetPlayer));
    this.playbackService.onEnterVr.subscribe(() => this.sceneManager.enterVr());
    this.playbackService.onLeaveVr.subscribe(() => this.sceneManager.leaveVr());
    this.playbackService.onCloseReplay.subscribe(() => this.sceneManager.unloadReplay());

    this.sceneManager.addEventListener(SceneEvent.TICK, event => {
      this.playbackService.updateTime({time: event.time, hudData: event.hudData});
    });
    this.sceneManager.addEventListener(SceneEvent.VR_ENTER, () => this.threeService.vrEntered());
    this.sceneManager.addEventListener(SceneEvent.VR_LEAVE, () => this.threeService.vrLeft());
    this.sceneManager.addEventListener(SceneEvent.RESET, () => this.threeService.sceneReset());

    Cache.enabled = true;
  }

  onReplayLoaded(replay: Replay | string) {
    if (typeof replay !== 'string') {
      this.resetProgress();
      this.isLoading = true;
      this.sceneManager.prepareReplay(replay).then(() => {
        this.isLoading = false;
        this.playbackService.setPlaybackInfo(this.sceneManager.playbackInfo);
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
      this.statsDiv.nativeElement.appendChild(this.stats.dom);
    }

    const width = this.canvasContainer.nativeElement.offsetWidth;
    const height = this.canvasContainer.nativeElement.offsetHeight;

    this.sceneManager.init(this.canvas.nativeElement, width, height).then(() => {
      this.isLoading = false;
      this.clock.start();
      this.sceneManager.renderer.setAnimationLoop(() => this.animate());
    }).catch(console.log);
  }

  private animate() {
    const time = this.clock.getElapsedTime();
    this.stats?.begin();
    this.resizeCanvas();
    this.sceneManager.render(time);
    this.stats?.end();
  }

  resizeCanvas() {
    const width = this.canvasContainer.nativeElement.offsetWidth;
    const height = this.canvasContainer.nativeElement.offsetHeight;

    if (this.canvas.nativeElement.width !== width || this.canvas.nativeElement.height !== height) {
      this.sceneManager.resize(width, height);
    }
  }

  private resetProgress() {
    this.progress.start = this.progress.current;
    this.progress.percent = 0;
  }
}
