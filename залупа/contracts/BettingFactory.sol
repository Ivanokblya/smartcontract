// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BettingContract.sol";

contract BettingFactory {
    address[] public allBets;

    event BetCreated(address betAddress, uint256 target, uint256 deadline);

    function createBet(uint256 target, uint256 durationMinutes) external {
        BettingContract newBet = new BettingContract(target, durationMinutes);
        allBets.push(address(newBet));
        emit BetCreated(address(newBet), target, block.timestamp + durationMinutes * 60);
    }

    function getAllBets() external view returns (address[] memory) {
        return allBets;
    }
}
