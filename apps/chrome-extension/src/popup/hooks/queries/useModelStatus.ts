import { sendToBackground } from '@plasmohq/messaging';
import { useEffect, useRef, useState } from 'react';
import {
	ModelService,
	type ModelStatus
} from '~background/services/ModelService';

export function useModelStatus() {
	const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
	const aliveRef = useRef(true);

	useEffect(() => {
		// Initial fetch
		sendToBackground({ name: 'get-model-status' }).then((res) => {
			if (aliveRef.current) setModelStatus(res);
		});

		// Listen to updates
		function handler(msg) {
			if (msg.type === ModelService.MODEL_STATUS_UPDATED && aliveRef.current)
				setModelStatus(msg.status);
		}

		chrome.runtime.onMessage.addListener(handler);

		return () => {
			aliveRef.current = false;
			chrome.runtime.onMessage.removeListener(handler);
		};
	}, []);

	return { modelStatus };
}
