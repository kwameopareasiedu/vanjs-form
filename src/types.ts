export type KeyOf<T> = keyof T;

export type ValueOf<T> = T[KeyOf<T>];
