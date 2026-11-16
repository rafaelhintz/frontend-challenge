import axios from "axios";

export type NFT = {
  id: number;
  name: string;
  collection: string;
  category: string;
  price: string;
  color: string;
  emoji: string;
};

export type NFTQuery = {
  busca: string;
  categoria: string;
  ordem: string;
  pagina: number;
};

export type NFTPage = {
  items: NFT[];
  pagina: number;
  total: number;
  totalPaginas: number;
};

export async function buscarNFTs(params: NFTQuery): Promise<NFTPage> {
  const resposta = await axios.get<NFTPage>("/api/nfts", { params });
  return resposta.data;
}