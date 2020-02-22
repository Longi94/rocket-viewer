use crate::model::frame_data::FrameData;
use crate::model::vector::Vector3;

pub fn clean_frame_data(mut frame_data: FrameData) -> FrameData {
    smooth_ball_path(&frame_data.ball_data.body_states.positions,
                     &mut frame_data.ball_data.body_states.times,
                     &frame_data.ball_data.body_states.linear_velocity);

//    for (_, player_data) in &mut frame_data.players {
//        fix_position_times(
//            &mut player_data.positions,
//            &mut player_data.position_times,
//            &mut player_data.linear_velocity,
//        );
//    }

    // Sometimes there are big gaps between frames (kickoff, goals, demos) that would cause
    // the interpolation to slowly drift the models. Add artificial frames to prevent that.
    fix_position_frames(
        &mut frame_data.ball_data.body_states.positions,
        &mut frame_data.ball_data.body_states.rotations,
        &mut frame_data.ball_data.body_states.times,
    );

    for (_, player_data) in &mut frame_data.players {
        fix_position_frames(
            &mut player_data.body_states.positions,
            &mut player_data.body_states.rotations,
            &mut player_data.body_states.times,
        );
    }
    frame_data
}

fn fix_position_frames(p: &mut Vec<f32>, q: &mut Vec<f32>, times: &mut Vec<f32>) {
    for i in (0..(times.len() - 2)).rev() {
        if times[i + 1] - times[i] > 1.0 {
            let new_time = times[i + 1] - 1.0 / 30.0;
            times.insert(i + 1, new_time);
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

fn smooth_ball_path(p: &Vec<f32>, times: &mut Vec<f32>, velocities: &Vec<Vector3>) {
    let mut path_vectors: Vec<Vector3> = Vec::with_capacity(times.len() - 1);
    let v: Vec<f32> = velocities.iter().map(|x| x.len()).collect();

    // find the first frame where v is not 0
    let mut start: usize = 0;
    while v[start] == 0.0 {
        let current_vec = v_subtract(&p, start, start + 1);
        path_vectors.push(current_vec);

        start += 1;
    }

    let mut pivots: Vec<usize> = vec![start];

    for i in start..times.len() - 1 {
        let current_vec = v_subtract(&p, i, i + 1);

        // Find all the pivot points, aka positions where the angle of the path is less than a
        // certain magic value
        // ball pivots are:
        // - points where velocity is 0
        // - points with big deltas between them
        // - points where the angle is smaller (indicates that ball trajectory was influenced by
        // something, or just reached the top of the parabola)
        if i > 0 && (
            v[i - 1] == 0.0 ||
                v[i] == 0.0 ||
                times[i] - times[i - 1] > 0.1 ||
                times[i + 1] - times[i] > 0.1 ||
                path_vectors[i - 1].cos_angle(&current_vec) < 0.95
        ) {
            pivots.push(i);
        }

        // Convert positions to path vectors (vectors pointing from one pos to the next)
        path_vectors.push(current_vec);
    }

    pivots.push(times.len() - 1);

    for i in 0..pivots.len() - 1 {
        if pivots[i] + 1 == pivots[i + 1] {
            continue;
        }

        let t = times[pivots[i + 1]] - times[pivots[i]];

        let mut orig_time = 0.0;
        for j in pivots[i]..pivots[i + 1] {
            let s = path_vectors[j].len();
            let v = velocities[j].len();

            if v > 0.0 {
                orig_time += s / v;
            }
        }
        let ratio = t / orig_time;

        for j in pivots[i] + 1..pivots[i + 1] {
            let s = path_vectors[j - 1].len();
            let v = velocities[j - 1].len();
            times[j] = times[j - 1] + s / v * ratio;
        }
    }
}

fn v_subtract(p: &Vec<f32>, a: usize, b: usize) -> Vector3 {
    Vector3 {
        x: p[a * 3] - p[b * 3],
        y: p[a * 3 + 1] - p[b * 3 + 1],
        z: p[a * 3 + 2] - p[b * 3 + 2],
    }
}
