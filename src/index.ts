import van, { PropsWithKnownKeys, State } from "vanjs-core";
import type { ObjectSchema } from "yup";
import { ValidationError as YupError } from "yup";

type KeyOf<T> = keyof T;

type ValueOf<T> = T[KeyOf<T>];

type Validator<T> = (values: T) => Promise<T | FormError<Partial<T>>>;

type FieldProps<T, K extends KeyOf<T>> = Pick<HTMLInputElement, "name" | "oninput" | "onfocus"> & {
  value?: State<T[K]>;
  checked?: State<boolean>;
};

type Field<T> = {
  value: State<T>;
  touched: State<boolean>;
  error: State<string>;
};

export class Form<T extends Record<string, unknown>> {
  private readonly initialValues: T;
  private readonly fields: Record<KeyOf<T>, Field<ValueOf<T>>>;
  private readonly validator: Validator<T>;
  private readonly validationMode: "oninput" | "onsubmit";

  constructor(args: { initialValues: T; validator?: Validator<T>; validationMode?: "oninput" | "onsubmit" }) {
    this.initialValues = args.initialValues;
    this.fields = {} as Record<KeyOf<T>, Field<ValueOf<T>>>;
    this.validator = args.validator ?? ((values: T) => Promise.resolve(values));
    this.validationMode = args.validationMode ?? "onsubmit";

    // From the initial values, register the fields
    for (const key in args.initialValues) {
      this.fields[key] = {
        value: van.state(args.initialValues[key]),
        touched: van.state(false),
        error: van.state(""),
      };
    }
  }

  register<K extends KeyOf<T>>(
    name: K,
    additionalProps?: PropsWithKnownKeys<Omit<HTMLInputElement, "name" | "checked" | "oninput" | "onfocus">>,
  ): FieldProps<T, K> & typeof additionalProps {
    const field = this.fields[name];
    if (!field) throw new Error(`No field named "${name as string}"`);

    const isCheckboxInput = additionalProps?.type === "checkbox";
    const isRadioInput = additionalProps?.type === "radio";

    const handleInput = (e: KeyboardEvent) => {
      const target = e.target as HTMLInputElement;
      const value = isRadioInput ? additionalProps?.value : isCheckboxInput ? target.checked : target.value;

      field.value.val = value as never;

      if (this.validationMode === "oninput") this.validateField(name);

      (additionalProps as unknown as HTMLInputElement)?.oninput?.(e);
    };

    const handleFocus = (e: FocusEvent) => {
      field.touched.val = true;
      (additionalProps as unknown as HTMLInputElement)?.onfocus?.(e);
    };

    if (isCheckboxInput) {
      return {
        ...additionalProps,
        name: name as never,
        value: field.value as never,
        checked: field.value as never,
        oninput: handleInput as never,
        onfocus: handleFocus as never,
      };
    } else if (isRadioInput) {
      return {
        ...additionalProps,
        name: name as never,
        value: additionalProps?.value as never,
        checked: van.derive(() => field.value.val === additionalProps?.value) as never,
        oninput: handleInput as never,
        onfocus: handleFocus as never,
      };
    } else {
      return {
        ...additionalProps,
        name: name as never,
        value: field.value as never,
        oninput: handleInput as never,
        onfocus: handleFocus as never,
      };
    }
  }

  get<K extends KeyOf<T>>(name: K): T[typeof name] {
    const field = this.fields[name];
    if (!field) throw new Error(`No field named "${name as string}"`);
    return field.value.val as never;
  }

  set<K extends KeyOf<T>>(name: K, value: T[typeof name]): void {
    const field = this.fields[name];
    if (!field) throw new Error(`No field named "${name as string}"`);
    field.value.val = value;

    if (this.validationMode === "oninput") this.validateField(name);
  }

  error<K extends KeyOf<T>>(name: K): string {
    const field = this.fields[name];
    if (!field) throw new Error(`No field named "${name as string}"`);
    return field.error.val;
  }

  watch<K extends KeyOf<T>>(
    ...names: K[]
  ): typeof names extends K[] ? State<{ [I in (typeof names)[number]]: T[I] }> : State<T> {
    return van.derive(() => {
      const values: Record<KeyOf<T>, T[K]> = {} as Record<KeyOf<T>, T[K]>;

      if (names.length > 0) {
        for (const name of names) {
          const field = this.fields[name];
          values[name] = field.value.val as never;
        }
      } else {
        for (const key in this.fields) {
          const field = this.fields[key];
          values[key] = field.value.val as never;
        }
      }

      return values;
    }) as never;
  }

  errors<K extends KeyOf<T>>(
    ...names: K[]
  ): typeof names extends K[] ? State<{ [I in (typeof names)[number]]: string }> : State<Record<KeyOf<T>, string>> {
    return van.derive(() => {
      const errors: Record<KeyOf<T>, string> = {} as Record<KeyOf<T>, string>;

      if (names.length > 0) {
        for (const name of names) {
          const field = this.fields[name];
          errors[name] = field.error.val;
        }
      } else {
        for (const key in this.fields) {
          const field = this.fields[key];
          errors[key] = field.error.val;
        }
      }

      return errors;
    }) as never;
  }

  reset<K extends keyof T>(...names: K[]): void {
    if (names.length > 0) {
      for (const name of names) {
        const field = this.fields[name];
        field.value.val = this.initialValues[name];
        field.touched.val = false;
        field.error.val = "";

        // if (this.validationMode === "oninput") this.validateField(name);
      }
    } else {
      for (const key in this.fields) {
        const field = this.fields[key];
        field.value.val = this.initialValues[key];
        field.touched.val = false;
        field.error.val = "";

        // if (this.validationMode === "oninput") this.validateField(key);
      }
    }
  }

  handleSubmit(handler: (values: T) => void): (e: SubmitEvent) => void {
    return (e: SubmitEvent) => {
      e.preventDefault();

      const values: T = {} as T;

      for (const key in this.fields) {
        const field = this.fields[key];
        values[key] = field.value.val as never;
      }

      this.validator(values).then((valuesOrErrors) => {
        if (valuesOrErrors instanceof FormError) {
          for (const name in this.fields) {
            const errorString = valuesOrErrors.errors[name];
            const field = this.fields[name];
            if (field) field.error.val = errorString ?? "";
          }
        } else {
          for (const name in this.fields) {
            const field = this.fields[name];
            field.error.val = "";
          }

          handler(valuesOrErrors as T);
        }
      });
    };
  }

  private validateField<K extends keyof T>(name: K): void {
    const field = this.fields[name];

    if (field) {
      const values: T = {} as T;

      for (const key in this.fields) {
        const field = this.fields[key];
        values[key] = field.value.val as never;
      }

      this.validator(values).then((valuesOrErrors) => {
        if (valuesOrErrors instanceof FormError) {
          const errorString = valuesOrErrors.errors[name];
          field.error.val = errorString ?? "";
        } else field.error.val = "";
      });
    }
  }
}

class FormError<T extends Record<string, unknown>> {
  errors: Record<KeyOf<T>, string>;

  constructor(errors: Record<KeyOf<T>, string>) {
    this.errors = errors;
  }
}

export const yupValidator = <T extends Record<string, unknown>>(schema: ObjectSchema<T>): Validator<T> => {
  return (async (values: T) => {
    try {
      return await schema.validate(values, { abortEarly: false });
    } catch (_err) {
      const yupError = _err as YupError;
      const errorMap: Record<KeyOf<T>, string> = {} as Record<KeyOf<T>, string>;

      yupError.errors.forEach((yupErrorStr, i) => {
        errorMap[yupError.inner[i].path! as KeyOf<T>] = yupErrorStr;
      });

      return new FormError(errorMap);
    }
  }) as never;
};
