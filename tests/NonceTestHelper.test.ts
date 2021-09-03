import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  EIP712WithNonce,
  EIP712WithNonce__factory,
  NonceTestHelper,
  NonceTestHelper__factory,
  TargetContract,
  TargetContract__factory,
} from "../build/types";

describe("EIP712WithNonce", () => {
  let accounts: SignerWithAddress[] = [];

  let nonceTestHelper: NonceTestHelper;
  let targetcontract: TargetContract;

  let mainCaller;

  let nonces = [0, 1, 2, 3];
  let names = ["Yamen", "Nour", "Huss", "Moussa"];
  let calls = ["First", "Second", "Third", "Fourth"];

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    mainCaller = accounts[0];

    nonceTestHelper = await new NonceTestHelper__factory(mainCaller).deploy();
    targetcontract = await new TargetContract__factory(mainCaller).deploy();
  });

  it("`Name` in TargetContract should be `Simple Contract Name` initially", async () => {
    let result = await targetcontract.callStatic.getName();
    expect(result).toEqual("Simple Contract Name");
  });

  describe("Sequential nonce (= timeline 0)", () => {
    for (let ii = 0; ii <= nonces.length - 1; ii++) {
      it(`${calls[ii]} call > nonce should increment from ${nonces[ii]} to ${
        nonces[ii] + 1
      }`, async () => {
        let nonceBefore = await nonceTestHelper.callStatic.getNonce(mainCaller.address, 0);

        let newName = names[ii];
        await nonceTestHelper.callSetName(
          newName,
          targetcontract.address,
          mainCaller.address,
          nonceBefore
        );

        let fetchedName = await targetcontract.callStatic.getName();
        let nonceAfter = await nonceTestHelper.callStatic.getNonce(mainCaller.address, 0);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    }

    it("Should stop replay attack ", async () => {
      await nonceTestHelper.callSetName(
        "Salah",
        targetcontract.address,
        mainCaller.address,
        await nonceTestHelper.callStatic.getNonce(mainCaller.address, 0)
      );

      let nonceBefore = await nonceTestHelper.callStatic.getNonce(mainCaller.address, 0);
      let nameBefore = await targetcontract.callStatic.getName();
      await expect(
        nonceTestHelper.callSetName("Sami", targetcontract.address, mainCaller, nonceBefore)
      ).toBeReverted();

      let nonceAfter = await nonceTestHelper.callStatic.getNonce(mainCaller.address, 0);
      let nameAfter = await targetcontract.callStatic.getName();

      expect(nameAfter).toEqual(nameBefore);
      expect(nonceBefore).toEqBN(nonceAfter); // ensure the nonce has not changed
    });
  });

  describe("Multi timeline nonce", () => {
    let nonces = [0, 1];

    describe("> timeline 1", () => {
      let timeline = 1;
      let names = ["Hugo", "Reto"];

      it(`First call > nonce should increment from ${nonces[0]} to ${nonces[0] + 1}`, async () => {
        let nonceBefore = await nonceTestHelper.getNonce(mainCaller.address, timeline);

        let newName = names[0];
        await nonceTestHelper.callSetName(
          names[0],
          targetcontract.address,
          mainCaller.address,
          nonceBefore
        );

        let fetchedName = await targetcontract.callStatic.getName();
        let nonceAfter = await nonceTestHelper.callStatic.getNonce(mainCaller.address, timeline);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${nonces[1] + 1}`, async () => {
        let nonceBefore = await nonceTestHelper.getNonce(mainCaller.address, timeline);

        let newName = names[1];
        await nonceTestHelper.callSetName(
          newName,
          targetcontract.address,
          mainCaller.address,
          nonceBefore
        );

        let fetchedName = await targetcontract.callStatic.getName();
        let nonceAfter = await nonceTestHelper.callStatic.getNonce(mainCaller.address, timeline);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("> timeline 2", () => {
      let timeline = 2;
      let names = ["Hugo", "Reto"];

      it(`First call > nonce should increment from ${nonces[0]} to ${nonces[0] + 1}`, async () => {
        let nonceBefore = await nonceTestHelper.getNonce(mainCaller.address, timeline);

        let newName = names[0];
        await nonceTestHelper.callSetName(
          newName,
          targetcontract.address,
          mainCaller.address,
          nonceBefore
        );

        let fetchedName = await targetcontract.callStatic.getName();
        let nonceAfter = await nonceTestHelper.callStatic.getNonce(mainCaller.address, timeline);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${nonces[1] + 1}`, async () => {
        let nonceBefore = await nonceTestHelper.getNonce(mainCaller.address, timeline);

        let newName = names[1];
        await nonceTestHelper.callSetName(
          newName,
          targetcontract.address,
          mainCaller.address,
          nonceBefore
        );

        let fetchedName = await targetcontract.callStatic.getName();
        let nonceAfter = await nonceTestHelper.callStatic.getNonce(mainCaller.address, timeline);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("> timeline 3", () => {
      let timeline = 3;
      let names = ["Jean", "Lenny"];

      it(`First call > nonce should increment from ${nonces[0]} to ${nonces[0] + 1}`, async () => {
        let nonceBefore = await nonceTestHelper.getNonce(mainCaller.address, timeline);

        let newName = names[0];
        await nonceTestHelper.callSetName(
          newName,
          targetcontract.address,
          mainCaller.address,
          nonceBefore
        );

        let fetchedName = await targetcontract.callStatic.getName();
        let nonceAfter = await nonceTestHelper.callStatic.getNonce(mainCaller.address, timeline);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${nonces[1] + 1}`, async () => {
        let nonceBefore = await nonceTestHelper.getNonce(mainCaller.address, timeline);

        let newName = names[1];
        await nonceTestHelper.callSetName(
          newName,
          targetcontract.address,
          mainCaller.address,
          nonceBefore
        );

        let fetchedName = await targetcontract.callStatic.getName();
        let nonceAfter = await nonceTestHelper.callStatic.getNonce(mainCaller.address, timeline);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("> timeline 15", () => {
      it("First call > nonce should increment from 0 to 1", async () => {
        let timeline = 15;
        let nonceBefore = await nonceTestHelper.getNonce(mainCaller.address, timeline);

        let newName = "Lukas";
        await nonceTestHelper.callSetName(
          newName,
          targetcontract.address,
          mainCaller.address,
          nonceBefore
        );

        let fetchedName = await targetcontract.callStatic.getName();
        let nonceAfter = await nonceTestHelper.callStatic.getNonce(mainCaller.address, timeline);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    /** @todo test batch request to ensure users do not have to wait to receive their tokens */
  });
});
