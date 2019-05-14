const dLottery = artifacts.require("./DLottery");
const winningNumbersGenerator = artifacts.require('./WinningNumbersGenerator');

module.exports = async function(deployer) {
    let a = await deployer.deploy(winningNumbersGenerator);
    let b = await deployer.deploy(dLottery, winningNumbersGenerator.address);
};