import "./index.css";
import van from "vanjs-core";
import { Form } from "vanjs-form";

const { div, form, input, h1, select, option } = van.tags;

export default function App() {
  const f = new Form({
    initialValues: {
      name: "",
      email: "",
      gender: ""
    }
  });

  van.derive(() => {
    const { name, gender, email } = f.observe();
    console.log([name, gender, email]);
  });

  return div(
    { className: "flex flex-col gap-4 p-6 w-full max-w-96" },
    h1("VanJS Form"),
    form(
      { className: "flex flex-col gap-2" },
      input(
        f.getFieldProps("name", {
          className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500",
          placeholder: "Enter your name",
          autofocus: true
        })
      ),
      input(
        f.getFieldProps("email", {
          type: "email",
          className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500",
          placeholder: "Enter your email"
        })
      ),
      select(
        f.getFieldProps("gender", {
          type: "email",
          className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500"
        }),
        option({ value: "" }, "Sex"),
        option({ value: "Male" }, "Male"),
        option({ value: "Female" }, "Female")
      )
    )
  );
}
