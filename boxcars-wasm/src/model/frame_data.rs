use crate::model::ball::BallData;
use std::collections::HashMap;
use crate::model::player_data::PlayerData;
use serde::Serialize;
use crate::model::boost_pad_data::BoostPadData;

#[derive(Serialize, Debug)]
pub struct FrameData {
    pub ball_data: BallData,
    pub times: Vec<f32>,
    pub deltas: Vec<f32>,
    pub players: HashMap<i32, PlayerData>,
    pub boost_pads: HashMap<i8, BoostPadData>,
}

impl FrameData {
    pub fn with_capacity(c: usize) -> Self {
        FrameData {
            ball_data: BallData::new(),
            times: Vec::with_capacity(c),
            deltas: Vec::with_capacity(c),
            players: HashMap::new(),
            boost_pads: HashMap::new(),
        }
    }
}
