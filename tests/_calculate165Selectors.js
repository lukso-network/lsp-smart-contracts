const Calculate165Selectors = artifacts.require("Calculate165Selectors");

contract("Calculate Selectors", accounts => {
    let contract;
    beforeEach(async function () {
        contract = await Calculate165Selectors.new();
    });

    it("LSP1", async () => {
        const result = await contract.calculateSelectorLSP1.call();
        console.log('LSP1:', result);
    });
    it("LSP1Delegate", async () => {
        const result = await contract.calculateSelectorLSP1Delegate.call();
        console.log('LSP1Delegate:', result);
    });
    it("LSP6KeyManager", async () => {
        const result = await contract.calculateSelectorLSP6KeyManager.call();
        console.log('LSP6KeyManager:', result);
    });
});
