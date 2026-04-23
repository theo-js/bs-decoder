import { ModelService } from './services/ModelService';

export {};

export const modelService = new ModelService();

chrome.runtime.onInstalled.addListener(() => {
	// Start download immediately
	modelService.getModel();
});
