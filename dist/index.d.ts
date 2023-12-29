type KeyOf<T> = keyof T;

type FormValidator<T> = (values: T) => Promise<Record<keyof T, unknown>>;

/** The form class to handle form data and actions */
export declare class Form<T extends Record<string, unknown>> {
  /** Create a new instance of the `Form` class */
  constructor(args: {
    /** Initial form values data */
    initialValues: T;
    /** If defined, validation will fail if the form data does not pass validation */
    validator?: FormValidator<T>;
    /** Indicates whether the validator should run when the form is submitted or if a field is updated. Defaults to `onsubmit` */
    validationMode?: "oninput" | "onsubmit";
  });

  /** Register a form field
   * @param name The field name
   * @param additionalProps Additional props of the element to merge with the form props
   * @returns An attribute object which should be spread on the element */
  public register<K extends KeyOf<T>>(
    name: K,
    additionalProps?: Partial<HTMLInputElement>
  ): Pick<HTMLInputElement, "name" | "oninput" | "onfocus"> & { value: import("vanjs-core").State<T[typeof name]> };

  /** Get the value of a field */
  public get<K extends KeyOf<T>>(name: K): T[typeof name];

  /** Set the value of a field */
  public set<K extends KeyOf<T>>(name: K, value: T[typeof name]);

  /** Get the error of a field */
  public error<K extends KeyOf<T>>(name: K): string;

  /** Get the values of the entire form as a `VanJS State` object */
  public watch(): import("vanjs-core").State<T>;

  /** Get the values of specified fields as a `VanJS State` object */
  public watch<K extends KeyOf<T>>(...names: K[]): import("vanjs-core").State<{ [I in (typeof names)[number]]: T[I] }>;

  /** Reset the entire form */
  public reset(): void;

  /** Reset the values of specified form fields */
  public reset<K extends keyof T>(...names: K[]);

  /** Register a submit handler which is passed the values of the form after validation */
  public handleSubmit(handler: (values: T) => void): (e: SubmitEvent) => void;
}

/** Create a validator from a `Yup` validation schema */
export declare const yupValidator: <T>(schema: import("yup").Schema) => FormValidator<T>;
