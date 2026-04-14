mod config;
mod helpers;
mod routes;

use axum::{
    routing::{post},
    Router,
};
use routes::decode::post_decode_handler;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();

    let cors_layer = config::cors::build_cors_layer();

    let app = Router::new()
        .route("/api/v1/decode", post(post_decode_handler))
        .layer(cors_layer);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}