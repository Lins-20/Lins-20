import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import { CHAINID } from './constants/constants';
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })
import '@openzeppelin/hardhat-upgrades';

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: CHAINID.HARDHAT_NETWORK
    },
    goerli: {
      chainId: 0x5,
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: process.env.ACCOUNTS?.split(",")
    },
    arbitrum: {
      chainId: 0xa4b1,
      url: "https://arb1.arbitrum.io/rpc",
      accounts: process.env.ACCOUNTS?.split(",")
    },
    linea_testnet: {
      chainId: 0xe704,
      url: "https://rpc.goerli.linea.build",
      accounts: process.env.ACCOUNTS?.split(",")
    },
    linea: {
      chainId: 0xe708,
      url: "https://1rpc.io/linea",
      accounts: process.env.ACCOUNTS?.split(",")
    },
    polygon: {
      chainId: 0x89,
      url: "https://rpc-mainnet.matic.quiknode.pro",
      accounts: process.env.ACCOUNTS?.split(",")
    }
  },
  etherscan: {
    apiKey: {
      goerli: process.env.GOERLI_KEY ?? "",
      arbitrumOne: process.env.ARBITRUM_KEY ?? "",
      polygon: process.env.POLYGON_KEY ?? ""
    }
  },
  namedAccounts: {
    deployer: 0,
  },
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

export default config;
