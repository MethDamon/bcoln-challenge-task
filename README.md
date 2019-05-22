This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# BCOLN SS19 Challenge Task - Group Einstein

This repository hosts the code of the challenge task of the Blockchain and Overlay Networks lecture in the spring semester 2019.

It implements a lottery based on a smart contract written in Solidity, compatible with the Ethereum Blockchain. Fees and prizes are paid directly in ETH.

## Get Started

### Prerequisites

In order for this project to work properly on your local machine, a few things need to be installed:

- `ganache-cli` and `truffle` have to be installed globally and in your `PATH`. If they are not, install with `yarn global add ganache-cli truffle`.
- The Metamask plugin has to be installed in your default browser with the security settings set accordingly (So the React app can connect to Metamask).


### Development Setup / Local Blockchain

If you want to run the project with a development setup and a development blockchain, follow the following steps

1. Clone the repo.
2. Make sure you have ganache-cli and truffle installed globally and that both are in your `PATH`. If not, run `yarn global add ganache-cli truffle`.
4. Start up a local development blockchain using `ganache-cli`. Run `ganache-cli -i 5777`. Note the network id, the project will look for a network with id `5777`.
5. Run `yarn install`.
6. Run `yarn run sc-local`. This will compile and deploy the main contract and dependendent contracts to the local ganache blockchain.
7. Run `yarn run` to start the React application.

### Ropsten Setup

A version of the React app connecting to a deployed contract on Ropsten is hosted [on Firebase](https://lottery-dapp.firebaseapp.com/).