import React from "react";
import ReactDOM from "react-dom/client";
import { worker } from "./mocks/browser";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import App from "./App";
import "./style.css";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
validateSearch: (search: Record<string, unknown>) => ({
  busca: typeof search.busca === "string" ? search.busca : undefined,
  categoria:
    typeof search.categoria === "string" ? search.categoria : undefined,
  ordem: typeof search.ordem === "string" ? search.ordem : undefined,
  pagina: Number(search.pagina) || 1,
}),
  component: App,
});

const routeTree = rootRoute.addChildren([indexRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

async function startApp() {
  if (import.meta.env.DEV) {
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}

startApp();