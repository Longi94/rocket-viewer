use boxcars::{Attribute};
use crate::models::{FrameData, BallType, PlayerData, PlayerLoadout};
use wasm_bindgen::__rt::std::collections::HashMap;

fn get_actor_attribute(actor_id: i32, attr_name: &str,
                       all_actors: &HashMap<i32, HashMap<String, Attribute>>) -> Option<Attribute> {
    match all_actors.get(&actor_id) {
        None => None,
        Some(actor) => match actor.get(attr_name) {
            None => None,
            Some(attr) => Some(attr.clone())
        }
    }
}

pub trait ActorHandler {
    fn update(&self, real_time: f32, frame: usize, frame_data: &mut FrameData,
              attributes: &HashMap<String, Attribute>, updated_attr: &String,
              all_actors: &HashMap<i32, HashMap<String, Attribute>>,
              actor_objects: &HashMap<i32, String>);
}

pub struct BallHandler {
    ball_type: BallType
}

impl ActorHandler for BallHandler {
    fn update(&self, real_time: f32, frame: usize, frame_data: &mut FrameData,
              attributes: &HashMap<String, Attribute>, updated_attr: &String,
              _all_actors: &HashMap<i32, HashMap<String, Attribute>>,
              _actor_objects: &HashMap<i32, String>) {
        if frame_data.ball_data.ball_type == BallType::Unknown {
            frame_data.ball_data.ball_type = self.ball_type;
        }

        if updated_attr == "TAGame.RBActor_TA:ReplicatedRBState" {
            match attributes.get("TAGame.RBActor_TA:ReplicatedRBState") {
                Some(rigid_body) => frame_data.ball_data.body_states.push(real_time, &rigid_body),
                _ => return
            }
        }
    }
}

pub struct CarHandler {}

impl ActorHandler for CarHandler {
    fn update(&self, real_time: f32, frame: usize, frame_data: &mut FrameData,
              attributes: &HashMap<String, Attribute>, updated_attr: &String,
              all_actors: &HashMap<i32, HashMap<String, Attribute>>,
              _actor_objects: &HashMap<i32, String>) {
        let player_actor_id = match attributes.get("Engine.Pawn:PlayerReplicationInfo") {
            None => return,
            Some(Attribute::Flagged(_, id)) => id.clone() as i32,
            Some(_) => return,
        };

        let player_id = match get_actor_attribute(player_actor_id, "Engine.PlayerReplicationInfo:PlayerID", all_actors) {
            None => return,
            Some(Attribute::Int(player_id)) => player_id,
            Some(_) => return,
        };

        let player_data = match frame_data.players.get_mut(&player_id) {
            None => return,
            Some(player_data) => player_data
        };

        if updated_attr == "TAGame.RBActor_TA:ReplicatedRBState" {
            match attributes.get("TAGame.RBActor_TA:ReplicatedRBState") {
                Some(rigid_body) => player_data.body_states.push(real_time, &rigid_body),
                _ => return
            }
        }
    }
}

pub struct PlayerHandler {}

impl ActorHandler for PlayerHandler {
    fn update(&self, real_time: f32, _frame: usize, frame_data: &mut FrameData,
              attributes: &HashMap<String, Attribute>, updated_attr: &String,
              _all_actors: &HashMap<i32, HashMap<String, Attribute>>,
              actor_objects: &HashMap<i32, String>) {
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
            },
            "Engine.PlayerReplicationInfo:Team" => {
                if player_data.team.is_none() {
                    player_data.team = match attributes.get("Engine.PlayerReplicationInfo:Team") {
                        Some(Attribute::Flagged(_, team)) => {
                            let team_actor = team.clone() as i32;
                            match actor_objects.get(&team_actor) {
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
            },
            "TAGame.PRI_TA:ClientLoadouts" => {
                let loadouts = match attributes.get("TAGame.PRI_TA:ClientLoadouts") {
                    Some(Attribute::TeamLoadout(loadouts)) => loadouts,
                    Some(_) => return,
                    None => return,
                };

                player_data.loadouts.blue.body = loadouts.blue.body;
                player_data.loadouts.blue.decal = loadouts.blue.decal;
                player_data.loadouts.blue.wheels = loadouts.blue.wheels;
                player_data.loadouts.blue.boost = loadouts.blue.rocket_trail;
                player_data.loadouts.blue.antenna = loadouts.blue.antenna;
                player_data.loadouts.blue.topper = loadouts.blue.topper;
                player_data.loadouts.blue.engine_audio = loadouts.blue.engine_audio.unwrap_or(0);
                player_data.loadouts.blue.trail = loadouts.blue.trail.unwrap_or(0);
                player_data.loadouts.blue.goal_explosion = loadouts.blue.goal_explosion.unwrap_or(0);
                player_data.loadouts.blue.banner = loadouts.blue.banner.unwrap_or(0);

                player_data.loadouts.orange = Some(PlayerLoadout {
                    body: loadouts.blue.body,
                    decal: loadouts.blue.decal,
                    wheels: loadouts.blue.wheels,
                    boost: loadouts.blue.rocket_trail,
                    antenna: loadouts.blue.antenna,
                    topper: loadouts.blue.topper,
                    engine_audio: loadouts.blue.engine_audio.unwrap_or(0),
                    trail: loadouts.blue.trail.unwrap_or(0),
                    goal_explosion: loadouts.blue.goal_explosion.unwrap_or(0),
                    banner: loadouts.blue.banner.unwrap_or(0),
                });
            }
            _ => return
        }
    }
}

pub fn get_handler(object_name: &str) -> Option<Box<dyn ActorHandler>> {
    match object_name {
        "Archetypes.Ball.Ball_Default" => Some(Box::new(BallHandler { ball_type: BallType::Default })),
        "Archetypes.Ball.Ball_Basketball" => Some(Box::new(BallHandler { ball_type: BallType::Basketball })),
        "Archetypes.Ball.Ball_BasketBall" => Some(Box::new(BallHandler { ball_type: BallType::Basketball })),
        "Archetypes.Ball.Ball_Puck" => Some(Box::new(BallHandler { ball_type: BallType::Puck })),
        "Archetypes.Ball.CubeBall" => Some(Box::new(BallHandler { ball_type: BallType::Cube })),
        "Archetypes.Ball.Ball_Breakout" => Some(Box::new(BallHandler { ball_type: BallType::Breakout })),
        "Archetypes.Car.Car_Default" => Some(Box::new(CarHandler {})),
        "TAGame.Default__PRI_TA" => Some(Box::new(PlayerHandler {})),
        _ => None
    }
}
