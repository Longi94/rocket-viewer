use crate::model::frame_data::FrameData;
use crate::model::boost_pad::get_boost_pads;
use crate::model::boost_pad_data::BoostPadData;
use wasm_bindgen::__rt::std::collections::HashMap;

pub fn create_boost_pad_frames(map_name: &String, frame_data: &mut FrameData) {
    let boost_pads = get_boost_pads(map_name);

    let mut pickup_times: HashMap<i8, Vec<f32>> = HashMap::new();

    for boost_pad in boost_pads {
        pickup_times.insert(boost_pad.id, Vec::new());
    }

    for (_, player_data) in frame_data.players {
        for i in player_data.body_states.times.len() {
            for boost_pad in boost_pads {
                // check if player is in pickup range of boost pad
                // https://github.com/RLBot/RLBot/wiki/Useful-Game-Values

                let height: f32 = if boost_pad.big { 168.0 } else { 165.0 };
                let radius: f32 = if boost_pad.big { 208.0 } else { 144.0 };

                if player_data.body_states.positions[i + 1] < boost_pad.location.y ||
                    player_data.body_states.positions[i + 1] > boost_pad.location.y + height {
                    // player is above or below the cylinder
                    continue;
                }

                let d = d2(player_data.body_states.positions[i], boost_pad.location.x,
                           player_data.body_states.positions[i + 2], boost_pad.location.z);

                if d > radius {
                    // player is outside of cylinder radius
                    continue;
                }

                pickup_times.get(&boost_pad.id).unwrap().push(player_data.body_states.times[i]);
                break;
            }
        }
    }

    for (boost_id, mut p_times) in pickup_times {
        if p_times.is_empty() {
            frame_data.boost_pads.insert(boost_id, BoostPadData::new());
            continue;
        }

        p_times.sort();
        let mut data = BoostPadData::new();

        data.times.push(data[0]);
        data.available.push(false);

        for i in 1..p_times.len() {

        }
    }
}

fn d2(x1: f32, x2: f32, y1: f32, y2: f32) -> f32 {
    ((x1 - x2).powi(2) + (y1 - y2).powi(2)).sqrt()
}
