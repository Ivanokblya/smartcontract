// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BettingContract.sol";

contract BettingFactory {
    address[] public allBets;

    event BetCreated(address betAddress, uint256 target, uint256 deadline, string channelId);

    function createBet(uint256 target, uint256 durationMinutes, string memory channelId) external {
        BettingContract newBet = new BettingContract(target, durationMinutes, channelId);
        allBets.push(address(newBet));
        emit BetCreated(address(newBet), target, block.timestamp + durationMinutes * 60, channelId);
    }

    function getAllBets() external view returns (address[] memory) {
        return allBets;
    }
}
