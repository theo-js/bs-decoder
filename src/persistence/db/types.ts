import type { STORES } from "./schema";

export type DbWriteMessage<ValueType> = {
    type: 'DB_WRITE';
    transaction: keyof typeof STORES;
    value: ValueType;
}