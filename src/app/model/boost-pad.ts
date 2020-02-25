import { Euler, Vector3 } from 'three';

export class BoostPad {
  id: number;
  big: boolean;
  position: Vector3;
  rotation: Euler;
}

const BOOSTS_HOOP_STADIUM: BoostPad[] = [
  {id: 0, big: true, position: new Vector3(-2176.0, 8.0, -2944.0), rotation: new Euler(0, 0, 0)},
  {id: 1, big: true, position: new Vector3(2176.0, 8.0, -2944.0), rotation: new Euler(0, 0, 0)},
  {id: 2, big: false, position: new Vector3(0.0, 0.0, -2816.0), rotation: new Euler(0, 0, 0)},
  {id: 3, big: false, position: new Vector3(-1280.0, 0.0, -2304.0), rotation: new Euler(0, 0, 0)},
  {id: 4, big: false, position: new Vector3(1280.0, 0.0, -2304.0), rotation: new Euler(0, 0, 0)},
  {id: 5, big: false, position: new Vector3(-1536.0, 0.0, -1024.0), rotation: new Euler(0, 0, 0)},
  {id: 6, big: false, position: new Vector3(1536.0, 0.0, -1024.0), rotation: new Euler(0, 0, 0)},
  {id: 7, big: false, position: new Vector3(-512.0, 0.0, -512.0), rotation: new Euler(0, 0, 0)},
  {id: 8, big: false, position: new Vector3(512.0, 0.0, -512.0), rotation: new Euler(0, 0, 0)},
  {id: 9, big: true, position: new Vector3(-2432.0, 8.0, 0.0), rotation: new Euler(0, 0, 0)},
  {id: 10, big: true, position: new Vector3(2432.0, 8.0, 0.0), rotation: new Euler(0, 0, 0)},
  {id: 11, big: false, position: new Vector3(-512.0, 0.0, 512.0), rotation: new Euler(0, 0, 0)},
  {id: 12, big: false, position: new Vector3(512.0, 0.0, 512.0), rotation: new Euler(0, 0, 0)},
  {id: 13, big: false, position: new Vector3(-1536.0, 0.0, 1024.0), rotation: new Euler(0, 0, 0)},
  {id: 14, big: false, position: new Vector3(1536.0, 0.0, 1024.0), rotation: new Euler(0, 0, 0)},
  {id: 15, big: false, position: new Vector3(-1280.0, -0.0, 2304.0), rotation: new Euler(0, 0, 0)},
  {id: 16, big: false, position: new Vector3(1280.0, 0.0, 2304.0), rotation: new Euler(0, 0, 0)},
  {id: 17, big: false, position: new Vector3(0.0, 0.0, 2816.0), rotation: new Euler(0, 0, 0)},
  {id: 18, big: true, position: new Vector3(-2176.0, 8.0, 2944.0), rotation: new Euler(0, 0, 0)},
  {id: 19, big: true, position: new Vector3(2176.0, 8.0, 2944.0), rotation: new Euler(0, 0, 0)}
];

const BOOSTS_STANDARD: BoostPad[] = [
  {id: 0, big: false, position: new Vector3(0.0, 6.0, -4240.0), rotation: new Euler(0, 0, 0)},
  {id: 1, big: false, position: new Vector3(-1792.0, 6.0, -4184.0), rotation: new Euler(0, 0, 0)},
  {id: 2, big: false, position: new Vector3(1792.0, 6.0, -4184.0), rotation: new Euler(0, 0, 0)},
  {id: 3, big: true, position: new Vector3(-3072.0, 9.0, -4095.999), rotation: new Euler(0, 0, 0)},
  {id: 4, big: true, position: new Vector3(3072.0, 9.0, -4096.0), rotation: new Euler(0, 0, 0)},
  {id: 5, big: false, position: new Vector3(-940.0, 6.0, -3308.0), rotation: new Euler(0, 0, 0)},
  {id: 6, big: false, position: new Vector3(940.0, 6.0, -3308.0), rotation: new Euler(0, 0, 0)},
  {id: 7, big: false, position: new Vector3(0.0, 6.0, -2816.0), rotation: new Euler(0, 0, 0)},
  {id: 8, big: false, position: new Vector3(-3584.0, 6.0, -2484.0), rotation: new Euler(0, 0, 0)},
  {id: 9, big: false, position: new Vector3(3584.0, 6.0, -2484.0), rotation: new Euler(0, 0, 0)},
  {id: 10, big: false, position: new Vector3(-1788.0, 6.0, -2300.0), rotation: new Euler(0, 0, 0)},
  {id: 11, big: false, position: new Vector3(1788.0, 6.0, -2300.0), rotation: new Euler(0, 0, 0)},
  {id: 12, big: false, position: new Vector3(-2048.0, 6.0, -1036.0), rotation: new Euler(0, 0, 0)},
  {id: 13, big: false, position: new Vector3(0.0, 6.0, -1024.0), rotation: new Euler(0, 0, 0)},
  {id: 14, big: false, position: new Vector3(2048.0, 6.0, -1036.0), rotation: new Euler(0, 0, 0)},
  {id: 15, big: true, position: new Vector3(-3584.0, 9.0, 0.0), rotation: new Euler(0, 0, 0)},
  {id: 16, big: false, position: new Vector3(-1024.0, 6.0, 0.0), rotation: new Euler(0, 0, 0)},
  {id: 17, big: false, position: new Vector3(1024.0, 6.0, 0.0), rotation: new Euler(0, 0, 0)},
  {id: 18, big: true, position: new Vector3(3584.0, 9.0, 0.0), rotation: new Euler(0, 0, 0)},
  {id: 19, big: false, position: new Vector3(-2048.0, 6.0, 1036.0), rotation: new Euler(0, 0, 0)},
  {id: 20, big: false, position: new Vector3(0.0, 6.0, 1024.0), rotation: new Euler(0, 0, 0)},
  {id: 21, big: false, position: new Vector3(2048.0, 6.0, 1036.0), rotation: new Euler(0, 0, 0)},
  {id: 22, big: false, position: new Vector3(-1788.0, 6.0, 2300.0), rotation: new Euler(0, 0, 0)},
  {id: 23, big: false, position: new Vector3(1788.0, 6.0, 2300.0), rotation: new Euler(0, 0, 0)},
  {id: 24, big: false, position: new Vector3(-3584.0, 6.0, 2484.0), rotation: new Euler(0, 0, 0)},
  {id: 25, big: false, position: new Vector3(3584.0, 6.0, 2484.0), rotation: new Euler(0, 0, 0)},
  {id: 26, big: false, position: new Vector3(0.0, 6.0, 2816.0), rotation: new Euler(0, 0, 0)},
  {id: 27, big: false, position: new Vector3(-940.0, 6.0, 3308.0), rotation: new Euler(0, 0, 0)},
  {id: 28, big: false, position: new Vector3(940.0, 6.0, 3308.0), rotation: new Euler(0, 0, 0)},
  {id: 29, big: true, position: new Vector3(-3072.0, 9.0, 4096.0), rotation: new Euler(0, 0, 0)},
  {id: 30, big: true, position: new Vector3(3071.992, 9.0, 4096.0), rotation: new Euler(0, 0, 0)},
  {id: 31, big: false, position: new Vector3(-1792.0, 6.0, 4184.0), rotation: new Euler(0, 0, 0)},
  {id: 32, big: false, position: new Vector3(1792.0, 6.0, 4184.0), rotation: new Euler(0, 0, 0)},
  {id: 33, big: false, position: new Vector3(0.0, 6.0, 4240.0), rotation: new Euler(0, 0, 0)}
];

const MAPPING: { [name: string]: BoostPad[] } = {
  HoopsStadium_P: BOOSTS_HOOP_STADIUM
};

export function getBoosts(mapName: string): BoostPad[] {
  let boosts = MAPPING[mapName];
  if (boosts == undefined) {
    return BOOSTS_STANDARD;
  }
  return boosts;
}
