// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "./EventfulMarket.sol";

contract Market is Initializable, EventfulMarket, PausableUpgradeable, Ownable2StepUpgradeable, UUPSUpgradeable {

    uint public last_offer_id = 0;

    mapping (uint256 => OfferInfo) public offers;

    bool locked = false;

    uint256 public feeRate; // rate 10000 = 100%

    struct OfferInfo {
        uint256     pay_amt;
        ERC20       pay_gem;
        uint256     buy_amt;
        address     owner;
    }

    modifier synchronized {
        require(!locked);
        locked = true;
        _;
        locked = false;
    }

    function initialize(uint256 _feeRate) public initializer {
        __Ownable_init(tx.origin);
        feeRate = _feeRate;
    }

    function getOwner(uint id) public view returns (address owner) {
        return offers[id].owner;
    }

    function getOffer(uint id) public view returns (uint, ERC20, uint, address) {
        OfferInfo memory offer = offers[id];
        return (offer.pay_amt, offer.pay_gem, offer.buy_amt, offer.owner);
    }

    function buy(uint id) public synchronized payable returns (bool success) {
        OfferInfo memory offer = offers[id];
        uint256 spend = msg.value;
        require(spend == offer.buy_amt, "Not enough ETH sent");
        uint256 fee = Math.mulDiv(spend, feeRate, 10000);
        payable(offer.owner).transfer(spend - fee);
        safeTransfer(offer.pay_gem, msg.sender, offer.pay_amt);
        emit LogTake(
            id,
            offer.owner,
            offer.pay_gem,
            msg.sender,
            offer.pay_amt,
            offer.buy_amt
        );
        delete offers[id];
        success = true;
    }

    // Cancel an offer. Refunds offer maker.
    function cancel(uint id) public synchronized returns (bool success) {
        require(getOwner(id) == msg.sender);
        OfferInfo memory offer = offers[id];
        safeTransfer(offer.pay_gem, offer.owner, offer.pay_amt);
        emit LogKill(
            id,
            offer.owner,
            offer.pay_gem,
            offer.pay_amt,
            offer.buy_amt
        );
        delete offers[id];
        success = true;
    }

    function make(uint pay_amt, ERC20 pay_gem, uint buy_amt) public synchronized returns (uint id) {
        require(pay_amt > 0);
        require(address(pay_gem) != address(0), "pay_gem address cannot be 0");
        require(buy_amt > 0);

        OfferInfo memory info;
        info.pay_amt = pay_amt;
        info.pay_gem = pay_gem;
        info.buy_amt = buy_amt;
        info.owner = msg.sender;
        id = _next_id();
        offers[id] = info;

        safeTransferFrom(pay_gem, msg.sender, address(this), pay_amt);

        emit LogMake(
            id,
            msg.sender,
            pay_gem,
            pay_amt,
            buy_amt
        );
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _next_id() internal returns (uint) {
        last_offer_id++;
        return last_offer_id;
    }

    function safeTransfer(ERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(ERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    function _callOptionalReturn(ERC20 token, bytes memory data) private {
        uint256 size;
        assembly { size := extcodesize(token) }
        require(size > 0, "Not a contract");

        (bool success, bytes memory returndata) = address(token).call(data);
        require(success, "Token call failed");
        if (returndata.length > 0) { // Return data is optional
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
    
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

}
