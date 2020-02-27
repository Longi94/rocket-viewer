use crate::actor::{ActorHandler, get_actor_attribute};
use crate::model::frame_data::FrameData;
use boxcars::Attribute;
use crate::model::team_paint::TeamPaint;
use crate::model::frame_state::FrameState;
use crate::model::boost_pad_data::BoostPadData;

pub struct CarHandler {}

impl CarHandler {}

impl ActorHandler for CarHandler {
    fn update(&self, frame_data: &mut FrameData, state: &mut FrameState, actor_id: i32,
              updated_attr: &String, _objects: &Vec<String>) {
        let attributes = match state.actors.get(&actor_id) {
            None => return,
            Some(attributes) => attributes
        };

        let player_actor_id = match attributes.get("Engine.Pawn:PlayerReplicationInfo") {
            None => return,
            Some(Attribute::Flagged(_, id)) => id.clone() as i32,
            Some(_) => return,
        };

        if !state.car_player_map.contains_key(&actor_id) {
            state.car_player_map.insert(actor_id, player_actor_id);
        }

        let player_id = match get_actor_attribute(&player_actor_id, "Engine.PlayerReplicationInfo:PlayerID", &state.actors) {
            None => -1,
            Some(Attribute::Int(player_id)) => player_id,
            Some(_) => -1,
        };

        let player_data = frame_data.players.get_mut(&player_id);

        match updated_attr.as_ref() {
            "TAGame.RBActor_TA:ReplicatedRBState" => {
                if player_id == -1 || player_data.is_none() { return; }
                match attributes.get("TAGame.RBActor_TA:ReplicatedRBState") {
                    Some(rigid_body) => {
                        player_data.unwrap().body_states.push(state.real_time, &rigid_body);

                        // check if the car is over a boost pad
                        match rigid_body {
                            Attribute::RigidBody(rigid_body) => {
                                for boost_pad in &state.boost_pads {
                                    if boost_pad.in_range(&rigid_body.location) {

                                        if !frame_data.boost_pads.contains_key(&boost_pad.id) {
                                            frame_data.boost_pads.insert(boost_pad.id, BoostPadData::new());
                                        }

                                        let data = frame_data.boost_pads.get_mut(&boost_pad.id).unwrap();

                                        if data.times.last().unwrap() > &state.real_time {
                                            return
                                        }

                                        data.available.push(false);
                                        data.available.push(true);
                                        data.times.push(state.real_time);
                                        if boost_pad.big {
                                            data.times.push(state.real_time + 10.0);
                                        } else {
                                            data.times.push(state.real_time + 4.0);
                                        }
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                    _ => return
                }
            }
            "TAGame.Car_TA:TeamPaint" => {
                if player_id == -1 || player_data.is_none() { return; }
                match attributes.get("TAGame.Car_TA:TeamPaint") {
                    Some(Attribute::TeamPaint(team_paint)) => {
                        if team_paint.team == 0 {
                            player_data.unwrap().team_paint_blue = Some(TeamPaint::from(&team_paint));
                        } else {
                            player_data.unwrap().team_paint_orange = Some(TeamPaint::from(&team_paint));
                        }
                    }
                    _ => return
                }
            }
            "TAGame.Car_TA:ReplicatedDemolish" => {
                match attributes.get("TAGame.Car_TA:ReplicatedDemolish") {
                    None => return,
                    Some(Attribute::Demolish(demolish)) => {
                        let victim_car_actor_id = demolish.victim_actor_id.clone() as i32;
                        let victim_actor_id = state.car_player_map.get(&victim_car_actor_id).unwrap();

                        let victim_id = match get_actor_attribute(victim_actor_id, "Engine.PlayerReplicationInfo:PlayerID", &state.actors) {
                            None => return,
                            Some(Attribute::Int(player_id)) => player_id,
                            Some(_) => return,
                        };

                        match frame_data.players.get_mut(&victim_id) {
                            None => return,
                            Some(player_data) => {
                                player_data.body_states.visible.push(false);
                                player_data.body_states.visible_times.push(state.real_time);
                            }
                        }
                    }
                    Some(_) => return
                }
            }
            "TAGame.Vehicle_TA:ReplicatedSteer" => {
                if player_id == -1 || player_data.is_none() { return; }

                let steer = match attributes.get("TAGame.Vehicle_TA:ReplicatedSteer") {
                    None => return,
                    Some(Attribute::Byte(b)) => b.clone(),
                    Some(_) => return
                };

                let data = player_data.unwrap();

                match data.car_data.steer_times.last() {
                    None => {}
                    Some(t) => {
                        if state.real_time - t.clone() >= 0.1 {
                            // add in an extra frame
                            data.car_data.steer_times.push(state.real_time - 0.1);
                            for _ in 0..4 {
                                data.car_data.steer_values.push(data.car_data.steer_values[data.car_data.steer_values.len() - 4]);
                            }
                        }
                    }
                };

                insert_yaw_as_quaternion(&mut data.car_data.steer_values, -(steer as f32 - 128.0) / 256.0);
                data.car_data.steer_times.push(state.real_time);
            }
            _ => return
        }
    }
}

// https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles#Source_Code
fn insert_yaw_as_quaternion(values: &mut Vec<f32>, yaw: f32) {
    values.push(0.0);
    values.push(0.0);
    values.push((yaw * 0.5).sin());
    values.push((yaw * 0.5).cos());
}
