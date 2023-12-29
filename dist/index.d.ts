type KeyOf<T> = keyof T;

type ValueOf<T> = T[KeyOf<T>];

type FormValidator<T> = (values: T) => Promise<Record<keyof T, unknown>>;

export declare class Form<T extends Record<string, unknown>> {
  constructor(args: { initialValues: T; validator?: FormValidator<T> });

  public register<K extends KeyOf<T>>(
    name: K,
    additionalProps?: Partial<HTMLInputElement>
  ): Pick<HTMLInputElement, "name" | "oninput" | "onfocus"> & { value: import("vanjs-core").State<T[typeof name]> };

  public getValue<K extends KeyOf<T>>(name: K): T[typeof name];

  public setValue<K extends KeyOf<T>>(name: K, value: T[typeof name]);

  public observe(): T;

  public observe<K extends KeyOf<T>>(...names: K[]): { [I in (typeof names)[number]]: T[I] };

  public reset(): void;

  public reset<K extends keyof T>(...names: K[]);

  public handleSubmit(handler: (values: T) => void): (e: SubmitEvent) => void;
}

export declare const yupValidator: <T>(schema: import("yup").Schema) => FormValidator<T>;
