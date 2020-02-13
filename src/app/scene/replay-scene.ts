import { Object3D, PerspectiveCamera, Scene, Texture } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Replay } from '../model/replay/replay';

export class ModelStore {
  map: Object3D;
  ball: Object3D;
}


export class ReplayScene {
  models: ModelStore = new ModelStore();

  replay: Replay;

  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;

  envMap: Texture;
}
