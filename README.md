# universalprofile-smart-contracts
The reference implementation for universal profiles smart contracts.

## Installation

```bash
# install truffle globally
$ npm install -g truffle

$ git clone https://github.com/lukso-network/universalprofile-smart-contracts.git
$ cd ./universalprofile-smart-contracts

# make sure to download the ERC725 submodule
$ git submodule update --init --recursive

# install dependencies
$ npm install
# and also for the submododule
$ cd ./submodules/ERC725/implementations && npm install
```

## Running tests

To run all the tests, you can run:

```bash
$ npm test
```

To run specific tests files:
* run a local network
* deploy the smart contracts
* specify the test file to run

```bash
# run a blockchain locally
$ truffle develop

# compile all contracts
> compile --all

# deploy all contracts
> migrate --reset

# run tests
> test test/<test-file>.test.js
```

