import "./index.css";
import van, { ChildDom, Props } from "vanjs-core";
import { Form } from "vanjs-form";
import * as yup from "yup";
import { ValidationError } from "yup";

const { div, form: formEl, input, h1, select, option, button, p } = van.tags;

const validator = yup.object({
  name: yup.string().required("Required").length(6, "Must be 6 chars"),
  email: yup.string().required("Required"),
  gender: yup.string().required("Required").oneOf(["Male", "Female"], "Valid gender is required")
});

export default function App() {
  const form = new Form({
    initialValues: {
      name: "",
      email: "",
      gender: "",
      age: {}
    }
  });

  const observables = van.derive(() => {
    return form.observe("name", "gender", "email", "age");
  });

  const alertValues = () => {
    alert(
      `{ Name: ${form.getValue("name") || "N/A"}, Email: ${form.getValue("email") || "N/A"}, Gender: ${
        form.getValue("gender") || "N/A"
      } }`
    );
  };

  const handleSubmit = form.handleSubmit((values) => {
    validator
      .validate(values, { abortEarly: false })
      .then((values) => console.log(values))
      .catch((err: ValidationError) => {
        for (let i = 0; i < err.errors.length; i++) {
          console.error({ err: err.errors[i], path: err.inner[i].path });
        }
      });
  });

  return div(
    { className: "flex flex-col justify-start gap-4 p-6 w-full max-w-[640px]" },
    h1("VanJS Form"),
    formEl(
      { className: "flex flex-col gap-2", onsubmit: handleSubmit },
      div(
        { className: "flex items-center gap-2" },
        input(
          form.register("name", {
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 flex-1",
            placeholder: "Enter your name",
            autofocus: true
          })
        ),
        Button({ type: "button", onclick: () => form.reset("name") }, "Reset"),
        Button({ type: "button", onclick: () => form.setValue("name", generateRandomString(16)) }, "Set Rnd")
      ),
      div(
        { className: "flex items-center gap-2" },
        input(
          form.register("email", {
            type: "email",
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 flex-1",
            placeholder: "Enter your email"
          })
        ),
        Button({ type: "button", onclick: () => form.reset("email") }, "Reset"),
        Button({ type: "button", onclick: () => form.setValue("email", generateRandomEmail()) }, "Set Rnd")
      ),
      div(
        { className: "flex items-center gap-2" },
        select(
          form.register("gender", {
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 flex-1"
          }),
          option({ value: "" }, "Sex"),
          option({ value: "Male" }, "Male"),
          option({ value: "Female" }, "Female")
        ),
        Button({ type: "button", onclick: () => form.reset("gender") }, "Reset"),
        Button({ type: "button", onclick: () => form.setValue("gender", generateRandomGender()) }, "Set Rnd")
      ),
      Button({ type: "submit" }, "Submit")
    ),
    p(
      { className: "text-sm text-gray-500 font-mono" },
      () =>
        `{ Name: ${observables.val.name || "N/A"}, Email: ${observables.val.email || "N/A"}, Gender: ${
          observables.val.gender || "N/A"
        } }`
    ),
    Button({ onclick: () => form.reset() }, "Reset"),
    Button({ onclick: alertValues }, "Alert")
  );
}

const Button = (propsOrChild: Props | ChildDom, ...children: ChildDom[]) => {
  const firstIsChildDom =
    propsOrChild instanceof HTMLElement || ["string", "number", "boolean", "function"].includes(typeof propsOrChild);

  if (!firstIsChildDom) {
    const props = propsOrChild as HTMLButtonElement;
    props.className = `px-2 py-1 text-sm rounded bg-blue-500 text-white w-auto ${props.className ?? ""}`;
    return button(props, ...children);
  } else {
    return button(
      { className: "px-2 py-1 text-sm rounded bg-blue-500 text-white w-auto" },
      propsOrChild as ChildDom,
      ...children
    );
  }
};

const generateRandomString = (length: number) => {
  return [...Array(length)].map(() => (~~(Math.random() * 36)).toString(36)).join("");
};

const generateRandomEmail = () => {
  return `${generateRandomString(8)}@${generateRandomString(4)}.com`;
};

const generateRandomGender = () => {
  return Math.random() > 0.5 ? "Male" : "Female";
};
