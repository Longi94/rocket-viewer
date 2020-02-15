use boxcars::{Replay, UpdatedAttribute, Attribute};
use crate::models::{ReplayVersion, FrameData, BallType, PlayerData};
use wasm_bindgen::__rt::std::collections::HashMap;
use wasm_bindgen::__rt::std::collections::hash_map::RandomState;

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
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: usize, frame_count: usize,
              frame_data: &mut FrameData, attributes: &HashMap<String, Attribute>,
              all_actors: &HashMap<i32, HashMap<String, Attribute>>,
              actor_objects: &HashMap<i32, String>);
}

pub struct BallHandler {
    ball_type: BallType
}

impl ActorHandler for BallHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: usize, frame_count: usize,
              frame_data: &mut FrameData, attributes: &HashMap<String, Attribute>,
              all_actors: &HashMap<i32, HashMap<String, Attribute>>,
              actor_objects: &HashMap<i32, String>) {
        if frame_data.ball_data.ball_type == BallType::Unknown {
            frame_data.ball_data.ball_type = self.ball_type;
        }

        match attributes.get("TAGame.RBActor_TA:ReplicatedRBState") {
            Some(rigid_body) => match rigid_body {
                Attribute::RigidBody(rigid_body) => {
                    frame_data.ball_data.positions[frame * 3] = rigid_body.location.x;
                    // Y is up in three.js
                    frame_data.ball_data.positions[frame * 3 + 1] = rigid_body.location.z;
                    frame_data.ball_data.positions[frame * 3 + 2] = rigid_body.location.y;
                    frame_data.ball_data.rotations[frame * 4] = rigid_body.rotation.x;
                    frame_data.ball_data.rotations[frame * 4 + 1] = rigid_body.rotation.y;
                    frame_data.ball_data.rotations[frame * 4 + 2] = rigid_body.rotation.z;
                    frame_data.ball_data.rotations[frame * 4 + 3] = rigid_body.rotation.w;
                }
                _ => return
            }
            _ => return
        }
    }
}

pub struct CarHandler {}

impl ActorHandler for CarHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: usize, frame_count: usize,
              frame_data: &mut FrameData, attributes: &HashMap<String, Attribute>,
              all_actors: &HashMap<i32, HashMap<String, Attribute>>,
              actor_objects: &HashMap<i32, String>) {
        let player_actor_id = match attributes.get("Engine.Pawn:PlayerReplicationInfo") {
            None => return,
            Some(Attribute::Flagged(flag, id)) => id.clone() as i32,
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

        match attributes.get("TAGame.RBActor_TA:ReplicatedRBState") {
            Some(rigid_body) => match rigid_body {
                Attribute::RigidBody(rigid_body) => {
                    player_data.positions[frame * 3] = rigid_body.location.x;
                    // Y is up in three.js
                    player_data.positions[frame * 3 + 1] = rigid_body.location.z;
                    player_data.positions[frame * 3 + 2] = rigid_body.location.y;
                    player_data.rotations[frame * 4] = rigid_body.rotation.x;
                    player_data.rotations[frame * 4 + 1] = rigid_body.rotation.y;
                    player_data.rotations[frame * 4 + 2] = rigid_body.rotation.z;
                    player_data.rotations[frame * 4 + 3] = rigid_body.rotation.w;
                }
                _ => return
            }
            _ => return
        }
    }
}

pub struct PlayerHandler {}

impl ActorHandler for PlayerHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: usize, frame_count: usize,
              frame_data: &mut FrameData, attributes: &HashMap<String, Attribute>,
              all_actors: &HashMap<i32, HashMap<String, Attribute>>,
              actor_objects: &HashMap<i32, String>) {
        let player_id = match attributes.get("Engine.PlayerReplicationInfo:PlayerID") {
            Some(Attribute::Int(id)) => id,
            Some(_) => return,
            None => return,
        };

        if !frame_data.players.contains_key(player_id) {
            let mut player_data = PlayerData::with_capacity(frame_count);

            player_data.name = match attributes.get("Engine.PlayerReplicationInfo:PlayerName") {
                Some(Attribute::String(name)) => Some(name.clone()),
                Some(_) => None,
                None => None,
            };

            player_data.team = match attributes.get("Engine.PlayerReplicationInfo:Team") {
                Some(Attribute::Flagged(flag, team)) => {
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
            player_data.create_frame(frame_count);
            frame_data.players.insert(player_id.clone(), player_data);
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
