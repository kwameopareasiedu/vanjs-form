import { State } from "vanjs-core";

type KeyOf<T> = keyof T;

// const target = { name: "", email: "", gender: "", age: 0 };
// type T = typeof target;
// type TK = keyof typeof target;
// const names: TK[] = ["name", "gender", "email", "age"];
// type Test1 = { [I in typeof names[number]]: I extends TK ? T[I] : never };
// type Test2 = { [I in typeof names[number]]: T[I] };

export declare class Form<T extends Record<string, unknown>> {
  constructor(args: { initialValues: T });

  public register<K extends KeyOf<T>>(
    name: K,
    additionalProps?: Partial<HTMLInputElement>
  ): Pick<HTMLInputElement, "name" | "oninput" | "onfocus"> & { value: State<T[typeof name]> };

  public getValue(name: KeyOf<T>): T[typeof name];

  public setValue<K extends KeyOf<T>>(name: K, value: T[typeof name]);

  public observe(): T;

  public observe<K extends KeyOf<T>>(...names: K[]): { [I in (typeof names)[number]]: T[I] };

  public reset(): void;

  public reset<K extends keyof T>(...names: K[]);

  public handleSubmit(handler: (values: T) => void): (e: SubmitEvent) => void;
}
