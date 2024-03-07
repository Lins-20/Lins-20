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
    mapping(string => address) public inscriptions;
    event InscribeDeploy(address indexed from, string content);
    event AddInscription(address indexed from, string data);

    address public lins20Impl;

    function initialize(address impl) public initializer {
        lins20Impl = impl;
        __Pausable_init();
        __Ownable_init(_msgSender());
        __UUPSUpgradeable_init();
    }

    function setLins20Impl(address addr) public onlyOwner {
        lins20Impl = addr;
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
        uint256 fee,
        uint256 amount
    ) external whenNotPaused returns (address proxy) {
        require(burnsRate < 10000, "burns out of range");
        require(limit < totalSupply, "limit out of range");
        require(inscriptions[tick] == address(0), "tick exists");
        require(totalSupply % limit == 0, "limit incorrect");
        uint256 decimals = 10 ** 18;

        string memory data = string.concat('{"tick":"', tick, '","max":"', Strings.toString(totalSupply / decimals),
            '","lim":"', Strings.toString(limit), '","burns":"', Strings.toString(burnsRate), '","fee":"', Strings.toString(fee / decimals), '"}');
        emit AddInscription(msg.sender, data);

        require(amount >= 50000000000000000000000, "lins not enough");
        address linsAddress = 0x2566a15ac30899EE83FDB984C8D8BEe89988486C;
        IERC20(linsAddress).transfer(address(0), amount);

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
