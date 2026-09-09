import { Info, KeyRoundIcon } from "lucide-react";
import { useEffect, type Dispatch, type FC, type SetStateAction } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~components/ui/hover-card";

type GroqApiKeyFieldProps = {
    groqApiKey: string;
    setGroqApiKey: Dispatch<SetStateAction<string>>;
}

export const GroqApiKeyField: FC<GroqApiKeyFieldProps> = ({ groqApiKey, setGroqApiKey }) => {
    useEffect(() => {
        chrome.storage.local.get('groqApiKey', (result) => {
            if (chrome.runtime.lastError) {
                console.error('Unable to load the Groq API key', chrome.runtime.lastError);
                return;
            }

            const storedApiKey = result.groqApiKey;
            if (typeof storedApiKey === 'string') {
                setGroqApiKey(storedApiKey);
            }
        });
    }, []);

    return (
        <div>
            <label htmlFor="groq-api-key" className="field-label">
                <span className="flex items-center gap-1"><KeyRoundIcon className="size-3.5" /> Groq API key</span>
                <HoverCard>
                    <HoverCardTrigger
                        openOnHover
                        render={
                            <button
                                type="button"
                                aria-label="How to get a Groq API key"
                                className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                            />
                        }>
                        <Info className="size-3" />
                    </HoverCardTrigger>
                    <HoverCardContent>
                        <p className="font-medium text-[#5b2db8]">Get your Groq API key</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Create a free account at console.groq.com, open the API Keys
                            section, create a key, then paste it here. It is saved only
                            in this extension&apos;s local storage.
                        </p>
                    </HoverCardContent>
                </HoverCard>
            </label>
            
            <input
                id="groq-api-key"
                type="password"
                autoComplete="off"
                value={groqApiKey}
                onChange={(event) => {
                    const value = event.target.value;
                    setGroqApiKey(value);
                    chrome.storage.local.set({ groqApiKey: value }, () => {
                        if (chrome.runtime.lastError) {
                            console.error('Unable to save the Groq API key', chrome.runtime.lastError);
                        }
                    });
                }}
                className="api-key-input"
                placeholder="gsk_..."
            />
        </div>
    );
}