import type { PlasmoMessaging } from '@plasmohq/messaging';
import { modelService } from '~background';

const handler: PlasmoMessaging.Handler = async (_, res) => {
	return res.send(modelService?.getModelStatus());
};

export default handler;
