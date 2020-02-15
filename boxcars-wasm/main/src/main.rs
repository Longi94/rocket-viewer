use std::fs;
use boxcars_wasm::parse_and_clean_replay;

fn main() {
    let data = fs::read("test_replays/hoops.replay");
    match data {
        Ok(data) => {
            parse_and_clean_replay(&data);
            return;
        },
        Err(e) => {
            println!("{}", e.to_string());
            return;
        }
    }
    return;
}
