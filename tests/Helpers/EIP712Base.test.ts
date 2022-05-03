import { ethers } from "hardhat";
import { EIP712Base, EIP712Base__factory } from "../../types";
import { utils } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  signTypedData_v4,
  recoverTypedSignature_v4,
  typedSignatureHash,
} from "eth-sig-util";

describe("Calculate LSP interfaces", () => {
  let accounts: SignerWithAddress[];
  let contract: EIP712Base;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    contract = await new EIP712Base__factory(accounts[0]).deploy();
  });

  it("domain seperator", async () => {
    const HARDHAT_CHAINID = 31337;
    const chainIds = HARDHAT_CHAINID;

    const domain = {
      name: "KeyManager",
      version: "LSP6",
      chainId: HARDHAT_CHAINID,
      verifyingContract: contract.address,
    };

    const domainSeparator = utils._TypedDataEncoder.hashDomain(domain);

    const result = await contract.DOMAIN_SEPARATOR();
    expect(result).toEqual(domainSeparator);
  });

  it("should recover the address that signed", async () => {
    const provider = ethers.provider;
    const pKey = new ethers.Wallet.createRandom();
    const signer = new ethers.Wallet(pKey, provider);

    const privateKey = pKey._signingKey().privateKey;

    const HARDHAT_CHAINID = 31337;
    const chainIds = HARDHAT_CHAINID;

    const data =
      "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc753b";

    const nonce = 0;

    // All properties on a domain are optional
    const domain = {
      name: "KeyManager",
      version: "LSP6",
      chainId: chainIds,
      verifyingContract: contract.address, // KeyManager address
    };

    // The named list of all type definitions
    const types = {
      RelayCall: [
        { name: "nonce", type: "uint256" },
        { name: "calldata", type: "bytes" },
      ],
    };

    // The data to sign
    const value = {
        nonce: nonce,
        calldata: data,
    };

    let signature = await signer._signTypedData(domain, types, value);

    console.log(signer.address);

    const addressRecovered = await contract.callStatic.recover(
        nonce,
        data,
      signature
    );
    console.log(addressRecovered);
  });
});
