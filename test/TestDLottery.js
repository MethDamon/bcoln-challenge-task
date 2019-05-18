const DLottery = artifacts.require('./contracts/DLottery');
const WinningNumbersGenerator = artifacts.require('./contract/WinningNumbersGenerator');

contract("DLottery", accounts => {

    let generator;
    let lottery;

    beforeEach(async function() {
        generator = await WinningNumbersGenerator.new();
        lottery = await DLottery.new(generator.address);
    });

    it("should initialize the phase correctly", async () => {
        let phase = await lottery.getCurrentPhase.call();
        assert.equal(phase, 0);
    });

    it('should be able to commit correctly', async() => {
        let entry_fee = await lottery.getFee.call();
        let hash = web3.utils.soliditySha3('test');
        await lottery.commit.call(hash, {value: entry_fee});
    });
});