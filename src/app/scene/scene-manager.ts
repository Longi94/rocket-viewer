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
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PromiseLoader, RocketConfig, TextureFormat } from 'rl-loadout-lib';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PMREMGenerator } from 'three/examples/jsm/pmrem/PMREMGenerator';
import { PMREMCubeUVPacker } from 'three/examples/jsm/pmrem/PMREMCubeUVPacker';
import { ActorHandler } from './actor/actor-handler';
import { loadMap } from './loader/map';
import { HANDLER_MAPPING } from './actor/mapping';
import { traverseMaterials } from 'rl-loadout-lib/dist/3d/object';
import { LOADER_MAPPING } from './loader/mapping';
import { ActorLoader } from './loader/actor';
import { ReplayScene } from './replay-scene';

const dracoLoader = new DRACOLoader(DefaultLoadingManager);
dracoLoader.setDecoderPath('/assets/draco/');
const gltfLoader = new GLTFLoader(DefaultLoadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

const ROCKET_CONFIG = new RocketConfig({
  loadingManager: DefaultLoadingManager,
  textureFormat: TextureFormat.PNG,
  useCompressedModels: true,
  gltfLoader
});

export class SceneManager {

  private readonly modelLoader = new PromiseLoader(gltfLoader);

  private rs: ReplayScene = new ReplayScene();

  private renderer: WebGLRenderer;
  private cubeRenderTarget: WebGLRenderTarget;
  private envMap: Texture;

  private actorHandlers: { [actorId: number]: ActorHandler } = {};

  replay: Replay;

  currentAnimationTime: number;
  currentTime: number;
  currentFrame: number;
  maxTime: number;
  realFrameTimes: number[];

  private isPlaying = false;

  // callbacks
  onTimeUpdate = (time: number) => {
  };

  constructor() {
  }

  async init(canvasElement: HTMLCanvasElement, canvasContainerElement: HTMLDivElement) {

    const width = canvasContainerElement.offsetWidth;
    const height = canvasContainerElement.offsetHeight;
    this.rs.camera = new PerspectiveCamera(70, width / height, 0.01, 10000);
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

    const backgroundTexture = await textureLoader.load('assets/background_space.jpg');
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
    this.envMap = this.cubeRenderTarget.texture;

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
    this.replay = replay;

    const objects = replay.objects;
    const names = replay.name;

    this.realFrameTimes = [];
    let total = 0;

    for (let i = 0; i < replay.network_frames.frames.length; i++) {
      const frame = replay.network_frames.frames[i];
      total += frame.delta;
      this.realFrameTimes.push(total);
    }

    const frame = replay.network_frames.frames[0];
    const loaders: ActorLoader[] = [];

    for (const newActor of frame.new_actors) {
      const objectName = objects[newActor.object_id];
      const handler = HANDLER_MAPPING[objectName];
      const loader = LOADER_MAPPING[objectName];

      if (loader != undefined) {
        loaders.push(loader);
      }

      if (handler == undefined) {
        continue;
      }

      if (!(newActor.actor_id in this.actorHandlers)) {
        this.actorHandlers[newActor.actor_id] = handler.create(this.rs);
      }
    }

    this.maxTime = total;
    this.currentTime = 0;
    this.currentFrame = 0;

    // Load necessary models
    const promises = loaders.map(h => h.load(this.modelLoader, this.rs.models));
    const actorPromises = Promise.all(promises);

    const map = replay.properties['MapName'];
    const mapPromise = loadMap(map, this.modelLoader);

    this.rs.models.map = (await mapPromise).scene;
    await actorPromises;

    traverseMaterials(this.rs.models.map, mat => {
      if (mat.isMeshStandardMaterial) {
        mat.envMap = this.envMap;
      }
    });

    this.rs.scene.add(this.rs.models.map);

    // Actors that are created in the first frame are immediately added the scene
    for (const newActor of replay.network_frames.frames[0].new_actors) {
      const actorHandler = this.actorHandlers[newActor.actor_id];
      if (actorHandler != undefined) {
        actorHandler.create(newActor);
      }
    }
  }

  render(time: number) {
    if (this.currentAnimationTime == undefined) {
      this.currentAnimationTime = time;
      this.renderer.render(this.rs.scene, this.rs.camera);
      return;
    }

    if (this.isPlaying) {
      const d = time - this.currentAnimationTime;
      this.currentTime += d / 1000.0;

      while (this.currentTime > this.realFrameTimes[this.currentFrame]) {
        this.currentFrame++;
      }

      this.onTimeUpdate(this.currentTime);
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
    this.currentTime = time;
  }
}
