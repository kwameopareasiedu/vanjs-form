import van from 'vanjs-core';

class Form {
    initialValues;
    fields;
    constructor(args) {
        this.initialValues = args.initialValues;
        this.fields = {};
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
    handleSubmit = (handler) => (e) => {
        e.preventDefault();
        const values = {};
        for (const key in this.fields) {
            const field = this.fields[key];
            values[key] = field.value.val;
        }
        handler(values);
    };
}

export { Form };
