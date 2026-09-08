import type { ParsedCaption } from "~types/youtube/caption";

export const config = {
	matches: ['https://www.youtube.com/*'],
	world: 'MAIN'
};

(() => {
    const player = document.querySelector('video');
    if (!player) return;

    const SYNC_interval_IN_MS = 50;
    let syncIntervalId: number | null = null;

    window.addEventListener('message', (event) => {
        if (event.data.source !== 'captions-transformed-relay') return;

        const captions = event.data as ParsedCaption[];
        console.log('receiving transformed captions in content script', captions);

        // Pause
        function handlePauseCaptions () {
            if (typeof syncIntervalId === 'number') clearInterval(syncIntervalId);
            syncIntervalId = null;
        }
        handlePauseCaptions(); // in case decode was already clicked once for this video
        player?.addEventListener('pause', handlePauseCaptions);
        window.addEventListener('beforeunload', handlePauseCaptions);

        // Play
        function handlePlayCaptions () {
            syncIntervalId = setInterval(syncCaptions, SYNC_interval_IN_MS);
        }
        if (!player.paused) handlePlayCaptions();
        player?.addEventListener('play', handlePlayCaptions);

        // Progress
        function syncCaptions () {
            console.log(player!.currentTime, captions);
        } 
    });
})();