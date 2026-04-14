export const config = {
	matches: ['https://www.youtube.com/*'],
	world: 'MAIN'
};

// Decorate fetch to log caption track URL requests
(function interceptFetchCaptionsResponse() {
	const originalFetch = window.fetch;

	window.fetch = async (...args) => {
		const response = await originalFetch(...args);

		const url = args[0];

		if (typeof url === 'string' && url.includes('timedtext')) {
			const clone = response.clone();
			const text = await clone.text();

			let captions;
			try {
				captions = JSON.parse(text);
			} catch {
				console.warn('Failed to parse captions response as JSON.');
			} finally {
				window.postMessage({
					name: 'YT_CAPTIONS',
					body: { captions }
				});
			}
		}

		return response;
	};
})();

(function interceptXHRCaptionsResponse() {
	const originalOpen = XMLHttpRequest.prototype.open;
	const originalSend = XMLHttpRequest.prototype.send;

	XMLHttpRequest.prototype.open = function (method, url, ...rest) {
		this._url = url;
		return originalOpen.call(this, method, url, ...rest);
	};

	XMLHttpRequest.prototype.send = function (...args) {
		this.addEventListener('load', async function () {
			if (this._url?.includes('timedtext')) {
				let captions;
				try {
					captions = JSON.parse(this.responseText);
				} catch {
					console.warn('Failed to parse captions response as JSON.');
				} finally {
					window.postMessage({
						name: 'YT_CAPTIONS',
						body: { captions }
					});
				}
			}
		});

		return originalSend.apply(this, args);
	};
})();
