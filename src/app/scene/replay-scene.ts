import { Object3D, PerspectiveCamera, Scene, Texture, WebGLRenderer, WebGLRenderTarget } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class ModelStore {
  map: Object3D;
  ball: Object3D;
}


export class ReplayScene {
  models: ModelStore = new ModelStore();

  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;
}
