import { AddEthereumChainParameter, ChainId } from './types';

export const optimisticKovan: AddEthereumChainParameter = {
  chainId: '0x45' as ChainId,
  chainName: 'Optimistic Kovan',
  blockExplorerUrls: ['https://kovan-optimistic.etherscan.io/'],
  rpcUrls: ['https://kovan.optimism.io'],
};

export const optimism: AddEthereumChainParameter = {
  chainId: '0xa' as ChainId,
  chainName: 'Optimism',
  rpcUrls: ['https://mainnet.optimism.io'],
  nativeCurrency: {
    name: 'Optimistic ETH',
    symbol: 'ETH',
    decimals: 18
  },
  blockExplorerUrls: ['https://optimistic.etherscan.io/']
};
