const WinningNumbersGenerator = artifacts.require('./WinningNumbersGenerator');

module.exports = function(deployer) {
    deployer.deploy(WinningNumbersGenerator);
};