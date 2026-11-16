import { http, HttpResponse } from "msw";

const nfts = [
  { id: 1, name: "Cosmic Dreams #024", collection: "Cosmic Dreams", category: "Arte", price: "0.45", color: "#7b61ff", emoji: "🌌" },
  { id: 2, name: "Neon Samurai #118", collection: "Neon Samurai", category: "Games", price: "0.32", color: "#ee4ba8", emoji: "⚔️" },
  { id: 3, name: "Digital Garden #067", collection: "Digital Garden", category: "Arte", price: "0.28", color: "#43b581", emoji: "🌿" },
  { id: 4, name: "Pixel Odyssey #209", collection: "Pixel Odyssey", category: "Games", price: "0.19", color: "#ed9f43", emoji: "🪐" },
];

export const handlers = [
  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url);
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

    return HttpResponse.json({ items: resultados });
  }),
];