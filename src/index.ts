import van, { State } from "vanjs-core";
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
        error: van.state("")
      };
    }
  }

  register<K extends KeyOf<T>>(name: K, additionalProps?: Partial<HTMLInputElement>) {
    const field = this.fields[name];
    const isCheckboxInput = additionalProps?.type === "checkbox";
    const isRadioInput = additionalProps?.type === "radio";

    if (field) {
      const handleInput = (e: KeyboardEvent) => {
        const target = e.target as HTMLInputElement;
        const value = isRadioInput ? additionalProps?.value : isCheckboxInput ? target.checked : target.value;

        field.value.val = value as never;

        if (this.validationMode === "oninput") this.validateField(name);

        (additionalProps as HTMLInputElement)?.oninput?.(e);
      };

      const handleFocus = (e: FocusEvent) => {
        field.touched.val = true;
        (additionalProps as HTMLInputElement)?.onfocus?.(e);
      };

      if (isCheckboxInput) {
        return {
          ...additionalProps,
          name: name as never,
          value: field.value as never,
          checked: field.value as never,
          oninput: handleInput as never,
          onfocus: handleFocus as never
        } as FieldProps<T, typeof name>;
      } else if (isRadioInput) {
        return {
          ...additionalProps,
          name: name as never,
          value: additionalProps?.value as never,
          checked: van.derive(() => field.value.val === additionalProps?.value) as never,
          oninput: handleInput as never,
          onfocus: handleFocus as never
        } as FieldProps<T, typeof name>;
      } else {
        return {
          ...additionalProps,
          name: name as never,
          value: field.value as never,
          // checked: field.checked as never,
          oninput: handleInput as never,
          onfocus: handleFocus as never
        } as FieldProps<T, typeof name>;
      }
    } else throw new Error(`No field named "${name as string}"`);
  }

  get<K extends KeyOf<T>>(name: K) {
    const field = this.fields[name];
    if (!field) throw new Error(`No field named "${name as string}"`);
    return field.value.val;
  }

  set<K extends KeyOf<T>>(name: K, value: T[typeof name]) {
    const field = this.fields[name];
    if (!field) throw new Error(`No field named "${name as string}"`);
    field.value.val = value;

    if (this.validationMode === "oninput") this.validateField(name);
  }

  error<K extends KeyOf<T>>(name: K) {
    const field = this.fields[name];
    if (!field) throw new Error(`No field named "${name as string}"`);
    return field.error.val;
  }

  watch<K extends KeyOf<T>>(...names: K[]) {
    return van.derive(() => {
      const values: Record<K, T[K]> = {} as Record<K, T[K]>;

      if (names.length > 0) {
        for (const name of names) {
          const field = this.fields[name];
          values[name] = field.value.val as never;
        }
      } else {
        for (const key in this.fields) {
          const field = this.fields[key];
          values[key as never] = field.value.val as never;
        }
      }

      return values;
    });
  }

  reset<K extends keyof T>(...names: K[]) {
    if (names.length > 0) {
      for (const name of names) {
        const field = this.fields[name];
        field.value.val = this.initialValues[name];
        field.touched.val = false;
        field.error.val = "";

        if (this.validationMode === "oninput") this.validateField(name);
      }
    } else {
      for (const key in this.fields) {
        const field = this.fields[key];
        field.value.val = this.initialValues[key];
        field.touched.val = false;
        field.error.val = "";

        if (this.validationMode === "oninput") this.validateField(key);
      }
    }
  }

  handleSubmit(handler: (values: T) => void) {
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

  private validateField<K extends keyof T>(name: K) {
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

export const yupValidator = <T extends Record<string, unknown>>(schema: ObjectSchema<T>) => {
  return async (values: T) => {
    try {
      return await schema.validate(values, { abortEarly: false });
    } catch (_err) {
      const yupError = _err as YupError;
      const errorMap = {} as Record<string, string>;

      yupError.errors.forEach((yupErrorStr, i) => {
        errorMap[yupError.inner[i].path! as never] = yupErrorStr;
      });

      return new FormError(errorMap);
    }
  };
};
