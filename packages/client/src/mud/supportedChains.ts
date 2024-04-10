/*
 * The supported chains.
 * By default, there are only two chains here:
 *
 * - mudFoundry, the chain running on anvil that pnpm dev
 *   starts by default. It is similar to the viem anvil chain
 *   (see https://viem.sh/docs/clients/test.html), but with the
 *   basefee set to zero to avoid transaction fees.
 * - latticeTestnet, our public test network.
 *

 */

import { MUDChain, latticeTestnet, mudFoundry } from "@latticexyz/common/chains";

export const garnetHolesky = {
  id: 17069,
  network: "garnet-holesky",
  name: "Garnet Holesky",
  nativeCurrency: { name: "Garnet Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.garnet.qry.live/"],
    },
    public: {
      http: ["https://rpc.garnet.qry.live/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.garnet.qry.live/",
    },
  },
  testnet: true,
};

/*
 * See https://mud.dev/tutorials/minimal/deploy#run-the-user-interface
 * for instructions on how to add networks.
 */
export const supportedChains: MUDChain[] = [mudFoundry, latticeTestnet, garnetHolesky];
