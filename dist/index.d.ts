type KeyOf<T> = keyof T;

type ValueOf<T> = T[KeyOf<T>];

type FormValidator<T> = (values: T) => Promise<Record<keyof T, unknown>>;

export declare class Form<T extends Record<string, unknown>> {
  constructor(args: { initialValues: T; validator?: FormValidator<T>; validationMode?: "oninput" | "onsubmit" });

  public register<K extends KeyOf<T>>(
    name: K,
    additionalProps?: Partial<HTMLInputElement>
  ): Pick<HTMLInputElement, "name" | "oninput" | "onfocus"> & { value: import("vanjs-core").State<T[typeof name]> };

  public get<K extends KeyOf<T>>(name: K): T[typeof name];

  public set<K extends KeyOf<T>>(name: K, value: T[typeof name]);

  public error<K extends KeyOf<T>>(name: K): string;

  // public errors(): Record<KeyOf<T>, string>;

  public watch(): import("vanjs-core").State<T>;

  public watch<K extends KeyOf<T>>(...names: K[]): import("vanjs-core").State<{ [I in (typeof names)[number]]: T[I] }>;

  public reset(): void;

  public reset<K extends keyof T>(...names: K[]);

  public handleSubmit(handler: (values: T) => void): (e: SubmitEvent) => void;
}

export declare const yupValidator: <T>(schema: import("yup").Schema) => FormValidator<T>;
