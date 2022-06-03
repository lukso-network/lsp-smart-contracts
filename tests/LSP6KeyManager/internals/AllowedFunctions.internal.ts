import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract, TargetContract__factory } from "../../../types";
import { ERC725YKeys, PERMISSIONS } from "../../../constants";

// setup
import { LSP6InternalsTestContext } from "../../utils/context";
import { setupKeyManagerHelper } from "../../utils/fixtures";

// helpers
import { abiCoder } from "../../utils/helpers";

export const testAllowedFunctionsInternals = (
  buildContext: () => Promise<LSP6InternalsTestContext>
) => {
  let context: LSP6InternalsTestContext;

  let addressCanCallAnyFunctions: SignerWithAddress,
    addressCanCallOnlyOneFunction: SignerWithAddress;

  let targetContract: TargetContract;

  beforeEach(async () => {
    context = await buildContext();

    addressCanCallAnyFunctions = context.accounts[1];
    addressCanCallOnlyOneFunction = context.accounts[2];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

    let permissionsKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanCallAnyFunctions.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanCallOnlyOneFunction.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
        addressCanCallOnlyOneFunction.address.substring(2),
    ];

    let permissionsValues = [
      PERMISSIONS.CALL,
      PERMISSIONS.CALL,
      abiCoder.encode(
        ["bytes4[]"],
        [[targetContract.interface.getSighash("setName")]]
      ),
    ];

    await setupKeyManagerHelper(context, permissionsKeys, permissionsValues);
  });

  it("should return the right list of allowed functions", async () => {
    let bytesResult =
      await context.keyManagerInternalTester.callStatic.getAllowedFunctionsFor(
        addressCanCallOnlyOneFunction.address
      );
    let decodedResult = abiCoder.decode(["bytes4[]"], bytesResult);

    expect(decodedResult).toEqual([
      [targetContract.interface.getSighash("setName")],
    ]);

    let resultFromAccount = await context.universalProfile["getData(bytes32)"](
      ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
        addressCanCallOnlyOneFunction.address.substring(2)
    );
    let decodedResultFromAccount = abiCoder.decode(
      ["bytes4[]"],
      resultFromAccount
    );

    expect(decodedResultFromAccount).toEqual([
      [targetContract.interface.getSighash("setName")],
    ]);

    // also make sure that both functions from keyManager and from erc725 account return the same thing
    expect(bytesResult).toEqual(resultFromAccount);
  });

  it("should return an empty byte when address has no allowed functions listed", async () => {
    let bytesResult =
      await context.keyManagerInternalTester.getAllowedFunctionsFor(
        context.owner.address
      );
    expect([bytesResult]).toEqual(["0x"]);

    let resultFromAccount = await context.universalProfile["getData(bytes32)"](
      ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
        context.owner.address.substring(2)
    );
    expect(resultFromAccount).toEqual("0x");
  });
};
