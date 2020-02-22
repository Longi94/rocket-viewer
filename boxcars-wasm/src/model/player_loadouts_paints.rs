use serde::Serialize;
use crate::model::player_loadout_paints::PlayerLoadoutPaints;

#[derive(Serialize, Debug)]
pub struct PlayerLoadoutsPaints {
    pub blue: PlayerLoadoutPaints,
    pub orange: Option<PlayerLoadoutPaints>,
}

impl PlayerLoadoutsPaints {
    pub fn new() -> Self {
        PlayerLoadoutsPaints {
            blue: PlayerLoadoutPaints::new(),
            orange: None,
        }
    }
}
