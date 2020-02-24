mod ball;
mod boost;
mod car;
mod jump;
mod player;

use std::collections::HashMap;
use boxcars::Attribute;
use crate::model::frame_data::FrameData;
use crate::actor::ball::BallHandler;
use crate::actor::car::CarHandler;
use crate::actor::player::PlayerHandler;
use crate::model::ball::BallType;
use crate::actor::jump::{JumpHandler, DoubleJumpHandler, DodgeHandler};
use crate::model::frame_state::FrameState;
use crate::actor::boost::BoostHandler;

fn get_actor_attribute(actor_id: &i32, attr_name: &str,
                       all_actors: &HashMap<i32, HashMap<String, Attribute>>) -> Option<Attribute> {
    match all_actors.get(actor_id) {
        None => None,
        Some(actor) => match actor.get(attr_name) {
            None => None,
            Some(attr) => Some(attr.clone())
        }
    }
}

pub trait ActorHandler {
    fn update(&self, frame_data: &mut FrameData, state: &mut FrameState,
              actor_id: i32, updated_attr: &String,
              objects: &Vec<String>);
}

pub fn get_handler(object_name: &str) -> Option<Box<dyn ActorHandler>> {
    match object_name {
        "Archetypes.Ball.Ball_Default" => Some(Box::new(BallHandler { ball_type: BallType::Default })),
        "Archetypes.Ball.Ball_Basketball" => Some(Box::new(BallHandler { ball_type: BallType::Basketball })),
        "Archetypes.Ball.Ball_BasketBall" => Some(Box::new(BallHandler { ball_type: BallType::Basketball })),
        "Archetypes.Ball.Ball_Puck" => Some(Box::new(BallHandler { ball_type: BallType::Puck })),
        "Archetypes.Ball.CubeBall" => Some(Box::new(BallHandler { ball_type: BallType::Cube })),
        "Archetypes.Ball.Ball_Breakout" => Some(Box::new(BallHandler { ball_type: BallType::Breakout })),
        "Archetypes.Car.Car_Default" => Some(Box::new(CarHandler {})),
        "TAGame.Default__PRI_TA" => Some(Box::new(PlayerHandler {})),
        "Archetypes.CarComponents.CarComponent_Jump" => Some(Box::new(JumpHandler {})),
        "Archetypes.CarComponents.CarComponent_DoubleJump" => Some(Box::new(DoubleJumpHandler {})),
        "Archetypes.CarComponents.CarComponent_Dodge" => Some(Box::new(DodgeHandler {})),
        "Archetypes.CarComponents.CarComponent_Boost" => Some(Box::new(BoostHandler {})),
        _ => None
    }
}

pub fn get_player_id_from_car_component(attributes: &HashMap<String, Attribute>,
                                        all_actors: &HashMap<i32, HashMap<String, Attribute>>) -> Option<i32> {
    let car_actor_id = match attributes.get("TAGame.CarComponent_TA:Vehicle") {
        None => return None,
        Some(Attribute::Flagged(_, id)) => id.clone() as i32,
        Some(_) => return None,
    };

    let player_actor_id = match get_actor_attribute(
        &car_actor_id, "Engine.Pawn:PlayerReplicationInfo", &all_actors,
    ) {
        None => return None,
        Some(Attribute::Flagged(_, id)) => id.clone() as i32,
        Some(_) => return None,
    };

    match get_actor_attribute(&player_actor_id, "Engine.PlayerReplicationInfo:PlayerID", all_actors) {
        None => None,
        Some(Attribute::Int(player_id)) => Some(player_id),
        Some(_) => None,
    }
}

pub fn get_active_attribute(attributes: &HashMap<String, Attribute>) -> Option<u8> {
    match attributes.get("TAGame.CarComponent_TA:ReplicatedActive") {
        None => None,
        Some(Attribute::Byte(b)) => Some(b.clone()),
        Some(_) => None
    }
}
