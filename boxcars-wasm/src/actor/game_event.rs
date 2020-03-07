use crate::actor::ActorHandler;
use crate::model::frame_state::FrameState;
use crate::model::frame_data::FrameData;
use boxcars::Attribute;

pub struct GameEventHandler {}

impl ActorHandler for GameEventHandler {
    fn update(&self, frame_data: &mut FrameData, state: &mut FrameState, actor_id: i32,
              updated_attr: &String, _objects: &Vec<String>) {
        let attributes = match state.actors.get(&actor_id) {
            None => return,
            Some(attributes) => attributes
        };

        match updated_attr.as_ref() {
            "TAGame.GameEvent_Soccar_TA:bOverTime" => {
                match attributes.get("TAGame.GameEvent_Soccar_TA:bOverTime") {
                    Some(Attribute::Boolean(b)) => {
                        if b.clone() && frame_data.game_data.over_time.is_none() {
                            frame_data.game_data.over_time = Some(state.real_time);
                        }
                    }
                    _ => return
                }
            }
            "TAGame.GameEvent_Soccar_TA:SecondsRemaining" => {
                match attributes.get("TAGame.GameEvent_Soccar_TA:SecondsRemaining") {
                    Some(Attribute::Int(time)) => if frame_data.game_data.remaining_times.last().unwrap_or(&-1) != time {
                        frame_data.game_data.remaining_times.push(time.clone());
                        frame_data.game_data.remaining_times_times.push(state.real_time);
                    }
                    _ => return
                }
            }
            _ => return
        }
    }
}
