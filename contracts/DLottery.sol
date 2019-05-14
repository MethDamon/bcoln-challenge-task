pragma solidity ^0.5.7;

import "solidity-bytes-utils/contracts/BytesLib.sol";

contract DLottery {
    using BytesLib for bytes;
    enum Phase { Commit, CommitAndReadyForReveal, Reveal, Payout }

    struct Lottery {
        Phase current_phase;
        uint256 jackpot;
        address[] committed;
        address[] revealed;
        mapping(address => bytes32) addresses_to_committed_numbers;
        mapping(uint256 => mapping(uint256 => address[])) revealed_numbers_to_addresses;
        mapping(address => uint8[2]) addresses_to_revealed_numbers;
        TimeStamps current_timestamps;
    }

    Lottery[] lotteries;
    uint256 currentLotteryIndex = 0;

    //uint256 constant ENTRY_FEE = 581273793610390;
    uint256 constant ENTRY_FEE = (1 ether)/2;
    address owner;
    uint256 constant TIME_LEFT_COMMIT_AND_REVEAL = 60; // 30 seconds
    uint256 constant TIME_TO_ABORT =  10 * 60; // 10 minutes
    uint256 constant TIME_WAIT_TO_GO_TO_REVEAL_PHASE = 10; // 30 seconds
    uint256 constant TIME_TO_REVEAL = 10 * 60; // 10 minutes
    uint256 constant NUMBER_OF_REQUIRED_PARTICIPANTS = 1;
    uint256[] private time_stamps;
    uint256[] private block_numbers;
    uint256[] private block_difficulties;

    // time stamps of when the phases were entered
    struct TimeStamps {
        uint256 commit;
        uint256 commit_and_ready_for_reveal;
        uint256 reveal;
        uint256 payout;
    }

    event NewCommit(
        address sender,
        bytes32 commitHash
    );
    event NewReveal(
        address sender,
        uint8 first_number,
        uint8 second_number
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

    constructor() public {
        owner = msg.sender;
        Lottery memory initialLottery;
        initialLottery.current_phase = Phase.Commit;
        initialLottery.jackpot = address(this).balance/2;
        initialLottery.current_timestamps = TimeStamps(block.timestamp, 0, 0, 0);
        lotteries.push(initialLottery);
    }

    function getCommitted() public view returns (address[] memory) {
        return lotteries[currentLotteryIndex].committed;
    }

    function getCurrentTimestamp() public view returns (uint256 commit, uint256 commit_and_ready_for_reveal, uint256 reveal, uint256 payout) {
        return (lotteries[currentLotteryIndex].current_timestamps.commit,
                lotteries[currentLotteryIndex].current_timestamps.commit_and_ready_for_reveal,
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

    function getTimers() public pure
    returns (uint256 LEFT_COMMIT_AND_REVEAL, uint256 TO_ABORT, uint256 WAIT_TO_GO_TO_REVEAL_PHASE, uint256 TO_REVEAL) {
        return (TIME_LEFT_COMMIT_AND_REVEAL,TIME_TO_ABORT,TIME_WAIT_TO_GO_TO_REVEAL_PHASE,TIME_TO_REVEAL);
    }
    function user_committed() public view returns (bool) {
        return !(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] == '');
    }
    function commit(bytes32 hash) public payable {
        require(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] == '', 'User must not have already committed.');
        require(msg.value >= ENTRY_FEE, 'Message has to have exactly the value for entrying the lottery.');
        require(lotteries[currentLotteryIndex].current_phase == Phase.Commit || lotteries[currentLotteryIndex].current_phase == Phase.CommitAndReadyForReveal,
            'Current phase needs to be Commit or CommitAndReadyForReveal.');
        if (lotteries[currentLotteryIndex].current_phase == Phase.CommitAndReadyForReveal) {
            require((block.timestamp - lotteries[currentLotteryIndex].current_timestamps.commit_and_ready_for_reveal) < TIME_LEFT_COMMIT_AND_REVEAL, 'Time to commit is over.');
        }
        lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] = hash;
        uint256 new_number_of_participants = lotteries[currentLotteryIndex].committed.push(msg.sender);
        if (lotteries[currentLotteryIndex].current_phase == Phase.Commit && new_number_of_participants == NUMBER_OF_REQUIRED_PARTICIPANTS) {
            // Automatically go to commit and ready to reveal phase
            emit PhaseChange(lotteries[currentLotteryIndex].current_phase, Phase.CommitAndReadyForReveal);
            lotteries[currentLotteryIndex].current_phase = Phase.CommitAndReadyForReveal;
            lotteries[currentLotteryIndex].current_timestamps.commit_and_ready_for_reveal = now;
        }
        emit NewCommit(msg.sender, hash);
        time_stamps.push(now);
        block_numbers.push(block.number);
        block_difficulties.push(block.difficulty);
    }
    function reset() public {
        emit PhaseChange(lotteries[currentLotteryIndex].current_phase, Phase.Commit);

        Lottery memory newLottery;
        newLottery.jackpot = address(this).balance/2;
        newLottery.current_timestamps = TimeStamps(block.timestamp, 0, 0, 0);
        newLottery.current_phase = Phase.Commit;

        lotteries.push(newLottery);
        currentLotteryIndex = currentLotteryIndex + 1;
        emit Reset(msg.sender);

        //        //change currentLotteryIndex
//       current_phase = Phase.Commit;
//        for(uint i = 0; i < committed.length; i++) {
//            delete addresses_to_committed_numbers[committed[i]];
//        }
//        for(uint i = 8; i < lotteries[currentLotteryIndex].revealed.length; i++) {
//            delete addresses_to_revealed_numbers[revealed[i]];
//        }
//        delete committed;
//        delete revealed;
//        for(uint8 i = 0; i < 16; i++) {
//            for(uint8 j = 0; i < 16; i++) {
//                delete revealed_numbers_to_addresses[i][j];
//            }
//        }
//        delete time_stamps;
//        delete block_difficulties;
//        delete block_numbers;
//        current_timestamps = TimeStamps(now, 0, 0, 0);
//        emit Reset(msg.sender);
    }
    function goToRevealPhase() payable public {
        require(lotteries[currentLotteryIndex].current_phase == Phase.CommitAndReadyForReveal, 'Current phase needs to be CommitAndReadyForReveal');
        require(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] != '', 'Sender of the message must have committed numbers.');
        require((now - lotteries[currentLotteryIndex].current_timestamps.commit_and_ready_for_reveal) >=
            TIME_WAIT_TO_GO_TO_REVEAL_PHASE, 'Waiting time needs to be over.');
        emit PhaseChange(lotteries[currentLotteryIndex].current_phase, Phase.Reveal);
        lotteries[currentLotteryIndex].current_phase = Phase.Reveal;
        lotteries[currentLotteryIndex].current_timestamps.reveal = block.timestamp;
    }
    function reveal(uint8 firstNumber, uint8 secondNumber) payable public {
        require(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] != '', 'User must have committed numbers.');
        require(lotteries[currentLotteryIndex].addresses_to_revealed_numbers[msg.sender].length != 0, 'User must not have aready revealed numbers.');
        require(lotteries[currentLotteryIndex].current_phase == Phase.Reveal, 'Current phase needs to be Reveal.');
        require((block.timestamp - lotteries[currentLotteryIndex].current_timestamps.reveal) < TIME_TO_REVEAL, 'Must be within time to reveal.');
        bytes memory input = abi.encode(firstNumber, msg.sender, secondNumber);
        bytes32 hashed = keccak256(input);
        require(lotteries[currentLotteryIndex].addresses_to_committed_numbers[msg.sender] == hashed, 'Hash must be the same as the one that is stored.');
        lotteries[currentLotteryIndex].revealed_numbers_to_addresses[firstNumber][secondNumber].push(msg.sender);
        uint8[2] memory numbers = [firstNumber, secondNumber];
        lotteries[currentLotteryIndex].addresses_to_revealed_numbers[msg.sender] =  numbers;
        lotteries[currentLotteryIndex].revealed.push(msg.sender);
        emit NewReveal(msg.sender, firstNumber, secondNumber);
        time_stamps.push(block.timestamp);
        block_numbers.push(block.number);
        block_difficulties.push(block.difficulty);
        // Check if everyone that committed also revealed
        // Go to payout phase if yes
        if (lotteries[currentLotteryIndex].committed.length == lotteries[currentLotteryIndex].revealed.length) {
            emit PhaseChange(lotteries[currentLotteryIndex].current_phase, Phase.Payout);
            lotteries[currentLotteryIndex].current_phase = Phase.Payout;
            payout();
        }
    }

    event Log (
        uint256 number
    );

    event Log2 (bytes b);

    function payout() public returns (uint256) {
        //require(addresses_to_committed_numbers[msg.sender] != '', 'User must have committed numbers.');
        //require(addresses_to_revealed_numbers[msg.sender].length != 0, 'User must have aready revealed numbers.');
        //require(current_phase == Phase.Payout, 'Current phase needs to be Payout.');
        bytes memory input = abi.encode(keccak256(abi.encode(block_difficulties, block_numbers, time_stamps)));
        bytes memory padding = hex"00000000000000000000000000000000000000000000000000000000000000";
        bytes memory b1 = padding.concat(input.slice(0, 1));
        bytes memory b2 = padding.concat(input.slice(1, 2));

        uint8 first_winning_number = uint8(b1.toUint(0));
        uint8 second_winning_number = uint8(b2.toUint(0));
        first_winning_number = first_winning_number %16 +1;
        second_winning_number = second_winning_number %16 +1;
        if(first_winning_number == second_winning_number){
            if(second_winning_number== 16){
                second_winning_number = 1;
            }else{
                second_winning_number = second_winning_number +1;
            }
        }
        first_winning_number = 1;
        second_winning_number = 2;
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
        reset();

    }
}
