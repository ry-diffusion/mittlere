import { createFileRoute } from "@tanstack/react-router";
import { Mittlere } from "@/components/mittlere";

export const Route = createFileRoute("/")({
  component: Mittlere,
});
