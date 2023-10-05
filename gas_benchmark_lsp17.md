
👋 Hello
⛽ I am the Gas Bot Reporter. I keep track of the gas costs of common interactions using Universal Profiles 🆙 !
📊 Here is a summary of the gas cost with the code introduced by this PR.

## ⛽📊 Gas Benchmark Report

### Deployment Costs

| Deployed contracts | ⛽ Deployment cost     |
| :----------------- | --------------------- |
| UniversalProfile   | 3119884 (112,679 📈❌) |
| KeyManager         | 3491003 (0 )          |
| LSP1DelegateUP     | 1623804 (0 )          |
| LSP7Mintable       | 2354082 (0 )          |
| LSP8Mintable       | 2476554 (0 )          |

### Runtime Costs

<details>
<summary>UniversalProfile owned by an 🔑 EOA</summary>

### 🔀 `execute` scenarios

| `execute` scenarios - UP owned by 🔑 EOA          | ⛽ Gas Usage        |
| :------------------------------------------------ | ------------------ |
| Transfer 1 LYX to an EOA without data             | 37537 (0 )         |
| Transfer 1 LYX to a UP without data               | 50373 (13,734 📈❌) |
| Transfer 1 LYX to an EOA with 256 bytes of data   | 42210 (0 )         |
| Transfer 1 LYX to a UP with 256 bytes of data     | 44807 (-60 📉✅)    |
| Transfer 0.1 LYX to 3x EOA without data           |  (-70,862 📉✅)     |
| Transfer 0.1 LYX to 3x UP without data            | 85349 (9,669 📈❌)  |
| Transfer 0.1 LYX to 3x EOA with 256 bytes of data | 84838 (48 📈❌)     |
| Transfer 0.1 LYX to 3x UPs with 256 bytes of data | 100321 (0 )        |

### 🗄️ `setData` scenarios

| `setData` scenarios - UP owned by 🔑 EOA                               | ⛽ Gas Usage      |
| :--------------------------------------------------------------------- | ---------------- |
| Set a 20 bytes long value                                              | 49971 (0 )       |
| Set a 60 bytes long value                                              | 95293 (0 )       |
| Set a 160 bytes long value                                             | 164441 (0 )      |
| Set a 300 bytes long value                                             | 279688 (24 📈❌)  |
| Set a 600 bytes long value                                             | 484136 (84 📈❌)  |
| Change the value of a data key already set                             | 32859 (12 📈❌)   |
| Remove the value of a data key already set                             | 27333 (0 )       |
| Set 2 data keys of 20 bytes long value                                 | 78454 (0 )       |
| Set 2 data keys of 100 bytes long value                                | 260618 (0 )      |
| Set 3 data keys of 20 bytes long value                                 | 105159 (-12 📉✅) |
| Change the value of three data keys already set of 20 bytes long value | 45471 (0 )       |
| Remove the value of three data keys already set                        | 41360 (0 )       |

### 🗄️ `Tokens` scenarios

| `Tokens` scenarios - UP owned by 🔑 EOA                         | ⛽ Gas Usage |
| :-------------------------------------------------------------- | ----------- |
| Minting a LSP7Token to a UP (No Delegate) from an EOA           | 91982 (0 )  |
| Minting a LSP7Token to an EOA from an EOA                       | 59289 (0 )  |
| Transferring an LSP7Token from a UP to another UP (No Delegate) | 100092 (0 ) |
| Minting a LSP8Token to a UP (No Delegate) from an EOA           | 159126 (0 ) |
| Minting a LSP8Token to an EOA from an EOA                       | 126433 (0 ) |
| Transferring an LSP8Token from a UP to another UP (No Delegate) | 148899 (0 ) |

</details>

<details>
<summary>UniversalProfile owned by a 🔒📄 LSP6KeyManager</summary>

### 🔀 `execute` scenarios

| `execute` scenarios               | 👑 main controller | 🛃 restricted controller |
| :-------------------------------- | ------------------ | ------------------------ |
| LYX transfer --> to an EOA        | 66106 (0 )         | 76899 (0 )               |
| LYX transfer --> to a UP          | 69966 (2,578 📈❌)  | 82535 (3,165 📈❌)        |
| LSP7 token transfer --> to an EOA | 120168 (12 📈❌)    | 134847 (0 )              |
| LSP7 token transfer --> to a UP   | 256723 (12 📈❌)    | 271402 (0 )              |
| LSP8 NFT transfer --> to an EOA   | 184411 (12 📈❌)    | 199067 (0 )              |
| LSP8 NFT transfer --> to a UP     | 304213 (12 📈❌)    | 318869 (0 )              |

### 🗄️ `setData` scenarios

| `setData` scenarios                                                                                                                                                                                                                                                | 👑 main controller | 🛃 restricted controller |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------ |
| Update Profile details (LSP3Profile Metadata)                                                                                                                                                                                                                      | 68714 (0 )         | 78713 (0 )               |
| Add a new controller with permission to `SET_DATA` + 3x allowed data keys: <br/> `AddressPermissions[]` <br/> + `AddressPermissions[index]` <br/> + `AddressPermissions:Permissions:<controller>` <br/> + `AddressPermissions:AllowedERC725YDataKeys:<controller`) | 212112 (0 )        | 222177 (0 )              |
| Update permissions of previous controller. Allow it now to `SUPER_SETDATA`                                                                                                                                                                                         | 53601 (0 )         | 56584 (0 )               |
| Remove a controller: <br/> 1. decrease `AddressPermissions[]` Array length <br/> 2. remove the controller address at `AddressPermissions[index]` <br/> 3. set "0x" for the controller permissions under AddressPermissions:Permissions:<controller-address>        | 80562 (0 )         | 91787 (0 )               |
| Write 5x new LSP12 Issued Assets                                                                                                                                                                                                                                   | 68267 (0 )         | 102871 (0 )              |
| Update 3x data keys (first 3)                                                                                                                                                                                                                                      | 127555 (0 )        | 161636 (0 )              |
| Update 3x data keys (middle 3)                                                                                                                                                                                                                                     | 107643 (0 )        | 145790 (0 )              |
| Update 3x data keys (last 3)                                                                                                                                                                                                                                       | 127555 (0 )        | 171123 (0 )              |
| Set 2 x new data keys + add 3x new controllers                                                                                                                                                                                                                     | 816000 (0 )        | 877547 (0 )              |

</details>

    