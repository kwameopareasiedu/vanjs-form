import { PropValue, State } from "vanjs-core";

export declare class Form<T extends Record<string, unknown>> {
  constructor(args: { initialValues: T });

  public getFieldProps(
    name: keyof T,
    additionalProps?: Partial<HTMLInputElement>
  ): Pick<HTMLInputElement, "name" | "oninput" | "onfocus"> & { value: State<PropValue> };

  public observe(): T;

  public observe<K extends keyof T>(...names: K[]): Record<K, unknown>;

  public reset(): void;

  public reset<K extends keyof T>(...names: K[]);
}
