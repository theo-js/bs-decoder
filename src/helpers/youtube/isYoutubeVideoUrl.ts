export function isYoutubeVideoUrl(url: string): boolean {
	try {
		const parsedUrl = new URL(url);

		if (
			!parsedUrl.hostname.match(/^(www\.)?youtube\.com$/) &&
			!parsedUrl.hostname.match(/^youtu\.be$/)
		) {
			return false;
		}

		// For youtu.be (short format)
		if (parsedUrl.hostname.match(/^youtu\.be$/)) {
			return parsedUrl.pathname.length > 1; // There must be an id after the slash
		}

		// For youtube.com
		// Verify that the route is /shorts
		if (/^\/shorts/.test(parsedUrl.pathname))
			return true;
		
		if (
			// or /watch
			/^\/watch/.test(parsedUrl.pathname)
			// Verify that search param 'v' exists
			&& parsedUrl.searchParams.has('v')
		)
			return true;

		return false;
	} catch {
		// Invalid URL
		return false;
	}
}
