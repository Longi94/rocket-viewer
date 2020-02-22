use crate::model::ball::BallType;
use crate::actor::ActorHandler;
use crate::model::frame_data::FrameData;
use boxcars::Attribute;
use std::collections::HashMap;

pub struct BallHandler {
    pub ball_type: BallType
}

impl ActorHandler for BallHandler {
    fn update(&self, real_time: f32, _frame: usize, frame_data: &mut FrameData,
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
