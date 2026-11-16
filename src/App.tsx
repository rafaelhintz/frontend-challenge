import React, { useState } from "react";
const nfts = [
  { id: 1, name: "Cosmic Dreams #024", collection: "Cosmic Dreams", category: "Arte", price: "0.45 ETH", color: "#7b61ff", emoji: "🌌" },
  { id: 2, name: "Neon Samurai #118", collection: "Neon Samurai", category: "Games", price: "0.32 ETH", color: "#ee4ba8", emoji: "⚔️" },
  { id: 3, name: "Digital Garden #067", collection: "Digital Garden", category: "Arte", price: "0.28 ETH", color: "#43b581", emoji: "🌿" },
  { id: 4, name: "Pixel Odyssey #209", collection: "Pixel Odyssey", category: "Games", price: "0.19 ETH", color: "#ed9f43", emoji: "🪐" },
];

export default function App() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [ordem, setOrdem] = useState("recentes");
const nftsFiltrados = nfts
  .filter((nft) => {
    const correspondeBusca =
      `${nft.name} ${nft.collection}`.toLowerCase().includes(busca.toLowerCase());

    const correspondeCategoria =
      categoria === "Todos" || nft.category === categoria;

    return correspondeBusca && correspondeCategoria;
  })
  .sort((a, b) => {
    const precoA = Number.parseFloat(a.price);
    const precoB = Number.parseFloat(b.price);

    if (ordem === "menor-preco") return precoA - precoB;
    if (ordem === "maior-preco") return precoB - precoA;
    return 0;
  });
  return (
    <main className="page">
      <header className="topbar">
        <a className="logo" href="/">JUNGLE<span>MARKET</span></a>
        <nav><a href="#explore">Explorar</a><a href="#collections">Coleções</a></nav>
        <button className="connect">Conectar carteira</button>
      </header>

      <section className="hero">
        <p className="eyebrow">O FUTURO DA ARTE DIGITAL</p>
        <h1>Descubra e colecione<br /><span>NFTs extraordinários</span></h1>
        <p>Explore criações únicas de artistas do mundo todo.</p>
        <a className="cta" href="#explore">Explorar NFTs <span>→</span></a>
      </section>

      <section id="explore" className="catalog">
        <div className="section-heading">
          <div><p className="eyebrow">CATÁLOGO</p><h2>Em destaque</h2></div>
          <input
            aria-label="Buscar NFTs"
            placeholder="⌕  Buscar NFTs..."
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
        <div className="filters">
          {["Todos", "Arte", "Games", "Colecionáveis"].map((item) => (
            <button
              key={item}
              className={categoria === item ? "selected" : ""}
              onClick={() => setCategoria(item)}
              aria-pressed={categoria === item}
            >
              {item}
            </button>
          ))}

        </div>
        <div className="grid">
          {nftsFiltrados.map((nft) => (
            <article className="card" key={nft.id}>
              <div className="art" style={{ background: `linear-gradient(145deg, ${nft.color}, #171322)` }}>
                <span>{nft.emoji}</span><button aria-label={`Favoritar ${nft.name}`}>♡</button>
              </div>
              <div className="card-info">
                <p>{nft.collection}</p><h3>{nft.name}</h3>
                <div className="price"><span>Preço atual</span><strong>{nft.price}</strong></div>
                <button className="buy">Ver NFT</button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <footer>JUNGLE MARKET · Arte digital, sem limites.</footer>
    </main>
  );
}