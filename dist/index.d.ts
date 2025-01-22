import { PropsWithKnownKeys, State } from 'vanjs-core';
import { ObjectSchema } from 'yup';

type KeyOf<T> = keyof T;
type Validator<T> = (values: T) => Promise<T | FormError<Partial<T>>>;
type FieldProps<T, K extends KeyOf<T>> = Pick<HTMLInputElement, "name" | "oninput" | "onfocus"> & {
    value?: State<T[K]>;
    checked?: State<boolean>;
};
declare class Form<T extends Record<string, unknown>> {
    private readonly initialValues;
    private readonly fields;
    private readonly validator;
    private readonly validationMode;
    constructor(args: {
        initialValues: T;
        validator?: Validator<T>;
        validationMode?: "oninput" | "onsubmit";
    });
    register<K extends KeyOf<T>>(name: K, additionalProps?: PropsWithKnownKeys<Omit<HTMLInputElement, "name" | "checked" | "oninput" | "onfocus">>): FieldProps<T, K> & typeof additionalProps;
    get<K extends KeyOf<T>>(name: K): T[typeof name];
    set<K extends KeyOf<T>>(name: K, value: T[typeof name]): void;
    error<K extends KeyOf<T>>(name: K): string;
    watch<K extends KeyOf<T>>(...names: K[]): typeof names extends K[] ? State<{
        [I in (typeof names)[number]]: T[I];
    }> : State<T>;
    errors<K extends KeyOf<T>>(...names: K[]): typeof names extends K[] ? State<{
        [I in (typeof names)[number]]: string;
    }> : State<Record<KeyOf<T>, string>>;
    reset<K extends keyof T>(...names: K[]): void;
    handleSubmit(handler: (values: T) => void): (e: SubmitEvent) => void;
    private validateField;
}
declare class FormError<T extends Record<string, unknown>> {
    errors: Record<KeyOf<T>, string>;
    constructor(errors: Record<KeyOf<T>, string>);
}
declare const yupValidator: <T extends Record<string, unknown>>(schema: ObjectSchema<T>) => Validator<T>;

export { Form, yupValidator };
