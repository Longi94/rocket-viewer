use crate::actor::ActorHandler;
use crate::model::frame_state::FrameState;
use crate::model::frame_data::FrameData;
use boxcars::Attribute;

pub struct TeamHandler {
    pub team: u8,
}

impl ActorHandler for TeamHandler {
    fn update(&self, frame_data: &mut FrameData, state: &mut FrameState, actor_id: i32,
              updated_attr: &String, _objects: &Vec<String>) {
        let attributes = match state.actors.get(&actor_id) {
            None => return,
            Some(attributes) => attributes
        };

        match updated_attr.as_ref() {
            "Engine.TeamInfo:Score" => {
                let score = match attributes.get("Engine.TeamInfo:Score") {
                    Some(Attribute::Int(score)) => score,
                    _ => return
                };

                if self.team == 1 {
                    if frame_data.team_1_data.scores.last().unwrap() != score {
                        frame_data.team_1_data.scores.push(score.clone());
                        frame_data.team_1_data.score_times.push(state.real_time);

                        frame_data.ball_data.body_states.visible.push(false);
                        frame_data.ball_data.body_states.visible_times.push(state.real_time);
                    }
                } else {
                    if frame_data.team_0_data.scores.last().unwrap() != score {
                        frame_data.team_0_data.scores.push(score.clone());
                        frame_data.team_0_data.score_times.push(state.real_time);

                        frame_data.ball_data.body_states.visible.push(false);
                        frame_data.ball_data.body_states.visible_times.push(state.real_time);
                    }
                }
            }
            _ => return
        }
    }
}
