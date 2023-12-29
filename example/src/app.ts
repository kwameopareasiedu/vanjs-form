import "./index.css";
import van, { ChildDom, Props } from "vanjs-core";
import { Form, yupValidator } from "vanjs-form";
import * as yup from "yup";

const { div, form: formEl, input, h1, select, option, button, p } = van.tags;

const form = new Form({
  initialValues: {
    name: "",
    email: "",
    gender: "",
    age: 0
  },
  validator: yupValidator(
    yup.object({
      name: yup.string().required("Required").length(6, "Must be 6 chars"),
      email: yup.string().required("Required").email("Must be a valid email"),
      gender: yup.string().required("Required").oneOf(["Male", "Female"], "Valid gender is required")
    })
  )
});

export default function App() {
  const observed = form.watch("name", "gender", "email", "age");

  const alertValues = () => {
    const name = form.get("name") ?? "N/A";
    const email = form.get("email") ?? "N/A";
    const gender = form.get("gender") ?? "N/A";
    const age = form.get("age") ?? "N/A";

    alert(`{ Name: ${name}, Email: ${email}, Gender: ${gender} }, Age: ${age}`);
  };

  const handleSubmit = form.handleSubmit((values) => {
    console.log(values);
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
        Button({ type: "button", onclick: () => form.set("name", generateRandomString(6)) }, "Set Rnd")
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
        Button({ type: "button", onclick: () => form.set("email", generateRandomEmail()) }, "Set Rnd")
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
        Button({ type: "button", onclick: () => form.set("gender", generateRandomGender()) }, "Set Rnd")
      ),
      Button({ type: "submit" }, "Submit")
    ),
    p(
      { className: "text-sm text-gray-500 font-mono" },
      () => `{ Name: "${observed.val.name}", Email: "${observed.val.email}", Gender: "${observed.val.gender}" }`
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
