import React from "react";
import ReactDOM from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import App from "./App";
// @ts-expect-error CSS is loaded by the bundler and has no TypeScript declarations.
import "./style.css";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    busca: typeof search.busca === "string" ? search.busca : "",
    categoria: typeof search.categoria === "string" ? search.categoria : "Todos",
    ordem: typeof search.ordem === "string" ? search.ordem : "recentes",
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);