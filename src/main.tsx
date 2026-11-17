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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NFTDetail from "./NFTDetail";
import Cart from "./Cart";
import Checkout from "./checkout";

const queryClient = new QueryClient();
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
const nftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$id",
  component: NFTDetail,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  validateSearch: () => ({
    busca: undefined,
    categoria: undefined,
    ordem: undefined,
    pagina: 1,
  }),
  component: Cart,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  validateSearch: () => ({
    busca: undefined,
    categoria: undefined,
    ordem: undefined,
    pagina: 1,
  }),
  component: Checkout,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  nftRoute,
  cartRoute,
  checkoutRoute,
]);
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
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

startApp();