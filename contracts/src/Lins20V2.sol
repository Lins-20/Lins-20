// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IEthscription.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

/**
 * @title Lins20
 * @dev Lins20 is a ERC20 token with inscription.
 * seperate mint pause & transfer pause
 */
contract Lins20V2 is PausableUpgradeable, Ownable2StepUpgradeable, IEthscription, ERC20Upgradeable {
    uint256 public limit;     // limit per mint
    uint256 public burnsRate; // transfer burns rate 10000 = 100%
    uint256 public fee;       // fee
    uint256 public maxMint;   // max mint， total supply
    string public tick;       // inscription tick
    uint256 public maxMintTimes; // max mint times size for each account
    mapping(address => uint16) public mintTimes; // mint times of each address

    uint256 public current = 0; // current mint
    string public _mintInscription = ""; // mint inscription
    bool public transferPaused; // transfer pause status
    address public origin; // the origin inscription address
    address public market; // the market address

    event InscribeMint(address indexed from, string content);
    event InscribeTransfer(address indexed from, string content);

    /**
     * @dev Emitted when the transfer pause is triggered by `account`.
     */
    event PausedTransfer(address account);

    /**
     * @dev Emitted when the transfer unpause is lifted by `account`.
     */
    event UnpausedTransfer(address account);

    modifier notContract() {
        require(tx.origin == msg.sender);
        _;
    }

    function initialize(
         string memory _tick,
         uint256 _limit,
         uint256 _maxMint,
         uint256 _burnsRate,
         uint256 _fee
    ) public initializer {
        __Pausable_init();
        __Ownable_init(tx.origin);
        __ERC20_init(string.concat("inscription ", tick) , _tick);

        require(_limit != 0, "limit incorrect");
        require(_maxMint != 0, "maxMint incorrect");
        require(_burnsRate < 10000, "burns out of range");
        require(_maxMint % _limit == 0, "limit incorrect");

        maxMintTimes = 50;
        tick = _tick;
        limit = _limit;
        maxMint = _maxMint;
        burnsRate = _burnsRate;
        fee = _fee;
        _mintInscription = string.concat('data:,{"p":"lins20","op":"mint","tick":"', tick, '","amt":"', Strings.toString(_limit/(10 ** decimals())), '"}');
    }

    receive() external payable {
        _doMint();
    }

    function mint() external payable {
        _doMint();
    }

    function mintV2(string memory content)  external payable {
        require(Strings.equal(content, _mintInscription), "inscription incorrect");
        _doMint();
    }

    function _doMint() internal whenNotPaused notContract {
        require(msg.value >= fee, "fee not enough");
        require(limit + current <= maxMint, "mint over");
        require(mintTimes[msg.sender] < maxMintTimes, "max mint times reached");

        _mint(msg.sender, limit);
        current += limit;
        mintTimes[msg.sender] += 1;
        emit InscribeMint(msg.sender, _mintInscription);
        emit ethscriptions_protocol_CreateEthscription(msg.sender, _mintInscription);
    }

    function transfer(address to, uint256 amount) public override whenTransferNotPaused returns (bool) {
        require(balanceOf(msg.sender) >= amount, "insufficient balance");

        if(msg.sender == market) {
            return _insTransfer(msg.sender, to, amount);
        }

        uint256 destory = 0;
        if(burnsRate != 0) {
            destory = Math.mulDiv(amount, burnsRate, 10000);
        }
        if(destory != 0) {
            _burn(msg.sender, destory);
        }
        return _insTransfer(msg.sender, to, amount - destory);
    }

    function transferFrom(address from, address to, uint256 amount) public override whenTransferNotPaused returns (bool) {
        if(msg.sender == market) {
            return super.transferFrom(from, to, amount);
        }
        uint256 destory = 0;
        if(burnsRate != 0) {
            destory = Math.mulDiv(amount, burnsRate, 10000);
        }
        if(destory != 0) {
            _burn(msg.sender, destory);
        }
        super.transferFrom(from, to, amount - destory);
        return true;
    }

    function marketTransaction(address to, uint256 amount) public whenTransferNotPaused returns (bool) {
        require(msg.sender == market);
        uint256 destory = 0;
        if(burnsRate != 0) {
            destory = Math.mulDiv(amount, burnsRate, 10000);
        }
        if(destory != 0) {
            _burn(msg.sender, destory);
        }
        return _insTransfer(msg.sender, to, amount - destory);
    }

    function _insTransfer(address from, address to, uint256 amount) internal returns (bool) {
        _transfer(from, to, amount);

        uint256 denominator = 10 ** decimals();
        uint256 fraction = amount % denominator;
        uint256 integer  = amount / denominator;
        string memory value = Strings.toString(integer);
        if(fraction != 0) {
           fraction = fraction / (10 ** (decimals() - 4));
           value = string.concat(value, ".", Strings.toString(fraction));
        }
        string memory ins = string.concat('data:,{"p":"lins20","op":"transfer","tick":"', tick, '","amt":"', value, '","to":"', Strings.toHexString(to), '"}');
        emit InscribeTransfer(from, ins);
        emit ethscriptions_protocol_TransferEthscriptionForPreviousOwner(from, to, bytes32(abi.encodePacked(tick)));
        return true;
    }

    function setMarket(address addr) public onlyOwner {
        market = addr;
    }

    function setMaxMintTimes(uint256 times) public onlyOwner {
        maxMintTimes = times;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setOrigin(address addr) public onlyOwner {
        origin = addr;
    }

    function _recover(address addr) internal onlyOwner {
        if(balanceOf(addr) != 0) return;

        uint256 amt = IERC20(origin).balanceOf(addr);
        if(amt == 0) return;

        _mint(addr, amt);
        current += amt;
        emit InscribeMint(addr, _mintInscription);
        emit ethscriptions_protocol_CreateEthscription(addr, _mintInscription);
    }

    function recover(address[] calldata addresss) public onlyOwner {
        require(origin != address(0), "origin inscription address empty");
        for (uint i = 0; i < addresss.length; i++) {
            _recover(addresss[i]);
        }
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

    modifier whenTransferNotPaused() {
        require(!transferPaused, "transfer paused");
        _;
    }

    /**
     * pause transfer
     */
    function pauseTransfer() external onlyOwner {
        require(!transferPaused);
        transferPaused = true;
        emit PausedTransfer(_msgSender());
    }

    /**
     * unpause transfer
     */
    function unpauseTransfer() external onlyOwner {
        require(transferPaused);
        transferPaused = false;
        emit UnpausedTransfer(_msgSender());
    }
}
