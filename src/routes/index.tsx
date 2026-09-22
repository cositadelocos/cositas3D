import { createFileRoute } from "@tanstack/react-router";
import { ViewerApp } from "@/components/viewer/viewer-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ViewerApp />;
}
