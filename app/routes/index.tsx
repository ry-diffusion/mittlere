import type { Route } from "./+types/index";
import { Mittlere } from "../mittlere";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mittlere" },
    { name: "description", content: "O seu app para questões do ENEM." },
  ];
}

export default function Home() {
  return <Mittlere />;
}
