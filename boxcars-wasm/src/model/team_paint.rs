use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct TeamPaint {
    pub primary_color: u8,
    pub accent_color: u8,
    pub primary_finish: u32,
    pub accent_finish: u32,
}

impl TeamPaint {
    pub fn from(tp: &boxcars::attributes::TeamPaint) -> TeamPaint {
        TeamPaint {
            primary_color: tp.primary_color,
            accent_color: tp.accent_color,
            primary_finish: tp.primary_finish,
            accent_finish: tp.accent_finish,
        }
    }
}
