// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {
    LSP7DigitalAssetInitAbstract
} from "../LSP7DigitalAssetInitAbstract.sol";
import {
    _TYPEID_LSP7_VOTESDELEGATOR,
    _TYPEID_LSP7_VOTESDELEGATEE
} from "./LSP7VotesConstants.sol";

import {LSP1Utils} from "@lukso/lsp1-contracts/contracts/LSP1Utils.sol";
import {IERC5805} from "@openzeppelin/contracts/interfaces/IERC5805.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {
    EIP712Upgradeable
} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @dev Extension of LSP7 to support Compound-like voting and delegation. This version is more generic than Compound's,
 * and supports token supply up to 2^224^ - 1, while COMP is limited to 2^96^ - 1.
 *
 * This extension keeps a history (checkpoints) of each account's vote power. Vote power can be delegated either
 * by calling the {delegate} function directly, or by providing a signature to be used with {delegateBySig}. Voting
 * power can be queried through the public accessors {getVotes} and {getPastVotes}.
 *
 * By default, token balance does not account for voting power. This makes transfers cheaper. The downside is that it
 * requires users to delegate to themselves in order to activate checkpoints and have their voting power tracked.
 */
abstract contract LSP7VotesInitAbstract is
    LSP7DigitalAssetInitAbstract,
    EIP712Upgradeable,
    IERC5805
{
    using Counters for Counters.Counter;
    mapping(address => Counters.Counter) private _nonces;

    struct Checkpoint {
        uint32 fromBlock;
        uint224 votes;
    }

    bytes32 internal constant _DELEGATION_TYPEHASH =
        keccak256("Delegation(address delegatee,uint256 nonce,uint256 expiry)");

    mapping(address => address) private _delegates;
    mapping(address => Checkpoint[]) private _checkpoints;
    Checkpoint[] private _totalSupplyCheckpoints;

    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        string memory version_
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __EIP712_init(name_, version_);
    }

    /**
     * @dev Clock used for flagging checkpoints. Can be overridden to implement timestamp based checkpoints (and voting).
     */
    function clock() public view virtual override returns (uint48) {
        return SafeCast.toUint48(block.number);
    }

    /**
     * @dev Description of the clock
     */
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public view virtual override returns (string memory) {
        // Check that the clock was not modified
        require(clock() == block.number, "LSP7Votes: broken clock mode");
        return "mode=blocknumber&from=default";
    }

    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @dev Get the `pos`-th checkpoint for `account`.
     */
    function checkpoints(
        address account,
        uint32 pos
    ) public view virtual returns (Checkpoint memory) {
        return _checkpoints[account][pos];
    }

    /**
     * @dev Get number of checkpoints for `account`.
     */
    function numCheckpoints(
        address account
    ) public view virtual returns (uint32) {
        return SafeCast.toUint32(_checkpoints[account].length);
    }

    /**
     * @dev Get the address `account` is currently delegating to.
     */
    function delegates(
        address account
    ) public view virtual override returns (address) {
        return _delegates[account];
    }

    /**
     * @dev Gets the current votes balance for `account`
     */
    function getVotes(
        address account
    ) public view virtual override returns (uint256) {
        uint256 pos = _checkpoints[account].length;
        unchecked {
            return pos == 0 ? 0 : _checkpoints[account][pos - 1].votes;
        }
    }

    /**
     * @dev Retrieve the number of votes for `account` at the end of `timepoint`.
     *
     * @custom:requirements
     * - `timepoint` must be in the past
     */
    function getPastVotes(
        address account,
        uint256 timepoint
    ) public view virtual override returns (uint256) {
        require(timepoint < clock(), "LSP7Votes: future lookup");
        return _checkpointsLookup(_checkpoints[account], timepoint);
    }

    /**
     * @dev Retrieve the `totalSupply` at the end of `timepoint`. Note, this value is the sum of all balances.
     * It is NOT the sum of all the delegated votes!
     *
     * @custom:requirements
     * - `timepoint` must be in the past
     */
    function getPastTotalSupply(
        uint256 timepoint
    ) public view virtual override returns (uint256) {
        require(timepoint < clock(), "LSP7Votes: future lookup");
        return _checkpointsLookup(_totalSupplyCheckpoints, timepoint);
    }

    /**
     * @dev Lookup a value in a list of (sorted) checkpoints.
     */
    function _checkpointsLookup(
        Checkpoint[] storage ckpts,
        uint256 timepoint
    ) private view returns (uint256) {
        // We run a binary search to look for the last (most recent) checkpoint taken before (or at) `timepoint`.
        //
        // Initially we check if the block is recent to narrow the search range.
        // During the loop, the index of the wanted checkpoint remains in the range [low-1, high).
        // With each iteration, either `low` or `high` is moved towards the middle of the range to maintain the invariant.
        // - If the middle checkpoint is after `timepoint`, we look in [low, mid)
        // - If the middle checkpoint is before or equal to `timepoint`, we look in [mid+1, high)
        // Once we reach a single value (when low == high), we've found the right checkpoint at the index high-1, if not
        // out of bounds (in which case we're looking too far in the past and the result is 0).
        // Note that if the latest checkpoint available is exactly for `timepoint`, we end up with an index that is
        // past the end of the array, so we technically don't find a checkpoint after `timepoint`, but it works out
        // the same.
        uint256 length = ckpts.length;

        uint256 low = 0;
        uint256 high = length;

        if (length > 5) {
            uint256 mid = length - Math.sqrt(length);
            if (_unsafeAccess(ckpts, mid).fromBlock > timepoint) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (_unsafeAccess(ckpts, mid).fromBlock > timepoint) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        unchecked {
            return high == 0 ? 0 : _unsafeAccess(ckpts, high - 1).votes;
        }
    }

    /**
     * @dev Delegate votes from the sender to `delegatee`.
     */
    function delegate(address delegatee) public virtual override {
        _delegate(msg.sender, delegatee);
    }

    /**
     * @dev Delegates votes from signer to `delegatee`
     */
    function delegateBySig(
        address delegatee,
        uint256 nonce,
        uint256 expiry,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual override {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp <= expiry, "LSP7Votes: signature expired");
        address signer = ECDSA.recover(
            _hashTypedDataV4(
                keccak256(
                    abi.encode(_DELEGATION_TYPEHASH, delegatee, nonce, expiry)
                )
            ),
            v,
            r,
            s
        );
        require(nonce == _useNonce(signer), "LSP7Votes: invalid nonce");
        _delegate(signer, delegatee);
    }

    /**
     * @dev Maximum token supply. Defaults to `type(uint224).max` (2^224^ - 1).
     */
    function _maxSupply() internal view virtual returns (uint224) {
        return type(uint224).max;
    }

    /**
     * @dev Transfers, mints, or burns voting units. To register a mint, `from` should be zero. To register a burn, `to`
     * should be zero. Total supply of voting units will be adjusted with mints and burns.
     */
    function _transferVotingUnits(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        if (from == address(0)) {
            _writeCheckpoint(_totalSupplyCheckpoints, _add, amount);
        }
        if (to == address(0)) {
            _writeCheckpoint(_totalSupplyCheckpoints, _subtract, amount);
        }
        _moveVotingPower(delegates(from), delegates(to), amount);
    }

    /**
     * @dev Move voting power when tokens are transferred.
     *
     * @custom:events
     * - {DelegateVotesChanged} when voting power is removed from source address
     * - {DelegateVotesChanged} when voting power is added to destination address
     */
    function _update(
        address from,
        address to,
        uint256 value,
        bool force,
        bytes memory data
    ) internal virtual override {
        super._update(from, to, value, force, data);
        if (from == address(0)) {
            uint256 supply = totalSupply();
            uint256 cap = _maxSupply();
            require(
                supply <= cap,
                "LSP7Votes: total supply risks overflowing votes"
            );
        }
        _transferVotingUnits(from, to, value);
    }

    /**
     * @dev Change delegation for `delegator` to `delegatee`.
     *
     * @custom:events
     * - {DelegateChanged}
     * - {DelegateVotesChanged}
     */
    function _delegate(address delegator, address delegatee) internal virtual {
        address currentDelegate = delegates(delegator);
        uint256 delegatorBalance = balanceOf(delegator);
        _delegates[delegator] = delegatee;

        emit DelegateChanged(delegator, currentDelegate, delegatee);

        _moveVotingPower(currentDelegate, delegatee, delegatorBalance);

        // Notify the delegator if it's not address(0)
        if (delegator != address(0)) {
            bytes memory delegatorNotificationData = abi.encode(
                msg.sender,
                delegatee,
                delegatorBalance
            );
            LSP1Utils.notifyUniversalReceiver(
                delegator,
                _TYPEID_LSP7_VOTESDELEGATOR,
                delegatorNotificationData
            );
        }

        // Only notify the new delegatee if it's not address(0) and if there's actual voting power
        if (delegatee != address(0) && delegatorBalance > 0) {
            bytes memory delegateeNotificationData = abi.encode(
                msg.sender,
                delegator,
                delegatorBalance
            );

            LSP1Utils.notifyUniversalReceiver(
                delegatee,
                _TYPEID_LSP7_VOTESDELEGATEE,
                delegateeNotificationData
            );
        }
    }

    /**
     * @dev Moves voting power from one address to another.
     *
     * @custom:events
     * - {DelegateVotesChanged} when voting power is removed from source address
     * - {DelegateVotesChanged} when voting power is added to destination address
     */
    function _moveVotingPower(
        address src,
        address dst,
        uint256 amount
    ) private {
        if (src != dst && amount > 0) {
            if (src != address(0)) {
                (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(
                    _checkpoints[src],
                    _subtract,
                    amount
                );
                emit DelegateVotesChanged(src, oldWeight, newWeight);
            }

            if (dst != address(0)) {
                (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(
                    _checkpoints[dst],
                    _add,
                    amount
                );
                emit DelegateVotesChanged(dst, oldWeight, newWeight);
            }
        }
    }

    function _writeCheckpoint(
        Checkpoint[] storage ckpts,
        function(uint256, uint256) view returns (uint256) op,
        uint256 delta
    ) private returns (uint256 oldWeight, uint256 newWeight) {
        uint256 pos = ckpts.length;

        unchecked {
            Checkpoint memory oldCkpt = pos == 0
                ? Checkpoint(0, 0)
                : _unsafeAccess(ckpts, pos - 1);

            oldWeight = oldCkpt.votes;
            newWeight = op(oldWeight, delta);

            if (pos > 0 && oldCkpt.fromBlock == clock()) {
                _unsafeAccess(ckpts, pos - 1).votes = SafeCast.toUint224(
                    newWeight
                );
            } else {
                ckpts.push(
                    Checkpoint({
                        fromBlock: SafeCast.toUint32(clock()),
                        votes: SafeCast.toUint224(newWeight)
                    })
                );
            }
        }
    }

    function _add(uint256 a, uint256 b) private pure returns (uint256) {
        return a + b;
    }

    function _subtract(uint256 a, uint256 b) private pure returns (uint256) {
        return a - b;
    }

    /**
     * @dev Access an element of the array without performing bounds check. The position is assumed to be within bounds.
     */
    function _unsafeAccess(
        Checkpoint[] storage ckpts,
        uint256 pos
    ) private pure returns (Checkpoint storage result) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            mstore(0, ckpts.slot)
            result.slot := add(keccak256(0, 0x20), pos)
        }
    }

    /**
     * @dev Consumes a nonce.
     *
     * Returns the current value and increments nonce.
     */
    function _useNonce(
        address owner
    ) internal virtual returns (uint256 current) {
        Counters.Counter storage nonce = _nonces[owner];
        current = nonce.current();
        nonce.increment();
    }

    /**
     * @dev Reads the current nonce
     */
    function nonces(address owner) public view virtual returns (uint256) {
        return _nonces[owner].current();
    }
}
