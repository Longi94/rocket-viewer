import { ReplayScene } from '../replay-scene';
import { modelLoader } from './loader-config';
import { Mesh, MeshStandardMaterial } from 'three';
import { RenderOrder } from '../../three/render-order';

const MAPPING: { [name: string]: string } = {
  HoopsStadium_P: '/assets/models/maps/HoopsStadium_P.draco.glb'
};

const TRANSPARENT_MATERIALS: { [name: string]: Set<string> } = {
  HoopsStadium_P: new Set(['net_material', 'wall_material_0', 'backboard_material_1_orange', 'backboard_material_1_blue'])
};

export async function loadMap(name: string, rs: ReplayScene) {
  let mapUrl = MAPPING[name];
  if (mapUrl == undefined) {
    mapUrl = '/assets/models/maps/TrainStation_Night_P.draco.glb';
  }
  rs.models.map = (await modelLoader.load(mapUrl)).scene;

  let transparentMats = TRANSPARENT_MATERIALS[name];
  if (transparentMats == undefined) {
    transparentMats = new Set<string>(['goal_glass', 'wall_grate', 'center_grate_material']);
  }

  rs.models.map.traverse(object => {
    // @ts-ignore
    if (object.isMesh) {
      const material = (object as Mesh).material as MeshStandardMaterial;
      if (transparentMats.has(material.name)) {
        material.depthWrite = false;
        object.renderOrder = RenderOrder.MAP_TRANSPARENT;
      } else {
        object.renderOrder = RenderOrder.OPAQUE;
      }
    }
  });
}
