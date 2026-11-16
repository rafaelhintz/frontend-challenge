import React from "react";
const nfts = [
  { id: 1, name: "Cosmic Dreams #024", collection: "Cosmic Dreams", price: "0.45 ETH", color: "#7b61ff", emoji: "🌌" },
  { id: 2, name: "Neon Samurai #118", collection: "Neon Samurai", price: "0.32 ETH", color: "#ee4ba8", emoji: "⚔️" },
  { id: 3, name: "Digital Garden #067", collection: "Digital Garden", price: "0.28 ETH", color: "#43b581", emoji: "🌿" },
  { id: 4, name: "Pixel Odyssey #209", collection: "Pixel Odyssey", price: "0.19 ETH", color: "#ed9f43", emoji: "🪐" },
];

export default function App() {
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
          <input aria-label="Buscar NFTs" placeholder="⌕  Buscar NFTs..." />
        </div>
        <div className="filters"><button className="selected">Todos</button><button>Arte</button><button>Games</button><button>Colecionáveis</button></div>
        <div className="grid">
          {nfts.map((nft) => (
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