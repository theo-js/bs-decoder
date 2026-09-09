import type { ParsedCaption } from "~types/youtube/caption";
import type { Task } from "./types/Task";

export const TASK_IDS = {
    transformCaptionsTask: 'transformCaptionsTask',
    // ...
} as const satisfies Record<string, string>;

export const EXTENSION_STORAGE_KEYS = {
    ...TASK_IDS,
    // ...
} as const satisfies Record<string, string>;
