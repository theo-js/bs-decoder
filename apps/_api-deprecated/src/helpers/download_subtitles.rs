use std::process::Command;
use std::fs;

pub async fn download_and_read_subtitles(
    url: &str,
    lang: &str,
    output_prefix: &str,
) -> Result<String, String> {
    let yt_dlp_path = "bin/yt-dlp.exe";

    // Ex: output_prefix = "temp", lang = "fr" → fichier = "temp.fr.vtt"
    let output_template = format!("{}.%(ext)s", output_prefix);
    let filename = format!("{}.{}.vtt", output_prefix, lang);

    let result = Command::new(yt_dlp_path)
        .args([
            "--write-auto-sub",
            "--sub-lang", lang,
            "--skip-download",
            "--output", &output_template,
            url,
        ])
        .output()
        .map_err(|e| format!("Erreur système: {}", e))?;

    if !result.status.success() {
        return Err(format!(
            "yt-dlp a échoué: {}",
            String::from_utf8_lossy(&result.stderr)
        ));
    }

    let content = fs::read_to_string(&filename)
        .map_err(|_| format!("Fichier sous-titres non trouvé : {}", filename))?;

    // Nettoyage optionnel du fichier
    let _ = fs::remove_file(&filename);

    Ok(content)
}