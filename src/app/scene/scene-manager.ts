import { Replay } from '../model/replay/replay';
import {
  AmbientLight, Clock,
  Color,
  DefaultLoadingManager,
  DirectionalLight,
  DirectionalLightHelper,
  PerspectiveCamera,
  Scene,
  Texture,
  TextureLoader, Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  WebGLRenderTargetCube
} from 'three';
import { GlobalWebGLContext, PromiseLoader } from 'rl-loadout-lib';
import { PMREMGenerator } from 'three/examples/jsm/pmrem/PMREMGenerator';
import { PMREMCubeUVPacker } from 'three/examples/jsm/pmrem/PMREMCubeUVPacker';
import { loadMap } from './loader/map';
import { ReplayScene } from './replay-scene';
import { loadBall } from './loader/ball';
import { setFromQuaternion } from '../util/three';
import { AnimationManager } from './anim/animation-manager';
import { loadCar } from './loader/car';
import { CameraManager } from './camera/camera-manager';
import { CameraType } from './camera/camera-type';
import { PlaybackInfo, PlayerPlaybackInfo } from '../model/playback-info';

export class SceneManager {

  rs: ReplayScene = new ReplayScene();

  private renderer: WebGLRenderer;
  private cubeRenderTarget: WebGLRenderTarget;

  animationManager: AnimationManager;
  cameraManager: CameraManager;

  currentAnimationTime: number;
  currentTime: number;
  currentFrame: number;

  playbackInfo: PlaybackInfo = new PlaybackInfo();

  private isPlaying = false;
  private playbackSpeed = 1;

  private clock = new Clock(false);

  // callbacks
  onTimeUpdate = (time: number) => {
  };

  constructor(private readonly debug = false) {
  }

  async init(canvasElement: HTMLCanvasElement, canvasContainerElement: HTMLDivElement) {

    const width = canvasContainerElement.offsetWidth;
    const height = canvasContainerElement.offsetHeight;
    const camera = new PerspectiveCamera(100, width / height, 0.01, 100000);
    camera.position.x = 1679.7478335547376;
    camera.position.y = 580.2658014964849;
    camera.position.z = -917.4632500987678;

    this.cameraManager = new CameraManager(camera);

    this.rs.scene = new Scene();
    this.rs.scene.background = new Color('#AAAAAA');

    this.renderer = new WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
      logarithmicDepthBuffer: true
    });
    this.renderer.setSize(width, height);

    this.addLights();

    const textureLoader = new PromiseLoader(new TextureLoader(DefaultLoadingManager));

    const backgroundTexture = await textureLoader.load('assets/Nebula_02.jpg');
    this.processBackground(backgroundTexture);
  }

  private addLights() {
    const ambient = new AmbientLight(0xFFFFFF, 0.6);
    this.rs.scene.add(ambient);

    const dirLight1 = new DirectionalLight(0xffffff, 1);
    const dirLight2 = new DirectionalLight(0xffffff, 1);

    dirLight1.position.z = 5000;
    dirLight1.position.y = 2000;
    dirLight1.position.x = 1000;

    dirLight2.position.z = -5000;
    dirLight2.position.y = 1000;
    dirLight2.position.x = -1500;

    this.rs.scene.add(dirLight1);
    this.rs.scene.add(dirLight2);

    if (this.debug) {
      const helper1 = new DirectionalLightHelper(dirLight1, 1000, 0xff0000);
      const helper2 = new DirectionalLightHelper(dirLight2, 1000, 0x00ff00);

      this.rs.scene.add(helper1);
      this.rs.scene.add(helper2);
    }
  }

  private processBackground(backgroundTexture: Texture) {
    // @ts-ignore
    this.rs.scene.background = new WebGLRenderTargetCube(1024, 1024).fromEquirectangularTexture(this.renderer, backgroundTexture);

    // @ts-ignore
    const pmremGenerator = new PMREMGenerator(this.rs.scene.background.texture);
    pmremGenerator.update(this.renderer);
    const pmremCubeUVPacker = new PMREMCubeUVPacker(pmremGenerator.cubeLods);
    pmremCubeUVPacker.update(this.renderer);
    this.cubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;
    this.rs.envMap = this.cubeRenderTarget.texture;

    backgroundTexture.dispose();
    pmremGenerator.dispose();
    pmremCubeUVPacker.dispose();
  }

  resizeCanvas(canvasElement: HTMLCanvasElement, canvasContainerElement: HTMLDivElement) {
    const width = canvasContainerElement.offsetWidth;
    const height = canvasContainerElement.offsetHeight;

    if (canvasElement.width !== width || canvasElement.height !== height) {
      this.renderer.setSize(width, height, false);
      this.cameraManager.resize(width, height);
    }
  }

  async prepareReplay(replay: Replay) {
    this.rs.replay = replay;

    this.playbackInfo.players = Object.values(this.rs.replay.frame_data.players).map(PlayerPlaybackInfo.from);
    this.playbackInfo.minTime = 0;
    this.playbackInfo.maxTime = replay.frame_data.ball_data.position_times[replay.frame_data.ball_data.position_times.length - 1];
    this.currentTime = this.playbackInfo.minTime;
    this.currentFrame = 0;

    if (this.debug) {
      for (const player of Object.values(replay.frame_data.players)) {
        this.playerFrames[player.id] = 0;
      }
    }

    // Load necessary models

    const map = replay.properties['MapName'];
    const mapPromise = loadMap(map, this.rs);
    const ballPromise = loadBall(replay.frame_data.ball_data.ball_type, this.rs);
    const playerPromises = Object.values(replay.frame_data.players).map(player => loadCar(player, this.rs));

    await mapPromise;
    await ballPromise;
    await Promise.all(playerPromises);

    GlobalWebGLContext.dispose();

    this.rs.scene.add(this.rs.models.map);
    this.rs.scene.add(this.rs.models.ball);

    this.rs.models.ball.position.x = replay.frame_data.ball_data.positions[0];
    this.rs.models.ball.position.y = replay.frame_data.ball_data.positions[1];
    this.rs.models.ball.position.z = replay.frame_data.ball_data.positions[2];
    setFromQuaternion(this.rs.models.ball.rotation, replay.frame_data.ball_data.rotations);

    for (const playerId in this.rs.models.players) {
      const body = this.rs.models.players[playerId];
      body.addToScene(this.rs.scene);
      body.scene.position.x = replay.frame_data.players[playerId].positions[0];
      body.scene.position.y = replay.frame_data.players[playerId].positions[1];
      body.scene.position.z = replay.frame_data.players[playerId].positions[2];

      body.scene.quaternion.x = replay.frame_data.players[playerId].rotations[0];
      body.scene.quaternion.y = replay.frame_data.players[playerId].rotations[1];
      body.scene.quaternion.z = replay.frame_data.players[playerId].rotations[2];
      body.scene.quaternion.w = replay.frame_data.players[playerId].rotations[3];
    }

    this.cameraManager.setCamera(CameraType.PLAYER_VIEW, Object.values(this.rs.models.players)[0].scene);
    this.cameraManager.update(this.rs);
    this.animationManager = new AnimationManager(replay.frame_data, this.rs, this.debug);
  }

  render(time: number) {

    if (this.currentAnimationTime == undefined) {
      this.currentAnimationTime = time;
      this.cameraManager.update(this.rs);
      this.renderer.render(this.rs.scene, this.cameraManager.getCamera());
      return;
    }

    if (this.isPlaying) {
      const d = this.clock.getDelta();
      this.currentTime += d * this.playbackSpeed;

      while (this.currentTime > this.rs.replay.frame_data.times[this.currentFrame + 1]) {
        this.currentFrame++;
      }

      if (this.debug) {
        while (this.currentTime > this.rs.replay.frame_data.ball_data.position_times[this.ballFrame + 1]) {
          this.ballFrame++;
        }

        for (const playerId of Object.keys(this.rs.replay.frame_data.players)) {
          while (this.currentTime > this.rs.replay.frame_data.players[playerId].position_times[this.playerFrames[playerId] + 1]) {
            this.playerFrames[playerId]++;
          }
        }
      }

      this.onTimeUpdate(this.currentTime);

      this.animationManager?.update(this.currentTime);
      this.cameraManager.update(this.rs);
    }
    this.renderer.render(this.rs.scene, this.cameraManager.getCamera());
    this.currentAnimationTime = time;
  }

  play() {
    this.isPlaying = true;
    this.clock.start();
  }

  pause() {
    this.isPlaying = false;
    this.clock.stop();
  }

  scrollToTime(time: number) {

    if (time > this.currentTime) {
      while (time > this.rs.replay.frame_data.times[this.currentFrame + 1]) {
        this.currentFrame++;
      }

      if (this.debug) {
        while (time > this.rs.replay.frame_data.ball_data.position_times[this.ballFrame + 1]) {
          this.ballFrame++;
        }

        for (const playerId of Object.keys(this.rs.replay.frame_data.players)) {
          while (time > this.rs.replay.frame_data.players[playerId].position_times[this.playerFrames[playerId] + 1]) {
            this.playerFrames[playerId]++;
          }
        }
      }

    } else if (time < this.currentTime) {
      while (time < this.rs.replay.frame_data.times[this.currentFrame - 1]) {
        this.currentFrame--;
      }

      if (this.debug) {
        while (time < this.rs.replay.frame_data.ball_data.position_times[this.ballFrame - 1]) {
          this.ballFrame--;
        }

        for (const playerId of Object.keys(this.rs.replay.frame_data.players)) {
          while (time < this.rs.replay.frame_data.players[playerId].position_times[this.playerFrames[playerId] - 1]) {
            this.playerFrames[playerId]--;
          }
        }
      }
    }

    this.currentTime = time;
    this.animationManager?.update(this.currentTime);
  }

  setSpeed(speed: number) {
    this.playbackSpeed = speed;
  }

  changeCamera(type: CameraType, targetPlayer?: number) {
    if (targetPlayer == undefined) {
      this.cameraManager.setCamera(type);
    } else {
      this.cameraManager.setCamera(type, this.rs.models.players[targetPlayer].scene);
    }
  }

  // anything down here is for debug purposes only
  ballFrame = 0;
  v1 = new Vector3();
  v2 = new Vector3();

  playerFrames: { [id: number]: number } = {};

  getBallSpeed(): number {
    const ballData = this.rs.replay.frame_data.ball_data;
    const dt = ballData.position_times[this.ballFrame + 1] - ballData.position_times[this.ballFrame];
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
    const playerData = this.rs.replay.frame_data.players[id];
    const dt = playerData.position_times[this.playerFrames[id] + 1] - playerData.position_times[this.playerFrames[id]];
    this.v1.x = playerData.positions[this.playerFrames[id] * 3];
    this.v1.y = playerData.positions[this.playerFrames[id] * 3 + 1];
    this.v1.z = playerData.positions[this.playerFrames[id] * 3 + 2];
    this.v2.x = playerData.positions[(this.playerFrames[id] + 1) * 3];
    this.v2.y = playerData.positions[(this.playerFrames[id] + 1) * 3 + 1];
    this.v2.z = playerData.positions[(this.playerFrames[id] + 1) * 3 + 2];
    const ds = this.v1.distanceTo(this.v2);
    return ds / dt;
  }
}
