use crate::actor::{ActorHandler, get_actor_attribute};
use boxcars::Attribute;
use wasm_bindgen::__rt::std::collections::HashMap;
use crate::model::frame_data::FrameData;
use crate::model::frame_state::FrameState;

pub struct JumpHandler {}

impl ActorHandler for JumpHandler {
    fn update(&self, frame_data: &mut FrameData, state: &mut FrameState, actor_id: i32,
              updated_attr: &String, _objects: &Vec<String>) {
        let attributes = match state.actors.get(&actor_id) {
            None => return,
            Some(attributes) => attributes
        };

        let player_id = match get_player_id(&attributes, &state.actors) {
            None => return,
            Some(id) => id
        };

        let player_data = match frame_data.players.get_mut(&player_id) {
            None => return,
            Some(player_data) => player_data
        };

        let active = match updated_attr.as_ref() {
            "TAGame.CarComponent_TA:ReplicatedActive" => {
                match get_active_attribute(&attributes) {
                    None => return,
                    Some(b) => b,
                }
            }
            _ => return
        };

        player_data.jump_data.jump_active.push((state.frame, active));
    }
}

pub struct DoubleJumpHandler {}

impl ActorHandler for DoubleJumpHandler {
    fn update(&self, frame_data: &mut FrameData, state: &mut FrameState, actor_id: i32,
              updated_attr: &String, _objects: &Vec<String>) {
        let attributes = match state.actors.get(&actor_id) {
            None => return,
            Some(attributes) => attributes
        };

        let player_id = match get_player_id(&attributes, &state.actors) {
            None => return,
            Some(id) => id
        };

        let player_data = match frame_data.players.get_mut(&player_id) {
            None => return,
            Some(player_data) => player_data
        };

        let active = match updated_attr.as_ref() {
            "TAGame.CarComponent_TA:ReplicatedActive" => {
                match get_active_attribute(&attributes) {
                    None => return,
                    Some(b) => b,
                }
            }
            _ => return
        };

        player_data.jump_data.double_jump_active.push((state.frame, active));
    }
}

pub struct DodgeHandler {}

impl ActorHandler for DodgeHandler {
    fn update(&self, frame_data: &mut FrameData, state: &mut FrameState, actor_id: i32,
              updated_attr: &String, _objects: &Vec<String>) {
        let attributes = match state.actors.get(&actor_id) {
            None => return,
            Some(attributes) => attributes
        };

        let player_id = match get_player_id(&attributes, &state.actors) {
            None => return,
            Some(id) => id
        };

        let player_data = match frame_data.players.get_mut(&player_id) {
            None => return,
            Some(player_data) => player_data
        };

        let active = match updated_attr.as_ref() {
            "TAGame.CarComponent_TA:ReplicatedActive" => {
                match get_active_attribute(&attributes) {
                    None => return,
                    Some(b) => b,
                }
            }
            _ => return
        };

        player_data.jump_data.dodge_active.push((state.frame, active));
    }
}

fn get_active_attribute(attributes: &HashMap<String, Attribute>) -> Option<u8> {
    match attributes.get("TAGame.CarComponent_TA:ReplicatedActive") {
        None => None,
        Some(Attribute::Byte(b)) => Some(b.clone()),
        Some(_) => None
    }
}

fn get_player_id(attributes: &HashMap<String, Attribute>,
                 all_actors: &HashMap<i32, HashMap<String, Attribute>>) -> Option<i32> {
    let car_actor_id = match attributes.get("TAGame.CarComponent_TA:Vehicle") {
        None => return None,
        Some(Attribute::Flagged(_, id)) => id.clone() as i32,
        Some(_) => return None,
    };

    let player_actor_id = match get_actor_attribute(
        &car_actor_id, "Engine.Pawn:PlayerReplicationInfo", &all_actors,
    ) {
        None => return None,
        Some(Attribute::Flagged(_, id)) => id.clone() as i32,
        Some(_) => return None,
    };

    match get_actor_attribute(&player_actor_id, "Engine.PlayerReplicationInfo:PlayerID", all_actors) {
        None => None,
        Some(Attribute::Int(player_id)) => Some(player_id),
        Some(_) => None,
    }
}
