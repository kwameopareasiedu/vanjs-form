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

  // Returns an object containing the field states with helper methods to update in the form state
  getFieldProps(name: keyof T, additionalProps?: Partial<HTMLInputElement>) {
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
        (values as T)[key] = field.value.val;
      }
    }

    return values;
  }

  // Reset the form fields to their initial values
  reset() {
    for (const key in this.fields) {
      const field: Field<unknown> = this.fields[key];
      field.value.val = this.initialValues[key];
      field.touched.val = null;
    }
  }
}
