import "./index.css";
import van, { ChildDom, Props } from "vanjs-core";
import { Form, yupValidator } from "vanjs-form";
import * as yup from "yup";

const { div, form: formEl, input, h1, select, option, button, label, p } = van.tags;

export default function App() {
  const form = new Form({
    initialValues: {
      input: "",
      range: 30,
      select: "",
      radio: "",
      checkbox: false
    },
    validator: yupValidator(
      yup.object({
        input: yup.string().required("Required").min(6, "Must be at least 6 chars"),
        range: yup.number().min(50, "Range must be at least 50"),
        select: yup.string().required("Required"),
        radio: yup.string().required("Required"),
        checkbox: yup.boolean().required("Required").isTrue("Must be set")
      })
    ),
    validationMode: "oninput"
  });

  const data = form.watch("input", "range", "select", "radio", "checkbox");

  const alertValues = () => {
    const input = form.get("input");
    const range = form.get("range");
    const select = form.get("select");
    const radio = form.get("radio");
    const checkbox = form.get("checkbox");

    alert(`{ Input: "${input}", Range: "${range}", Select: "${select}", Radio: "${radio}", Checkbox: "${checkbox}" }`);
  };

  const handleSubmit = form.handleSubmit((values) => {
    console.log(values);
  });

  return div(
    { className: "flex flex-col justify-start gap-4 p-6 w-full max-w-[640px]" },
    h1({ className: "text-5xl font-light" }, "VanJS Form"),
    p({ className: "text-gray-600 font-light" }, "Built by Kwame Opare Asiedu with ❤"),
    formEl(
      { className: "flex flex-col gap-2", onsubmit: handleSubmit },
      Field(
        {
          error: () => form.error("input"),
          onreset: () => form.reset("input"),
          onsetrnd: () => form.set("input", generateRandomString(6))
        },
        input(
          form.register("input", {
            type: "text",
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 w-full",
            placeholder: "Input field",
            autofocus: true
          })
        )
      ),
      Field(
        {
          error: () => form.error("range"),
          onreset: () => form.reset("range"),
          onsetrnd: () => form.set("range", parseInt((100 * Math.random()) as never as string))
        },
        input(
          form.register("range", {
            type: "range",
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 w-full"
          })
        )
      ),
      Field(
        {
          error: () => form.error("select"),
          onreset: () => form.reset("select"),
          onsetrnd: () => form.set("select", cycleOptions("cappuccino", "espresso", form.get("select")))
        },
        select(
          form.register("select", {
            className: "px-2 py-1 border-2 border-blue-200 rounded outline-none focus:border-blue-500 w-full"
          }),
          option({ value: "" }, "Select..."),
          option({ value: "cappuccino" }, "Cappuccino"),
          option({ value: "espresso" }, "Espresso")
        )
      ),
      Field(
        {
          error: () => form.error("radio"),
          onreset: () => form.reset("radio"),
          onsetrnd: () => form.set("radio", cycleOptions("chai", "herbal", form.get("radio")))
        },
        div(
          { className: "flex gap-2" },
          label(
            { className: "flex gap-1" },
            input(form.register("radio", { type: "radio", value: "chai" })),
            "Chai Tea"
          ),
          label(
            { className: "flex gap-1" },
            input(form.register("radio", { type: "radio", value: "herbal" })),
            "Herbal Tea"
          )
        )
      ),
      Field(
        {
          error: () => form.error("checkbox"),
          onreset: () => form.reset("checkbox"),
          onsetrnd: () => form.set("checkbox", cycleOptions(true, false, form.get("checkbox")))
        },
        label({ className: "flex gap-1" }, input(form.register("checkbox", { type: "checkbox" })), "Do you even Van?")
      ),
      Button({ type: "submit" }, "Submit")
    ),
    p(
      { className: "text-sm text-gray-500 font-mono" },
      () =>
        `{ Input: ${data.val.input}, Range: ${data.val.range}, Select: ${data.val.select}, Radio: ${data.val.radio}, Checkbox: ${data.val.checkbox} }`
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

type FieldProps = Partial<HTMLDivElement> & { error?: () => string; onreset: () => void; onsetrnd: () => void };

const Field = ({ error, className, onreset, onsetrnd, ...rest }: FieldProps, child: ChildDom) => {
  return div(
    { ...(rest as HTMLDivElement), className: `flex gap-2 items-center ${className ?? ""}` },
    div({ className: "flex-1 flex-col gap-1" }, child, () =>
      error ? p({ className: "text-sm text-rose-600 italic" }, error) : null
    ),
    Button({ type: "button", onclick: onreset }, "Reset"),
    Button({ type: "button", onclick: onsetrnd }, "Set Rnd")
  );
};

const generateRandomString = (length: number) => {
  return [...Array(length)].map(() => (~~(Math.random() * 36)).toString(36)).join("");
};

const cycleOptions = <T>(option1: T, option2: T, value: T) => {
  return value === option2 ? option1 : option2;
};
