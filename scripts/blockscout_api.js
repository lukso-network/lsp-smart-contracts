const fs = require("fs");
const axios = require("axios").default;

axios.defaults.headers.post["Content-Type"] = "application/json";
const BLOCKSCOUT_ENDPOINT = "https://blockscout.com/lukso/l14/api";

const MY_LUKSO_ADDRESS = "0x3735Df12965f9017486f3b248c4C4AD92CecbA99";

// axios
//   .get(`${BLOCKSCOUT_ENDPOINT}?module=block&action=getblockreward&blockno=10745212`)
//   .then(console.log);

// axios
//   .get(
//     `${BLOCKSCOUT_ENDPOINT}?module=account&action=balance&address=0x3735Df12965f9017486f3b248c4C4AD92CecbA99`
//   )
//   .then(console.log);

let file = "./flat_contracts/LSP3Account_flat.sol";

fs.readFile(file, "utf8", (err, data) => {
  let contractAddress = "0xEA2D7837ecD00F93855d5DB63990945b4D0669d4";
  let contractSourceCode = "LSP3Account";
  let contractName = "LSP3Account";

  //   axios.post(`${BLOCKSCOUT_ENDPOINT}?module=contract&action=verify&addressHash=${contractAddress}&compilerVersion=v0.8.7+commit.e28d00a7&`).then(console.log)

  axios
    .post(`${BLOCKSCOUT_ENDPOINT}`, {
      module: "contract",
      action: "verify",
      addressHash: contractAddress,
      compilerVersion: "v0.8.7+commit.e28d00a7",
      contractSourceCode: contractSourceCode,
      name: contractName,
      optimization: true,
      optimizationRuns: 200,
      autodetectConstructorArguments: true,
      library1Name: "ERC725Utils",
      library1Address: "0x4EFDD05970A89FD24D61219f38b619296045076F",
    })
    .then(console.log());
});

// const cmd = `
// curl https://blockscout.com/lukso/l14/api -d '{
//     "addressHash":"0xc63BB6555C90846afACaC08A0F0Aa5caFCB382a1",
//     "compilerVersion":"v0.5.4+commit.9549d8ff",
//     "contractSourceCode":"pragma solidity ^0.5.4; contract Test { }",
//     "name":"Test",
//     "optimization":false
// }'
//     -H "Content-Type: application/json" -X POST "${BLOCKSCOUT_ENDPOINT}?module=contract&action=verify"
// `;
