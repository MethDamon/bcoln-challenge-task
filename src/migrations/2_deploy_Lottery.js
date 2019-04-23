const DLottery = artifacts.require("./DLottery");

module.exports = function(deployer) {
    deployer.deploy(DLottery);
};