import React from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { buscarNFTs } from "./api/nfts";

export default function App() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const busca = search.busca ?? "";
  const categoria = search.categoria ?? "Todos";
  const ordem = search.ordem ?? "recentes";
  const paginaAtual = search.pagina ?? 1;

  const {
    data: paginaNFTs = {
      items: [],
      pagina: 1,
      total: 0,
      totalPaginas: 1,
    },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["nfts", busca, categoria, ordem, paginaAtual],
    queryFn: () =>
      buscarNFTs({
        busca,
        categoria,
        ordem,
        pagina: paginaAtual,
      }),
  });

  const atualizarFiltros = (
    alteracoes: Record<string, string | number>,
  ) => {
    navigate({
      to: "/",
      search: {
        ...search,
        ...alteracoes,
        pagina:
          alteracoes.pagina === undefined ? 1 : Number(alteracoes.pagina),
      },
      replace: true,
    });
  };

  return (
    <main className="page">
      <header className="topbar">
        <a className="logo" href="/">
          JUNGLE<span>MARKET</span>
        </a>
        <nav>
          <a href="#explore">Explorar</a>
          <a href="#collections">Coleções</a>
        </nav>
        <button className="connect" type="button">
          Conectar carteira
        </button>
      </header>

      <section className="hero">
        <p className="eyebrow">O FUTURO DA ARTE DIGITAL</p>
        <h1>
          Descubra e colecione
          <br />
          <span>NFTs extraordinários</span>
        </h1>
        <p>Explore criações únicas de artistas do mundo todo.</p>
        <a className="cta" href="#explore">
          Explorar NFTs <span>→</span>
        </a>
      </section>

      <section id="explore" className="catalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CATÁLOGO</p>
            <h2>Em destaque</h2>
          </div>

          <input
            aria-label="Buscar NFTs"
            placeholder="⌕  Buscar NFTs..."
            value={busca}
            onChange={(evento) =>
              atualizarFiltros({ busca: evento.target.value })
            }
          />

          <select
            aria-label="Ordenar NFTs"
            value={ordem}
            onChange={(evento) =>
              atualizarFiltros({ ordem: evento.target.value })
            }
          >
            <option value="recentes">Mais recentes</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
          </select>
        </div>

        <div className="filters">
          {["Todos", "Arte", "Games", "Colecionáveis"].map((item) => (
            <button
              key={item}
              type="button"
              className={categoria === item ? "selected" : ""}
              onClick={() => atualizarFiltros({ categoria: item })}
              aria-pressed={categoria === item}
            >
              {item}
            </button>
          ))}
        </div>

        {isLoading && <p role="status">Carregando NFTs...</p>}

        {isError && (
          <div role="alert">
            <p>Não foi possível carregar os NFTs.</p>
            <button type="button" onClick={() => refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !isError && paginaNFTs.items.length === 0 && (
          <p>Nenhum NFT encontrado.</p>
        )}

        <div className="grid">
          {paginaNFTs.items.map((nft) => (
            <article className="card" key={nft.id}>
              <div
                className="art"
                style={{
                  background: `linear-gradient(145deg, ${nft.color}, #171322)`,
                }}
              >
                <span>{nft.emoji}</span>
                <button
                  type="button"
                  aria-label={`Favoritar ${nft.name}`}
                >
                  ♡
                </button>
              </div>

              <div className="card-info">
                <p>{nft.collection}</p>
                <h3>{nft.name}</h3>
                <div className="price">
                  <span>Preço atual</span>
                  <strong>{nft.price} ETH</strong>
                </div>
                <button className="buy" type="button">
                  Ver NFT
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="pagination">
          <button
            type="button"
            disabled={paginaAtual <= 1}
            onClick={() =>
              atualizarFiltros({ pagina: Math.max(1, paginaAtual - 1) })
            }
          >
            Anterior
          </button>

          <span>
            Página {paginaNFTs.pagina} de {paginaNFTs.totalPaginas}
          </span>

          <button
            type="button"
            disabled={paginaAtual >= paginaNFTs.totalPaginas}
            onClick={() =>
              atualizarFiltros({
                pagina: Math.min(paginaNFTs.totalPaginas, paginaAtual + 1),
              })
            }
          >
            Próxima
          </button>
        </div>
      </section>

      <footer>JUNGLE MARKET · Arte digital, sem limites.</footer>
    </main>
  );
}