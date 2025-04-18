import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import { Mittlere } from "@/components/mittlere";

export const Route = createFileRoute("/")({
  component: Mittlere,
});
