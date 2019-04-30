pragma solidity ^0.5.7;

contract DLottery {
    
    uint256 constant ENTRY_FEE = 581273793610390;
    
    address owner;
    
    address[] public committed;
    address[] public revealed;
    mapping(address => bytes32) private addresses_to_committed_numbers;
    mapping(uint8 => mapping(uint8 => address[])) public revealed_numbers_to_addresses;
    mapping(address => uint8[]) addresses_to_revealed_numbers;
    
    uint256 constant TIME_LEFT_COMMIT_AND_REVEAL = 60; // 30 seconds
    uint256 constant TIME_TO_ABORT =  10 * 60; // 10 minutes
    uint256 constant TIME_WAIT_TO_GO_TO_REVEAL_PHASE = 10; // 30 seconds
    uint256 constant TIME_TO_REVEAL = 10 * 60; // 10 minutes
    
    uint256 constant NUMBER_OF_REQUIRED_PARTICIPANTS = 1;
    
    uint256[] private time_stamps;
    uint256[] private block_numbers;
    uint256[] private block_difficulties;
    
    enum Phase { Commit, CommitAndReadyForReveal, Reveal, Payout }
    Phase public current_phase;
    
    // time stamps of when the phases were entered
    struct TimeStamps {
        uint256 commit;
        uint256 commit_and_ready_for_reveal;
        uint256 reveal;
        uint256 payout;
    }
    
    TimeStamps public current_timestamps;

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
        current_phase = Phase.Commit;
        current_timestamps = TimeStamps(now, 0, 0, 0);
        current_timestamps.commit = now;
    }
    
    function getCommitted() public view returns (address[] memory) {
        return committed;
    }
    
    function getRevealed() public view returns (address[] memory) {
        return revealed;
    }
    
    function getFee() pure public returns (uint256) {
        return ENTRY_FEE;
    }

    function getTimers() public view returns (uint256 LEFT_COMMIT_AND_REVEAL, uint256 TO_ABORT, uint256 WAIT_TO_GO_TO_REVEAL_PHASE, uint256 TO_REVEAL) {
        return (TIME_LEFT_COMMIT_AND_REVEAL,TIME_TO_ABORT,TIME_WAIT_TO_GO_TO_REVEAL_PHASE,TIME_TO_REVEAL);
    }
    
    function user_committed() public returns (bool) {
        return !(addresses_to_committed_numbers[msg.sender] == '');
    }
    
    function commit(bytes32 hash) payable public returns (bytes32) {
        require(addresses_to_committed_numbers[msg.sender] == '', 'Already committed');
        require(msg.value == ENTRY_FEE);
        require(current_phase == Phase.Commit || current_phase == Phase.CommitAndReadyForReveal);
        if (current_phase == Phase.CommitAndReadyForReveal) {
            require((now - current_timestamps.commit_and_ready_for_reveal) < TIME_LEFT_COMMIT_AND_REVEAL);
        }
        addresses_to_committed_numbers[msg.sender] = hash;
        uint256 new_number_of_participants = committed.push(msg.sender);
        if (current_phase == Phase.Commit && new_number_of_participants == NUMBER_OF_REQUIRED_PARTICIPANTS) {
            // Automatically go to commit and ready to reveal phase
            emit PhaseChange(current_phase, Phase.CommitAndReadyForReveal);
            current_phase = Phase.CommitAndReadyForReveal;
            current_timestamps.commit_and_ready_for_reveal = now;
        }
        committed.push(msg.sender);
        emit NewCommit(msg.sender, hash);
        time_stamps.push(now);
        block_numbers.push(block.number);
        block_difficulties.push(block.difficulty);
        return hash;
    }
    
    function reset() public {
        emit PhaseChange(current_phase, Phase.Commit);
        current_phase = Phase.Commit;
        for(uint i = 0; i < committed.length; i++) {
            delete addresses_to_committed_numbers[committed[i]];
        }
        for(uint i = 8; i < revealed.length; i++) {
            delete addresses_to_revealed_numbers[revealed[i]];
        }
        delete committed;
        delete revealed;
        for(uint8 i = 0; i < 16; i++) {
            for(uint8 j = 0; i < 16; i++) {
                delete revealed_numbers_to_addresses[i][j];
            }
        }
        delete time_stamps;
        delete block_difficulties;
        delete block_numbers;
        current_timestamps = TimeStamps(now, 0, 0, 0);
        emit Reset(msg.sender);
    }
    
    function goToRevealPhase() payable public {
        require(current_phase == Phase.CommitAndReadyForReveal);
        require(addresses_to_committed_numbers[msg.sender] != '');
        require((now - current_timestamps.commit_and_ready_for_reveal) >= TIME_WAIT_TO_GO_TO_REVEAL_PHASE);
        emit PhaseChange(current_phase, Phase.Reveal);
        current_phase = Phase.Reveal;
        current_timestamps.reveal = now;
    }
    
    function reveal(uint8 firstNumber, uint8 secondNumber) payable public {
        require(addresses_to_committed_numbers[msg.sender] != '', 'User did not commit anything');
        require(addresses_to_revealed_numbers[msg.sender].length == 0, 'User already revealed numbers.');
        require(current_phase == Phase.Reveal);
        require((now - current_timestamps.reveal) < TIME_TO_REVEAL);
        bytes memory input = abi.encode(firstNumber, msg.sender, secondNumber);
        bytes32 hashed = keccak256(input);
        require(addresses_to_committed_numbers[msg.sender] == hashed);
        revealed_numbers_to_addresses[firstNumber][secondNumber].push(msg.sender);
        revealed.push(msg.sender);
        emit NewReveal(msg.sender, firstNumber, secondNumber);
        time_stamps.push(now);
        block_numbers.push(block.number);
        block_difficulties.push(block.difficulty);
        
        // Check if everyone that committed also revealed
        // Go to payout phase if yes
        if (committed.length == revealed.length) {
            emit PhaseChange(current_phase, Phase.Payout);
            payout();
        }
    }
    
    function payout() private {
        require(current_phase == Phase.Payout);
        bytes memory input = abi.encode(time_stamps, block_numbers, block_difficulties);
        bytes32 hashed_information = keccak256(input);
        uint8 first_winning_number = sliceUint8(hashed_information, 0);
        uint8 second_winning_number = sliceUint8(hashed_information, 24);
        address[] memory winners = revealed_numbers_to_addresses[first_winning_number][second_winning_number];
        
        // Check if there are any winners
        if (winners.length != 0) {
            // Get half of this contracts balance
            uint256 balance = address(this).balance;
            require(balance > 0);
            emit LotteryEnded(winners);
            uint256 price = balance / 2;
            uint256 price_per_winner = price / winners.length;
            // Payout the prices
            for (uint i = 0; i < winners.length; i++) {
                address payable winners_address = address(uint160(winners[i]));
                winners_address.transfer(price_per_winner);
            }
        }
        
        // Start the lottery again;
        reset();
    }
    
    function sliceUint8(bytes32 bs, uint start)internal pure returns (uint8) {
        require(bs.length >= start + 8, "slicing out of range");
            uint8 x;
            assembly {
                x := mload(add(bs, add(0x20, start)))
            }
        return x;
    }
}
    