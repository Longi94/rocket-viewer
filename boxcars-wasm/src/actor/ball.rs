use crate::model::ball::BallType;
use crate::actor::ActorHandler;
use crate::model::frame_data::FrameData;
use boxcars::Attribute;
use std::collections::HashMap;
use crate::model::frame_state::FrameState;

pub struct BallHandler {
    pub ball_type: BallType
}

impl ActorHandler for BallHandler {
    fn update(&self, frame_data: &mut FrameData, state: &FrameState,
              attributes: &HashMap<String, Attribute>, updated_attr: &String,
              _objects: &Vec<String>) {
        if frame_data.ball_data.ball_type == BallType::Unknown {
            frame_data.ball_data.ball_type = self.ball_type;
        }

        if updated_attr == "TAGame.RBActor_TA:ReplicatedRBState" {
            match attributes.get("TAGame.RBActor_TA:ReplicatedRBState") {
                Some(rigid_body) => frame_data.ball_data.body_states.push(state.real_time, &rigid_body),
                _ => return
            }
        }
    }
}
