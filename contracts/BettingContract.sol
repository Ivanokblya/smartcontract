// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BettingContract {
    enum BetOption { None, Yes, No }

    struct Bet {
        address bettor;
        BetOption option;
    }
// Дополняем BettingContract

string public channelUrl;
uint256 public betOdds;

constructor(uint256 _targetSubscribers, uint256 _durationMinutes, string memory _channelUrl, uint256 _betOdds) {
    owner = msg.sender;
    targetSubscribers = _targetSubscribers;
    deadline = block.timestamp + (_durationMinutes * 1 minutes);
    channelUrl = _channelUrl;
    betOdds = _betOdds;
}

function getBetInfo() external view returns (string memory, uint256, uint256, uint256) {
    return (channelUrl, targetSubscribers, deadline, betOdds);
}

    address public owner;
    uint256 public targetSubscribers;
    uint256 public deadline;
    string public channelId;
    bool public oracleCalled = false;
    uint256 public finalSubscribers;

    mapping(address => Bet) public bets;
    address[] public yesBettors;
    address[] public noBettors;

    uint256 public constant betAmount = 0.01 ether;

    constructor(
        uint256 _targetSubscribers,
        uint256 _durationMinutes,
        string memory _channelId
    ) {
        owner = msg.sender;
        targetSubscribers = _targetSubscribers;
        deadline = block.timestamp + (_durationMinutes * 1 minutes);
        channelId = _channelId;
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

        bets[msg.sender].option = BetOption.None;

        uint256 totalPool = address(this).balance + betAmount;
        uint256 winners = (finalSubscribers >= targetSubscribers) ? yesBettors.length : noBettors.length;
        uint256 reward = totalPool / winners;

        payable(msg.sender).transfer(reward);
    }

    // Helper views
    function getYesBettors() external view returns (address[] memory) {
        return yesBettors;
    }

    function getNoBettors() external view returns (address[] memory) {
        return noBettors;
    }

    function getSummary() external view returns (
        string memory, uint256, uint256, uint256, uint256
    ) {
        return (
            channelId,
            targetSubscribers,
            deadline,
            yesBettors.length,
            noBettors.length
        );
    }
}
