const {singletons, BN, ether, expectRevert} = require("openzeppelin-test-helpers");

const LSP3Account = artifacts.require("LSP3Account");
const KeyManager = artifacts.require("SimpleKeyManager");
const DigitalCertificateFungible = artifacts.require("LSP4DigitalCertificate");
const ERC777UniversalReceiver = artifacts.require("ERC777UniversalReceiver");
const UniversalReceiverTester = artifacts.require("UniversalReceiverTester");
const ExternalERC777UniversalReceiverTester = artifacts.require("ExternalERC777UniversalReceiverTester");
const UniversalReceiverAddressStore = artifacts.require("UniversalReceiverAddressStore");

const SupportedStandardsERC725Account_KEY = '0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6';
// Get key: bytes4(keccak256('ERC725Account'))
const ERC725Account_VALUE = '0xafdeb5d6';
// Get key: keccak256('LSP1UniversalReceiverDelegate')
const UNIVERSALRECEIVER_KEY = '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47';
// keccak256("EXECUTOR_ROLE")
const EXECUTOR_ROLE = "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63";
const ERC1271_MAGIC_VALUE = '0x1626ba7e';
const ERC1271_FAIL_VALUE = '0xffffffff';
const RANDOM_BYTES32 = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
const ERC777TokensRecipient = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
const DUMMY_PRIVATEKEY = '0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe';
// generate an account
const DUMMY_SIGNER = web3.eth.accounts.wallet.add(DUMMY_PRIVATEKEY);


contract("LSP3Account", accounts => {
    let erc1820;

    beforeEach(async function () {
        erc1820 = await singletons.ERC1820Registry(accounts[1]);
    });

    context("Accounts Deployment", async () => {
        it("Deploys correctly, and compare owners", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const idOwner = await account.owner.call();

            assert.equal(idOwner, owner, "Addresses should match");
        });
    });

    context("ERC165", async () => {
        
        it("Supports ERC165", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const interfaceID = '0x01ffc9a7';

            const result = await account.supportsInterface.call(interfaceID);

            assert.isTrue(result);
        });

        it("Supports ERC725X", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const interfaceID = '0x44c028fe';

            const result = await account.supportsInterface.call(interfaceID);

            assert.isTrue(result);
        });

        it("Supports ERC725Y", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const interfaceID = '0x2bd57b73';

            const result = await account.supportsInterface.call(interfaceID);

            assert.isTrue(result);
        });

        it("Supports ERC1271", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const interfaceID = '0x1626ba7e';

            const result = await account.supportsInterface.call(interfaceID);

            assert.isTrue(result);
        });

        it("Supports LSP1", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const interfaceID = '0x6bb56a14';

            const result = await account.supportsInterface.call(interfaceID);

            assert.isTrue(result);
        });

        it("Has SupportedStandardsERC725Account_KEY set to ERC725Account_VALUE", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            assert.equal(await account.getData(SupportedStandardsERC725Account_KEY), ERC725Account_VALUE);
        });
    });

    context("ERC1271", async () => {

        it("Can verify signature from owner", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(DUMMY_SIGNER.address, {from: owner});
            const dataToSign = '0xcafecafe';
            const signature = DUMMY_SIGNER.sign(dataToSign);

            const result = await account.isValidSignature.call(signature.messageHash, signature.signature);

            assert.equal(result, ERC1271_MAGIC_VALUE, "Should define the signature as valid");
        });

        it("Should fail when verifying signature from not-owner", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const dataToSign = '0xcafecafe';
            const signature = DUMMY_SIGNER.sign(dataToSign);

            const result = await account.isValidSignature.call(signature.messageHash, signature.signature);

            assert.equal(result, ERC1271_FAIL_VALUE, "Should define the signature as invalid");
        });

    });

    context("Storage test", async () => {
        let account;
        let owner = accounts[2];
        let count = 1000000000;

        it("Create account", async () => {
            account = await LSP3Account.new(owner, {from: owner});

            assert.equal(await account.owner.call(), owner);
        });

        it("Store 32 bytes item 1", async () => {
            let key = web3.utils.numberToHex(count++);
            let value = web3.utils.numberToHex(count++);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });

        it("Store 32 bytes item 2", async () => {
            let key = web3.utils.numberToHex(count++);
            let value = web3.utils.numberToHex(count++);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });
        it("Store 32 bytes item 3", async () => {
            let key = web3.utils.numberToHex(count++);
            let value = web3.utils.numberToHex(count++);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });

        it("Store 32 bytes item 4", async () => {
            let key = web3.utils.numberToHex(count++);
            let value = web3.utils.numberToHex(count++);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });

        it("Store a long URL as bytes item 5: https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD", async () => {
            let key = web3.utils.numberToHex(count++);
            let value = web3.utils.utf8ToHex('https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD');
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });

        it("Store 32 bytes item 6", async () => {
            let key = web3.utils.numberToHex(count);
            let value = web3.utils.numberToHex(count);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });

        it("dataCount should be 7", async () => {
            // 7 because the ERC725Type ios already set by the ERC725Account implementation
            assert.equal(await account.dataCount(), 7);
        });

        it("Update 32 bytes item 6", async () => {
            let key = web3.utils.numberToHex(count);
            let value = web3.utils.numberToHex(count);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });

        it("dataCount should be 7", async () => {
            // 7 because the ERC725Type ios already set by the ERC725Account implementation
            assert.equal(await account.dataCount(), 7);

            let keys = await account.allDataKeys();
            assert.equal(keys.length, 7);

            console.log('Stored keys', keys);
        });

        it("Store multiple 32 bytes item 8-10", async () => {
            let keys = [];
            let values = [];
            // increase
            count++
            for (let i = 8; i <= 10; i++) {
                keys.push(web3.utils.numberToHex(count++));
                values.push(web3.utils.numberToHex(count + 1000));
            }
            await account.setDataMultiple(keys, values, {from: owner});
            console.log(await account.getDataMultiple(keys))
            assert.deepEqual(await account.getDataMultiple(keys), values);
        });

        it("dataCount should be 10", async () => {
            // 7 because the ERC725Type ios already set by the ERC725Account implementation
            assert.equal(await account.dataCount(), 10);

            let keys = await account.allDataKeys();
            assert.equal(keys.length, 10);

            console.log('Stored keys', keys);
        });

    });

    context("Interactions with Accounts contracts", async () => {
        const owner = accounts[3];
        const newOwner = accounts[5];
        let account = {};

        beforeEach(async () => {
            account = await LSP3Account.new(owner, {from: owner});
        });

        it("Uprade ownership correctly", async () => {
            await account.transferOwnership(newOwner, {from: owner});
            const idOwner = await account.owner.call();

            assert.equal(idOwner, newOwner, "Addresses should match");
        });

        it("Refuse upgrades from non-onwer", async () => {
            await expectRevert(
                account.transferOwnership(newOwner, {from: newOwner}),
                "Ownable: caller is not the owner"
            );
        });

        it("Owner can set data", async () => {
            const key = web3.utils.asciiToHex("Important Data");
            const data = web3.utils.asciiToHex("Important Data");

            await account.setData(key, data, {from: owner});

            let fetchedData = await account.getData(key);

            assert.equal(data, fetchedData);
        });

        it("Fails when non-owner sets data", async () => {
            const key = web3.utils.asciiToHex("Important Data");
            const data = web3.utils.asciiToHex("Important Data");

            await expectRevert(
                account.setData(key, data, {from: newOwner}),
                "Ownable: caller is not the owner"
            );
        });

        it("Fails when non-owner sets data multiple", async () => {
            const key = web3.utils.asciiToHex("Important Data");
            const data = web3.utils.asciiToHex("Important Data");

            await expectRevert(
                account.setDataMultiple([key], [data], {from: newOwner}),
                "Ownable: caller is not the owner"
            );
        });

        it("Allows owner to execute calls", async () => {
            const dest = accounts[6];
            const amount = ether("10");
            const OPERATION_CALL = 0x0;

            await web3.eth.sendTransaction({
                from: owner,
                to: account.address,
                value: amount
            });

            const destBalance = await web3.eth.getBalance(dest);

            await account.execute(OPERATION_CALL, dest, amount, "0x0", {
                from: owner
            });

            const finalBalance = await web3.eth.getBalance(dest);

            assert.isTrue(new BN(destBalance).add(amount).eq(new BN(finalBalance)));
        });

        it("Fails with non-owner executing", async () => {
            const dest = accounts[6];
            const amount = ether("10");
            const OPERATION_CALL = 0x0;

            // send money to the account
            await web3.eth.sendTransaction({
                from: owner,
                to: account.address,
                value: amount
            });

            // try to move it away
            await expectRevert(
                account.execute(OPERATION_CALL, dest, amount, "0x0", {
                    from: newOwner
                }),
                "Ownable: caller is not the owner"
            );
        });

        // TODO test delegateCall

        it("Allows owner to execute create", async () => {
            const OPERATION_CREATE = 0x3;

            let receipt = await account.execute(OPERATION_CREATE, '0x0000000000000000000000000000000000000000', '0', "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6", {
                from: owner
            });

            assert.equal(receipt.logs[1].event, 'ContractCreated');
        });

        it("Allows owner to execute create2", async () => {
            const OPERATION_CREATE2 = 0x2;

            // deploy with added 32 bytes salt
            let receipt = await account.execute(OPERATION_CREATE2, '0x0000000000000000000000000000000000000000', '0', "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6"
                // 32 bytes salt
                + "cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
                {
                    from: owner
                }
            );

            // console.log(receipt.logs[0].args);

            assert.equal(receipt.logs[1].event, 'ContractCreated');
            assert.equal(receipt.logs[1].args.contractAddress, '0xc6aFf31a98cB525c6b849E0d76cc2693F4BbccD9');
        });

        it("Allow account to receive native tokens", async () => {
            const amount = ether("10");

            // send money to the account
            await web3.eth.sendTransaction({
                from: accounts[5],
                to: account.address,
                value: amount
            });

            assert.equal(await web3.eth.getBalance(account.address), amount);
        });
    }); //Context interactions

    context("Universal Receiver", async () => {

        it("Call account and check for 'UniversalReceiver' event", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});

            // use the checker contract to call account
            let checker = await UniversalReceiverTester.new();
            let receipt = await checker.callImplementationAndReturn(
                account.address,
                RANDOM_BYTES32
            );

            // event should come from account
            assert.equal(receipt.receipt.rawLogs[0].address, account.address);
            // event signature
            assert.equal(receipt.receipt.rawLogs[0].topics[0], '0x54b98940949b5ac0325c889c84db302d4e18faec431b48bdc81706bfe482cfbd');
            // from
            assert.equal(receipt.receipt.rawLogs[0].topics[1], web3.utils.leftPad(checker.address.toLowerCase(), 64));
            // typeId
            assert.equal(receipt.receipt.rawLogs[0].topics[2], RANDOM_BYTES32);
            // receivedData
            assert.equal(receipt.receipt.rawLogs[0].data, '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000');
        });

        it("Call account and check for 'ReceivedERC777' event in external account", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const externalUniversalReceiver = await ExternalERC777UniversalReceiverTester.new({from: owner});

            // set account2 as new receiver for account1
            await account.setData(UNIVERSALRECEIVER_KEY, externalUniversalReceiver.address, {from: owner});

            // use the checker contract to call account
            let checker = await UniversalReceiverTester.new();
            let receipt = await checker.callImplementationAndReturn(
                account.address,
                ERC777TokensRecipient
            );


            // event signature "event ReceivedERC777(address indexed token, address indexed _operator, address indexed _from, address _to, uint256 _amount)"
            // event should come from account externalUniversalReceiver
            assert.equal(receipt.receipt.rawLogs[0].address, externalUniversalReceiver.address);
            // signature
            assert.equal(receipt.receipt.rawLogs[0].topics[0], '0xdc38539587ea4d67f9f649ad9269646bab26927bad175bdcdfdab5dd297d5e1c');
            // "token" is the checker
            assert.equal(receipt.receipt.rawLogs[0].topics[1], web3.utils.leftPad(checker.address.toLowerCase(), 64));
            // typeId
            // not present, as it would revert if not correct
            // receivedData
            assert.equal(receipt.receipt.rawLogs[0].data, '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');


            // event signature "event UniversalReceiver(address indexed from, bytes32 indexed typeId, bytes32 indexed returnedValue, bytes receivedData)"
            // event should come from account account
            assert.equal(receipt.receipt.rawLogs[1].address, account.address);
            // signature
            assert.equal(receipt.receipt.rawLogs[1].topics[0], '0x54b98940949b5ac0325c889c84db302d4e18faec431b48bdc81706bfe482cfbd');
            // "from" is the checker
            assert.equal(receipt.receipt.rawLogs[1].topics[1], web3.utils.leftPad(checker.address.toLowerCase(), 64));
            // typeId
            assert.equal(receipt.receipt.rawLogs[1].topics[2], ERC777TokensRecipient);
            // receivedData
            assert.equal(receipt.receipt.rawLogs[1].data, '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000');

        });

        it("Mint ERC777 and LSP4 to LSP3 account", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const universalReceiverDelegate = await UniversalReceiverAddressStore.new(account.address, {from: owner});

            let tokenOwner = accounts[2];

            let erc777 = await ERC777UniversalReceiver.new("MyToken", "TKN", [tokenOwner]);
            let digitalCertificate = await DigitalCertificateFungible.new(tokenOwner, "MyDigitalCloth", "DIGICLOTH01", []);

            assert.equal(await erc777.balanceOf(account.address), '0');
            assert.equal(await digitalCertificate.balanceOf(account.address), '0');

            await erc777.mint(account.address, '50', {from: tokenOwner});

            assert.equal(await erc777.balanceOf(account.address), '50');

            await digitalCertificate.mint(account.address, '50', {from: tokenOwner});

            assert.equal(await digitalCertificate.balanceOf(account.address), '50');

        });

        it("Transfer ERC777 and LSP4 to LSP3 account", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const universalReceiverDelegate = await UniversalReceiverAddressStore.new(account.address, {from: owner});

            let tokenOwner = accounts[2];

            let erc777 = await ERC777UniversalReceiver.new("MyToken", "TKN", [tokenOwner]);
            let digitalCertificate = await DigitalCertificateFungible.new(tokenOwner, "MyDigitalCloth", "DIGICLOTH01", []);

            await erc777.mint(tokenOwner, '100', {from: tokenOwner});
            await digitalCertificate.mint(tokenOwner, '100', {from: tokenOwner});

            assert.equal(await erc777.balanceOf(account.address), '0');
            assert.equal(await digitalCertificate.balanceOf(account.address), '0');

            await erc777.send(account.address, '50', "0x", {from: tokenOwner});
            await erc777.transfer(account.address, '50', {from: tokenOwner});
            await digitalCertificate.send(account.address, '50', "0x", {from: tokenOwner});
            await digitalCertificate.transfer(account.address, '50', {from: tokenOwner});

            assert.equal(await erc777.balanceOf(account.address), '100');
            assert.equal(await digitalCertificate.balanceOf(account.address), '100');

        });

        it("Mint ERC777 and LSP4 to LSP3 account and delegate to UniversalReceiverAddressStore", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const universalReceiverDelegate = await UniversalReceiverAddressStore.new(account.address, {from: owner});

            // set account2 as new receiver for account1
            await account.setData(UNIVERSALRECEIVER_KEY, universalReceiverDelegate.address, {from: owner});

            let tokenOwner = accounts[2];

            let erc777 = await ERC777UniversalReceiver.new("MyToken", "TKN", [tokenOwner]);
            let digitalCertificate = await DigitalCertificateFungible.new(tokenOwner, "MyDigitalCloth", "DIGICLOTH01", []);

            assert.equal(await erc777.balanceOf(account.address), '0');
            assert.equal(await digitalCertificate.balanceOf(account.address), '0');

            await erc777.mint(account.address, '50', {from: tokenOwner});

            assert.equal(await erc777.balanceOf(account.address), '50');

            await digitalCertificate.mint(account.address, '50', {from: tokenOwner});

            assert.equal(await digitalCertificate.balanceOf(account.address), '50');

            assert.isTrue(await universalReceiverDelegate.containsAddress(erc777.address));
            assert.isTrue(await universalReceiverDelegate.containsAddress(digitalCertificate.address));

        });

        it("Transfer ERC777 and LSP4 from LSP3 account with delegate to UniversalReceiverAddressStore", async () => {
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const universalReceiverDelegate = await UniversalReceiverAddressStore.new(account.address, {from: owner});

            // set account2 as new receiver for account1
            await account.setData(UNIVERSALRECEIVER_KEY, universalReceiverDelegate.address, {from: owner});

            let tokenOwner = accounts[2];

            let erc777 = await ERC777UniversalReceiver.new("MyToken", "TKN", [tokenOwner]);
            let digitalCertificate = await DigitalCertificateFungible.new(tokenOwner, "MyDigitalCloth", "DIGICLOTH01", []);

            await erc777.mint(tokenOwner, '100', {from: tokenOwner});
            await digitalCertificate.mint(tokenOwner, '100', {from: tokenOwner});

            assert.equal(await erc777.balanceOf(account.address), '0');
            assert.equal(await digitalCertificate.balanceOf(account.address), '0');

            await erc777.send(account.address, '50', "0x", {from: tokenOwner});
            await erc777.transfer(account.address, '50', {from: tokenOwner});
            await digitalCertificate.send(account.address, '50', "0x", {from: tokenOwner});
            await digitalCertificate.transfer(account.address, '50', {from: tokenOwner});

            assert.equal(await erc777.balanceOf(account.address), '100');
            assert.equal(await digitalCertificate.balanceOf(account.address), '100');

            assert.isTrue(await universalReceiverDelegate.containsAddress(erc777.address));
            assert.isTrue(await universalReceiverDelegate.containsAddress(digitalCertificate.address));

        });

        it("Transfer from ERC777 and LSP4 to account and delegate to UniversalReceiverAddressStore", async () => {
            const OPERATION_CALL = 0x0;
            const owner = accounts[2];
            const account = await LSP3Account.new(owner, {from: owner});
            const universalReceiverDelegate = await UniversalReceiverAddressStore.new(account.address, {from: owner});

            // set account2 as new receiver for account1
            await account.setData(UNIVERSALRECEIVER_KEY, universalReceiverDelegate.address, {from: owner});

            let tokenOwner = accounts[2];

            let erc777 = await ERC777UniversalReceiver.new("MyToken", "TKN", [tokenOwner]);
            let digitalCertificate = await DigitalCertificateFungible.new(tokenOwner, "MyDigitalCloth", "DIGICLOTH01", []);

            await erc777.mint(account.address, '100', {from: tokenOwner});
            await digitalCertificate.mint(account.address, '100', {from: tokenOwner});

            assert.equal(await erc777.balanceOf(account.address), '100');
            assert.equal(await digitalCertificate.balanceOf(account.address), '100');

            let abi;
            abi = erc777.contract.methods.send(accounts[4], '50', "0x").encodeABI();
            await account.execute(OPERATION_CALL, erc777.address, 0, abi, {from: owner});
            abi = erc777.contract.methods.transfer(accounts[4], '50').encodeABI();
            await account.execute(OPERATION_CALL, erc777.address, 0, abi, {from: owner});

            abi = digitalCertificate.contract.methods.send(accounts[4], '50', "0x").encodeABI();
            await account.execute(OPERATION_CALL, digitalCertificate.address, 0, abi, {from: owner});
            abi = digitalCertificate.contract.methods.transfer(accounts[4], '50').encodeABI();
            await account.execute(OPERATION_CALL, digitalCertificate.address, 0, abi, {from: owner});

            assert.equal((await erc777.balanceOf(account.address)).toString(), '0');
            assert.equal((await digitalCertificate.balanceOf(account.address)).toString(), '0');

            assert.equal((await erc777.balanceOf(accounts[4])).toString(), '100');
            assert.equal((await digitalCertificate.balanceOf(accounts[4])).toString(), '100');

        });
    }); //Context Universal Receiver

    context("Using key manager as owner", async () => {
        let manager,
            account = {};
        const owner = accounts[6];

        beforeEach(async () => {
            account = await LSP3Account.new(owner, {from: owner});
            manager = await KeyManager.new(account.address, owner, {from: owner});
            await account.transferOwnership(manager.address, {from: owner});
        });

        it("Accounts should have owner as manager", async () => {
            const idOwner = await account.owner.call();
            assert.equal(idOwner, manager.address, "Addresses should match");
        });

        context("ERC1271 from KeyManager", async () => {

            it("Can verify signature from executor of keymanager", async () => {
                const dataToSign = '0xcafecafe';
                const signature = DUMMY_SIGNER.sign(dataToSign);

                // add new owner to keyManager
                await manager.grantRole(EXECUTOR_ROLE, DUMMY_SIGNER.address, {from: owner});

                const result = await account.isValidSignature.call(signature.messageHash, signature.signature);

                assert.equal(result, ERC1271_MAGIC_VALUE, "Should define the signature as valid");
            });

            it("Can verify signature from owner of keymanager", async () => {

                account = await LSP3Account.new(owner, {from: owner});
                manager = await KeyManager.new(account.address, DUMMY_SIGNER.address, {from: owner});
                await account.transferOwnership(manager.address, {from: owner});

                const dataToSign = '0xcafecafe';
                const signature = DUMMY_SIGNER.sign(dataToSign);

                const result = await account.isValidSignature.call(signature.messageHash, signature.signature);

                assert.equal(result, ERC1271_MAGIC_VALUE, "Should define the signature as valid");
            });

            it("Should fail when verifying signature from not-owner", async () => {
                const dataToSign = '0xcafecafe';
                const signature = DUMMY_SIGNER.sign(dataToSign);

                const result = await manager.isValidSignature.call(signature.messageHash, signature.signature);

                assert.equal(result, ERC1271_FAIL_VALUE, "Should define the signature as invalid");
            });
            
        });

        it("Key manager can execute on behalf of Idenity", async () => {
            const dest = accounts[1];
            const amount = ether("10");
            const OPERATION_CALL = 0x0;

            //Fund Accounts contract
            await web3.eth.sendTransaction({
                from: owner,
                to: account.address,
                value: amount
            });

            // Initial Balances
            const destBalance = await web3.eth.getBalance(dest);
            const idBalance = await web3.eth.getBalance(account.address);
            const managerBalance = await web3.eth.getBalance(manager.address);

            let abi = account.contract.methods.execute(OPERATION_CALL, dest, amount.toString(), "0x00").encodeABI();

            await manager.execute(abi, {
                from: owner
            });

            //Final Balances
            const destBalanceFinal = await web3.eth.getBalance(dest);
            const idBalanceFinal = await web3.eth.getBalance(account.address);
            const managerBalanceFinal = await web3.eth.getBalance(manager.address);

            assert.equal(
                managerBalance,
                managerBalanceFinal,
                "manager balance shouldn't have changed"
            );

            assert.isTrue(
                new BN(destBalance).add(amount).eq(new BN(destBalanceFinal)),
                "Destination address should have recived amount"
            );

            assert.isTrue(
                new BN(idBalance).sub(amount).eq(new BN(idBalanceFinal)),
                "Accounts should have spent amount"
            );
        });
    }); //Context key manager
});
