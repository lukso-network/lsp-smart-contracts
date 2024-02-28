import * as ethers from 'ethers';
import type { BigNumberish, BytesLike } from 'ethers';

export const tokenIdAsBytes32 = (tokenId: BigNumberish): BytesLike => {
  return ethers.zeroPadValue(ethers.toBeHex(ethers.toBigInt(tokenId)), 32);
};
