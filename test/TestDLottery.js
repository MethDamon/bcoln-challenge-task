const DLottery = artifacts.require('./contracts/DLottery');

contract("DLottery", accounts => {
    it("should initialize the phase correctly", async () => {
        let instance = await DLottery.deployed();
        let phase = await instance.current_phase.call();
        assert.equal(phase, 0);
    });

    it('should be able to commit correctly', async(web3) => {
        let instance = await DLottery.deployed();
        let entry_fee = await instance.getFee.call();
        let hash = web3.eth.util.soliditySha3('test');
        await instance.commit.call("sdsd", {value: entry_fee});
    });
});