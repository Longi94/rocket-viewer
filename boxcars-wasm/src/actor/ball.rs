use crate::model::ball::BallType;
use crate::actor::ActorHandler;
use crate::model::frame_data::FrameData;
use crate::model::frame_state::FrameState;
use boxcars::Attribute;

pub struct BallHandler {
    pub ball_type: BallType
}

impl ActorHandler for BallHandler {
    fn update(&self, frame_data: &mut FrameData, state: &mut FrameState, actor_id: i32,
              updated_attr: &String, _objects: &Vec<String>) {
        let attributes = match state.actors.get(&actor_id) {
            None => return,
            Some(attributes) => attributes
        };

        if frame_data.ball_data.ball_type == BallType::Unknown {
            frame_data.ball_data.ball_type = self.ball_type;
        }

        match updated_attr.as_ref() {
            "TAGame.RBActor_TA:ReplicatedRBState" => match attributes.get("TAGame.RBActor_TA:ReplicatedRBState") {
                Some(rigid_body) => frame_data.ball_data.body_states.push(state.real_time, &rigid_body),
                _ => return
            },
            "TAGame.Ball_TA:HitTeamNum" => match attributes.get("TAGame.Ball_TA:HitTeamNum") {
                Some(Attribute::Byte(b)) => {
                    if frame_data.ball_data.hit_team.last().unwrap() != b {
                        frame_data.ball_data.hit_team.push(b.clone());
                        frame_data.ball_data.hit_team_times.push(state.real_time);
                    }
                }
                _ => return
            },
            _ => return
        }
    }
}
