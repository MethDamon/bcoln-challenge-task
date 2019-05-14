pragma solidity ^0.5.7;

import "solidity-bytes-utils/contracts/BytesLib.sol";

contract WinningNumbersGenerator {
    using BytesLib for bytes;
    bytes constant padding = hex"00000000000000000000000000000000000000000000000000000000000000";
    function generateWinningNumbers(bytes memory input) public view returns (uint8[2] memory winning_numbers) {
        bytes memory b1 = padding.concat(input.slice(0, 1));
        bytes memory b2 = padding.concat(input.slice(1, 2));
        uint8 first_winning_number = uint8(b1.toUint(0));
        uint8 second_winning_number = uint8(b2.toUint(0));
        first_winning_number = first_winning_number%16+1;
        second_winning_number = second_winning_number%16+1;
        if (first_winning_number == second_winning_number) {
            if (second_winning_number == 16) {
                second_winning_number = 1;
            } else{
                second_winning_number = second_winning_number+1;
            }
        }
        return [1, 2];
    }
}