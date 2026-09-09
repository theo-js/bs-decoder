import type { TASK_IDS } from "~persistence/extension-storage/schema"
import type { Task } from "~persistence/extension-storage/types/Task"

/**
 * Send a message to update the task's local state in the popup if open
 * and store the new state in the extension storage.
 */
export async function sendPersistentTask<DataType, ErrorType>({
    taskId,
    task,
    popupClosedCallback = () => {}
}: {
    taskId: keyof typeof TASK_IDS;
    task: Task<DataType, ErrorType>;
    popupClosedCallback?: () => void;
}) {
    await chrome.storage.session.set({ [taskId]: task });

    chrome.runtime.sendMessage({
        type: 'TASK',
        taskId,
        task
    })
        // If no popup is currently listening
        .catch(popupClosedCallback);
}