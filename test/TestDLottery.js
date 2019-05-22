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
        let committed = await lottery.getCommitted();
        assert.equal(committed.length, 0);
        await lottery.commit(hash, {value: entry_fee});
        let newBalance = await lottery.getBalance();
        assert.equal(web3.utils.toWei(newBalance, 'wei'), web3.utils.toWei(oldBalance + entry_fee, 'wei'));
        let newPhase = await lottery.getCurrentPhase();
        committed = await lottery.getCommitted();
        assert.equal(committed.length, 1);
        assert.equal(committed[0], accounts[0]);
    });

    it('should be able to load the contracts jackpot', async() => {
        let oldBalance = await lottery.getBalance();
        let load = web3.utils.toWei('10', 'ether');
        await lottery.load({value: load});
        let newBalance = await lottery.getBalance();
        assert.equal(web3.utils.toWei(oldBalance + load, 'wei'), web3.utils.toWei(newBalance, 'wei'));    
    });

    it('should go correctly to reveal phase', async() => {
        let fee = await lottery.getFee();
        let first_number = 3;
        let second_number = 4;
        let toHash = web3.eth.abi.encodeParameters(['uint8', 'address', 'uint8'], [first_number, accounts[0], second_number]);
        let hash = web3.utils.soliditySha3(toHash);
        await lottery.commit(hash, {value: fee});
        let user_committed = await lottery.user_committed();
        assert.equal(user_committed, true);
       // await timeout(50000);
       // await lottery.goToRevealPhase(3, 4);
       // let newPhase = lottery.getCurrentPhase();
       // assert.equal(newPhase, 2);
    });

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});