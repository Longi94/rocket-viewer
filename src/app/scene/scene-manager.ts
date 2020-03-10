import { Replay } from '../model/replay/replay';
import {
  AmbientLight,
  Color,
  DefaultLoadingManager,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Texture,
  TextureLoader,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three';
import { GlobalWebGLContext, PromiseLoader } from 'rl-loadout-lib';
import { loadMap } from './loader/map';
import { ReplayScene } from './replay-scene';
import { loadBall } from './loader/ball';
import { AnimationManager } from './anim/animation-manager';
import { loadCar } from './loader/car';
import { CameraManager } from './camera/camera-manager';
import { CameraType } from './camera/camera-type';
import { PlaybackInfo, PlayerPlaybackInfo } from '../model/playback-info';
import { loadBoostTexture } from './loader/boost';
import { ParticleSystemManager } from './particle-system-manager';
import { loadJumpSprite } from './loader/jump';
import { loadBoostPadModels } from './loader/boost-pad';
import { getBoosts } from '../model/boost-pad';
import { BoostPadActor } from './actor/boost-pad';
import { modelLoader } from './loader/loader-config';
import { loadDemoSprite } from './loader/demo';
import { advanceFrame } from '../util/util';
import { HudData } from '../model/hud-data';

export class SceneManager {

  rs: ReplayScene = new ReplayScene();

  renderer: WebGLRenderer;
  private cubeRenderTarget: WebGLRenderTarget;

  private renderRequested = false;

  animationManager: AnimationManager;
  cameraManager: CameraManager;
  particleSystemManager: ParticleSystemManager;

  currentAnimationTime: number;
  currentTime: number;
  currentFrame: number;
  frameCount = 0;

  playbackInfo: PlaybackInfo = new PlaybackInfo();

  private isPlaying = false;
  private playbackSpeed = 1;

  // anything down here is for debug purposes only
  ballFrame = 0;
  v1 = new Vector3();
  v2 = new Vector3();

  playerFrames: { [id: number]: number } = {};

  // VR stuff
  inVR = false;
  vrSession: any;
  vrEndListener = () => {
    this.inVR = false;
    this.vrSession.removeEventListener('end', this.vrEndListener);
    this.vrSession = undefined;
    if (this.onVrLeave) {
      this.onVrLeave();
    }
  };

  // callbacks
  onTimeUpdate(_time: number, _hudData: HudData) {
  }

  onVrEnter: () => void;
  onVrLeave: () => void;

  constructor(private readonly debug = false) {
  }

  async init(canvas: HTMLCanvasElement, width: number, height: number) {

    this.rs.camera = new PerspectiveCamera(80, width / height, 0.01, 100000);

    this.rs.scene = new Scene();
    this.rs.scene.background = new Color('#AAAAAA');

    this.cameraManager = new CameraManager(this.rs.scene, this.rs.camera, canvas);
    this.cameraManager.onMove = () => {
      this.requestRender();
    };

    this.renderer = new WebGLRenderer({canvas, antialias: true, logarithmicDepthBuffer: true});
    this.renderer.setSize(width, height);
    this.renderer.xr.enabled = true;
    this.renderer.xr.setReferenceSpaceType('local');

    this.particleSystemManager = new ParticleSystemManager(this.renderer, this.rs.scene);

    this.addLights();

    const textureLoader = new PromiseLoader(new TextureLoader(DefaultLoadingManager));

    const backgroundTexture = await textureLoader.load('assets/Nebula_02.jpg');
    this.processBackground(backgroundTexture);
    this.requestRender();
  }

  private addLights() {
    const ambient = new AmbientLight(0xFFFFFF, 0.6);
    this.rs.scene.add(ambient);
  }

  private processBackground(backgroundTexture: Texture) {
    // @ts-ignore
    this.rs.scene.background = new WebGLCubeRenderTarget(1024).fromEquirectangularTexture(this.renderer, backgroundTexture);

    // @ts-ignore
    const pmremGenerator = new PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    this.cubeRenderTarget = pmremGenerator.fromEquirectangular(backgroundTexture);
    this.rs.envMap = this.cubeRenderTarget.texture;
    modelLoader.envMap = this.cubeRenderTarget.texture;

    backgroundTexture.dispose();
    pmremGenerator.dispose();
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.cameraManager.resize(width, height);
    this.requestRender();
  }

  async prepareReplay(replay: Replay) {
    this.rs.replay = replay;

    this.playbackInfo.players = Object.values(this.rs.replay.frame_data.players).map(PlayerPlaybackInfo.from);
    this.playbackInfo.minTime = 0;
    this.playbackInfo.maxTime = replay.frame_data.ball_data.body_states.times[replay.frame_data.ball_data.body_states.times.length - 1];
    this.currentTime = this.playbackInfo.minTime;
    this.frameCount = this.rs.replay.frame_data.times.length;
    this.currentFrame = 0;

    if (this.debug) {
      for (const player of Object.values(replay.frame_data.players)) {
        this.playerFrames[player.id] = 0;
      }
    }

    // Load necessary models

    const map = replay.properties.MapName;
    const mapPromise = loadMap(map, this.rs);
    const ballPromise = loadBall(replay.frame_data.ball_data.ball_type, this.rs);
    const playerPromises = Object.values(replay.frame_data.players).map(player => loadCar(player, this.rs));

    await loadBoostTexture(this.rs);
    await loadJumpSprite(this.rs);
    await loadBoostPadModels(this.rs);
    await loadDemoSprite(this.rs);
    await mapPromise;
    await ballPromise;
    await Promise.all(playerPromises);

    GlobalWebGLContext.dispose();

    // add the map
    this.rs.scene.add(this.rs.models.map);

    // add the boostpads
    const boostPads = getBoosts(map);
    for (const boostPad of getBoosts(map)) {
      const boostPadActor = BoostPadActor.create(boostPad, this.rs.models.bigBoostPad, this.rs.models.smallBoostPad);
      boostPadActor.addToScene(this.rs.scene);
      this.rs.boostPads.push(boostPadActor);
    }

    // add the ball to the starting position
    this.rs.ballActor.setPositionFromArray(replay.frame_data.ball_data.body_states.positions, 0);
    this.rs.ballActor.setQuaternionFromArray(replay.frame_data.ball_data.body_states.rotations, 0);
    this.rs.ballActor.addToScene(this.rs.scene);

    // add the players to their starting position
    for (const playerId of Object.keys(this.rs.players)) {
      const player = this.rs.players[playerId];
      player.setPositionFromArray(replay.frame_data.players[playerId].body_states.positions, 0);
      player.setQuaternionFromArray(replay.frame_data.players[playerId].body_states.rotations, 0);
      player.createBoost(this.particleSystemManager.createEmitter(),
        this.rs.boostSprite, this.rs.camera, this.renderer, replay.frame_data.players[playerId].team);
      player.setJumpSprite(this.rs.jumpMaterial);
      player.setDemoSprite(this.rs.demoTexture);
      player.addToScene(this.rs.scene);
    }

    this.cameraManager.setCamera(CameraType.PLAYER_VIEW, Object.values(this.rs.players)[0]);
    this.animationManager = new AnimationManager(replay.frame_data, this.rs, boostPads, this.debug);
    this.update();
    this.cameraManager.update(this.currentAnimationTime, this.rs);
    this.updateNameplates();
    this.requestRender();
  }

  private update(isUserInput = false) {
    this.animationManager?.update(this.currentTime);
    this.rs.ballActor.update(this.currentTime, isUserInput);
    for (const playerActor of Object.values(this.rs.players)) {
      playerActor.update(this.currentTime, isUserInput);
    }
    this.particleSystemManager.update(this.currentTime);
  }

  private updateNameplates() {
    for (const player of Object.values(this.rs.players)) {
      player.updateNameplate(this.rs.camera);
    }
  }

  requestRender() {
    if (!this.renderRequested) {
      this.renderRequested = true;
    }
  }

  render(time: number) {

    if (this.currentAnimationTime == undefined) {
      this.currentAnimationTime = time;
      this.cameraManager.update(time, this.rs);
      this.updateNameplates();
      this.renderer.render(this.rs.scene, this.cameraManager.getCamera());
      return;
    }

    if (this.isPlaying) {
      const d = time - this.currentAnimationTime;
      this.currentTime += d * this.playbackSpeed;

      if (this.currentTime >= this.playbackInfo.maxTime) {
        this.currentTime = this.playbackInfo.maxTime;
        this.pause();
      }

      while (this.currentFrame < this.frameCount - 1 &&
      this.currentTime > this.rs.replay.frame_data.real_times[this.currentFrame + 1]) {
        this.currentFrame++;
      }

      if (this.debug) {
        while (this.currentTime > this.rs.replay.frame_data.ball_data.body_states.times[this.ballFrame + 1]) {
          this.ballFrame++;
        }

        for (const playerId of Object.keys(this.rs.replay.frame_data.players)) {
          while (this.currentTime > this.rs.replay.frame_data.players[playerId].body_states.times[this.playerFrames[playerId] + 1]) {
            this.playerFrames[playerId]++;
          }
        }
      }

      this.onTimeUpdate(this.currentTime, this.rs.hudData);
      this.update();
    }
    this.cameraManager.update(time, this.rs);
    this.updateNameplates();

    if (this.inVR || this.renderRequested || this.isPlaying) {
      this.renderRequested = false;
      this.renderer.render(this.rs.scene, this.cameraManager.getCamera());
    }

    this.currentAnimationTime = time;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  scrollToTime(time: number) {
    this.currentFrame = advanceFrame(this.currentFrame, this.currentTime, time, this.rs.replay.frame_data.real_times);
    this.updateDebugFrames(time);

    this.currentTime = time;
    this.update(true);
    this.cameraManager.update(time, this.rs);
    this.updateNameplates();
    this.onTimeUpdate(this.currentTime, this.rs.hudData);
    this.requestRender();
  }

  updateDebugFrames(time: number) {
    if (this.debug) {
      this.ballFrame = advanceFrame(this.ballFrame, this.currentTime, time, this.rs.replay.frame_data.ball_data.body_states.times);
      for (const playerId of Object.keys(this.rs.replay.frame_data.players)) {
        this.playerFrames[playerId] = advanceFrame(this.playerFrames[playerId], this.currentTime, time, this.rs.replay.frame_data.players[playerId].body_states.times);
      }
    }
  }

  setSpeed(speed: number) {
    this.playbackSpeed = speed;
  }

  changeCamera(type: CameraType, targetPlayer?: number) {
    if (targetPlayer == undefined) {
      this.cameraManager.setCamera(type);
    } else {
      this.cameraManager.setCamera(type, this.rs.players[targetPlayer]);
    }
  }

  getBallSpeed(): number {
    const ballData = this.rs.replay.frame_data.ball_data.body_states;
    const dt = ballData.times[this.ballFrame + 1] - ballData.times[this.ballFrame];
    this.v1.x = ballData.positions[this.ballFrame * 3];
    this.v1.y = ballData.positions[this.ballFrame * 3 + 1];
    this.v1.z = ballData.positions[this.ballFrame * 3 + 2];
    this.v2.x = ballData.positions[(this.ballFrame + 1) * 3];
    this.v2.y = ballData.positions[(this.ballFrame + 1) * 3 + 1];
    this.v2.z = ballData.positions[(this.ballFrame + 1) * 3 + 2];
    const ds = this.v1.distanceTo(this.v2);
    return ds / dt;
  }

  getPlayerSpeed(id: number) {
    const playerData = this.rs.replay.frame_data.players[id].body_states;
    const dt = playerData.times[this.playerFrames[id] + 1] - playerData.times[this.playerFrames[id]];
    this.v1.x = playerData.positions[this.playerFrames[id] * 3];
    this.v1.y = playerData.positions[this.playerFrames[id] * 3 + 1];
    this.v1.z = playerData.positions[this.playerFrames[id] * 3 + 2];
    this.v2.x = playerData.positions[(this.playerFrames[id] + 1) * 3];
    this.v2.y = playerData.positions[(this.playerFrames[id] + 1) * 3 + 1];
    this.v2.z = playerData.positions[(this.playerFrames[id] + 1) * 3 + 2];
    const ds = this.v1.distanceTo(this.v2);
    return ds / dt;
  }

  enterVr() {
    if (this.vrSession == undefined) {
      const sessionInit = {optionalFeatures: ['local-floor', 'bounded-floor']};
      navigator.xr.requestSession('immersive-vr', sessionInit).then(session => {
        this.cameraManager.setCamera(CameraType.VR_PLAYER_VIEW, Object.values(this.rs.players)[0]);
        this.inVR = true;
        this.renderer.xr.setSession(session);
        this.vrSession = session;
        session.addEventListener('end', this.vrEndListener);
        if (this.onVrEnter) {
          this.onVrEnter();
        }
      });
    }
  }

  leaveVr() {
    if (this.vrSession != undefined) {
      this.vrSession.end();
    }
  }
}
