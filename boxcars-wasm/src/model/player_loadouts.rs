use serde::Serialize;
use crate::model::player_loadout::PlayerLoadout;

#[derive(Serialize, Debug)]
pub struct PlayerLoadouts {
    pub blue: PlayerLoadout,
    pub orange: Option<PlayerLoadout>,
}

impl PlayerLoadouts {
    pub fn new() -> Self {
        PlayerLoadouts {
            blue: PlayerLoadout::new(),
            orange: None,
        }
    }
}
