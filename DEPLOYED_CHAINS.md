# Deployed Chains

> See also: [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on how to deploy these contracts on new EVM chains.

This file is the per-contract address registry for Universal Profile base contracts across supported EVM chains.
Deployments use deterministic CREATE2, so each contract version resolves to the same address on every chain where it is deployed.

## Contract versions

### Universal Profile Base contracts

| Contract                          | Version | Address                                      |
| --------------------------------- | ------- | -------------------------------------------- |
| `UniversalProfileInit`            | v0.12.1 | `0x52c90985AF970D4E0DC26Cb5D052505278aF32A9` |
| `UniversalProfileInit`            | v0.14.0 | `0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F` |
| `LSP6KeyManagerInit`              | v0.12.1 | `0xa75684d7D048704a2DB851D05Ba0c3cbe226264C` |
| `LSP6KeyManagerInit`              | v0.14.0 | `0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4` |
| `LSP1UniversalReceiverDelegateUP` | v0.12.1 | `0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8` |
| `LSP1UniversalReceiverDelegateUP` | v0.14.0 | `0x7870C5B8BC9572A8001C3f96f7ff59961B23500D` |
| `ERCTokenCallback`                |         | `TBD`                                        |

### Universal Profile factories

| Contract                                 | Version | Address                                      |
| ---------------------------------------- | ------- | -------------------------------------------- |
| LSP23LinkedContractsFactory              | -       | `0x2300000A84D25dF63081feAa37ba6b62C4c89a30` |
| UniversalProfilePostDeploymentModule     | -       | `0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7` |
| UniversalProfileInitPostDeploymentModule | -       | `0x000000000066093407b6704B89793beFfD0D8F00` |

### LSP7/8 Token Base contracts

| Contract                    | Version | Address                                      |
| --------------------------- | ------- | -------------------------------------------- |
| `LSP7CustomizableTokenInit` | v0.17.3 | `0xCC26FA84f720249ef40a3f685A354b062af363c0` |
| `LSP8CustomizableTokenInit` | v0.17.3 | `0x263dFD9158f51b4B9C39C558561D328660fb67ce` |
| `LSP7MintableInit`          | v0.14.0 | `0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8` |
| `LSP7MintableInit`          | v0.17.3 | `0xf006554F96bf91616dAda3FdB73Ca213874DcFF9` |
| `LSP8MintableInit`          | v0.14.0 | `0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997` |
| `LSP8MintableInit`          | v0.17.3 | `0xE0835D37b9b2Ed3719409B52499Af6411CEF49eB` |

## Networks

| Chain                   | Chain ID  | Native Token     | Explorer                                                             |
| ----------------------- | --------- | ---------------- | -------------------------------------------------------------------- |
| 0G Mainnet              | 16661     | 0G               | [chainscan.0g.ai](https://chainscan.0g.ai)                           |
| ApeChain                | 33139     | APE              | [apescan.io](https://apescan.io)                                     |
| Arbitrum One            | 42161     | ArbitrumOneETH   | [arbiscan.io](https://arbiscan.io)                                   |
| Astar EVM               | 592       | ASTR             | [astar.subscan.io](https://astar.subscan.io)                         |
| Avalanche C-Chain       | 43114     | AVAX             | [snowscan.xyz](https://snowscan.xyz)                                 |
| Base                    | 8453      | BaseETH          | [basescan.org](https://basescan.org)                                 |
| Berachain               | 80094     | BERA             | [berascan.com](https://berascan.com)                                 |
| Blast                   | 81457     | BlastETH         | [blastscan.io](https://blastscan.io)                                 |
| BNB Smart Chain Mainnet | 56        | BNB              | [bscscan.com](https://bscscan.com)                                   |
| Celo Mainnet            | 42220     | CELO             | [celoscan.io](https://celoscan.io)                                   |
| Chiliz Chain Mainnet    | 88888     | CHZ              | [chiliscan.com](https://chiliscan.com)                               |
| Conflux EVM eSpace      | 1030      | CFX              | [evm.confluxscan.net](https://evm.confluxscan.net)                   |
| Core Blockchain Mainnet | 1116      | CORE             | [scan.coredao.org](https://scan.coredao.org)                         |
| COTI                    | 2632500   | COTI             | [mainnet.cotiscan.io](https://mainnet.cotiscan.io)                   |
| Cronos Mainnet          | 25        | CRO              | [explorer.cronos.org](https://explorer.cronos.org)                   |
| Degen Chain             | 666666666 | DEGEN            | [explorer.degen.tips](https://explorer.degen.tips/)                  |
| Ethereum Classic        | 61        | ETC              | [etc.blockscout.com](https://etc.blockscout.com)                     |
| Ethereum Mainnet        | 1         | ETH              | [etherscan.io](https://etherscan.io)                                 |
| Etherlink Mainnet       | 42793     | XTZ              | [explorer.etherlink.com](https://explorer.etherlink.com)             |
| Filecoin - Mainnet      | 314       | FIL              | [filfox.info](https://filfox.info/en)                                |
| Flare Mainnet           | 14        | FLR              | [flare-explorer.flare.network](https://flare-explorer.flare.network) |
| Gnosis                  | 100       | xDAI             | [gnosisscan.io](https://gnosisscan.io)                               |
| Gravity Alpha Mainnet   | 1625      | G                | [explorer.gravity.xyz](https://explorer.gravity.xyz)                 |
| GUNZ                    | 43419     | GUN              | [gunzscan.io](https://gunzscan.io)                                   |
| Haqq Network            | 11235     | ISLM             | [explorer.haqq.network](https://explorer.haqq.network)               |
| HashKey Chain           | 177       | HSK              | [hashkey.blockscout.com](https://hashkey.blockscout.com)             |
| Hemi                    | 43111     | HemiETH          | [explorer.hemi.xyz](https://explorer.hemi.xyz)                       |
| HyperEVM                | 999       | HYPE             | [hyperevmscan.io](https://hyperevmscan.io/)                          |
| Immutable zkEVM         | 13371     | IMX              | [explorer.immutable.com](https://explorer.immutable.com)             |
| Ink                     | 57073     | InkETH           | [explorer.inkonchain.com](https://explorer.inkonchain.com)           |
| IoTeX Network Mainnet   | 4689      | IOTX             | [iotexscan.io](https://iotexscan.io)                                 |
| Katana                  | 747474    | KatanaETH        | [katanascan.com](https://katanascan.com)                             |
| Kava EVM                | 2222      | KAVA             | [kavascan.com](https://kavascan.com)                                 |
| Lens                    | 232       | GHO              | [explorer.lens.xyz](https://explorer.lens.xyz)                       |
| Linea                   | 59144     | LineaETH         | [lineascan.build](https://lineascan.build)                           |
| Mantle                  | 5000      | MNT              | [mantlescan.xyz](https://mantlescan.xyz)                             |
| MegaETH                 | 4326      | MegaETH          | [megaeth.blockscout.com](https://megaeth.blockscout.com/)            |
| MemeCore                | 4352      | M                | [www.okx.com](https://www.okx.com/web3/explorer/memecore)            |
| Mode                    | 34443     | ModeETH          | [explorer.mode.network](https://explorer.mode.network)               |
| Monad                   | 143       | MON              | [monadvision.com](https://monadvision.com)                           |
| Moonbeam                | 1284      | GLMR             | [moonbeam.moonscan.io](https://moonbeam.moonscan.io)                 |
| Moonriver               | 1285      | MOVR             | [moonriver.moonscan.io](https://moonriver.moonscan.io)               |
| OP Mainnet              | 10        | OPMainnetETH     | [optimistic.etherscan.io](https://optimistic.etherscan.io)           |
| peaq                    | 3338      | PEAQ             | [peaq.subscan.io](https://peaq.subscan.io)                           |
| Plasma Mainnet          | 9745      | XPL              | [plasmascan.to](https://plasmascan.to)                               |
| Plume Mainnet           | 98866     | PLUME            | [explorer.plume.org](https://explorer.plume.org)                     |
| Polygon Mainnet         | 137       | POL              | [polygonscan.com](https://polygonscan.com)                           |
| Ronin Mainnet           | 2020      | RON              | [app.roninchain.com](https://app.roninchain.com)                     |
| Rootstock Mainnet       | 30        | RBTC             | [explorer.rootstock.io](https://explorer.rootstock.io)               |
| Scroll                  | 534352    | ScrollETH        | [scrollscan.com](https://scrollscan.com)                             |
| Somnia Mainnet          | 5031      | SOMI             | [mainnet.somnia.w3us.site](https://mainnet.somnia.w3us.site)         |
| Soneium                 | 1868      | SoneiumETH       | [soneium.blockscout.com](https://soneium.blockscout.com)             |
| Sonic Mainnet           | 146       | S                | [sonicscan.org](https://sonicscan.org)                               |
| Sophon                  | 50104     | SOPH             | [explorer.sophon.xyz](https://explorer.sophon.xyz)                   |
| Stable Mainnet          | 988       | USDT0            | [stablescan.xyz](https://stablescan.xyz)                             |
| Story                   | 1514      | IP               | [mainnet.storyscan.xyz](https://mainnet.storyscan.xyz)               |
| Stratis Xertra Mainnet  | 105105    | STRAX            | [explorer.xertra.com](https://explorer.xertra.com)                   |
| Taiko Alethia           | 167000    | TaikoAlethiaETH  | [taikoscan.io](https://taikoscan.io)                                 |
| Telos EVM Mainnet       | 40        | TLOS             | [teloscan.io](https://teloscan.io)                                   |
| Tempo Mainnet           | 4217      | PathUSD (Base)   | [explore.tempo.xyz](https://explore.tempo.xyz)                       |
| Theta Mainnet           | 361       | TFUEL            | [explorer.thetatoken.org](https://explorer.thetatoken.org)           |
| Unichain                | 130       | UnichainETH      | [uniscan.xyz](https://uniscan.xyz)                                   |
| VeChain                 | 100009    | VET              | [vechainstats.com](https://vechainstats.com)                         |
| WEMIX3.0 Mainnet        | 1111      | WEMIX            | [explorer.wemix.com](https://explorer.wemix.com)                     |
| World Chain             | 480       | WorldChainETH    | [worldscan.org](https://worldscan.org)                               |
| X Layer Mainnet         | 196       | OKB              | [www.oklink.com](https://www.oklink.com/xlayer)                      |
| Xai Mainnet             | 660279    | XAI              | [explorer.xai-chain.net](https://explorer.xai-chain.net)             |
| XDC Network             | 50        | XDC              | [xdcscan.com](https://xdcscan.com)                                   |
| ZetaChain Mainnet       | 7000      | ZETA             | [zetascan.com](https://zetascan.com)                                 |
| zkSync Mainnet          | 324       | zkSyncMainnetETH | [explorer.zksync.io](https://explorer.zksync.io)                     |
| Zora                    | 7777777   | ZoraETH          | [explorer.zora.energy](https://explorer.zora.energy)                 |

## Contract Addresses

### UniversalProfileInit

| Chain                   | Chain ID  | v0.12.1                                                                                 | v0.14.0                                                                                                       |
| ----------------------- | --------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 0G Mainnet              | 16661     |                                                                                         |                                                                                                               |
| ApeChain                | 33139     |                                                                                         |                                                                                                               |
| Arbitrum One            | 42161     | [arbiscan.io](https://arbiscan.io/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9)   |                                                                                                               |
| Astar EVM               | 592       |                                                                                         |                                                                                                               |
| Avalanche C-Chain       | 43114     |                                                                                         |                                                                                                               |
| Base                    | 8453      | [basescan.org](https://basescan.org/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) | [basescan.org](https://basescan.org/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F)                       |
| Berachain               | 80094     |                                                                                         |                                                                                                               |
| Blast                   | 81457     |                                                                                         |                                                                                                               |
| BNB Smart Chain Mainnet | 56        |                                                                                         |                                                                                                               |
| Celo Mainnet            | 42220     |                                                                                         |                                                                                                               |
| Chiliz Chain Mainnet    | 88888     |                                                                                         |                                                                                                               |
| Conflux EVM eSpace      | 1030      |                                                                                         |                                                                                                               |
| Core Blockchain Mainnet | 1116      |                                                                                         |                                                                                                               |
| COTI                    | 2632500   |                                                                                         |                                                                                                               |
| Cronos Mainnet          | 25        |                                                                                         |                                                                                                               |
| Degen Chain             | 666666666 |                                                                                         |                                                                                                               |
| Ethereum Classic        | 61        |                                                                                         |                                                                                                               |
| Ethereum Mainnet        | 1         | [etherscan.io](https://etherscan.io/address/0x52c90985AF970D4E0DC26Cb5D052505278aF32A9) | [etherscan.io](https://etherscan.io/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F)                       |
| Etherlink Mainnet       | 42793     |                                                                                         |                                                                                                               |
| Filecoin - Mainnet      | 314       |                                                                                         |                                                                                                               |
| Flare Mainnet           | 14        |                                                                                         |                                                                                                               |
| Gnosis                  | 100       |                                                                                         |                                                                                                               |
| Gravity Alpha Mainnet   | 1625      |                                                                                         |                                                                                                               |
| GUNZ                    | 43419     |                                                                                         |                                                                                                               |
| Haqq Network            | 11235     |                                                                                         |                                                                                                               |
| HashKey Chain           | 177       |                                                                                         |                                                                                                               |
| Hemi                    | 43111     |                                                                                         |                                                                                                               |
| HyperEVM                | 999       |                                                                                         |                                                                                                               |
| Immutable zkEVM         | 13371     |                                                                                         |                                                                                                               |
| Ink                     | 57073     |                                                                                         |                                                                                                               |
| IoTeX Network Mainnet   | 4689      |                                                                                         |                                                                                                               |
| Katana                  | 747474    |                                                                                         |                                                                                                               |
| Kava EVM                | 2222      |                                                                                         |                                                                                                               |
| Lens                    | 232       |                                                                                         |                                                                                                               |
| Linea                   | 59144     |                                                                                         |                                                                                                               |
| Mantle                  | 5000      |                                                                                         |                                                                                                               |
| MegaETH                 | 4326      |                                                                                         |                                                                                                               |
| MemeCore                | 4352      |                                                                                         |                                                                                                               |
| Mode                    | 34443     |                                                                                         |                                                                                                               |
| Monad                   | 143       |                                                                                         |                                                                                                               |
| Moonbeam                | 1284      |                                                                                         |                                                                                                               |
| Moonriver               | 1285      |                                                                                         |                                                                                                               |
| OP Mainnet              | 10        |                                                                                         | [optimistic.etherscan.io](https://optimistic.etherscan.io/address/0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F) |
| peaq                    | 3338      |                                                                                         |                                                                                                               |
| Plasma Mainnet          | 9745      |                                                                                         |                                                                                                               |
| Plume Mainnet           | 98866     |                                                                                         |                                                                                                               |
| Polygon Mainnet         | 137       |                                                                                         |                                                                                                               |
| Ronin Mainnet           | 2020      |                                                                                         |                                                                                                               |
| Rootstock Mainnet       | 30        |                                                                                         |                                                                                                               |
| Scroll                  | 534352    |                                                                                         |                                                                                                               |
| Somnia Mainnet          | 5031      |                                                                                         |                                                                                                               |
| Soneium                 | 1868      |                                                                                         |                                                                                                               |
| Sonic Mainnet           | 146       |                                                                                         |                                                                                                               |
| Sophon                  | 50104     |                                                                                         |                                                                                                               |
| Stable Mainnet          | 988       |                                                                                         |                                                                                                               |
| Story                   | 1514      |                                                                                         |                                                                                                               |
| Stratis Xertra Mainnet  | 105105    |                                                                                         |                                                                                                               |
| Taiko Alethia           | 167000    |                                                                                         |                                                                                                               |
| Telos EVM Mainnet       | 40        |                                                                                         |                                                                                                               |
| Tempo Mainnet           | 4217      |                                                                                         |                                                                                                               |
| Theta Mainnet           | 361       |                                                                                         |                                                                                                               |
| Unichain                | 130       |                                                                                         |                                                                                                               |
| VeChain                 | 100009    |                                                                                         |                                                                                                               |
| WEMIX3.0 Mainnet        | 1111      |                                                                                         |                                                                                                               |
| World Chain             | 480       |                                                                                         |                                                                                                               |
| X Layer Mainnet         | 196       |                                                                                         |                                                                                                               |
| Xai Mainnet             | 660279    |                                                                                         |                                                                                                               |
| XDC Network             | 50        |                                                                                         |                                                                                                               |
| ZetaChain Mainnet       | 7000      |                                                                                         |                                                                                                               |
| zkSync Mainnet          | 324       |                                                                                         |                                                                                                               |
| Zora                    | 7777777   |                                                                                         |                                                                                                               |

### LSP6KeyManagerInit

| Chain                   | Chain ID  | v0.12.1                                                                                 | v0.14.0                                                                                                       |
| ----------------------- | --------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 0G Mainnet              | 16661     |                                                                                         |                                                                                                               |
| ApeChain                | 33139     |                                                                                         |                                                                                                               |
| Arbitrum One            | 42161     | [arbiscan.io](https://arbiscan.io/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C)   |                                                                                                               |
| Astar EVM               | 592       |                                                                                         |                                                                                                               |
| Avalanche C-Chain       | 43114     |                                                                                         |                                                                                                               |
| Base                    | 8453      | [basescan.org](https://basescan.org/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) | [basescan.org](https://basescan.org/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4)                       |
| Berachain               | 80094     |                                                                                         |                                                                                                               |
| Blast                   | 81457     |                                                                                         |                                                                                                               |
| BNB Smart Chain Mainnet | 56        |                                                                                         |                                                                                                               |
| Celo Mainnet            | 42220     |                                                                                         |                                                                                                               |
| Chiliz Chain Mainnet    | 88888     |                                                                                         |                                                                                                               |
| Conflux EVM eSpace      | 1030      |                                                                                         |                                                                                                               |
| Core Blockchain Mainnet | 1116      |                                                                                         |                                                                                                               |
| COTI                    | 2632500   |                                                                                         |                                                                                                               |
| Cronos Mainnet          | 25        |                                                                                         |                                                                                                               |
| Degen Chain             | 666666666 |                                                                                         |                                                                                                               |
| Ethereum Classic        | 61        |                                                                                         |                                                                                                               |
| Ethereum Mainnet        | 1         | [etherscan.io](https://etherscan.io/address/0xa75684d7D048704a2DB851D05Ba0c3cbe226264C) | [etherscan.io](https://etherscan.io/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4)                       |
| Etherlink Mainnet       | 42793     |                                                                                         |                                                                                                               |
| Filecoin - Mainnet      | 314       |                                                                                         |                                                                                                               |
| Flare Mainnet           | 14        |                                                                                         |                                                                                                               |
| Gnosis                  | 100       |                                                                                         |                                                                                                               |
| Gravity Alpha Mainnet   | 1625      |                                                                                         |                                                                                                               |
| GUNZ                    | 43419     |                                                                                         |                                                                                                               |
| Haqq Network            | 11235     |                                                                                         |                                                                                                               |
| HashKey Chain           | 177       |                                                                                         |                                                                                                               |
| Hemi                    | 43111     |                                                                                         |                                                                                                               |
| HyperEVM                | 999       |                                                                                         |                                                                                                               |
| Immutable zkEVM         | 13371     |                                                                                         |                                                                                                               |
| Ink                     | 57073     |                                                                                         |                                                                                                               |
| IoTeX Network Mainnet   | 4689      |                                                                                         |                                                                                                               |
| Katana                  | 747474    |                                                                                         |                                                                                                               |
| Kava EVM                | 2222      |                                                                                         |                                                                                                               |
| Lens                    | 232       |                                                                                         |                                                                                                               |
| Linea                   | 59144     |                                                                                         |                                                                                                               |
| Mantle                  | 5000      |                                                                                         |                                                                                                               |
| MegaETH                 | 4326      |                                                                                         |                                                                                                               |
| MemeCore                | 4352      |                                                                                         |                                                                                                               |
| Mode                    | 34443     |                                                                                         |                                                                                                               |
| Monad                   | 143       |                                                                                         |                                                                                                               |
| Moonbeam                | 1284      |                                                                                         |                                                                                                               |
| Moonriver               | 1285      |                                                                                         |                                                                                                               |
| OP Mainnet              | 10        |                                                                                         | [optimistic.etherscan.io](https://optimistic.etherscan.io/address/0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4) |
| peaq                    | 3338      |                                                                                         |                                                                                                               |
| Plasma Mainnet          | 9745      |                                                                                         |                                                                                                               |
| Plume Mainnet           | 98866     |                                                                                         |                                                                                                               |
| Polygon Mainnet         | 137       |                                                                                         |                                                                                                               |
| Ronin Mainnet           | 2020      |                                                                                         |                                                                                                               |
| Rootstock Mainnet       | 30        |                                                                                         |                                                                                                               |
| Scroll                  | 534352    |                                                                                         |                                                                                                               |
| Somnia Mainnet          | 5031      |                                                                                         |                                                                                                               |
| Soneium                 | 1868      |                                                                                         |                                                                                                               |
| Sonic Mainnet           | 146       |                                                                                         |                                                                                                               |
| Sophon                  | 50104     |                                                                                         |                                                                                                               |
| Stable Mainnet          | 988       |                                                                                         |                                                                                                               |
| Story                   | 1514      |                                                                                         |                                                                                                               |
| Stratis Xertra Mainnet  | 105105    |                                                                                         |                                                                                                               |
| Taiko Alethia           | 167000    |                                                                                         |                                                                                                               |
| Telos EVM Mainnet       | 40        |                                                                                         |                                                                                                               |
| Tempo Mainnet           | 4217      |                                                                                         |                                                                                                               |
| Theta Mainnet           | 361       |                                                                                         |                                                                                                               |
| Unichain                | 130       |                                                                                         |                                                                                                               |
| VeChain                 | 100009    |                                                                                         |                                                                                                               |
| WEMIX3.0 Mainnet        | 1111      |                                                                                         |                                                                                                               |
| World Chain             | 480       |                                                                                         |                                                                                                               |
| X Layer Mainnet         | 196       |                                                                                         |                                                                                                               |
| Xai Mainnet             | 660279    |                                                                                         |                                                                                                               |
| XDC Network             | 50        |                                                                                         |                                                                                                               |
| ZetaChain Mainnet       | 7000      |                                                                                         |                                                                                                               |
| zkSync Mainnet          | 324       |                                                                                         |                                                                                                               |
| Zora                    | 7777777   |                                                                                         |                                                                                                               |

### LSP1UniversalReceiverDelegateUP

| Chain                   | Chain ID  | v0.12.1                                                                                 | v0.14.0                                                                                                       |
| ----------------------- | --------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 0G Mainnet              | 16661     |                                                                                         |                                                                                                               |
| ApeChain                | 33139     |                                                                                         |                                                                                                               |
| Arbitrum One            | 42161     | [arbiscan.io](https://arbiscan.io/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8)   |                                                                                                               |
| Astar EVM               | 592       |                                                                                         |                                                                                                               |
| Avalanche C-Chain       | 43114     |                                                                                         |                                                                                                               |
| Base                    | 8453      | [basescan.org](https://basescan.org/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) | [basescan.org](https://basescan.org/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D)                       |
| Berachain               | 80094     |                                                                                         |                                                                                                               |
| Blast                   | 81457     |                                                                                         |                                                                                                               |
| BNB Smart Chain Mainnet | 56        |                                                                                         |                                                                                                               |
| Celo Mainnet            | 42220     |                                                                                         |                                                                                                               |
| Chiliz Chain Mainnet    | 88888     |                                                                                         |                                                                                                               |
| Conflux EVM eSpace      | 1030      |                                                                                         |                                                                                                               |
| Core Blockchain Mainnet | 1116      |                                                                                         |                                                                                                               |
| COTI                    | 2632500   |                                                                                         |                                                                                                               |
| Cronos Mainnet          | 25        |                                                                                         |                                                                                                               |
| Degen Chain             | 666666666 |                                                                                         |                                                                                                               |
| Ethereum Classic        | 61        |                                                                                         |                                                                                                               |
| Ethereum Mainnet        | 1         | [etherscan.io](https://etherscan.io/address/0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8) | [etherscan.io](https://etherscan.io/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D)                       |
| Etherlink Mainnet       | 42793     |                                                                                         |                                                                                                               |
| Filecoin - Mainnet      | 314       |                                                                                         |                                                                                                               |
| Flare Mainnet           | 14        |                                                                                         |                                                                                                               |
| Gnosis                  | 100       |                                                                                         |                                                                                                               |
| Gravity Alpha Mainnet   | 1625      |                                                                                         |                                                                                                               |
| GUNZ                    | 43419     |                                                                                         |                                                                                                               |
| Haqq Network            | 11235     |                                                                                         |                                                                                                               |
| HashKey Chain           | 177       |                                                                                         |                                                                                                               |
| Hemi                    | 43111     |                                                                                         |                                                                                                               |
| HyperEVM                | 999       |                                                                                         |                                                                                                               |
| Immutable zkEVM         | 13371     |                                                                                         |                                                                                                               |
| Ink                     | 57073     |                                                                                         |                                                                                                               |
| IoTeX Network Mainnet   | 4689      |                                                                                         |                                                                                                               |
| Katana                  | 747474    |                                                                                         |                                                                                                               |
| Kava EVM                | 2222      |                                                                                         |                                                                                                               |
| Lens                    | 232       |                                                                                         |                                                                                                               |
| Linea                   | 59144     |                                                                                         |                                                                                                               |
| Mantle                  | 5000      |                                                                                         |                                                                                                               |
| MegaETH                 | 4326      |                                                                                         |                                                                                                               |
| MemeCore                | 4352      |                                                                                         |                                                                                                               |
| Mode                    | 34443     |                                                                                         |                                                                                                               |
| Monad                   | 143       |                                                                                         |                                                                                                               |
| Moonbeam                | 1284      |                                                                                         |                                                                                                               |
| Moonriver               | 1285      |                                                                                         |                                                                                                               |
| OP Mainnet              | 10        |                                                                                         | [optimistic.etherscan.io](https://optimistic.etherscan.io/address/0x7870C5B8BC9572A8001C3f96f7ff59961B23500D) |
| peaq                    | 3338      |                                                                                         |                                                                                                               |
| Plasma Mainnet          | 9745      |                                                                                         |                                                                                                               |
| Plume Mainnet           | 98866     |                                                                                         |                                                                                                               |
| Polygon Mainnet         | 137       |                                                                                         |                                                                                                               |
| Ronin Mainnet           | 2020      |                                                                                         |                                                                                                               |
| Rootstock Mainnet       | 30        |                                                                                         |                                                                                                               |
| Scroll                  | 534352    |                                                                                         |                                                                                                               |
| Somnia Mainnet          | 5031      |                                                                                         |                                                                                                               |
| Soneium                 | 1868      |                                                                                         |                                                                                                               |
| Sonic Mainnet           | 146       |                                                                                         |                                                                                                               |
| Sophon                  | 50104     |                                                                                         |                                                                                                               |
| Stable Mainnet          | 988       |                                                                                         |                                                                                                               |
| Story                   | 1514      |                                                                                         |                                                                                                               |
| Stratis Xertra Mainnet  | 105105    |                                                                                         |                                                                                                               |
| Taiko Alethia           | 167000    |                                                                                         |                                                                                                               |
| Telos EVM Mainnet       | 40        |                                                                                         |                                                                                                               |
| Tempo Mainnet           | 4217      |                                                                                         |                                                                                                               |
| Theta Mainnet           | 361       |                                                                                         |                                                                                                               |
| Unichain                | 130       |                                                                                         |                                                                                                               |
| VeChain                 | 100009    |                                                                                         |                                                                                                               |
| WEMIX3.0 Mainnet        | 1111      |                                                                                         |                                                                                                               |
| World Chain             | 480       |                                                                                         |                                                                                                               |
| X Layer Mainnet         | 196       |                                                                                         |                                                                                                               |
| Xai Mainnet             | 660279    |                                                                                         |                                                                                                               |
| XDC Network             | 50        |                                                                                         |                                                                                                               |
| ZetaChain Mainnet       | 7000      |                                                                                         |                                                                                                               |
| zkSync Mainnet          | 324       |                                                                                         |                                                                                                               |
| Zora                    | 7777777   |                                                                                         |                                                                                                               |

### ERCTokenCallback

Address: `TBD`

| Chain                   | Chain ID  | Explorer |
| ----------------------- | --------- | -------- |
| 0G Mainnet              | 16661     |          |
| ApeChain                | 33139     |          |
| Arbitrum One            | 42161     |          |
| Astar EVM               | 592       |          |
| Avalanche C-Chain       | 43114     |          |
| Base                    | 8453      |          |
| Berachain               | 80094     |          |
| Blast                   | 81457     |          |
| BNB Smart Chain Mainnet | 56        |          |
| Celo Mainnet            | 42220     |          |
| Chiliz Chain Mainnet    | 88888     |          |
| Conflux EVM eSpace      | 1030      |          |
| Core Blockchain Mainnet | 1116      |          |
| COTI                    | 2632500   |          |
| Cronos Mainnet          | 25        |          |
| Degen Chain             | 666666666 |          |
| Ethereum Classic        | 61        |          |
| Ethereum Mainnet        | 1         |          |
| Etherlink Mainnet       | 42793     |          |
| Filecoin - Mainnet      | 314       |          |
| Flare Mainnet           | 14        |          |
| Gnosis                  | 100       |          |
| Gravity Alpha Mainnet   | 1625      |          |
| GUNZ                    | 43419     |          |
| Haqq Network            | 11235     |          |
| HashKey Chain           | 177       |          |
| Hemi                    | 43111     |          |
| HyperEVM                | 999       |          |
| Immutable zkEVM         | 13371     |          |
| Ink                     | 57073     |          |
| IoTeX Network Mainnet   | 4689      |          |
| Katana                  | 747474    |          |
| Kava EVM                | 2222      |          |
| Lens                    | 232       |          |
| Linea                   | 59144     |          |
| Mantle                  | 5000      |          |
| MegaETH                 | 4326      |          |
| MemeCore                | 4352      |          |
| Mode                    | 34443     |          |
| Monad                   | 143       |          |
| Moonbeam                | 1284      |          |
| Moonriver               | 1285      |          |
| OP Mainnet              | 10        |          |
| peaq                    | 3338      |          |
| Plasma Mainnet          | 9745      |          |
| Plume Mainnet           | 98866     |          |
| Polygon Mainnet         | 137       |          |
| Ronin Mainnet           | 2020      |          |
| Rootstock Mainnet       | 30        |          |
| Scroll                  | 534352    |          |
| Somnia Mainnet          | 5031      |          |
| Soneium                 | 1868      |          |
| Sonic Mainnet           | 146       |          |
| Sophon                  | 50104     |          |
| Stable Mainnet          | 988       |          |
| Story                   | 1514      |          |
| Stratis Xertra Mainnet  | 105105    |          |
| Taiko Alethia           | 167000    |          |
| Telos EVM Mainnet       | 40        |          |
| Tempo Mainnet           | 4217      |          |
| Theta Mainnet           | 361       |          |
| Unichain                | 130       |          |
| VeChain                 | 100009    |          |
| WEMIX3.0 Mainnet        | 1111      |          |
| World Chain             | 480       |          |
| X Layer Mainnet         | 196       |          |
| Xai Mainnet             | 660279    |          |
| XDC Network             | 50        |          |
| ZetaChain Mainnet       | 7000      |          |
| zkSync Mainnet          | 324       |          |
| Zora                    | 7777777   |          |

### LSP7CustomizableTokenInit

| Chain                   | Chain ID  | Explorer                                                                                                                  |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| 0G Mainnet              | 16661     |                                                                                                                           |
| ApeChain                | 33139     |                                                                                                                           |
| Arbitrum One            | 42161     |                                                                                                                           |
| Astar EVM               | 592       |                                                                                                                           |
| Avalanche C-Chain       | 43114     |                                                                                                                           |
| Base                    | 8453      |                                                                                                                           |
| Berachain               | 80094     |                                                                                                                           |
| Blast                   | 81457     |                                                                                                                           |
| BNB Smart Chain Mainnet | 56        |                                                                                                                           |
| Celo Mainnet            | 42220     |                                                                                                                           |
| Chiliz Chain Mainnet    | 88888     |                                                                                                                           |
| Conflux EVM eSpace      | 1030      |                                                                                                                           |
| Core Blockchain Mainnet | 1116      |                                                                                                                           |
| COTI                    | 2632500   |                                                                                                                           |
| Cronos Mainnet          | 25        |                                                                                                                           |
| Degen Chain             | 666666666 |                                                                                                                           |
| Ethereum Classic        | 61        |                                                                                                                           |
| Ethereum Mainnet        | 1         |                                                                                                                           |
| Etherlink Mainnet       | 42793     |                                                                                                                           |
| Filecoin - Mainnet      | 314       |                                                                                                                           |
| Flare Mainnet           | 14        |                                                                                                                           |
| Gnosis                  | 100       |                                                                                                                           |
| Gravity Alpha Mainnet   | 1625      |                                                                                                                           |
| GUNZ                    | 43419     |                                                                                                                           |
| Haqq Network            | 11235     |                                                                                                                           |
| HashKey Chain           | 177       |                                                                                                                           |
| Hemi                    | 43111     |                                                                                                                           |
| HyperEVM                | 999       |                                                                                                                           |
| Immutable zkEVM         | 13371     |                                                                                                                           |
| Ink                     | 57073     |                                                                                                                           |
| IoTeX Network Mainnet   | 4689      |                                                                                                                           |
| Katana                  | 747474    |                                                                                                                           |
| Kava EVM                | 2222      |                                                                                                                           |
| Lens                    | 232       |                                                                                                                           |
| Linea                   | 59144     |                                                                                                                           |
| LUKSO                   | 42        | [view on Blockscout](https://explorer.execution.mainnet.lukso.network/address/0xCC26FA84f720249ef40a3f685A354b062af363c0) |
| Mantle                  | 5000      |                                                                                                                           |
| MegaETH                 | 4326      |                                                                                                                           |
| MemeCore                | 4352      |                                                                                                                           |
| Mode                    | 34443     |                                                                                                                           |
| Monad                   | 143       |                                                                                                                           |
| Moonbeam                | 1284      |                                                                                                                           |
| Moonriver               | 1285      |                                                                                                                           |
| OP Mainnet              | 10        |                                                                                                                           |
| peaq                    | 3338      |                                                                                                                           |
| Plasma Mainnet          | 9745      |                                                                                                                           |
| Plume Mainnet           | 98866     |                                                                                                                           |
| Polygon Mainnet         | 137       |                                                                                                                           |
| Ronin Mainnet           | 2020      |                                                                                                                           |
| Rootstock Mainnet       | 30        |                                                                                                                           |
| Scroll                  | 534352    |                                                                                                                           |
| Somnia Mainnet          | 5031      |                                                                                                                           |
| Soneium                 | 1868      |                                                                                                                           |
| Sonic Mainnet           | 146       |                                                                                                                           |
| Sophon                  | 50104     |                                                                                                                           |
| Stable Mainnet          | 988       |                                                                                                                           |
| Story                   | 1514      |                                                                                                                           |
| Stratis Xertra Mainnet  | 105105    |                                                                                                                           |
| Taiko Alethia           | 167000    |                                                                                                                           |
| Telos EVM Mainnet       | 40        |                                                                                                                           |
| Tempo Mainnet           | 4217      |                                                                                                                           |
| Theta Mainnet           | 361       |                                                                                                                           |
| Unichain                | 130       |                                                                                                                           |
| VeChain                 | 100009    |                                                                                                                           |
| WEMIX3.0 Mainnet        | 1111      |                                                                                                                           |
| World Chain             | 480       |                                                                                                                           |
| X Layer Mainnet         | 196       |                                                                                                                           |
| Xai Mainnet             | 660279    |                                                                                                                           |
| XDC Network             | 50        |                                                                                                                           |
| ZetaChain Mainnet       | 7000      |                                                                                                                           |
| zkSync Mainnet          | 324       |                                                                                                                           |
| Zora                    | 7777777   |                                                                                                                           |

### LSP8CustomizableTokenInit

| Chain                   | Chain ID  | Explorer                                                                                                                  |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| 0G Mainnet              | 16661     |                                                                                                                           |
| ApeChain                | 33139     |                                                                                                                           |
| Arbitrum One            | 42161     |                                                                                                                           |
| Astar EVM               | 592       |                                                                                                                           |
| Avalanche C-Chain       | 43114     |                                                                                                                           |
| Base                    | 8453      |                                                                                                                           |
| Berachain               | 80094     |                                                                                                                           |
| Blast                   | 81457     |                                                                                                                           |
| BNB Smart Chain Mainnet | 56        |                                                                                                                           |
| Celo Mainnet            | 42220     |                                                                                                                           |
| Chiliz Chain Mainnet    | 88888     |                                                                                                                           |
| Conflux EVM eSpace      | 1030      |                                                                                                                           |
| Core Blockchain Mainnet | 1116      |                                                                                                                           |
| COTI                    | 2632500   |                                                                                                                           |
| Cronos Mainnet          | 25        |                                                                                                                           |
| Degen Chain             | 666666666 |                                                                                                                           |
| Ethereum Classic        | 61        |                                                                                                                           |
| Ethereum Mainnet        | 1         |                                                                                                                           |
| Etherlink Mainnet       | 42793     |                                                                                                                           |
| Filecoin - Mainnet      | 314       |                                                                                                                           |
| Flare Mainnet           | 14        |                                                                                                                           |
| Gnosis                  | 100       |                                                                                                                           |
| Gravity Alpha Mainnet   | 1625      |                                                                                                                           |
| GUNZ                    | 43419     |                                                                                                                           |
| Haqq Network            | 11235     |                                                                                                                           |
| HashKey Chain           | 177       |                                                                                                                           |
| Hemi                    | 43111     |                                                                                                                           |
| HyperEVM                | 999       |                                                                                                                           |
| Immutable zkEVM         | 13371     |                                                                                                                           |
| Ink                     | 57073     |                                                                                                                           |
| IoTeX Network Mainnet   | 4689      |                                                                                                                           |
| Katana                  | 747474    |                                                                                                                           |
| Kava EVM                | 2222      |                                                                                                                           |
| Lens                    | 232       |                                                                                                                           |
| Linea                   | 59144     |                                                                                                                           |
| LUKSO                   | 42        | [view on Blockscout](https://explorer.execution.mainnet.lukso.network/address/0x263dFD9158f51b4B9C39C558561D328660fb67ce) |
| Mantle                  | 5000      |                                                                                                                           |
| MegaETH                 | 4326      |                                                                                                                           |
| MemeCore                | 4352      |                                                                                                                           |
| Mode                    | 34443     |                                                                                                                           |
| Monad                   | 143       |                                                                                                                           |
| Moonbeam                | 1284      |                                                                                                                           |
| Moonriver               | 1285      |                                                                                                                           |
| OP Mainnet              | 10        |                                                                                                                           |
| peaq                    | 3338      |                                                                                                                           |
| Plasma Mainnet          | 9745      |                                                                                                                           |
| Plume Mainnet           | 98866     |                                                                                                                           |
| Polygon Mainnet         | 137       |                                                                                                                           |
| Ronin Mainnet           | 2020      |                                                                                                                           |
| Rootstock Mainnet       | 30        |                                                                                                                           |
| Scroll                  | 534352    |                                                                                                                           |
| Somnia Mainnet          | 5031      |                                                                                                                           |
| Soneium                 | 1868      |                                                                                                                           |
| Sonic Mainnet           | 146       |                                                                                                                           |
| Sophon                  | 50104     |                                                                                                                           |
| Stable Mainnet          | 988       |                                                                                                                           |
| Story                   | 1514      |                                                                                                                           |
| Stratis Xertra Mainnet  | 105105    |                                                                                                                           |
| Taiko Alethia           | 167000    |                                                                                                                           |
| Telos EVM Mainnet       | 40        |                                                                                                                           |
| Tempo Mainnet           | 4217      |                                                                                                                           |
| Theta Mainnet           | 361       |                                                                                                                           |
| Unichain                | 130       |                                                                                                                           |
| VeChain                 | 100009    |                                                                                                                           |
| WEMIX3.0 Mainnet        | 1111      |                                                                                                                           |
| World Chain             | 480       |                                                                                                                           |
| X Layer Mainnet         | 196       |                                                                                                                           |
| Xai Mainnet             | 660279    |                                                                                                                           |
| XDC Network             | 50        |                                                                                                                           |
| ZetaChain Mainnet       | 7000      |                                                                                                                           |
| zkSync Mainnet          | 324       |                                                                                                                           |
| Zora                    | 7777777   |                                                                                                                           |

### LSP7MintableInit

| Chain                   | Chain ID  | v0.14.0                                                                                                                   | v0.17.3                                                                                                                   |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 0G Mainnet              | 16661     |                                                                                                                           |                                                                                                                           |
| ApeChain                | 33139     |                                                                                                                           |                                                                                                                           |
| Arbitrum One            | 42161     |                                                                                                                           |                                                                                                                           |
| Astar EVM               | 592       |                                                                                                                           |                                                                                                                           |
| Avalanche C-Chain       | 43114     |                                                                                                                           |                                                                                                                           |
| Base                    | 8453      |                                                                                                                           |                                                                                                                           |
| Berachain               | 80094     |                                                                                                                           |                                                                                                                           |
| Blast                   | 81457     |                                                                                                                           |                                                                                                                           |
| BNB Smart Chain Mainnet | 56        |                                                                                                                           |                                                                                                                           |
| Celo Mainnet            | 42220     |                                                                                                                           |                                                                                                                           |
| Chiliz Chain Mainnet    | 88888     |                                                                                                                           |                                                                                                                           |
| Conflux EVM eSpace      | 1030      |                                                                                                                           |                                                                                                                           |
| Core Blockchain Mainnet | 1116      |                                                                                                                           |                                                                                                                           |
| COTI                    | 2632500   |                                                                                                                           |                                                                                                                           |
| Cronos Mainnet          | 25        |                                                                                                                           |                                                                                                                           |
| Degen Chain             | 666666666 |                                                                                                                           |                                                                                                                           |
| Ethereum Classic        | 61        |                                                                                                                           |                                                                                                                           |
| Ethereum Mainnet        | 1         |                                                                                                                           |                                                                                                                           |
| Etherlink Mainnet       | 42793     |                                                                                                                           |                                                                                                                           |
| Filecoin - Mainnet      | 314       |                                                                                                                           |                                                                                                                           |
| Flare Mainnet           | 14        |                                                                                                                           |                                                                                                                           |
| Gnosis                  | 100       |                                                                                                                           |                                                                                                                           |
| Gravity Alpha Mainnet   | 1625      |                                                                                                                           |                                                                                                                           |
| GUNZ                    | 43419     |                                                                                                                           |                                                                                                                           |
| Haqq Network            | 11235     |                                                                                                                           |                                                                                                                           |
| HashKey Chain           | 177       |                                                                                                                           |                                                                                                                           |
| Hemi                    | 43111     |                                                                                                                           |                                                                                                                           |
| HyperEVM                | 999       |                                                                                                                           |                                                                                                                           |
| Immutable zkEVM         | 13371     |                                                                                                                           |                                                                                                                           |
| Ink                     | 57073     |                                                                                                                           |                                                                                                                           |
| IoTeX Network Mainnet   | 4689      |                                                                                                                           |                                                                                                                           |
| Katana                  | 747474    |                                                                                                                           |                                                                                                                           |
| Kava EVM                | 2222      |                                                                                                                           |                                                                                                                           |
| Lens                    | 232       |                                                                                                                           |                                                                                                                           |
| Linea                   | 59144     |                                                                                                                           |                                                                                                                           |
| LUKSO                   | 42        | [view on Blockscout](https://explorer.execution.mainnet.lukso.network/address/0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8) | [view on Blockscout](https://explorer.execution.mainnet.lukso.network/address/0xf006554F96bf91616dAda3FdB73Ca213874DcFF9) |
| Mantle                  | 5000      | [mantlescan.xyz](https://mantlescan.xyz/address/0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8)                               | [mantlescan.xyz](https://mantlescan.xyz/address/0xf006554F96bf91616dAda3FdB73Ca213874DcFF9)                               |
| MegaETH                 | 4326      |                                                                                                                           |                                                                                                                           |
| MemeCore                | 4352      |                                                                                                                           |                                                                                                                           |
| Mode                    | 34443     |                                                                                                                           |                                                                                                                           |
| Monad                   | 143       |                                                                                                                           |                                                                                                                           |
| Moonbeam                | 1284      |                                                                                                                           |                                                                                                                           |
| Moonriver               | 1285      |                                                                                                                           |                                                                                                                           |
| OP Mainnet              | 10        |                                                                                                                           |                                                                                                                           |
| peaq                    | 3338      |                                                                                                                           |                                                                                                                           |
| Plasma Mainnet          | 9745      |                                                                                                                           |                                                                                                                           |
| Plume Mainnet           | 98866     |                                                                                                                           |                                                                                                                           |
| Polygon Mainnet         | 137       |                                                                                                                           |                                                                                                                           |
| Ronin Mainnet           | 2020      |                                                                                                                           |                                                                                                                           |
| Rootstock Mainnet       | 30        |                                                                                                                           |                                                                                                                           |
| Scroll                  | 534352    |                                                                                                                           |                                                                                                                           |
| Somnia Mainnet          | 5031      |                                                                                                                           |                                                                                                                           |
| Soneium                 | 1868      |                                                                                                                           |                                                                                                                           |
| Sonic Mainnet           | 146       |                                                                                                                           |                                                                                                                           |
| Sophon                  | 50104     |                                                                                                                           |                                                                                                                           |
| Stable Mainnet          | 988       |                                                                                                                           |                                                                                                                           |
| Story                   | 1514      |                                                                                                                           |                                                                                                                           |
| Stratis Xertra Mainnet  | 105105    |                                                                                                                           |                                                                                                                           |
| Taiko Alethia           | 167000    |                                                                                                                           |                                                                                                                           |
| Telos EVM Mainnet       | 40        |                                                                                                                           |                                                                                                                           |
| Tempo Mainnet           | 4217      |                                                                                                                           |                                                                                                                           |
| Theta Mainnet           | 361       |                                                                                                                           |                                                                                                                           |
| Unichain                | 130       |                                                                                                                           |                                                                                                                           |
| VeChain                 | 100009    |                                                                                                                           |                                                                                                                           |
| WEMIX3.0 Mainnet        | 1111      |                                                                                                                           |                                                                                                                           |
| World Chain             | 480       |                                                                                                                           |                                                                                                                           |
| X Layer Mainnet         | 196       |                                                                                                                           |                                                                                                                           |
| Xai Mainnet             | 660279    |                                                                                                                           |                                                                                                                           |
| XDC Network             | 50        |                                                                                                                           |                                                                                                                           |
| ZetaChain Mainnet       | 7000      |                                                                                                                           |                                                                                                                           |
| zkSync Mainnet          | 324       |                                                                                                                           |                                                                                                                           |
| Zora                    | 7777777   |                                                                                                                           |                                                                                                                           |

### LSP8MintableInit

| Chain                   | Chain ID  | v0.14.0                                                                                                                   | v0.17.3                                                                                                                   |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 0G Mainnet              | 16661     |                                                                                                                           |                                                                                                                           |
| ApeChain                | 33139     |                                                                                                                           |                                                                                                                           |
| Arbitrum One            | 42161     |                                                                                                                           |                                                                                                                           |
| Astar EVM               | 592       |                                                                                                                           |                                                                                                                           |
| Avalanche C-Chain       | 43114     |                                                                                                                           |                                                                                                                           |
| Base                    | 8453      |                                                                                                                           |                                                                                                                           |
| Berachain               | 80094     |                                                                                                                           |                                                                                                                           |
| Blast                   | 81457     |                                                                                                                           |                                                                                                                           |
| BNB Smart Chain Mainnet | 56        |                                                                                                                           |                                                                                                                           |
| Celo Mainnet            | 42220     |                                                                                                                           |                                                                                                                           |
| Chiliz Chain Mainnet    | 88888     |                                                                                                                           |                                                                                                                           |
| Conflux EVM eSpace      | 1030      |                                                                                                                           |                                                                                                                           |
| Core Blockchain Mainnet | 1116      |                                                                                                                           |                                                                                                                           |
| COTI                    | 2632500   |                                                                                                                           |                                                                                                                           |
| Cronos Mainnet          | 25        |                                                                                                                           |                                                                                                                           |
| Degen Chain             | 666666666 |                                                                                                                           |                                                                                                                           |
| Ethereum Classic        | 61        |                                                                                                                           |                                                                                                                           |
| Ethereum Mainnet        | 1         |                                                                                                                           |                                                                                                                           |
| Etherlink Mainnet       | 42793     |                                                                                                                           |                                                                                                                           |
| Filecoin - Mainnet      | 314       |                                                                                                                           |                                                                                                                           |
| Flare Mainnet           | 14        |                                                                                                                           |                                                                                                                           |
| Gnosis                  | 100       |                                                                                                                           |                                                                                                                           |
| Gravity Alpha Mainnet   | 1625      |                                                                                                                           |                                                                                                                           |
| GUNZ                    | 43419     |                                                                                                                           |                                                                                                                           |
| Haqq Network            | 11235     |                                                                                                                           |                                                                                                                           |
| HashKey Chain           | 177       |                                                                                                                           |                                                                                                                           |
| Hemi                    | 43111     |                                                                                                                           |                                                                                                                           |
| HyperEVM                | 999       |                                                                                                                           |                                                                                                                           |
| Immutable zkEVM         | 13371     |                                                                                                                           |                                                                                                                           |
| Ink                     | 57073     |                                                                                                                           |                                                                                                                           |
| IoTeX Network Mainnet   | 4689      |                                                                                                                           |                                                                                                                           |
| Katana                  | 747474    |                                                                                                                           |                                                                                                                           |
| Kava EVM                | 2222      |                                                                                                                           |                                                                                                                           |
| Lens                    | 232       |                                                                                                                           |                                                                                                                           |
| Linea                   | 59144     |                                                                                                                           |                                                                                                                           |
| LUKSO                   | 42        | [view on Blockscout](https://explorer.execution.mainnet.lukso.network/address/0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997) | [view on Blockscout](https://explorer.execution.mainnet.lukso.network/address/0xE0835D37b9b2Ed3719409B52499Af6411CEF49eB) |
| Mantle                  | 5000      | [mantlescan.xyz](https://mantlescan.xyz/address/0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997)                               | [mantlescan.xyz](https://mantlescan.xyz/address/0xE0835D37b9b2Ed3719409B52499Af6411CEF49eB)                               |
| MegaETH                 | 4326      |                                                                                                                           |                                                                                                                           |
| MemeCore                | 4352      |                                                                                                                           |                                                                                                                           |
| Mode                    | 34443     |                                                                                                                           |                                                                                                                           |
| Monad                   | 143       |                                                                                                                           |                                                                                                                           |
| Moonbeam                | 1284      |                                                                                                                           |                                                                                                                           |
| Moonriver               | 1285      |                                                                                                                           |                                                                                                                           |
| OP Mainnet              | 10        |                                                                                                                           |                                                                                                                           |
| peaq                    | 3338      |                                                                                                                           |                                                                                                                           |
| Plasma Mainnet          | 9745      |                                                                                                                           |                                                                                                                           |
| Plume Mainnet           | 98866     |                                                                                                                           |                                                                                                                           |
| Polygon Mainnet         | 137       |                                                                                                                           |                                                                                                                           |
| Ronin Mainnet           | 2020      |                                                                                                                           |                                                                                                                           |
| Rootstock Mainnet       | 30        |                                                                                                                           |                                                                                                                           |
| Scroll                  | 534352    |                                                                                                                           |                                                                                                                           |
| Somnia Mainnet          | 5031      |                                                                                                                           |                                                                                                                           |
| Soneium                 | 1868      |                                                                                                                           |                                                                                                                           |
| Sonic Mainnet           | 146       |                                                                                                                           |                                                                                                                           |
| Sophon                  | 50104     |                                                                                                                           |                                                                                                                           |
| Stable Mainnet          | 988       |                                                                                                                           |                                                                                                                           |
| Story                   | 1514      |                                                                                                                           |                                                                                                                           |
| Stratis Xertra Mainnet  | 105105    |                                                                                                                           |                                                                                                                           |
| Taiko Alethia           | 167000    |                                                                                                                           |                                                                                                                           |
| Telos EVM Mainnet       | 40        |                                                                                                                           |                                                                                                                           |
| Tempo Mainnet           | 4217      |                                                                                                                           |                                                                                                                           |
| Theta Mainnet           | 361       |                                                                                                                           |                                                                                                                           |
| Unichain                | 130       |                                                                                                                           |                                                                                                                           |
| VeChain                 | 100009    |                                                                                                                           |                                                                                                                           |
| WEMIX3.0 Mainnet        | 1111      |                                                                                                                           |                                                                                                                           |
| World Chain             | 480       |                                                                                                                           |                                                                                                                           |
| X Layer Mainnet         | 196       |                                                                                                                           |                                                                                                                           |
| Xai Mainnet             | 660279    |                                                                                                                           |                                                                                                                           |
| XDC Network             | 50        |                                                                                                                           |                                                                                                                           |
| ZetaChain Mainnet       | 7000      |                                                                                                                           |                                                                                                                           |
| zkSync Mainnet          | 324       |                                                                                                                           |                                                                                                                           |
| Zora                    | 7777777   |                                                                                                                           |                                                                                                                           |

### LSP23LinkedContractsFactory

Address:

| Chain                   | Chain ID  | Explorer                                                                                                      |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| 0G Mainnet              | 16661     |                                                                                                               |
| ApeChain                | 33139     |                                                                                                               |
| Arbitrum One            | 42161     | [arbiscan.io](https://arbiscan.io/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30)                         |
| Astar EVM               | 592       |                                                                                                               |
| Avalanche C-Chain       | 43114     |                                                                                                               |
| Base                    | 8453      | [basescan.org](https://basescan.org/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30)                       |
| Berachain               | 80094     |                                                                                                               |
| Blast                   | 81457     |                                                                                                               |
| BNB Smart Chain Mainnet | 56        |                                                                                                               |
| Celo Mainnet            | 42220     |                                                                                                               |
| Chiliz Chain Mainnet    | 88888     |                                                                                                               |
| Conflux EVM eSpace      | 1030      |                                                                                                               |
| Core Blockchain Mainnet | 1116      |                                                                                                               |
| COTI                    | 2632500   |                                                                                                               |
| Cronos Mainnet          | 25        |                                                                                                               |
| Degen Chain             | 666666666 |                                                                                                               |
| Ethereum Classic        | 61        |                                                                                                               |
| Ethereum Mainnet        | 1         | [etherscan.io](https://etherscan.io/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30)                       |
| Etherlink Mainnet       | 42793     |                                                                                                               |
| Filecoin - Mainnet      | 314       |                                                                                                               |
| Flare Mainnet           | 14        |                                                                                                               |
| Gnosis                  | 100       |                                                                                                               |
| Gravity Alpha Mainnet   | 1625      |                                                                                                               |
| GUNZ                    | 43419     |                                                                                                               |
| Haqq Network            | 11235     |                                                                                                               |
| HashKey Chain           | 177       |                                                                                                               |
| Hemi                    | 43111     |                                                                                                               |
| HyperEVM                | 999       |                                                                                                               |
| Immutable zkEVM         | 13371     |                                                                                                               |
| Ink                     | 57073     |                                                                                                               |
| IoTeX Network Mainnet   | 4689      |                                                                                                               |
| Katana                  | 747474    |                                                                                                               |
| Kava EVM                | 2222      |                                                                                                               |
| Lens                    | 232       |                                                                                                               |
| Linea                   | 59144     |                                                                                                               |
| Mantle                  | 5000      |                                                                                                               |
| MegaETH                 | 4326      |                                                                                                               |
| MemeCore                | 4352      |                                                                                                               |
| Mode                    | 34443     |                                                                                                               |
| Monad                   | 143       |                                                                                                               |
| Moonbeam                | 1284      |                                                                                                               |
| Moonriver               | 1285      |                                                                                                               |
| OP Mainnet              | 10        | [optimistic.etherscan.io](https://optimistic.etherscan.io/address/0x2300000A84D25dF63081feAa37ba6b62C4c89a30) |
| peaq                    | 3338      |                                                                                                               |
| Plasma Mainnet          | 9745      |                                                                                                               |
| Plume Mainnet           | 98866     |                                                                                                               |
| Polygon Mainnet         | 137       |                                                                                                               |
| Ronin Mainnet           | 2020      |                                                                                                               |
| Rootstock Mainnet       | 30        |                                                                                                               |
| Scroll                  | 534352    |                                                                                                               |
| Somnia Mainnet          | 5031      |                                                                                                               |
| Soneium                 | 1868      |                                                                                                               |
| Sonic Mainnet           | 146       |                                                                                                               |
| Sophon                  | 50104     |                                                                                                               |
| Stable Mainnet          | 988       |                                                                                                               |
| Story                   | 1514      |                                                                                                               |
| Stratis Xertra Mainnet  | 105105    |                                                                                                               |
| Taiko Alethia           | 167000    |                                                                                                               |
| Telos EVM Mainnet       | 40        |                                                                                                               |
| Tempo Mainnet           | 4217      |                                                                                                               |
| Theta Mainnet           | 361       |                                                                                                               |
| Unichain                | 130       |                                                                                                               |
| VeChain                 | 100009    |                                                                                                               |
| WEMIX3.0 Mainnet        | 1111      |                                                                                                               |
| World Chain             | 480       |                                                                                                               |
| X Layer Mainnet         | 196       |                                                                                                               |
| Xai Mainnet             | 660279    |                                                                                                               |
| XDC Network             | 50        |                                                                                                               |
| ZetaChain Mainnet       | 7000      |                                                                                                               |
| zkSync Mainnet          | 324       |                                                                                                               |
| Zora                    | 7777777   |                                                                                                               |

### UniversalProfilePostDeploymentModule

Address:

| Chain                   | Chain ID  | Explorer                                                                                                      |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| 0G Mainnet              | 16661     |                                                                                                               |
| ApeChain                | 33139     |                                                                                                               |
| Arbitrum One            | 42161     |                                                                                                               |
| Astar EVM               | 592       |                                                                                                               |
| Avalanche C-Chain       | 43114     |                                                                                                               |
| Base                    | 8453      |                                                                                                               |
| Berachain               | 80094     |                                                                                                               |
| Blast                   | 81457     |                                                                                                               |
| BNB Smart Chain Mainnet | 56        |                                                                                                               |
| Celo Mainnet            | 42220     |                                                                                                               |
| Chiliz Chain Mainnet    | 88888     |                                                                                                               |
| Conflux EVM eSpace      | 1030      |                                                                                                               |
| Core Blockchain Mainnet | 1116      |                                                                                                               |
| COTI                    | 2632500   |                                                                                                               |
| Cronos Mainnet          | 25        |                                                                                                               |
| Degen Chain             | 666666666 |                                                                                                               |
| Ethereum Classic        | 61        |                                                                                                               |
| Ethereum Mainnet        | 1         |                                                                                                               |
| Etherlink Mainnet       | 42793     |                                                                                                               |
| Filecoin - Mainnet      | 314       |                                                                                                               |
| Flare Mainnet           | 14        |                                                                                                               |
| Gnosis                  | 100       |                                                                                                               |
| Gravity Alpha Mainnet   | 1625      |                                                                                                               |
| GUNZ                    | 43419     |                                                                                                               |
| Haqq Network            | 11235     |                                                                                                               |
| HashKey Chain           | 177       |                                                                                                               |
| Hemi                    | 43111     |                                                                                                               |
| HyperEVM                | 999       |                                                                                                               |
| Immutable zkEVM         | 13371     |                                                                                                               |
| Ink                     | 57073     |                                                                                                               |
| IoTeX Network Mainnet   | 4689      |                                                                                                               |
| Katana                  | 747474    |                                                                                                               |
| Kava EVM                | 2222      |                                                                                                               |
| Lens                    | 232       |                                                                                                               |
| Linea                   | 59144     |                                                                                                               |
| Mantle                  | 5000      |                                                                                                               |
| MegaETH                 | 4326      |                                                                                                               |
| MemeCore                | 4352      |                                                                                                               |
| Mode                    | 34443     |                                                                                                               |
| Monad                   | 143       |                                                                                                               |
| Moonbeam                | 1284      |                                                                                                               |
| Moonriver               | 1285      |                                                                                                               |
| OP Mainnet              | 10        | [optimistic.etherscan.io](https://optimistic.etherscan.io/address/0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7) |
| peaq                    | 3338      |                                                                                                               |
| Plasma Mainnet          | 9745      |                                                                                                               |
| Plume Mainnet           | 98866     |                                                                                                               |
| Polygon Mainnet         | 137       |                                                                                                               |
| Ronin Mainnet           | 2020      |                                                                                                               |
| Rootstock Mainnet       | 30        |                                                                                                               |
| Scroll                  | 534352    |                                                                                                               |
| Somnia Mainnet          | 5031      |                                                                                                               |
| Soneium                 | 1868      |                                                                                                               |
| Sonic Mainnet           | 146       |                                                                                                               |
| Sophon                  | 50104     |                                                                                                               |
| Stable Mainnet          | 988       |                                                                                                               |
| Story                   | 1514      |                                                                                                               |
| Stratis Xertra Mainnet  | 105105    |                                                                                                               |
| Taiko Alethia           | 167000    |                                                                                                               |
| Telos EVM Mainnet       | 40        |                                                                                                               |
| Tempo Mainnet           | 4217      |                                                                                                               |
| Theta Mainnet           | 361       |                                                                                                               |
| Unichain                | 130       |                                                                                                               |
| VeChain                 | 100009    |                                                                                                               |
| WEMIX3.0 Mainnet        | 1111      |                                                                                                               |
| World Chain             | 480       |                                                                                                               |
| X Layer Mainnet         | 196       |                                                                                                               |
| Xai Mainnet             | 660279    |                                                                                                               |
| XDC Network             | 50        |                                                                                                               |
| ZetaChain Mainnet       | 7000      |                                                                                                               |
| zkSync Mainnet          | 324       |                                                                                                               |
| Zora                    | 7777777   |                                                                                                               |

### UniversalProfileInitPostDeploymentModule

Address:

| Chain                   | Chain ID  | Explorer                                                                                                      |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| 0G Mainnet              | 16661     |                                                                                                               |
| ApeChain                | 33139     |                                                                                                               |
| Arbitrum One            | 42161     | [arbiscan.io](https://arbiscan.io/address/0x000000000066093407b6704B89793beFfD0D8F00)                         |
| Astar EVM               | 592       |                                                                                                               |
| Avalanche C-Chain       | 43114     |                                                                                                               |
| Base                    | 8453      | [basescan.org](https://basescan.org/address/0x000000000066093407b6704B89793beFfD0D8F00)                       |
| Berachain               | 80094     |                                                                                                               |
| Blast                   | 81457     |                                                                                                               |
| BNB Smart Chain Mainnet | 56        |                                                                                                               |
| Celo Mainnet            | 42220     |                                                                                                               |
| Chiliz Chain Mainnet    | 88888     |                                                                                                               |
| Conflux EVM eSpace      | 1030      |                                                                                                               |
| Core Blockchain Mainnet | 1116      |                                                                                                               |
| COTI                    | 2632500   |                                                                                                               |
| Cronos Mainnet          | 25        |                                                                                                               |
| Degen Chain             | 666666666 |                                                                                                               |
| Ethereum Classic        | 61        |                                                                                                               |
| Ethereum Mainnet        | 1         | [etherscan.io](https://etherscan.io/address/0x000000000066093407b6704B89793beFfD0D8F00)                       |
| Etherlink Mainnet       | 42793     |                                                                                                               |
| Filecoin - Mainnet      | 314       |                                                                                                               |
| Flare Mainnet           | 14        |                                                                                                               |
| Gnosis                  | 100       |                                                                                                               |
| Gravity Alpha Mainnet   | 1625      |                                                                                                               |
| GUNZ                    | 43419     |                                                                                                               |
| Haqq Network            | 11235     |                                                                                                               |
| HashKey Chain           | 177       |                                                                                                               |
| Hemi                    | 43111     |                                                                                                               |
| HyperEVM                | 999       |                                                                                                               |
| Immutable zkEVM         | 13371     |                                                                                                               |
| Ink                     | 57073     |                                                                                                               |
| IoTeX Network Mainnet   | 4689      |                                                                                                               |
| Katana                  | 747474    |                                                                                                               |
| Kava EVM                | 2222      |                                                                                                               |
| Lens                    | 232       |                                                                                                               |
| Linea                   | 59144     |                                                                                                               |
| Mantle                  | 5000      |                                                                                                               |
| MegaETH                 | 4326      |                                                                                                               |
| MemeCore                | 4352      |                                                                                                               |
| Mode                    | 34443     |                                                                                                               |
| Monad                   | 143       |                                                                                                               |
| Moonbeam                | 1284      |                                                                                                               |
| Moonriver               | 1285      |                                                                                                               |
| OP Mainnet              | 10        | [optimistic.etherscan.io](https://optimistic.etherscan.io/address/0x000000000066093407b6704B89793beFfD0D8F00) |
| peaq                    | 3338      |                                                                                                               |
| Plasma Mainnet          | 9745      |                                                                                                               |
| Plume Mainnet           | 98866     |                                                                                                               |
| Polygon Mainnet         | 137       |                                                                                                               |
| Ronin Mainnet           | 2020      |                                                                                                               |
| Rootstock Mainnet       | 30        |                                                                                                               |
| Scroll                  | 534352    |                                                                                                               |
| Somnia Mainnet          | 5031      |                                                                                                               |
| Soneium                 | 1868      |                                                                                                               |
| Sonic Mainnet           | 146       |                                                                                                               |
| Sophon                  | 50104     |                                                                                                               |
| Stable Mainnet          | 988       |                                                                                                               |
| Story                   | 1514      |                                                                                                               |
| Stratis Xertra Mainnet  | 105105    |                                                                                                               |
| Taiko Alethia           | 167000    |                                                                                                               |
| Telos EVM Mainnet       | 40        |                                                                                                               |
| Tempo Mainnet           | 4217      |                                                                                                               |
| Theta Mainnet           | 361       |                                                                                                               |
| Unichain                | 130       |                                                                                                               |
| VeChain                 | 100009    |                                                                                                               |
| WEMIX3.0 Mainnet        | 1111      |                                                                                                               |
| World Chain             | 480       |                                                                                                               |
| X Layer Mainnet         | 196       |                                                                                                               |
| Xai Mainnet             | 660279    |                                                                                                               |
| XDC Network             | 50        |                                                                                                               |
| ZetaChain Mainnet       | 7000      |                                                                                                               |
| zkSync Mainnet          | 324       |                                                                                                               |
| Zora                    | 7777777   |                                                                                                               |
