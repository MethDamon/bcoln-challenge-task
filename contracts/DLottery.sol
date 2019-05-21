pragma solidity ^0.5.7;

// Interface of the random number generator
contract WinningNumbersGeneratorInterface {
    function generateWinningNumbers(bytes memory input) public view returns (uint8[2] memory){}
}

contract DLottery {
    enum Phase { Open, Started, Reveal, Payout }

    struct Lottery {
        Phase current_phase;
        uint256 jackpot;
        address[] committed;
        address[] revealed;
        mapping(address => bytes32) addresses_to_committed_numbers;
        mapping(uint256 => mapping(uint256 => address[])) revealed_numbers_to_addresses;
        mapping(address => uint256[2]) addresses_to_revealed_numbers;
        uint256[] all_numbers;
        uint256[] time_stamps;
        uint256[] block_numbers;
        uint256[] block_difficulties;
        TimeStamps current_timestamps;
    }

    Lottery[] lotteries;
    uint256 currentLotteryIndex = 0;

    WinningNumbersGeneratorInterface private winningNumbersGenerator;
    //uint256 constant ENTRY_FEE = 581273793610390;
    uint256 constant ENTRY_FEE = (1 ether)/10;
    address owner;
    //uint256 constant TIME_LEFT_COMMIT_AND_REVEAL = 60; // 30 seconds
    uint256 constant TIME_LEFT_START_PHASE = 5*60; // 30 seconds
    uint256 constant TIME_TO_ABORT =  20 * 60; // 10 minutes
    uint256 constant TIME_WAIT_TO_GO_TO_REVEAL_PHASE = 1*60; // 30 seconds
    uint256 constant TIME_TO_REVEAL = 10 * 60; // 10 minutes
    uint256 constant NUMBER_OF_REQUIRED_PARTICIPANTS = 1;


    // time stamps of when the phases were entered
    struct TimeStamps {
        uint256 open;
        uint256 start;
        uint256 reveal;
        uint256 payout;
    }

    event NewCommit(
        address sender,
        bytes32 commitHash
    );
    event NewReveal(
        address sender,
        uint256 first_number,
        uint256 second_number
    );
    event Reset(
        address sender
    );
    event PhaseChange(
        Phase old_phase,
        Phase new_phase
    );
    event LotteryEnded(
        address[] winners
    );

    constructor(address _winningNumbersGeneratorAddress) public {
        // Make sure we have a valid address for the random number generator
        require(_winningNumbersGeneratorAddress != address(0));
        winningNumbersGenerator = WinningNumbersGeneratorInterface(_winningNumbersGeneratorAddress);
        owner = msg.sender;
        Lottery memory initialLottery;
        initialLottery.current_phase = Phase.Open;
        initialLottery.jackpot = address(this).balance/2;
        lotteries.push(initialLottery);
    }

    function getCommitted() public view returns (address[] memory) {
        return lotteries[currentLotteryIndex].committed;
    }

    function getCurrentTimestamp() public view returns (uint256 open, uint256 start, uint256 reveal, uint256 payout) {
        return (lotteries[currentLotteryIndex].current_timestamps.open,
                lotteries[currentLotteryIndex].current_timestamps.start,
                lotteries[currentLotteryIndex].current_timestamps.reveal,
                lotteries[currentLotteryIndex].current_timestamps.payout);
    }

    function getCurrentPhase() public view returns (Phase) {
        return lotteries[currentLotteryIndex].current_phase;
    }
    function getRevealed() public view returns (address[] memory) {
        return lotteries[currentLotteryIndex].revealed;
    }
    function getFee() public pure returns (uint256) {
        return ENTRY_FEE;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getLotteryIndex() public view returns (uint256) {
        return currentLotteryIndex;
    }

    function getTimers() public pure
    returns (uint256 TIME_LEFT_START, uint256 TO_ABORT, uint256 WAIT_TO_GO_TO_REVEAL, uint256 TO_REVEAL) {
        return (TIME_LEFT_START_PHASE,TIME_TO_ABORT,TIME_WAIT_TO_GO_TO_REVEAL_PHASE,TIME_TO_REVEAL);
    }
    function user_committed() public view returns (bool) {
        return !(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] == '');
    }
    function load() public payable {
        //require(msg.sender == owner, 'User must be owner of contract');
        emit NewCommit(msg.sender,'');
    }
    function withdraw() public payable {
        require(msg.sender == owner, 'User must be owner of contract');
        require(lotteries[currentLotteryIndex].current_phase == Phase.Open);
        address(msg.sender).transfer(address(this).balance);
        emit NewCommit(msg.sender,'');
    }

    function commit(bytes32 hash) public payable {
        require(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] == '', 'User must not have already committed.');
        require(msg.value >= ENTRY_FEE, 'Message has to have exactly the value for entering the lottery.');
        require(lotteries[currentLotteryIndex].current_phase == Phase.Open || lotteries[currentLotteryIndex].current_phase == Phase.Started,
            'Current phase needs to be Open or Started.');
        if (lotteries[currentLotteryIndex].current_phase == Phase.Started) {
            require((block.timestamp - lotteries[currentLotteryIndex].current_timestamps.start) < TIME_LEFT_START_PHASE, 'Time to commit is over.');
        }
        lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] = hash;
        uint256 new_number_of_participants = lotteries[currentLotteryIndex].committed.push(msg.sender);
        if (lotteries[currentLotteryIndex].current_phase == Phase.Open && new_number_of_participants == NUMBER_OF_REQUIRED_PARTICIPANTS) {
            // first user enters lottery -> lottery starts
            emit PhaseChange(lotteries[currentLotteryIndex].current_phase, Phase.Started);
            lotteries[currentLotteryIndex].current_phase = Phase.Started;
            lotteries[currentLotteryIndex].current_timestamps.start = now;
        }
        emit NewCommit(msg.sender, hash);
        lotteries[currentLotteryIndex].time_stamps.push(now);
        lotteries[currentLotteryIndex].block_numbers.push(block.number);
        lotteries[currentLotteryIndex].block_difficulties.push(block.difficulty);
    }
    function abort() public {
        require(lotteries[currentLotteryIndex].current_phase != Phase.Open);
        require((now - lotteries[currentLotteryIndex].current_timestamps.start) >=
            TIME_TO_ABORT, 'Abort time needs to be over.');
        resetLottery();
    }

    function resetLottery() private {
        Lottery memory newLottery;
        newLottery.jackpot = address(this).balance/2;
        newLottery.current_timestamps = TimeStamps(0, 0, 0, 0);
        emit PhaseChange(lotteries[currentLotteryIndex].current_phase, Phase.Open);
        newLottery.current_phase = Phase.Open;
        lotteries.push(newLottery);
        currentLotteryIndex = currentLotteryIndex + 1;
        emit Reset(msg.sender);
    }

    function goToRevealPhase() payable public {
        require(lotteries[currentLotteryIndex].current_phase == Phase.Started, 'Current phase needs to be Started');
        require(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] != '', 'Sender of the message must have committed numbers.');
        require((now - lotteries[currentLotteryIndex].current_timestamps.start) >=
            TIME_WAIT_TO_GO_TO_REVEAL_PHASE, 'Waiting time needs to be over.');
        emit PhaseChange(lotteries[currentLotteryIndex].current_phase, Phase.Reveal);
        lotteries[currentLotteryIndex].current_phase = Phase.Reveal;
        lotteries[currentLotteryIndex].current_timestamps.reveal = block.timestamp;
    }
    function reveal(uint256 firstNumber, uint256 secondNumber) payable public {
        require(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] != '', 'User must have committed numbers.');
        require(lotteries[currentLotteryIndex].addresses_to_revealed_numbers[msg.sender].length != 0, 'User must not have aready revealed numbers.');
        require(lotteries[currentLotteryIndex].current_phase == Phase.Reveal, 'Current phase needs to be Reveal.');
        require((block.timestamp - lotteries[currentLotteryIndex].current_timestamps.reveal) < TIME_TO_REVEAL, 'Must be within time to reveal.');
        bytes memory input = abi.encode(firstNumber, msg.sender, secondNumber);
        bytes32 hashed = keccak256(input);
        require(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] == hashed, 'Hash must be the same as the one that is stored.');
        lotteries[currentLotteryIndex].revealed_numbers_to_addresses[firstNumber][secondNumber].push(msg.sender);
        uint256[2] memory numbers = [firstNumber, secondNumber];
        lotteries[currentLotteryIndex].all_numbers.push(firstNumber);
        lotteries[currentLotteryIndex].all_numbers.push(secondNumber);
        lotteries[currentLotteryIndex].addresses_to_revealed_numbers[msg.sender] =  numbers;
        lotteries[currentLotteryIndex].revealed.push(msg.sender);
        emit NewReveal(msg.sender, firstNumber, secondNumber);
        lotteries[currentLotteryIndex].time_stamps.push(block.timestamp);
        lotteries[currentLotteryIndex].block_numbers.push(block.number);
        lotteries[currentLotteryIndex].block_difficulties.push(block.difficulty);
        // Check if everyone that committed also revealed
        // Go to payout phase if yes
        if (lotteries[currentLotteryIndex].committed.length == lotteries[currentLotteryIndex].revealed.length) {
            payout();
        }
    }

    event Log (
        uint256 number
    );

    event Log2 (bytes b);
    
    function payout() public  {
        require(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] != '', 'User must have committed numbers.');
        //require(addresses_to_revealed_numbers[msg.sender].length != 0, 'User must have aready revealed numbers.');
        require(lotteries[currentLotteryIndex].current_phase == Phase.Reveal, 'Current phase needs to be Reveal.');
        if(lotteries[currentLotteryIndex].committed.length != lotteries[currentLotteryIndex].revealed.length){
            require((now - lotteries[currentLotteryIndex].current_timestamps.reveal) >=
                TIME_TO_REVEAL, 'Time to reveal needs to be over.');
        }
        emit PhaseChange(lotteries[currentLotteryIndex].current_phase, Phase.Payout);
        lotteries[currentLotteryIndex].current_phase = Phase.Payout;
        Lottery memory current_lottery = lotteries[currentLotteryIndex];
        bytes memory input = abi.encode(keccak256(abi.encode(current_lottery.all_numbers, current_lottery.block_difficulties, current_lottery.block_numbers, current_lottery.time_stamps)));
        uint8[2] memory winning_numbers = winningNumbersGenerator.generateWinningNumbers(input);
        uint8 first_winning_number = winning_numbers[0];
        uint8 second_winning_number = winning_numbers[1];
        emit Log(first_winning_number);
        emit Log(second_winning_number);
        address[] memory winners = lotteries[currentLotteryIndex].revealed_numbers_to_addresses[first_winning_number][second_winning_number];
        // Check if there are any winners
        if (winners.length != 0) {
            // Get half of this contracts balance
            uint256 balance = address(this).balance;
            require(balance > 0, 'Contract needs to have balance.');
            uint256 price = balance / 2;
            uint256 price_per_winner = price / winners.length;
            // Payout the prices
            for (uint i = 0; i < winners.length; i++) {
                address payable winners_address = address(uint160(winners[i]));
                winners_address.transfer(price_per_winner);
            }
        }
        emit LotteryEnded(winners);
        resetLottery();
    }
}
