import React from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { NFT } from "./api/nfts";

type CartItem = {
  nftId: number;
  quantity: number;
};

type CartResponse = {
  items: CartItem[];
};

export default function Cart() {
  const queryClient = useQueryClient();

  const {
    data: cartItems = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
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
        params: {
          pagina: 1,
          busca: "",
          categoria: "Todos",
          ordem: "recentes",
        },
      });
      return response.data.items;
    },
  });

  const atualizarQuantidade = useMutation({
    mutationFn: async ({
      nftId,
      quantity,
    }: {
      nftId: number;
      quantity: number;
    }) => {
      await axios.patch(`/api/cart/${nftId}`, { quantity });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removerItem = useMutation({
    mutationFn: async (nftId: number) => {
      await axios.delete(`/api/cart/${nftId}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  if (isLoading) {
    return <main className="page"><h1>Carregando carrinho...</h1></main>;
  }

  if (isError) {
    return (
      <main className="page">
        <h1>Não foi possível carregar o carrinho.</h1>
        <button type="button" onClick={() => refetch()}>
          Tentar novamente
        </button>
      </main>
    );
  }

  const items = cartItems
    .map((item) => ({
      ...item,
      nft: catalog.find((nft) => nft.id === item.nftId),
    }))
    .filter((item) => item.nft !== undefined);

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
          {items.map(({ nft, quantity, nftId }) => (
            <article className="card cart-item" key={nftId}>
              <div className="card-info">
                <p>{nft!.collection}</p>
                <h2>{nft!.name}</h2>
                <p>Preço: {nft!.price} ETH</p>

                <div className="cart-controls">
                  <button
                    type="button"
                    aria-label={`Diminuir quantidade de ${nft!.name}`}
                    disabled={quantity <= 1 || atualizarQuantidade.isPending}
                    onClick={() =>
                      atualizarQuantidade.mutate({
                        nftId,
                        quantity: quantity - 1,
                      })
                    }
                  >
                    −
                  </button>
                  <span>Quantidade: {quantity}</span>
                  <button
                    type="button"
                    aria-label={`Aumentar quantidade de ${nft!.name}`}
                    disabled={atualizarQuantidade.isPending}
                    onClick={() =>
                      atualizarQuantidade.mutate({
                        nftId,
                        quantity: quantity + 1,
                      })
                    }
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removerItem.mutate(nftId)}
                    disabled={removerItem.isPending}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </article>
          ))}

          <section className="cart-summary">
            <h2>Resumo</h2>
            <p>Subtotal: {subtotal.toFixed(2)} ETH</p>
            <Link
              className="buy"
              to="/checkout"
              search={{
                busca: undefined,
                categoria: undefined,
                ordem: undefined,
                pagina: 1,
              }}
            >
              Continuar para pagamento
            </Link>
          </section>
        </>
      )}
    </main>
  );
}