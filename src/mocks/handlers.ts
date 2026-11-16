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
    const items = resultados.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

    return HttpResponse.json({
      items,
      pagina,
      total,
      totalPaginas,
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
];