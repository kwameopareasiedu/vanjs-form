import "./index.css";
import van, { ChildDom, Props } from "vanjs-core";
import { Form } from "vanjs-form";

const { div, form, input, h1, select, option, button, p } = van.tags;

export default function App() {
  const f = new Form({
    initialValues: {
      name: "",
      email: "",
      gender: ""
    }
  });

  const observables = van.derive(() => {
    return f.observe("name", "gender", "email");
  });

  const alertValues = () => {
    alert(
      `{ Name: ${f.getValue("name") || "N/A"}, Email: ${f.getValue("email") || "N/A"}, Gender: ${
        f.getValue("gender") || "N/A"
      } }`
    );
  };

  return div(
    { className: "flex flex-col justify-start gap-4 p-6 w-full max-w-[540px]" },
    h1("VanJS Form"),
    form(
      { className: "flex flex-col gap-2" },
      div(
        { className: "flex items-center gap-2" },
        input(
          f.register("name", {
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 flex-1",
            placeholder: "Enter your name",
            autofocus: true
          })
        ),
        Button({ type: "button", onclick: () => f.reset("name") }, "Reset"),
        Button({ type: "button", onclick: () => f.setValue("name", generateRandomString(16)) }, "Set Rnd")
      ),
      div(
        { className: "flex items-center gap-2" },
        input(
          f.register("email", {
            type: "email",
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 flex-1",
            placeholder: "Enter your email"
          })
        ),
        Button({ type: "button", onclick: () => f.reset("email") }, "Reset"),
        Button({ type: "button", onclick: () => f.setValue("email", generateRandomEmail()) }, "Set Rnd")
      ),
      div(
        { className: "flex items-center gap-2" },
        select(
          f.register("gender", {
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 flex-1"
          }),
          option({ value: "" }, "Sex"),
          option({ value: "Male" }, "Male"),
          option({ value: "Female" }, "Female")
        ),
        Button({ type: "button", onclick: () => f.reset("gender") }, "Reset"),
        Button({ type: "button", onclick: () => f.setValue("gender", generateRandomGender()) }, "Set Rnd")
      )
    ),
    p(
      { className: "text-sm text-gray-500 font-mono" },
      () =>
        `{ Name: ${observables.val.name || "N/A"}, Email: ${observables.val.email || "N/A"}, Gender: ${
          observables.val.gender || "N/A"
        } }`
    ),
    Button({ onclick: () => f.reset() }, "Reset"),
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
