// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Lins20V2.sol";


contract EventfulMarket {
    event LogMake(
        uint256  indexed  id,
        address  indexed  maker,
        Lins20V2          pay_gem,
        uint256           pay_amt,
        uint256           buy_amt
    );

    event LogTake(
        uint256           id,
        address  indexed  maker,
        Lins20V2          pay_gem,
        address  indexed  taker,
        uint256           pay_amt,
        uint256           buy_amt
    );

    event LogKill(
        uint256  indexed  id,
        address  indexed  maker,
        Lins20V2          pay_gem,
        uint256           pay_amt,
        uint256           buy_amt
    );
}
