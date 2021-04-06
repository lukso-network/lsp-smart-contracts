// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

// modules
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725Y.sol";
import "./ERC777-UniversalReceiver.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";


contract LSP4DigitalCertificate is Pausable, ERC725Y, ERC777UniversalReceiver {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Here to track token holders, for future migration TODO remove in main chain
    // makes transfers to expensive
    EnumerableSet.AddressSet internal tokenHolders;
    bytes32[] public dataKeys;
    address public minter;


    constructor(
        address newOwner,
        string memory name,
        string memory symbol,
        address[] memory defaultOperators
    )
    ERC725Y(newOwner)
    ERC777UniversalReceiver(name, symbol, defaultOperators)
    public {
        // set the owner as minter
        minter = newOwner;
    }

    /* non-standard public functions */

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function mint(address _address, uint256 _amount)
    external
    override
    onlyMinter
    {
        tokenHolders.add(_address);

        _mint(_address, _amount, "", "");
    }

    function removeMinter()
    external
    onlyMinter
    {
        minter = address(0);
    }

    // Stops account recovery possibility
    function removeDefaultOperators()
    external
    onlyDefaultOperators
    {
        for (uint256 i = 0; i < _defaultOperatorsArray.length; i++) {
            _defaultOperators[_defaultOperatorsArray[i]] = false;
        }
        delete _defaultOperatorsArray;
    }

    // Here to track allow future migration TODO remove in main chain
    function pause()
    external
    whenNotPaused
    onlyDefaultOperators
    {
        _pause();
    }

    // Here to track allow future migration TODO remove in main chain
    function unpause()
    external
    whenPaused
    onlyDefaultOperators
    {
        _unpause();
    }

    function dataCount() public view returns (uint256) {
        return dataKeys.length;
    }

    function allDataKeys() public view returns (bytes32[] memory) {
        return dataKeys;
    }

    // returns the bytes32 of all token holder addresses
    function allTokenHolders() public view returns (bytes32[] memory) {
        return tokenHolders._inner._values;
    }



    /* Public functions */

    function setData(bytes32 _key, bytes memory _value)
    external
    override
    onlyOwner
    {
        if(store[_key].length == 0) {
            dataKeys.push(_key); // 30k more gas on initial set
        }
        store[_key] = _value;
        emit DataChanged(_key, _value);
    }


    /* Internal functions */

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner)
    public
    override
    onlyOwner
    {
        Ownable.transferOwnership(newOwner);

        // also set new minter, if it was not removed before
        if(minter != address(0)) {
            minter = newOwner;
        }
    }

    function _move(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    )
    internal
    override
    whenNotPaused
    {

        tokenHolders.add(to);

        ERC777UniversalReceiver._move(operator, from, to, amount, userData, operatorData);
    }


    /* Modifers */
    modifier onlyDefaultOperators() {
        require(_defaultOperators[_msgSender()], 'Only default operators can call this function');
        _;
    }

    modifier onlyMinter() {
        require(_msgSender() == minter, 'Only minter can call this function');
        _;
    }
}
