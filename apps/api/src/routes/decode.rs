use axum::{
    http::{StatusCode, header, HeaderMap, HeaderValue},
    Json,
    response::IntoResponse,
};
use serde::Deserialize;
use crate::helpers::download_subtitles::download_and_read_subtitles;

#[derive(Debug, Deserialize)]
pub struct PostDecodeRequest {
    youtube_url: String,
    language: String,
}

pub async fn post_decode_handler(
    Json(payload): Json<PostDecodeRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let output_prefix = "temp";

    match download_and_read_subtitles(&payload.youtube_url, &payload.language, output_prefix).await {
        Ok(subtitles) => {
            // Create custom headers
            let mut headers = HeaderMap::new();
            headers.insert(
                header::CONTENT_TYPE, 
                HeaderValue::from_static("text/vtt")
            );
            
            Ok((headers, subtitles))
        },
        Err(err) => {
            eprintln!("Erreur: {}", err);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}