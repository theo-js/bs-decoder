import { sendToContentScript, type PlasmoMessaging } from '@plasmohq/messaging';
import { sendPersistentTask } from '~background/helpers/sendPersistentTask';
import { captionsCodec } from '~helpers/captions/captions-codec';
import type { ParsedCaption } from '~types/youtube/caption';

export type TransformCaptionsParams = {
	captions: ParsedCaption[];
	groqApiKey: string;
    tabId: number | undefined;
};

const handler: PlasmoMessaging.Handler<TransformCaptionsParams> = async (req) => {
    const encodedCaptions = captionsCodec.encode(req.body.captions);
    const promptContents = `
    Here's a collection of captions that compose a text. Rewrite it entirely by "translating" the political doublespeak into what the person actually means, in a humorous way — feel free to make uncharitable assumptions about their intentions if it adds to the humor

            Rules:
            - Keep ALL <cap> tags unchanged.
            - Only modify text inside.
            - Understand the sentences globally.
            - Output in source language ONLY. This is not translation, never switch language.
            - The resulting text must have about the same length as the original.
            - Do not add any comments, only give the result.

    ${encodedCaptions}
    `;

    try {
        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                body: JSON.stringify({
                    model: 'groq/compound',
                    messages: [{
                        role: 'user',
                        content: promptContents
                    }]
                }),
                headers: {
                    'Authorization': `Bearer ${req.body.groqApiKey}`,
                    'Content-type': 'application/json',
                }
            }
        );
        if (!response.ok) {
            throw new Error(`Groq API request failed with status ${response.status}`);
        }

        const responseBody = await response.json() as { choices: { message: { reasoning: string; } }[] };
        const transformedEncodedCaptions = responseBody.choices[0]?.message.reasoning;
        const transformedCaptions = captionsCodec.decode(transformedEncodedCaptions);
    
        // Send transformed captions to content script
        await sendToContentScript({
            name: 'captions-transformed',
            tabId: req.body.tabId,
            body: transformedCaptions
        })

        // Confirm success to popup and extension storage
        sendPersistentTask<ParsedCaption[], string>({
            taskId: 'transformCaptionsTask',
            task: {
                status: 'success',
                data: transformedCaptions
            }
        });
    } catch (e) {
        sendPersistentTask<ParsedCaption[], string>({
            taskId: 'transformCaptionsTask',
            task: {
                status: 'error',
                error: e.message
            }
        });
    }    
};

export default handler;
