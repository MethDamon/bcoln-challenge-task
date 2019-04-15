pragma solidity ^0.5.7;

contract DLottery {
    
    uint256 constant ENTRY_FEE = 3000;
    
    address[] committed;
    address[] revealed;
    mapping(address => bytes32) adresses_to_committed_numbers;
    mapping(uint8 => address[]) revealed_numbers_to_addresses;
    
    enum Phase { Commit, CommitAndReadyForReveal, Reveal, Payout }
    Phase current_phase;
    
    // time stamps of when the phases were entered
    struct TimeStamps {
        uint256 commit;
        uint256 commit_and_ready_for_reveal;
        uint256 reveal;
        uint256 payout;
    }
    
    TimeStamps current_timestamps;
    
    constructor() public {
        current_phase = Phase.Commit;
        current_timestamps = TimeStamps(0, 0, 0, 0);
        current_timestamps.commit = now;
    }
    
    function commit(bytes32 hash) payable public {
        require(msg.value == ENTRY_FEE);
        require(current_phase == Phase.Commit || current_phase == Phase.CommitAndReadyForReveal);
        if (current_phase == Phase.CommitAndReadyForReveal) {
            require((now - current_timestamps.commit_and_ready_for_reveal) < 30 * 60 * 1000); // 30 minutes
        }
        adresses_to_committed_numbers[msg.sender] = hash;
        uint256 new_number_of_participants = committed.push(msg.sender);
        if (current_phase == Phase.Commit && new_number_of_participants == 30) {
            // Automatically go to commit and ready to reveal phase
            current_phase = Phase.CommitAndReadyForReveal;
            current_timestamps.commit_and_ready_for_reveal = now;
        }
    }
    
    function abortCommitPhase() public {
        require(current_phase == Phase.Commit || current_phase == Phase.CommitAndReadyForReveal);
        require((now - current_timestamps.commit_and_ready_for_reveal) < 3 * 60 * 60 * 1000); // 3 hours
        current_phase = Phase.Commit;
        current_timestamps = TimeStamps(0, 0, 0, 0);
    }
    
    function goToRevealPhase() public {
        require(current_phase == Phase.CommitAndReadyForReveal);
        require(adresses_to_committed_numbers[msg.sender] != 0);
        require((now - current_timestamps.commit_and_ready_for_reveal) >= 30 * 60 * 1000); // 30 minutes
        current_phase = Phase.Reveal;
        current_timestamps.reveal = now;
    }
    
    function reveal(uint8 firstNumber, uint8 secondNumber) public {
        require(adresses_to_committed_numbers[msg.sender] != 0);
        require(current_phase == Phase.Reveal);
        require((now - current_timestamps.reveal) < 30 * 60 * 1000); // 30 minutes
        bytes memory input = mergeBytes(toBytes(firstNumber), toBytes(secondNumber), abi.encodePacked(msg.sender));
        bytes32 hash = sha256(input);
        require(adresses_to_committed_numbers[msg.sender] == hash);
    }
    
    function mergeBytes(bytes memory param1, bytes memory param2, bytes memory param3) private returns (bytes memory) {
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
    
    function toBytes(uint256 x) private returns (bytes memory b) {
        b = new bytes(32);
        assembly { mstore(add(b, 32), x) }
    }
}
    