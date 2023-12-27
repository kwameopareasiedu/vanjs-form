import "./index.css";
import van from "vanjs-core";
import App from "./app.ts";

van.add(document.querySelector<HTMLDivElement>("#app")!, App());
