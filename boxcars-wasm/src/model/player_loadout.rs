use serde::Serialize;
use boxcars::attributes::Loadout;

#[derive(Serialize, Debug)]
pub struct PlayerLoadout {
    pub body: u32,
    pub decal: u32,
    pub wheels: u32,
    pub boost: u32,
    pub antenna: u32,
    pub topper: u32,
    pub engine_audio: u32,
    pub trail: u32,
    pub goal_explosion: u32,
    pub banner: u32,
}

impl PlayerLoadout {
    pub fn new() -> Self {
        PlayerLoadout {
            body: 0,
            decal: 0,
            wheels: 0,
            boost: 0,
            antenna: 0,
            topper: 0,
            engine_audio: 0,
            trail: 0,
            goal_explosion: 0,
            banner: 0,
        }
    }

    pub fn copy(&mut self, loadout: &Loadout) {
        self.body = loadout.body;
        self.decal = loadout.decal;
        self.wheels = loadout.wheels;
        self.boost = loadout.rocket_trail;
        self.antenna = loadout.antenna;
        self.topper = loadout.topper;
        self.engine_audio = loadout.engine_audio.unwrap_or(0);
        self.trail = loadout.trail.unwrap_or(0);
        self.goal_explosion = loadout.goal_explosion.unwrap_or(0);
        self.banner = loadout.banner.unwrap_or(0);
    }

    pub fn from(loadout: &Loadout) -> PlayerLoadout {
        let mut lo = PlayerLoadout::new();
        lo.copy(&loadout);
        lo
    }
}
