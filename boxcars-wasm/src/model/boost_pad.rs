use crate::model::vector::Vector3;
use boxcars::Vector3f;

pub struct BoostPad {
    pub id: i8,
    pub location: Vector3,
    pub big: bool,
}

impl BoostPad {
    pub fn in_range(&self, v: &Vector3f) -> bool {
        let height: f32 = if self.big { 168.0 } else { 165.0 };
        let radius: f32 = if self.big { 208.0 } else { 144.0 };

        v.z >= self.location.y && v.z <= self.location.y + height &&
            d2(v.x, self.location.x, v.y, self.location.z) <= radius
    }
}

fn d2(x1: f32, x2: f32, y1: f32, y2: f32) -> f32 {
    ((x1 - x2).powi(2) + (y1 - y2).powi(2)).sqrt()
}

pub fn get_boost_pads(map: &String) -> Vec<BoostPad> {
    match map.as_ref() {
        "HoopsStadium_P" => vec![
            BoostPad { id: 0, big: true, location: Vector3 { x: -2176.0, y: 8.0, z: -2944.0 } },
            BoostPad { id: 1, big: true, location: Vector3 { x: 2176.0, y: 8.0, z: -2944.0 } },
            BoostPad { id: 2, big: false, location: Vector3 { x: 0.0, y: 0.0, z: -2816.0 } },
            BoostPad { id: 3, big: false, location: Vector3 { x: -1280.0, y: 0.0, z: -2304.0 } },
            BoostPad { id: 4, big: false, location: Vector3 { x: 1280.0, y: 0.0, z: -2304.0 } },
            BoostPad { id: 5, big: false, location: Vector3 { x: -1536.0, y: 0.0, z: -1024.0 } },
            BoostPad { id: 6, big: false, location: Vector3 { x: 1536.0, y: 0.0, z: -1024.0 } },
            BoostPad { id: 7, big: false, location: Vector3 { x: -512.0, y: 0.0, z: -512.0 } },
            BoostPad { id: 8, big: false, location: Vector3 { x: 512.0, y: 0.0, z: -512.0 } },
            BoostPad { id: 9, big: true, location: Vector3 { x: -2432.0, y: 8.0, z: 0.0 } },
            BoostPad { id: 10, big: true, location: Vector3 { x: 2432.0, y: 8.0, z: 0.0 } },
            BoostPad { id: 11, big: false, location: Vector3 { x: -512.0, y: 0.0, z: 512.0 } },
            BoostPad { id: 12, big: false, location: Vector3 { x: 512.0, y: 0.0, z: 512.0 } },
            BoostPad { id: 13, big: false, location: Vector3 { x: -1536.0, y: 0.0, z: 1024.0 } },
            BoostPad { id: 14, big: false, location: Vector3 { x: 1536.0, y: 0.0, z: 1024.0 } },
            BoostPad { id: 15, big: false, location: Vector3 { x: -1280.0, y: -0.0, z: 2304.0 } },
            BoostPad { id: 16, big: false, location: Vector3 { x: 1280.0, y: 0.0, z: 2304.0 } },
            BoostPad { id: 17, big: false, location: Vector3 { x: 0.0, y: 0.0, z: 2816.0 } },
            BoostPad { id: 18, big: true, location: Vector3 { x: -2176.0, y: 8.0, z: 2944.0 } },
            BoostPad { id: 19, big: true, location: Vector3 { x: 2176.0, y: 8.0, z: 2944.0 } },
        ],
        _ => vec![
            BoostPad { id: 0, big: false, location: Vector3 { x: 0.0, y: 6.0, z: -4240.0 } },
            BoostPad { id: 1, big: false, location: Vector3 { x: -1792.0, y: 6.0, z: -4184.0 } },
            BoostPad { id: 2, big: false, location: Vector3 { x: 1792.0, y: 6.0, z: -4184.0 } },
            BoostPad { id: 3, big: true, location: Vector3 { x: -3072.0, y: 9.0, z: -4096.0 } },
            BoostPad { id: 4, big: true, location: Vector3 { x: 3072.0, y: 9.0, z: -4096.0 } },
            BoostPad { id: 5, big: false, location: Vector3 { x: -940.0, y: 6.0, z: -3308.0 } },
            BoostPad { id: 6, big: false, location: Vector3 { x: 940.0, y: 6.0, z: -3308.0 } },
            BoostPad { id: 7, big: false, location: Vector3 { x: 0.0, y: 6.0, z: -2816.0 } },
            BoostPad { id: 8, big: false, location: Vector3 { x: -3584.0, y: 6.0, z: -2484.0 } },
            BoostPad { id: 9, big: false, location: Vector3 { x: 3584.0, y: 6.0, z: -2484.0 } },
            BoostPad { id: 10, big: false, location: Vector3 { x: -1788.0, y: 6.0, z: -2300.0 } },
            BoostPad { id: 11, big: false, location: Vector3 { x: 1788.0, y: 6.0, z: -2300.0 } },
            BoostPad { id: 12, big: false, location: Vector3 { x: -2048.0, y: 6.0, z: -1036.0 } },
            BoostPad { id: 13, big: false, location: Vector3 { x: 0.0, y: 6.0, z: -1024.0 } },
            BoostPad { id: 14, big: false, location: Vector3 { x: 2048.0, y: 6.0, z: -1036.0 } },
            BoostPad { id: 15, big: true, location: Vector3 { x: -3584.0, y: 9.0, z: 0.0 } },
            BoostPad { id: 16, big: false, location: Vector3 { x: -1024.0, y: 6.0, z: 0.0 } },
            BoostPad { id: 17, big: false, location: Vector3 { x: 1024.0, y: 6.0, z: 0.0 } },
            BoostPad { id: 18, big: true, location: Vector3 { x: 3584.0, y: 9.0, z: 0.0 } },
            BoostPad { id: 19, big: false, location: Vector3 { x: -2048.0, y: 6.0, z: 1036.0 } },
            BoostPad { id: 20, big: false, location: Vector3 { x: 0.0, y: 6.0, z: 1024.0 } },
            BoostPad { id: 21, big: false, location: Vector3 { x: 2048.0, y: 6.0, z: 1036.0 } },
            BoostPad { id: 22, big: false, location: Vector3 { x: -1788.0, y: 6.0, z: 2300.0 } },
            BoostPad { id: 23, big: false, location: Vector3 { x: 1788.0, y: 6.0, z: 2300.0 } },
            BoostPad { id: 24, big: false, location: Vector3 { x: -3584.0, y: 6.0, z: 2484.0 } },
            BoostPad { id: 25, big: false, location: Vector3 { x: 3584.0, y: 6.0, z: 2484.0 } },
            BoostPad { id: 26, big: false, location: Vector3 { x: 0.0, y: 6.0, z: 2816.0 } },
            BoostPad { id: 27, big: false, location: Vector3 { x: -940.0, y: 6.0, z: 3308.0 } },
            BoostPad { id: 28, big: false, location: Vector3 { x: 940.0, y: 6.0, z: 3308.0 } },
            BoostPad { id: 29, big: true, location: Vector3 { x: -3072.0, y: 9.0, z: 4096.0 } },
            BoostPad { id: 30, big: true, location: Vector3 { x: 3072.0, y: 9.0, z: 4096.0 } },
            BoostPad { id: 31, big: false, location: Vector3 { x: -1792.0, y: 6.0, z: 4184.0 } },
            BoostPad { id: 32, big: false, location: Vector3 { x: 1792.0, y: 6.0, z: 4184.0 } },
            BoostPad { id: 33, big: false, location: Vector3 { x: 0.0, y: 6.0, z: 4240.0 } }, ]
    }
}
