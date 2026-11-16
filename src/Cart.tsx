import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { NFT } from "./api/nfts";

type CartResponse = {
  items: { nftId: number; quantity: number }[];
};

export default function Cart() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await axios.get<CartResponse>("/api/cart");
      return response.data.items;
    },
  });

  const { data: catalog = [] } = useQuery({
    queryKey: ["nfts-cart-catalog"],
    queryFn: async () => {
      const response = await axios.get<{ items: NFT[] }>("/api/nfts", {
        params: { pagina: 1, busca: "", categoria: "Todos", ordem: "recentes" },
      });
      return response.data.items;
    },
  });

  if (isLoading) return <main className="page">Carregando carrinho...</main>;

  if (isError) {
    return (
      <main className="page">
        <h1>Não foi possível carregar o carrinho.</h1>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </main>
    );
  }

  const items = (data ?? [])
    .map((item) => ({
      ...item,
      nft: catalog.find((nft) => nft.id === item.nftId),
    }))
    .filter((item) => item.nft);

  const subtotal = items.reduce(
    (total, item) => total + Number(item.nft!.price) * item.quantity,
    0,
  );

  return (
    <main className="page">
      <h1>Carrinho</h1>
      <Link
        to="/"
        search={{
          busca: undefined,
          categoria: undefined,
          ordem: undefined,
          pagina: 1,
        }}
      >
        Continuar explorando
      </Link>

      {items.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          {items.map(({ nft, quantity }) => (
            <article className="card cart-item" key={nft!.id}>
              <div className="card-info">
                <p>{nft!.collection}</p>
                <h2>{nft!.name}</h2>
                <p>
                  Quantidade: {quantity} · Preço: {nft!.price} ETH
                </p>
              </div>
            </article>
          ))}
          <section className="cart-summary">
            <h2>Resumo</h2>
            <p>Subtotal: {subtotal.toFixed(2)} ETH</p>
            <button className="buy" type="button">
              Continuar para pagamento
            </button>
          </section>
        </>
      )}
    </main>
  );
}