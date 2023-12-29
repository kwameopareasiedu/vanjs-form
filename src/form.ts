import van, { State } from "vanjs-core";

type KeyOf<T> = keyof T;

type ValueOf<T> = T[KeyOf<T>];

interface Field<T> {
  value: State<T>;
  touched: State<boolean>;
  error: State<string | null>;
}

type FormValidator<T> = (values: T) => Promise<T>;

export class Form<T extends Record<string, unknown>> {
  private readonly initialValues: T;
  private readonly fields: Record<KeyOf<T>, Field<ValueOf<T>>>;
  private readonly validator: FormValidator<T>;
  // TODO: Implement input mode as input/change
  // TODO: Implement validation mode as change/submit

  constructor(args: { initialValues: T; validator?: FormValidator<T> }) {
    this.initialValues = args.initialValues;
    this.fields = {} as Record<KeyOf<T>, Field<ValueOf<T>>>;
    this.validator = args.validator ?? ((values: T) => Promise.resolve(values));

    // From the initial values, register the fields
    for (const key in args.initialValues) {
      this.fields[key] = {
        value: van.state(args.initialValues[key]),
        touched: van.state(false),
        error: van.state(null)
      };
    }
  }

  register<K extends KeyOf<T>>(name: K, additionalProps?: Partial<HTMLInputElement>) {
    const field: Field<T[typeof name]> = this.fields[name] as never;

    if (field) {
      const handleInput = (e: KeyboardEvent) => {
        field.value.val = (e.target as HTMLInputElement).value as never;
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
      } as Pick<HTMLInputElement, "name" | "oninput" | "onfocus"> & { value: State<T[typeof name]> };
    } else throw new Error(`No field with name "${name as string}"`);
  }

  getValue(name: keyof T) {
    const field: Field<T[typeof name]> = this.fields[name];
    if (field) return field.value.val;
    else throw new Error(`No field with name "${name as string}"`);
  }

  setValue<K extends KeyOf<T>>(name: K, value: T[typeof name]) {
    const field: Field<T[typeof name]> = this.fields[name] as never;
    if (field) field.value.val = value;
    else throw new Error(`No field with name "${name as string}"`);
  }

  observe<K extends KeyOf<T>>(...names: K[]) {
    const values: Record<K, T[K]> = {} as Record<K, T[K]>;

    if (names.length > 0) {
      for (const name of names) {
        const field: Field<unknown> = this.fields[name];
        values[name] = field.value.val as never;
      }
    } else {
      for (const key in this.fields) {
        const field: Field<unknown> = this.fields[key];
        values[key as never] = field.value.val as never;
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

  handleSubmit(handler: (values: T) => void) {
    return (e: SubmitEvent) => {
      e.preventDefault();

      const values: T = {} as T;

      for (const key in this.fields) {
        const field: Field<unknown> = this.fields[key];
        values[key] = field.value.val as never;
      }

      this.validator(values).then((values) => handler(values));
    };
  }
}
