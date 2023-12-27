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
    // Returns an object containing the field states with helper methods to update in the form state
    getFieldProps(name, additionalProps) {
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
    // Reset the form fields to their initial values
    reset() {
        for (const key in this.fields) {
            const field = this.fields[key];
            field.value.val = this.initialValues[key];
            field.touched.val = null;
        }
    }
}

export { Form };
