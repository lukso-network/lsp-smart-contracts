import { expect } from "chai";
import { ethers, network } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LSP0ERC725Account, LSP9Vault } from "../types";

// helpers
import { provider } from "./utils/helpers";

export type RenounceOwnershipTestContext = {
    accounts: SignerWithAddress[];
    contract: LSP0ERC725Account | LSP9Vault;
    deployParams: {
        owner: SignerWithAddress;
    };
};

export const shouldBehaveLikeRenounceOwnership = (
    buildContext: () => Promise<RenounceOwnershipTestContext>
    ) => {
    let context: RenounceOwnershipTestContext;

    before(async () => {
        // mine 1,000 blocks
        await network.provider.send("hardhat_mine", [ethers.utils.hexValue(1000)]);
    });
    
    beforeEach(async () => {
        context = await buildContext();
    });

    describe("when calling renounceOwnership() with a non-owner account", () => {
        it("should revert with custom message", async () => {
            const tx = context.contract
                .connect(context.accounts[1])
                .renounceOwnership();
            
            await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
        })
    })

    describe("when calling renounceOwnership() the first time", () => {
        
        it("should instantiate the renounceOwnership process correctly", async () => {
            let tx = await context.contract
                .connect(context.deployParams.owner)
                .renounceOwnership();

            await tx.wait();
        
            const _renounceOwnershipStartedAtAfter = await provider.getStorageAt(context.contract.address, 2);

            expect(
                ethers.BigNumber.from(_renounceOwnershipStartedAtAfter).toNumber()
            ).to.equal(tx.blockNumber);
        });
        
        it("should have emitted a RenounceOwnershipInitiated event", async () => {
            await expect(
                context.contract.connect(context.deployParams.owner).renounceOwnership()
            ).to.emit(
                context.contract, "RenounceOwnershipInitiated"
            );
        });

        it("should not change the current owner", async () => {
            await context.contract
                .connect(context.deployParams.owner)
                .renounceOwnership();
        
            expect(await context.contract.owner())
                .to.equal(context.deployParams.owner.address);
        });

    });

    describe("when calling renounceOwnership() the second time", () => {
        
        it("should revert if called in the delay period", async () => {
            const renounceOwnershipOnce = await context.contract
                .connect(context.deployParams.owner)
                .renounceOwnership();

            await network.provider.send("hardhat_mine", ["0x62"]); // skip 98 blocks

            const renounceOwnershipSecond = context.contract
                .connect(context.deployParams.owner)
                .renounceOwnership();

            await expect(renounceOwnershipSecond)
                .to.be.revertedWithCustomError(
                    context.contract,
                    "NotInRenounceOwnershipInterval"
                )
                .withArgs(
                    (await renounceOwnershipOnce).blockNumber + 100,
                    (await renounceOwnershipOnce).blockNumber + 200
                );

            expect(await context.contract.owner()).to.equal(
                context.deployParams.owner.address
            );
        });

        it("should pass if called afer the delay nad before the confirmation period end", async () => {
            await context.contract
                .connect(context.deployParams.owner)
                .renounceOwnership();

            await network.provider.send("hardhat_mine", ["0x63"]); // skip 99 blocks

            const renounceOwnershipSecond = context.contract
                .connect(context.deployParams.owner)
                .renounceOwnership();

            await expect(renounceOwnershipSecond)
                .to.emit(context.contract, "OwnershipTransferred")
                .withArgs(context.deployParams.owner.address, ethers.constants.AddressZero);

            expect(await context.contract.owner()).to.equal(
                ethers.constants.AddressZero
            );
        });

        it("should initialize again if the confirmation period passed", async () => {

            await context.contract
                .connect(context.deployParams.owner)
                .renounceOwnership();

            await network.provider.send("hardhat_mine", ["0xc8"]); // skip 200 blocks

            let tx = await context.contract
                .connect(context.deployParams.owner)
                .renounceOwnership();

            await tx.wait();
        
            const _renounceOwnershipStartedAtAfter = await provider.getStorageAt(context.contract.address, 2);

            expect(
                ethers.BigNumber.from(_renounceOwnershipStartedAtAfter).toNumber()
            ).to.equal(tx.blockNumber);
        });
    });
    
};