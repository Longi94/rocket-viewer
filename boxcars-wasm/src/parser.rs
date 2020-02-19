use crate::models::{ReplayVersion, FrameData};
use boxcars::{Replay, Attribute, Vector3f};
use std::collections::HashMap;
use crate::actor::{get_handler, ActorHandler};

pub struct FrameParser<'a> {
    pub replay: &'a Replay
}

impl<'a> FrameParser<'a> {
    pub fn parse(&self) -> Result<FrameData, &str> {
        let frames = match &self.replay.network_frames {
            None => return Ok(FrameData::with_capacity(0)),
            Some(frames) => frames
        };

        let count = frames.frames.len();
        if count == 0 {
            return Ok(FrameData::with_capacity(0));
        }

        let _replay_version = ReplayVersion(
            self.replay.major_version,
            self.replay.minor_version,
            self.replay.net_version.unwrap_or(0),
        );

        let mut frame_data = FrameData::with_capacity(count);
        let mut actors_handlers: HashMap<i32, Box<dyn ActorHandler>> = HashMap::new();
        let mut actors: HashMap<i32, HashMap<String, Attribute>> = HashMap::new();
        let mut actor_objects: HashMap<i32, String> = HashMap::new();
        let mut real_time: f32 = 0.0;

        for (i, frame) in frames.frames.iter().enumerate() {
            frame_data.times.push(frame.time);
            frame_data.deltas.push(frame.delta);

            real_time += frame.delta;

            for deleted in &frame.deleted_actors {
                actors_handlers.remove(&deleted.0);
                actors.remove(&deleted.0);
                actor_objects.remove(&deleted.0);
            }

            for new_actor in &frame.new_actors {
                actors.insert(new_actor.actor_id.0, HashMap::new());
                let object_name = match self.replay.objects.get(new_actor.object_id.0 as usize) {
                    None => continue,
                    Some(object_name) => object_name
                };
                actor_objects.insert(new_actor.actor_id.0, object_name.clone());

                let handler = match get_handler(object_name) {
                    None => continue,
                    Some(handler) => handler
                };

                actors_handlers.insert(new_actor.actor_id.0, handler);
            }

            for updated_actor in &frame.updated_actors {
                match actors.get_mut(&updated_actor.actor_id.0) {
                    None => continue,
                    Some(attributes) => {
                        match self.replay.objects.get(updated_actor.object_id.0 as usize) {
                            None => continue,
                            Some(object_name) => {
                                attributes.insert(object_name.clone(), updated_actor.attribute.clone());
                            }
                        };
                    }
                }
            }

            for updated_actor in &frame.updated_actors {
                let handler = match actors_handlers.get(&updated_actor.actor_id.0) {
                    None => continue,
                    Some(handler) => handler
                };

                let attributes = match actors.get(&updated_actor.actor_id.0) {
                    None => continue,
                    Some(attributes) => attributes
                };

                let object_name = match self.replay.objects.get(updated_actor.object_id.0 as usize) {
                    None => continue,
                    Some(object_name) => object_name
                };

                handler.update(i, &mut frame_data, &attributes, &object_name, &actors,
                               &actor_objects);
            }
        }

//        let mut c_total: f32 = 0.0;
//        for i in 0..frame_data.ball_data.position_times.len() - 1 {
//            let dt = frame_data.ball_data.position_times[i + 1] - frame_data.ball_data.position_times[i];
//            let v_vec = v_len(frame_data.ball_data.linear_velocity[i]);
//            let p_vec = p_len(&frame_data.ball_data.positions, i);
//            let vp = p_vec / dt;
//            let d2 = p_vec / v_vec;
//
//            if v_vec == 0.0 {
//                c_total += dt;
//            } else {
//                c_total += d2;
//            }
//
//
//            //println!("DIST {} | V1 {} | V2 {} | D1 {} | D2 {} | T1 {} | T2 {}", p_vec, v_vec, vp, dt, d2,
//            frame_data.ball_data.position_times[i + 1], c_total);
//        }

        // Sometimes there are big gaps between frames (kickoff, goals, demos) that would cause
        // the interpolation to slowly drift the models. Add artificial frames to prevent that.
//        fix_position_frames(
//            &mut frame_data.ball_data.positions,
//            &mut frame_data.ball_data.rotations,
//            &mut frame_data.ball_data.position_tim    es
//        );
//
//        for (_, player_data) in &mut frame_data.players {
//            fix_position_frames(
//                &mut player_data.positions,
//                &mut player_data.rotations,
//                &mut player_data.position_times
//            );
//        }

        Ok(frame_data)
    }
}

fn fix_position_frames(p: &mut Vec<f32>, q: &mut Vec<f32>, times: &mut Vec<f32>) {
    for i in (0..(times.len() - 2)).rev() {
        if times[i + 1] - times[i] > 1.0 {
            times.insert(i + 1, times[i + 1] - 1.0 / 30.0);
            p.insert((i + 1) * 3, p[i * 3 + 2]);
            p.insert((i + 1) * 3, p[i * 3 + 1]);
            p.insert((i + 1) * 3, p[i * 3]);

            q.insert((i + 1) * 4, q[i * 4 + 3]);
            q.insert((i + 1) * 4, q[i * 4 + 2]);
            q.insert((i + 1) * 4, q[i * 4 + 1]);
            q.insert((i + 1) * 4, q[i * 4]);
        }
    }
}


fn v_len(v: Option<Vector3f>) -> f32 {
    match v {
        None => 0.0,
        Some(v) => (v.x.powi(2) + v.y.powi(2) + v.z.powi(2)).sqrt()
    }
}

fn p_len(p: &Vec<f32>, i: usize) -> f32 {
    return ((p[i * 3] - p[(i + 1) * 3]).powi(2) +
        (p[i * 3 + 1] - p[(i + 1) * 3 + 1]).powi(2) +
        (p[i * 3 + 2] - p[(i + 1) * 3 + 2]).powi(2)
    ).sqrt();
}
