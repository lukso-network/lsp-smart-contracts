import * as ethers from 'ethers';
import type { BigNumberish, BytesLike } from 'ethers';

export const tokenIdAsBytes32 = (tokenId: BigNumberish): BytesLike => {
  return ethers.utils.hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32);
};
