use serde::Serialize;
use boxcars::attributes::{Product, ProductValue};

#[derive(Serialize, Debug)]
pub struct PlayerLoadoutPaints {
    pub body: u32,
    pub decal: u32,
    pub wheels: u32,
    pub boost: u32,
    pub antenna: u32,
    pub topper: u32,
    pub trail: u32,
    pub goal_explosion: u32,
    pub banner: u32,
}

impl PlayerLoadoutPaints {
    pub fn new() -> PlayerLoadoutPaints {
        PlayerLoadoutPaints {
            body: 0,
            decal: 0,
            wheels: 0,
            boost: 0,
            antenna: 0,
            topper: 0,
            trail: 0,
            goal_explosion: 0,
            banner: 0,
        }
    }

    pub fn copy(&mut self, data: &Vec<Vec<Product>>, objects: &Vec<String>) {
        self.body = get_paint_value(&data[0], &objects);
        self.decal = get_paint_value(&data[1], &objects);
        self.wheels = get_paint_value(&data[2], &objects);
        self.boost = get_paint_value(&data[3], &objects);
        self.antenna = get_paint_value(&data[4], &objects);
        self.topper = get_paint_value(&data[5], &objects);
        self.trail = get_paint_value(&data[14], &objects);
        self.goal_explosion = get_paint_value(&data[15], &objects);
        self.banner = get_paint_value(&data[16], &objects);
    }

    pub fn from(data: &Vec<Vec<Product>>, objects: &Vec<String>) -> PlayerLoadoutPaints {
        let mut lop = PlayerLoadoutPaints::new();
        lop.copy(&data, &objects);
        lop
    }
}

fn get_paint_value(attributes: &Vec<Product>, objects: &Vec<String>) -> u32 {
    for attr in attributes {
        let attr_name = match objects.get(attr.object_ind as usize) {
            None => continue,
            Some(attr_name) => attr_name
        };

        match attr_name.as_ref() {
            "TAGame.ProductAttribute_Painted_TA" => {
                match attr.value {
                    ProductValue::OldPaint(paint) => return paint,
                    ProductValue::NewPaint(paint) => return paint,
                    _ => continue
                }
            }
            _ => continue
        }
    }
    0
}
