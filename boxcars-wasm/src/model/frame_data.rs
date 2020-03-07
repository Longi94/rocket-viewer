use crate::model::ball::BallData;
use std::collections::HashMap;
use crate::model::player_data::PlayerData;
use serde::Serialize;
use crate::model::boost_pad_data::BoostPadData;
use crate::model::game_data::GameData;
use crate::model::team_data::TeamData;

#[derive(Serialize, Debug)]
pub struct FrameData {
    pub ball_data: BallData,
    pub times: Vec<f32>,
    pub real_times: Vec<f32>,
    pub deltas: Vec<f32>,
    pub players: HashMap<i32, PlayerData>,
    pub boost_pads: HashMap<i8, BoostPadData>,
    pub game_data: GameData,
    pub team_1_data: TeamData,
    pub team_0_data: TeamData,
}

impl FrameData {
    pub fn with_capacity(c: usize) -> Self {
        FrameData {
            ball_data: BallData::new(),
            times: Vec::with_capacity(c),
            real_times: Vec::with_capacity(c),
            deltas: Vec::with_capacity(c),
            players: HashMap::new(),
            boost_pads: HashMap::new(),
            game_data: GameData::new(),
            team_0_data: TeamData::new(),
            team_1_data: TeamData::new(),
        }
    }

    pub fn reset(&mut self, time: f32) {
        self.ball_data.reset(time);
        for (_, player_data) in &mut self.players {
            player_data.reset(time);
        }
        for (_, pad) in &mut self.boost_pads {
            pad.reset(time);
        }
    }
}
