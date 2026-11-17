import { http, HttpResponse } from "msw";

const nfts = [
  { id: 1, name: "Cosmic Dreams #024", collection: "Cosmic Dreams", category: "Arte", price: "0.45", color: "#7b61ff", emoji: "🌌" },
  { id: 2, name: "Neon Samurai #118", collection: "Neon Samurai", category: "Games", price: "0.32", color: "#ee4ba8", emoji: "⚔️" },
  { id: 3, name: "Digital Garden #067", collection: "Digital Garden", category: "Arte", price: "0.28", color: "#43b581", emoji: "🌿" },
  { id: 4, name: "Pixel Odyssey #209", collection: "Pixel Odyssey", category: "Games", price: "0.19", color: "#ed9f43", emoji: "🪐" },
];

type CartItem = {
  nftId: number;
  quantity: number;
};

const cart: CartItem[] = [];

function saveCart() {
  localStorage.setItem("nft-cart", JSON.stringify(cart));
}

function loadCart() {
  try {
    const saved = localStorage.getItem("nft-cart");
    if (!saved) return;

    const items = JSON.parse(saved) as CartItem[];
    cart.splice(0, cart.length, ...items);
  } catch {
    cart.splice(0, cart.length);
  }
}

loadCart();

type Order = {
  id: string;
  status: "confirmed" | "rejected";
  items: CartItem[];
  subtotal: string;
  networkFee: string;
  total: string;
  transactionId: string;
};

const orders = new Map<string, Order>();

type User = {
  id: string;
  name: string;
  email: string;
};

const users: Array<User & { password: string }> = [
  {
    id: "user-1",
    name: "Rafa Colecionador",
    email: "rafa@example.com",
    password: "jungle123",
  },
  {
    id: "user-2",
    name: "Ana Artista",
    email: "ana@example.com",
    password: "jungle123",
  },
];

let activeUser: User | null = null;

function publicUser(user: User & { password: string }): User {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export const handlers = [


  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url);
    const pagina = Math.max(1, Number(url.searchParams.get("pagina") ?? 1));
    const porPagina = 2;
    const busca = url.searchParams.get("busca")?.toLowerCase() ?? "";
    const categoria = url.searchParams.get("categoria") ?? "Todos";
    const ordem = url.searchParams.get("ordem") ?? "recentes";

    let resultados = nfts.filter((nft) => {
      const correspondeBusca =
        `${nft.name} ${nft.collection}`.toLowerCase().includes(busca);
      const correspondeCategoria =
        categoria === "Todos" || nft.category === categoria;
      return correspondeBusca && correspondeCategoria;
    });

    if (ordem === "menor-preco") {
      resultados = [...resultados].sort(
        (a, b) => Number(a.price) - Number(b.price),
      );
    } else if (ordem === "maior-preco") {
      resultados = [...resultados].sort(
        (a, b) => Number(b.price) - Number(a.price),
      );
    }

    const total = resultados.length;
    const inicio = (pagina - 1) * porPagina;

    return HttpResponse.json({
      items: resultados.slice(inicio, inicio + porPagina),
      pagina,
      total,
      totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
    });
  }),

  http.get("/api/nfts/:id", ({ params }) => {
    const nft = nfts.find((item) => item.id === Number(params.id));

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado" },
        { status: 404 },
      );
    }

    return HttpResponse.json(nft);
  }),

  http.get("/api/cart", () => {
    return HttpResponse.json({ items: cart });
  }),

  http.post("/api/cart", async ({ request }) => {
    const body = (await request.json()) as {
      nftId: number;
      quantity?: number;
    };

    const quantidade = Math.max(1, Math.floor(body.quantity ?? 1));
    const existente = cart.find((item) => item.nftId === body.nftId);

    if (existente) {
      existente.quantity += quantidade;
    } else {
      cart.push({ nftId: body.nftId, quantity: quantidade });
    }

    saveCart();
    return HttpResponse.json({ items: cart });
  }),

  http.patch("/api/cart/:nftId", async ({ params, request }) => {
    const nftId = Number(params.nftId);
    const body = (await request.json()) as { quantity: number };
    const item = cart.find((entry) => entry.nftId === nftId);

    if (!item) {
      return HttpResponse.json({ message: "Item não encontrado" }, { status: 404 });
    }

    item.quantity = Math.max(1, Math.floor(body.quantity));
    saveCart();
    return HttpResponse.json({ items: cart });
  }),

  http.delete("/api/cart/:nftId", ({ params }) => {
    const nftId = Number(params.nftId);
    const index = cart.findIndex((item) => item.nftId === nftId);

    if (index === -1) {
      return HttpResponse.json({ message: "Item não encontrado" }, { status: 404 });
    }

    cart.splice(index, 1);
    saveCart();
    return HttpResponse.json({ items: cart });
  }),

  http.post("/api/checkout/quote", async ({ request }) => {
  const body = (await request.json()) as {
    coupon?: string;
  };

  if (cart.length === 0) {
    return HttpResponse.json(
      { message: "O carrinho está vazio" },
      { status: 400 },
    );
  }

  const subtotal = cart.reduce((sum, item) => {
    const nft = nfts.find((entry) => entry.id === item.nftId);
    return sum + Number(nft?.price ?? 0) * item.quantity;
  }, 0);

  const networkFee = 0.01;
  const discount = body.coupon?.toUpperCase() === "JUNGLE10" ? subtotal * 0.1 : 0;

  return HttpResponse.json({
    subtotal: subtotal.toFixed(4),
    discount: discount.toFixed(4),
    networkFee: networkFee.toFixed(4),
    total: (subtotal - discount + networkFee).toFixed(4),
  });
}),

http.post("/api/orders", async ({ request }) => {
  const idempotencyKey = request.headers.get("Idempotency-Key");

  if (!idempotencyKey) {
    return HttpResponse.json(
      { message: "Idempotency-Key é obrigatório" },
      { status: 400 },
    );
  }

  const existingOrder = orders.get(idempotencyKey);
  if (existingOrder) {
    return HttpResponse.json(existingOrder);
  }

  if (cart.length === 0) {
    return HttpResponse.json(
      { message: "O carrinho está vazio" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as {
    paymentResult?: "confirmed" | "rejected";
  };

  const subtotal = cart.reduce((sum, item) => {
    const nft = nfts.find((entry) => entry.id === item.nftId);
    return sum + Number(nft?.price ?? 0) * item.quantity;
  }, 0);

  const networkFee = 0.01;
  const status = body.paymentResult === "rejected" ? "rejected" : "confirmed";

  const order: Order = {
    id: `order-${Date.now()}`,
    status,
    items: cart.map((item) => ({ ...item })),
    subtotal: subtotal.toFixed(4),
    networkFee: networkFee.toFixed(4),
    total: (subtotal + networkFee).toFixed(4),
    transactionId: `0x${crypto.randomUUID().replaceAll("-", "")}`,
  };

  orders.set(idempotencyKey, order);

  if (status === "confirmed") {
    cart.splice(0, cart.length);
    saveCart();
  }

  return HttpResponse.json(order, { status: 201 });
}),



];