import type { ObjectSchema, ValidationError } from "yup";

export type FormValidator<T> = (values: T) => Promise<Record<keyof T, unknown>>;

export const yupValidator = <T extends Record<string, unknown>>(schema: ObjectSchema<T>) => {
  return (values: T) => {
    return schema
      .validate(values, { abortEarly: false })
      .then((values) => values)
      .catch((err: ValidationError) => {
        const errors = {} as Record<string, string>;

        for (let i = 0; i < err.errors.length; i++) {
          errors[err.inner[i].path!] = err.errors[i];
        }

        throw errors;
      });
  };
};
