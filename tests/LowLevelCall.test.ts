import { ethers } from "hardhat";
import { expect } from "chai";

import {
  Source,
  Source__factory,
  TargetContract,
  TargetContract__factory,
  SourceERC725,
  SourceERC725__factory,
  ERC725Y,
  ERC725Y__factory,
} from "../types";

describe("Solidity Low Level Call", () => {
  let source: Source;
  let target: TargetContract;

  before("setup", async () => {
    target = await new TargetContract__factory(
      ethers.provider.getSigner()
    ).deploy();

    source = await new Source__factory(ethers.provider.getSigner()).deploy(
      target.address
    );
  });

  it("test function call", async () => {
    await source.doFunctionCall();

    const result = await target.getNumber();
    // console.log("number = ", result);

    expect(result).to.equal(42);
  });

  it("test low level call with calldata passed as param", async () => {
    const callData = target.interface.encodeFunctionData("setNumber", [91]);

    const estimateGas = await source.estimateGas.doLowLevelCallWithParam(
      callData
    );
    // console.log("estimateGas = ", estimateGas);

    const tx = await source.doLowLevelCallWithParam(callData);
    const receipt = await tx.wait();
    // console.log("receipt = ", receipt);

    const result = await target.getNumber();
    // console.log("number = ", result);

    expect(result).to.equal(91);
  });

  it("test low level call with `abi.encodeWithSelector`", async () => {
    const estimateGas =
      await source.estimateGas.doLowLevelCallAbiEncodeWithSelector();
    // console.log("estimateGas = ", estimateGas);

    const tx = await source.doLowLevelCallAbiEncodeWithSelector();
    const receipt = await tx.wait();
    // console.log("receipt = ", receipt);

    const result = await target.getNumber();
    // console.log("number = ", result);

    expect(result).to.equal(55);
  });
});

describe("Solidity Low Level Call + plain ERC725", () => {
  let sourceERC725;
  let targetERC725;

  before("setup", async () => {
    sourceERC725 = await new SourceERC725__factory(
      ethers.provider.getSigner()
    ).deploy();

    targetERC725 = await new ERC725Y__factory(
      ethers.provider.getSigner()
    ).deploy(sourceERC725.address);

    await sourceERC725.setERC725Contract(targetERC725.address);
  });

  it("test function call", async () => {
    const dataKey =
      "0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1";

    const expectedValue = ethers.utils.hexlify(
      ethers.utils.toUtf8Bytes("Some value with function call")
    );

    await sourceERC725.setDataFunctionCall();

    const result = await targetERC725.getData(dataKey);
    // console.log("result = ", result);

    expect(result).to.equal(expectedValue);
  });

  it("test low level call with calldata param", async () => {
    const dataKey =
      "0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1";

    const expectedValue = ethers.utils.hexlify(
      ethers.utils.toUtf8Bytes(
        "Some value with low level call with calldata param"
      )
    );

    const calldata = targetERC725.interface.encodeFunctionData("setData", [
      dataKey,
      expectedValue,
    ]);

    await sourceERC725.setDataLowLevelCallWithCalldataParam(calldata);

    const result = await targetERC725.getData(dataKey);
    // console.log("result = ", result);

    expect(result).to.equal(expectedValue);
  });

  it("test low level call with address and calldata param", async () => {
    const dataKey =
      "0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1";

    const expectedValue = ethers.utils.hexlify(
      ethers.utils.toUtf8Bytes(
        "Some value with low level call with address and calldata params"
      )
    );

    const calldata = targetERC725.interface.encodeFunctionData("setData", [
      dataKey,
      expectedValue,
    ]);

    await sourceERC725.setDataLowLevelCallWithCalldataAndAddressParams(
      targetERC725.address,
      calldata
    );

    const result = await targetERC725.getData(dataKey);
    // console.log("result = ", result);

    expect(result).to.equal(expectedValue);
  });

  it("test low level call with `abi.encodeWithSelector`", async () => {
    const dataKey =
      "0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1";
    const dataValue =
      "Some value with low level call through `abi.encodeWithSelector`";

    const estimateGas = await sourceERC725.estimateGas.setDataLowLevelCall();
    // console.log("estimateGas = ", estimateGas);

    const callSucceeded = await sourceERC725.callStatic.setDataLowLevelCall();
    // console.log("callSucceeded = ", callSucceeded);

    const tx = await sourceERC725.setDataLowLevelCall();
    const receipt = await tx.wait();
    // console.log("receipt = ", receipt);

    const result = await targetERC725.getData(dataKey);
    // console.log("result = ", result);

    expect(result).to.equal(
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(dataValue))
    );
  });
});
