# VanJS Form

Fully typed form state management library (with validation) for the [VanJS](https://vanjs.org/) framework. If you are
coming
from React, `vanjs-form` feels similar to [react-hook-form](https://npmjs.org/package/react-hook-form).

[![](https://img.shields.io/badge/Github-Star-blue)](https://github.com/kwameopareasiedu/vanjs-form)
[![](https://img.shields.io/badge/Size-2.1Kb-orange)](https://github.com/kwameopareasiedu/vanjs-form)

## Install

```shell
yarn add vanjs-form vanjs-core yup
```

```shell
npm i -S vanjs-form vanjs-core yup
```

## Features

1. Dead simple `Form` API to create and manage the form state
2. Fully typed method parameter and return types
3. Supports validation with [Yup](https://github.com/jquense/yup). _[Zod](https://zod.dev/)
   and [Joi](https://joi.dev/) coming soon!_
4. Built with developer experience (DX) in mind

## QuickStart

```typescript
import van from "vanjs-core";
import { Form, yupValidator } from "vanjs-form";
import * as yup from "yup";

const { div, h1, p, input, label, select, form: formEl, button, br } = van.tags;

function App() {
  const form = new Form({
    initialValues: {
      title: "",
      name: "",
      age: 0,
      gender: ""
    },
    validator: yupValidator(
      yup.object({
        title: yup.string().required("Required"),
        name: yup.string().required("Required"),
        age: yup.number().required("Required").min(18, "At least 18 years"),
        gender: yup.string().oneOf(["Male", "Female"], "Valid gender required")
      })
    ),
    validationMode: "oninput" // Validation is run on input as well as on submit. Defaults to 'onsubmit'
  });

  // Watch values when they change in the form fields
  const observables = form.watch("name", "title");
  // or
  const allValues = form.watch();

  // Called when form passes validation
  const onsubmit = form.handleSubmit((values) => {
    console.log({ submittedValues: values });
  });

  return div(
    h1(() => `VanJS Form for ${observables.val.title} ${observables.val.name}`),

    formEl(
      { onsubmit: onsubmit },
      label("Title"),
      div(
        label(
          input(form.register("title", { type: "radio", value: "Mr." })),
          "Mr."
        ),
        label(
          input(form.register("title", { type: "radio", value: "Ms." })),
          "Ms."
        ),
        label(
          input(form.register("title", { type: "radio", value: "Mrs." })),
          "Mrs."
        )
      ),

      br(),

      label("Name"),
      input(form.register("name", { autofocus: true })),

      br(),

      label("Age"),
      input(form.register("age", { type: "number", min: "0", max: "100" })),

      br(),

      label("Gender"),
      select(
        form.register("gender", { type: "number", min: "0", max: "100" }),
        option({ value: "" }, "Select..."),
        option({ value: "Male" }, "Male"),
        option({ value: "Female" }, "Female")
      ),

      br(),

      button({ type: "submit" }, "Submit")
    )
  );
}

van.add(document.body, App());
```

## API Reference

### Form

- The `Form` class controls the form state and has methods to manipulate this state
- If `validator` parameter is provided, the submit handler is called if validation passes
- Use `validationMode` to control whether validation should occur on input or only on submit

```typescript
import { Form } from "vanjs-form";

const form = new Form({
  initialValues: Record<string, any>,
  validator: (values: Record<string, any>) => Record<string, any> | FormError,
  validationMode: "onsubmit" | "oninput" // Defaults to onsubmit
});
```

> After the instance is created, you can access the form functions to work with your form.

### YupValidator

- The `yupValidator` function takes a Yup `ObjectSchema` and returns a `validator` function

> _[Zod](https://zod.dev/) and [Joi](https://joi.dev/) validators coming soon!_

```typescript
const form = new Form({
  initialValues: {
    title: "",
    name: "",
    age: 0,
    gender: ""
  },
  validator: yupValidator(
    yup.object({
      title: yup.string().required("Required"),
      name: yup.string().required("Required"),
      age: yup.number().required("Required").min(18, "At least 18 years"),
      gender: yup.string().oneOf(["Male", "Female"], "Valid gender required")
    })
  )
});
```

## Form methods

```typescript
import { Form } from "vanjs-form";

const form = new Form({
  initialValues: Record<string, any>,
  validator: (values: Record<string, any>) => Record<string, any> | FormError,
  validationMode: "onsubmit" | "oninput" // Defaults to onsubmit
});

form.register();
form.get();
form.set();
form.error();
form.watch();
form.reset();
form.handleSubmit();
```

### Register

- Registers an input with the form
- Merges `additionalProps` into returned object
- Returns an object of props (`name`, `value`, `checked`, `oninput`, `onfocus`) which should be assigned as the
  element's props

```typescript
form.register(
  name, // string
  additionalProps // Partial<HTMLElement>
); // HTMLElement Props;
```

### Get

- Gets the **typed** value of the form field with the `name` key

```typescript
const form = new Form({
  initialValues: {
    name: "Kwame",
    age: 28,
    foo: true
  }
});

const name = form.get("name");
console.log(name); // "Kwame"

const age = form.get("age");
console.log(age); // 28

const foo = form.get("foo");
console.log(foo); // true
```

### Set

- Sets the value of the form field with the `name` key

```typescript
const form = new Form({
  initialValues: {
    name: "Kwame",
    age: 28,
    foo: true
  }
});

form.set("name", "Opare");
form.set("age", 29);
form.set("foo", false);
```

### Error

- Gets the error string of the form field with the `name` key

```typescript
const form = new Form({
  initialValues: {
    name: "Kwame",
    age: 28,
    foo: true
  },
  validator: yupValidator(
    yup.object({
      name: yup.string().required("Required").min(6, "Must be more than 6 characters"),
      age: yup.number().required("Required"),
      foo: yup.boolean().required("Required"),
    })
  ),
  validationMode: "oninput"
});

const nameError = form.error("name");
console.log(nameError); // "Must be more than 6 characters"

const ageError = form.error("age");
console.log(ageError); // ""

const fooError = form.error("foo");
console.log(fooError); // ""
```

> _An empty string is returned if the field has no error_

### Watch

- Returns a reactive object containing the specified field values
- No need to wrap in `van.derive()` 🙂

```typescript
const form = new Form({
  initialValues: {
    name: "Kwame",
    age: 28,
    foo: true
  },
});

const full = form.watch();
const partial = form.watch("name", "age");

return div(
  p(() => `Full data: ${JSON.stringify(full)}`), // Renders: Full data { "name": "Kwame", "age": 28, "foo": true }
  p(() => `Partial data: ${JSON.stringify(partial)}`), // Renders: Partial data { "name": "Kwame", "age": 28 }
);
```

### Errors

- Returns a reactive object containing the specified field errors
- No need to wrap in `van.derive()` 🙂

```typescript
const form = new Form({
  initialValues: {
    name: "Kwame",
    age: 28,
    foo: true
  },
  validator: yupValidator(
    yup.object({
      name: yup.string().required("Required").min(6, "Must be more than 6 characters"),
      age: yup.number().required("Required"),
      foo: yup.boolean().required("Required"),
    })
  ),
  validationMode: "oninput"
});

const errors = form.errors();
const partial = form.errors("name", "age");

return div(
  p(() => `Full errors: ${JSON.stringify(errors)}`), // Renders: Full errors { "name": "Must be more than 6 characters", "age": "", "foo": "" }
  p(() => `Partial errors: ${JSON.stringify(partial)}`), // Renders: Partial errors { "name": "Must be more than 6 characters", "age": "" }
);
```

### Reset

- Resets a form field or the entire form

```typescript
const form = new Form({
  initialValues: {
    name: "Kwame",
    age: 28,
    foo: true
  }
});

form.reset("name"); // Reset name field
form.reset("name", "age"); // Reset name and fields
form.reset(); // Reset all fields
```

### Handle submit

- Register a function to use as a submit handler
- If `validator` is specified on the form, the handler is called if validation passes
- Returns a new function to be passed to the form element

```typescript
const form = new Form({
  initialValues: {
    name: "Kwame",
    age: 28,
    foo: true
  }
});

const handleSubmit = form.handleSubmit((values) => {
  console.log(values);
});

return form(
  { onsubmit: handleSubmit },
  // ... Form children
)
```

## Contributors

- [Kwame Opare Asiedu](https://github.com/kwameopareasiedu)

## Changelog

- 1.1.0 (Current)
  - Added `Form.errors()` method
- 1.0.2
  - Disabled call to `form.validateField` on `form.reset` to avoid errors on form reset
