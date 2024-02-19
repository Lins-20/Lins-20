pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EventfulMarket {
    event LogMake(
        uint256  indexed  id,
        address  indexed  maker,
        ERC20             pay_gem,
        uint256           pay_amt,
        uint256           buy_amt
    );

    event LogTake(
        uint256           id,
        address  indexed  maker,
        ERC20             pay_gem,
        address  indexed  taker,
        uint256           pay_amt,
        uint256           buy_amt
    );

    event LogKill(
        uint256  indexed  id,
        address  indexed  maker,
        ERC20             pay_gem,
        uint256           pay_amt,
        uint256           buy_amt
    );
}
