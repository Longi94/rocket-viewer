import { Replay } from '../model/replay/replay';
import {
  AmbientLight,
  Color,
  DefaultLoadingManager,
  Object3D,
  PerspectiveCamera,
  Scene, Texture,
  TextureLoader,
  WebGLRenderer, WebGLRenderTarget, WebGLRenderTargetCube
} from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PromiseLoader, RocketConfig, TextureFormat } from 'rl-loadout-lib';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PMREMGenerator } from 'three/examples/jsm/pmrem/PMREMGenerator';
import { PMREMCubeUVPacker } from 'three/examples/jsm/pmrem/PMREMCubeUVPacker';

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

  private scene: Scene;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private controls: OrbitControls;
  private cubeRenderTarget: WebGLRenderTarget;
  private envMap: Texture;

  constructor() {
  }

  async init(canvasElement: HTMLCanvasElement, canvasContainerElement: HTMLDivElement) {

    const width = canvasContainerElement.offsetWidth;
    const height = canvasContainerElement.offsetHeight;
    this.camera = new PerspectiveCamera(70, width / height, 0.01, 10000);
    this.camera.position.x = 167.97478335547376;
    this.camera.position.y = 58.02658014964849;
    this.camera.position.z = -91.74632500987678;

    this.scene = new Scene();
    this.scene.background = new Color('#AAAAAA');

    this.renderer = new WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
      logarithmicDepthBuffer: true
    });
    this.renderer.setSize(width, height);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 10000;
    this.controls.update();

    this.addLights();

    const textureLoader = new PromiseLoader(new TextureLoader(DefaultLoadingManager));

    const backgroundTexture = await textureLoader.load('assets/background_space.jpg');
    this.processBackground(backgroundTexture);
  }

  private addLights() {
    const INTENSITY = 0.6;

    const ambient = new AmbientLight(0xFFFFFF, INTENSITY);
    this.scene.add(ambient);
  }

  private processBackground(backgroundTexture: Texture) {
    // @ts-ignore
    this.scene.background = new WebGLRenderTargetCube(1024, 1024).fromEquirectangularTexture(this.renderer, backgroundTexture);

    // @ts-ignore
    const pmremGenerator = new PMREMGenerator(this.scene.background.texture);
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
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  async prepareReplay(replay: Replay) {

  }

  render(time: number) {
    this.renderer.render(this.scene, this.camera);
  }
}
