import React, { useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { NFT } from "./api/nfts";

type CartItem = { nftId: number; quantity: number };
type CartResponse = { items: CartItem[] };
type Quote = {
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
};
type Order = {
  id: string;
  status: "confirmed" | "rejected";
  transactionId: string;
  total: string;
};

export default function Checkout() {
  const [coupon, setCoupon] = useState("");
  const [wallet, setWallet] = useState("Jungle Wallet");
  const [network, setNetwork] = useState("Ethereum");
  const [order, setOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await axios.get<CartResponse>("/api/cart");
      return response.data.items;
    },
  });

  const { data: catalog = [] } = useQuery({
    queryKey: ["nfts-checkout-catalog"],
    queryFn: async () => {
      const response = await axios.get<{ items: NFT[] }>("/api/nfts", {
        params: { pagina: 1, busca: "", categoria: "Todos", ordem: "recentes" },
      });
      return response.data.items;
    },
  });

  const quoteMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post<Quote>("/api/checkout/quote", { coupon });
      return response.data;
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (paymentResult: "confirmed" | "rejected") => {
      const key = crypto.randomUUID();
      const response = await axios.post<Order>(
        "/api/orders",
        { paymentResult, wallet, network },
        { headers: { "Idempotency-Key": key } },
      );
      return response.data;
    },
    onSuccess: (createdOrder) => {
      setOrder(createdOrder);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  if (isLoading) return <main className="page">Carregando checkout...</main>;

  const items = cartItems
    .map((item) => ({
      ...item,
      nft: catalog.find((nft) => nft.id === item.nftId),
    }))
    .filter((item) => item.nft !== undefined);

  if (order) {
    return (
      <main className="page">
        <h1>{order.status === "confirmed" ? "Pedido confirmado" : "Pagamento recusado"}</h1>
        <p>Pedido: {order.id}</p>
        <p>Transação simulada: {order.transactionId}</p>
        <p>Total: {order.total} ETH</p>
        <Link to="/cart" search={{ busca: undefined, categoria: undefined, ordem: undefined, pagina: 1 }}>
          Voltar ao carrinho
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Pagamento</h1>
      {items.map(({ nft, quantity, nftId }) => (
        <article className="card cart-item" key={nftId}>
          <div className="card-info">
            <h2>{nft!.name}</h2>
            <p>{quantity} × {nft!.price} ETH</p>
          </div>
        </article>
      ))}

      <section className="cart-summary">
        <label>
          Cupom
          <input value={coupon} onChange={(event) => setCoupon(event.target.value)} />
        </label>
        <label>
          Carteira
          <select value={wallet} onChange={(event) => setWallet(event.target.value)}>
            <option>Jungle Wallet</option>
            <option>Wallet secundária</option>
          </select>
        </label>
        <label>
          Rede
          <select value={network} onChange={(event) => setNetwork(event.target.value)}>
            <option>Ethereum</option>
            <option>Polygon</option>
          </select>
        </label>

        <button type="button" onClick={() => quoteMutation.mutate()}>
          Revisar valores
        </button>

        {quoteMutation.data && (
          <div>
            <p>Subtotal: {quoteMutation.data.subtotal} ETH</p>
            <p>Desconto: {quoteMutation.data.discount} ETH</p>
            <p>Taxa de rede: {quoteMutation.data.networkFee} ETH</p>
            <strong>Total: {quoteMutation.data.total} ETH</strong>
            <button
              className="buy"
              type="button"
              disabled={orderMutation.isPending}
              onClick={() => orderMutation.mutate("confirmed")}
            >
              {orderMutation.isPending ? "Enviando pedido..." : "Confirmar compra"}
            </button>
            <button
              type="button"
              disabled={orderMutation.isPending}
              onClick={() => orderMutation.mutate("rejected")}
            >
              Simular recusa
            </button>
          </div>
        )}

        {quoteMutation.isError && <p role="alert">Não foi possível calcular os valores.</p>}
        {orderMutation.isError && <p role="alert">Falha ao enviar pedido. Tente novamente.</p>}
      </section>
    </main>
  );
}