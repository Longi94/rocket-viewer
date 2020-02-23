import { RigidBodyActor } from './rigid-body';
import { PlayerData } from '../../model/replay/player-data';
import { Nameplate } from '../object/nameplate';
import { BodyModel } from 'rl-loadout-lib';

export class PlayerActor extends RigidBodyActor {

  private readonly nameplate: Nameplate;

  constructor(playerData: PlayerData, body: BodyModel) {
    super(body.scene);
    this.nameplate = new Nameplate(playerData.name, playerData.team);
    body.scene.add(this.nameplate.sprite);
  }

  update(time: number) {
  }

}
