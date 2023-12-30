# VanJS Form

Fully typed form state management library (with validation) for the VanJS [VanJS](https://vanjs.org/) framework. If you are coming
from React, `vanjs-form` feels similar to [react-hook-form](https://npmjs.org/package/react-hook-form).

[![](https://img.shields.io/badge/Github-Star-blue)](https://github.com/kwameopareasiedu/vanjs-form)

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
        label(input(form.register("title", { type: "radio", value: "Mr." })), "Mr."),
        label(input(form.register("title", { type: "radio", value: "Ms." })), "Ms."),
        label(input(form.register("title", { type: "radio", value: "Mrs." })), "Mrs.")
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
- Returns an object of parameters (`name`, `value`, `checked`, `oninput`, `onfocus`) which should be spread unto the
  input's properties

```typescript
form.register(name: string, additionalProps: Partial<HTMLElement>): HTMLElement;
```

### Get

- Gets the **typed** value of the input with the `name` in the form

```typescript
form.get(name: string): T[typeof name];
```

### Set

- Sets the value of the input with the `name` in the form

```typescript
form.set(name: string, value: T[typeof name]): void;
```

### Error

- Gets the error of the input with the `name` in the form

```typescript
form.error(name: string): string;
```

### Watch

- Returns a reactive object containing the specified field values
- No need to wrap in `van.derive()` 🙂

```typescript
form.watch(...names: string[]): State<{}>
```

### Reset

- Resets a form field or the entire form

```typescript
form.reset(...name: string[]): void // Reset specific fields
form.reset(): void // Reset entire form
```

### Handle submit

- Register a function to use as a submit handler
- If `validator` is specified on the form, the handler is called if validation passes
- Returns a new function to be passed to the form element

```typescript
form.handleSubmit((values: T) => void): (values: T) => void
```

## Contributors

- [Kwame Opare Asiedu](https://github.com/kwameopareasiedu)
