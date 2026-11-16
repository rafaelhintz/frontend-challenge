import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { buscarNFT } from "./api/nfts";
import React from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export default function NFTDetail() {
  const { id } = useParams({ strict: false });

  const queryClient = useQueryClient();

const adicionarAoCarrinho = useMutation({
  mutationFn: () =>
    axios.post("/api/cart", {
      nftId: Number(id),
      quantity: 1,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    alert("NFT adicionado ao carrinho!");
  },
});

  const {
    data: nft,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["nft", id],
    queryFn: () => buscarNFT(id ?? ""),
  });

  if (isLoading) return <main className="page">Carregando NFT...</main>;

  if (isError || !nft) {
    return (
      <main className="page">
        <h1>NFT não encontrado</h1>
        <Link
            to="/"
                search={{
                busca: undefined,
                categoria: undefined,
                ordem: undefined,
                pagina: 1,
                }}
            >
                Voltar ao catálogo
</Link>
      </main>
    );
  }

  return (
    <main className="page">
        <Link
            to="/"
            search={{
                busca: undefined,
                categoria: undefined,
                ordem: undefined,
                pagina: 1,
            }}
            >
            Voltar ao catálogo
        </Link>
      <article className="card" style={{ maxWidth: 480, margin: "32px auto" }}>
        <div
          className="art"
          style={{
            height: 360,
            background: `linear-gradient(145deg, ${nft.color}, #171322)`,
          }}
        >
          <span>{nft.emoji}</span>
        </div>
        <div className="card-info">
          <p>{nft.collection}</p>
          <h1>{nft.name}</h1>
          <p>Categoria: {nft.category}</p>
          <div className="price">
            <span>Preço atual</span>
            <strong>{nft.price} ETH</strong>
          </div>
            <button
            className="buy"
            type="button"
            onClick={() => adicionarAoCarrinho.mutate()}
            disabled={adicionarAoCarrinho.isPending}
            >
            {adicionarAoCarrinho.isPending ? "Adicionando..." : "Adicionar ao carrinho"}
            </button>
            
        </div>
      </article>
    </main>
  );
}