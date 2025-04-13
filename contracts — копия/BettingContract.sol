// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BettingContract {
    enum BetOption { None, Yes, No }

    struct Bet {
        address bettor;
        BetOption option;
    }

    address public owner;
    uint256 public targetSubscribers;
    uint256 public deadline;
    bool public oracleCalled = false;
    uint256 public finalSubscribers;

    mapping(address => Bet) public bets;
    address[] public yesBettors;
    address[] public noBettors;

    uint256 public constant betAmount = 0.01 ether;

    constructor(uint256 _targetSubscribers, uint256 _durationMinutes) {
        owner = msg.sender;
        targetSubscribers = _targetSubscribers;
        deadline = block.timestamp + (_durationMinutes * 1 minutes);
    }

    function placeBet(bool _predictsYes) external payable {
        require(block.timestamp < deadline, "Betting period is over");
        require(msg.value == betAmount, "Incorrect bet amount");
        require(bets[msg.sender].option == BetOption.None, "Already placed a bet");

        BetOption option = _predictsYes ? BetOption.Yes : BetOption.No;
        bets[msg.sender] = Bet(msg.sender, option);

        if (option == BetOption.Yes) {
            yesBettors.push(msg.sender);
        } else {
            noBettors.push(msg.sender);
        }
    }

    function submitResult(uint256 _subscribers) external {
        require(msg.sender == owner, "Only oracle (owner) can call this");
        require(block.timestamp >= deadline, "Betting still ongoing");
        require(!oracleCalled, "Result already submitted");

        oracleCalled = true;
        finalSubscribers = _subscribers;
    }

    function claimReward() external {
        require(oracleCalled, "Result not available");
        Bet memory bet = bets[msg.sender];
        require(bet.option != BetOption.None, "No bet found");

        bool won = (finalSubscribers >= targetSubscribers && bet.option == BetOption.Yes) ||
                   (finalSubscribers < targetSubscribers && bet.option == BetOption.No);
        require(won, "You lost the bet");

        bets[msg.sender].option = BetOption.None; // prevent double claim

        uint256 totalPool = address(this).balance + betAmount; // betAmount was already deducted
        uint256 winners = (finalSubscribers >= targetSubscribers) ? yesBettors.length : noBettors.length;
        uint256 reward = totalPool / winners;

        payable(msg.sender).transfer(reward);
    }

    // Helper view functions
    function getYesBettors() external view returns (address[] memory) {
        return yesBettors;
    }

    function getNoBettors() external view returns (address[] memory) {
        return noBettors;
    }
}
