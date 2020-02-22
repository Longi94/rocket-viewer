use serde::Serialize;
use crate::model::player_loadouts::PlayerLoadouts;
use crate::model::body_states::BodyStates;

#[derive(Serialize, Debug)]
pub struct PlayerData {
    pub id: i32,
    pub name: Option<String>,
    pub team: Option<u32>,
    pub loadouts: PlayerLoadouts,
    pub body_states: BodyStates,
    pub visible: Vec<bool>,
}

impl PlayerData {
    pub fn new(id: i32) -> Self {
        PlayerData {
            id,
            name: None,
            team: None,
            body_states: BodyStates::new(),
            loadouts: PlayerLoadouts::new(),
            visible: Vec::new(),
        }
    }
}
