import "./index.css";
import van from "vanjs-core";
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

  return div(
    { className: "flex flex-col justify-start gap-4 p-6 w-full max-w-[540px]" },
    h1("VanJS Form"),
    form(
      { className: "flex flex-col gap-2" },
      div(
        { className: "flex items-center gap-2" },
        input(
          f.getFieldProps("name", {
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 flex-1",
            placeholder: "Enter your name",
            autofocus: true
          })
        ),
        button(
          {
            type: "button",
            className: "px-2 py-1 text-sm rounded bg-blue-500 text-white w-auto",
            onclick: () => f.reset("name")
          },
          "Reset"
        )
      ),
      div(
        { className: "flex items-center gap-2" },
        input(
          f.getFieldProps("email", {
            type: "email",
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 flex-1",
            placeholder: "Enter your email"
          })
        ),
        button(
          {
            type: "button",
            className: "px-2 py-1 text-sm rounded bg-blue-500 text-white w-auto",
            onclick: () => f.reset("email")
          },
          "Reset"
        )
      ),
      div(
        { className: "flex items-center gap-2" },
        select(
          f.getFieldProps("gender", {
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 flex-1"
          }),
          option({ value: "" }, "Sex"),
          option({ value: "Male" }, "Male"),
          option({ value: "Female" }, "Female")
        ),
        button(
          {
            type: "button",
            className: "px-2 py-1 text-sm rounded bg-blue-500 text-white w-auto",
            onclick: () => f.reset("gender")
          },
          "Reset"
        )
      )
    ),
    p(
      { className: "text-sm text-gray-500 font-mono" },
      () =>
        `{ Name: ${observables.val.name || "N/A"}, Email: ${observables.val.email || "N/A"}, Gender: ${
          observables.val.gender || "N/A"
        } }`
    ),
    button({ className: "px-2 py-1 text-sm rounded bg-blue-500 text-white w-auto", onclick: () => f.reset() }, "Reset")
  );
}
