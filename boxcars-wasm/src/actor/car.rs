use crate::actor::{ActorHandler, get_actor_attribute};
use crate::model::frame_data::FrameData;
use boxcars::Attribute;
use std::collections::HashMap;
use crate::model::team_paint::TeamPaint;
use crate::model::frame_state::FrameState;

pub struct CarHandler {}

impl ActorHandler for CarHandler {
    fn update(&self, frame_data: &mut FrameData, state: &FrameState,
              attributes: &HashMap<String, Attribute>, updated_attr: &String,
              _objects: &Vec<String>) {
        let player_actor_id = match attributes.get("Engine.Pawn:PlayerReplicationInfo") {
            None => return,
            Some(Attribute::Flagged(_, id)) => id.clone() as i32,
            Some(_) => return,
        };

        let player_id = match get_actor_attribute(player_actor_id, "Engine.PlayerReplicationInfo:PlayerID", &state.actors) {
            None => return,
            Some(Attribute::Int(player_id)) => player_id,
            Some(_) => return,
        };

        let player_data = match frame_data.players.get_mut(&player_id) {
            None => return,
            Some(player_data) => player_data
        };

        match updated_attr.as_ref() {
            "TAGame.RBActor_TA:ReplicatedRBState" => {
                match attributes.get("TAGame.RBActor_TA:ReplicatedRBState") {
                    Some(rigid_body) => player_data.body_states.push(state.real_time, &rigid_body),
                    _ => return
                }
            },
            "TAGame.Car_TA:TeamPaint" => {
                match attributes.get("TAGame.Car_TA:TeamPaint") {
                    Some(Attribute::TeamPaint(team_paint)) => {
                        if team_paint.team == 0 {
                            player_data.team_paint_blue = Some(TeamPaint::from(&team_paint));
                        } else {
                            player_data.team_paint_orange = Some(TeamPaint::from(&team_paint));
                        }
                    },
                    _ => return
                }
            },
            _ => return
        }
    }
}
