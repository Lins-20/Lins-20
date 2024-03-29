// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./Lins20Proxy.sol";
import "./Lins20V2.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";


contract Lins20FactoryV2 is Initializable, PausableUpgradeable, Ownable2StepUpgradeable, UUPSUpgradeable {
    struct Parameters {
        string tick;         // inscription tick
        uint256 limit;       // limit per mint
        uint256 totalSupply; // total supply
        uint256 burnsRate;   // transfer burns rate  10000 = 100%
        uint256 fee;         // mint fee
    }
    Parameters public parameters;

    mapping(string => address) public inscriptions;
    event InscribeDeploy(address indexed from, string content);
    event AddInscription(address indexed from, string data);

    address public lins20Impl;
    Lins20V2 public deployPayToken;
    uint public deployFee;

    function initialize(address impl) public initializer {
        lins20Impl = impl;
        __Pausable_init();
        __Ownable_init(_msgSender());
        __UUPSUpgradeable_init();
    }

    function setLins20Impl(address addr) public onlyOwner {
        lins20Impl = addr;
    }

    function setDeployPayToken(Lins20V2 addr) public onlyOwner {
        deployPayToken = addr;
    }

    function setDeployFee(uint amount) public onlyOwner {
        deployFee = amount;
    }

    /*
     * create new inscription
     * @param tick inscription tick
     * @param limit Limit per mint
     * @param totalSupply Total supply
     * @param burnsRate transfer burns rate  10000 = 100%
     * @param fee Fee
     */
    function createLins20(
        string memory tick,
        uint256 limit,
        uint256 totalSupply,
        uint256 burnsRate,
        uint256 fee
    ) external whenNotPaused returns (address proxy) {
        require(burnsRate < 10000, "burns out of range");
        require(limit < totalSupply, "limit out of range");
        require(inscriptions[tick] == address(0), "tick exists");
        require(totalSupply % limit == 0, "limit incorrect");
        uint256 decimals = 10 ** 18;

        string memory data = string.concat('{"tick":"', tick, '","max":"', Strings.toString(totalSupply), '","lim":"', Strings.toString(limit), '","burns":"', Strings.toString(burnsRate), '","fee":"', Strings.toString(fee), '"}');
        emit AddInscription(msg.sender, data);

        if(deployFee > 0 && address(deployPayToken) != address(0) && msg.sender != owner()) {
            require(IERC20(deployPayToken).balanceOf(msg.sender) >= deployFee, "insufficient balance");
            deployPayToken.burn(msg.sender, deployFee);
        }

        bytes memory _data = abi.encodeWithSelector(Lins20V2.initialize.selector, tick, limit, totalSupply, burnsRate, fee);
        proxy = address(new Lins20Proxy{salt: keccak256(abi.encode(tick, limit, totalSupply, burnsRate, fee))}(lins20Impl, _data));

        inscriptions[tick] = proxy;
        string memory ins = string.concat('data:,{"p":"lins20","op":"deploy","tick":"', tick, '","max":"', Strings.toString(totalSupply / decimals), '","lim":"', Strings.toString(limit / decimals), '"}');
        emit InscribeDeploy(msg.sender, ins);
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
