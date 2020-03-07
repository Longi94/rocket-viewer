use serde::Serialize;
use crate::model::player_loadouts::PlayerLoadouts;
use crate::model::body_states::BodyStates;
use crate::model::player_loadouts_paints::PlayerLoadoutsPaints;
use crate::model::team_paint::TeamPaint;
use crate::model::jump::JumpData;
use crate::model::boost::BoostData;
use crate::model::car_data::CarData;
use boxcars::attributes::RigidBody;

#[derive(Serialize, Debug)]
pub struct PlayerData {
    pub id: i32,
    pub name: Option<String>,
    pub team: Option<u32>,
    pub loadouts: PlayerLoadouts,
    pub paints: PlayerLoadoutsPaints,
    pub body_states: BodyStates,
    pub team_paint_blue: Option<TeamPaint>,
    pub team_paint_orange: Option<TeamPaint>,
    pub jump_data: JumpData,
    pub boost_data: BoostData,
    pub car_data: CarData,
    pub demo_pos: Vec<f32>,
    pub demolished: Vec<bool>,
    pub demolished_times: Vec<f32>,
}

impl PlayerData {
    pub fn new(id: i32) -> Self {
        PlayerData {
            id,
            name: None,
            team: None,
            body_states: BodyStates::new(),
            loadouts: PlayerLoadouts::new(),
            paints: PlayerLoadoutsPaints::new(),
            jump_data: JumpData::new(),
            boost_data: BoostData::new(),
            car_data: CarData::new(),
            team_paint_blue: None,
            team_paint_orange: None,
            demo_pos: vec![0.0, 0.0, 0.0],
            demolished: vec![false],
            demolished_times: vec![0.0],
        }
    }

    pub fn push_demo(&mut self, time: f32, rigid_body: &RigidBody) {
        self.body_states.visible.push(false);
        self.body_states.visible_times.push(time);
        self.demo_pos.push(rigid_body.location.x);
        self.demo_pos.push(rigid_body.location.z);
        self.demo_pos.push(rigid_body.location.y);
        self.demo_pos.push(rigid_body.location.x);
        self.demo_pos.push(rigid_body.location.z);
        self.demo_pos.push(rigid_body.location.y);
        self.demolished.push(true);
        self.demolished.push(false);
        self.demolished_times.push(time);
        self.demolished_times.push(time + 1.0);
    }

    pub fn reset(&mut self, time: f32) {
        if self.boost_data.active.last().unwrap().clone() {
            self.boost_data.active.push(false);
            self.boost_data.times.push(time);
        }
    }
}
