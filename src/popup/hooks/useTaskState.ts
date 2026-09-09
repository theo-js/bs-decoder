import { useEffect, useState } from "react";
import type { TASK_IDS } from "~persistence/extension-storage/schema";
import type { Task } from "~persistence/extension-storage/types/Task";

export function useTaskState<DataType, ErrorType>({
    taskId
}: {
    taskId: keyof typeof TASK_IDS
}) {
    const [taskState, setTaskState] = useState<Task<DataType, ErrorType>>({ status: 'idle' });

    // Get initial value
    useEffect(() => {
        (async () => {
            const { [taskId]: storedTask } = await chrome.storage.session.get(taskId);
            if (storedTask) setTaskState(storedTask);
        })();
    }, [taskId]);

    // Listen to messages for real-time updates
    useEffect(() => {
        function listener (message) {
            if (message.type === "TASK" && message.taskId === taskId)
                setTaskState(message.task);
        }

        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []);

    return [
        taskState,
        // Apply manual changes from the popup
        async (newState: typeof taskState) => {
            setTaskState(newState);
            return chrome.storage.session.set({ [taskId]: newState });
        }
    ] as [
        Task<DataType, ErrorType>,
        ((newState: Task<DataType, string>) => Promise<void>)
    ];
}