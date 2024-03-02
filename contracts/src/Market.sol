// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "./EventfulMarket.sol";
import "./Lins20V2.sol";

contract Market is Initializable, EventfulMarket, PausableUpgradeable, Ownable2StepUpgradeable, UUPSUpgradeable {
    uint public last_offer_id;
    mapping (uint256 => OfferInfo) public offers;
    bool locked;
    uint256 public feeRate; // rate 10000 = 100%
    mapping (address => bool) public whiteList;

    struct OfferInfo {
        uint256     pay_amt;
        Lins20V2    pay_gem;
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
        last_offer_id = 0;
        locked = false;
    }

    function getOwner(uint id) public view returns (address owner) {
        return offers[id].owner;
    }

    function getOffer(uint id) public view returns (uint, Lins20V2, uint, address) {
        OfferInfo memory offer = offers[id];
        return (offer.pay_amt, offer.pay_gem, offer.buy_amt, offer.owner);
    }

    function buy(uint id) public synchronized payable returns (bool success) {
        OfferInfo memory offer = offers[id];
        uint256 spend = msg.value;
        require(spend == offer.buy_amt, "Not enough ETH sent");
        uint256 fee = Math.mulDiv(spend, feeRate, 10000);
        payable(offer.owner).transfer(spend - fee);
        offer.pay_gem.marketTransaction(msg.sender, offer.pay_amt);
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
        offer.pay_gem.transfer(offer.owner, offer.pay_amt);
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

    function make(uint pay_amt, Lins20V2 pay_gem, uint buy_amt) public synchronized returns (uint id) {
        require(whiteList[address(pay_gem)], "address illegal");
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

        pay_gem.transferFrom(msg.sender, address(this), pay_amt);

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

    function setFee(uint256 fee) public onlyOwner  {
        require(fee <= 10000, "lg 10000");
        feeRate = fee;
    }

    function addWhiteList(address addr) public onlyOwner {
        whiteList[addr] = true;
    }

    function rmWhiteList(address addr) public onlyOwner {
        whiteList[addr] = false;
    }

    /**
     * @notice Pause (admin only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause (admin only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

}
