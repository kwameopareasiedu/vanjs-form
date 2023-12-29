import van from 'vanjs-core';

class Form {
    initialValues;
    fields;
    validator;
    // TODO: Implement input mode as input/change
    // TODO: Implement validation mode as change/submit
    constructor(args) {
        this.initialValues = args.initialValues;
        this.fields = {};
        this.validator = args.validator ?? ((values) => Promise.resolve(values));
        // From the initial values, register the fields
        for (const key in args.initialValues) {
            this.fields[key] = {
                value: van.state(args.initialValues[key]),
                touched: van.state(false),
                error: van.state(null)
            };
        }
    }
    register(name, additionalProps) {
        const field = this.fields[name];
        if (field) {
            const handleInput = (e) => {
                field.value.val = e.target.value;
                additionalProps?.oninput?.(e);
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
            throw new Error(`No field with name "${name}"`);
    }
    getValue(name) {
        const field = this.fields[name];
        if (field)
            return field.value.val;
        else
            throw new Error(`No field with name "${name}"`);
    }
    setValue(name, value) {
        const field = this.fields[name];
        if (field)
            field.value.val = value;
        else
            throw new Error(`No field with name "${name}"`);
    }
    observe(...names) {
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
    }
    reset(...names) {
        if (names.length > 0) {
            for (const name of names) {
                const field = this.fields[name];
                field.value.val = this.initialValues[name];
                field.touched.val = false;
                field.error.val = null;
            }
        }
        else {
            for (const key in this.fields) {
                const field = this.fields[key];
                field.value.val = this.initialValues[key];
                field.touched.val = false;
                field.error.val = null;
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
            this.validator(values).then((values) => handler(values));
        };
    }
}

const yupValidator = (schema) => {
    return (values) => {
        return schema
            .validate(values, { abortEarly: false })
            .then((values) => values)
            .catch((err) => {
            const errors = {};
            for (let i = 0; i < err.errors.length; i++) {
                errors[err.inner[i].path] = err.errors[i];
            }
            throw errors;
        });
    };
};

export { Form, yupValidator };
