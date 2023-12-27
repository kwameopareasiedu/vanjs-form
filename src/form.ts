import van, { PropValue, State } from "vanjs-core";

interface Field<V> {
  value: State<V>;
  touched: State<boolean>;
  error: State<string | null>;
}

export class Form<T extends Record<string, unknown>> {
  private readonly initialValues: T;
  private readonly fields: Record<keyof T, Field<unknown>>;

  constructor(args: { initialValues: T }) {
    this.initialValues = args.initialValues;
    this.fields = {} as Record<keyof T, Field<unknown>>;

    // From the initial values, register the fields
    for (const key in args.initialValues) {
      this.fields[key] = {
        value: van.state(args.initialValues[key]),
        touched: van.state(false),
        error: van.state(null)
      };
    }
  }

  register(name: keyof T, additionalProps?: Partial<HTMLInputElement>) {
    const field: Field<unknown> = this.fields[name];

    if (field) {
      const handleInput = (e: KeyboardEvent) => {
        field.value.val = (e.target as HTMLInputElement).value;
        (additionalProps as HTMLInputElement)?.oninput?.(e);
      };

      const handleFocus = (e: FocusEvent) => {
        field.touched.val = true;
        (additionalProps as HTMLInputElement)?.onfocus?.(e);
      };

      return {
        ...additionalProps,
        name: name,
        value: field.value,
        oninput: handleInput,
        onfocus: handleFocus
      } as Pick<HTMLInputElement, "name" | "oninput" | "onfocus"> & { value: State<PropValue> };
    } else throw new Error(`No field with name "${name as string}"`);
  }

  getValue(name: keyof T) {
    const field: Field<unknown> = this.fields[name];
    if (field) return field.value.val;
    else throw new Error(`No field with name "${name as string}"`);
  }

  setValue(name: keyof T, value: unknown) {
    const field: Field<unknown> = this.fields[name];
    if (field) field.value.val = value;
    else throw new Error(`No field with name "${name as string}"`);
  }

  observe<K extends keyof T>(...names: K[]) {
    const values: Record<K, unknown> = {} as Record<K, unknown>;

    if (names.length > 0) {
      for (const name of names) {
        const field: Field<unknown> = this.fields[name];
        values[name] = field.value.val;
      }
    } else {
      for (const key in this.fields) {
        const field: Field<unknown> = this.fields[key];
        (values as Record<keyof T, unknown>)[key] = field.value.val;
      }
    }

    return values;
  }

  reset<K extends keyof T>(...names: K[]) {
    if (names.length > 0) {
      for (const name of names) {
        const field: Field<unknown> = this.fields[name];
        field.value.val = this.initialValues[name];
        field.touched.val = false;
        field.error.val = null;
      }
    } else {
      for (const key in this.fields) {
        const field: Field<unknown> = this.fields[key];
        field.value.val = this.initialValues[key];
        field.touched.val = false;
        field.error.val = null;
      }
    }
  }

  handleSubmit = (handler: (values: Record<keyof T, unknown>) => void) => (e: SubmitEvent) => {
    e.preventDefault();

    const values: Record<keyof T, unknown> = {} as Record<keyof T, unknown>;

    for (const key in this.fields) {
      const field: Field<unknown> = this.fields[key];
      values[key] = field.value.val;
    }

    handler(values);
  };
}
