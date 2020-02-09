import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {
  AmbientLight,
  Color,
  DefaultLoadingManager, Object3D,
  PerspectiveCamera,
  Scene,
  SpotLight,
  Texture, TextureLoader,
  WebGLRenderer, WebGLRenderTarget, WebGLRenderTargetCube
} from 'three';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import {
  RocketConfig,
  TextureFormat,
  PaintConfig,
  DEFAULT_BLUE_TEAM,
  DEFAULT_ACCENT, PromiseLoader
} from 'rl-loadout-lib';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {PMREMCubeUVPacker} from 'three/examples/jsm/pmrem/PMREMCubeUVPacker';
import {PMREMGenerator} from 'three/examples/jsm/pmrem/PMREMGenerator';

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

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {

  @ViewChild('canvas', {static: true})
  canvas: ElementRef;

  @ViewChild('canvasContainer', {static: true})
  canvasContainer: ElementRef;

  @ViewChild('dgContainer', {static: true})
  dgContainer: ElementRef;

  private camera: PerspectiveCamera;
  private scene: Scene;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private cubeRenderTarget: WebGLRenderTarget;
  private envMap: Texture;

  // Loading stuff
  mathRound = Math.round;
  initializing = true;
  progress = {
    percent: 0,
    start: 0,
    total: 0,
    current: 0
  };

  paintConfig: PaintConfig = {
    primary: new Color(DEFAULT_BLUE_TEAM),
    accent: new Color(DEFAULT_ACCENT)
  };

  modelLoader = new PromiseLoader(gltfLoader);

  constructor() {
  }

  ngOnInit() {
    DefaultLoadingManager.onProgress = (item, loaded, total) => {
      this.progress.total = total;
      this.progress.current = loaded;

      this.progress.percent = 100 * (this.progress.current - this.progress.start) /
        (this.progress.total - this.progress.start);
    };

    const width = this.canvasContainer.nativeElement.offsetWidth;
    const height = this.canvasContainer.nativeElement.offsetHeight;
    this.camera = new PerspectiveCamera(70, width / height, 0.01, 10000);
    this.camera.position.x = 167.97478335547376;
    this.camera.position.y = 58.02658014964849;
    this.camera.position.z = -91.74632500987678;

    this.scene = new Scene();
    this.scene.background = new Color('#AAAAAA');

    this.renderer = new WebGLRenderer({
      canvas: this.canvas.nativeElement,
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

    requestAnimationFrame(t => this.animate(t));

    const textureLoader = new PromiseLoader(new TextureLoader(DefaultLoadingManager));

    const promises = [
      textureLoader.load('assets/background_space.jpg'),
      this.modelLoader.load('assets/models/HoopsStadium_P.draco.glb'),
      this.modelLoader.load('assets/models/basketball.draco.glb')
    ];

    Promise.all(promises).then(values => {
      this.processBackground(values[0]);
      this.initializing = false;

      this.scene.add(values[1].scene);

      (values[2].scene as Object3D).position.y = 92.75;
      this.scene.add(values[2].scene);
    }).catch(error => {
      console.error(error);
    });
  }

  private addLights() {
    const INTENSITY = 0.6;
    // const ANGLE = Math.PI / 4;

    const ambient = new AmbientLight(0xFFFFFF, INTENSITY);
    this.scene.add(ambient);

    // const light0 = new SpotLight(0xFFFFFF, INTENSITY, 300, ANGLE); // soft white light
    // light0.position.set(100, 60, 100);
    // light0.lookAt(0, 0, 0);
    // this.scene.add(light0);
    //
    // const light1 = new SpotLight(0xFFFFFF, INTENSITY, 300, ANGLE); // soft white light
    // light1.position.set(-100, 60, 100);
    // light1.lookAt(0, 0, 0);
    // this.scene.add(light1);
    //
    // const light2 = new SpotLight(0xFFFFFF, INTENSITY, 300, ANGLE); // soft white light
    // light2.position.set(100, 60, -100);
    // light2.lookAt(0, 0, 0);
    // this.scene.add(light2);
    //
    // const light3 = new SpotLight(0xFFFFFF, INTENSITY, 300, ANGLE); // soft white light
    // light3.position.set(-100, 60, -100);
    // light3.lookAt(0, 0, 0);
    // this.scene.add(light3);
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

  private animate(time: number) {
    requestAnimationFrame(t => this.animate(t));

    this.resizeCanvas();
    this.renderer.render(this.scene, this.camera);
  }

  private resizeCanvas() {
    const width = this.canvasContainer.nativeElement.offsetWidth;
    const height = this.canvasContainer.nativeElement.offsetHeight;

    if (this.canvas.nativeElement.width !== width || this.canvas.nativeElement.height !== height) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }
}
