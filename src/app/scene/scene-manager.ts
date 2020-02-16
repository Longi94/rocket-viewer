import { Replay } from '../model/replay/replay';
import {
  AmbientLight,
  Color,
  DefaultLoadingManager,
  PerspectiveCamera,
  Scene, Texture,
  TextureLoader,
  WebGLRenderer,
  WebGLRenderTarget,
  WebGLRenderTargetCube
} from 'three';
import { PromiseLoader, GlobalWebGLContext } from 'rl-loadout-lib';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PMREMGenerator } from 'three/examples/jsm/pmrem/PMREMGenerator';
import { PMREMCubeUVPacker } from 'three/examples/jsm/pmrem/PMREMCubeUVPacker';
import { loadMap } from './loader/map';
import { ReplayScene } from './replay-scene';
import { loadBall } from './loader/ball';
import { setFromQuaternion } from '../util/three';
import { AnimationManager } from './anim/animation-manager';
import { loadCar } from './loader/car';

export class SceneManager {

  rs: ReplayScene = new ReplayScene();

  private renderer: WebGLRenderer;
  private cubeRenderTarget: WebGLRenderTarget;

  animationManager: AnimationManager;

  currentAnimationTime: number;
  currentTime: number;
  currentFrame: number;
  maxTime: number;
  realFrameTimes: number[];

  private isPlaying = false;
  private playbackSpeed = 1;

  // callbacks
  onTimeUpdate = (time: number) => {
  };

  constructor() {
  }

  async init(canvasElement: HTMLCanvasElement, canvasContainerElement: HTMLDivElement) {

    const width = canvasContainerElement.offsetWidth;
    const height = canvasContainerElement.offsetHeight;
    this.rs.camera = new PerspectiveCamera(70, width / height, 0.01, 100000);
    this.rs.camera.position.x = 1679.7478335547376;
    this.rs.camera.position.y = 580.2658014964849;
    this.rs.camera.position.z = -917.4632500987678;

    this.rs.scene = new Scene();
    this.rs.scene.background = new Color('#AAAAAA');

    this.renderer = new WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
      logarithmicDepthBuffer: true
    });
    this.renderer.setSize(width, height);

    this.rs.controls = new OrbitControls(this.rs.camera, this.renderer.domElement);
    this.rs.controls.enablePan = false;
    this.rs.controls.minDistance = 100;
    this.rs.controls.maxDistance = 10000;
    this.rs.controls.update();

    this.addLights();

    const textureLoader = new PromiseLoader(new TextureLoader(DefaultLoadingManager));

    const backgroundTexture = await textureLoader.load('assets/Nebula_02.jpg');
    this.processBackground(backgroundTexture);
  }

  private addLights() {
    const INTENSITY = 0.6;

    const ambient = new AmbientLight(0xFFFFFF, INTENSITY);
    this.rs.scene.add(ambient);
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
      this.rs.camera.aspect = width / height;
      this.rs.camera.updateProjectionMatrix();
    }
  }

  async prepareReplay(replay: Replay) {
    this.rs.replay = replay;

    this.realFrameTimes = [];
    let total = 0;

    for (let i = 0; i < replay.frame_data.deltas.length; i++) {
      const delta = replay.frame_data.deltas[i];
      total += delta;
      this.realFrameTimes.push(total);
    }

    this.maxTime = total;
    this.currentTime = 0;
    this.currentFrame = 0;

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

    this.animationManager = new AnimationManager(this.realFrameTimes, replay.frame_data, this.rs);
  }

  render(time: number) {
    if (this.currentAnimationTime == undefined) {
      this.currentAnimationTime = time;
      this.renderer.render(this.rs.scene, this.rs.camera);
      return;
    }

    if (this.isPlaying) {
      const d = time - this.currentAnimationTime;
      this.currentTime += d * this.playbackSpeed / 1000.0;

      while (this.currentTime > this.realFrameTimes[this.currentFrame + 1]) {
        this.currentFrame++;
      }
      this.onTimeUpdate(this.currentTime);

      this.animationManager?.update(this.currentTime);
    }
    this.renderer.render(this.rs.scene, this.rs.camera);
    this.currentAnimationTime = time;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  scrollToTime(time: number) {

    if (time > this.currentTime) {
      while (time > this.realFrameTimes[this.currentFrame + 1]) {
        this.currentFrame++;
      }
    } else if (time < this.currentTime) {
      while (time < this.realFrameTimes[this.currentFrame - 1]) {
        this.currentFrame--;
      }
    }

    this.currentTime = time;
    this.animationManager?.update(this.currentTime);
  }

  setSpeed(speed: number) {
    this.playbackSpeed = speed;
  }
}
