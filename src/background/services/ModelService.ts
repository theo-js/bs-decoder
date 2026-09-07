import type { Text2TextGenerationPipeline } from '@huggingface/transformers';
import { pipeline, env } from '@xenova/transformers';

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

export class ModelService {
	constructor() {
		env.useBrowserCache = true;
	}

	private pipePromise: Promise<Text2TextGenerationPipeline> | null = null;

	readonly MODEL_ID = 'Xenova/flan-t5-small';

	status: ModelStatus = 'idle';
	static readonly MODEL_STATUS_UPDATED = 'MODEL_STATUS_UPDATED';

	private notify() {
		chrome.runtime.sendMessage({
			type: ModelService.MODEL_STATUS_UPDATED,
			status: this.status
		});
	}

	public getModelStatus() {
		return this.status;
	}

	private initModel() {
		if (this.pipePromise) return this.pipePromise;

		this.status = 'loading';
		this.notify();

		this.pipePromise = pipeline('text2text-generation', this.MODEL_ID)
			.then((pipe) => {
				this.status = 'ready';
				this.notify();
				return pipe;
			})
			.catch((err) => {
				this.status = 'error';
				this.notify();
				throw err;
			});

		return this.pipePromise;
	}

	public async getModel() {
		if (!this.pipePromise) return this.initModel();
		return this.pipePromise;
	}
}
