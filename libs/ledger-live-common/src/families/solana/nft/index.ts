//import { programs, MetadataJson } from "@metaplex/js";
import { PublicKey } from "@solana/web3.js";
import { ChainAPI } from "../api";
import network from "../../../network";
import {
  Metadata,
  MasterEditionV2,
  Key,
} from "@metaplex-foundation/mpl-token-metadata";

export async function nft(
  api: ChainAPI,
  mint: string
): Promise<
  | {
      onChainMetadata: Metadata;
      offChainMetadata?: OffChainMetadata;
    }
  | undefined
> {
  try {
    const onChainMetadata = await api.nft.loadMetadata(mint);

    if (onChainMetadata.data.uri) {
      const { data: offChainMetadata } = await network({
        method: "GET",
        url: onChainMetadata.data.uri,
      });

      return { onChainMetadata, offChainMetadata };
    }
    return { onChainMetadata };
  } catch (e: any) {
    return undefined;
  }
}

type OffChainMetadata = {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  animation_url: string;
  external_url: string;
  attributes: Attribute[];
  // or string?
  collection: Collection;
  properties: Properties;
};

type Attribute = {
  trait_type: string;
  display_type: string;
  value: string | number;
};

type Collection = {
  name: string;
  family: string;
};

type File = {
  uri: string;
  // should match file extension
  type: string;
  cdn?: boolean;
};

type Creator = {
  address: string;
  // or shares?
  share: number;
};

type Category = "image" | "video" | "audio" | "vr" | "html";

type Properties = {
  files: File[];
  category: Category;
  creators: Creator[];
};
