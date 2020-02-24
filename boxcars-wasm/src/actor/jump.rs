use crate::actor::{ActorHandler, get_player_id_from_car_component, get_active_attribute};
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

        let player_id = match get_player_id_from_car_component(&attributes, &state.actors) {
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

        let player_id = match get_player_id_from_car_component(&attributes, &state.actors) {
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

        let player_id = match get_player_id_from_car_component(&attributes, &state.actors) {
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
