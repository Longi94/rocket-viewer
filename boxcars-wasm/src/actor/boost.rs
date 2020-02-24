use crate::actor::{ActorHandler, get_player_id_from_car_component, get_active_attribute};
use crate::model::frame_state::FrameState;
use crate::model::frame_data::FrameData;

pub struct BoostHandler {}

impl ActorHandler for BoostHandler {
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

        match updated_attr.as_ref() {
            "TAGame.CarComponent_TA:ReplicatedActive" => {
                let active_number = match get_active_attribute(&attributes) {
                    None => return,
                    Some(b) => b,
                };

                let active = active_number % 2 == 1;

                if player_data.boost_data.active.last().unwrap().clone() != active {
                    player_data.boost_data.active.push(active);
                    player_data.boost_data.times.push(state.real_time);
                }
            }
            _ => return
        }
    }
}
