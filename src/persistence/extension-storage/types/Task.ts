type BaseTask = {};

type IdleTask = BaseTask & {
    status: 'idle';
}

type PendingTask = BaseTask & {
    status: 'pending';
}
type SuccessfulTask<DataType> = BaseTask & {
    status: 'success';
    data: DataType;
}
type ErrorTask<ErrorType> = BaseTask & {
    status: 'error';
    error: ErrorType;
}
export type Task<DataType, ErrorType> =
    IdleTask
    | PendingTask
    | SuccessfulTask<DataType>
    | ErrorTask<ErrorType>;
