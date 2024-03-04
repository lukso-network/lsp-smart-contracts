import { zeroPadValue, toBeHex, toBigInt } from 'ethers';
import type { BigNumberish, BytesLike } from 'ethers';

export const tokenIdAsBytes32 = (tokenId: BigNumberish): BytesLike => {
  return zeroPadValue(toBeHex(toBigInt(tokenId)), 32);
};
