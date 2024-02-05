// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";

/**
 * @title Lins20
 * @dev Lins20 is a ERC20 token with inscription.
 */
contract Lins20Proxy is ERC1967Proxy {
    constructor(address impl, bytes memory _data) ERC1967Proxy(impl, _data) {
        ERC1967Utils.changeAdmin(tx.origin);
    }

    function getAdmin() internal view returns (address) {
        return ERC1967Utils.getAdmin();
    }

    modifier onlyAdmin() {
        require(msg.sender == getAdmin(), "ProxyAdmin: caller is not the admin");
        _;
    }

    function upgradeToAndCall(
        address newImplementation,
        bytes memory data
    ) public onlyAdmin {
        ERC1967Utils.upgradeToAndCall(newImplementation, data);
    }

    function getImplementation() public view returns (address) {
        return ERC1967Utils.getImplementation();
    }

    receive() external payable {}
}
