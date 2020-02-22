use crate::actor::{ActorHandler, get_actor_attribute};
use crate::model::frame_data::FrameData;
use boxcars::Attribute;
use std::collections::HashMap;

pub struct CarHandler {}

impl ActorHandler for CarHandler {
    fn update(&self, real_time: f32, _frame: usize, frame_data: &mut FrameData,
              attributes: &HashMap<String, Attribute>, updated_attr: &String,
              all_actors: &HashMap<i32, HashMap<String, Attribute>>,
              _actor_objects: &HashMap<i32, String>, _objects: &Vec<String>) {
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
