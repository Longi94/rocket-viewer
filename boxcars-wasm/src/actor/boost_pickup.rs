use crate::actor::{ActorHandler, get_actor_attribute};
use crate::model::frame_state::FrameState;
use crate::model::frame_data::FrameData;
use boxcars::Attribute;
use crate::model::boost_pad_data::BoostPadData;

pub struct BoostPickupHandler {}

impl ActorHandler for BoostPickupHandler {
    fn update(&self, frame_data: &mut FrameData, state: &mut FrameState, actor_id: i32,
              updated_attr: &String, _: &Vec<String>) {
        let attributes = match state.actors.get(&actor_id) {
            None => return,
            Some(attributes) => attributes
        };

        match updated_attr.as_ref() {
            "TAGame.VehiclePickup_TA:NewReplicatedPickupData" => {
                let attr = match attributes.get("TAGame.VehiclePickup_TA:NewReplicatedPickupData") {
                    None => return,
                    Some(Attribute::PickupNew(pickup_new)) => pickup_new,
                    Some(_) => return
                };

                let car_actor_id = match attr.instigator_id {
                    None => return,
                    Some(actor_id) => actor_id as i32
                };

                // get the position of the player
                let body_state = match get_actor_attribute(&car_actor_id, "TAGame.RBActor_TA:ReplicatedRBState", &state.actors) {
                    None => return,
                    Some(Attribute::RigidBody(rb)) => rb,
                    Some(_) => return
                };

                // find the boost pad
                match &state.boost_pads.iter().find(|pad| {
                    let height: f32 = if pad.big { 168.0 } else { 165.0 };
                    let radius: f32 = if pad.big { 208.0 } else { 144.0 };

                    body_state.location.z >= pad.location.y &&
                        body_state.location.z <= pad.location.y + height &&
                        d2(body_state.location.x, pad.location.x,
                           body_state.location.y, pad.location.z) <= radius
                }) {
                    None => return,
                    Some(boost_pad) => {

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
            _ => return,
        }
    }
}

fn d2(x1: f32, x2: f32, y1: f32, y2: f32) -> f32 {
    ((x1 - x2).powi(2) + (y1 - y2).powi(2)).sqrt()
}
