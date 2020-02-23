use crate::actor::ActorHandler;
use crate::model::frame_data::FrameData;
use std::collections::HashMap;
use boxcars::Attribute;
use crate::model::player_data::PlayerData;
use crate::model::player_loadout::PlayerLoadout;
use crate::model::player_loadout_paints::PlayerLoadoutPaints;
use crate::model::frame_state::FrameState;

pub struct PlayerHandler {}

impl ActorHandler for PlayerHandler {
    fn update(&self, frame_data: &mut FrameData, state: &FrameState,
              attributes: &HashMap<String, Attribute>, updated_attr: &String,
              objects: &Vec<String>) {
        let player_id = match attributes.get("Engine.PlayerReplicationInfo:PlayerID") {
            Some(Attribute::Int(id)) => id,
            Some(_) => return,
            None => return,
        };

        if !frame_data.players.contains_key(player_id) {
            frame_data.players.insert(player_id.clone(), PlayerData::new(player_id.clone()));
        }

        let player_data = match frame_data.players.get_mut(player_id) {
            None => return,
            Some(player_data) => player_data
        };

        match updated_attr.as_ref() {
            "Engine.PlayerReplicationInfo:PlayerName" => {
                if player_data.name.is_none() {
                    player_data.name = match attributes.get("Engine.PlayerReplicationInfo:PlayerName") {
                        Some(Attribute::String(name)) => Some(name.clone()),
                        Some(_) => None,
                        None => None,
                    };
                }
            }
            "Engine.PlayerReplicationInfo:Team" => {
                if player_data.team.is_none() {
                    player_data.team = match attributes.get("Engine.PlayerReplicationInfo:Team") {
                        Some(Attribute::Flagged(_, team)) => {
                            let team_actor = team.clone() as i32;
                            match state.actor_objects.get(&team_actor) {
                                None => None,
                                Some(team_object) => {
                                    if team_object.chars().last().unwrap() == '0' {
                                        Some(0)
                                    } else {
                                        Some(1)
                                    }
                                }
                            }
                        }
                        Some(_) => None,
                        None => None,
                    };
                }
            }
            "TAGame.PRI_TA:ClientLoadouts" => {
                let loadouts = match attributes.get("TAGame.PRI_TA:ClientLoadouts") {
                    Some(Attribute::TeamLoadout(loadouts)) => loadouts,
                    Some(_) => return,
                    None => return,
                };

                player_data.loadouts.blue.copy(&loadouts.blue);
                player_data.loadouts.orange = Some(PlayerLoadout::from(&loadouts.orange));
            }
            "TAGame.PRI_TA:ClientLoadoutsOnline" => {
                let loadouts = match attributes.get("TAGame.PRI_TA:ClientLoadoutsOnline") {
                    Some(Attribute::LoadoutsOnline(loadouts)) => loadouts,
                    Some(_) => return,
                    None => return,
                };

                player_data.paints.blue.copy(&loadouts.blue, &objects);
                player_data.paints.orange = Some(PlayerLoadoutPaints::from(&loadouts.orange, &objects));
            }
            _ => return
        }
    }
}
