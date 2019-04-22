pragma solidity ^0.5.7;

contract DLottery {
    
    uint256 constant ENTRY_FEE = 581273793610390;
    
    address[] public committed;
    address[] public revealed;
    mapping(address => bytes32) public adresses_to_committed_numbers;
    mapping(uint8 => mapping(uint8 => address[])) public revealed_numbers_to_addresses;
    
    uint256 constant TIME_LEFT_COMMIT_AND_REVEAL = 30 * 1000; // 30 seconds
    uint256 constant TIME_TO_ABORT =  1 * 60 * 1000; // 1 minute
    uint256 constant TIME_TO_GO_TO_REVEAL_PHASE = 30 * 1000; // 30 seconds
    uint256 constant TIME_TO_REVEAL = 1 * 60 * 1000; // 1 minute
    
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
        current_phase = Phase.Commit;
        current_timestamps = TimeStamps(0, 0, 0, 0);
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
    
    event NewCommit(
       bytes32 commitHash
    );
    
    function commit(bytes32 hash) payable public returns (bytes32) {
        require(msg.value == ENTRY_FEE);
        require(current_phase == Phase.Commit || current_phase == Phase.CommitAndReadyForReveal);
        if (current_phase == Phase.CommitAndReadyForReveal) {
            require((now - current_timestamps.commit_and_ready_for_reveal) < TIME_LEFT_COMMIT_AND_REVEAL);
        }
        adresses_to_committed_numbers[msg.sender] = hash;
        uint256 new_number_of_participants = committed.push(msg.sender);
        if (current_phase == Phase.Commit && new_number_of_participants == 30) {
            // Automatically go to commit and ready to reveal phase
            current_phase = Phase.CommitAndReadyForReveal;
            current_timestamps.commit_and_ready_for_reveal = now;
        }
        emit NewCommit(hash);
        return hash;
    }
    
    function abortCommitPhase() public {
        require(current_phase == Phase.Commit || current_phase == Phase.CommitAndReadyForReveal);
        require((now - current_timestamps.commit_and_ready_for_reveal) < TIME_TO_ABORT);
        current_phase = Phase.Commit;
        current_timestamps = TimeStamps(0, 0, 0, 0);
    }
    
    function goToRevealPhase() public {
        require(current_phase == Phase.CommitAndReadyForReveal);
        require(adresses_to_committed_numbers[msg.sender].length != 0);
        require((now - current_timestamps.commit_and_ready_for_reveal) >= TIME_TO_GO_TO_REVEAL_PHASE);
        current_phase = Phase.Reveal;
        current_timestamps.reveal = now;
    }
    
    function reveal(uint8 firstNumber, uint8 secondNumber) public {
        require(adresses_to_committed_numbers[msg.sender].length != 0);
        require(current_phase == Phase.Reveal);
        require((now - current_timestamps.reveal) < TIME_TO_REVEAL);
        bytes memory input = mergeBytes(toBytes(firstNumber), toBytes(secondNumber), abi.encodePacked(msg.sender));
        bytes32 hash = sha256(input);
        assert(adresses_to_committed_numbers[msg.sender] == hash);
        revealed_numbers_to_addresses[firstNumber][secondNumber].push(msg.sender);
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
    
    function toBytes(uint256 x) private pure returns (bytes memory b) {
        b = new bytes(32);
        assembly { mstore(add(b, 32), x) }
    }
}
    