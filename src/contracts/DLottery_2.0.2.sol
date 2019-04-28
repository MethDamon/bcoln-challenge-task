pragma solidity ^0.5.7;

contract DLottery {
    
    uint256 constant ENTRY_FEE = 581273793610390;
    
    address owner;
    
    address[] public committed;
    address[] public revealed;
    mapping(address => bytes32) private adresses_to_committed_numbers;
    mapping(uint8 => mapping(uint8 => address[])) public revealed_numbers_to_addresses;
    
    uint256 constant TIME_LEFT_COMMIT_AND_REVEAL = 60; // 30 seconds
    uint256 constant TIME_TO_ABORT =  10 * 60; // 10 minutes
    uint256 constant TIME_WAIT_TO_GO_TO_REVEAL_PHASE = 10; // 30 seconds
    uint256 constant TIME_TO_REVEAL = 10 * 60; // 10 minutes
    
    uint256 constant NUMBER_OF_REQUIRED_PARTICIPANTS = 1;
    
    uint256[] private time_stamps;
    uint256[] private block_numbers;
    uint256[] block_difficulties;
    
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
    
    event NewCommit(
       bytes32 commitHash
    );
    
    function user_committed() public returns (bool) {
        return !(adresses_to_committed_numbers[msg.sender] == '');
    }
    
    function commit(bytes32 hash) payable public returns (bytes32) {
        require(adresses_to_committed_numbers[msg.sender] == '', 'Already committed');
        require(msg.value == ENTRY_FEE);
        require(current_phase == Phase.Commit || current_phase == Phase.CommitAndReadyForReveal);
        if (current_phase == Phase.CommitAndReadyForReveal) {
            require((now - current_timestamps.commit_and_ready_for_reveal) < TIME_LEFT_COMMIT_AND_REVEAL);
        }
        adresses_to_committed_numbers[msg.sender] = hash;
        uint256 new_number_of_participants = committed.push(msg.sender);
        if (current_phase == Phase.Commit && new_number_of_participants == NUMBER_OF_REQUIRED_PARTICIPANTS) {
            // Automatically go to commit and ready to reveal phase
            current_phase = Phase.CommitAndReadyForReveal;
            current_timestamps.commit_and_ready_for_reveal = now;
        }
        emit NewCommit(hash);
        time_stamps.push(now);
        block_numbers.push(block.number);
        block_difficulties.push(block.difficulty);
        return hash;
    }
    
    function abort() public {
        current_phase = Phase.Commit;
        for(uint i = 0; i < committed.length; i++) {
            adresses_to_committed_numbers[committed[i]] = 0;
        }
        delete committed;
        delete revealed;
        for(uint8 i = 0; i < 16; i++) {
            for(uint8 j = 0; i < 16; i++) {
                delete revealed_numbers_to_addresses[i][j];
            }
        }
        current_timestamps = TimeStamps(now, 0, 0, 0);
        emit NewCommit(keccak256("reset"));

    }
    
    function goToRevealPhase() payable public {
        require(current_phase == Phase.CommitAndReadyForReveal);
        require(adresses_to_committed_numbers[msg.sender] != '');
        require((now - current_timestamps.commit_and_ready_for_reveal) >= TIME_WAIT_TO_GO_TO_REVEAL_PHASE);
        current_phase = Phase.Reveal;
        current_timestamps.reveal = now;
        emit NewCommit(keccak256("reset"));

    }

    function reveal(uint8 firstNumber, uint8 secondNumber) payable public {
        require(adresses_to_committed_numbers[msg.sender] != '');
        require(current_phase == Phase.Reveal);
        require((now - current_timestamps.reveal) < TIME_TO_REVEAL);
        bytes memory input = abi.encode(firstNumber, msg.sender, secondNumber);
        bytes32 hashed = keccak256(input);
        require(adresses_to_committed_numbers[msg.sender] == hashed);
        revealed_numbers_to_addresses[firstNumber][secondNumber].push(msg.sender);
        time_stamps.push(now);
        block_numbers.push(block.number);
        block_difficulties.push(block.difficulty);
    }
    
    function mergeBytes(bytes memory param1, bytes memory param2, bytes memory param3) private pure returns (bytes memory) {
        bytes memory merged = new bytes(param1.length + param2.length + param3.length);

        uint k = 0;
        for (uint i = 0; i < param1.length; i++) {
            merged[k] = param1[i];
            k++;
        }
    
        for (uint i = 0; i < param2.length; i++) {
            merged[k] = param2[i];
            k++;
        }
        
        for (uint i = 0; i < param3.length; i++) {
            merged[k] = param3[i];
            k++;
        }
        
        return merged;
    }
    
    function toBytes(uint8 x) private pure returns (bytes memory b) {
        b = new bytes(1);
        b[0] = byte(x);
        return b;
    }
    
    function toBytes(address x) private pure returns (bytes memory b) {
        b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
        return b;
    }
    
    function toString(address x) private pure returns (string memory) {
        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
        return string(b);
    }
}
    