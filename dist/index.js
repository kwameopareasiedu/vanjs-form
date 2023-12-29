import van from 'vanjs-core';

class Form {
    initialValues;
    fields;
    validator;
    validationMode;
    constructor(args) {
        this.initialValues = args.initialValues;
        this.fields = {};
        this.validator = args.validator ?? ((values) => Promise.resolve(values));
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
    register(name, additionalProps) {
        const field = this.fields[name];
        if (field) {
            const handleInput = (e) => {
                field.value.val = e.target.value;
                additionalProps?.oninput?.(e);
                if (this.validationMode === "oninput") {
                    const values = {};
                    for (const key in this.fields) {
                        const field = this.fields[key];
                        values[key] = field.value.val;
                    }
                    this.validator(values).then((valuesOrErrors) => {
                        if (valuesOrErrors instanceof FormError) {
                            const errorString = valuesOrErrors.errors[name];
                            field.error.val = errorString ?? "";
                        }
                        else
                            field.error.val = "";
                    });
                }
            };
            const handleFocus = (e) => {
                field.touched.val = true;
                additionalProps?.onfocus?.(e);
            };
            return {
                ...additionalProps,
                name: name,
                value: field.value,
                oninput: handleInput,
                onfocus: handleFocus
            };
        }
        else
            throw new Error(`No field named "${name}"`);
    }
    get(name) {
        const field = this.fields[name];
        if (!field)
            throw new Error(`No field named "${name}"`);
        return field.value.val;
    }
    set(name, value) {
        const field = this.fields[name];
        if (!field)
            throw new Error(`No field named "${name}"`);
        field.value.val = value;
    }
    error(name) {
        const field = this.fields[name];
        if (!field)
            throw new Error(`No field named "${name}"`);
        return field.error.val;
    }
    // errors() {
    //   const errors: Record<KeyOf<T>, string | null> = {} as Record<KeyOf<T>, string | null>;
    //
    //   for (const key in this.fields) {
    //     const field: Field<unknown> = this.fields[key];
    //     errors[key] = field.error.val;
    //   }
    //
    //   return errors;
    // }
    watch(...names) {
        return van.derive(() => {
            const values = {};
            if (names.length > 0) {
                for (const name of names) {
                    const field = this.fields[name];
                    values[name] = field.value.val;
                }
            }
            else {
                for (const key in this.fields) {
                    const field = this.fields[key];
                    values[key] = field.value.val;
                }
            }
            return values;
        });
    }
    reset(...names) {
        if (names.length > 0) {
            for (const name of names) {
                const field = this.fields[name];
                field.value.val = this.initialValues[name];
                field.touched.val = false;
                field.error.val = "";
            }
        }
        else {
            for (const key in this.fields) {
                const field = this.fields[key];
                field.value.val = this.initialValues[key];
                field.touched.val = false;
                field.error.val = "";
            }
        }
    }
    handleSubmit(handler) {
        return (e) => {
            e.preventDefault();
            const values = {};
            for (const key in this.fields) {
                const field = this.fields[key];
                values[key] = field.value.val;
            }
            this.validator(values).then((valuesOrErrors) => {
                if (valuesOrErrors instanceof FormError) {
                    for (const name in this.fields) {
                        const errorString = valuesOrErrors.errors[name];
                        const field = this.fields[name];
                        if (field)
                            field.error.val = errorString ?? "";
                    }
                }
                else {
                    for (const name in this.fields) {
                        const field = this.fields[name];
                        field.error.val = "";
                    }
                    handler(valuesOrErrors);
                }
            });
        };
    }
}
class FormError {
    errors;
    constructor(errors) {
        this.errors = errors;
    }
}
const yupValidator = (schema) => {
    return async (values) => {
        try {
            return await schema.validate(values, { abortEarly: false });
        }
        catch (_err) {
            const yupError = _err;
            const errorMap = {};
            yupError.errors.forEach((yupErrorStr, i) => {
                errorMap[yupError.inner[i].path] = yupErrorStr;
            });
            return new FormError(errorMap);
        }
    };
};

export { Form, yupValidator };
