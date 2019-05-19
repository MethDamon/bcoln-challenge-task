const DLottery = artifacts.require('./contracts/DLottery');
const WinningNumbersGenerator = artifacts.require('./contract/WinningNumbersGenerator');

contract("DLottery", accounts => {

    let generator;
    let lottery;

    beforeEach(async () => {
        generator = await WinningNumbersGenerator.new();
        lottery = await DLottery.new(generator.address);
    });

    it("should initialize the phase correctly", async () => {
        let phase = await lottery.getCurrentPhase();
        assert.equal(phase, 0);
    });

    it('should be able to commit correctly', async() => {
        let oldBalance = await lottery.getBalance();
        assert.equal(oldBalance, 0);
        let entry_fee = await lottery.getFee();
        let hash = web3.utils.soliditySha3('test');
        await lottery.commit(hash, {value: entry_fee});
        let newBalance = await lottery.getBalance();
        assert.equal(web3.utils.toWei(newBalance, 'wei'), web3.utils.toWei(oldBalance + entry_fee, 'wei'));
    });

    it('should be able to load the contracts jackpot', async() => {
        let oldBalance = await lottery.getBalance();
        let load = web3.utils.toWei('10', 'ether');
        await lottery.load({value: load});
        let newBalance = await lottery.getBalance();
        assert.equal(web3.utils.toWei(oldBalance + load, 'wei'), web3.utils.toWei(newBalance, 'wei'));    
    });
});