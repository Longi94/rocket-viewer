use serde::Serialize;
use crate::model::player_loadouts::PlayerLoadouts;
use crate::model::body_states::BodyStates;
use crate::model::player_loadouts_paints::PlayerLoadoutsPaints;
use crate::model::team_paint::TeamPaint;
use crate::model::jump::JumpData;

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
            team_paint_blue: None,
            team_paint_orange: None,
        }
    }
}
