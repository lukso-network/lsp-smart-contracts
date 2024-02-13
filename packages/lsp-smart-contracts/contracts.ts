export const ErrorSelectors = {
  LSP11BasicSocialRecovery: {
    /**
     * error AddressZeroNotAllowed()
     *
     * 0x0855380c = keccak256('AddressZeroNotAllowed()')
     */
    "0x0855380c": {
      sig: "AddressZeroNotAllowed()",
      inputs: [],
      name: "AddressZeroNotAllowed",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the address zero calls `recoverOwnership(..)` function",
        },
      ],
    },

    /**
     * error CallerIsNotGuardian(
     *  address caller
     * )
     *
     * 0x5560e16d = keccak256('CallerIsNotGuardian(address)')
     */
    "0x5560e16d": {
      sig: "CallerIsNotGuardian(address)",
      inputs: [{ internalType: "address", name: "caller", type: "address" }],
      name: "CallerIsNotGuardian",
      type: "error",
      devdoc: [{ details: "reverts when the caller is not a guardian" }],
    },

    /**
     * error GuardianAlreadyExist(
     *  address addressToAdd
     * )
     *
     * 0xd52858db = keccak256('GuardianAlreadyExist(address)')
     */
    "0xd52858db": {
      sig: "GuardianAlreadyExist(address)",
      inputs: [
        { internalType: "address", name: "addressToAdd", type: "address" },
      ],
      name: "GuardianAlreadyExist",
      type: "error",
      devdoc: [{ details: "reverts when adding an already existing guardian" }],
    },

    /**
     * error GuardianDoNotExist(
     *  address addressToRemove
     * )
     *
     * 0x3d8e524e = keccak256('GuardianDoNotExist(address)')
     */
    "0x3d8e524e": {
      sig: "GuardianDoNotExist(address)",
      inputs: [
        { internalType: "address", name: "addressToRemove", type: "address" },
      ],
      name: "GuardianDoNotExist",
      type: "error",
      devdoc: [{ details: "reverts when removing a non-existing guardian" }],
    },

    /**
     * error GuardiansNumberCannotGoBelowThreshold(
     *  uint256 guardianThreshold
     * )
     *
     * 0x27113777 = keccak256('GuardiansNumberCannotGoBelowThreshold(uint256)')
     */
    "0x27113777": {
      sig: "GuardiansNumberCannotGoBelowThreshold(uint256)",
      inputs: [
        { internalType: "uint256", name: "guardianThreshold", type: "uint256" },
      ],
      name: "GuardiansNumberCannotGoBelowThreshold",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when removing a guardian and the threshold is equal to the number of guardians",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },

    /**
     * error SecretHashCannotBeZero()
     *
     * 0x7f617002 = keccak256('SecretHashCannotBeZero()')
     */
    "0x7f617002": {
      sig: "SecretHashCannotBeZero()",
      inputs: [],
      name: "SecretHashCannotBeZero",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the secret hash provided is equal to bytes32(0)",
        },
      ],
    },

    /**
     * error ThresholdCannotBeHigherThanGuardiansNumber(
     *  uint256 thresholdGiven,
     *  uint256 guardianNumber
     * )
     *
     * 0xe3db80bd = keccak256('ThresholdCannotBeHigherThanGuardiansNumber(uint256,uint256)')
     */
    "0xe3db80bd": {
      sig: "ThresholdCannotBeHigherThanGuardiansNumber(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "thresholdGiven", type: "uint256" },
        { internalType: "uint256", name: "guardianNumber", type: "uint256" },
      ],
      name: "ThresholdCannotBeHigherThanGuardiansNumber",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when setting the guardians threshold to a number higher than the guardians number",
        },
      ],
    },

    /**
     * error ThresholdNotReachedForRecoverer(
     *  address recoverer,
     *  uint256 selections,
     *  uint256 guardiansThreshold
     * )
     *
     * 0xf78f0507 = keccak256('ThresholdNotReachedForRecoverer(address,uint256,uint256)')
     */
    "0xf78f0507": {
      sig: "ThresholdNotReachedForRecoverer(address,uint256,uint256)",
      inputs: [
        { internalType: "address", name: "recoverer", type: "address" },
        { internalType: "uint256", name: "selections", type: "uint256" },
        {
          internalType: "uint256",
          name: "guardiansThreshold",
          type: "uint256",
        },
      ],
      name: "ThresholdNotReachedForRecoverer",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when `recoverOwnership(..)` is called with a recoverer that didn't reach the guardians threshold",
          params: {
            guardiansThreshold: "The minimum number of selection needed",
            recoverer: "The address of the recoverer",
            selections: "The number of selections that the recoverer have",
          },
        },
      ],
    },

    /**
     * error WrongPlainSecret()
     *
     * 0x6fa723c3 = keccak256('WrongPlainSecret()')
     */
    "0x6fa723c3": {
      sig: "WrongPlainSecret()",
      inputs: [],
      name: "WrongPlainSecret",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the plain secret produce a different hash than the secret hash originally set",
        },
      ],
    },
  },
  LSP11BasicSocialRecoveryInit: {
    /**
     * error AddressZeroNotAllowed()
     *
     * 0x0855380c = keccak256('AddressZeroNotAllowed()')
     */
    "0x0855380c": {
      sig: "AddressZeroNotAllowed()",
      inputs: [],
      name: "AddressZeroNotAllowed",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the address zero calls `recoverOwnership(..)` function",
        },
      ],
    },

    /**
     * error CallerIsNotGuardian(
     *  address caller
     * )
     *
     * 0x5560e16d = keccak256('CallerIsNotGuardian(address)')
     */
    "0x5560e16d": {
      sig: "CallerIsNotGuardian(address)",
      inputs: [{ internalType: "address", name: "caller", type: "address" }],
      name: "CallerIsNotGuardian",
      type: "error",
      devdoc: [{ details: "reverts when the caller is not a guardian" }],
    },

    /**
     * error GuardianAlreadyExist(
     *  address addressToAdd
     * )
     *
     * 0xd52858db = keccak256('GuardianAlreadyExist(address)')
     */
    "0xd52858db": {
      sig: "GuardianAlreadyExist(address)",
      inputs: [
        { internalType: "address", name: "addressToAdd", type: "address" },
      ],
      name: "GuardianAlreadyExist",
      type: "error",
      devdoc: [{ details: "reverts when adding an already existing guardian" }],
    },

    /**
     * error GuardianDoNotExist(
     *  address addressToRemove
     * )
     *
     * 0x3d8e524e = keccak256('GuardianDoNotExist(address)')
     */
    "0x3d8e524e": {
      sig: "GuardianDoNotExist(address)",
      inputs: [
        { internalType: "address", name: "addressToRemove", type: "address" },
      ],
      name: "GuardianDoNotExist",
      type: "error",
      devdoc: [{ details: "reverts when removing a non-existing guardian" }],
    },

    /**
     * error GuardiansNumberCannotGoBelowThreshold(
     *  uint256 guardianThreshold
     * )
     *
     * 0x27113777 = keccak256('GuardiansNumberCannotGoBelowThreshold(uint256)')
     */
    "0x27113777": {
      sig: "GuardiansNumberCannotGoBelowThreshold(uint256)",
      inputs: [
        { internalType: "uint256", name: "guardianThreshold", type: "uint256" },
      ],
      name: "GuardiansNumberCannotGoBelowThreshold",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when removing a guardian and the threshold is equal to the number of guardians",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },

    /**
     * error SecretHashCannotBeZero()
     *
     * 0x7f617002 = keccak256('SecretHashCannotBeZero()')
     */
    "0x7f617002": {
      sig: "SecretHashCannotBeZero()",
      inputs: [],
      name: "SecretHashCannotBeZero",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the secret hash provided is equal to bytes32(0)",
        },
      ],
    },

    /**
     * error ThresholdCannotBeHigherThanGuardiansNumber(
     *  uint256 thresholdGiven,
     *  uint256 guardianNumber
     * )
     *
     * 0xe3db80bd = keccak256('ThresholdCannotBeHigherThanGuardiansNumber(uint256,uint256)')
     */
    "0xe3db80bd": {
      sig: "ThresholdCannotBeHigherThanGuardiansNumber(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "thresholdGiven", type: "uint256" },
        { internalType: "uint256", name: "guardianNumber", type: "uint256" },
      ],
      name: "ThresholdCannotBeHigherThanGuardiansNumber",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when setting the guardians threshold to a number higher than the guardians number",
        },
      ],
    },

    /**
     * error ThresholdNotReachedForRecoverer(
     *  address recoverer,
     *  uint256 selections,
     *  uint256 guardiansThreshold
     * )
     *
     * 0xf78f0507 = keccak256('ThresholdNotReachedForRecoverer(address,uint256,uint256)')
     */
    "0xf78f0507": {
      sig: "ThresholdNotReachedForRecoverer(address,uint256,uint256)",
      inputs: [
        { internalType: "address", name: "recoverer", type: "address" },
        { internalType: "uint256", name: "selections", type: "uint256" },
        {
          internalType: "uint256",
          name: "guardiansThreshold",
          type: "uint256",
        },
      ],
      name: "ThresholdNotReachedForRecoverer",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when `recoverOwnership(..)` is called with a recoverer that didn't reach the guardians threshold",
          params: {
            guardiansThreshold: "The minimum number of selection needed",
            recoverer: "The address of the recoverer",
            selections: "The number of selections that the recoverer have",
          },
        },
      ],
    },

    /**
     * error WrongPlainSecret()
     *
     * 0x6fa723c3 = keccak256('WrongPlainSecret()')
     */
    "0x6fa723c3": {
      sig: "WrongPlainSecret()",
      inputs: [],
      name: "WrongPlainSecret",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the plain secret produce a different hash than the secret hash originally set",
        },
      ],
    },
  },
  LSP1UniversalReceiverDelegateUP: {
    /**
     * error CannotRegisterEOAsAsAssets(
     *  address caller
     * )
     *
     * 0xa5295345 = keccak256('CannotRegisterEOAsAsAssets(address)')
     */
    "0xa5295345": {
      sig: "CannotRegisterEOAsAsAssets(address)",
      inputs: [{ internalType: "address", name: "caller", type: "address" }],
      name: "CannotRegisterEOAsAsAssets",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when EOA calls the {universalReceiver(..)} function with an asset/vault typeId.",
          params: { caller: "The address of the EOA" },
        },
      ],
      userdoc: [{ notice: "EOA: `caller` cannot be registered as an asset." }],
    },
  },
  LSP1UniversalReceiverDelegateVault: {
    /**
     * error CannotRegisterEOAsAsAssets(
     *  address caller
     * )
     *
     * 0xa5295345 = keccak256('CannotRegisterEOAsAsAssets(address)')
     */
    "0xa5295345": {
      sig: "CannotRegisterEOAsAsAssets(address)",
      inputs: [{ internalType: "address", name: "caller", type: "address" }],
      name: "CannotRegisterEOAsAsAssets",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when EOA calls the {universalReceiver(..)} function with an asset/vault typeId.",
          params: { caller: "The address of the EOA" },
        },
      ],
      userdoc: [{ notice: "EOA: `caller` cannot be registered as an asset." }],
    },
  },
  LSP23LinkedContractsFactory: {
    /**
     * error InvalidValueSum()
     *
     * 0x2fd9ca91 = keccak256('InvalidValueSum()')
     */
    "0x2fd9ca91": {
      sig: "InvalidValueSum()",
      inputs: [],
      name: "InvalidValueSum",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `msg.value` sent is not equal to the sum of value used for the deployment of the contract & its owner contract.",
        },
      ],
      userdoc: [{ notice: "Invalid value sent." }],
    },

    /**
     * error PrimaryContractProxyInitFailureError(
     *  bytes errorData
     * )
     *
     * 0x4364b6ee = keccak256('PrimaryContractProxyInitFailureError(bytes)')
     */
    "0x4364b6ee": {
      sig: "PrimaryContractProxyInitFailureError(bytes)",
      inputs: [{ internalType: "bytes", name: "errorData", type: "bytes" }],
      name: "PrimaryContractProxyInitFailureError",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the deployment & intialization of the contract has failed.",
          params: {
            errorData:
              "Potentially information about why the deployment & intialization have failed.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Failed to deploy & initialize the Primary Contract Proxy. Error: `errorData`.",
        },
      ],
    },

    /**
     * error SecondaryContractProxyInitFailureError(
     *  bytes errorData
     * )
     *
     * 0x9654a854 = keccak256('SecondaryContractProxyInitFailureError(bytes)')
     */
    "0x9654a854": {
      sig: "SecondaryContractProxyInitFailureError(bytes)",
      inputs: [{ internalType: "bytes", name: "errorData", type: "bytes" }],
      name: "SecondaryContractProxyInitFailureError",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the deployment & intialization of the secondary contract has failed.",
          params: {
            errorData:
              "Potentially information about why the deployment & intialization have failed.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Failed to deploy & initialize the Secondary Contract Proxy. Error: `errorData`.",
        },
      ],
    },
  },
  LSP9Vault: {
    /**
     * error ERC725X_ContractDeploymentFailed()
     *
     * 0x0b07489b = keccak256('ERC725X_ContractDeploymentFailed()')
     */
    "0x0b07489b": {
      sig: "ERC725X_ContractDeploymentFailed()",
      inputs: [],
      name: "ERC725X_ContractDeploymentFailed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when contract deployment failed via {execute} or {executeBatch} functions, This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_CreateOperationsRequireEmptyRecipientAddress()
     *
     * 0x3041824a = keccak256('ERC725X_CreateOperationsRequireEmptyRecipientAddress()')
     */
    "0x3041824a": {
      sig: "ERC725X_CreateOperationsRequireEmptyRecipientAddress()",
      inputs: [],
      name: "ERC725X_CreateOperationsRequireEmptyRecipientAddress",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when passing a `to` address that is not `address(0)` (= address zero) while deploying a contract via {execute} or {executeBatch} functions. This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersEmptyArray()
     *
     * 0xe9ad2b5f = keccak256('ERC725X_ExecuteParametersEmptyArray()')
     */
    "0xe9ad2b5f": {
      sig: "ERC725X_ExecuteParametersEmptyArray()",
      inputs: [],
      name: "ERC725X_ExecuteParametersEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to the {executeBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersLengthMismatch()
     *
     * 0x3ff55f4d = keccak256('ERC725X_ExecuteParametersLengthMismatch()')
     */
    "0x3ff55f4d": {
      sig: "ERC725X_ExecuteParametersLengthMismatch()",
      inputs: [],
      name: "ERC725X_ExecuteParametersLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `operationTypes`, `targets` addresses, `values`, and `datas` array parameters provided when calling the {executeBatch} function.",
        },
      ],
    },

    /**
     * error ERC725X_InsufficientBalance(
     *  uint256 balance,
     *  uint256 value
     * )
     *
     * 0x0df9a8f8 = keccak256('ERC725X_InsufficientBalance(uint256,uint256)')
     */
    "0x0df9a8f8": {
      sig: "ERC725X_InsufficientBalance(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "ERC725X_InsufficientBalance",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send more native tokens `value` than available in current `balance`.",
          params: {
            balance:
              "The balance of native tokens of the ERC725X smart contract.",
            value:
              "The amount of native tokens sent via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` that is greater than the contract's `balance`.",
          },
        },
      ],
    },

    /**
     * error ERC725X_MsgValueDisallowedInStaticCall()
     *
     * 0x72f2bc6a = keccak256('ERC725X_MsgValueDisallowedInStaticCall()')
     */
    "0x72f2bc6a": {
      sig: "ERC725X_MsgValueDisallowedInStaticCall()",
      inputs: [],
      name: "ERC725X_MsgValueDisallowedInStaticCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send native tokens (`value` / `values[]` parameter of {execute} or {executeBatch} functions) while making a `staticcall` (`operationType == 3`). Sending native tokens via `staticcall` is not allowed because it is a state changing operation.",
        },
      ],
    },

    /**
     * error ERC725X_NoContractBytecodeProvided()
     *
     * 0xb81cd8d9 = keccak256('ERC725X_NoContractBytecodeProvided()')
     */
    "0xb81cd8d9": {
      sig: "ERC725X_NoContractBytecodeProvided()",
      inputs: [],
      name: "ERC725X_NoContractBytecodeProvided",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when no contract bytecode was provided as parameter when trying to deploy a contract via {execute} or {executeBatch}. This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_UnknownOperationType(
     *  uint256 operationTypeProvided
     * )
     *
     * 0x7583b3bc = keccak256('ERC725X_UnknownOperationType(uint256)')
     */
    "0x7583b3bc": {
      sig: "ERC725X_UnknownOperationType(uint256)",
      inputs: [
        {
          internalType: "uint256",
          name: "operationTypeProvided",
          type: "uint256",
        },
      ],
      name: "ERC725X_UnknownOperationType",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `operationTypeProvided` is none of the default operation types available. (CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4)",
          params: {
            operationTypeProvided:
              "The unrecognised operation type number provided to `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`.",
          },
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error LSP14CallerNotPendingOwner(
     *  address caller
     * )
     *
     * 0x451e4528 = keccak256('LSP14CallerNotPendingOwner(address)')
     */
    "0x451e4528": {
      sig: "LSP14CallerNotPendingOwner(address)",
      inputs: [{ internalType: "address", name: "caller", type: "address" }],
      name: "LSP14CallerNotPendingOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `caller` that is trying to accept ownership of the contract is not the pending owner.",
          params: { caller: "The address that tried to accept ownership." },
        },
      ],
    },

    /**
     * error LSP14CannotTransferOwnershipToSelf()
     *
     * 0xe052a6f8 = keccak256('LSP14CannotTransferOwnershipToSelf()')
     */
    "0xe052a6f8": {
      sig: "LSP14CannotTransferOwnershipToSelf()",
      inputs: [],
      name: "LSP14CannotTransferOwnershipToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to transfer ownership to the `address(this)`.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot transfer ownership to the address of the contract itself.",
        },
      ],
    },

    /**
     * error LSP14MustAcceptOwnershipInSeparateTransaction()
     *
     * 0x5758dd07 = keccak256('LSP14MustAcceptOwnershipInSeparateTransaction()')
     */
    "0x5758dd07": {
      sig: "LSP14MustAcceptOwnershipInSeparateTransaction()",
      inputs: [],
      name: "LSP14MustAcceptOwnershipInSeparateTransaction",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when pending owner accept ownership in the same transaction of transferring ownership.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot accept ownership in the same transaction with {transferOwnership(...)}.",
        },
      ],
    },

    /**
     * error LSP14NotInRenounceOwnershipInterval(
     *  uint256 renounceOwnershipStart,
     *  uint256 renounceOwnershipEnd
     * )
     *
     * 0x1b080942 = keccak256('LSP14NotInRenounceOwnershipInterval(uint256,uint256)')
     */
    "0x1b080942": {
      sig: "LSP14NotInRenounceOwnershipInterval(uint256,uint256)",
      inputs: [
        {
          internalType: "uint256",
          name: "renounceOwnershipStart",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "renounceOwnershipEnd",
          type: "uint256",
        },
      ],
      name: "LSP14NotInRenounceOwnershipInterval",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to renounce ownership before the initial confirmation delay.",
          params: {
            renounceOwnershipEnd:
              "The end timestamp when one can confirm the renouncement of ownership.",
            renounceOwnershipStart:
              "The start timestamp when one can confirm the renouncement of ownership.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot confirm ownership renouncement yet. The ownership renouncement is allowed from: `renounceOwnershipStart` until: `renounceOwnershipEnd`.",
        },
      ],
    },

    /**
     * error LSP1DelegateNotAllowedToSetDataKey(
     *  bytes32 dataKey
     * )
     *
     * 0x199611f1 = keccak256('LSP1DelegateNotAllowedToSetDataKey(bytes32)')
     */
    "0x199611f1": {
      sig: "LSP1DelegateNotAllowedToSetDataKey(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "LSP1DelegateNotAllowedToSetDataKey",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the Vault version of [LSP1UniversalReceiverDelegate] sets LSP1/6/17 Data Keys.",
          params: {
            dataKey:
              "The data key that the Vault version of [LSP1UniversalReceiverDelegate] is not allowed to set.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The `LSP1UniversalReceiverDelegate` is not allowed to set the following data key: `dataKey`.",
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },
  },
  LSP9VaultInit: {
    /**
     * error ERC725X_ContractDeploymentFailed()
     *
     * 0x0b07489b = keccak256('ERC725X_ContractDeploymentFailed()')
     */
    "0x0b07489b": {
      sig: "ERC725X_ContractDeploymentFailed()",
      inputs: [],
      name: "ERC725X_ContractDeploymentFailed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when contract deployment failed via {execute} or {executeBatch} functions, This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_CreateOperationsRequireEmptyRecipientAddress()
     *
     * 0x3041824a = keccak256('ERC725X_CreateOperationsRequireEmptyRecipientAddress()')
     */
    "0x3041824a": {
      sig: "ERC725X_CreateOperationsRequireEmptyRecipientAddress()",
      inputs: [],
      name: "ERC725X_CreateOperationsRequireEmptyRecipientAddress",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when passing a `to` address that is not `address(0)` (= address zero) while deploying a contract via {execute} or {executeBatch} functions. This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersEmptyArray()
     *
     * 0xe9ad2b5f = keccak256('ERC725X_ExecuteParametersEmptyArray()')
     */
    "0xe9ad2b5f": {
      sig: "ERC725X_ExecuteParametersEmptyArray()",
      inputs: [],
      name: "ERC725X_ExecuteParametersEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to the {executeBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersLengthMismatch()
     *
     * 0x3ff55f4d = keccak256('ERC725X_ExecuteParametersLengthMismatch()')
     */
    "0x3ff55f4d": {
      sig: "ERC725X_ExecuteParametersLengthMismatch()",
      inputs: [],
      name: "ERC725X_ExecuteParametersLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `operationTypes`, `targets` addresses, `values`, and `datas` array parameters provided when calling the {executeBatch} function.",
        },
      ],
    },

    /**
     * error ERC725X_InsufficientBalance(
     *  uint256 balance,
     *  uint256 value
     * )
     *
     * 0x0df9a8f8 = keccak256('ERC725X_InsufficientBalance(uint256,uint256)')
     */
    "0x0df9a8f8": {
      sig: "ERC725X_InsufficientBalance(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "ERC725X_InsufficientBalance",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send more native tokens `value` than available in current `balance`.",
          params: {
            balance:
              "The balance of native tokens of the ERC725X smart contract.",
            value:
              "The amount of native tokens sent via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` that is greater than the contract's `balance`.",
          },
        },
      ],
    },

    /**
     * error ERC725X_MsgValueDisallowedInStaticCall()
     *
     * 0x72f2bc6a = keccak256('ERC725X_MsgValueDisallowedInStaticCall()')
     */
    "0x72f2bc6a": {
      sig: "ERC725X_MsgValueDisallowedInStaticCall()",
      inputs: [],
      name: "ERC725X_MsgValueDisallowedInStaticCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send native tokens (`value` / `values[]` parameter of {execute} or {executeBatch} functions) while making a `staticcall` (`operationType == 3`). Sending native tokens via `staticcall` is not allowed because it is a state changing operation.",
        },
      ],
    },

    /**
     * error ERC725X_NoContractBytecodeProvided()
     *
     * 0xb81cd8d9 = keccak256('ERC725X_NoContractBytecodeProvided()')
     */
    "0xb81cd8d9": {
      sig: "ERC725X_NoContractBytecodeProvided()",
      inputs: [],
      name: "ERC725X_NoContractBytecodeProvided",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when no contract bytecode was provided as parameter when trying to deploy a contract via {execute} or {executeBatch}. This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_UnknownOperationType(
     *  uint256 operationTypeProvided
     * )
     *
     * 0x7583b3bc = keccak256('ERC725X_UnknownOperationType(uint256)')
     */
    "0x7583b3bc": {
      sig: "ERC725X_UnknownOperationType(uint256)",
      inputs: [
        {
          internalType: "uint256",
          name: "operationTypeProvided",
          type: "uint256",
        },
      ],
      name: "ERC725X_UnknownOperationType",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `operationTypeProvided` is none of the default operation types available. (CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4)",
          params: {
            operationTypeProvided:
              "The unrecognised operation type number provided to `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`.",
          },
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error LSP14CallerNotPendingOwner(
     *  address caller
     * )
     *
     * 0x451e4528 = keccak256('LSP14CallerNotPendingOwner(address)')
     */
    "0x451e4528": {
      sig: "LSP14CallerNotPendingOwner(address)",
      inputs: [{ internalType: "address", name: "caller", type: "address" }],
      name: "LSP14CallerNotPendingOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `caller` that is trying to accept ownership of the contract is not the pending owner.",
          params: { caller: "The address that tried to accept ownership." },
        },
      ],
    },

    /**
     * error LSP14CannotTransferOwnershipToSelf()
     *
     * 0xe052a6f8 = keccak256('LSP14CannotTransferOwnershipToSelf()')
     */
    "0xe052a6f8": {
      sig: "LSP14CannotTransferOwnershipToSelf()",
      inputs: [],
      name: "LSP14CannotTransferOwnershipToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to transfer ownership to the `address(this)`.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot transfer ownership to the address of the contract itself.",
        },
      ],
    },

    /**
     * error LSP14MustAcceptOwnershipInSeparateTransaction()
     *
     * 0x5758dd07 = keccak256('LSP14MustAcceptOwnershipInSeparateTransaction()')
     */
    "0x5758dd07": {
      sig: "LSP14MustAcceptOwnershipInSeparateTransaction()",
      inputs: [],
      name: "LSP14MustAcceptOwnershipInSeparateTransaction",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when pending owner accept ownership in the same transaction of transferring ownership.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot accept ownership in the same transaction with {transferOwnership(...)}.",
        },
      ],
    },

    /**
     * error LSP14NotInRenounceOwnershipInterval(
     *  uint256 renounceOwnershipStart,
     *  uint256 renounceOwnershipEnd
     * )
     *
     * 0x1b080942 = keccak256('LSP14NotInRenounceOwnershipInterval(uint256,uint256)')
     */
    "0x1b080942": {
      sig: "LSP14NotInRenounceOwnershipInterval(uint256,uint256)",
      inputs: [
        {
          internalType: "uint256",
          name: "renounceOwnershipStart",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "renounceOwnershipEnd",
          type: "uint256",
        },
      ],
      name: "LSP14NotInRenounceOwnershipInterval",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to renounce ownership before the initial confirmation delay.",
          params: {
            renounceOwnershipEnd:
              "The end timestamp when one can confirm the renouncement of ownership.",
            renounceOwnershipStart:
              "The start timestamp when one can confirm the renouncement of ownership.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot confirm ownership renouncement yet. The ownership renouncement is allowed from: `renounceOwnershipStart` until: `renounceOwnershipEnd`.",
        },
      ],
    },

    /**
     * error LSP1DelegateNotAllowedToSetDataKey(
     *  bytes32 dataKey
     * )
     *
     * 0x199611f1 = keccak256('LSP1DelegateNotAllowedToSetDataKey(bytes32)')
     */
    "0x199611f1": {
      sig: "LSP1DelegateNotAllowedToSetDataKey(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "LSP1DelegateNotAllowedToSetDataKey",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the Vault version of [LSP1UniversalReceiverDelegate] sets LSP1/6/17 Data Keys.",
          params: {
            dataKey:
              "The data key that the Vault version of [LSP1UniversalReceiverDelegate] is not allowed to set.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The `LSP1UniversalReceiverDelegate` is not allowed to set the following data key: `dataKey`.",
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },
  },
  UniversalProfile: {
    /**
     * error ERC725X_ContractDeploymentFailed()
     *
     * 0x0b07489b = keccak256('ERC725X_ContractDeploymentFailed()')
     */
    "0x0b07489b": {
      sig: "ERC725X_ContractDeploymentFailed()",
      inputs: [],
      name: "ERC725X_ContractDeploymentFailed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when contract deployment failed via {execute} or {executeBatch} functions, This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_CreateOperationsRequireEmptyRecipientAddress()
     *
     * 0x3041824a = keccak256('ERC725X_CreateOperationsRequireEmptyRecipientAddress()')
     */
    "0x3041824a": {
      sig: "ERC725X_CreateOperationsRequireEmptyRecipientAddress()",
      inputs: [],
      name: "ERC725X_CreateOperationsRequireEmptyRecipientAddress",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when passing a `to` address that is not `address(0)` (= address zero) while deploying a contract via {execute} or {executeBatch} functions. This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersEmptyArray()
     *
     * 0xe9ad2b5f = keccak256('ERC725X_ExecuteParametersEmptyArray()')
     */
    "0xe9ad2b5f": {
      sig: "ERC725X_ExecuteParametersEmptyArray()",
      inputs: [],
      name: "ERC725X_ExecuteParametersEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to the {executeBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersLengthMismatch()
     *
     * 0x3ff55f4d = keccak256('ERC725X_ExecuteParametersLengthMismatch()')
     */
    "0x3ff55f4d": {
      sig: "ERC725X_ExecuteParametersLengthMismatch()",
      inputs: [],
      name: "ERC725X_ExecuteParametersLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `operationTypes`, `targets` addresses, `values`, and `datas` array parameters provided when calling the {executeBatch} function.",
        },
      ],
    },

    /**
     * error ERC725X_InsufficientBalance(
     *  uint256 balance,
     *  uint256 value
     * )
     *
     * 0x0df9a8f8 = keccak256('ERC725X_InsufficientBalance(uint256,uint256)')
     */
    "0x0df9a8f8": {
      sig: "ERC725X_InsufficientBalance(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "ERC725X_InsufficientBalance",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send more native tokens `value` than available in current `balance`.",
          params: {
            balance:
              "The balance of native tokens of the ERC725X smart contract.",
            value:
              "The amount of native tokens sent via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` that is greater than the contract's `balance`.",
          },
        },
      ],
    },

    /**
     * error ERC725X_MsgValueDisallowedInDelegateCall()
     *
     * 0x5ac83135 = keccak256('ERC725X_MsgValueDisallowedInDelegateCall()')
     */
    "0x5ac83135": {
      sig: "ERC725X_MsgValueDisallowedInDelegateCall()",
      inputs: [],
      name: "ERC725X_MsgValueDisallowedInDelegateCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send native tokens (`value` / `values[]` parameter of {execute} or {executeBatch} functions) while making a `delegatecall` (`operationType == 4`). Sending native tokens via `staticcall` is not allowed because `msg.value` is persisting.",
        },
      ],
    },

    /**
     * error ERC725X_MsgValueDisallowedInStaticCall()
     *
     * 0x72f2bc6a = keccak256('ERC725X_MsgValueDisallowedInStaticCall()')
     */
    "0x72f2bc6a": {
      sig: "ERC725X_MsgValueDisallowedInStaticCall()",
      inputs: [],
      name: "ERC725X_MsgValueDisallowedInStaticCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send native tokens (`value` / `values[]` parameter of {execute} or {executeBatch} functions) while making a `staticcall` (`operationType == 3`). Sending native tokens via `staticcall` is not allowed because it is a state changing operation.",
        },
      ],
    },

    /**
     * error ERC725X_NoContractBytecodeProvided()
     *
     * 0xb81cd8d9 = keccak256('ERC725X_NoContractBytecodeProvided()')
     */
    "0xb81cd8d9": {
      sig: "ERC725X_NoContractBytecodeProvided()",
      inputs: [],
      name: "ERC725X_NoContractBytecodeProvided",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when no contract bytecode was provided as parameter when trying to deploy a contract via {execute} or {executeBatch}. This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_UnknownOperationType(
     *  uint256 operationTypeProvided
     * )
     *
     * 0x7583b3bc = keccak256('ERC725X_UnknownOperationType(uint256)')
     */
    "0x7583b3bc": {
      sig: "ERC725X_UnknownOperationType(uint256)",
      inputs: [
        {
          internalType: "uint256",
          name: "operationTypeProvided",
          type: "uint256",
        },
      ],
      name: "ERC725X_UnknownOperationType",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `operationTypeProvided` is none of the default operation types available. (CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4)",
          params: {
            operationTypeProvided:
              "The unrecognised operation type number provided to `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`.",
          },
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error LSP14CallerNotPendingOwner(
     *  address caller
     * )
     *
     * 0x451e4528 = keccak256('LSP14CallerNotPendingOwner(address)')
     */
    "0x451e4528": {
      sig: "LSP14CallerNotPendingOwner(address)",
      inputs: [{ internalType: "address", name: "caller", type: "address" }],
      name: "LSP14CallerNotPendingOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `caller` that is trying to accept ownership of the contract is not the pending owner.",
          params: { caller: "The address that tried to accept ownership." },
        },
      ],
    },

    /**
     * error LSP14CannotTransferOwnershipToSelf()
     *
     * 0xe052a6f8 = keccak256('LSP14CannotTransferOwnershipToSelf()')
     */
    "0xe052a6f8": {
      sig: "LSP14CannotTransferOwnershipToSelf()",
      inputs: [],
      name: "LSP14CannotTransferOwnershipToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to transfer ownership to the `address(this)`.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot transfer ownership to the address of the contract itself.",
        },
      ],
    },

    /**
     * error LSP14MustAcceptOwnershipInSeparateTransaction()
     *
     * 0x5758dd07 = keccak256('LSP14MustAcceptOwnershipInSeparateTransaction()')
     */
    "0x5758dd07": {
      sig: "LSP14MustAcceptOwnershipInSeparateTransaction()",
      inputs: [],
      name: "LSP14MustAcceptOwnershipInSeparateTransaction",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when pending owner accept ownership in the same transaction of transferring ownership.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot accept ownership in the same transaction with {transferOwnership(...)}.",
        },
      ],
    },

    /**
     * error LSP14NotInRenounceOwnershipInterval(
     *  uint256 renounceOwnershipStart,
     *  uint256 renounceOwnershipEnd
     * )
     *
     * 0x1b080942 = keccak256('LSP14NotInRenounceOwnershipInterval(uint256,uint256)')
     */
    "0x1b080942": {
      sig: "LSP14NotInRenounceOwnershipInterval(uint256,uint256)",
      inputs: [
        {
          internalType: "uint256",
          name: "renounceOwnershipStart",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "renounceOwnershipEnd",
          type: "uint256",
        },
      ],
      name: "LSP14NotInRenounceOwnershipInterval",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to renounce ownership before the initial confirmation delay.",
          params: {
            renounceOwnershipEnd:
              "The end timestamp when one can confirm the renouncement of ownership.",
            renounceOwnershipStart:
              "The start timestamp when one can confirm the renouncement of ownership.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot confirm ownership renouncement yet. The ownership renouncement is allowed from: `renounceOwnershipStart` until: `renounceOwnershipEnd`.",
        },
      ],
    },

    /**
     * error LSP20CallVerificationFailed(
     *  bool postCall,
     *  bytes4 returnedStatus
     * )
     *
     * 0x9d6741e3 = keccak256('LSP20CallVerificationFailed(bool,bytes4)')
     */
    "0x9d6741e3": {
      sig: "LSP20CallVerificationFailed(bool,bytes4)",
      inputs: [
        { internalType: "bool", name: "postCall", type: "bool" },
        { internalType: "bytes4", name: "returnedStatus", type: "bytes4" },
      ],
      name: "LSP20CallVerificationFailed",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the call to the owner does not return the LSP20 success value",
          params: {
            postCall: "True if the execution call was done, False otherwise",
            returnedStatus:
              "The bytes4 decoded data returned by the logic verifier.",
          },
        },
      ],
    },

    /**
     * error LSP20CallingVerifierFailed(
     *  bool postCall
     * )
     *
     * 0x8c6a8ae3 = keccak256('LSP20CallingVerifierFailed(bool)')
     */
    "0x8c6a8ae3": {
      sig: "LSP20CallingVerifierFailed(bool)",
      inputs: [{ internalType: "bool", name: "postCall", type: "bool" }],
      name: "LSP20CallingVerifierFailed",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the call to the owner fail with no revert reason",
          params: {
            postCall: "True if the execution call was done, False otherwise",
          },
        },
      ],
    },

    /**
     * error LSP20EOACannotVerifyCall(
     *  address logicVerifier
     * )
     *
     * 0x0c392301 = keccak256('LSP20EOACannotVerifyCall(address)')
     */
    "0x0c392301": {
      sig: "LSP20EOACannotVerifyCall(address)",
      inputs: [
        { internalType: "address", name: "logicVerifier", type: "address" },
      ],
      name: "LSP20EOACannotVerifyCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the logic verifier is an Externally Owned Account (EOA) that cannot return the LSP20 success value.",
          params: { logicVerifier: "The address of the logic verifier" },
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },
  },
  UniversalProfileInit: {
    /**
     * error ERC725X_ContractDeploymentFailed()
     *
     * 0x0b07489b = keccak256('ERC725X_ContractDeploymentFailed()')
     */
    "0x0b07489b": {
      sig: "ERC725X_ContractDeploymentFailed()",
      inputs: [],
      name: "ERC725X_ContractDeploymentFailed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when contract deployment failed via {execute} or {executeBatch} functions, This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_CreateOperationsRequireEmptyRecipientAddress()
     *
     * 0x3041824a = keccak256('ERC725X_CreateOperationsRequireEmptyRecipientAddress()')
     */
    "0x3041824a": {
      sig: "ERC725X_CreateOperationsRequireEmptyRecipientAddress()",
      inputs: [],
      name: "ERC725X_CreateOperationsRequireEmptyRecipientAddress",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when passing a `to` address that is not `address(0)` (= address zero) while deploying a contract via {execute} or {executeBatch} functions. This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersEmptyArray()
     *
     * 0xe9ad2b5f = keccak256('ERC725X_ExecuteParametersEmptyArray()')
     */
    "0xe9ad2b5f": {
      sig: "ERC725X_ExecuteParametersEmptyArray()",
      inputs: [],
      name: "ERC725X_ExecuteParametersEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to the {executeBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersLengthMismatch()
     *
     * 0x3ff55f4d = keccak256('ERC725X_ExecuteParametersLengthMismatch()')
     */
    "0x3ff55f4d": {
      sig: "ERC725X_ExecuteParametersLengthMismatch()",
      inputs: [],
      name: "ERC725X_ExecuteParametersLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `operationTypes`, `targets` addresses, `values`, and `datas` array parameters provided when calling the {executeBatch} function.",
        },
      ],
    },

    /**
     * error ERC725X_InsufficientBalance(
     *  uint256 balance,
     *  uint256 value
     * )
     *
     * 0x0df9a8f8 = keccak256('ERC725X_InsufficientBalance(uint256,uint256)')
     */
    "0x0df9a8f8": {
      sig: "ERC725X_InsufficientBalance(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "ERC725X_InsufficientBalance",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send more native tokens `value` than available in current `balance`.",
          params: {
            balance:
              "The balance of native tokens of the ERC725X smart contract.",
            value:
              "The amount of native tokens sent via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` that is greater than the contract's `balance`.",
          },
        },
      ],
    },

    /**
     * error ERC725X_MsgValueDisallowedInDelegateCall()
     *
     * 0x5ac83135 = keccak256('ERC725X_MsgValueDisallowedInDelegateCall()')
     */
    "0x5ac83135": {
      sig: "ERC725X_MsgValueDisallowedInDelegateCall()",
      inputs: [],
      name: "ERC725X_MsgValueDisallowedInDelegateCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send native tokens (`value` / `values[]` parameter of {execute} or {executeBatch} functions) while making a `delegatecall` (`operationType == 4`). Sending native tokens via `staticcall` is not allowed because `msg.value` is persisting.",
        },
      ],
    },

    /**
     * error ERC725X_MsgValueDisallowedInStaticCall()
     *
     * 0x72f2bc6a = keccak256('ERC725X_MsgValueDisallowedInStaticCall()')
     */
    "0x72f2bc6a": {
      sig: "ERC725X_MsgValueDisallowedInStaticCall()",
      inputs: [],
      name: "ERC725X_MsgValueDisallowedInStaticCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send native tokens (`value` / `values[]` parameter of {execute} or {executeBatch} functions) while making a `staticcall` (`operationType == 3`). Sending native tokens via `staticcall` is not allowed because it is a state changing operation.",
        },
      ],
    },

    /**
     * error ERC725X_NoContractBytecodeProvided()
     *
     * 0xb81cd8d9 = keccak256('ERC725X_NoContractBytecodeProvided()')
     */
    "0xb81cd8d9": {
      sig: "ERC725X_NoContractBytecodeProvided()",
      inputs: [],
      name: "ERC725X_NoContractBytecodeProvided",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when no contract bytecode was provided as parameter when trying to deploy a contract via {execute} or {executeBatch}. This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_UnknownOperationType(
     *  uint256 operationTypeProvided
     * )
     *
     * 0x7583b3bc = keccak256('ERC725X_UnknownOperationType(uint256)')
     */
    "0x7583b3bc": {
      sig: "ERC725X_UnknownOperationType(uint256)",
      inputs: [
        {
          internalType: "uint256",
          name: "operationTypeProvided",
          type: "uint256",
        },
      ],
      name: "ERC725X_UnknownOperationType",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `operationTypeProvided` is none of the default operation types available. (CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4)",
          params: {
            operationTypeProvided:
              "The unrecognised operation type number provided to `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`.",
          },
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error LSP14CallerNotPendingOwner(
     *  address caller
     * )
     *
     * 0x451e4528 = keccak256('LSP14CallerNotPendingOwner(address)')
     */
    "0x451e4528": {
      sig: "LSP14CallerNotPendingOwner(address)",
      inputs: [{ internalType: "address", name: "caller", type: "address" }],
      name: "LSP14CallerNotPendingOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `caller` that is trying to accept ownership of the contract is not the pending owner.",
          params: { caller: "The address that tried to accept ownership." },
        },
      ],
    },

    /**
     * error LSP14CannotTransferOwnershipToSelf()
     *
     * 0xe052a6f8 = keccak256('LSP14CannotTransferOwnershipToSelf()')
     */
    "0xe052a6f8": {
      sig: "LSP14CannotTransferOwnershipToSelf()",
      inputs: [],
      name: "LSP14CannotTransferOwnershipToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to transfer ownership to the `address(this)`.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot transfer ownership to the address of the contract itself.",
        },
      ],
    },

    /**
     * error LSP14MustAcceptOwnershipInSeparateTransaction()
     *
     * 0x5758dd07 = keccak256('LSP14MustAcceptOwnershipInSeparateTransaction()')
     */
    "0x5758dd07": {
      sig: "LSP14MustAcceptOwnershipInSeparateTransaction()",
      inputs: [],
      name: "LSP14MustAcceptOwnershipInSeparateTransaction",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when pending owner accept ownership in the same transaction of transferring ownership.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot accept ownership in the same transaction with {transferOwnership(...)}.",
        },
      ],
    },

    /**
     * error LSP14NotInRenounceOwnershipInterval(
     *  uint256 renounceOwnershipStart,
     *  uint256 renounceOwnershipEnd
     * )
     *
     * 0x1b080942 = keccak256('LSP14NotInRenounceOwnershipInterval(uint256,uint256)')
     */
    "0x1b080942": {
      sig: "LSP14NotInRenounceOwnershipInterval(uint256,uint256)",
      inputs: [
        {
          internalType: "uint256",
          name: "renounceOwnershipStart",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "renounceOwnershipEnd",
          type: "uint256",
        },
      ],
      name: "LSP14NotInRenounceOwnershipInterval",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to renounce ownership before the initial confirmation delay.",
          params: {
            renounceOwnershipEnd:
              "The end timestamp when one can confirm the renouncement of ownership.",
            renounceOwnershipStart:
              "The start timestamp when one can confirm the renouncement of ownership.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot confirm ownership renouncement yet. The ownership renouncement is allowed from: `renounceOwnershipStart` until: `renounceOwnershipEnd`.",
        },
      ],
    },

    /**
     * error LSP20CallVerificationFailed(
     *  bool postCall,
     *  bytes4 returnedStatus
     * )
     *
     * 0x9d6741e3 = keccak256('LSP20CallVerificationFailed(bool,bytes4)')
     */
    "0x9d6741e3": {
      sig: "LSP20CallVerificationFailed(bool,bytes4)",
      inputs: [
        { internalType: "bool", name: "postCall", type: "bool" },
        { internalType: "bytes4", name: "returnedStatus", type: "bytes4" },
      ],
      name: "LSP20CallVerificationFailed",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the call to the owner does not return the LSP20 success value",
          params: {
            postCall: "True if the execution call was done, False otherwise",
            returnedStatus:
              "The bytes4 decoded data returned by the logic verifier.",
          },
        },
      ],
    },

    /**
     * error LSP20CallingVerifierFailed(
     *  bool postCall
     * )
     *
     * 0x8c6a8ae3 = keccak256('LSP20CallingVerifierFailed(bool)')
     */
    "0x8c6a8ae3": {
      sig: "LSP20CallingVerifierFailed(bool)",
      inputs: [{ internalType: "bool", name: "postCall", type: "bool" }],
      name: "LSP20CallingVerifierFailed",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the call to the owner fail with no revert reason",
          params: {
            postCall: "True if the execution call was done, False otherwise",
          },
        },
      ],
    },

    /**
     * error LSP20EOACannotVerifyCall(
     *  address logicVerifier
     * )
     *
     * 0x0c392301 = keccak256('LSP20EOACannotVerifyCall(address)')
     */
    "0x0c392301": {
      sig: "LSP20EOACannotVerifyCall(address)",
      inputs: [
        { internalType: "address", name: "logicVerifier", type: "address" },
      ],
      name: "LSP20EOACannotVerifyCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the logic verifier is an Externally Owned Account (EOA) that cannot return the LSP20 success value.",
          params: { logicVerifier: "The address of the logic verifier" },
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },
  },
  LSP0ERC725Account: {
    /**
     * error ERC725X_ContractDeploymentFailed()
     *
     * 0x0b07489b = keccak256('ERC725X_ContractDeploymentFailed()')
     */
    "0x0b07489b": {
      sig: "ERC725X_ContractDeploymentFailed()",
      inputs: [],
      name: "ERC725X_ContractDeploymentFailed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when contract deployment failed via {execute} or {executeBatch} functions, This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_CreateOperationsRequireEmptyRecipientAddress()
     *
     * 0x3041824a = keccak256('ERC725X_CreateOperationsRequireEmptyRecipientAddress()')
     */
    "0x3041824a": {
      sig: "ERC725X_CreateOperationsRequireEmptyRecipientAddress()",
      inputs: [],
      name: "ERC725X_CreateOperationsRequireEmptyRecipientAddress",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when passing a `to` address that is not `address(0)` (= address zero) while deploying a contract via {execute} or {executeBatch} functions. This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersEmptyArray()
     *
     * 0xe9ad2b5f = keccak256('ERC725X_ExecuteParametersEmptyArray()')
     */
    "0xe9ad2b5f": {
      sig: "ERC725X_ExecuteParametersEmptyArray()",
      inputs: [],
      name: "ERC725X_ExecuteParametersEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to the {executeBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersLengthMismatch()
     *
     * 0x3ff55f4d = keccak256('ERC725X_ExecuteParametersLengthMismatch()')
     */
    "0x3ff55f4d": {
      sig: "ERC725X_ExecuteParametersLengthMismatch()",
      inputs: [],
      name: "ERC725X_ExecuteParametersLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `operationTypes`, `targets` addresses, `values`, and `datas` array parameters provided when calling the {executeBatch} function.",
        },
      ],
    },

    /**
     * error ERC725X_InsufficientBalance(
     *  uint256 balance,
     *  uint256 value
     * )
     *
     * 0x0df9a8f8 = keccak256('ERC725X_InsufficientBalance(uint256,uint256)')
     */
    "0x0df9a8f8": {
      sig: "ERC725X_InsufficientBalance(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "ERC725X_InsufficientBalance",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send more native tokens `value` than available in current `balance`.",
          params: {
            balance:
              "The balance of native tokens of the ERC725X smart contract.",
            value:
              "The amount of native tokens sent via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` that is greater than the contract's `balance`.",
          },
        },
      ],
    },

    /**
     * error ERC725X_MsgValueDisallowedInDelegateCall()
     *
     * 0x5ac83135 = keccak256('ERC725X_MsgValueDisallowedInDelegateCall()')
     */
    "0x5ac83135": {
      sig: "ERC725X_MsgValueDisallowedInDelegateCall()",
      inputs: [],
      name: "ERC725X_MsgValueDisallowedInDelegateCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send native tokens (`value` / `values[]` parameter of {execute} or {executeBatch} functions) while making a `delegatecall` (`operationType == 4`). Sending native tokens via `staticcall` is not allowed because `msg.value` is persisting.",
        },
      ],
    },

    /**
     * error ERC725X_MsgValueDisallowedInStaticCall()
     *
     * 0x72f2bc6a = keccak256('ERC725X_MsgValueDisallowedInStaticCall()')
     */
    "0x72f2bc6a": {
      sig: "ERC725X_MsgValueDisallowedInStaticCall()",
      inputs: [],
      name: "ERC725X_MsgValueDisallowedInStaticCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to send native tokens (`value` / `values[]` parameter of {execute} or {executeBatch} functions) while making a `staticcall` (`operationType == 3`). Sending native tokens via `staticcall` is not allowed because it is a state changing operation.",
        },
      ],
    },

    /**
     * error ERC725X_NoContractBytecodeProvided()
     *
     * 0xb81cd8d9 = keccak256('ERC725X_NoContractBytecodeProvided()')
     */
    "0xb81cd8d9": {
      sig: "ERC725X_NoContractBytecodeProvided()",
      inputs: [],
      name: "ERC725X_NoContractBytecodeProvided",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when no contract bytecode was provided as parameter when trying to deploy a contract via {execute} or {executeBatch}. This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).",
        },
      ],
    },

    /**
     * error ERC725X_UnknownOperationType(
     *  uint256 operationTypeProvided
     * )
     *
     * 0x7583b3bc = keccak256('ERC725X_UnknownOperationType(uint256)')
     */
    "0x7583b3bc": {
      sig: "ERC725X_UnknownOperationType(uint256)",
      inputs: [
        {
          internalType: "uint256",
          name: "operationTypeProvided",
          type: "uint256",
        },
      ],
      name: "ERC725X_UnknownOperationType",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `operationTypeProvided` is none of the default operation types available. (CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4)",
          params: {
            operationTypeProvided:
              "The unrecognised operation type number provided to `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`.",
          },
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error LSP14CallerNotPendingOwner(
     *  address caller
     * )
     *
     * 0x451e4528 = keccak256('LSP14CallerNotPendingOwner(address)')
     */
    "0x451e4528": {
      sig: "LSP14CallerNotPendingOwner(address)",
      inputs: [{ internalType: "address", name: "caller", type: "address" }],
      name: "LSP14CallerNotPendingOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `caller` that is trying to accept ownership of the contract is not the pending owner.",
          params: { caller: "The address that tried to accept ownership." },
        },
      ],
    },

    /**
     * error LSP14CannotTransferOwnershipToSelf()
     *
     * 0xe052a6f8 = keccak256('LSP14CannotTransferOwnershipToSelf()')
     */
    "0xe052a6f8": {
      sig: "LSP14CannotTransferOwnershipToSelf()",
      inputs: [],
      name: "LSP14CannotTransferOwnershipToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to transfer ownership to the `address(this)`.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot transfer ownership to the address of the contract itself.",
        },
      ],
    },

    /**
     * error LSP14MustAcceptOwnershipInSeparateTransaction()
     *
     * 0x5758dd07 = keccak256('LSP14MustAcceptOwnershipInSeparateTransaction()')
     */
    "0x5758dd07": {
      sig: "LSP14MustAcceptOwnershipInSeparateTransaction()",
      inputs: [],
      name: "LSP14MustAcceptOwnershipInSeparateTransaction",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when pending owner accept ownership in the same transaction of transferring ownership.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot accept ownership in the same transaction with {transferOwnership(...)}.",
        },
      ],
    },

    /**
     * error LSP14NotInRenounceOwnershipInterval(
     *  uint256 renounceOwnershipStart,
     *  uint256 renounceOwnershipEnd
     * )
     *
     * 0x1b080942 = keccak256('LSP14NotInRenounceOwnershipInterval(uint256,uint256)')
     */
    "0x1b080942": {
      sig: "LSP14NotInRenounceOwnershipInterval(uint256,uint256)",
      inputs: [
        {
          internalType: "uint256",
          name: "renounceOwnershipStart",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "renounceOwnershipEnd",
          type: "uint256",
        },
      ],
      name: "LSP14NotInRenounceOwnershipInterval",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to renounce ownership before the initial confirmation delay.",
          params: {
            renounceOwnershipEnd:
              "The end timestamp when one can confirm the renouncement of ownership.",
            renounceOwnershipStart:
              "The start timestamp when one can confirm the renouncement of ownership.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot confirm ownership renouncement yet. The ownership renouncement is allowed from: `renounceOwnershipStart` until: `renounceOwnershipEnd`.",
        },
      ],
    },

    /**
     * error LSP20CallVerificationFailed(
     *  bool postCall,
     *  bytes4 returnedStatus
     * )
     *
     * 0x9d6741e3 = keccak256('LSP20CallVerificationFailed(bool,bytes4)')
     */
    "0x9d6741e3": {
      sig: "LSP20CallVerificationFailed(bool,bytes4)",
      inputs: [
        { internalType: "bool", name: "postCall", type: "bool" },
        { internalType: "bytes4", name: "returnedStatus", type: "bytes4" },
      ],
      name: "LSP20CallVerificationFailed",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the call to the owner does not return the LSP20 success value",
          params: {
            postCall: "True if the execution call was done, False otherwise",
            returnedStatus:
              "The bytes4 decoded data returned by the logic verifier.",
          },
        },
      ],
    },

    /**
     * error LSP20CallingVerifierFailed(
     *  bool postCall
     * )
     *
     * 0x8c6a8ae3 = keccak256('LSP20CallingVerifierFailed(bool)')
     */
    "0x8c6a8ae3": {
      sig: "LSP20CallingVerifierFailed(bool)",
      inputs: [{ internalType: "bool", name: "postCall", type: "bool" }],
      name: "LSP20CallingVerifierFailed",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the call to the owner fail with no revert reason",
          params: {
            postCall: "True if the execution call was done, False otherwise",
          },
        },
      ],
    },

    /**
     * error LSP20EOACannotVerifyCall(
     *  address logicVerifier
     * )
     *
     * 0x0c392301 = keccak256('LSP20EOACannotVerifyCall(address)')
     */
    "0x0c392301": {
      sig: "LSP20EOACannotVerifyCall(address)",
      inputs: [
        { internalType: "address", name: "logicVerifier", type: "address" },
      ],
      name: "LSP20EOACannotVerifyCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the logic verifier is an Externally Owned Account (EOA) that cannot return the LSP20 success value.",
          params: { logicVerifier: "The address of the logic verifier" },
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },
  },
  LSP4DigitalAssetMetadata: {
    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error LSP4TokenNameNotEditable()
     *
     * 0x85c169bd = keccak256('LSP4TokenNameNotEditable()')
     */
    "0x85c169bd": {
      sig: "LSP4TokenNameNotEditable()",
      inputs: [],
      name: "LSP4TokenNameNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenSymbolNotEditable()
     *
     * 0x76755b38 = keccak256('LSP4TokenSymbolNotEditable()')
     */
    "0x76755b38": {
      sig: "LSP4TokenSymbolNotEditable()",
      inputs: [],
      name: "LSP4TokenSymbolNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenTypeNotEditable()
     *
     * 0x4ef6d7fb = keccak256('LSP4TokenTypeNotEditable()')
     */
    "0x4ef6d7fb": {
      sig: "LSP4TokenTypeNotEditable()",
      inputs: [],
      name: "LSP4TokenTypeNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },
  },
  LSP4DigitalAssetMetadataInitAbstract: {
    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error LSP4TokenNameNotEditable()
     *
     * 0x85c169bd = keccak256('LSP4TokenNameNotEditable()')
     */
    "0x85c169bd": {
      sig: "LSP4TokenNameNotEditable()",
      inputs: [],
      name: "LSP4TokenNameNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenSymbolNotEditable()
     *
     * 0x76755b38 = keccak256('LSP4TokenSymbolNotEditable()')
     */
    "0x76755b38": {
      sig: "LSP4TokenSymbolNotEditable()",
      inputs: [],
      name: "LSP4TokenSymbolNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenTypeNotEditable()
     *
     * 0x4ef6d7fb = keccak256('LSP4TokenTypeNotEditable()')
     */
    "0x4ef6d7fb": {
      sig: "LSP4TokenTypeNotEditable()",
      inputs: [],
      name: "LSP4TokenTypeNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },
  },
  LSP6KeyManager: {
    /**
     * error BatchExecuteParamsLengthMismatch()
     *
     * 0x55a187db = keccak256('BatchExecuteParamsLengthMismatch()')
     */
    "0x55a187db": {
      sig: "BatchExecuteParamsLengthMismatch()",
      inputs: [],
      name: "BatchExecuteParamsLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the array parameters `uint256[] value` and `bytes[] payload` have different sizes. There should be the same number of elements for each array parameters.",
        },
      ],
      userdoc: [
        {
          notice:
            "The array parameters provided to the function `executeBatch(...)` do not have the same number of elements. (Different array param's length).",
        },
      ],
    },

    /**
     * error BatchExecuteRelayCallParamsLengthMismatch()
     *
     * 0xb4d50d21 = keccak256('BatchExecuteRelayCallParamsLengthMismatch()')
     */
    "0xb4d50d21": {
      sig: "BatchExecuteRelayCallParamsLengthMismatch()",
      inputs: [],
      name: "BatchExecuteRelayCallParamsLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when providing array parameters of different sizes to `executeRelayCallBatch(bytes[],uint256[],bytes[])`",
        },
      ],
      userdoc: [
        {
          notice:
            "The array parameters provided to the function `executeRelayCallBatch(...)` do not have the same number of elements. (Different array param's length).",
        },
      ],
    },

    /**
     * error CallingKeyManagerNotAllowed()
     *
     * 0xa431b236 = keccak256('CallingKeyManagerNotAllowed()')
     */
    "0xa431b236": {
      sig: "CallingKeyManagerNotAllowed()",
      inputs: [],
      name: "CallingKeyManagerNotAllowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when calling the KeyManager through `execute(uint256,address,uint256,bytes)`.",
        },
      ],
      userdoc: [
        {
          notice:
            "Calling the Key Manager address for this transaction is disallowed.",
        },
      ],
    },

    /**
     * error DelegateCallDisallowedViaKeyManager()
     *
     * 0x80d6ebae = keccak256('DelegateCallDisallowedViaKeyManager()')
     */
    "0x80d6ebae": {
      sig: "DelegateCallDisallowedViaKeyManager()",
      inputs: [],
      name: "DelegateCallDisallowedViaKeyManager",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to do a `delegatecall` via the ERC725X.execute(uint256,address,uint256,bytes) (operation type 4) function of the linked {target}. `DELEGATECALL` is disallowed by default on the LSP6KeyManager.",
        },
      ],
      userdoc: [
        {
          notice:
            "Performing DELEGATE CALLS via the Key Manager is currently disallowed.",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersEmptyArray()
     *
     * 0xe9ad2b5f = keccak256('ERC725X_ExecuteParametersEmptyArray()')
     */
    "0xe9ad2b5f": {
      sig: "ERC725X_ExecuteParametersEmptyArray()",
      inputs: [],
      name: "ERC725X_ExecuteParametersEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to the {executeBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersLengthMismatch()
     *
     * 0x3ff55f4d = keccak256('ERC725X_ExecuteParametersLengthMismatch()')
     */
    "0x3ff55f4d": {
      sig: "ERC725X_ExecuteParametersLengthMismatch()",
      inputs: [],
      name: "ERC725X_ExecuteParametersLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `operationTypes`, `targets` addresses, `values`, and `datas` array parameters provided when calling the {executeBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error InvalidDataValuesForDataKeys(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x1fa41397 = keccak256('InvalidDataValuesForDataKeys(bytes32,bytes)')
     */
    "0x1fa41397": {
      sig: "InvalidDataValuesForDataKeys(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "InvalidDataValuesForDataKeys",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the data value length is not one of the required lengths for the specific data key.",
          params: {
            dataKey:
              "The data key that has a required length for the data value.",
            dataValue: "The data value that has an invalid length.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Data value: `dataValue` length is different from the required length for the data key which is set.",
        },
      ],
    },

    /**
     * error InvalidERC725Function(
     *  bytes4 invalidFunction
     * )
     *
     * 0x2ba8851c = keccak256('InvalidERC725Function(bytes4)')
     */
    "0x2ba8851c": {
      sig: "InvalidERC725Function(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "invalidFunction", type: "bytes4" },
      ],
      name: "InvalidERC725Function",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to call a function on the linked {target}, that is not any of the following: - `setData(bytes32,bytes)` (ERC725Y) - `setDataBatch(bytes32[],bytes[])` (ERC725Y) - `execute(uint256,address,uint256,bytes)` (ERC725X) - `transferOwnership(address)` (LSP14) - `acceptOwnership()` (LSP14) - `renounceOwnership()` (LSP14)",
          params: {
            invalidFunction:
              "The `bytes4` selector of the function that was attempted to be called on the linked {target} but not recognised.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The Key Manager could not verify the calldata of the transaction because it could not recognise the function being called. Invalid function selector: `invalidFunction`.",
        },
      ],
    },

    /**
     * error InvalidEncodedAllowedCalls(
     *  bytes allowedCallsValue
     * )
     *
     * 0x187e77ab = keccak256('InvalidEncodedAllowedCalls(bytes)')
     */
    "0x187e77ab": {
      sig: "InvalidEncodedAllowedCalls(bytes)",
      inputs: [
        { internalType: "bytes", name: "allowedCallsValue", type: "bytes" },
      ],
      name: "InvalidEncodedAllowedCalls",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `allowedCallsValue` is not properly encoded as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]` (CompactBytesArray made of tuples that are 32 bytes long each). See LSP2 value type `CompactBytesArray` for more infos.",
          params: {
            allowedCallsValue:
              "The list of allowedCalls that are not encoded correctly as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]`.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Could not decode the Allowed Calls. Value = `allowedCallsValue`.",
        },
      ],
    },

    /**
     * error InvalidEncodedAllowedERC725YDataKeys(
     *  bytes value,
     *  string context
     * )
     *
     * 0xae6cbd37 = keccak256('InvalidEncodedAllowedERC725YDataKeys(bytes,string)')
     */
    "0xae6cbd37": {
      sig: "InvalidEncodedAllowedERC725YDataKeys(bytes,string)",
      inputs: [
        { internalType: "bytes", name: "value", type: "bytes" },
        { internalType: "string", name: "context", type: "string" },
      ],
      name: "InvalidEncodedAllowedERC725YDataKeys",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `value` is not encoded properly as a `bytes32[CompactBytesArray]`. The `context` string provides context on when this error occurred (_e.g: when fetching the `AllowedERC725YDataKeys` to verify the permissions of a controller, or when validating the `AllowedERC725YDataKeys` when setting them for a controller).",
          params: {
            context: "A brief description of where the error occurred.",
            value: "The value that is not a valid `bytes32[CompactBytesArray]`",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Error when reading the Allowed ERC725Y Data Keys. Reason: `context`, Allowed ERC725Y Data Keys value read: `value`.",
        },
      ],
    },

    /**
     * error InvalidLSP6Target()
     *
     * 0xfc854579 = keccak256('InvalidLSP6Target()')
     */
    "0xfc854579": {
      sig: "InvalidLSP6Target()",
      inputs: [],
      name: "InvalidLSP6Target",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the address provided to set as the {target} linked to this KeyManager is invalid (_e.g. `address(0)`_).",
        },
      ],
      userdoc: [
        {
          notice:
            "Invalid address supplied to link this Key Manager to (`address(0)`).",
        },
      ],
    },

    /**
     * error InvalidPayload(
     *  bytes payload
     * )
     *
     * 0x3621bbcc = keccak256('InvalidPayload(bytes)')
     */
    "0x3621bbcc": {
      sig: "InvalidPayload(bytes)",
      inputs: [{ internalType: "bytes", name: "payload", type: "bytes" }],
      name: "InvalidPayload",
      type: "error",
      devdoc: [{ details: "Reverts when the payload is invalid." }],
      userdoc: [{ notice: "Invalid calldata payload sent." }],
    },

    /**
     * error InvalidRelayNonce(
     *  address signer,
     *  uint256 invalidNonce,
     *  bytes signature
     * )
     *
     * 0xc9bd9eb9 = keccak256('InvalidRelayNonce(address,uint256,bytes)')
     */
    "0xc9bd9eb9": {
      sig: "InvalidRelayNonce(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "signer", type: "address" },
        { internalType: "uint256", name: "invalidNonce", type: "uint256" },
        { internalType: "bytes", name: "signature", type: "bytes" },
      ],
      name: "InvalidRelayNonce",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.",
          params: {
            invalidNonce: "The nonce retrieved for the `signer` address.",
            signature: "The signature used to retrieve the `signer` address.",
            signer: "The address of the signer.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The relay call failed because an invalid nonce was provided for the address `signer` that signed the execute relay call. Invalid nonce: `invalidNonce`, signature of signer: `signature`.",
        },
      ],
    },

    /**
     * error InvalidWhitelistedCall(
     *  address from
     * )
     *
     * 0x6fd203c5 = keccak256('InvalidWhitelistedCall(address)')
     */
    "0x6fd203c5": {
      sig: "InvalidWhitelistedCall(address)",
      inputs: [{ internalType: "address", name: "from", type: "address" }],
      name: "InvalidWhitelistedCall",
      type: "error",
      devdoc: [
        {
          details:
            'Reverts when a `from` address has _"any whitelisted call"_ as allowed call set. This revert happens during the verification of the permissions of the address for its allowed calls. A `from` address is not allowed to have 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff in its list of `AddressPermissions:AllowedCalls:<address>`, as this allows any STANDARD:ADDRESS:FUNCTION. This is equivalent to granting the SUPER permission and should never be valid.',
          params: {
            from: 'The controller address that has _"any allowed calls"_ whitelisted set.',
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Invalid allowed calls (`0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff`) set for address `from`. Could not perform external call.",
        },
      ],
    },

    /**
     * error KeyManagerCannotBeSetAsExtensionForLSP20Functions()
     *
     * 0x4a9fa8cf = keccak256('KeyManagerCannotBeSetAsExtensionForLSP20Functions()')
     */
    "0x4a9fa8cf": {
      sig: "KeyManagerCannotBeSetAsExtensionForLSP20Functions()",
      inputs: [],
      name: "KeyManagerCannotBeSetAsExtensionForLSP20Functions",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the address of the Key Manager is being set as extensions for lsp20 functions",
        },
      ],
      userdoc: [
        {
          notice:
            "Key Manager cannot be used as an LSP17 extension for LSP20 functions.",
        },
      ],
    },

    /**
     * error LSP6BatchExcessiveValueSent(
     *  uint256 totalValues,
     *  uint256 msgValue
     * )
     *
     * 0xa51868b6 = keccak256('LSP6BatchExcessiveValueSent(uint256,uint256)')
     */
    "0xa51868b6": {
      sig: "LSP6BatchExcessiveValueSent(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "totalValues", type: "uint256" },
        { internalType: "uint256", name: "msgValue", type: "uint256" },
      ],
      name: "LSP6BatchExcessiveValueSent",
      type: "error",
      devdoc: [
        {
          details:
            "This error occurs when there was too much funds sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on Reverts to avoid the KeyManager to holds some remaining funds sent to the following batch functions:  - execute(uint256[],bytes[])  - executeRelayCall(bytes[],uint256[],uint256[],bytes[]) This error occurs when `msg.value` is more than the sum of all the values being forwarded on each payloads (`values[]` parameter from the batch functions above).",
        },
      ],
      userdoc: [
        {
          notice:
            "Too much funds sent to forward each amount in the batch. No amount of native tokens should stay in the Key Manager.",
        },
      ],
    },

    /**
     * error LSP6BatchInsufficientValueSent(
     *  uint256 totalValues,
     *  uint256 msgValue
     * )
     *
     * 0x30a324ac = keccak256('LSP6BatchInsufficientValueSent(uint256,uint256)')
     */
    "0x30a324ac": {
      sig: "LSP6BatchInsufficientValueSent(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "totalValues", type: "uint256" },
        { internalType: "uint256", name: "msgValue", type: "uint256" },
      ],
      name: "LSP6BatchInsufficientValueSent",
      type: "error",
      devdoc: [
        {
          details:
            "This error occurs when there was not enough funds sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on each payloads (`values[]` parameter from the batch functions above). This mean that `msg.value` is less than the sum of all the values being forwarded on each payloads (`values[]` parameters).",
          params: {
            msgValue:
              "The amount of native tokens sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`.",
            totalValues:
              "The sum of all the values forwarded on each payloads (`values[]` parameter from the batch functions above).",
          },
        },
      ],
      userdoc: [
        {
          notice: "Not enough funds sent to forward each amount in the batch.",
        },
      ],
    },

    /**
     * error NoCallsAllowed(
     *  address from
     * )
     *
     * 0x6cb60587 = keccak256('NoCallsAllowed(address)')
     */
    "0x6cb60587": {
      sig: "NoCallsAllowed(address)",
      inputs: [{ internalType: "address", name: "from", type: "address" }],
      name: "NoCallsAllowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `from` address has no `AllowedCalls` set and cannot interact with any address using the linked {target}.",
          params: { from: "The address that has no AllowedCalls." },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` is not authorised to use the linked account contract to make external calls, because it has no Allowed Calls set.",
        },
      ],
    },

    /**
     * error NoERC725YDataKeysAllowed(
     *  address from
     * )
     *
     * 0xed7fa509 = keccak256('NoERC725YDataKeysAllowed(address)')
     */
    "0xed7fa509": {
      sig: "NoERC725YDataKeysAllowed(address)",
      inputs: [{ internalType: "address", name: "from", type: "address" }],
      name: "NoERC725YDataKeysAllowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `from` address has no AllowedERC725YDataKeys set and cannot set any ERC725Y data key on the ERC725Y storage of the linked {target}.",
          params: {
            from: "The address that has no `AllowedERC725YDataKeys` set.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` is not authorised to set data, because it has no ERC725Y Data Key allowed.",
        },
      ],
    },

    /**
     * error NoPermissionsSet(
     *  address from
     * )
     *
     * 0xf292052a = keccak256('NoPermissionsSet(address)')
     */
    "0xf292052a": {
      sig: "NoPermissionsSet(address)",
      inputs: [{ internalType: "address", name: "from", type: "address" }],
      name: "NoPermissionsSet",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when address `from` does not have any permissions set on the account linked to this Key Manager",
          params: { from: "the address that does not have permissions" },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` does not have any permission set on the contract linked to the Key Manager.",
        },
      ],
    },

    /**
     * error NotAllowedCall(
     *  address from,
     *  address to,
     *  bytes4 selector
     * )
     *
     * 0x45147bce = keccak256('NotAllowedCall(address,address,bytes4)')
     */
    "0x45147bce": {
      sig: "NotAllowedCall(address,address,bytes4)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "bytes4", name: "selector", type: "bytes4" },
      ],
      name: "NotAllowedCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `from` is not authorised to call the `execute(uint256,address,uint256,bytes)` function because of a not allowed callType, address, standard or function.",
          params: {
            from: "The controller that tried to call the `execute(uint256,address,uint256,bytes)` function.",
            selector:
              "If `to` is a contract, the bytes4 selector of the function that `from` is trying to call. If no function is called (_e.g: a native token transfer_), selector = `0x00000000`",
            to: "The address of an EOA or contract that `from` tried to call using the linked {target}",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` is not authorised to call the function `selector` on the `to` address.",
        },
      ],
    },

    /**
     * error NotAllowedERC725YDataKey(
     *  address from,
     *  bytes32 disallowedKey
     * )
     *
     * 0x557ae079 = keccak256('NotAllowedERC725YDataKey(address,bytes32)')
     */
    "0x557ae079": {
      sig: "NotAllowedERC725YDataKey(address,bytes32)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "bytes32", name: "disallowedKey", type: "bytes32" },
      ],
      name: "NotAllowedERC725YDataKey",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when address `from` is not authorised to set the key `disallowedKey` on the linked {target}.",
          params: {
            disallowedKey:
              "A bytes32 data key that `from` is not authorised to set on the ERC725Y storage of the linked {target}.",
            from: "address The controller that tried to `setData` on the linked {target}.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` is not authorised to set the data key `disallowedKey` on the contract linked to the Key Manager.",
        },
      ],
    },

    /**
     * error NotAuthorised(
     *  address from,
     *  string permission
     * )
     *
     * 0x3bdad6e6 = keccak256('NotAuthorised(address,string)')
     */
    "0x3bdad6e6": {
      sig: "NotAuthorised(address,string)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "string", name: "permission", type: "string" },
      ],
      name: "NotAuthorised",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when address `from` is not authorised and does not have `permission` on the linked {target}",
          params: {
            from: "address The address that was not authorised.",
            permission:
              "permission The permission required (_e.g: `SETDATA`, `CALL`, `TRANSFERVALUE`)",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` is not authorised to `permission` on the contract linked to the Key Manager.",
        },
      ],
    },

    /**
     * error NotRecognisedPermissionKey(
     *  bytes32 dataKey
     * )
     *
     * 0x0f7d735b = keccak256('NotRecognisedPermissionKey(bytes32)')
     */
    "0x0f7d735b": {
      sig: "NotRecognisedPermissionKey(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "NotRecognisedPermissionKey",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `dataKey` is a `bytes32` value that does not adhere to any of the permission data keys defined by the LSP6 standard",
          params: {
            dataKey:
              "The dataKey that does not match any of the standard LSP6 permission data keys.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The data key `dataKey` starts with `AddressPermissions` prefix but is none of the permission data keys defined in LSP6.",
        },
      ],
    },

    /**
     * error RelayCallBeforeStartTime()
     *
     * 0x00de4b8a = keccak256('RelayCallBeforeStartTime()')
     */
    "0x00de4b8a": {
      sig: "RelayCallBeforeStartTime()",
      inputs: [],
      name: "RelayCallBeforeStartTime",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the relay call is cannot yet bet executed. This mean that the starting timestamp provided to {executeRelayCall} function is bigger than the current timestamp.",
        },
      ],
      userdoc: [{ notice: "Relay call not valid yet." }],
    },

    /**
     * error RelayCallExpired()
     *
     * 0x5c53a98c = keccak256('RelayCallExpired()')
     */
    "0x5c53a98c": {
      sig: "RelayCallExpired()",
      inputs: [],
      name: "RelayCallExpired",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the period to execute the relay call has expired.",
        },
      ],
      userdoc: [{ notice: "Relay call expired (deadline passed)." }],
    },
  },
  LSP6KeyManagerInit: {
    /**
     * error BatchExecuteParamsLengthMismatch()
     *
     * 0x55a187db = keccak256('BatchExecuteParamsLengthMismatch()')
     */
    "0x55a187db": {
      sig: "BatchExecuteParamsLengthMismatch()",
      inputs: [],
      name: "BatchExecuteParamsLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the array parameters `uint256[] value` and `bytes[] payload` have different sizes. There should be the same number of elements for each array parameters.",
        },
      ],
      userdoc: [
        {
          notice:
            "The array parameters provided to the function `executeBatch(...)` do not have the same number of elements. (Different array param's length).",
        },
      ],
    },

    /**
     * error BatchExecuteRelayCallParamsLengthMismatch()
     *
     * 0xb4d50d21 = keccak256('BatchExecuteRelayCallParamsLengthMismatch()')
     */
    "0xb4d50d21": {
      sig: "BatchExecuteRelayCallParamsLengthMismatch()",
      inputs: [],
      name: "BatchExecuteRelayCallParamsLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when providing array parameters of different sizes to `executeRelayCallBatch(bytes[],uint256[],bytes[])`",
        },
      ],
      userdoc: [
        {
          notice:
            "The array parameters provided to the function `executeRelayCallBatch(...)` do not have the same number of elements. (Different array param's length).",
        },
      ],
    },

    /**
     * error CallingKeyManagerNotAllowed()
     *
     * 0xa431b236 = keccak256('CallingKeyManagerNotAllowed()')
     */
    "0xa431b236": {
      sig: "CallingKeyManagerNotAllowed()",
      inputs: [],
      name: "CallingKeyManagerNotAllowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when calling the KeyManager through `execute(uint256,address,uint256,bytes)`.",
        },
      ],
      userdoc: [
        {
          notice:
            "Calling the Key Manager address for this transaction is disallowed.",
        },
      ],
    },

    /**
     * error DelegateCallDisallowedViaKeyManager()
     *
     * 0x80d6ebae = keccak256('DelegateCallDisallowedViaKeyManager()')
     */
    "0x80d6ebae": {
      sig: "DelegateCallDisallowedViaKeyManager()",
      inputs: [],
      name: "DelegateCallDisallowedViaKeyManager",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to do a `delegatecall` via the ERC725X.execute(uint256,address,uint256,bytes) (operation type 4) function of the linked {target}. `DELEGATECALL` is disallowed by default on the LSP6KeyManager.",
        },
      ],
      userdoc: [
        {
          notice:
            "Performing DELEGATE CALLS via the Key Manager is currently disallowed.",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersEmptyArray()
     *
     * 0xe9ad2b5f = keccak256('ERC725X_ExecuteParametersEmptyArray()')
     */
    "0xe9ad2b5f": {
      sig: "ERC725X_ExecuteParametersEmptyArray()",
      inputs: [],
      name: "ERC725X_ExecuteParametersEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to the {executeBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725X_ExecuteParametersLengthMismatch()
     *
     * 0x3ff55f4d = keccak256('ERC725X_ExecuteParametersLengthMismatch()')
     */
    "0x3ff55f4d": {
      sig: "ERC725X_ExecuteParametersLengthMismatch()",
      inputs: [],
      name: "ERC725X_ExecuteParametersLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `operationTypes`, `targets` addresses, `values`, and `datas` array parameters provided when calling the {executeBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error InvalidDataValuesForDataKeys(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x1fa41397 = keccak256('InvalidDataValuesForDataKeys(bytes32,bytes)')
     */
    "0x1fa41397": {
      sig: "InvalidDataValuesForDataKeys(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "InvalidDataValuesForDataKeys",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the data value length is not one of the required lengths for the specific data key.",
          params: {
            dataKey:
              "The data key that has a required length for the data value.",
            dataValue: "The data value that has an invalid length.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Data value: `dataValue` length is different from the required length for the data key which is set.",
        },
      ],
    },

    /**
     * error InvalidERC725Function(
     *  bytes4 invalidFunction
     * )
     *
     * 0x2ba8851c = keccak256('InvalidERC725Function(bytes4)')
     */
    "0x2ba8851c": {
      sig: "InvalidERC725Function(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "invalidFunction", type: "bytes4" },
      ],
      name: "InvalidERC725Function",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to call a function on the linked {target}, that is not any of the following: - `setData(bytes32,bytes)` (ERC725Y) - `setDataBatch(bytes32[],bytes[])` (ERC725Y) - `execute(uint256,address,uint256,bytes)` (ERC725X) - `transferOwnership(address)` (LSP14) - `acceptOwnership()` (LSP14) - `renounceOwnership()` (LSP14)",
          params: {
            invalidFunction:
              "The `bytes4` selector of the function that was attempted to be called on the linked {target} but not recognised.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The Key Manager could not verify the calldata of the transaction because it could not recognise the function being called. Invalid function selector: `invalidFunction`.",
        },
      ],
    },

    /**
     * error InvalidEncodedAllowedCalls(
     *  bytes allowedCallsValue
     * )
     *
     * 0x187e77ab = keccak256('InvalidEncodedAllowedCalls(bytes)')
     */
    "0x187e77ab": {
      sig: "InvalidEncodedAllowedCalls(bytes)",
      inputs: [
        { internalType: "bytes", name: "allowedCallsValue", type: "bytes" },
      ],
      name: "InvalidEncodedAllowedCalls",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `allowedCallsValue` is not properly encoded as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]` (CompactBytesArray made of tuples that are 32 bytes long each). See LSP2 value type `CompactBytesArray` for more infos.",
          params: {
            allowedCallsValue:
              "The list of allowedCalls that are not encoded correctly as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]`.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Could not decode the Allowed Calls. Value = `allowedCallsValue`.",
        },
      ],
    },

    /**
     * error InvalidEncodedAllowedERC725YDataKeys(
     *  bytes value,
     *  string context
     * )
     *
     * 0xae6cbd37 = keccak256('InvalidEncodedAllowedERC725YDataKeys(bytes,string)')
     */
    "0xae6cbd37": {
      sig: "InvalidEncodedAllowedERC725YDataKeys(bytes,string)",
      inputs: [
        { internalType: "bytes", name: "value", type: "bytes" },
        { internalType: "string", name: "context", type: "string" },
      ],
      name: "InvalidEncodedAllowedERC725YDataKeys",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `value` is not encoded properly as a `bytes32[CompactBytesArray]`. The `context` string provides context on when this error occurred (_e.g: when fetching the `AllowedERC725YDataKeys` to verify the permissions of a controller, or when validating the `AllowedERC725YDataKeys` when setting them for a controller).",
          params: {
            context: "A brief description of where the error occurred.",
            value: "The value that is not a valid `bytes32[CompactBytesArray]`",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Error when reading the Allowed ERC725Y Data Keys. Reason: `context`, Allowed ERC725Y Data Keys value read: `value`.",
        },
      ],
    },

    /**
     * error InvalidLSP6Target()
     *
     * 0xfc854579 = keccak256('InvalidLSP6Target()')
     */
    "0xfc854579": {
      sig: "InvalidLSP6Target()",
      inputs: [],
      name: "InvalidLSP6Target",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the address provided to set as the {target} linked to this KeyManager is invalid (_e.g. `address(0)`_).",
        },
      ],
      userdoc: [
        {
          notice:
            "Invalid address supplied to link this Key Manager to (`address(0)`).",
        },
      ],
    },

    /**
     * error InvalidPayload(
     *  bytes payload
     * )
     *
     * 0x3621bbcc = keccak256('InvalidPayload(bytes)')
     */
    "0x3621bbcc": {
      sig: "InvalidPayload(bytes)",
      inputs: [{ internalType: "bytes", name: "payload", type: "bytes" }],
      name: "InvalidPayload",
      type: "error",
      devdoc: [{ details: "Reverts when the payload is invalid." }],
      userdoc: [{ notice: "Invalid calldata payload sent." }],
    },

    /**
     * error InvalidRelayNonce(
     *  address signer,
     *  uint256 invalidNonce,
     *  bytes signature
     * )
     *
     * 0xc9bd9eb9 = keccak256('InvalidRelayNonce(address,uint256,bytes)')
     */
    "0xc9bd9eb9": {
      sig: "InvalidRelayNonce(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "signer", type: "address" },
        { internalType: "uint256", name: "invalidNonce", type: "uint256" },
        { internalType: "bytes", name: "signature", type: "bytes" },
      ],
      name: "InvalidRelayNonce",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.",
          params: {
            invalidNonce: "The nonce retrieved for the `signer` address.",
            signature: "The signature used to retrieve the `signer` address.",
            signer: "The address of the signer.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The relay call failed because an invalid nonce was provided for the address `signer` that signed the execute relay call. Invalid nonce: `invalidNonce`, signature of signer: `signature`.",
        },
      ],
    },

    /**
     * error InvalidWhitelistedCall(
     *  address from
     * )
     *
     * 0x6fd203c5 = keccak256('InvalidWhitelistedCall(address)')
     */
    "0x6fd203c5": {
      sig: "InvalidWhitelistedCall(address)",
      inputs: [{ internalType: "address", name: "from", type: "address" }],
      name: "InvalidWhitelistedCall",
      type: "error",
      devdoc: [
        {
          details:
            'Reverts when a `from` address has _"any whitelisted call"_ as allowed call set. This revert happens during the verification of the permissions of the address for its allowed calls. A `from` address is not allowed to have 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff in its list of `AddressPermissions:AllowedCalls:<address>`, as this allows any STANDARD:ADDRESS:FUNCTION. This is equivalent to granting the SUPER permission and should never be valid.',
          params: {
            from: 'The controller address that has _"any allowed calls"_ whitelisted set.',
          },
        },
      ],
      userdoc: [
        {
          notice:
            "Invalid allowed calls (`0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff`) set for address `from`. Could not perform external call.",
        },
      ],
    },

    /**
     * error KeyManagerCannotBeSetAsExtensionForLSP20Functions()
     *
     * 0x4a9fa8cf = keccak256('KeyManagerCannotBeSetAsExtensionForLSP20Functions()')
     */
    "0x4a9fa8cf": {
      sig: "KeyManagerCannotBeSetAsExtensionForLSP20Functions()",
      inputs: [],
      name: "KeyManagerCannotBeSetAsExtensionForLSP20Functions",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the address of the Key Manager is being set as extensions for lsp20 functions",
        },
      ],
      userdoc: [
        {
          notice:
            "Key Manager cannot be used as an LSP17 extension for LSP20 functions.",
        },
      ],
    },

    /**
     * error LSP6BatchExcessiveValueSent(
     *  uint256 totalValues,
     *  uint256 msgValue
     * )
     *
     * 0xa51868b6 = keccak256('LSP6BatchExcessiveValueSent(uint256,uint256)')
     */
    "0xa51868b6": {
      sig: "LSP6BatchExcessiveValueSent(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "totalValues", type: "uint256" },
        { internalType: "uint256", name: "msgValue", type: "uint256" },
      ],
      name: "LSP6BatchExcessiveValueSent",
      type: "error",
      devdoc: [
        {
          details:
            "This error occurs when there was too much funds sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on Reverts to avoid the KeyManager to holds some remaining funds sent to the following batch functions:  - execute(uint256[],bytes[])  - executeRelayCall(bytes[],uint256[],uint256[],bytes[]) This error occurs when `msg.value` is more than the sum of all the values being forwarded on each payloads (`values[]` parameter from the batch functions above).",
        },
      ],
      userdoc: [
        {
          notice:
            "Too much funds sent to forward each amount in the batch. No amount of native tokens should stay in the Key Manager.",
        },
      ],
    },

    /**
     * error LSP6BatchInsufficientValueSent(
     *  uint256 totalValues,
     *  uint256 msgValue
     * )
     *
     * 0x30a324ac = keccak256('LSP6BatchInsufficientValueSent(uint256,uint256)')
     */
    "0x30a324ac": {
      sig: "LSP6BatchInsufficientValueSent(uint256,uint256)",
      inputs: [
        { internalType: "uint256", name: "totalValues", type: "uint256" },
        { internalType: "uint256", name: "msgValue", type: "uint256" },
      ],
      name: "LSP6BatchInsufficientValueSent",
      type: "error",
      devdoc: [
        {
          details:
            "This error occurs when there was not enough funds sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on each payloads (`values[]` parameter from the batch functions above). This mean that `msg.value` is less than the sum of all the values being forwarded on each payloads (`values[]` parameters).",
          params: {
            msgValue:
              "The amount of native tokens sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`.",
            totalValues:
              "The sum of all the values forwarded on each payloads (`values[]` parameter from the batch functions above).",
          },
        },
      ],
      userdoc: [
        {
          notice: "Not enough funds sent to forward each amount in the batch.",
        },
      ],
    },

    /**
     * error NoCallsAllowed(
     *  address from
     * )
     *
     * 0x6cb60587 = keccak256('NoCallsAllowed(address)')
     */
    "0x6cb60587": {
      sig: "NoCallsAllowed(address)",
      inputs: [{ internalType: "address", name: "from", type: "address" }],
      name: "NoCallsAllowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `from` address has no `AllowedCalls` set and cannot interact with any address using the linked {target}.",
          params: { from: "The address that has no AllowedCalls." },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` is not authorised to use the linked account contract to make external calls, because it has no Allowed Calls set.",
        },
      ],
    },

    /**
     * error NoERC725YDataKeysAllowed(
     *  address from
     * )
     *
     * 0xed7fa509 = keccak256('NoERC725YDataKeysAllowed(address)')
     */
    "0xed7fa509": {
      sig: "NoERC725YDataKeysAllowed(address)",
      inputs: [{ internalType: "address", name: "from", type: "address" }],
      name: "NoERC725YDataKeysAllowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the `from` address has no AllowedERC725YDataKeys set and cannot set any ERC725Y data key on the ERC725Y storage of the linked {target}.",
          params: {
            from: "The address that has no `AllowedERC725YDataKeys` set.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` is not authorised to set data, because it has no ERC725Y Data Key allowed.",
        },
      ],
    },

    /**
     * error NoPermissionsSet(
     *  address from
     * )
     *
     * 0xf292052a = keccak256('NoPermissionsSet(address)')
     */
    "0xf292052a": {
      sig: "NoPermissionsSet(address)",
      inputs: [{ internalType: "address", name: "from", type: "address" }],
      name: "NoPermissionsSet",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when address `from` does not have any permissions set on the account linked to this Key Manager",
          params: { from: "the address that does not have permissions" },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` does not have any permission set on the contract linked to the Key Manager.",
        },
      ],
    },

    /**
     * error NotAllowedCall(
     *  address from,
     *  address to,
     *  bytes4 selector
     * )
     *
     * 0x45147bce = keccak256('NotAllowedCall(address,address,bytes4)')
     */
    "0x45147bce": {
      sig: "NotAllowedCall(address,address,bytes4)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "bytes4", name: "selector", type: "bytes4" },
      ],
      name: "NotAllowedCall",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `from` is not authorised to call the `execute(uint256,address,uint256,bytes)` function because of a not allowed callType, address, standard or function.",
          params: {
            from: "The controller that tried to call the `execute(uint256,address,uint256,bytes)` function.",
            selector:
              "If `to` is a contract, the bytes4 selector of the function that `from` is trying to call. If no function is called (_e.g: a native token transfer_), selector = `0x00000000`",
            to: "The address of an EOA or contract that `from` tried to call using the linked {target}",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` is not authorised to call the function `selector` on the `to` address.",
        },
      ],
    },

    /**
     * error NotAllowedERC725YDataKey(
     *  address from,
     *  bytes32 disallowedKey
     * )
     *
     * 0x557ae079 = keccak256('NotAllowedERC725YDataKey(address,bytes32)')
     */
    "0x557ae079": {
      sig: "NotAllowedERC725YDataKey(address,bytes32)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "bytes32", name: "disallowedKey", type: "bytes32" },
      ],
      name: "NotAllowedERC725YDataKey",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when address `from` is not authorised to set the key `disallowedKey` on the linked {target}.",
          params: {
            disallowedKey:
              "A bytes32 data key that `from` is not authorised to set on the ERC725Y storage of the linked {target}.",
            from: "address The controller that tried to `setData` on the linked {target}.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` is not authorised to set the data key `disallowedKey` on the contract linked to the Key Manager.",
        },
      ],
    },

    /**
     * error NotAuthorised(
     *  address from,
     *  string permission
     * )
     *
     * 0x3bdad6e6 = keccak256('NotAuthorised(address,string)')
     */
    "0x3bdad6e6": {
      sig: "NotAuthorised(address,string)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "string", name: "permission", type: "string" },
      ],
      name: "NotAuthorised",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when address `from` is not authorised and does not have `permission` on the linked {target}",
          params: {
            from: "address The address that was not authorised.",
            permission:
              "permission The permission required (_e.g: `SETDATA`, `CALL`, `TRANSFERVALUE`)",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The address `from` is not authorised to `permission` on the contract linked to the Key Manager.",
        },
      ],
    },

    /**
     * error NotRecognisedPermissionKey(
     *  bytes32 dataKey
     * )
     *
     * 0x0f7d735b = keccak256('NotRecognisedPermissionKey(bytes32)')
     */
    "0x0f7d735b": {
      sig: "NotRecognisedPermissionKey(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "NotRecognisedPermissionKey",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `dataKey` is a `bytes32` value that does not adhere to any of the permission data keys defined by the LSP6 standard",
          params: {
            dataKey:
              "The dataKey that does not match any of the standard LSP6 permission data keys.",
          },
        },
      ],
      userdoc: [
        {
          notice:
            "The data key `dataKey` starts with `AddressPermissions` prefix but is none of the permission data keys defined in LSP6.",
        },
      ],
    },

    /**
     * error RelayCallBeforeStartTime()
     *
     * 0x00de4b8a = keccak256('RelayCallBeforeStartTime()')
     */
    "0x00de4b8a": {
      sig: "RelayCallBeforeStartTime()",
      inputs: [],
      name: "RelayCallBeforeStartTime",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the relay call is cannot yet bet executed. This mean that the starting timestamp provided to {executeRelayCall} function is bigger than the current timestamp.",
        },
      ],
      userdoc: [{ notice: "Relay call not valid yet." }],
    },

    /**
     * error RelayCallExpired()
     *
     * 0x5c53a98c = keccak256('RelayCallExpired()')
     */
    "0x5c53a98c": {
      sig: "RelayCallExpired()",
      inputs: [],
      name: "RelayCallExpired",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the period to execute the relay call has expired.",
        },
      ],
      userdoc: [{ notice: "Relay call expired (deadline passed)." }],
    },
  },
  LSP7DigitalAsset: {
    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error InvalidExtensionAddress(
     *  bytes storedData
     * )
     *
     * 0x42bfe79f = keccak256('InvalidExtensionAddress(bytes)')
     */
    "0x42bfe79f": {
      sig: "InvalidExtensionAddress(bytes)",
      inputs: [{ internalType: "bytes", name: "storedData", type: "bytes" }],
      name: "InvalidExtensionAddress",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)",
        },
      ],
    },

    /**
     * error InvalidFunctionSelector(
     *  bytes data
     * )
     *
     * 0xe5099ee3 = keccak256('InvalidFunctionSelector(bytes)')
     */
    "0xe5099ee3": {
      sig: "InvalidFunctionSelector(bytes)",
      inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
      name: "InvalidFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the contract is called with a function selector not valid (less than 4 bytes of data)",
        },
      ],
    },

    /**
     * error LSP4TokenNameNotEditable()
     *
     * 0x85c169bd = keccak256('LSP4TokenNameNotEditable()')
     */
    "0x85c169bd": {
      sig: "LSP4TokenNameNotEditable()",
      inputs: [],
      name: "LSP4TokenNameNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenSymbolNotEditable()
     *
     * 0x76755b38 = keccak256('LSP4TokenSymbolNotEditable()')
     */
    "0x76755b38": {
      sig: "LSP4TokenSymbolNotEditable()",
      inputs: [],
      name: "LSP4TokenSymbolNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenTypeNotEditable()
     *
     * 0x4ef6d7fb = keccak256('LSP4TokenTypeNotEditable()')
     */
    "0x4ef6d7fb": {
      sig: "LSP4TokenTypeNotEditable()",
      inputs: [],
      name: "LSP4TokenTypeNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP7AmountExceedsAuthorizedAmount(
     *  address tokenOwner,
     *  uint256 authorizedAmount,
     *  address operator,
     *  uint256 amount
     * )
     *
     * 0xf3a6b691 = keccak256('LSP7AmountExceedsAuthorizedAmount(address,uint256,address,uint256)')
     */
    "0xf3a6b691": {
      sig: "LSP7AmountExceedsAuthorizedAmount(address,uint256,address,uint256)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "uint256", name: "authorizedAmount", type: "uint256" },
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "LSP7AmountExceedsAuthorizedAmount",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when `operator` of `tokenOwner` send an `amount` of tokens larger than the `authorizedAmount`.",
        },
      ],
    },

    /**
     * error LSP7AmountExceedsBalance(
     *  uint256 balance,
     *  address tokenOwner,
     *  uint256 amount
     * )
     *
     * 0x08d47949 = keccak256('LSP7AmountExceedsBalance(uint256,address,uint256)')
     */
    "0x08d47949": {
      sig: "LSP7AmountExceedsBalance(uint256,address,uint256)",
      inputs: [
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "LSP7AmountExceedsBalance",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when sending an `amount` of tokens larger than the current `balance` of the `tokenOwner`.",
        },
      ],
    },

    /**
     * error LSP7BatchCallFailed(
     *  uint256 callIndex
     * )
     *
     * 0xb774c284 = keccak256('LSP7BatchCallFailed(uint256)')
     */
    "0xb774c284": {
      sig: "LSP7BatchCallFailed(uint256)",
      inputs: [{ internalType: "uint256", name: "callIndex", type: "uint256" }],
      name: "LSP7BatchCallFailed",
      type: "error",
      devdoc: [{ details: "Reverts when a batch call failed." }],
      userdoc: [{ notice: "Batch call failed." }],
    },

    /**
     * error LSP7CannotSendToSelf()
     *
     * 0xb9afb000 = keccak256('LSP7CannotSendToSelf()')
     */
    "0xb9afb000": {
      sig: "LSP7CannotSendToSelf()",
      inputs: [],
      name: "LSP7CannotSendToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when specifying the same address for `from` or `to` in a token transfer.",
        },
      ],
    },

    /**
     * error LSP7CannotSendWithAddressZero()
     *
     * 0xd2d5ec30 = keccak256('LSP7CannotSendWithAddressZero()')
     */
    "0xd2d5ec30": {
      sig: "LSP7CannotSendWithAddressZero()",
      inputs: [],
      name: "LSP7CannotSendWithAddressZero",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to: - mint tokens to the zero address. - burn tokens from the zero address. - transfer tokens from or to the zero address.",
        },
      ],
    },

    /**
     * error LSP7CannotUseAddressZeroAsOperator()
     *
     * 0x6355e766 = keccak256('LSP7CannotUseAddressZeroAsOperator()')
     */
    "0x6355e766": {
      sig: "LSP7CannotUseAddressZeroAsOperator()",
      inputs: [],
      name: "LSP7CannotUseAddressZeroAsOperator",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to set the zero address as an operator.",
        },
      ],
    },

    /**
     * error LSP7DecreasedAllowanceBelowZero()
     *
     * 0x0ef76c35 = keccak256('LSP7DecreasedAllowanceBelowZero()')
     */
    "0x0ef76c35": {
      sig: "LSP7DecreasedAllowanceBelowZero()",
      inputs: [],
      name: "LSP7DecreasedAllowanceBelowZero",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to decrease an operator's allowance to more than its current allowance.",
        },
      ],
    },

    /**
     * error LSP7InvalidTransferBatch()
     *
     * 0x263eee8d = keccak256('LSP7InvalidTransferBatch()')
     */
    "0x263eee8d": {
      sig: "LSP7InvalidTransferBatch()",
      inputs: [],
      name: "LSP7InvalidTransferBatch",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the array parameters used in {transferBatch} have different lengths.",
        },
      ],
    },

    /**
     * error LSP7NotifyTokenReceiverContractMissingLSP1Interface(
     *  address tokenReceiver
     * )
     *
     * 0xa608fbb6 = keccak256('LSP7NotifyTokenReceiverContractMissingLSP1Interface(address)')
     */
    "0xa608fbb6": {
      sig: "LSP7NotifyTokenReceiverContractMissingLSP1Interface(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP7NotifyTokenReceiverContractMissingLSP1Interface",
      type: "error",
      devdoc: [
        {
          details:
            "reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP7NotifyTokenReceiverIsEOA(
     *  address tokenReceiver
     * )
     *
     * 0x26c247f4 = keccak256('LSP7NotifyTokenReceiverIsEOA(address)')
     */
    "0x26c247f4": {
      sig: "LSP7NotifyTokenReceiverIsEOA(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP7NotifyTokenReceiverIsEOA",
      type: "error",
      devdoc: [
        {
          details:
            "reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP7TokenContractCannotHoldValue()
     *
     * 0x388f5adc = keccak256('LSP7TokenContractCannotHoldValue()')
     */
    "0x388f5adc": {
      sig: "LSP7TokenContractCannotHoldValue()",
      inputs: [],
      name: "LSP7TokenContractCannotHoldValue",
      type: "error",
      devdoc: [
        {
          details:
            "Error occurs when sending native tokens to the LSP7 contract without sending any data. E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.",
        },
      ],
      userdoc: [{ notice: "LSP7 contract cannot receive native tokens." }],
    },

    /**
     * error LSP7TokenOwnerCannotBeOperator()
     *
     * 0xdab75047 = keccak256('LSP7TokenOwnerCannotBeOperator()')
     */
    "0xdab75047": {
      sig: "LSP7TokenOwnerCannotBeOperator()",
      inputs: [],
      name: "LSP7TokenOwnerCannotBeOperator",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to authorize or revoke the token's owner as an operator.",
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },

    /**
     * error OperatorAllowanceCannotBeIncreasedFromZero(
     *  address operator
     * )
     *
     * 0xcba6e977 = keccak256('OperatorAllowanceCannotBeIncreasedFromZero(address)')
     */
    "0xcba6e977": {
      sig: "OperatorAllowanceCannotBeIncreasedFromZero(address)",
      inputs: [{ internalType: "address", name: "operator", type: "address" }],
      name: "OperatorAllowanceCannotBeIncreasedFromZero",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when token owner call {increaseAllowance} for an operator that does not have any allowance",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },
  },
  LSP7DigitalAssetInitAbstract: {
    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error InvalidExtensionAddress(
     *  bytes storedData
     * )
     *
     * 0x42bfe79f = keccak256('InvalidExtensionAddress(bytes)')
     */
    "0x42bfe79f": {
      sig: "InvalidExtensionAddress(bytes)",
      inputs: [{ internalType: "bytes", name: "storedData", type: "bytes" }],
      name: "InvalidExtensionAddress",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)",
        },
      ],
    },

    /**
     * error InvalidFunctionSelector(
     *  bytes data
     * )
     *
     * 0xe5099ee3 = keccak256('InvalidFunctionSelector(bytes)')
     */
    "0xe5099ee3": {
      sig: "InvalidFunctionSelector(bytes)",
      inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
      name: "InvalidFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the contract is called with a function selector not valid (less than 4 bytes of data)",
        },
      ],
    },

    /**
     * error LSP4TokenNameNotEditable()
     *
     * 0x85c169bd = keccak256('LSP4TokenNameNotEditable()')
     */
    "0x85c169bd": {
      sig: "LSP4TokenNameNotEditable()",
      inputs: [],
      name: "LSP4TokenNameNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenSymbolNotEditable()
     *
     * 0x76755b38 = keccak256('LSP4TokenSymbolNotEditable()')
     */
    "0x76755b38": {
      sig: "LSP4TokenSymbolNotEditable()",
      inputs: [],
      name: "LSP4TokenSymbolNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenTypeNotEditable()
     *
     * 0x4ef6d7fb = keccak256('LSP4TokenTypeNotEditable()')
     */
    "0x4ef6d7fb": {
      sig: "LSP4TokenTypeNotEditable()",
      inputs: [],
      name: "LSP4TokenTypeNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP7AmountExceedsAuthorizedAmount(
     *  address tokenOwner,
     *  uint256 authorizedAmount,
     *  address operator,
     *  uint256 amount
     * )
     *
     * 0xf3a6b691 = keccak256('LSP7AmountExceedsAuthorizedAmount(address,uint256,address,uint256)')
     */
    "0xf3a6b691": {
      sig: "LSP7AmountExceedsAuthorizedAmount(address,uint256,address,uint256)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "uint256", name: "authorizedAmount", type: "uint256" },
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "LSP7AmountExceedsAuthorizedAmount",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when `operator` of `tokenOwner` send an `amount` of tokens larger than the `authorizedAmount`.",
        },
      ],
    },

    /**
     * error LSP7AmountExceedsBalance(
     *  uint256 balance,
     *  address tokenOwner,
     *  uint256 amount
     * )
     *
     * 0x08d47949 = keccak256('LSP7AmountExceedsBalance(uint256,address,uint256)')
     */
    "0x08d47949": {
      sig: "LSP7AmountExceedsBalance(uint256,address,uint256)",
      inputs: [
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "LSP7AmountExceedsBalance",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when sending an `amount` of tokens larger than the current `balance` of the `tokenOwner`.",
        },
      ],
    },

    /**
     * error LSP7BatchCallFailed(
     *  uint256 callIndex
     * )
     *
     * 0xb774c284 = keccak256('LSP7BatchCallFailed(uint256)')
     */
    "0xb774c284": {
      sig: "LSP7BatchCallFailed(uint256)",
      inputs: [{ internalType: "uint256", name: "callIndex", type: "uint256" }],
      name: "LSP7BatchCallFailed",
      type: "error",
      devdoc: [{ details: "Reverts when a batch call failed." }],
      userdoc: [{ notice: "Batch call failed." }],
    },

    /**
     * error LSP7CannotSendToSelf()
     *
     * 0xb9afb000 = keccak256('LSP7CannotSendToSelf()')
     */
    "0xb9afb000": {
      sig: "LSP7CannotSendToSelf()",
      inputs: [],
      name: "LSP7CannotSendToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when specifying the same address for `from` or `to` in a token transfer.",
        },
      ],
    },

    /**
     * error LSP7CannotSendWithAddressZero()
     *
     * 0xd2d5ec30 = keccak256('LSP7CannotSendWithAddressZero()')
     */
    "0xd2d5ec30": {
      sig: "LSP7CannotSendWithAddressZero()",
      inputs: [],
      name: "LSP7CannotSendWithAddressZero",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to: - mint tokens to the zero address. - burn tokens from the zero address. - transfer tokens from or to the zero address.",
        },
      ],
    },

    /**
     * error LSP7CannotUseAddressZeroAsOperator()
     *
     * 0x6355e766 = keccak256('LSP7CannotUseAddressZeroAsOperator()')
     */
    "0x6355e766": {
      sig: "LSP7CannotUseAddressZeroAsOperator()",
      inputs: [],
      name: "LSP7CannotUseAddressZeroAsOperator",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to set the zero address as an operator.",
        },
      ],
    },

    /**
     * error LSP7DecreasedAllowanceBelowZero()
     *
     * 0x0ef76c35 = keccak256('LSP7DecreasedAllowanceBelowZero()')
     */
    "0x0ef76c35": {
      sig: "LSP7DecreasedAllowanceBelowZero()",
      inputs: [],
      name: "LSP7DecreasedAllowanceBelowZero",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to decrease an operator's allowance to more than its current allowance.",
        },
      ],
    },

    /**
     * error LSP7InvalidTransferBatch()
     *
     * 0x263eee8d = keccak256('LSP7InvalidTransferBatch()')
     */
    "0x263eee8d": {
      sig: "LSP7InvalidTransferBatch()",
      inputs: [],
      name: "LSP7InvalidTransferBatch",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the array parameters used in {transferBatch} have different lengths.",
        },
      ],
    },

    /**
     * error LSP7NotifyTokenReceiverContractMissingLSP1Interface(
     *  address tokenReceiver
     * )
     *
     * 0xa608fbb6 = keccak256('LSP7NotifyTokenReceiverContractMissingLSP1Interface(address)')
     */
    "0xa608fbb6": {
      sig: "LSP7NotifyTokenReceiverContractMissingLSP1Interface(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP7NotifyTokenReceiverContractMissingLSP1Interface",
      type: "error",
      devdoc: [
        {
          details:
            "reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP7NotifyTokenReceiverIsEOA(
     *  address tokenReceiver
     * )
     *
     * 0x26c247f4 = keccak256('LSP7NotifyTokenReceiverIsEOA(address)')
     */
    "0x26c247f4": {
      sig: "LSP7NotifyTokenReceiverIsEOA(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP7NotifyTokenReceiverIsEOA",
      type: "error",
      devdoc: [
        {
          details:
            "reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP7TokenContractCannotHoldValue()
     *
     * 0x388f5adc = keccak256('LSP7TokenContractCannotHoldValue()')
     */
    "0x388f5adc": {
      sig: "LSP7TokenContractCannotHoldValue()",
      inputs: [],
      name: "LSP7TokenContractCannotHoldValue",
      type: "error",
      devdoc: [
        {
          details:
            "Error occurs when sending native tokens to the LSP7 contract without sending any data. E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.",
        },
      ],
      userdoc: [{ notice: "LSP7 contract cannot receive native tokens." }],
    },

    /**
     * error LSP7TokenOwnerCannotBeOperator()
     *
     * 0xdab75047 = keccak256('LSP7TokenOwnerCannotBeOperator()')
     */
    "0xdab75047": {
      sig: "LSP7TokenOwnerCannotBeOperator()",
      inputs: [],
      name: "LSP7TokenOwnerCannotBeOperator",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to authorize or revoke the token's owner as an operator.",
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },

    /**
     * error OperatorAllowanceCannotBeIncreasedFromZero(
     *  address operator
     * )
     *
     * 0xcba6e977 = keccak256('OperatorAllowanceCannotBeIncreasedFromZero(address)')
     */
    "0xcba6e977": {
      sig: "OperatorAllowanceCannotBeIncreasedFromZero(address)",
      inputs: [{ internalType: "address", name: "operator", type: "address" }],
      name: "OperatorAllowanceCannotBeIncreasedFromZero",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when token owner call {increaseAllowance} for an operator that does not have any allowance",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },
  },
  LSP7CappedSupply: {
    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error InvalidExtensionAddress(
     *  bytes storedData
     * )
     *
     * 0x42bfe79f = keccak256('InvalidExtensionAddress(bytes)')
     */
    "0x42bfe79f": {
      sig: "InvalidExtensionAddress(bytes)",
      inputs: [{ internalType: "bytes", name: "storedData", type: "bytes" }],
      name: "InvalidExtensionAddress",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)",
        },
      ],
    },

    /**
     * error InvalidFunctionSelector(
     *  bytes data
     * )
     *
     * 0xe5099ee3 = keccak256('InvalidFunctionSelector(bytes)')
     */
    "0xe5099ee3": {
      sig: "InvalidFunctionSelector(bytes)",
      inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
      name: "InvalidFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the contract is called with a function selector not valid (less than 4 bytes of data)",
        },
      ],
    },

    /**
     * error LSP4TokenNameNotEditable()
     *
     * 0x85c169bd = keccak256('LSP4TokenNameNotEditable()')
     */
    "0x85c169bd": {
      sig: "LSP4TokenNameNotEditable()",
      inputs: [],
      name: "LSP4TokenNameNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenSymbolNotEditable()
     *
     * 0x76755b38 = keccak256('LSP4TokenSymbolNotEditable()')
     */
    "0x76755b38": {
      sig: "LSP4TokenSymbolNotEditable()",
      inputs: [],
      name: "LSP4TokenSymbolNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenTypeNotEditable()
     *
     * 0x4ef6d7fb = keccak256('LSP4TokenTypeNotEditable()')
     */
    "0x4ef6d7fb": {
      sig: "LSP4TokenTypeNotEditable()",
      inputs: [],
      name: "LSP4TokenTypeNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP7AmountExceedsAuthorizedAmount(
     *  address tokenOwner,
     *  uint256 authorizedAmount,
     *  address operator,
     *  uint256 amount
     * )
     *
     * 0xf3a6b691 = keccak256('LSP7AmountExceedsAuthorizedAmount(address,uint256,address,uint256)')
     */
    "0xf3a6b691": {
      sig: "LSP7AmountExceedsAuthorizedAmount(address,uint256,address,uint256)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "uint256", name: "authorizedAmount", type: "uint256" },
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "LSP7AmountExceedsAuthorizedAmount",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when `operator` of `tokenOwner` send an `amount` of tokens larger than the `authorizedAmount`.",
        },
      ],
    },

    /**
     * error LSP7AmountExceedsBalance(
     *  uint256 balance,
     *  address tokenOwner,
     *  uint256 amount
     * )
     *
     * 0x08d47949 = keccak256('LSP7AmountExceedsBalance(uint256,address,uint256)')
     */
    "0x08d47949": {
      sig: "LSP7AmountExceedsBalance(uint256,address,uint256)",
      inputs: [
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "LSP7AmountExceedsBalance",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when sending an `amount` of tokens larger than the current `balance` of the `tokenOwner`.",
        },
      ],
    },

    /**
     * error LSP7BatchCallFailed(
     *  uint256 callIndex
     * )
     *
     * 0xb774c284 = keccak256('LSP7BatchCallFailed(uint256)')
     */
    "0xb774c284": {
      sig: "LSP7BatchCallFailed(uint256)",
      inputs: [{ internalType: "uint256", name: "callIndex", type: "uint256" }],
      name: "LSP7BatchCallFailed",
      type: "error",
      devdoc: [{ details: "Reverts when a batch call failed." }],
      userdoc: [{ notice: "Batch call failed." }],
    },

    /**
     * error LSP7CannotSendToSelf()
     *
     * 0xb9afb000 = keccak256('LSP7CannotSendToSelf()')
     */
    "0xb9afb000": {
      sig: "LSP7CannotSendToSelf()",
      inputs: [],
      name: "LSP7CannotSendToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when specifying the same address for `from` or `to` in a token transfer.",
        },
      ],
    },

    /**
     * error LSP7CannotSendWithAddressZero()
     *
     * 0xd2d5ec30 = keccak256('LSP7CannotSendWithAddressZero()')
     */
    "0xd2d5ec30": {
      sig: "LSP7CannotSendWithAddressZero()",
      inputs: [],
      name: "LSP7CannotSendWithAddressZero",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to: - mint tokens to the zero address. - burn tokens from the zero address. - transfer tokens from or to the zero address.",
        },
      ],
    },

    /**
     * error LSP7CannotUseAddressZeroAsOperator()
     *
     * 0x6355e766 = keccak256('LSP7CannotUseAddressZeroAsOperator()')
     */
    "0x6355e766": {
      sig: "LSP7CannotUseAddressZeroAsOperator()",
      inputs: [],
      name: "LSP7CannotUseAddressZeroAsOperator",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to set the zero address as an operator.",
        },
      ],
    },

    /**
     * error LSP7CappedSupplyCannotMintOverCap()
     *
     * 0xeacbf0d1 = keccak256('LSP7CappedSupplyCannotMintOverCap()')
     */
    "0xeacbf0d1": {
      sig: "LSP7CappedSupplyCannotMintOverCap()",
      inputs: [],
      name: "LSP7CappedSupplyCannotMintOverCap",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to mint tokens but the {totalSupply} has reached the maximum {tokenSupplyCap}.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot mint anymore as total supply reached the maximum cap.",
        },
      ],
    },

    /**
     * error LSP7CappedSupplyRequired()
     *
     * 0xacf1d8c5 = keccak256('LSP7CappedSupplyRequired()')
     */
    "0xacf1d8c5": {
      sig: "LSP7CappedSupplyRequired()",
      inputs: [],
      name: "LSP7CappedSupplyRequired",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when setting `0` for the {tokenSupplyCap}. The max token supply MUST be set to a number greater than 0.",
        },
      ],
      userdoc: [
        { notice: "The `tokenSupplyCap` must be set and cannot be `0`." },
      ],
    },

    /**
     * error LSP7DecreasedAllowanceBelowZero()
     *
     * 0x0ef76c35 = keccak256('LSP7DecreasedAllowanceBelowZero()')
     */
    "0x0ef76c35": {
      sig: "LSP7DecreasedAllowanceBelowZero()",
      inputs: [],
      name: "LSP7DecreasedAllowanceBelowZero",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to decrease an operator's allowance to more than its current allowance.",
        },
      ],
    },

    /**
     * error LSP7InvalidTransferBatch()
     *
     * 0x263eee8d = keccak256('LSP7InvalidTransferBatch()')
     */
    "0x263eee8d": {
      sig: "LSP7InvalidTransferBatch()",
      inputs: [],
      name: "LSP7InvalidTransferBatch",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the array parameters used in {transferBatch} have different lengths.",
        },
      ],
    },

    /**
     * error LSP7NotifyTokenReceiverContractMissingLSP1Interface(
     *  address tokenReceiver
     * )
     *
     * 0xa608fbb6 = keccak256('LSP7NotifyTokenReceiverContractMissingLSP1Interface(address)')
     */
    "0xa608fbb6": {
      sig: "LSP7NotifyTokenReceiverContractMissingLSP1Interface(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP7NotifyTokenReceiverContractMissingLSP1Interface",
      type: "error",
      devdoc: [
        {
          details:
            "reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP7NotifyTokenReceiverIsEOA(
     *  address tokenReceiver
     * )
     *
     * 0x26c247f4 = keccak256('LSP7NotifyTokenReceiverIsEOA(address)')
     */
    "0x26c247f4": {
      sig: "LSP7NotifyTokenReceiverIsEOA(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP7NotifyTokenReceiverIsEOA",
      type: "error",
      devdoc: [
        {
          details:
            "reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP7TokenContractCannotHoldValue()
     *
     * 0x388f5adc = keccak256('LSP7TokenContractCannotHoldValue()')
     */
    "0x388f5adc": {
      sig: "LSP7TokenContractCannotHoldValue()",
      inputs: [],
      name: "LSP7TokenContractCannotHoldValue",
      type: "error",
      devdoc: [
        {
          details:
            "Error occurs when sending native tokens to the LSP7 contract without sending any data. E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.",
        },
      ],
      userdoc: [{ notice: "LSP7 contract cannot receive native tokens." }],
    },

    /**
     * error LSP7TokenOwnerCannotBeOperator()
     *
     * 0xdab75047 = keccak256('LSP7TokenOwnerCannotBeOperator()')
     */
    "0xdab75047": {
      sig: "LSP7TokenOwnerCannotBeOperator()",
      inputs: [],
      name: "LSP7TokenOwnerCannotBeOperator",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to authorize or revoke the token's owner as an operator.",
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },

    /**
     * error OperatorAllowanceCannotBeIncreasedFromZero(
     *  address operator
     * )
     *
     * 0xcba6e977 = keccak256('OperatorAllowanceCannotBeIncreasedFromZero(address)')
     */
    "0xcba6e977": {
      sig: "OperatorAllowanceCannotBeIncreasedFromZero(address)",
      inputs: [{ internalType: "address", name: "operator", type: "address" }],
      name: "OperatorAllowanceCannotBeIncreasedFromZero",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when token owner call {increaseAllowance} for an operator that does not have any allowance",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },
  },
  LSP7CappedSupplyInitAbstract: {
    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error InvalidExtensionAddress(
     *  bytes storedData
     * )
     *
     * 0x42bfe79f = keccak256('InvalidExtensionAddress(bytes)')
     */
    "0x42bfe79f": {
      sig: "InvalidExtensionAddress(bytes)",
      inputs: [{ internalType: "bytes", name: "storedData", type: "bytes" }],
      name: "InvalidExtensionAddress",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)",
        },
      ],
    },

    /**
     * error InvalidFunctionSelector(
     *  bytes data
     * )
     *
     * 0xe5099ee3 = keccak256('InvalidFunctionSelector(bytes)')
     */
    "0xe5099ee3": {
      sig: "InvalidFunctionSelector(bytes)",
      inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
      name: "InvalidFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the contract is called with a function selector not valid (less than 4 bytes of data)",
        },
      ],
    },

    /**
     * error LSP4TokenNameNotEditable()
     *
     * 0x85c169bd = keccak256('LSP4TokenNameNotEditable()')
     */
    "0x85c169bd": {
      sig: "LSP4TokenNameNotEditable()",
      inputs: [],
      name: "LSP4TokenNameNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenSymbolNotEditable()
     *
     * 0x76755b38 = keccak256('LSP4TokenSymbolNotEditable()')
     */
    "0x76755b38": {
      sig: "LSP4TokenSymbolNotEditable()",
      inputs: [],
      name: "LSP4TokenSymbolNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenTypeNotEditable()
     *
     * 0x4ef6d7fb = keccak256('LSP4TokenTypeNotEditable()')
     */
    "0x4ef6d7fb": {
      sig: "LSP4TokenTypeNotEditable()",
      inputs: [],
      name: "LSP4TokenTypeNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP7AmountExceedsAuthorizedAmount(
     *  address tokenOwner,
     *  uint256 authorizedAmount,
     *  address operator,
     *  uint256 amount
     * )
     *
     * 0xf3a6b691 = keccak256('LSP7AmountExceedsAuthorizedAmount(address,uint256,address,uint256)')
     */
    "0xf3a6b691": {
      sig: "LSP7AmountExceedsAuthorizedAmount(address,uint256,address,uint256)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "uint256", name: "authorizedAmount", type: "uint256" },
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "LSP7AmountExceedsAuthorizedAmount",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when `operator` of `tokenOwner` send an `amount` of tokens larger than the `authorizedAmount`.",
        },
      ],
    },

    /**
     * error LSP7AmountExceedsBalance(
     *  uint256 balance,
     *  address tokenOwner,
     *  uint256 amount
     * )
     *
     * 0x08d47949 = keccak256('LSP7AmountExceedsBalance(uint256,address,uint256)')
     */
    "0x08d47949": {
      sig: "LSP7AmountExceedsBalance(uint256,address,uint256)",
      inputs: [
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "LSP7AmountExceedsBalance",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when sending an `amount` of tokens larger than the current `balance` of the `tokenOwner`.",
        },
      ],
    },

    /**
     * error LSP7BatchCallFailed(
     *  uint256 callIndex
     * )
     *
     * 0xb774c284 = keccak256('LSP7BatchCallFailed(uint256)')
     */
    "0xb774c284": {
      sig: "LSP7BatchCallFailed(uint256)",
      inputs: [{ internalType: "uint256", name: "callIndex", type: "uint256" }],
      name: "LSP7BatchCallFailed",
      type: "error",
      devdoc: [{ details: "Reverts when a batch call failed." }],
      userdoc: [{ notice: "Batch call failed." }],
    },

    /**
     * error LSP7CannotSendToSelf()
     *
     * 0xb9afb000 = keccak256('LSP7CannotSendToSelf()')
     */
    "0xb9afb000": {
      sig: "LSP7CannotSendToSelf()",
      inputs: [],
      name: "LSP7CannotSendToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when specifying the same address for `from` or `to` in a token transfer.",
        },
      ],
    },

    /**
     * error LSP7CannotSendWithAddressZero()
     *
     * 0xd2d5ec30 = keccak256('LSP7CannotSendWithAddressZero()')
     */
    "0xd2d5ec30": {
      sig: "LSP7CannotSendWithAddressZero()",
      inputs: [],
      name: "LSP7CannotSendWithAddressZero",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to: - mint tokens to the zero address. - burn tokens from the zero address. - transfer tokens from or to the zero address.",
        },
      ],
    },

    /**
     * error LSP7CannotUseAddressZeroAsOperator()
     *
     * 0x6355e766 = keccak256('LSP7CannotUseAddressZeroAsOperator()')
     */
    "0x6355e766": {
      sig: "LSP7CannotUseAddressZeroAsOperator()",
      inputs: [],
      name: "LSP7CannotUseAddressZeroAsOperator",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to set the zero address as an operator.",
        },
      ],
    },

    /**
     * error LSP7CappedSupplyCannotMintOverCap()
     *
     * 0xeacbf0d1 = keccak256('LSP7CappedSupplyCannotMintOverCap()')
     */
    "0xeacbf0d1": {
      sig: "LSP7CappedSupplyCannotMintOverCap()",
      inputs: [],
      name: "LSP7CappedSupplyCannotMintOverCap",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to mint tokens but the {totalSupply} has reached the maximum {tokenSupplyCap}.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot mint anymore as total supply reached the maximum cap.",
        },
      ],
    },

    /**
     * error LSP7CappedSupplyRequired()
     *
     * 0xacf1d8c5 = keccak256('LSP7CappedSupplyRequired()')
     */
    "0xacf1d8c5": {
      sig: "LSP7CappedSupplyRequired()",
      inputs: [],
      name: "LSP7CappedSupplyRequired",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when setting `0` for the {tokenSupplyCap}. The max token supply MUST be set to a number greater than 0.",
        },
      ],
      userdoc: [
        { notice: "The `tokenSupplyCap` must be set and cannot be `0`." },
      ],
    },

    /**
     * error LSP7DecreasedAllowanceBelowZero()
     *
     * 0x0ef76c35 = keccak256('LSP7DecreasedAllowanceBelowZero()')
     */
    "0x0ef76c35": {
      sig: "LSP7DecreasedAllowanceBelowZero()",
      inputs: [],
      name: "LSP7DecreasedAllowanceBelowZero",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to decrease an operator's allowance to more than its current allowance.",
        },
      ],
    },

    /**
     * error LSP7InvalidTransferBatch()
     *
     * 0x263eee8d = keccak256('LSP7InvalidTransferBatch()')
     */
    "0x263eee8d": {
      sig: "LSP7InvalidTransferBatch()",
      inputs: [],
      name: "LSP7InvalidTransferBatch",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the array parameters used in {transferBatch} have different lengths.",
        },
      ],
    },

    /**
     * error LSP7NotifyTokenReceiverContractMissingLSP1Interface(
     *  address tokenReceiver
     * )
     *
     * 0xa608fbb6 = keccak256('LSP7NotifyTokenReceiverContractMissingLSP1Interface(address)')
     */
    "0xa608fbb6": {
      sig: "LSP7NotifyTokenReceiverContractMissingLSP1Interface(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP7NotifyTokenReceiverContractMissingLSP1Interface",
      type: "error",
      devdoc: [
        {
          details:
            "reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP7NotifyTokenReceiverIsEOA(
     *  address tokenReceiver
     * )
     *
     * 0x26c247f4 = keccak256('LSP7NotifyTokenReceiverIsEOA(address)')
     */
    "0x26c247f4": {
      sig: "LSP7NotifyTokenReceiverIsEOA(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP7NotifyTokenReceiverIsEOA",
      type: "error",
      devdoc: [
        {
          details:
            "reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP7TokenContractCannotHoldValue()
     *
     * 0x388f5adc = keccak256('LSP7TokenContractCannotHoldValue()')
     */
    "0x388f5adc": {
      sig: "LSP7TokenContractCannotHoldValue()",
      inputs: [],
      name: "LSP7TokenContractCannotHoldValue",
      type: "error",
      devdoc: [
        {
          details:
            "Error occurs when sending native tokens to the LSP7 contract without sending any data. E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.",
        },
      ],
      userdoc: [{ notice: "LSP7 contract cannot receive native tokens." }],
    },

    /**
     * error LSP7TokenOwnerCannotBeOperator()
     *
     * 0xdab75047 = keccak256('LSP7TokenOwnerCannotBeOperator()')
     */
    "0xdab75047": {
      sig: "LSP7TokenOwnerCannotBeOperator()",
      inputs: [],
      name: "LSP7TokenOwnerCannotBeOperator",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when trying to authorize or revoke the token's owner as an operator.",
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },

    /**
     * error OperatorAllowanceCannotBeIncreasedFromZero(
     *  address operator
     * )
     *
     * 0xcba6e977 = keccak256('OperatorAllowanceCannotBeIncreasedFromZero(address)')
     */
    "0xcba6e977": {
      sig: "OperatorAllowanceCannotBeIncreasedFromZero(address)",
      inputs: [{ internalType: "address", name: "operator", type: "address" }],
      name: "OperatorAllowanceCannotBeIncreasedFromZero",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when token owner call {increaseAllowance} for an operator that does not have any allowance",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },
  },
  LSP8IdentifiableDigitalAsset: {
    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error InvalidExtensionAddress(
     *  bytes storedData
     * )
     *
     * 0x42bfe79f = keccak256('InvalidExtensionAddress(bytes)')
     */
    "0x42bfe79f": {
      sig: "InvalidExtensionAddress(bytes)",
      inputs: [{ internalType: "bytes", name: "storedData", type: "bytes" }],
      name: "InvalidExtensionAddress",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)",
        },
      ],
    },

    /**
     * error InvalidFunctionSelector(
     *  bytes data
     * )
     *
     * 0xe5099ee3 = keccak256('InvalidFunctionSelector(bytes)')
     */
    "0xe5099ee3": {
      sig: "InvalidFunctionSelector(bytes)",
      inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
      name: "InvalidFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the contract is called with a function selector not valid (less than 4 bytes of data)",
        },
      ],
    },

    /**
     * error LSP4TokenNameNotEditable()
     *
     * 0x85c169bd = keccak256('LSP4TokenNameNotEditable()')
     */
    "0x85c169bd": {
      sig: "LSP4TokenNameNotEditable()",
      inputs: [],
      name: "LSP4TokenNameNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenSymbolNotEditable()
     *
     * 0x76755b38 = keccak256('LSP4TokenSymbolNotEditable()')
     */
    "0x76755b38": {
      sig: "LSP4TokenSymbolNotEditable()",
      inputs: [],
      name: "LSP4TokenSymbolNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenTypeNotEditable()
     *
     * 0x4ef6d7fb = keccak256('LSP4TokenTypeNotEditable()')
     */
    "0x4ef6d7fb": {
      sig: "LSP4TokenTypeNotEditable()",
      inputs: [],
      name: "LSP4TokenTypeNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP8BatchCallFailed(
     *  uint256 callIndex
     * )
     *
     * 0x234eb819 = keccak256('LSP8BatchCallFailed(uint256)')
     */
    "0x234eb819": {
      sig: "LSP8BatchCallFailed(uint256)",
      inputs: [{ internalType: "uint256", name: "callIndex", type: "uint256" }],
      name: "LSP8BatchCallFailed",
      type: "error",
      devdoc: [{ details: "Reverts when a batch call failed." }],
      userdoc: [{ notice: "Batch call failed." }],
    },

    /**
     * error LSP8CannotSendToAddressZero()
     *
     * 0x24ecef4d = keccak256('LSP8CannotSendToAddressZero()')
     */
    "0x24ecef4d": {
      sig: "LSP8CannotSendToAddressZero()",
      inputs: [],
      name: "LSP8CannotSendToAddressZero",
      type: "error",
      devdoc: [
        { details: "Reverts when trying to send token to the zero address." },
      ],
    },

    /**
     * error LSP8CannotSendToSelf()
     *
     * 0x5d67d6c1 = keccak256('LSP8CannotSendToSelf()')
     */
    "0x5d67d6c1": {
      sig: "LSP8CannotSendToSelf()",
      inputs: [],
      name: "LSP8CannotSendToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when specifying the same address for `from` and `to` in a token transfer.",
        },
      ],
    },

    /**
     * error LSP8CannotUseAddressZeroAsOperator()
     *
     * 0x9577b8b3 = keccak256('LSP8CannotUseAddressZeroAsOperator()')
     */
    "0x9577b8b3": {
      sig: "LSP8CannotUseAddressZeroAsOperator()",
      inputs: [],
      name: "LSP8CannotUseAddressZeroAsOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set the zero address as an operator.",
        },
      ],
    },

    /**
     * error LSP8InvalidTransferBatch()
     *
     * 0x93a83119 = keccak256('LSP8InvalidTransferBatch()')
     */
    "0x93a83119": {
      sig: "LSP8InvalidTransferBatch()",
      inputs: [],
      name: "LSP8InvalidTransferBatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the parameters used for `transferBatch` have different lengths.",
        },
      ],
    },

    /**
     * error LSP8NonExistentTokenId(
     *  bytes32 tokenId
     * )
     *
     * 0xae8f9a36 = keccak256('LSP8NonExistentTokenId(bytes32)')
     */
    "0xae8f9a36": {
      sig: "LSP8NonExistentTokenId(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "LSP8NonExistentTokenId",
      type: "error",
      devdoc: [{ details: "Reverts when `tokenId` has not been minted." }],
    },

    /**
     * error LSP8NonExistingOperator(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0x4aa31a8c = keccak256('LSP8NonExistingOperator(address,bytes32)')
     */
    "0x4aa31a8c": {
      sig: "LSP8NonExistingOperator(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "LSP8NonExistingOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `operator` is not an operator for the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotTokenOperator(
     *  bytes32 tokenId,
     *  address caller
     * )
     *
     * 0x1294d2a9 = keccak256('LSP8NotTokenOperator(bytes32,address)')
     */
    "0x1294d2a9": {
      sig: "LSP8NotTokenOperator(bytes32,address)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "caller", type: "address" },
      ],
      name: "LSP8NotTokenOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `caller` is not an allowed operator for `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotTokenOwner(
     *  address tokenOwner,
     *  bytes32 tokenId,
     *  address caller
     * )
     *
     * 0x5b271ea2 = keccak256('LSP8NotTokenOwner(address,bytes32,address)')
     */
    "0x5b271ea2": {
      sig: "LSP8NotTokenOwner(address,bytes32,address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "caller", type: "address" },
      ],
      name: "LSP8NotTokenOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `caller` is not the `tokenOwner` of the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotifyTokenReceiverContractMissingLSP1Interface(
     *  address tokenReceiver
     * )
     *
     * 0x4349776d = keccak256('LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)')
     */
    "0x4349776d": {
      sig: "LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP8NotifyTokenReceiverContractMissingLSP1Interface",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP8NotifyTokenReceiverIsEOA(
     *  address tokenReceiver
     * )
     *
     * 0x03173137 = keccak256('LSP8NotifyTokenReceiverIsEOA(address)')
     */
    "0x03173137": {
      sig: "LSP8NotifyTokenReceiverIsEOA(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP8NotifyTokenReceiverIsEOA",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP8OperatorAlreadyAuthorized(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0xa7626b68 = keccak256('LSP8OperatorAlreadyAuthorized(address,bytes32)')
     */
    "0xa7626b68": {
      sig: "LSP8OperatorAlreadyAuthorized(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "LSP8OperatorAlreadyAuthorized",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `operator` is already authorized for the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8TokenContractCannotHoldValue()
     *
     * 0x61f49442 = keccak256('LSP8TokenContractCannotHoldValue()')
     */
    "0x61f49442": {
      sig: "LSP8TokenContractCannotHoldValue()",
      inputs: [],
      name: "LSP8TokenContractCannotHoldValue",
      type: "error",
      devdoc: [
        {
          details:
            "Error occurs when sending native tokens to the LSP8 contract without sending any data. E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.",
        },
      ],
      userdoc: [{ notice: "LSP8 contract cannot receive native tokens." }],
    },

    /**
     * error LSP8TokenIdFormatNotEditable()
     *
     * 0x3664800a = keccak256('LSP8TokenIdFormatNotEditable()')
     */
    "0x3664800a": {
      sig: "LSP8TokenIdFormatNotEditable()",
      inputs: [],
      name: "LSP8TokenIdFormatNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP8TokenIdFormat` after the identifiable digital asset contract has been deployed. The `LSP8TokenIdFormat` data key is located inside the ERC725Y Data key-value store of the identifiable digital asset contract. It can be set only once inside the constructor/initializer when the identifiable digital asset contract is being deployed.",
        },
      ],
    },

    /**
     * error LSP8TokenIdsDataEmptyArray()
     *
     * 0x80c98305 = keccak256('LSP8TokenIdsDataEmptyArray()')
     */
    "0x80c98305": {
      sig: "LSP8TokenIdsDataEmptyArray()",
      inputs: [],
      name: "LSP8TokenIdsDataEmptyArray",
      type: "error",
      devdoc: [
        { details: "Reverts when empty arrays is passed to the function" },
      ],
    },

    /**
     * error LSP8TokenIdsDataLengthMismatch()
     *
     * 0x2fa71dfe = keccak256('LSP8TokenIdsDataLengthMismatch()')
     */
    "0x2fa71dfe": {
      sig: "LSP8TokenIdsDataLengthMismatch()",
      inputs: [],
      name: "LSP8TokenIdsDataLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the length of the token IDs data arrays is not equal",
        },
      ],
    },

    /**
     * error LSP8TokenOwnerCannotBeOperator()
     *
     * 0x89fdad62 = keccak256('LSP8TokenOwnerCannotBeOperator()')
     */
    "0x89fdad62": {
      sig: "LSP8TokenOwnerCannotBeOperator()",
      inputs: [],
      name: "LSP8TokenOwnerCannotBeOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to authorize or revoke the token's owner as an operator.",
        },
      ],
    },

    /**
     * error LSP8TokenOwnerChanged(
     *  bytes32 tokenId,
     *  address oldOwner,
     *  address newOwner
     * )
     *
     * 0x5a9c31d3 = keccak256('LSP8TokenOwnerChanged(bytes32,address,address)')
     */
    "0x5a9c31d3": {
      sig: "LSP8TokenOwnerChanged(bytes32,address,address)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "oldOwner", type: "address" },
        { internalType: "address", name: "newOwner", type: "address" },
      ],
      name: "LSP8TokenOwnerChanged",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the token owner changed inside the {_beforeTokenTransfer} hook.",
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },
  },
  LSP8IdentifiableDigitalAssetInitAbstract: {
    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error InvalidExtensionAddress(
     *  bytes storedData
     * )
     *
     * 0x42bfe79f = keccak256('InvalidExtensionAddress(bytes)')
     */
    "0x42bfe79f": {
      sig: "InvalidExtensionAddress(bytes)",
      inputs: [{ internalType: "bytes", name: "storedData", type: "bytes" }],
      name: "InvalidExtensionAddress",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)",
        },
      ],
    },

    /**
     * error InvalidFunctionSelector(
     *  bytes data
     * )
     *
     * 0xe5099ee3 = keccak256('InvalidFunctionSelector(bytes)')
     */
    "0xe5099ee3": {
      sig: "InvalidFunctionSelector(bytes)",
      inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
      name: "InvalidFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the contract is called with a function selector not valid (less than 4 bytes of data)",
        },
      ],
    },

    /**
     * error LSP4TokenNameNotEditable()
     *
     * 0x85c169bd = keccak256('LSP4TokenNameNotEditable()')
     */
    "0x85c169bd": {
      sig: "LSP4TokenNameNotEditable()",
      inputs: [],
      name: "LSP4TokenNameNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenSymbolNotEditable()
     *
     * 0x76755b38 = keccak256('LSP4TokenSymbolNotEditable()')
     */
    "0x76755b38": {
      sig: "LSP4TokenSymbolNotEditable()",
      inputs: [],
      name: "LSP4TokenSymbolNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenTypeNotEditable()
     *
     * 0x4ef6d7fb = keccak256('LSP4TokenTypeNotEditable()')
     */
    "0x4ef6d7fb": {
      sig: "LSP4TokenTypeNotEditable()",
      inputs: [],
      name: "LSP4TokenTypeNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP8BatchCallFailed(
     *  uint256 callIndex
     * )
     *
     * 0x234eb819 = keccak256('LSP8BatchCallFailed(uint256)')
     */
    "0x234eb819": {
      sig: "LSP8BatchCallFailed(uint256)",
      inputs: [{ internalType: "uint256", name: "callIndex", type: "uint256" }],
      name: "LSP8BatchCallFailed",
      type: "error",
      devdoc: [{ details: "Reverts when a batch call failed." }],
      userdoc: [{ notice: "Batch call failed." }],
    },

    /**
     * error LSP8CannotSendToAddressZero()
     *
     * 0x24ecef4d = keccak256('LSP8CannotSendToAddressZero()')
     */
    "0x24ecef4d": {
      sig: "LSP8CannotSendToAddressZero()",
      inputs: [],
      name: "LSP8CannotSendToAddressZero",
      type: "error",
      devdoc: [
        { details: "Reverts when trying to send token to the zero address." },
      ],
    },

    /**
     * error LSP8CannotSendToSelf()
     *
     * 0x5d67d6c1 = keccak256('LSP8CannotSendToSelf()')
     */
    "0x5d67d6c1": {
      sig: "LSP8CannotSendToSelf()",
      inputs: [],
      name: "LSP8CannotSendToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when specifying the same address for `from` and `to` in a token transfer.",
        },
      ],
    },

    /**
     * error LSP8CannotUseAddressZeroAsOperator()
     *
     * 0x9577b8b3 = keccak256('LSP8CannotUseAddressZeroAsOperator()')
     */
    "0x9577b8b3": {
      sig: "LSP8CannotUseAddressZeroAsOperator()",
      inputs: [],
      name: "LSP8CannotUseAddressZeroAsOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set the zero address as an operator.",
        },
      ],
    },

    /**
     * error LSP8InvalidTransferBatch()
     *
     * 0x93a83119 = keccak256('LSP8InvalidTransferBatch()')
     */
    "0x93a83119": {
      sig: "LSP8InvalidTransferBatch()",
      inputs: [],
      name: "LSP8InvalidTransferBatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the parameters used for `transferBatch` have different lengths.",
        },
      ],
    },

    /**
     * error LSP8NonExistentTokenId(
     *  bytes32 tokenId
     * )
     *
     * 0xae8f9a36 = keccak256('LSP8NonExistentTokenId(bytes32)')
     */
    "0xae8f9a36": {
      sig: "LSP8NonExistentTokenId(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "LSP8NonExistentTokenId",
      type: "error",
      devdoc: [{ details: "Reverts when `tokenId` has not been minted." }],
    },

    /**
     * error LSP8NonExistingOperator(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0x4aa31a8c = keccak256('LSP8NonExistingOperator(address,bytes32)')
     */
    "0x4aa31a8c": {
      sig: "LSP8NonExistingOperator(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "LSP8NonExistingOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `operator` is not an operator for the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotTokenOperator(
     *  bytes32 tokenId,
     *  address caller
     * )
     *
     * 0x1294d2a9 = keccak256('LSP8NotTokenOperator(bytes32,address)')
     */
    "0x1294d2a9": {
      sig: "LSP8NotTokenOperator(bytes32,address)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "caller", type: "address" },
      ],
      name: "LSP8NotTokenOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `caller` is not an allowed operator for `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotTokenOwner(
     *  address tokenOwner,
     *  bytes32 tokenId,
     *  address caller
     * )
     *
     * 0x5b271ea2 = keccak256('LSP8NotTokenOwner(address,bytes32,address)')
     */
    "0x5b271ea2": {
      sig: "LSP8NotTokenOwner(address,bytes32,address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "caller", type: "address" },
      ],
      name: "LSP8NotTokenOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `caller` is not the `tokenOwner` of the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotifyTokenReceiverContractMissingLSP1Interface(
     *  address tokenReceiver
     * )
     *
     * 0x4349776d = keccak256('LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)')
     */
    "0x4349776d": {
      sig: "LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP8NotifyTokenReceiverContractMissingLSP1Interface",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP8NotifyTokenReceiverIsEOA(
     *  address tokenReceiver
     * )
     *
     * 0x03173137 = keccak256('LSP8NotifyTokenReceiverIsEOA(address)')
     */
    "0x03173137": {
      sig: "LSP8NotifyTokenReceiverIsEOA(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP8NotifyTokenReceiverIsEOA",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP8OperatorAlreadyAuthorized(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0xa7626b68 = keccak256('LSP8OperatorAlreadyAuthorized(address,bytes32)')
     */
    "0xa7626b68": {
      sig: "LSP8OperatorAlreadyAuthorized(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "LSP8OperatorAlreadyAuthorized",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `operator` is already authorized for the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8TokenContractCannotHoldValue()
     *
     * 0x61f49442 = keccak256('LSP8TokenContractCannotHoldValue()')
     */
    "0x61f49442": {
      sig: "LSP8TokenContractCannotHoldValue()",
      inputs: [],
      name: "LSP8TokenContractCannotHoldValue",
      type: "error",
      devdoc: [
        {
          details:
            "Error occurs when sending native tokens to the LSP8 contract without sending any data. E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.",
        },
      ],
      userdoc: [{ notice: "LSP8 contract cannot receive native tokens." }],
    },

    /**
     * error LSP8TokenIdFormatNotEditable()
     *
     * 0x3664800a = keccak256('LSP8TokenIdFormatNotEditable()')
     */
    "0x3664800a": {
      sig: "LSP8TokenIdFormatNotEditable()",
      inputs: [],
      name: "LSP8TokenIdFormatNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP8TokenIdFormat` after the identifiable digital asset contract has been deployed. The `LSP8TokenIdFormat` data key is located inside the ERC725Y Data key-value store of the identifiable digital asset contract. It can be set only once inside the constructor/initializer when the identifiable digital asset contract is being deployed.",
        },
      ],
    },

    /**
     * error LSP8TokenIdsDataEmptyArray()
     *
     * 0x80c98305 = keccak256('LSP8TokenIdsDataEmptyArray()')
     */
    "0x80c98305": {
      sig: "LSP8TokenIdsDataEmptyArray()",
      inputs: [],
      name: "LSP8TokenIdsDataEmptyArray",
      type: "error",
      devdoc: [
        { details: "Reverts when empty arrays is passed to the function" },
      ],
    },

    /**
     * error LSP8TokenIdsDataLengthMismatch()
     *
     * 0x2fa71dfe = keccak256('LSP8TokenIdsDataLengthMismatch()')
     */
    "0x2fa71dfe": {
      sig: "LSP8TokenIdsDataLengthMismatch()",
      inputs: [],
      name: "LSP8TokenIdsDataLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the length of the token IDs data arrays is not equal",
        },
      ],
    },

    /**
     * error LSP8TokenOwnerCannotBeOperator()
     *
     * 0x89fdad62 = keccak256('LSP8TokenOwnerCannotBeOperator()')
     */
    "0x89fdad62": {
      sig: "LSP8TokenOwnerCannotBeOperator()",
      inputs: [],
      name: "LSP8TokenOwnerCannotBeOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to authorize or revoke the token's owner as an operator.",
        },
      ],
    },

    /**
     * error LSP8TokenOwnerChanged(
     *  bytes32 tokenId,
     *  address oldOwner,
     *  address newOwner
     * )
     *
     * 0x5a9c31d3 = keccak256('LSP8TokenOwnerChanged(bytes32,address,address)')
     */
    "0x5a9c31d3": {
      sig: "LSP8TokenOwnerChanged(bytes32,address,address)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "oldOwner", type: "address" },
        { internalType: "address", name: "newOwner", type: "address" },
      ],
      name: "LSP8TokenOwnerChanged",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the token owner changed inside the {_beforeTokenTransfer} hook.",
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },
  },
  LSP8CappedSupply: {
    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error InvalidExtensionAddress(
     *  bytes storedData
     * )
     *
     * 0x42bfe79f = keccak256('InvalidExtensionAddress(bytes)')
     */
    "0x42bfe79f": {
      sig: "InvalidExtensionAddress(bytes)",
      inputs: [{ internalType: "bytes", name: "storedData", type: "bytes" }],
      name: "InvalidExtensionAddress",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)",
        },
      ],
    },

    /**
     * error InvalidFunctionSelector(
     *  bytes data
     * )
     *
     * 0xe5099ee3 = keccak256('InvalidFunctionSelector(bytes)')
     */
    "0xe5099ee3": {
      sig: "InvalidFunctionSelector(bytes)",
      inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
      name: "InvalidFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the contract is called with a function selector not valid (less than 4 bytes of data)",
        },
      ],
    },

    /**
     * error LSP4TokenNameNotEditable()
     *
     * 0x85c169bd = keccak256('LSP4TokenNameNotEditable()')
     */
    "0x85c169bd": {
      sig: "LSP4TokenNameNotEditable()",
      inputs: [],
      name: "LSP4TokenNameNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenSymbolNotEditable()
     *
     * 0x76755b38 = keccak256('LSP4TokenSymbolNotEditable()')
     */
    "0x76755b38": {
      sig: "LSP4TokenSymbolNotEditable()",
      inputs: [],
      name: "LSP4TokenSymbolNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenTypeNotEditable()
     *
     * 0x4ef6d7fb = keccak256('LSP4TokenTypeNotEditable()')
     */
    "0x4ef6d7fb": {
      sig: "LSP4TokenTypeNotEditable()",
      inputs: [],
      name: "LSP4TokenTypeNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP8BatchCallFailed(
     *  uint256 callIndex
     * )
     *
     * 0x234eb819 = keccak256('LSP8BatchCallFailed(uint256)')
     */
    "0x234eb819": {
      sig: "LSP8BatchCallFailed(uint256)",
      inputs: [{ internalType: "uint256", name: "callIndex", type: "uint256" }],
      name: "LSP8BatchCallFailed",
      type: "error",
      devdoc: [{ details: "Reverts when a batch call failed." }],
      userdoc: [{ notice: "Batch call failed." }],
    },

    /**
     * error LSP8CannotSendToAddressZero()
     *
     * 0x24ecef4d = keccak256('LSP8CannotSendToAddressZero()')
     */
    "0x24ecef4d": {
      sig: "LSP8CannotSendToAddressZero()",
      inputs: [],
      name: "LSP8CannotSendToAddressZero",
      type: "error",
      devdoc: [
        { details: "Reverts when trying to send token to the zero address." },
      ],
    },

    /**
     * error LSP8CannotSendToSelf()
     *
     * 0x5d67d6c1 = keccak256('LSP8CannotSendToSelf()')
     */
    "0x5d67d6c1": {
      sig: "LSP8CannotSendToSelf()",
      inputs: [],
      name: "LSP8CannotSendToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when specifying the same address for `from` and `to` in a token transfer.",
        },
      ],
    },

    /**
     * error LSP8CannotUseAddressZeroAsOperator()
     *
     * 0x9577b8b3 = keccak256('LSP8CannotUseAddressZeroAsOperator()')
     */
    "0x9577b8b3": {
      sig: "LSP8CannotUseAddressZeroAsOperator()",
      inputs: [],
      name: "LSP8CannotUseAddressZeroAsOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set the zero address as an operator.",
        },
      ],
    },

    /**
     * error LSP8CappedSupplyCannotMintOverCap()
     *
     * 0xe8ba2291 = keccak256('LSP8CappedSupplyCannotMintOverCap()')
     */
    "0xe8ba2291": {
      sig: "LSP8CappedSupplyCannotMintOverCap()",
      inputs: [],
      name: "LSP8CappedSupplyCannotMintOverCap",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to mint tokens but the {totalSupply} has reached the maximum {tokenSupplyCap}.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot mint anymore as total supply reached the maximum cap.",
        },
      ],
    },

    /**
     * error LSP8CappedSupplyRequired()
     *
     * 0x38d9fc30 = keccak256('LSP8CappedSupplyRequired()')
     */
    "0x38d9fc30": {
      sig: "LSP8CappedSupplyRequired()",
      inputs: [],
      name: "LSP8CappedSupplyRequired",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when setting `0` for the {tokenSupplyCap}. The max token supply MUST be set to a number greater than 0.",
        },
      ],
      userdoc: [
        { notice: "The `tokenSupplyCap` must be set and cannot be `0`." },
      ],
    },

    /**
     * error LSP8InvalidTransferBatch()
     *
     * 0x93a83119 = keccak256('LSP8InvalidTransferBatch()')
     */
    "0x93a83119": {
      sig: "LSP8InvalidTransferBatch()",
      inputs: [],
      name: "LSP8InvalidTransferBatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the parameters used for `transferBatch` have different lengths.",
        },
      ],
    },

    /**
     * error LSP8NonExistentTokenId(
     *  bytes32 tokenId
     * )
     *
     * 0xae8f9a36 = keccak256('LSP8NonExistentTokenId(bytes32)')
     */
    "0xae8f9a36": {
      sig: "LSP8NonExistentTokenId(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "LSP8NonExistentTokenId",
      type: "error",
      devdoc: [{ details: "Reverts when `tokenId` has not been minted." }],
    },

    /**
     * error LSP8NonExistingOperator(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0x4aa31a8c = keccak256('LSP8NonExistingOperator(address,bytes32)')
     */
    "0x4aa31a8c": {
      sig: "LSP8NonExistingOperator(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "LSP8NonExistingOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `operator` is not an operator for the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotTokenOperator(
     *  bytes32 tokenId,
     *  address caller
     * )
     *
     * 0x1294d2a9 = keccak256('LSP8NotTokenOperator(bytes32,address)')
     */
    "0x1294d2a9": {
      sig: "LSP8NotTokenOperator(bytes32,address)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "caller", type: "address" },
      ],
      name: "LSP8NotTokenOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `caller` is not an allowed operator for `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotTokenOwner(
     *  address tokenOwner,
     *  bytes32 tokenId,
     *  address caller
     * )
     *
     * 0x5b271ea2 = keccak256('LSP8NotTokenOwner(address,bytes32,address)')
     */
    "0x5b271ea2": {
      sig: "LSP8NotTokenOwner(address,bytes32,address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "caller", type: "address" },
      ],
      name: "LSP8NotTokenOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `caller` is not the `tokenOwner` of the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotifyTokenReceiverContractMissingLSP1Interface(
     *  address tokenReceiver
     * )
     *
     * 0x4349776d = keccak256('LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)')
     */
    "0x4349776d": {
      sig: "LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP8NotifyTokenReceiverContractMissingLSP1Interface",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP8NotifyTokenReceiverIsEOA(
     *  address tokenReceiver
     * )
     *
     * 0x03173137 = keccak256('LSP8NotifyTokenReceiverIsEOA(address)')
     */
    "0x03173137": {
      sig: "LSP8NotifyTokenReceiverIsEOA(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP8NotifyTokenReceiverIsEOA",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP8OperatorAlreadyAuthorized(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0xa7626b68 = keccak256('LSP8OperatorAlreadyAuthorized(address,bytes32)')
     */
    "0xa7626b68": {
      sig: "LSP8OperatorAlreadyAuthorized(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "LSP8OperatorAlreadyAuthorized",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `operator` is already authorized for the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8TokenContractCannotHoldValue()
     *
     * 0x61f49442 = keccak256('LSP8TokenContractCannotHoldValue()')
     */
    "0x61f49442": {
      sig: "LSP8TokenContractCannotHoldValue()",
      inputs: [],
      name: "LSP8TokenContractCannotHoldValue",
      type: "error",
      devdoc: [
        {
          details:
            "Error occurs when sending native tokens to the LSP8 contract without sending any data. E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.",
        },
      ],
      userdoc: [{ notice: "LSP8 contract cannot receive native tokens." }],
    },

    /**
     * error LSP8TokenIdFormatNotEditable()
     *
     * 0x3664800a = keccak256('LSP8TokenIdFormatNotEditable()')
     */
    "0x3664800a": {
      sig: "LSP8TokenIdFormatNotEditable()",
      inputs: [],
      name: "LSP8TokenIdFormatNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP8TokenIdFormat` after the identifiable digital asset contract has been deployed. The `LSP8TokenIdFormat` data key is located inside the ERC725Y Data key-value store of the identifiable digital asset contract. It can be set only once inside the constructor/initializer when the identifiable digital asset contract is being deployed.",
        },
      ],
    },

    /**
     * error LSP8TokenIdsDataEmptyArray()
     *
     * 0x80c98305 = keccak256('LSP8TokenIdsDataEmptyArray()')
     */
    "0x80c98305": {
      sig: "LSP8TokenIdsDataEmptyArray()",
      inputs: [],
      name: "LSP8TokenIdsDataEmptyArray",
      type: "error",
      devdoc: [
        { details: "Reverts when empty arrays is passed to the function" },
      ],
    },

    /**
     * error LSP8TokenIdsDataLengthMismatch()
     *
     * 0x2fa71dfe = keccak256('LSP8TokenIdsDataLengthMismatch()')
     */
    "0x2fa71dfe": {
      sig: "LSP8TokenIdsDataLengthMismatch()",
      inputs: [],
      name: "LSP8TokenIdsDataLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the length of the token IDs data arrays is not equal",
        },
      ],
    },

    /**
     * error LSP8TokenOwnerCannotBeOperator()
     *
     * 0x89fdad62 = keccak256('LSP8TokenOwnerCannotBeOperator()')
     */
    "0x89fdad62": {
      sig: "LSP8TokenOwnerCannotBeOperator()",
      inputs: [],
      name: "LSP8TokenOwnerCannotBeOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to authorize or revoke the token's owner as an operator.",
        },
      ],
    },

    /**
     * error LSP8TokenOwnerChanged(
     *  bytes32 tokenId,
     *  address oldOwner,
     *  address newOwner
     * )
     *
     * 0x5a9c31d3 = keccak256('LSP8TokenOwnerChanged(bytes32,address,address)')
     */
    "0x5a9c31d3": {
      sig: "LSP8TokenOwnerChanged(bytes32,address,address)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "oldOwner", type: "address" },
        { internalType: "address", name: "newOwner", type: "address" },
      ],
      name: "LSP8TokenOwnerChanged",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the token owner changed inside the {_beforeTokenTransfer} hook.",
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },
  },
  LSP8CappedSupplyInitAbstract: {
    /**
     * error ERC725Y_DataKeysValuesEmptyArray()
     *
     * 0x97da5f95 = keccak256('ERC725Y_DataKeysValuesEmptyArray()')
     */
    "0x97da5f95": {
      sig: "ERC725Y_DataKeysValuesEmptyArray()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesEmptyArray",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.",
        },
      ],
    },

    /**
     * error ERC725Y_DataKeysValuesLengthMismatch()
     *
     * 0x3bcc8979 = keccak256('ERC725Y_DataKeysValuesLengthMismatch()')
     */
    "0x3bcc8979": {
      sig: "ERC725Y_DataKeysValuesLengthMismatch()",
      inputs: [],
      name: "ERC725Y_DataKeysValuesLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when there is not the same number of elements in the `datakeys` and `dataValues` array parameters provided when calling the {setDataBatch} function.",
        },
      ],
    },

    /**
     * error ERC725Y_MsgValueDisallowed()
     *
     * 0xf36ba737 = keccak256('ERC725Y_MsgValueDisallowed()')
     */
    "0xf36ba737": {
      sig: "ERC725Y_MsgValueDisallowed()",
      inputs: [],
      name: "ERC725Y_MsgValueDisallowed",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when sending value to the {setData} or {setDataBatch} function.",
        },
      ],
    },

    /**
     * error InvalidExtensionAddress(
     *  bytes storedData
     * )
     *
     * 0x42bfe79f = keccak256('InvalidExtensionAddress(bytes)')
     */
    "0x42bfe79f": {
      sig: "InvalidExtensionAddress(bytes)",
      inputs: [{ internalType: "bytes", name: "storedData", type: "bytes" }],
      name: "InvalidExtensionAddress",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)",
        },
      ],
    },

    /**
     * error InvalidFunctionSelector(
     *  bytes data
     * )
     *
     * 0xe5099ee3 = keccak256('InvalidFunctionSelector(bytes)')
     */
    "0xe5099ee3": {
      sig: "InvalidFunctionSelector(bytes)",
      inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
      name: "InvalidFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when the contract is called with a function selector not valid (less than 4 bytes of data)",
        },
      ],
    },

    /**
     * error LSP4TokenNameNotEditable()
     *
     * 0x85c169bd = keccak256('LSP4TokenNameNotEditable()')
     */
    "0x85c169bd": {
      sig: "LSP4TokenNameNotEditable()",
      inputs: [],
      name: "LSP4TokenNameNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized. The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenSymbolNotEditable()
     *
     * 0x76755b38 = keccak256('LSP4TokenSymbolNotEditable()')
     */
    "0x76755b38": {
      sig: "LSP4TokenSymbolNotEditable()",
      inputs: [],
      name: "LSP4TokenSymbolNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized. The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP4TokenTypeNotEditable()
     *
     * 0x4ef6d7fb = keccak256('LSP4TokenTypeNotEditable()')
     */
    "0x4ef6d7fb": {
      sig: "LSP4TokenTypeNotEditable()",
      inputs: [],
      name: "LSP4TokenTypeNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized. The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract. It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.",
        },
      ],
    },

    /**
     * error LSP8BatchCallFailed(
     *  uint256 callIndex
     * )
     *
     * 0x234eb819 = keccak256('LSP8BatchCallFailed(uint256)')
     */
    "0x234eb819": {
      sig: "LSP8BatchCallFailed(uint256)",
      inputs: [{ internalType: "uint256", name: "callIndex", type: "uint256" }],
      name: "LSP8BatchCallFailed",
      type: "error",
      devdoc: [{ details: "Reverts when a batch call failed." }],
      userdoc: [{ notice: "Batch call failed." }],
    },

    /**
     * error LSP8CannotSendToAddressZero()
     *
     * 0x24ecef4d = keccak256('LSP8CannotSendToAddressZero()')
     */
    "0x24ecef4d": {
      sig: "LSP8CannotSendToAddressZero()",
      inputs: [],
      name: "LSP8CannotSendToAddressZero",
      type: "error",
      devdoc: [
        { details: "Reverts when trying to send token to the zero address." },
      ],
    },

    /**
     * error LSP8CannotSendToSelf()
     *
     * 0x5d67d6c1 = keccak256('LSP8CannotSendToSelf()')
     */
    "0x5d67d6c1": {
      sig: "LSP8CannotSendToSelf()",
      inputs: [],
      name: "LSP8CannotSendToSelf",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when specifying the same address for `from` and `to` in a token transfer.",
        },
      ],
    },

    /**
     * error LSP8CannotUseAddressZeroAsOperator()
     *
     * 0x9577b8b3 = keccak256('LSP8CannotUseAddressZeroAsOperator()')
     */
    "0x9577b8b3": {
      sig: "LSP8CannotUseAddressZeroAsOperator()",
      inputs: [],
      name: "LSP8CannotUseAddressZeroAsOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set the zero address as an operator.",
        },
      ],
    },

    /**
     * error LSP8CappedSupplyCannotMintOverCap()
     *
     * 0xe8ba2291 = keccak256('LSP8CappedSupplyCannotMintOverCap()')
     */
    "0xe8ba2291": {
      sig: "LSP8CappedSupplyCannotMintOverCap()",
      inputs: [],
      name: "LSP8CappedSupplyCannotMintOverCap",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to mint tokens but the {totalSupply} has reached the maximum {tokenSupplyCap}.",
        },
      ],
      userdoc: [
        {
          notice:
            "Cannot mint anymore as total supply reached the maximum cap.",
        },
      ],
    },

    /**
     * error LSP8CappedSupplyRequired()
     *
     * 0x38d9fc30 = keccak256('LSP8CappedSupplyRequired()')
     */
    "0x38d9fc30": {
      sig: "LSP8CappedSupplyRequired()",
      inputs: [],
      name: "LSP8CappedSupplyRequired",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when setting `0` for the {tokenSupplyCap}. The max token supply MUST be set to a number greater than 0.",
        },
      ],
      userdoc: [
        { notice: "The `tokenSupplyCap` must be set and cannot be `0`." },
      ],
    },

    /**
     * error LSP8InvalidTransferBatch()
     *
     * 0x93a83119 = keccak256('LSP8InvalidTransferBatch()')
     */
    "0x93a83119": {
      sig: "LSP8InvalidTransferBatch()",
      inputs: [],
      name: "LSP8InvalidTransferBatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the parameters used for `transferBatch` have different lengths.",
        },
      ],
    },

    /**
     * error LSP8NonExistentTokenId(
     *  bytes32 tokenId
     * )
     *
     * 0xae8f9a36 = keccak256('LSP8NonExistentTokenId(bytes32)')
     */
    "0xae8f9a36": {
      sig: "LSP8NonExistentTokenId(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "LSP8NonExistentTokenId",
      type: "error",
      devdoc: [{ details: "Reverts when `tokenId` has not been minted." }],
    },

    /**
     * error LSP8NonExistingOperator(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0x4aa31a8c = keccak256('LSP8NonExistingOperator(address,bytes32)')
     */
    "0x4aa31a8c": {
      sig: "LSP8NonExistingOperator(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "LSP8NonExistingOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `operator` is not an operator for the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotTokenOperator(
     *  bytes32 tokenId,
     *  address caller
     * )
     *
     * 0x1294d2a9 = keccak256('LSP8NotTokenOperator(bytes32,address)')
     */
    "0x1294d2a9": {
      sig: "LSP8NotTokenOperator(bytes32,address)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "caller", type: "address" },
      ],
      name: "LSP8NotTokenOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `caller` is not an allowed operator for `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotTokenOwner(
     *  address tokenOwner,
     *  bytes32 tokenId,
     *  address caller
     * )
     *
     * 0x5b271ea2 = keccak256('LSP8NotTokenOwner(address,bytes32,address)')
     */
    "0x5b271ea2": {
      sig: "LSP8NotTokenOwner(address,bytes32,address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "caller", type: "address" },
      ],
      name: "LSP8NotTokenOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `caller` is not the `tokenOwner` of the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8NotifyTokenReceiverContractMissingLSP1Interface(
     *  address tokenReceiver
     * )
     *
     * 0x4349776d = keccak256('LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)')
     */
    "0x4349776d": {
      sig: "LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP8NotifyTokenReceiverContractMissingLSP1Interface",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts if the `tokenReceiver` does not implement LSP1 when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP8NotifyTokenReceiverIsEOA(
     *  address tokenReceiver
     * )
     *
     * 0x03173137 = keccak256('LSP8NotifyTokenReceiverIsEOA(address)')
     */
    "0x03173137": {
      sig: "LSP8NotifyTokenReceiverIsEOA(address)",
      inputs: [
        { internalType: "address", name: "tokenReceiver", type: "address" },
      ],
      name: "LSP8NotifyTokenReceiverIsEOA",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.",
        },
      ],
    },

    /**
     * error LSP8OperatorAlreadyAuthorized(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0xa7626b68 = keccak256('LSP8OperatorAlreadyAuthorized(address,bytes32)')
     */
    "0xa7626b68": {
      sig: "LSP8OperatorAlreadyAuthorized(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "LSP8OperatorAlreadyAuthorized",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when `operator` is already authorized for the `tokenId`.",
        },
      ],
    },

    /**
     * error LSP8TokenContractCannotHoldValue()
     *
     * 0x61f49442 = keccak256('LSP8TokenContractCannotHoldValue()')
     */
    "0x61f49442": {
      sig: "LSP8TokenContractCannotHoldValue()",
      inputs: [],
      name: "LSP8TokenContractCannotHoldValue",
      type: "error",
      devdoc: [
        {
          details:
            "Error occurs when sending native tokens to the LSP8 contract without sending any data. E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.",
        },
      ],
      userdoc: [{ notice: "LSP8 contract cannot receive native tokens." }],
    },

    /**
     * error LSP8TokenIdFormatNotEditable()
     *
     * 0x3664800a = keccak256('LSP8TokenIdFormatNotEditable()')
     */
    "0x3664800a": {
      sig: "LSP8TokenIdFormatNotEditable()",
      inputs: [],
      name: "LSP8TokenIdFormatNotEditable",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to edit the data key `LSP8TokenIdFormat` after the identifiable digital asset contract has been deployed. The `LSP8TokenIdFormat` data key is located inside the ERC725Y Data key-value store of the identifiable digital asset contract. It can be set only once inside the constructor/initializer when the identifiable digital asset contract is being deployed.",
        },
      ],
    },

    /**
     * error LSP8TokenIdsDataEmptyArray()
     *
     * 0x80c98305 = keccak256('LSP8TokenIdsDataEmptyArray()')
     */
    "0x80c98305": {
      sig: "LSP8TokenIdsDataEmptyArray()",
      inputs: [],
      name: "LSP8TokenIdsDataEmptyArray",
      type: "error",
      devdoc: [
        { details: "Reverts when empty arrays is passed to the function" },
      ],
    },

    /**
     * error LSP8TokenIdsDataLengthMismatch()
     *
     * 0x2fa71dfe = keccak256('LSP8TokenIdsDataLengthMismatch()')
     */
    "0x2fa71dfe": {
      sig: "LSP8TokenIdsDataLengthMismatch()",
      inputs: [],
      name: "LSP8TokenIdsDataLengthMismatch",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the length of the token IDs data arrays is not equal",
        },
      ],
    },

    /**
     * error LSP8TokenOwnerCannotBeOperator()
     *
     * 0x89fdad62 = keccak256('LSP8TokenOwnerCannotBeOperator()')
     */
    "0x89fdad62": {
      sig: "LSP8TokenOwnerCannotBeOperator()",
      inputs: [],
      name: "LSP8TokenOwnerCannotBeOperator",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to authorize or revoke the token's owner as an operator.",
        },
      ],
    },

    /**
     * error LSP8TokenOwnerChanged(
     *  bytes32 tokenId,
     *  address oldOwner,
     *  address newOwner
     * )
     *
     * 0x5a9c31d3 = keccak256('LSP8TokenOwnerChanged(bytes32,address,address)')
     */
    "0x5a9c31d3": {
      sig: "LSP8TokenOwnerChanged(bytes32,address,address)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "address", name: "oldOwner", type: "address" },
        { internalType: "address", name: "newOwner", type: "address" },
      ],
      name: "LSP8TokenOwnerChanged",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when the token owner changed inside the {_beforeTokenTransfer} hook.",
        },
      ],
    },

    /**
     * error NoExtensionFoundForFunctionSelector(
     *  bytes4 functionSelector
     * )
     *
     * 0xbb370b2b = keccak256('NoExtensionFoundForFunctionSelector(bytes4)')
     */
    "0xbb370b2b": {
      sig: "NoExtensionFoundForFunctionSelector(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "functionSelector", type: "bytes4" },
      ],
      name: "NoExtensionFoundForFunctionSelector",
      type: "error",
      devdoc: [
        {
          details:
            "reverts when there is no extension for the function selector being called with",
        },
      ],
    },

    /**
     * error OwnableCallerNotTheOwner(
     *  address callerAddress
     * )
     *
     * 0xbf1169c5 = keccak256('OwnableCallerNotTheOwner(address)')
     */
    "0xbf1169c5": {
      sig: "OwnableCallerNotTheOwner(address)",
      inputs: [
        { internalType: "address", name: "callerAddress", type: "address" },
      ],
      name: "OwnableCallerNotTheOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when only the owner is allowed to call the function.",
          params: { callerAddress: "The address that tried to make the call." },
        },
      ],
    },

    /**
     * error OwnableCannotSetZeroAddressAsOwner()
     *
     * 0x1ad8836c = keccak256('OwnableCannotSetZeroAddressAsOwner()')
     */
    "0x1ad8836c": {
      sig: "OwnableCannotSetZeroAddressAsOwner()",
      inputs: [],
      name: "OwnableCannotSetZeroAddressAsOwner",
      type: "error",
      devdoc: [
        {
          details:
            "Reverts when trying to set `address(0)` as the contract owner when deploying the contract, initializing it or transferring ownership of the contract.",
        },
      ],
    },
  },
};
export const EventSigHashes = {
  Create2Factory: {
    /**
     * event ContractCreated(
     *  address addr,
     *  bytes32 salt
     * )
     *
     * 0xc16bb3dbd36917c7aa3e76b988c2cd35e74bb230a02fef61e7376d8b4bfaea77 = keccak256('ContractCreated(address,bytes32)')
     */
    "0xc16bb3dbd36917c7aa3e76b988c2cd35e74bb230a02fef61e7376d8b4bfaea77": {
      sig: "ContractCreated(address,bytes32)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "addr",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "salt",
          type: "bytes32",
        },
      ],
      name: "ContractCreated",
      type: "event",
    },
  },
  LSP11BasicSocialRecovery: {
    /**
     * event GuardianAdded(
     *  address indexed newGuardian
     * )
     *
     * 0x038596bb31e2e7d3d9f184d4c98b310103f6d7f5830e5eec32bffe6f1728f969 = keccak256('GuardianAdded(address)')
     */
    "0x038596bb31e2e7d3d9f184d4c98b310103f6d7f5830e5eec32bffe6f1728f969": {
      sig: "GuardianAdded(address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "newGuardian",
          type: "address",
        },
      ],
      name: "GuardianAdded",
      type: "event",
      userdoc: { notice: "Emitted when setting a new guardian for the target" },
    },

    /**
     * event GuardianRemoved(
     *  address indexed removedGuardian
     * )
     *
     * 0xb8107d0c6b40be480ce3172ee66ba6d64b71f6b1685a851340036e6e2e3e3c52 = keccak256('GuardianRemoved(address)')
     */
    "0xb8107d0c6b40be480ce3172ee66ba6d64b71f6b1685a851340036e6e2e3e3c52": {
      sig: "GuardianRemoved(address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "removedGuardian",
          type: "address",
        },
      ],
      name: "GuardianRemoved",
      type: "event",
      userdoc: {
        notice: "Emitted when removing an existing guardian for the target",
      },
    },

    /**
     * event GuardiansThresholdChanged(
     *  uint256 indexed guardianThreshold
     * )
     *
     * 0x7146d20a2c7b7c75c203774c9f241b61698fac43a4a81ccd828f0d8162392790 = keccak256('GuardiansThresholdChanged(uint256)')
     */
    "0x7146d20a2c7b7c75c203774c9f241b61698fac43a4a81ccd828f0d8162392790": {
      sig: "GuardiansThresholdChanged(uint256)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "guardianThreshold",
          type: "uint256",
        },
      ],
      name: "GuardiansThresholdChanged",
      type: "event",
      userdoc: { notice: "Emitted when changing the guardian threshold" },
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event RecoveryProcessSuccessful(
     *  uint256 indexed recoveryCounter,
     *  address indexed newController,
     *  bytes32 indexed newSecretHash,
     *  address[] guardians
     * )
     *
     * 0xf4ff8803d6b43af46d48c200977209829c2f42f19f27eda1c89dbf26a28009cd = keccak256('RecoveryProcessSuccessful(uint256,address,bytes32,address[])')
     */
    "0xf4ff8803d6b43af46d48c200977209829c2f42f19f27eda1c89dbf26a28009cd": {
      sig: "RecoveryProcessSuccessful(uint256,address,bytes32,address[])",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "recoveryCounter",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newController",
          type: "address",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "newSecretHash",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "guardians",
          type: "address[]",
        },
      ],
      name: "RecoveryProcessSuccessful",
      type: "event",
      userdoc: {
        notice:
          "Emitted when the recovery process is finished by the controller who reached the guardian threshold and submitted the string that produce the secretHash",
      },
    },

    /**
     * event SecretHashChanged(
     *  bytes32 indexed secretHash
     * )
     *
     * 0x2e8c5419a62207ade549fe0b66c1c85c16f5e1ed654815dee3a3f3ac41770df3 = keccak256('SecretHashChanged(bytes32)')
     */
    "0x2e8c5419a62207ade549fe0b66c1c85c16f5e1ed654815dee3a3f3ac41770df3": {
      sig: "SecretHashChanged(bytes32)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "secretHash",
          type: "bytes32",
        },
      ],
      name: "SecretHashChanged",
      type: "event",
      userdoc: { notice: "Emitted when changing the secret hash" },
    },

    /**
     * event SelectedNewController(
     *  uint256 indexed recoveryCounter,
     *  address indexed guardian,
     *  address indexed addressSelected
     * )
     *
     * 0xe43f3c1093c69ab76b2cf6246090acb2f8eab7f19ba9942dfc8b8ec446e3a3de = keccak256('SelectedNewController(uint256,address,address)')
     */
    "0xe43f3c1093c69ab76b2cf6246090acb2f8eab7f19ba9942dfc8b8ec446e3a3de": {
      sig: "SelectedNewController(uint256,address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "recoveryCounter",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "guardian",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "addressSelected",
          type: "address",
        },
      ],
      name: "SelectedNewController",
      type: "event",
      userdoc: {
        notice:
          "Emitted when a guardian select a new potentiel controller address for the target",
      },
    },
  },
  LSP11BasicSocialRecoveryInit: {
    /**
     * event GuardianAdded(
     *  address indexed newGuardian
     * )
     *
     * 0x038596bb31e2e7d3d9f184d4c98b310103f6d7f5830e5eec32bffe6f1728f969 = keccak256('GuardianAdded(address)')
     */
    "0x038596bb31e2e7d3d9f184d4c98b310103f6d7f5830e5eec32bffe6f1728f969": {
      sig: "GuardianAdded(address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "newGuardian",
          type: "address",
        },
      ],
      name: "GuardianAdded",
      type: "event",
      userdoc: { notice: "Emitted when setting a new guardian for the target" },
    },

    /**
     * event GuardianRemoved(
     *  address indexed removedGuardian
     * )
     *
     * 0xb8107d0c6b40be480ce3172ee66ba6d64b71f6b1685a851340036e6e2e3e3c52 = keccak256('GuardianRemoved(address)')
     */
    "0xb8107d0c6b40be480ce3172ee66ba6d64b71f6b1685a851340036e6e2e3e3c52": {
      sig: "GuardianRemoved(address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "removedGuardian",
          type: "address",
        },
      ],
      name: "GuardianRemoved",
      type: "event",
      userdoc: {
        notice: "Emitted when removing an existing guardian for the target",
      },
    },

    /**
     * event GuardiansThresholdChanged(
     *  uint256 indexed guardianThreshold
     * )
     *
     * 0x7146d20a2c7b7c75c203774c9f241b61698fac43a4a81ccd828f0d8162392790 = keccak256('GuardiansThresholdChanged(uint256)')
     */
    "0x7146d20a2c7b7c75c203774c9f241b61698fac43a4a81ccd828f0d8162392790": {
      sig: "GuardiansThresholdChanged(uint256)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "guardianThreshold",
          type: "uint256",
        },
      ],
      name: "GuardiansThresholdChanged",
      type: "event",
      userdoc: { notice: "Emitted when changing the guardian threshold" },
    },

    /**
     * event Initialized(
     *  uint8 version
     * )
     *
     * 0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498 = keccak256('Initialized(uint8)')
     */
    "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498": {
      sig: "Initialized(uint8)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "version",
          type: "uint8",
        },
      ],
      name: "Initialized",
      type: "event",
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event RecoveryProcessSuccessful(
     *  uint256 indexed recoveryCounter,
     *  address indexed newController,
     *  bytes32 indexed newSecretHash,
     *  address[] guardians
     * )
     *
     * 0xf4ff8803d6b43af46d48c200977209829c2f42f19f27eda1c89dbf26a28009cd = keccak256('RecoveryProcessSuccessful(uint256,address,bytes32,address[])')
     */
    "0xf4ff8803d6b43af46d48c200977209829c2f42f19f27eda1c89dbf26a28009cd": {
      sig: "RecoveryProcessSuccessful(uint256,address,bytes32,address[])",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "recoveryCounter",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newController",
          type: "address",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "newSecretHash",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "guardians",
          type: "address[]",
        },
      ],
      name: "RecoveryProcessSuccessful",
      type: "event",
      userdoc: {
        notice:
          "Emitted when the recovery process is finished by the controller who reached the guardian threshold and submitted the string that produce the secretHash",
      },
    },

    /**
     * event SecretHashChanged(
     *  bytes32 indexed secretHash
     * )
     *
     * 0x2e8c5419a62207ade549fe0b66c1c85c16f5e1ed654815dee3a3f3ac41770df3 = keccak256('SecretHashChanged(bytes32)')
     */
    "0x2e8c5419a62207ade549fe0b66c1c85c16f5e1ed654815dee3a3f3ac41770df3": {
      sig: "SecretHashChanged(bytes32)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "secretHash",
          type: "bytes32",
        },
      ],
      name: "SecretHashChanged",
      type: "event",
      userdoc: { notice: "Emitted when changing the secret hash" },
    },

    /**
     * event SelectedNewController(
     *  uint256 indexed recoveryCounter,
     *  address indexed guardian,
     *  address indexed addressSelected
     * )
     *
     * 0xe43f3c1093c69ab76b2cf6246090acb2f8eab7f19ba9942dfc8b8ec446e3a3de = keccak256('SelectedNewController(uint256,address,address)')
     */
    "0xe43f3c1093c69ab76b2cf6246090acb2f8eab7f19ba9942dfc8b8ec446e3a3de": {
      sig: "SelectedNewController(uint256,address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "recoveryCounter",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "guardian",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "addressSelected",
          type: "address",
        },
      ],
      name: "SelectedNewController",
      type: "event",
      userdoc: {
        notice:
          "Emitted when a guardian select a new potentiel controller address for the target",
      },
    },
  },
  LSP23LinkedContractsFactory: {
    /**
     * event DeployedContracts(
     *  address indexed primaryContract,
     *  address indexed secondaryContract,
     *  tuple primaryContractDeployment,
     *  tuple secondaryContractDeployment,
     *  address postDeploymentModule,
     *  bytes postDeploymentModuleCalldata
     * )
     *
     * 0x0e20ea3d6273aab49a7dabafc15cc94971c12dd63a07185ca810e497e4e87aa6 = keccak256('DeployedContracts(address,address,(bytes32,uint256,bytes),(uint256,bytes,bool,bytes),address,bytes)')
     */
    "0x0e20ea3d6273aab49a7dabafc15cc94971c12dd63a07185ca810e497e4e87aa6": {
      sig: "DeployedContracts(address,address,(bytes32,uint256,bytes),(uint256,bytes,bool,bytes),address,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "primaryContract",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "secondaryContract",
          type: "address",
        },
        {
          components: [
            { internalType: "bytes32", name: "salt", type: "bytes32" },
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            { internalType: "bytes", name: "creationBytecode", type: "bytes" },
          ],
          indexed: false,
          internalType:
            "struct ILSP23LinkedContractsFactory.PrimaryContractDeployment",
          name: "primaryContractDeployment",
          type: "tuple",
        },
        {
          components: [
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            { internalType: "bytes", name: "creationBytecode", type: "bytes" },
            {
              internalType: "bool",
              name: "addPrimaryContractAddress",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "extraConstructorParams",
              type: "bytes",
            },
          ],
          indexed: false,
          internalType:
            "struct ILSP23LinkedContractsFactory.SecondaryContractDeployment",
          name: "secondaryContractDeployment",
          type: "tuple",
        },
        {
          indexed: false,
          internalType: "address",
          name: "postDeploymentModule",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "postDeploymentModuleCalldata",
          type: "bytes",
        },
      ],
      name: "DeployedContracts",
      type: "event",
    },

    /**
     * event DeployedERC1167Proxies(
     *  address indexed primaryContract,
     *  address indexed secondaryContract,
     *  tuple primaryContractDeploymentInit,
     *  tuple secondaryContractDeploymentInit,
     *  address postDeploymentModule,
     *  bytes postDeploymentModuleCalldata
     * )
     *
     * 0xe20570ed9bda3b93eea277b4e5d975c8933fd5f85f2c824d0845ae96c55a54fe = keccak256('DeployedERC1167Proxies(address,address,(bytes32,uint256,address,bytes),(uint256,address,bytes,bool,bytes),address,bytes)')
     */
    "0xe20570ed9bda3b93eea277b4e5d975c8933fd5f85f2c824d0845ae96c55a54fe": {
      sig: "DeployedERC1167Proxies(address,address,(bytes32,uint256,address,bytes),(uint256,address,bytes,bool,bytes),address,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "primaryContract",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "secondaryContract",
          type: "address",
        },
        {
          components: [
            { internalType: "bytes32", name: "salt", type: "bytes32" },
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            {
              internalType: "address",
              name: "implementationContract",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "initializationCalldata",
              type: "bytes",
            },
          ],
          indexed: false,
          internalType:
            "struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit",
          name: "primaryContractDeploymentInit",
          type: "tuple",
        },
        {
          components: [
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            {
              internalType: "address",
              name: "implementationContract",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "initializationCalldata",
              type: "bytes",
            },
            {
              internalType: "bool",
              name: "addPrimaryContractAddress",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "extraInitializationParams",
              type: "bytes",
            },
          ],
          indexed: false,
          internalType:
            "struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit",
          name: "secondaryContractDeploymentInit",
          type: "tuple",
        },
        {
          indexed: false,
          internalType: "address",
          name: "postDeploymentModule",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "postDeploymentModuleCalldata",
          type: "bytes",
        },
      ],
      name: "DeployedERC1167Proxies",
      type: "event",
    },
  },
  LSP9Vault: {
    /**
     * event ContractCreated(
     *  uint256 indexed operationType,
     *  address indexed contractAddress,
     *  uint256 value,
     *  bytes32 indexed salt
     * )
     *
     * 0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3 = keccak256('ContractCreated(uint256,address,uint256,bytes32)')
     */
    "0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3": {
      sig: "ContractCreated(uint256,address,uint256,bytes32)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "operationType",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "contractAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "salt",
          type: "bytes32",
        },
      ],
      name: "ContractCreated",
      type: "event",
      userdoc: {
        notice:
          "Deployed new contract at address `contractAddress` and funded with `value` wei (deployed using opcode: `operationType`).",
      },
    },

    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event Executed(
     *  uint256 indexed operationType,
     *  address indexed target,
     *  uint256 value,
     *  bytes4 indexed selector
     * )
     *
     * 0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e = keccak256('Executed(uint256,address,uint256,bytes4)')
     */
    "0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e": {
      sig: "Executed(uint256,address,uint256,bytes4)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "operationType",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes4",
          name: "selector",
          type: "bytes4",
        },
      ],
      name: "Executed",
      type: "event",
      userdoc: {
        notice:
          "Called address `target` using `operationType` with `value` wei and `data`.",
      },
    },

    /**
     * event OwnershipRenounced()
     *
     * 0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce = keccak256('OwnershipRenounced()')
     */
    "0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce": {
      sig: "OwnershipRenounced()",
      anonymous: false,
      inputs: [],
      name: "OwnershipRenounced",
      type: "event",
      userdoc: {
        notice:
          "Successfully renounced ownership of the contract. This contract is now owned by anyone, it's owner is `address(0)`.",
      },
    },

    /**
     * event OwnershipTransferStarted(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700 = keccak256('OwnershipTransferStarted(address,address)')
     */
    "0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700": {
      sig: "OwnershipTransferStarted(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferStarted",
      type: "event",
      userdoc: {
        notice:
          "The transfer of ownership of the contract was initiated. Pending new owner set to: `newOwner`.",
      },
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event RenounceOwnershipStarted()
     *
     * 0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7 = keccak256('RenounceOwnershipStarted()')
     */
    "0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7": {
      sig: "RenounceOwnershipStarted()",
      anonymous: false,
      inputs: [],
      name: "RenounceOwnershipStarted",
      type: "event",
      userdoc: { notice: "Ownership renouncement initiated." },
    },

    /**
     * event UniversalReceiver(
     *  address indexed from,
     *  uint256 indexed value,
     *  bytes32 indexed typeId,
     *  bytes receivedData,
     *  bytes returnedValue
     * )
     *
     * 0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2 = keccak256('UniversalReceiver(address,uint256,bytes32,bytes,bytes)')
     */
    "0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2": {
      sig: "UniversalReceiver(address,uint256,bytes32,bytes,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "typeId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "receivedData",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "returnedValue",
          type: "bytes",
        },
      ],
      name: "UniversalReceiver",
      type: "event",
      userdoc: {
        notice:
          "Address `from` called the `universalReceiver(...)` function while sending `value` LYX. Notification type (typeId): `typeId` - Data received: `receivedData`.",
      },
    },
  },
  LSP9VaultInit: {
    /**
     * event ContractCreated(
     *  uint256 indexed operationType,
     *  address indexed contractAddress,
     *  uint256 value,
     *  bytes32 indexed salt
     * )
     *
     * 0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3 = keccak256('ContractCreated(uint256,address,uint256,bytes32)')
     */
    "0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3": {
      sig: "ContractCreated(uint256,address,uint256,bytes32)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "operationType",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "contractAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "salt",
          type: "bytes32",
        },
      ],
      name: "ContractCreated",
      type: "event",
      userdoc: {
        notice:
          "Deployed new contract at address `contractAddress` and funded with `value` wei (deployed using opcode: `operationType`).",
      },
    },

    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event Executed(
     *  uint256 indexed operationType,
     *  address indexed target,
     *  uint256 value,
     *  bytes4 indexed selector
     * )
     *
     * 0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e = keccak256('Executed(uint256,address,uint256,bytes4)')
     */
    "0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e": {
      sig: "Executed(uint256,address,uint256,bytes4)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "operationType",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes4",
          name: "selector",
          type: "bytes4",
        },
      ],
      name: "Executed",
      type: "event",
      userdoc: {
        notice:
          "Called address `target` using `operationType` with `value` wei and `data`.",
      },
    },

    /**
     * event Initialized(
     *  uint8 version
     * )
     *
     * 0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498 = keccak256('Initialized(uint8)')
     */
    "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498": {
      sig: "Initialized(uint8)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "version",
          type: "uint8",
        },
      ],
      name: "Initialized",
      type: "event",
    },

    /**
     * event OwnershipRenounced()
     *
     * 0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce = keccak256('OwnershipRenounced()')
     */
    "0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce": {
      sig: "OwnershipRenounced()",
      anonymous: false,
      inputs: [],
      name: "OwnershipRenounced",
      type: "event",
      userdoc: {
        notice:
          "Successfully renounced ownership of the contract. This contract is now owned by anyone, it's owner is `address(0)`.",
      },
    },

    /**
     * event OwnershipTransferStarted(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700 = keccak256('OwnershipTransferStarted(address,address)')
     */
    "0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700": {
      sig: "OwnershipTransferStarted(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferStarted",
      type: "event",
      userdoc: {
        notice:
          "The transfer of ownership of the contract was initiated. Pending new owner set to: `newOwner`.",
      },
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event RenounceOwnershipStarted()
     *
     * 0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7 = keccak256('RenounceOwnershipStarted()')
     */
    "0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7": {
      sig: "RenounceOwnershipStarted()",
      anonymous: false,
      inputs: [],
      name: "RenounceOwnershipStarted",
      type: "event",
      userdoc: { notice: "Ownership renouncement initiated." },
    },

    /**
     * event UniversalReceiver(
     *  address indexed from,
     *  uint256 indexed value,
     *  bytes32 indexed typeId,
     *  bytes receivedData,
     *  bytes returnedValue
     * )
     *
     * 0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2 = keccak256('UniversalReceiver(address,uint256,bytes32,bytes,bytes)')
     */
    "0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2": {
      sig: "UniversalReceiver(address,uint256,bytes32,bytes,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "typeId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "receivedData",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "returnedValue",
          type: "bytes",
        },
      ],
      name: "UniversalReceiver",
      type: "event",
      userdoc: {
        notice:
          "Address `from` called the `universalReceiver(...)` function while sending `value` LYX. Notification type (typeId): `typeId` - Data received: `receivedData`.",
      },
    },
  },
  UniversalProfile: {
    /**
     * event ContractCreated(
     *  uint256 indexed operationType,
     *  address indexed contractAddress,
     *  uint256 value,
     *  bytes32 indexed salt
     * )
     *
     * 0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3 = keccak256('ContractCreated(uint256,address,uint256,bytes32)')
     */
    "0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3": {
      sig: "ContractCreated(uint256,address,uint256,bytes32)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "operationType",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "contractAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "salt",
          type: "bytes32",
        },
      ],
      name: "ContractCreated",
      type: "event",
      userdoc: {
        notice:
          "Deployed new contract at address `contractAddress` and funded with `value` wei (deployed using opcode: `operationType`).",
      },
    },

    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event Executed(
     *  uint256 indexed operationType,
     *  address indexed target,
     *  uint256 value,
     *  bytes4 indexed selector
     * )
     *
     * 0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e = keccak256('Executed(uint256,address,uint256,bytes4)')
     */
    "0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e": {
      sig: "Executed(uint256,address,uint256,bytes4)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "operationType",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes4",
          name: "selector",
          type: "bytes4",
        },
      ],
      name: "Executed",
      type: "event",
      userdoc: {
        notice:
          "Called address `target` using `operationType` with `value` wei and `data`.",
      },
    },

    /**
     * event OwnershipRenounced()
     *
     * 0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce = keccak256('OwnershipRenounced()')
     */
    "0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce": {
      sig: "OwnershipRenounced()",
      anonymous: false,
      inputs: [],
      name: "OwnershipRenounced",
      type: "event",
      userdoc: {
        notice:
          "Successfully renounced ownership of the contract. This contract is now owned by anyone, it's owner is `address(0)`.",
      },
    },

    /**
     * event OwnershipTransferStarted(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700 = keccak256('OwnershipTransferStarted(address,address)')
     */
    "0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700": {
      sig: "OwnershipTransferStarted(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferStarted",
      type: "event",
      userdoc: {
        notice:
          "The transfer of ownership of the contract was initiated. Pending new owner set to: `newOwner`.",
      },
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event RenounceOwnershipStarted()
     *
     * 0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7 = keccak256('RenounceOwnershipStarted()')
     */
    "0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7": {
      sig: "RenounceOwnershipStarted()",
      anonymous: false,
      inputs: [],
      name: "RenounceOwnershipStarted",
      type: "event",
      userdoc: { notice: "Ownership renouncement initiated." },
    },

    /**
     * event UniversalReceiver(
     *  address indexed from,
     *  uint256 indexed value,
     *  bytes32 indexed typeId,
     *  bytes receivedData,
     *  bytes returnedValue
     * )
     *
     * 0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2 = keccak256('UniversalReceiver(address,uint256,bytes32,bytes,bytes)')
     */
    "0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2": {
      sig: "UniversalReceiver(address,uint256,bytes32,bytes,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "typeId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "receivedData",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "returnedValue",
          type: "bytes",
        },
      ],
      name: "UniversalReceiver",
      type: "event",
      userdoc: {
        notice:
          "Address `from` called the `universalReceiver(...)` function while sending `value` LYX. Notification type (typeId): `typeId` - Data received: `receivedData`.",
      },
    },
  },
  UniversalProfileInit: {
    /**
     * event ContractCreated(
     *  uint256 indexed operationType,
     *  address indexed contractAddress,
     *  uint256 value,
     *  bytes32 indexed salt
     * )
     *
     * 0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3 = keccak256('ContractCreated(uint256,address,uint256,bytes32)')
     */
    "0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3": {
      sig: "ContractCreated(uint256,address,uint256,bytes32)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "operationType",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "contractAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "salt",
          type: "bytes32",
        },
      ],
      name: "ContractCreated",
      type: "event",
      userdoc: {
        notice:
          "Deployed new contract at address `contractAddress` and funded with `value` wei (deployed using opcode: `operationType`).",
      },
    },

    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event Executed(
     *  uint256 indexed operationType,
     *  address indexed target,
     *  uint256 value,
     *  bytes4 indexed selector
     * )
     *
     * 0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e = keccak256('Executed(uint256,address,uint256,bytes4)')
     */
    "0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e": {
      sig: "Executed(uint256,address,uint256,bytes4)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "operationType",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes4",
          name: "selector",
          type: "bytes4",
        },
      ],
      name: "Executed",
      type: "event",
      userdoc: {
        notice:
          "Called address `target` using `operationType` with `value` wei and `data`.",
      },
    },

    /**
     * event Initialized(
     *  uint8 version
     * )
     *
     * 0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498 = keccak256('Initialized(uint8)')
     */
    "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498": {
      sig: "Initialized(uint8)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "version",
          type: "uint8",
        },
      ],
      name: "Initialized",
      type: "event",
    },

    /**
     * event OwnershipRenounced()
     *
     * 0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce = keccak256('OwnershipRenounced()')
     */
    "0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce": {
      sig: "OwnershipRenounced()",
      anonymous: false,
      inputs: [],
      name: "OwnershipRenounced",
      type: "event",
      userdoc: {
        notice:
          "Successfully renounced ownership of the contract. This contract is now owned by anyone, it's owner is `address(0)`.",
      },
    },

    /**
     * event OwnershipTransferStarted(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700 = keccak256('OwnershipTransferStarted(address,address)')
     */
    "0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700": {
      sig: "OwnershipTransferStarted(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferStarted",
      type: "event",
      userdoc: {
        notice:
          "The transfer of ownership of the contract was initiated. Pending new owner set to: `newOwner`.",
      },
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event RenounceOwnershipStarted()
     *
     * 0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7 = keccak256('RenounceOwnershipStarted()')
     */
    "0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7": {
      sig: "RenounceOwnershipStarted()",
      anonymous: false,
      inputs: [],
      name: "RenounceOwnershipStarted",
      type: "event",
      userdoc: { notice: "Ownership renouncement initiated." },
    },

    /**
     * event UniversalReceiver(
     *  address indexed from,
     *  uint256 indexed value,
     *  bytes32 indexed typeId,
     *  bytes receivedData,
     *  bytes returnedValue
     * )
     *
     * 0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2 = keccak256('UniversalReceiver(address,uint256,bytes32,bytes,bytes)')
     */
    "0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2": {
      sig: "UniversalReceiver(address,uint256,bytes32,bytes,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "typeId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "receivedData",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "returnedValue",
          type: "bytes",
        },
      ],
      name: "UniversalReceiver",
      type: "event",
      userdoc: {
        notice:
          "Address `from` called the `universalReceiver(...)` function while sending `value` LYX. Notification type (typeId): `typeId` - Data received: `receivedData`.",
      },
    },
  },
  LSP0ERC725Account: {
    /**
     * event ContractCreated(
     *  uint256 indexed operationType,
     *  address indexed contractAddress,
     *  uint256 value,
     *  bytes32 indexed salt
     * )
     *
     * 0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3 = keccak256('ContractCreated(uint256,address,uint256,bytes32)')
     */
    "0xa1fb700aaee2ae4a2ff6f91ce7eba292f89c2f5488b8ec4c5c5c8150692595c3": {
      sig: "ContractCreated(uint256,address,uint256,bytes32)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "operationType",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "contractAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "salt",
          type: "bytes32",
        },
      ],
      name: "ContractCreated",
      type: "event",
      userdoc: {
        notice:
          "Deployed new contract at address `contractAddress` and funded with `value` wei (deployed using opcode: `operationType`).",
      },
    },

    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event Executed(
     *  uint256 indexed operationType,
     *  address indexed target,
     *  uint256 value,
     *  bytes4 indexed selector
     * )
     *
     * 0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e = keccak256('Executed(uint256,address,uint256,bytes4)')
     */
    "0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e": {
      sig: "Executed(uint256,address,uint256,bytes4)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "operationType",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes4",
          name: "selector",
          type: "bytes4",
        },
      ],
      name: "Executed",
      type: "event",
      userdoc: {
        notice:
          "Called address `target` using `operationType` with `value` wei and `data`.",
      },
    },

    /**
     * event OwnershipRenounced()
     *
     * 0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce = keccak256('OwnershipRenounced()')
     */
    "0xd1f66c3d2bc1993a86be5e3d33709d98f0442381befcedd29f578b9b2506b1ce": {
      sig: "OwnershipRenounced()",
      anonymous: false,
      inputs: [],
      name: "OwnershipRenounced",
      type: "event",
      userdoc: {
        notice:
          "Successfully renounced ownership of the contract. This contract is now owned by anyone, it's owner is `address(0)`.",
      },
    },

    /**
     * event OwnershipTransferStarted(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700 = keccak256('OwnershipTransferStarted(address,address)')
     */
    "0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700": {
      sig: "OwnershipTransferStarted(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferStarted",
      type: "event",
      userdoc: {
        notice:
          "The transfer of ownership of the contract was initiated. Pending new owner set to: `newOwner`.",
      },
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event RenounceOwnershipStarted()
     *
     * 0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7 = keccak256('RenounceOwnershipStarted()')
     */
    "0x81b7f830f1f0084db6497c486cbe6974c86488dcc4e3738eab94ab6d6b1653e7": {
      sig: "RenounceOwnershipStarted()",
      anonymous: false,
      inputs: [],
      name: "RenounceOwnershipStarted",
      type: "event",
      userdoc: { notice: "Ownership renouncement initiated." },
    },

    /**
     * event UniversalReceiver(
     *  address indexed from,
     *  uint256 indexed value,
     *  bytes32 indexed typeId,
     *  bytes receivedData,
     *  bytes returnedValue
     * )
     *
     * 0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2 = keccak256('UniversalReceiver(address,uint256,bytes32,bytes,bytes)')
     */
    "0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2": {
      sig: "UniversalReceiver(address,uint256,bytes32,bytes,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "typeId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "receivedData",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "returnedValue",
          type: "bytes",
        },
      ],
      name: "UniversalReceiver",
      type: "event",
      userdoc: {
        notice:
          "Address `from` called the `universalReceiver(...)` function while sending `value` LYX. Notification type (typeId): `typeId` - Data received: `receivedData`.",
      },
    },
  },
  LSP4DigitalAssetMetadata: {
    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
  },
  LSP4DigitalAssetMetadataInitAbstract: {
    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event Initialized(
     *  uint8 version
     * )
     *
     * 0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498 = keccak256('Initialized(uint8)')
     */
    "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498": {
      sig: "Initialized(uint8)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "version",
          type: "uint8",
        },
      ],
      name: "Initialized",
      type: "event",
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
  },
  LSP6KeyManager: {
    /**
     * event PermissionsVerified(
     *  address indexed signer,
     *  uint256 indexed value,
     *  bytes4 indexed selector
     * )
     *
     * 0xc0a62328f6bf5e3172bb1fcb2019f54b2c523b6a48e3513a2298fbf0150b781e = keccak256('PermissionsVerified(address,uint256,bytes4)')
     */
    "0xc0a62328f6bf5e3172bb1fcb2019f54b2c523b6a48e3513a2298fbf0150b781e": {
      sig: "PermissionsVerified(address,uint256,bytes4)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "signer",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes4",
          name: "selector",
          type: "bytes4",
        },
      ],
      name: "PermissionsVerified",
      type: "event",
      userdoc: {
        notice:
          "Verified the permissions of `signer` for calling function `selector` on the linked account and sending `value` of native token.",
      },
    },
  },
  LSP6KeyManagerInit: {
    /**
     * event Initialized(
     *  uint8 version
     * )
     *
     * 0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498 = keccak256('Initialized(uint8)')
     */
    "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498": {
      sig: "Initialized(uint8)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "version",
          type: "uint8",
        },
      ],
      name: "Initialized",
      type: "event",
    },

    /**
     * event PermissionsVerified(
     *  address indexed signer,
     *  uint256 indexed value,
     *  bytes4 indexed selector
     * )
     *
     * 0xc0a62328f6bf5e3172bb1fcb2019f54b2c523b6a48e3513a2298fbf0150b781e = keccak256('PermissionsVerified(address,uint256,bytes4)')
     */
    "0xc0a62328f6bf5e3172bb1fcb2019f54b2c523b6a48e3513a2298fbf0150b781e": {
      sig: "PermissionsVerified(address,uint256,bytes4)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "signer",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bytes4",
          name: "selector",
          type: "bytes4",
        },
      ],
      name: "PermissionsVerified",
      type: "event",
      userdoc: {
        notice:
          "Verified the permissions of `signer` for calling function `selector` on the linked account and sending `value` of native token.",
      },
    },
  },
  LSP7DigitalAsset: {
    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event OperatorAuthorizationChanged(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  uint256 indexed amount,
     *  bytes operatorNotificationData
     * )
     *
     * 0xf772a43bfdf4729b196e3fb54a818b91a2ca6c49d10b2e16278752f9f515c25d = keccak256('OperatorAuthorizationChanged(address,address,uint256,bytes)')
     */
    "0xf772a43bfdf4729b196e3fb54a818b91a2ca6c49d10b2e16278752f9f515c25d": {
      sig: "OperatorAuthorizationChanged(address,address,uint256,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorAuthorizationChanged",
      type: "event",
    },

    /**
     * event OperatorRevoked(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bool indexed notified,
     *  bytes operatorNotificationData
     * )
     *
     * 0x0ebf5762d8855cbe012d2ca42fb33a81175e17c8a8751f8859931ba453bd4167 = keccak256('OperatorRevoked(address,address,bool,bytes)')
     */
    "0x0ebf5762d8855cbe012d2ca42fb33a81175e17c8a8751f8859931ba453bd4167": {
      sig: "OperatorRevoked(address,address,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        { indexed: true, internalType: "bool", name: "notified", type: "bool" },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorRevoked",
      type: "event",
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event Transfer(
     *  address indexed operator,
     *  address indexed from,
     *  address indexed to,
     *  uint256 amount,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6 = keccak256('Transfer(address,address,address,uint256,bool,bytes)')
     */
    "0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6": {
      sig: "Transfer(address,address,address,uint256,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        { indexed: false, internalType: "bool", name: "force", type: "bool" },
        { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "Transfer",
      type: "event",
    },
  },
  LSP7DigitalAssetInitAbstract: {
    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event Initialized(
     *  uint8 version
     * )
     *
     * 0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498 = keccak256('Initialized(uint8)')
     */
    "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498": {
      sig: "Initialized(uint8)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "version",
          type: "uint8",
        },
      ],
      name: "Initialized",
      type: "event",
    },

    /**
     * event OperatorAuthorizationChanged(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  uint256 indexed amount,
     *  bytes operatorNotificationData
     * )
     *
     * 0xf772a43bfdf4729b196e3fb54a818b91a2ca6c49d10b2e16278752f9f515c25d = keccak256('OperatorAuthorizationChanged(address,address,uint256,bytes)')
     */
    "0xf772a43bfdf4729b196e3fb54a818b91a2ca6c49d10b2e16278752f9f515c25d": {
      sig: "OperatorAuthorizationChanged(address,address,uint256,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorAuthorizationChanged",
      type: "event",
    },

    /**
     * event OperatorRevoked(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bool indexed notified,
     *  bytes operatorNotificationData
     * )
     *
     * 0x0ebf5762d8855cbe012d2ca42fb33a81175e17c8a8751f8859931ba453bd4167 = keccak256('OperatorRevoked(address,address,bool,bytes)')
     */
    "0x0ebf5762d8855cbe012d2ca42fb33a81175e17c8a8751f8859931ba453bd4167": {
      sig: "OperatorRevoked(address,address,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        { indexed: true, internalType: "bool", name: "notified", type: "bool" },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorRevoked",
      type: "event",
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event Transfer(
     *  address indexed operator,
     *  address indexed from,
     *  address indexed to,
     *  uint256 amount,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6 = keccak256('Transfer(address,address,address,uint256,bool,bytes)')
     */
    "0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6": {
      sig: "Transfer(address,address,address,uint256,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        { indexed: false, internalType: "bool", name: "force", type: "bool" },
        { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "Transfer",
      type: "event",
    },
  },
  LSP7CappedSupply: {
    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event OperatorAuthorizationChanged(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  uint256 indexed amount,
     *  bytes operatorNotificationData
     * )
     *
     * 0xf772a43bfdf4729b196e3fb54a818b91a2ca6c49d10b2e16278752f9f515c25d = keccak256('OperatorAuthorizationChanged(address,address,uint256,bytes)')
     */
    "0xf772a43bfdf4729b196e3fb54a818b91a2ca6c49d10b2e16278752f9f515c25d": {
      sig: "OperatorAuthorizationChanged(address,address,uint256,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorAuthorizationChanged",
      type: "event",
    },

    /**
     * event OperatorRevoked(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bool indexed notified,
     *  bytes operatorNotificationData
     * )
     *
     * 0x0ebf5762d8855cbe012d2ca42fb33a81175e17c8a8751f8859931ba453bd4167 = keccak256('OperatorRevoked(address,address,bool,bytes)')
     */
    "0x0ebf5762d8855cbe012d2ca42fb33a81175e17c8a8751f8859931ba453bd4167": {
      sig: "OperatorRevoked(address,address,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        { indexed: true, internalType: "bool", name: "notified", type: "bool" },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorRevoked",
      type: "event",
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event Transfer(
     *  address indexed operator,
     *  address indexed from,
     *  address indexed to,
     *  uint256 amount,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6 = keccak256('Transfer(address,address,address,uint256,bool,bytes)')
     */
    "0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6": {
      sig: "Transfer(address,address,address,uint256,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        { indexed: false, internalType: "bool", name: "force", type: "bool" },
        { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "Transfer",
      type: "event",
    },
  },
  LSP7CappedSupplyInitAbstract: {
    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event Initialized(
     *  uint8 version
     * )
     *
     * 0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498 = keccak256('Initialized(uint8)')
     */
    "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498": {
      sig: "Initialized(uint8)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "version",
          type: "uint8",
        },
      ],
      name: "Initialized",
      type: "event",
    },

    /**
     * event OperatorAuthorizationChanged(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  uint256 indexed amount,
     *  bytes operatorNotificationData
     * )
     *
     * 0xf772a43bfdf4729b196e3fb54a818b91a2ca6c49d10b2e16278752f9f515c25d = keccak256('OperatorAuthorizationChanged(address,address,uint256,bytes)')
     */
    "0xf772a43bfdf4729b196e3fb54a818b91a2ca6c49d10b2e16278752f9f515c25d": {
      sig: "OperatorAuthorizationChanged(address,address,uint256,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorAuthorizationChanged",
      type: "event",
    },

    /**
     * event OperatorRevoked(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bool indexed notified,
     *  bytes operatorNotificationData
     * )
     *
     * 0x0ebf5762d8855cbe012d2ca42fb33a81175e17c8a8751f8859931ba453bd4167 = keccak256('OperatorRevoked(address,address,bool,bytes)')
     */
    "0x0ebf5762d8855cbe012d2ca42fb33a81175e17c8a8751f8859931ba453bd4167": {
      sig: "OperatorRevoked(address,address,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        { indexed: true, internalType: "bool", name: "notified", type: "bool" },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorRevoked",
      type: "event",
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event Transfer(
     *  address indexed operator,
     *  address indexed from,
     *  address indexed to,
     *  uint256 amount,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6 = keccak256('Transfer(address,address,address,uint256,bool,bytes)')
     */
    "0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6": {
      sig: "Transfer(address,address,address,uint256,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        { indexed: false, internalType: "bool", name: "force", type: "bool" },
        { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "Transfer",
      type: "event",
    },
  },
  LSP8IdentifiableDigitalAsset: {
    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event OperatorAuthorizationChanged(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bytes32 indexed tokenId,
     *  bytes operatorNotificationData
     * )
     *
     * 0x1b1b58aa2ec0cec2228b2d37124556d41f5a1f7b12f089171f896cc236671215 = keccak256('OperatorAuthorizationChanged(address,address,bytes32,bytes)')
     */
    "0x1b1b58aa2ec0cec2228b2d37124556d41f5a1f7b12f089171f896cc236671215": {
      sig: "OperatorAuthorizationChanged(address,address,bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorAuthorizationChanged",
      type: "event",
    },

    /**
     * event OperatorRevoked(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bytes32 indexed tokenId,
     *  bool notified,
     *  bytes operatorNotificationData
     * )
     *
     * 0xc78cd419d6136f9f1c1c6aec1d3fae098cffaf8bc86314a8f2685e32fe574e3c = keccak256('OperatorRevoked(address,address,bytes32,bool,bytes)')
     */
    "0xc78cd419d6136f9f1c1c6aec1d3fae098cffaf8bc86314a8f2685e32fe574e3c": {
      sig: "OperatorRevoked(address,address,bytes32,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "notified",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorRevoked",
      type: "event",
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event TokenIdDataChanged(
     *  bytes32 indexed tokenId,
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xa6e4251f855f750545fe414f120db91c76b88def14d120969e5bb2d3f05debbb = keccak256('TokenIdDataChanged(bytes32,bytes32,bytes)')
     */
    "0xa6e4251f855f750545fe414f120db91c76b88def14d120969e5bb2d3f05debbb": {
      sig: "TokenIdDataChanged(bytes32,bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "TokenIdDataChanged",
      type: "event",
    },

    /**
     * event Transfer(
     *  address operator,
     *  address indexed from,
     *  address indexed to,
     *  bytes32 indexed tokenId,
     *  bool force,
     *  bytes data
     * )
     *
     * 0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf = keccak256('Transfer(address,address,address,bytes32,bool,bytes)')
     */
    "0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf": {
      sig: "Transfer(address,address,address,bytes32,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        { indexed: false, internalType: "bool", name: "force", type: "bool" },
        { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "Transfer",
      type: "event",
    },
  },
  LSP8IdentifiableDigitalAssetInitAbstract: {
    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event Initialized(
     *  uint8 version
     * )
     *
     * 0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498 = keccak256('Initialized(uint8)')
     */
    "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498": {
      sig: "Initialized(uint8)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "version",
          type: "uint8",
        },
      ],
      name: "Initialized",
      type: "event",
    },

    /**
     * event OperatorAuthorizationChanged(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bytes32 indexed tokenId,
     *  bytes operatorNotificationData
     * )
     *
     * 0x1b1b58aa2ec0cec2228b2d37124556d41f5a1f7b12f089171f896cc236671215 = keccak256('OperatorAuthorizationChanged(address,address,bytes32,bytes)')
     */
    "0x1b1b58aa2ec0cec2228b2d37124556d41f5a1f7b12f089171f896cc236671215": {
      sig: "OperatorAuthorizationChanged(address,address,bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorAuthorizationChanged",
      type: "event",
    },

    /**
     * event OperatorRevoked(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bytes32 indexed tokenId,
     *  bool notified,
     *  bytes operatorNotificationData
     * )
     *
     * 0xc78cd419d6136f9f1c1c6aec1d3fae098cffaf8bc86314a8f2685e32fe574e3c = keccak256('OperatorRevoked(address,address,bytes32,bool,bytes)')
     */
    "0xc78cd419d6136f9f1c1c6aec1d3fae098cffaf8bc86314a8f2685e32fe574e3c": {
      sig: "OperatorRevoked(address,address,bytes32,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "notified",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorRevoked",
      type: "event",
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event TokenIdDataChanged(
     *  bytes32 indexed tokenId,
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xa6e4251f855f750545fe414f120db91c76b88def14d120969e5bb2d3f05debbb = keccak256('TokenIdDataChanged(bytes32,bytes32,bytes)')
     */
    "0xa6e4251f855f750545fe414f120db91c76b88def14d120969e5bb2d3f05debbb": {
      sig: "TokenIdDataChanged(bytes32,bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "TokenIdDataChanged",
      type: "event",
    },

    /**
     * event Transfer(
     *  address operator,
     *  address indexed from,
     *  address indexed to,
     *  bytes32 indexed tokenId,
     *  bool force,
     *  bytes data
     * )
     *
     * 0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf = keccak256('Transfer(address,address,address,bytes32,bool,bytes)')
     */
    "0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf": {
      sig: "Transfer(address,address,address,bytes32,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        { indexed: false, internalType: "bool", name: "force", type: "bool" },
        { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "Transfer",
      type: "event",
    },
  },
  LSP8CappedSupply: {
    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event OperatorAuthorizationChanged(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bytes32 indexed tokenId,
     *  bytes operatorNotificationData
     * )
     *
     * 0x1b1b58aa2ec0cec2228b2d37124556d41f5a1f7b12f089171f896cc236671215 = keccak256('OperatorAuthorizationChanged(address,address,bytes32,bytes)')
     */
    "0x1b1b58aa2ec0cec2228b2d37124556d41f5a1f7b12f089171f896cc236671215": {
      sig: "OperatorAuthorizationChanged(address,address,bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorAuthorizationChanged",
      type: "event",
    },

    /**
     * event OperatorRevoked(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bytes32 indexed tokenId,
     *  bool notified,
     *  bytes operatorNotificationData
     * )
     *
     * 0xc78cd419d6136f9f1c1c6aec1d3fae098cffaf8bc86314a8f2685e32fe574e3c = keccak256('OperatorRevoked(address,address,bytes32,bool,bytes)')
     */
    "0xc78cd419d6136f9f1c1c6aec1d3fae098cffaf8bc86314a8f2685e32fe574e3c": {
      sig: "OperatorRevoked(address,address,bytes32,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "notified",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorRevoked",
      type: "event",
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event TokenIdDataChanged(
     *  bytes32 indexed tokenId,
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xa6e4251f855f750545fe414f120db91c76b88def14d120969e5bb2d3f05debbb = keccak256('TokenIdDataChanged(bytes32,bytes32,bytes)')
     */
    "0xa6e4251f855f750545fe414f120db91c76b88def14d120969e5bb2d3f05debbb": {
      sig: "TokenIdDataChanged(bytes32,bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "TokenIdDataChanged",
      type: "event",
    },

    /**
     * event Transfer(
     *  address operator,
     *  address indexed from,
     *  address indexed to,
     *  bytes32 indexed tokenId,
     *  bool force,
     *  bytes data
     * )
     *
     * 0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf = keccak256('Transfer(address,address,address,bytes32,bool,bytes)')
     */
    "0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf": {
      sig: "Transfer(address,address,address,bytes32,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        { indexed: false, internalType: "bool", name: "force", type: "bool" },
        { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "Transfer",
      type: "event",
    },
  },
  LSP8CappedSupplyInitAbstract: {
    /**
     * event DataChanged(
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2 = keccak256('DataChanged(bytes32,bytes)')
     */
    "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2": {
      sig: "DataChanged(bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "DataChanged",
      type: "event",
      userdoc: {
        notice:
          "The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * event Initialized(
     *  uint8 version
     * )
     *
     * 0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498 = keccak256('Initialized(uint8)')
     */
    "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498": {
      sig: "Initialized(uint8)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint8",
          name: "version",
          type: "uint8",
        },
      ],
      name: "Initialized",
      type: "event",
    },

    /**
     * event OperatorAuthorizationChanged(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bytes32 indexed tokenId,
     *  bytes operatorNotificationData
     * )
     *
     * 0x1b1b58aa2ec0cec2228b2d37124556d41f5a1f7b12f089171f896cc236671215 = keccak256('OperatorAuthorizationChanged(address,address,bytes32,bytes)')
     */
    "0x1b1b58aa2ec0cec2228b2d37124556d41f5a1f7b12f089171f896cc236671215": {
      sig: "OperatorAuthorizationChanged(address,address,bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorAuthorizationChanged",
      type: "event",
    },

    /**
     * event OperatorRevoked(
     *  address indexed operator,
     *  address indexed tokenOwner,
     *  bytes32 indexed tokenId,
     *  bool notified,
     *  bytes operatorNotificationData
     * )
     *
     * 0xc78cd419d6136f9f1c1c6aec1d3fae098cffaf8bc86314a8f2685e32fe574e3c = keccak256('OperatorRevoked(address,address,bytes32,bool,bytes)')
     */
    "0xc78cd419d6136f9f1c1c6aec1d3fae098cffaf8bc86314a8f2685e32fe574e3c": {
      sig: "OperatorRevoked(address,address,bytes32,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "notified",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "OperatorRevoked",
      type: "event",
    },

    /**
     * event OwnershipTransferred(
     *  address indexed previousOwner,
     *  address indexed newOwner
     * )
     *
     * 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0 = keccak256('OwnershipTransferred(address,address)')
     */
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0": {
      sig: "OwnershipTransferred(address,address)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },

    /**
     * event TokenIdDataChanged(
     *  bytes32 indexed tokenId,
     *  bytes32 indexed dataKey,
     *  bytes dataValue
     * )
     *
     * 0xa6e4251f855f750545fe414f120db91c76b88def14d120969e5bb2d3f05debbb = keccak256('TokenIdDataChanged(bytes32,bytes32,bytes)')
     */
    "0xa6e4251f855f750545fe414f120db91c76b88def14d120969e5bb2d3f05debbb": {
      sig: "TokenIdDataChanged(bytes32,bytes32,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "dataKey",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "dataValue",
          type: "bytes",
        },
      ],
      name: "TokenIdDataChanged",
      type: "event",
    },

    /**
     * event Transfer(
     *  address operator,
     *  address indexed from,
     *  address indexed to,
     *  bytes32 indexed tokenId,
     *  bool force,
     *  bytes data
     * )
     *
     * 0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf = keccak256('Transfer(address,address,address,bytes32,bool,bytes)')
     */
    "0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf": {
      sig: "Transfer(address,address,address,bytes32,bool,bytes)",
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: true,
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
        { indexed: false, internalType: "bool", name: "force", type: "bool" },
        { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "Transfer",
      type: "event",
    },
  },
};
export const FunctionSelectors = {
  Create2Factory: {
    /**
     * function computeAddress(
     *  bytes32 salt,
     *  bytes32 bytecodeHash
     * )
     *
     * 0x481286e6 = keccak256('computeAddress(bytes32,bytes32)')
     */
    "0x481286e6": {
      sig: "computeAddress(bytes32,bytes32)",
      inputs: [
        { internalType: "bytes32", name: "salt", type: "bytes32" },
        { internalType: "bytes32", name: "bytecodeHash", type: "bytes32" },
      ],
      name: "computeAddress",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the address where a contract will be stored if deployed via {deploy}. Any change in the `bytecodeHash` or `salt` will result in a new destination address.",
      },
    },

    /**
     * function computeAddress(
     *  bytes32 salt,
     *  bytes32 bytecodeHash,
     *  address deployer
     * )
     *
     * 0x78065306 = keccak256('computeAddress(bytes32,bytes32,address)')
     */
    "0x78065306": {
      sig: "computeAddress(bytes32,bytes32,address)",
      inputs: [
        { internalType: "bytes32", name: "salt", type: "bytes32" },
        { internalType: "bytes32", name: "bytecodeHash", type: "bytes32" },
        { internalType: "address", name: "deployer", type: "address" },
      ],
      name: "computeAddress",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "pure",
      type: "function",
      devdoc: {
        details:
          "Returns the address where a contract will be stored if deployed via {deploy} from a contract located at `deployer`. If `deployer` is this contract's address, returns the same value as {computeAddress}.",
      },
    },

    /**
     * function deploy(
     *  bytes32 salt,
     *  bytes bytecode
     * )
     *
     * 0xcdcb760a = keccak256('deploy(bytes32,bytes)')
     */
    "0xcdcb760a": {
      sig: "deploy(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "salt", type: "bytes32" },
        { internalType: "bytes", name: "bytecode", type: "bytes" },
      ],
      name: "deploy",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        details:
          "Deploys a contract using `CREATE2`. The address where the contract will be deployed can be known in advance via {computeAddress}. The bytecode for a contract can be obtained from Solidity with `type(contractName).creationCode`. Requirements: - `bytecode` must not be empty. - `salt` must have not been used for `bytecode` already.",
      },
    },
  },
  LSP11BasicSocialRecovery: {
    /**
     * function addGuardian(
     *  address newGuardian
     * )
     *
     * 0xa526d83b = keccak256('addGuardian(address)')
     */
    "0xa526d83b": {
      sig: "addGuardian(address)",
      inputs: [
        { internalType: "address", name: "newGuardian", type: "address" },
      ],
      name: "addGuardian",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details: "Adds a guardian of the targetCan be called only by the owner",
        params: { newGuardian: "The address to add as a guardian" },
      },
    },

    /**
     * function getGuardianChoice(
     *  address guardian
     * )
     *
     * 0xf6a22f02 = keccak256('getGuardianChoice(address)')
     */
    "0xf6a22f02": {
      sig: "getGuardianChoice(address)",
      inputs: [{ internalType: "address", name: "guardian", type: "address" }],
      name: "getGuardianChoice",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the address of a controller that a `guardian` selected for in order to recover the target",
        params: {
          guardian: "the address of a guardian to query his selection",
        },
        returns: { _0: "the address that `guardian` selected" },
      },
    },

    /**
     * function getGuardians()
     *
     * 0x0665f04b = keccak256('getGuardians()')
     */
    "0x0665f04b": {
      sig: "getGuardians()",
      inputs: [],
      name: "getGuardians",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the addresses of all guardians The guardians will select an address to be added as a controller key for the linked `target` if he reaches the guardian threshold and provide the correct string that produce the secretHash",
      },
    },

    /**
     * function getGuardiansThreshold()
     *
     * 0x187c5348 = keccak256('getGuardiansThreshold()')
     */
    "0x187c5348": {
      sig: "getGuardiansThreshold()",
      inputs: [],
      name: "getGuardiansThreshold",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the guardian threshold The guardian threshold represents the minimum number of selection by guardians required for an address to start a recovery process",
      },
    },

    /**
     * function getRecoveryCounter()
     *
     * 0xf79c8b77 = keccak256('getRecoveryCounter()')
     */
    "0xf79c8b77": {
      sig: "getRecoveryCounter()",
      inputs: [],
      name: "getRecoveryCounter",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the current recovery counter When a recovery process is successfully finished the recovery counter is incremented",
      },
    },

    /**
     * function getRecoverySecretHash()
     *
     * 0x8f9083bb = keccak256('getRecoverySecretHash()')
     */
    "0x8f9083bb": {
      sig: "getRecoverySecretHash()",
      inputs: [],
      name: "getRecoverySecretHash",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the recovery secret hash" },
    },

    /**
     * function isGuardian(
     *  address _address
     * )
     *
     * 0x0c68ba21 = keccak256('isGuardian(address)')
     */
    "0x0c68ba21": {
      sig: "isGuardian(address)",
      inputs: [{ internalType: "address", name: "_address", type: "address" }],
      name: "isGuardian",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns TRUE if the address provided is a guardian, FALSE otherwise",
        params: { _address: "The address to query" },
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function recoverOwnership(
     *  address recoverer,
     *  string plainSecret,
     *  bytes32 newSecretHash
     * )
     *
     * 0xae8481b2 = keccak256('recoverOwnership(address,string,bytes32)')
     */
    "0xae8481b2": {
      sig: "recoverOwnership(address,string,bytes32)",
      inputs: [
        { internalType: "address", name: "recoverer", type: "address" },
        { internalType: "string", name: "plainSecret", type: "string" },
        { internalType: "bytes32", name: "newSecretHash", type: "bytes32" },
      ],
      name: "recoverOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Recovers the ownership permissions of an address in the linked target and increment the recover counter Requirements - the address of the recoverer must have a selection equal or higher than the threshold defined in `getGuardiansThreshold(...)` - must have provided the right `plainSecret` that produces the secret Hash",
        params: {
          newHash:
            "The new secret Hash to be used in the next recovery process",
          plainSecret: "The secret word that produce the secret Hash",
          recoverer: "The address of the recoverer",
        },
      },
    },

    /**
     * function removeGuardian(
     *  address existingGuardian
     * )
     *
     * 0x71404156 = keccak256('removeGuardian(address)')
     */
    "0x71404156": {
      sig: "removeGuardian(address)",
      inputs: [
        { internalType: "address", name: "existingGuardian", type: "address" },
      ],
      name: "removeGuardian",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Removes a guardian of the targetCan be called only by the owner",
        params: {
          currentGuardian:
            "The address of the existing guardian to remove Requirements: - The guardians count should be higher or equal to the guardain threshold",
        },
      },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function selectNewController(
     *  address addressSelected
     * )
     *
     * 0xaa7806d6 = keccak256('selectNewController(address)')
     */
    "0xaa7806d6": {
      sig: "selectNewController(address)",
      inputs: [
        { internalType: "address", name: "addressSelected", type: "address" },
      ],
      name: "selectNewController",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "select an address to be a potentiel controller address if he reaches the guardian threshold and provide the correct secret string Requirements: - only guardians can select an address",
        params: { addressSelected: "The address selected by the guardian" },
      },
    },

    /**
     * function setGuardiansThreshold(
     *  uint256 newThreshold
     * )
     *
     * 0x6bfed20b = keccak256('setGuardiansThreshold(uint256)')
     */
    "0x6bfed20b": {
      sig: "setGuardiansThreshold(uint256)",
      inputs: [
        { internalType: "uint256", name: "newThreshold", type: "uint256" },
      ],
      name: "setGuardiansThreshold",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Sets the minimum number of selection by the guardians required so that an address can recover ownershipCan be called only by the owner",
        params: {
          guardiansThreshold:
            "The threshold to set Requirements: - `guardiansThreshold` cannot be more than the guardians count.",
        },
      },
    },

    /**
     * function setRecoverySecretHash(
     *  bytes32 newRecoverSecretHash
     * )
     *
     * 0xf799e38d = keccak256('setRecoverySecretHash(bytes32)')
     */
    "0xf799e38d": {
      sig: "setRecoverySecretHash(bytes32)",
      inputs: [
        {
          internalType: "bytes32",
          name: "newRecoverSecretHash",
          type: "bytes32",
        },
      ],
      name: "setRecoverySecretHash",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details: "Throws if hash provided is bytes32(0)",
        params: {
          newRecoverSecretHash:
            "The hash of the secret string Requirements: - `secretHash` cannot be bytes32(0)",
        },
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 _interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "_interfaceId", type: "bytes4" },
      ],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function target()
     *
     * 0xd4b83992 = keccak256('target()')
     */
    "0xd4b83992": {
      sig: "target()",
      inputs: [],
      name: "target",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "The address of an ERC725 contract where we want to recover and set permissions for a controller address",
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP11BasicSocialRecoveryInit: {
    /**
     * function addGuardian(
     *  address newGuardian
     * )
     *
     * 0xa526d83b = keccak256('addGuardian(address)')
     */
    "0xa526d83b": {
      sig: "addGuardian(address)",
      inputs: [
        { internalType: "address", name: "newGuardian", type: "address" },
      ],
      name: "addGuardian",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details: "Adds a guardian of the targetCan be called only by the owner",
        params: { newGuardian: "The address to add as a guardian" },
      },
    },

    /**
     * function getGuardianChoice(
     *  address guardian
     * )
     *
     * 0xf6a22f02 = keccak256('getGuardianChoice(address)')
     */
    "0xf6a22f02": {
      sig: "getGuardianChoice(address)",
      inputs: [{ internalType: "address", name: "guardian", type: "address" }],
      name: "getGuardianChoice",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the address of a controller that a `guardian` selected for in order to recover the target",
        params: {
          guardian: "the address of a guardian to query his selection",
        },
        returns: { _0: "the address that `guardian` selected" },
      },
    },

    /**
     * function getGuardians()
     *
     * 0x0665f04b = keccak256('getGuardians()')
     */
    "0x0665f04b": {
      sig: "getGuardians()",
      inputs: [],
      name: "getGuardians",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the addresses of all guardians The guardians will select an address to be added as a controller key for the linked `target` if he reaches the guardian threshold and provide the correct string that produce the secretHash",
      },
    },

    /**
     * function getGuardiansThreshold()
     *
     * 0x187c5348 = keccak256('getGuardiansThreshold()')
     */
    "0x187c5348": {
      sig: "getGuardiansThreshold()",
      inputs: [],
      name: "getGuardiansThreshold",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the guardian threshold The guardian threshold represents the minimum number of selection by guardians required for an address to start a recovery process",
      },
    },

    /**
     * function getRecoveryCounter()
     *
     * 0xf79c8b77 = keccak256('getRecoveryCounter()')
     */
    "0xf79c8b77": {
      sig: "getRecoveryCounter()",
      inputs: [],
      name: "getRecoveryCounter",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the current recovery counter When a recovery process is successfully finished the recovery counter is incremented",
      },
    },

    /**
     * function getRecoverySecretHash()
     *
     * 0x8f9083bb = keccak256('getRecoverySecretHash()')
     */
    "0x8f9083bb": {
      sig: "getRecoverySecretHash()",
      inputs: [],
      name: "getRecoverySecretHash",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the recovery secret hash" },
    },

    /**
     * function initialize(
     *  address target_,
     *  address _owner
     * )
     *
     * 0x485cc955 = keccak256('initialize(address,address)')
     */
    "0x485cc955": {
      sig: "initialize(address,address)",
      inputs: [
        { internalType: "address", name: "target_", type: "address" },
        { internalType: "address", name: "_owner", type: "address" },
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          _owner: "The owner of the LSP11 contract",
          target_: "The address of the ER725 contract to recover",
        },
      },
      userdoc: { notice: "Sets the target and the owner addresses" },
    },

    /**
     * function isGuardian(
     *  address _address
     * )
     *
     * 0x0c68ba21 = keccak256('isGuardian(address)')
     */
    "0x0c68ba21": {
      sig: "isGuardian(address)",
      inputs: [{ internalType: "address", name: "_address", type: "address" }],
      name: "isGuardian",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns TRUE if the address provided is a guardian, FALSE otherwise",
        params: { _address: "The address to query" },
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function recoverOwnership(
     *  address recoverer,
     *  string plainSecret,
     *  bytes32 newSecretHash
     * )
     *
     * 0xae8481b2 = keccak256('recoverOwnership(address,string,bytes32)')
     */
    "0xae8481b2": {
      sig: "recoverOwnership(address,string,bytes32)",
      inputs: [
        { internalType: "address", name: "recoverer", type: "address" },
        { internalType: "string", name: "plainSecret", type: "string" },
        { internalType: "bytes32", name: "newSecretHash", type: "bytes32" },
      ],
      name: "recoverOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Recovers the ownership permissions of an address in the linked target and increment the recover counter Requirements - the address of the recoverer must have a selection equal or higher than the threshold defined in `getGuardiansThreshold(...)` - must have provided the right `plainSecret` that produces the secret Hash",
        params: {
          newHash:
            "The new secret Hash to be used in the next recovery process",
          plainSecret: "The secret word that produce the secret Hash",
          recoverer: "The address of the recoverer",
        },
      },
    },

    /**
     * function removeGuardian(
     *  address existingGuardian
     * )
     *
     * 0x71404156 = keccak256('removeGuardian(address)')
     */
    "0x71404156": {
      sig: "removeGuardian(address)",
      inputs: [
        { internalType: "address", name: "existingGuardian", type: "address" },
      ],
      name: "removeGuardian",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Removes a guardian of the targetCan be called only by the owner",
        params: {
          currentGuardian:
            "The address of the existing guardian to remove Requirements: - The guardians count should be higher or equal to the guardain threshold",
        },
      },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function selectNewController(
     *  address addressSelected
     * )
     *
     * 0xaa7806d6 = keccak256('selectNewController(address)')
     */
    "0xaa7806d6": {
      sig: "selectNewController(address)",
      inputs: [
        { internalType: "address", name: "addressSelected", type: "address" },
      ],
      name: "selectNewController",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "select an address to be a potentiel controller address if he reaches the guardian threshold and provide the correct secret string Requirements: - only guardians can select an address",
        params: { addressSelected: "The address selected by the guardian" },
      },
    },

    /**
     * function setGuardiansThreshold(
     *  uint256 newThreshold
     * )
     *
     * 0x6bfed20b = keccak256('setGuardiansThreshold(uint256)')
     */
    "0x6bfed20b": {
      sig: "setGuardiansThreshold(uint256)",
      inputs: [
        { internalType: "uint256", name: "newThreshold", type: "uint256" },
      ],
      name: "setGuardiansThreshold",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Sets the minimum number of selection by the guardians required so that an address can recover ownershipCan be called only by the owner",
        params: {
          guardiansThreshold:
            "The threshold to set Requirements: - `guardiansThreshold` cannot be more than the guardians count.",
        },
      },
    },

    /**
     * function setRecoverySecretHash(
     *  bytes32 newRecoverSecretHash
     * )
     *
     * 0xf799e38d = keccak256('setRecoverySecretHash(bytes32)')
     */
    "0xf799e38d": {
      sig: "setRecoverySecretHash(bytes32)",
      inputs: [
        {
          internalType: "bytes32",
          name: "newRecoverSecretHash",
          type: "bytes32",
        },
      ],
      name: "setRecoverySecretHash",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details: "Throws if hash provided is bytes32(0)",
        params: {
          newRecoverSecretHash:
            "The hash of the secret string Requirements: - `secretHash` cannot be bytes32(0)",
        },
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 _interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [
        { internalType: "bytes4", name: "_interfaceId", type: "bytes4" },
      ],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function target()
     *
     * 0xd4b83992 = keccak256('target()')
     */
    "0xd4b83992": {
      sig: "target()",
      inputs: [],
      name: "target",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "The address of an ERC725 contract where we want to recover and set permissions for a controller address",
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP1UniversalReceiverDelegateUP: {
    /**
     * function VERSION()
     *
     * 0xffa1ad74 = keccak256('VERSION()')
     */
    "0xffa1ad74": {
      sig: "VERSION()",
      inputs: [],
      name: "VERSION",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
      userdoc: { notice: "Contract version." },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function universalReceiverDelegate(
     *  address notifier,
     *  uint256 ,
     *  bytes32 typeId,
     *  bytes
     * )
     *
     * 0xa245bbda = keccak256('universalReceiverDelegate(address,uint256,bytes32,bytes)')
     */
    "0xa245bbda": {
      sig: "universalReceiverDelegate(address,uint256,bytes32,bytes)",
      inputs: [
        { internalType: "address", name: "notifier", type: "address" },
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "bytes32", name: "typeId", type: "bytes32" },
        { internalType: "bytes", name: "", type: "bytes" },
      ],
      name: "universalReceiverDelegate",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "- If some issues occured with generating the `dataKeys` or `dataValues` the `returnedMessage` will be an error message, otherwise it will be empty. - If an error occured when trying to use `setDataBatch(dataKeys,dataValues)`, it will return the raw error data back to the caller.",
        "custom:requirements":
          "- This contract should be allowed to use the {setDataBatch(...)} function in order to update the LSP5 and LSP10 Data Keys. - Cannot accept native tokens",
        "custom:warning":
          "When the data stored in the ERC725Y storage of the LSP0 contract is corrupted (_e.g: ([LSP-5-ReceivedAssets]'s Array length not 16 bytes long, the token received is already registered in `LSP5ReceivetAssets[]`, the token being sent is not sent as full balance, etc...), the function call will still pass and return (**not revert!**) and not modify any data key on the storage of the [LSP-0-ERC725Account].",
        details:
          "1. Writes the data keys of the received [LSP-7-DigitalAsset], [LSP-8-IdentifiableDigitalAsset] and [LSP-9-Vault] contract addresses into the account storage according to the [LSP-5-ReceivedAssets] and [LSP-10-ReceivedVaults] Standard. 2. The data keys representing an asset/vault are cleared when the asset/vault is no longer owned by the account.",
        params: { typeId: "Unique identifier for a specific notification." },
        returns: { _0: "The result of the reaction for `typeId`." },
      },
      userdoc: { notice: "Reacted on received notification with `typeId`." },
    },
  },
  LSP1UniversalReceiverDelegateVault: {
    /**
     * function VERSION()
     *
     * 0xffa1ad74 = keccak256('VERSION()')
     */
    "0xffa1ad74": {
      sig: "VERSION()",
      inputs: [],
      name: "VERSION",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
      userdoc: { notice: "Contract version." },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function universalReceiverDelegate(
     *  address notifier,
     *  uint256 ,
     *  bytes32 typeId,
     *  bytes
     * )
     *
     * 0xa245bbda = keccak256('universalReceiverDelegate(address,uint256,bytes32,bytes)')
     */
    "0xa245bbda": {
      sig: "universalReceiverDelegate(address,uint256,bytes32,bytes)",
      inputs: [
        { internalType: "address", name: "notifier", type: "address" },
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "bytes32", name: "typeId", type: "bytes32" },
        { internalType: "bytes", name: "", type: "bytes" },
      ],
      name: "universalReceiverDelegate",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "- If some issues occured with generating the `dataKeys` or `dataValues` the `returnedMessage` will be an error message, otherwise it will be empty. - If an error occured when trying to use `setDataBatch(dataKeys,dataValues)`, it will return the raw error data back to the caller.",
        "custom:requirements": "Cannot accept native tokens.",
        details:
          "Handles two cases: Writes the received [LSP-7-DigitalAsset] or [LSP-8-IdentifiableDigitalAsset] assets into the vault storage according to the [LSP-5-ReceivedAssets] standard.",
        params: { typeId: "Unique identifier for a specific notification." },
        returns: { _0: "The result of the reaction for `typeId`." },
      },
      userdoc: { notice: "Reacted on received notification with `typeId`." },
    },
  },
  LSP23LinkedContractsFactory: {
    /**
     * function computeAddresses(
     *  tuple primaryContractDeployment,
     *  tuple secondaryContractDeployment,
     *  address postDeploymentModule,
     *  bytes postDeploymentModuleCalldata
     * )
     *
     * 0xdd5940f3 = keccak256('computeAddresses((bytes32,uint256,bytes),(uint256,bytes,bool,bytes),address,bytes)')
     */
    "0xdd5940f3": {
      sig: "computeAddresses((bytes32,uint256,bytes),(uint256,bytes,bool,bytes),address,bytes)",
      inputs: [
        {
          components: [
            { internalType: "bytes32", name: "salt", type: "bytes32" },
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            { internalType: "bytes", name: "creationBytecode", type: "bytes" },
          ],
          internalType:
            "struct ILSP23LinkedContractsFactory.PrimaryContractDeployment",
          name: "primaryContractDeployment",
          type: "tuple",
        },
        {
          components: [
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            { internalType: "bytes", name: "creationBytecode", type: "bytes" },
            {
              internalType: "bool",
              name: "addPrimaryContractAddress",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "extraConstructorParams",
              type: "bytes",
            },
          ],
          internalType:
            "struct ILSP23LinkedContractsFactory.SecondaryContractDeployment",
          name: "secondaryContractDeployment",
          type: "tuple",
        },
        {
          internalType: "address",
          name: "postDeploymentModule",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "postDeploymentModuleCalldata",
          type: "bytes",
        },
      ],
      name: "computeAddresses",
      outputs: [
        {
          internalType: "address",
          name: "primaryContractAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "secondaryContractAddress",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Computes the addresses of a primary contract and a secondary linked contract",
        params: {
          postDeploymentModule:
            "The optional module to be executed after deployment",
          postDeploymentModuleCalldata:
            "The data to be passed to the post deployment module",
          primaryContractDeployment:
            "Contains the needed parameter to deploy the primary contract. (`salt`, `fundingAmount`, `creationBytecode`)",
          secondaryContractDeployment:
            "Contains the needed parameter to deploy the secondary contract. (`fundingAmount`, `creationBytecode`, `addPrimaryContractAddress`, `extraConstructorParams`)",
        },
        returns: {
          primaryContractAddress:
            "The address of the deployed primary contract.",
          secondaryContractAddress:
            "The address of the deployed secondary contract.",
        },
      },
    },

    /**
     * function computeERC1167Addresses(
     *  tuple primaryContractDeploymentInit,
     *  tuple secondaryContractDeploymentInit,
     *  address postDeploymentModule,
     *  bytes postDeploymentModuleCalldata
     * )
     *
     * 0x72b19d36 = keccak256('computeERC1167Addresses((bytes32,uint256,address,bytes),(uint256,address,bytes,bool,bytes),address,bytes)')
     */
    "0x72b19d36": {
      sig: "computeERC1167Addresses((bytes32,uint256,address,bytes),(uint256,address,bytes,bool,bytes),address,bytes)",
      inputs: [
        {
          components: [
            { internalType: "bytes32", name: "salt", type: "bytes32" },
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            {
              internalType: "address",
              name: "implementationContract",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "initializationCalldata",
              type: "bytes",
            },
          ],
          internalType:
            "struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit",
          name: "primaryContractDeploymentInit",
          type: "tuple",
        },
        {
          components: [
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            {
              internalType: "address",
              name: "implementationContract",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "initializationCalldata",
              type: "bytes",
            },
            {
              internalType: "bool",
              name: "addPrimaryContractAddress",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "extraInitializationParams",
              type: "bytes",
            },
          ],
          internalType:
            "struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit",
          name: "secondaryContractDeploymentInit",
          type: "tuple",
        },
        {
          internalType: "address",
          name: "postDeploymentModule",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "postDeploymentModuleCalldata",
          type: "bytes",
        },
      ],
      name: "computeERC1167Addresses",
      outputs: [
        {
          internalType: "address",
          name: "primaryContractAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "secondaryContractAddress",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Computes the addresses of a primary and a secondary linked contracts ERC1167 proxies to be created",
        params: {
          postDeploymentModule:
            "The optional module to be executed after deployment.",
          postDeploymentModuleCalldata:
            "The data to be passed to the post deployment module.",
          primaryContractDeploymentInit:
            "Contains the needed parameters to deploy a primary proxy contract. (`salt`, `fundingAmount`, `implementationContract`, `initializationCalldata`)",
          secondaryContractDeploymentInit:
            "Contains the needed parameters to deploy the secondary proxy contract. (`fundingAmount`, `implementationContract`, `initializationCalldata`, `addPrimaryContractAddress`, `extraInitializationParams`)",
        },
        returns: {
          primaryContractAddress:
            "The address of the deployed primary contract proxy",
          secondaryContractAddress:
            "The address of the deployed secondary contract proxy",
        },
      },
    },

    /**
     * function deployContracts(
     *  tuple primaryContractDeployment,
     *  tuple secondaryContractDeployment,
     *  address postDeploymentModule,
     *  bytes postDeploymentModuleCalldata
     * )
     *
     * 0x754b86b5 = keccak256('deployContracts((bytes32,uint256,bytes),(uint256,bytes,bool,bytes),address,bytes)')
     */
    "0x754b86b5": {
      sig: "deployContracts((bytes32,uint256,bytes),(uint256,bytes,bool,bytes),address,bytes)",
      inputs: [
        {
          components: [
            { internalType: "bytes32", name: "salt", type: "bytes32" },
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            { internalType: "bytes", name: "creationBytecode", type: "bytes" },
          ],
          internalType:
            "struct ILSP23LinkedContractsFactory.PrimaryContractDeployment",
          name: "primaryContractDeployment",
          type: "tuple",
        },
        {
          components: [
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            { internalType: "bytes", name: "creationBytecode", type: "bytes" },
            {
              internalType: "bool",
              name: "addPrimaryContractAddress",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "extraConstructorParams",
              type: "bytes",
            },
          ],
          internalType:
            "struct ILSP23LinkedContractsFactory.SecondaryContractDeployment",
          name: "secondaryContractDeployment",
          type: "tuple",
        },
        {
          internalType: "address",
          name: "postDeploymentModule",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "postDeploymentModuleCalldata",
          type: "bytes",
        },
      ],
      name: "deployContracts",
      outputs: [
        {
          internalType: "address",
          name: "primaryContractAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "secondaryContractAddress",
          type: "address",
        },
      ],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        details: "Deploys a primary and a secondary linked contract.",
        params: {
          postDeploymentModule:
            "The optional module to be executed after deployment",
          postDeploymentModuleCalldata:
            "The data to be passed to the post deployment module",
          primaryContractDeployment:
            "Contains the needed parameter to deploy a contract. (`salt`, `fundingAmount`, `creationBytecode`)",
          secondaryContractDeployment:
            "Contains the needed parameter to deploy the secondary contract. (`fundingAmount`, `creationBytecode`, `addPrimaryContractAddress`, `extraConstructorParams`)",
        },
        returns: {
          primaryContractAddress: "The address of the primary contract.",
          secondaryContractAddress: "The address of the secondary contract.",
        },
      },
      userdoc: {
        notice:
          "Contracts deployed. Contract Address: `primaryContractAddress`. Primary Contract Address: `primaryContractAddress`",
      },
    },

    /**
     * function deployERC1167Proxies(
     *  tuple primaryContractDeploymentInit,
     *  tuple secondaryContractDeploymentInit,
     *  address postDeploymentModule,
     *  bytes postDeploymentModuleCalldata
     * )
     *
     * 0x6a66a753 = keccak256('deployERC1167Proxies((bytes32,uint256,address,bytes),(uint256,address,bytes,bool,bytes),address,bytes)')
     */
    "0x6a66a753": {
      sig: "deployERC1167Proxies((bytes32,uint256,address,bytes),(uint256,address,bytes,bool,bytes),address,bytes)",
      inputs: [
        {
          components: [
            { internalType: "bytes32", name: "salt", type: "bytes32" },
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            {
              internalType: "address",
              name: "implementationContract",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "initializationCalldata",
              type: "bytes",
            },
          ],
          internalType:
            "struct ILSP23LinkedContractsFactory.PrimaryContractDeploymentInit",
          name: "primaryContractDeploymentInit",
          type: "tuple",
        },
        {
          components: [
            { internalType: "uint256", name: "fundingAmount", type: "uint256" },
            {
              internalType: "address",
              name: "implementationContract",
              type: "address",
            },
            {
              internalType: "bytes",
              name: "initializationCalldata",
              type: "bytes",
            },
            {
              internalType: "bool",
              name: "addPrimaryContractAddress",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "extraInitializationParams",
              type: "bytes",
            },
          ],
          internalType:
            "struct ILSP23LinkedContractsFactory.SecondaryContractDeploymentInit",
          name: "secondaryContractDeploymentInit",
          type: "tuple",
        },
        {
          internalType: "address",
          name: "postDeploymentModule",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "postDeploymentModuleCalldata",
          type: "bytes",
        },
      ],
      name: "deployERC1167Proxies",
      outputs: [
        {
          internalType: "address",
          name: "primaryContractAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "secondaryContractAddress",
          type: "address",
        },
      ],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        details:
          "Deploys ERC1167 proxies of a primary contract and a secondary linked contract",
        params: {
          postDeploymentModule:
            "The optional module to be executed after deployment.",
          postDeploymentModuleCalldata:
            "The data to be passed to the post deployment module.",
          primaryContractDeploymentInit:
            "Contains the needed parameters to deploy a proxy contract. (`salt`, `fundingAmount`, `implementationContract`, `initializationCalldata`)",
          secondaryContractDeploymentInit:
            "Contains the needed parameters to deploy the secondary proxy contract. (`fundingAmount`, `implementationContract`, `initializationCalldata`, `addPrimaryContractAddress`, `extraInitializationParams`)",
        },
        returns: {
          primaryContractAddress:
            "The address of the deployed primary contract proxy",
          secondaryContractAddress:
            "The address of the deployed secondary contract proxy",
        },
      },
      userdoc: {
        notice:
          "Contract proxies deployed. Primary Proxy Address: `primaryContractAddress`. Secondary Contract Proxy Address: `secondaryContractAddress`",
      },
    },
  },
  LSP9Vault: {
    /**
     * function RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()
     *
     * 0xead3fbdf = keccak256('RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()')
     */
    "0xead3fbdf": {
      sig: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()",
      inputs: [],
      name: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()
     *
     * 0x01bfba61 = keccak256('RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()')
     */
    "0x01bfba61": {
      sig: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()",
      inputs: [],
      name: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function VERSION()
     *
     * 0xffa1ad74 = keccak256('VERSION()')
     */
    "0xffa1ad74": {
      sig: "VERSION()",
      inputs: [],
      name: "VERSION",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
      userdoc: { notice: "Contract version." },
    },

    /**
     * function acceptOwnership()
     *
     * 0x79ba5097 = keccak256('acceptOwnership()')
     */
    "0x79ba5097": {
      sig: "acceptOwnership()",
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- Only the {pendingOwner} can call this function. - When notifying the previous owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_SenderNotification]. - When notifying the new owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_RecipientNotification].",
        details:
          "Transfer ownership of the contract from the current {owner()} to the {pendingOwner()}. Once this function is called: - The current {owner()} will lose access to the functions restricted to the {owner()} only. - The {pendingOwner()} will gain access to the functions restricted to the {owner()} only.",
      },
      userdoc: {
        notice:
          "`msg.sender` is accepting ownership of contract: `address(this)`.",
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function execute(
     *  uint256 operationType,
     *  address target,
     *  uint256 value,
     *  bytes data
     * )
     *
     * 0x44c028fe = keccak256('execute(uint256,address,uint256,bytes)')
     */
    "0x44c028fe": {
      sig: "execute(uint256,address,uint256,bytes)",
      inputs: [
        { internalType: "uint256", name: "operationType", type: "uint256" },
        { internalType: "address", name: "target", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "execute",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {Executed} event for each call that uses under `operationType`: `CALL` (0) and `STATICCALL` (3). - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2). - {UniversalReceiver} event when receiving native tokens.",
        "custom:info":
          "The `operationType` 4 `DELEGATECALL` is disabled by default in the LSP9 Vault.",
        "custom:requirements":
          "- Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully. - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`. - If the operation type is `STATICCALL` (3), `value` transfer is disallowed and must be 0.",
        details:
          "Generic executor function to: - send native tokens to any address. - interact with any contract by passing an abi-encoded function call in the `data` parameter. - deploy a contract by providing its creation bytecode in the `data` parameter.",
        params: {
          data: "The call data, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.",
          operationType:
            "The operation type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4",
          target:
            "The address of the EOA or smart contract.  (unused if a contract is created via operation type 1 or 2)",
          value: "The amount of native tokens to transfer (in Wei)",
        },
      },
      userdoc: {
        notice:
          "Calling address `target` using `operationType`, transferring `value` wei and data: `data`.",
      },
    },

    /**
     * function executeBatch(
     *  uint256[] operationsType,
     *  address[] targets,
     *  uint256[] values,
     *  bytes[] datas
     * )
     *
     * 0x31858452 = keccak256('executeBatch(uint256[],address[],uint256[],bytes[])')
     */
    "0x31858452": {
      sig: "executeBatch(uint256[],address[],uint256[],bytes[])",
      inputs: [
        {
          internalType: "uint256[]",
          name: "operationsType",
          type: "uint256[]",
        },
        { internalType: "address[]", name: "targets", type: "address[]" },
        { internalType: "uint256[]", name: "values", type: "uint256[]" },
        { internalType: "bytes[]", name: "datas", type: "bytes[]" },
      ],
      name: "executeBatch",
      outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {Executed} event for each call that uses under `operationType`: `CALL` (0) and `STATICCALL` (3). (each iteration) - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2). (each iteration) - {UniversalReceiver} event when receiving native tokens.",
        "custom:info":
          "The `operationType` 4 `DELEGATECALL` is disabled by default in the LSP9 Vault.",
        "custom:requirements":
          "- The length of the parameters provided must be equal. - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully. - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`. - If the operation type is `STATICCALL` (3), `value` transfer is disallowed and must be 0.",
        details:
          "Batch executor function that behaves the same as {execute} but allowing multiple operations in the same transaction.",
        params: {
          datas:
            "The list of calldata, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.",
          operationsType:
            "The list of operations type used: `CALL = 0`; `CREATE = 1`; `CREATE2 = 2`; `STATICCALL = 3`; `DELEGATECALL = 4`",
          targets:
            "The list of addresses to call. `targets` will be unused if a contract is created (operation types 1 and 2).",
          values: "The list of native token amounts to transfer (in Wei).",
        },
      },
      userdoc: {
        notice:
          "Calling multiple addresses `targets` using `operationsType`, transferring `values` wei and data: `datas`.",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function pendingOwner()
     *
     * 0xe30c3978 = keccak256('pendingOwner()')
     */
    "0xe30c3978": {
      sig: "pendingOwner()",
      inputs: [],
      name: "pendingOwner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:info":
          "If no ownership transfer is in progress, the pendingOwner will be `address(0).`.",
        details:
          "The address that ownership of the contract is transferred to. This address may use {acceptOwnership()} to gain ownership of the contract.",
      },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:danger":
          "Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Renounce ownership of the contract in a 2-step process. 1. The first call will initiate the process of renouncing ownership. 2. The second call is used as a confirmation and will leave the contract without an owner.",
      },
      userdoc: {
        notice:
          "`msg.sender` is renouncing ownership of contract `address(this)`.",
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "- {DataChanged} event.",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {DataChanged} event. (on each iteration of setting data)",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Achieves the goal of [ERC-165] to detect supported interfaces and [LSP-17-ContractExtension] by checking if the interfaceId being queried is supported on another linked extension. If the contract doesn't support the `interfaceId`, it forwards the call to the `supportsInterface` extension according to [LSP-17-ContractExtension], and checks if the extension implements the interface defined by `interfaceId`.",
        params: {
          interfaceId: "The interface ID to check if the contract supports it.",
        },
        returns: {
          _0: "`true` if this contract implements the interface defined by `interfaceId`, `false` otherwise.",
        },
      },
      userdoc: {
        notice:
          "Checking if this contract supports the interface defined by the `bytes4` interface ID `interfaceId`.",
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - When notifying the new owner via LSP1, the `typeId` used must be the `keccak256(...)` hash of [LSP0OwnershipTransferStarted]. - Pending owner cannot accept ownership in the same tx via the LSP1 hook.",
        details:
          "Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner. If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that ownership has been transferred to them by calling the {universalReceiver()} function on the `newOwner` contract.",
        params: { newOwner: "The address of the new owner." },
      },
      userdoc: { notice: "Transfer ownership initiated by `newOwner`." },
    },

    /**
     * function universalReceiver(
     *  bytes32 typeId,
     *  bytes receivedData
     * )
     *
     * 0x6bb56a14 = keccak256('universalReceiver(bytes32,bytes)')
     */
    "0x6bb56a14": {
      sig: "universalReceiver(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "typeId", type: "bytes32" },
        { internalType: "bytes", name: "receivedData", type: "bytes" },
      ],
      name: "universalReceiver",
      outputs: [
        { internalType: "bytes", name: "returnedValues", type: "bytes" },
      ],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} event with the function parameters, call options, and the response of the UniversalReceiverDelegates (URD) contract that was called.",
        details:
          "Achieves the goal of [LSP-1-UniversalReceiver] by allowing the account to be notified about incoming/outgoing transactions and enabling reactions to these actions. The reaction is achieved by having two external contracts ([LSP1UniversalReceiverDelegate]) that react on the whole transaction and on the specific typeId, respectively. The function performs the following steps: 1. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY].      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function. 2. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX] + `bytes32(typeId)`.   (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function.",
        params: {
          receivedData: "The data received.",
          typeId: "The type of call received.",
        },
        returns: {
          returnedValues:
            "The ABI encoded return value of the LSP1UniversalReceiverDelegate call and the LSP1TypeIdDelegate call.",
        },
      },
      userdoc: {
        notice:
          "Notifying the contract by calling its `universalReceiver` function with the following informations: typeId: `typeId`; data: `data`.",
      },
    },
  },
  LSP9VaultInit: {
    /**
     * function RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()
     *
     * 0xead3fbdf = keccak256('RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()')
     */
    "0xead3fbdf": {
      sig: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()",
      inputs: [],
      name: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()
     *
     * 0x01bfba61 = keccak256('RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()')
     */
    "0x01bfba61": {
      sig: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()",
      inputs: [],
      name: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function VERSION()
     *
     * 0xffa1ad74 = keccak256('VERSION()')
     */
    "0xffa1ad74": {
      sig: "VERSION()",
      inputs: [],
      name: "VERSION",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
      userdoc: { notice: "Contract version." },
    },

    /**
     * function acceptOwnership()
     *
     * 0x79ba5097 = keccak256('acceptOwnership()')
     */
    "0x79ba5097": {
      sig: "acceptOwnership()",
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- Only the {pendingOwner} can call this function. - When notifying the previous owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_SenderNotification]. - When notifying the new owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_RecipientNotification].",
        details:
          "Transfer ownership of the contract from the current {owner()} to the {pendingOwner()}. Once this function is called: - The current {owner()} will lose access to the functions restricted to the {owner()} only. - The {pendingOwner()} will gain access to the functions restricted to the {owner()} only.",
      },
      userdoc: {
        notice:
          "`msg.sender` is accepting ownership of contract: `address(this)`.",
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function execute(
     *  uint256 operationType,
     *  address target,
     *  uint256 value,
     *  bytes data
     * )
     *
     * 0x44c028fe = keccak256('execute(uint256,address,uint256,bytes)')
     */
    "0x44c028fe": {
      sig: "execute(uint256,address,uint256,bytes)",
      inputs: [
        { internalType: "uint256", name: "operationType", type: "uint256" },
        { internalType: "address", name: "target", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "execute",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {Executed} event for each call that uses under `operationType`: `CALL` (0) and `STATICCALL` (3). - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2). - {UniversalReceiver} event when receiving native tokens.",
        "custom:info":
          "The `operationType` 4 `DELEGATECALL` is disabled by default in the LSP9 Vault.",
        "custom:requirements":
          "- Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully. - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`. - If the operation type is `STATICCALL` (3), `value` transfer is disallowed and must be 0.",
        details:
          "Generic executor function to: - send native tokens to any address. - interact with any contract by passing an abi-encoded function call in the `data` parameter. - deploy a contract by providing its creation bytecode in the `data` parameter.",
        params: {
          data: "The call data, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.",
          operationType:
            "The operation type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4",
          target:
            "The address of the EOA or smart contract.  (unused if a contract is created via operation type 1 or 2)",
          value: "The amount of native tokens to transfer (in Wei)",
        },
      },
      userdoc: {
        notice:
          "Calling address `target` using `operationType`, transferring `value` wei and data: `data`.",
      },
    },

    /**
     * function executeBatch(
     *  uint256[] operationsType,
     *  address[] targets,
     *  uint256[] values,
     *  bytes[] datas
     * )
     *
     * 0x31858452 = keccak256('executeBatch(uint256[],address[],uint256[],bytes[])')
     */
    "0x31858452": {
      sig: "executeBatch(uint256[],address[],uint256[],bytes[])",
      inputs: [
        {
          internalType: "uint256[]",
          name: "operationsType",
          type: "uint256[]",
        },
        { internalType: "address[]", name: "targets", type: "address[]" },
        { internalType: "uint256[]", name: "values", type: "uint256[]" },
        { internalType: "bytes[]", name: "datas", type: "bytes[]" },
      ],
      name: "executeBatch",
      outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {Executed} event for each call that uses under `operationType`: `CALL` (0) and `STATICCALL` (3). (each iteration) - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2). (each iteration) - {UniversalReceiver} event when receiving native tokens.",
        "custom:info":
          "The `operationType` 4 `DELEGATECALL` is disabled by default in the LSP9 Vault.",
        "custom:requirements":
          "- The length of the parameters provided must be equal. - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully. - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`. - If the operation type is `STATICCALL` (3), `value` transfer is disallowed and must be 0.",
        details:
          "Batch executor function that behaves the same as {execute} but allowing multiple operations in the same transaction.",
        params: {
          datas:
            "The list of calldata, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.",
          operationsType:
            "The list of operations type used: `CALL = 0`; `CREATE = 1`; `CREATE2 = 2`; `STATICCALL = 3`; `DELEGATECALL = 4`",
          targets:
            "The list of addresses to call. `targets` will be unused if a contract is created (operation types 1 and 2).",
          values: "The list of native token amounts to transfer (in Wei).",
        },
      },
      userdoc: {
        notice:
          "Calling multiple addresses `targets` using `operationsType`, transferring `values` wei and data: `datas`.",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function initialize(
     *  address newOwner
     * )
     *
     * 0xc4d66de8 = keccak256('initialize(address)')
     */
    "0xc4d66de8": {
      sig: "initialize(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "initialize",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} event when funding the contract on deployment. - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}. - {DataChanged} event when updating the {_LSP9_SUPPORTED_STANDARDS_KEY}. - {UniversalReceiver} event when notifying the `initialOwner`.",
        details:
          "Sets `initialOwner` as the contract owner and the `SupportedStandards:LSP9Vault` Data Key. The `initialize(address)` also allows funding the contract on deployment.",
        params: { newOwner: "The new owner of the contract." },
      },
      userdoc: {
        notice:
          "Initializing a LSP9Vault contract with owner set to address `initialOwner`.",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function pendingOwner()
     *
     * 0xe30c3978 = keccak256('pendingOwner()')
     */
    "0xe30c3978": {
      sig: "pendingOwner()",
      inputs: [],
      name: "pendingOwner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:info":
          "If no ownership transfer is in progress, the pendingOwner will be `address(0).`.",
        details:
          "The address that ownership of the contract is transferred to. This address may use {acceptOwnership()} to gain ownership of the contract.",
      },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:danger":
          "Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Renounce ownership of the contract in a 2-step process. 1. The first call will initiate the process of renouncing ownership. 2. The second call is used as a confirmation and will leave the contract without an owner.",
      },
      userdoc: {
        notice:
          "`msg.sender` is renouncing ownership of contract `address(this)`.",
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "- {DataChanged} event.",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {DataChanged} event. (on each iteration of setting data)",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Achieves the goal of [ERC-165] to detect supported interfaces and [LSP-17-ContractExtension] by checking if the interfaceId being queried is supported on another linked extension. If the contract doesn't support the `interfaceId`, it forwards the call to the `supportsInterface` extension according to [LSP-17-ContractExtension], and checks if the extension implements the interface defined by `interfaceId`.",
        params: {
          interfaceId: "The interface ID to check if the contract supports it.",
        },
        returns: {
          _0: "`true` if this contract implements the interface defined by `interfaceId`, `false` otherwise.",
        },
      },
      userdoc: {
        notice:
          "Checking if this contract supports the interface defined by the `bytes4` interface ID `interfaceId`.",
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - When notifying the new owner via LSP1, the `typeId` used must be the `keccak256(...)` hash of [LSP0OwnershipTransferStarted]. - Pending owner cannot accept ownership in the same tx via the LSP1 hook.",
        details:
          "Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner. If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that ownership has been transferred to them by calling the {universalReceiver()} function on the `newOwner` contract.",
        params: { newOwner: "The address of the new owner." },
      },
      userdoc: { notice: "Transfer ownership initiated by `newOwner`." },
    },

    /**
     * function universalReceiver(
     *  bytes32 typeId,
     *  bytes receivedData
     * )
     *
     * 0x6bb56a14 = keccak256('universalReceiver(bytes32,bytes)')
     */
    "0x6bb56a14": {
      sig: "universalReceiver(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "typeId", type: "bytes32" },
        { internalType: "bytes", name: "receivedData", type: "bytes" },
      ],
      name: "universalReceiver",
      outputs: [
        { internalType: "bytes", name: "returnedValues", type: "bytes" },
      ],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} event with the function parameters, call options, and the response of the UniversalReceiverDelegates (URD) contract that was called.",
        details:
          "Achieves the goal of [LSP-1-UniversalReceiver] by allowing the account to be notified about incoming/outgoing transactions and enabling reactions to these actions. The reaction is achieved by having two external contracts ([LSP1UniversalReceiverDelegate]) that react on the whole transaction and on the specific typeId, respectively. The function performs the following steps: 1. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY].      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function. 2. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX] + `bytes32(typeId)`.   (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function.",
        params: {
          receivedData: "The data received.",
          typeId: "The type of call received.",
        },
        returns: {
          returnedValues:
            "The ABI encoded return value of the LSP1UniversalReceiverDelegate call and the LSP1TypeIdDelegate call.",
        },
      },
      userdoc: {
        notice:
          "Notifying the contract by calling its `universalReceiver` function with the following informations: typeId: `typeId`; data: `data`.",
      },
    },
  },
  UniversalReceiverAddressStore: {
    /**
     * function account()
     *
     * 0x5dab2420 = keccak256('account()')
     */
    "0x5dab2420": {
      sig: "account()",
      inputs: [],
      name: "account",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function addAddress(
     *  address _address
     * )
     *
     * 0x38eada1c = keccak256('addAddress(address)')
     */
    "0x38eada1c": {
      sig: "addAddress(address)",
      inputs: [{ internalType: "address", name: "_address", type: "address" }],
      name: "addAddress",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },

    /**
     * function containsAddress(
     *  address _address
     * )
     *
     * 0x322433e3 = keccak256('containsAddress(address)')
     */
    "0x322433e3": {
      sig: "containsAddress(address)",
      inputs: [{ internalType: "address", name: "_address", type: "address" }],
      name: "containsAddress",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function getAddress(
     *  uint256 _index
     * )
     *
     * 0xb93f9b0a = keccak256('getAddress(uint256)')
     */
    "0xb93f9b0a": {
      sig: "getAddress(uint256)",
      inputs: [{ internalType: "uint256", name: "_index", type: "uint256" }],
      name: "getAddress",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function getAllRawValues()
     *
     * 0xc0a4ebf4 = keccak256('getAllRawValues()')
     */
    "0xc0a4ebf4": {
      sig: "getAllRawValues()",
      inputs: [],
      name: "getAllRawValues",
      outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function getIndex(
     *  address _address
     * )
     *
     * 0xb31610db = keccak256('getIndex(address)')
     */
    "0xb31610db": {
      sig: "getIndex(address)",
      inputs: [{ internalType: "address", name: "_address", type: "address" }],
      name: "getIndex",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function length()
     *
     * 0x1f7b6d32 = keccak256('length()')
     */
    "0x1f7b6d32": {
      sig: "length()",
      inputs: [],
      name: "length",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function removeAddress(
     *  address _address
     * )
     *
     * 0x4ba79dfe = keccak256('removeAddress(address)')
     */
    "0x4ba79dfe": {
      sig: "removeAddress(address)",
      inputs: [{ internalType: "address", name: "_address", type: "address" }],
      name: "removeAddress",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function universalReceiverDelegate(
     *  address sender,
     *  uint256 ,
     *  bytes32 typeId,
     *  bytes
     * )
     *
     * 0xa245bbda = keccak256('universalReceiverDelegate(address,uint256,bytes32,bytes)')
     */
    "0xa245bbda": {
      sig: "universalReceiverDelegate(address,uint256,bytes32,bytes)",
      inputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "bytes32", name: "typeId", type: "bytes32" },
        { internalType: "bytes", name: "", type: "bytes" },
      ],
      name: "universalReceiverDelegate",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  },
  UniversalProfile: {
    /**
     * function RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()
     *
     * 0xead3fbdf = keccak256('RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()')
     */
    "0xead3fbdf": {
      sig: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()",
      inputs: [],
      name: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()
     *
     * 0x01bfba61 = keccak256('RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()')
     */
    "0x01bfba61": {
      sig: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()",
      inputs: [],
      name: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function VERSION()
     *
     * 0xffa1ad74 = keccak256('VERSION()')
     */
    "0xffa1ad74": {
      sig: "VERSION()",
      inputs: [],
      name: "VERSION",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
      userdoc: { notice: "Contract version." },
    },

    /**
     * function acceptOwnership()
     *
     * 0x79ba5097 = keccak256('acceptOwnership()')
     */
    "0x79ba5097": {
      sig: "acceptOwnership()",
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- Only the {pendingOwner} can call this function. - When notifying the previous owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_SenderNotification]. - When notifying the new owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_RecipientNotification].",
        details:
          "Transfer ownership of the contract from the current {owner()} to the {pendingOwner()}. Once this function is called: - The current {owner()} will lose access to the functions restricted to the {owner()} only. - The {pendingOwner()} will gain access to the functions restricted to the {owner()} only.",
      },
      userdoc: {
        notice:
          "`msg.sender` is accepting ownership of contract: `address(this)`.",
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function execute(
     *  uint256 operationType,
     *  address target,
     *  uint256 value,
     *  bytes data
     * )
     *
     * 0x44c028fe = keccak256('execute(uint256,address,uint256,bytes)')
     */
    "0x44c028fe": {
      sig: "execute(uint256,address,uint256,bytes)",
      inputs: [
        { internalType: "uint256", name: "operationType", type: "uint256" },
        { internalType: "address", name: "target", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "execute",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4). - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2). - {UniversalReceiver} event when receiving native tokens.",
        "custom:requirements":
          "- Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully. - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`. - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.",
        details:
          "Generic executor function to: - send native tokens to any address. - interact with any contract by passing an abi-encoded function call in the `data` parameter. - deploy a contract by providing its creation bytecode in the `data` parameter.",
        params: {
          data: "The call data, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.",
          operationType:
            "The operation type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4",
          target:
            "The address of the EOA or smart contract.  (unused if a contract is created via operation type 1 or 2)",
          value: "The amount of native tokens to transfer (in Wei)",
        },
      },
      userdoc: {
        notice:
          "Calling address `target` using `operationType`, transferring `value` wei and data: `data`.",
      },
    },

    /**
     * function executeBatch(
     *  uint256[] operationsType,
     *  address[] targets,
     *  uint256[] values,
     *  bytes[] datas
     * )
     *
     * 0x31858452 = keccak256('executeBatch(uint256[],address[],uint256[],bytes[])')
     */
    "0x31858452": {
      sig: "executeBatch(uint256[],address[],uint256[],bytes[])",
      inputs: [
        {
          internalType: "uint256[]",
          name: "operationsType",
          type: "uint256[]",
        },
        { internalType: "address[]", name: "targets", type: "address[]" },
        { internalType: "uint256[]", name: "values", type: "uint256[]" },
        { internalType: "bytes[]", name: "datas", type: "bytes[]" },
      ],
      name: "executeBatch",
      outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4). (each iteration) - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2) (each iteration) - {UniversalReceiver} event when receiving native tokens.",
        "custom:requirements":
          "- The length of the parameters provided must be equal. - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully. - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`. - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.",
        "custom:warning":
          "- The `msg.value` should not be trusted for any method called within the batch with `operationType`: `DELEGATECALL` (4).",
        details:
          "Batch executor function that behaves the same as {execute} but allowing multiple operations in the same transaction.",
        params: {
          datas:
            "The list of calldata, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.",
          operationsType:
            "The list of operations type used: `CALL = 0`; `CREATE = 1`; `CREATE2 = 2`; `STATICCALL = 3`; `DELEGATECALL = 4`",
          targets:
            "The list of addresses to call. `targets` will be unused if a contract is created (operation types 1 and 2).",
          values: "The list of native token amounts to transfer (in Wei).",
        },
      },
      userdoc: {
        notice:
          "Calling multiple addresses `targets` using `operationsType`, transferring `values` wei and data: `datas`.",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function isValidSignature(
     *  bytes32 dataHash,
     *  bytes signature
     * )
     *
     * 0x1626ba7e = keccak256('isValidSignature(bytes32,bytes)')
     */
    "0x1626ba7e": {
      sig: "isValidSignature(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataHash", type: "bytes32" },
        { internalType: "bytes", name: "signature", type: "bytes" },
      ],
      name: "isValidSignature",
      outputs: [
        { internalType: "bytes4", name: "returnedStatus", type: "bytes4" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:warning":
          "This function does not enforce by default the inclusion of the address of this contract in the signature digest. It is recommended that protocols or applications using this contract include the targeted address (= this contract) in the data to sign. To ensure that a signature is valid for a specific LSP0ERC725Account and prevent signatures from the same EOA to be replayed across different LSP0ERC725Accounts.",
        details:
          "Handles two cases: 1. If the owner is an EOA, recovers an address from the hash and the signature provided:      - Returns the `_ERC1271_SUCCESSVALUE` if the address recovered is the same as the owner, indicating that it was a valid signature.      - If the address is different, it returns the `_ERC1271_FAILVALUE` indicating that the signature is not valid. 2. If the owner is a smart contract, it forwards the call of {isValidSignature()} to the owner contract:      - If the contract fails or returns the `_ERC1271_FAILVALUE`, the {isValidSignature()} on the account returns the `_ERC1271_FAILVALUE`, indicating that the signature is not valid.      - If the {isValidSignature()} on the owner returned the `_ERC1271_SUCCESSVALUE`, the {isValidSignature()} on the account returns the `_ERC1271_SUCCESSVALUE`, indicating that it's a valid signature.",
        params: {
          dataHash: "The hash of the data to be validated.",
          signature:
            "A signature that can validate the previous parameter (Hash).",
        },
        returns: {
          returnedStatus:
            "A `bytes4` value that indicates if the signature is valid or not.",
        },
      },
      userdoc: {
        notice:
          "Achieves the goal of [EIP-1271] by validating signatures of smart contracts according to their own logic.",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function pendingOwner()
     *
     * 0xe30c3978 = keccak256('pendingOwner()')
     */
    "0xe30c3978": {
      sig: "pendingOwner()",
      inputs: [],
      name: "pendingOwner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:info":
          "If no ownership transfer is in progress, the pendingOwner will be `address(0).`.",
        details:
          "The address that ownership of the contract is transferred to. This address may use {acceptOwnership()} to gain ownership of the contract.",
      },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:danger":
          "Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner or an address allowed by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Renounce ownership of the contract in a 2-step process. 1. The first call will initiate the process of renouncing ownership. 2. The second call is used as a confirmation and will leave the contract without an owner.",
      },
      userdoc: {
        notice:
          "`msg.sender` is renouncing ownership of contract `address(this)`.",
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} event when receiving native tokens. - {DataChanged} event.",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} event when receiving native tokens. - {DataChanged} event. (on each iteration of setting data)",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Achieves the goal of [ERC-165] to detect supported interfaces and [LSP-17-ContractExtension] by checking if the interfaceId being queried is supported on another linked extension. If the contract doesn't support the `interfaceId`, it forwards the call to the `supportsInterface` extension according to [LSP-17-ContractExtension], and checks if the extension implements the interface defined by `interfaceId`.",
        params: {
          interfaceId: "The interface ID to check if the contract supports it.",
        },
        returns: {
          _0: "`true` if this contract implements the interface defined by `interfaceId`, `false` otherwise.",
        },
      },
      userdoc: {
        notice:
          "Checking if this contract supports the interface defined by the `bytes4` interface ID `interfaceId`.",
      },
    },

    /**
     * function transferOwnership(
     *  address pendingNewOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [
        { internalType: "address", name: "pendingNewOwner", type: "address" },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - When notifying the new owner via LSP1, the `typeId` used must be the `keccak256(...)` hash of [LSP0OwnershipTransferStarted]. - Pending owner cannot accept ownership in the same tx via the LSP1 hook.",
        details:
          "Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner. If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that ownership has been transferred to them by calling the {universalReceiver()} function on the `newOwner` contract.",
        params: { newOwner: "The address of the new owner." },
      },
      userdoc: { notice: "Transfer ownership initiated by `newOwner`." },
    },

    /**
     * function universalReceiver(
     *  bytes32 typeId,
     *  bytes receivedData
     * )
     *
     * 0x6bb56a14 = keccak256('universalReceiver(bytes32,bytes)')
     */
    "0x6bb56a14": {
      sig: "universalReceiver(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "typeId", type: "bytes32" },
        { internalType: "bytes", name: "receivedData", type: "bytes" },
      ],
      name: "universalReceiver",
      outputs: [
        { internalType: "bytes", name: "returnedValues", type: "bytes" },
      ],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} when receiving native tokens. - {UniversalReceiver} event with the function parameters, call options, and the response of the UniversalReceiverDelegates (URD) contract that was called.",
        details:
          "Achieves the goal of [LSP-1-UniversalReceiver] by allowing the account to be notified about incoming/outgoing transactions and enabling reactions to these actions. The reaction is achieved by having two external contracts ([LSP1UniversalReceiverDelegate]) that react on the whole transaction and on the specific typeId, respectively. The function performs the following steps: 1. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY].      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function. 2. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX] + `bytes32(typeId)`.   (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function. This function delegates internally the handling of native tokens to the {universalReceiver} function itself passing `_TYPEID_LSP0_VALUE_RECEIVED` as typeId and the calldata as received data.",
        params: {
          receivedData: "The data received.",
          typeId: "The type of call received.",
        },
        returns: {
          returnedValues:
            "The ABI encoded return value of the LSP1UniversalReceiverDelegate call and the LSP1TypeIdDelegate call.",
        },
      },
      userdoc: {
        notice:
          "Notifying the contract by calling its `universalReceiver` function with the following informations: typeId: `typeId`; data: `data`.",
      },
    },
  },
  UniversalProfileInit: {
    /**
     * function RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()
     *
     * 0xead3fbdf = keccak256('RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()')
     */
    "0xead3fbdf": {
      sig: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()",
      inputs: [],
      name: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()
     *
     * 0x01bfba61 = keccak256('RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()')
     */
    "0x01bfba61": {
      sig: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()",
      inputs: [],
      name: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function VERSION()
     *
     * 0xffa1ad74 = keccak256('VERSION()')
     */
    "0xffa1ad74": {
      sig: "VERSION()",
      inputs: [],
      name: "VERSION",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
      userdoc: { notice: "Contract version." },
    },

    /**
     * function acceptOwnership()
     *
     * 0x79ba5097 = keccak256('acceptOwnership()')
     */
    "0x79ba5097": {
      sig: "acceptOwnership()",
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- Only the {pendingOwner} can call this function. - When notifying the previous owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_SenderNotification]. - When notifying the new owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_RecipientNotification].",
        details:
          "Transfer ownership of the contract from the current {owner()} to the {pendingOwner()}. Once this function is called: - The current {owner()} will lose access to the functions restricted to the {owner()} only. - The {pendingOwner()} will gain access to the functions restricted to the {owner()} only.",
      },
      userdoc: {
        notice:
          "`msg.sender` is accepting ownership of contract: `address(this)`.",
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function execute(
     *  uint256 operationType,
     *  address target,
     *  uint256 value,
     *  bytes data
     * )
     *
     * 0x44c028fe = keccak256('execute(uint256,address,uint256,bytes)')
     */
    "0x44c028fe": {
      sig: "execute(uint256,address,uint256,bytes)",
      inputs: [
        { internalType: "uint256", name: "operationType", type: "uint256" },
        { internalType: "address", name: "target", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "execute",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4). - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2). - {UniversalReceiver} event when receiving native tokens.",
        "custom:requirements":
          "- Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully. - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`. - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.",
        details:
          "Generic executor function to: - send native tokens to any address. - interact with any contract by passing an abi-encoded function call in the `data` parameter. - deploy a contract by providing its creation bytecode in the `data` parameter.",
        params: {
          data: "The call data, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.",
          operationType:
            "The operation type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4",
          target:
            "The address of the EOA or smart contract.  (unused if a contract is created via operation type 1 or 2)",
          value: "The amount of native tokens to transfer (in Wei)",
        },
      },
      userdoc: {
        notice:
          "Calling address `target` using `operationType`, transferring `value` wei and data: `data`.",
      },
    },

    /**
     * function executeBatch(
     *  uint256[] operationsType,
     *  address[] targets,
     *  uint256[] values,
     *  bytes[] datas
     * )
     *
     * 0x31858452 = keccak256('executeBatch(uint256[],address[],uint256[],bytes[])')
     */
    "0x31858452": {
      sig: "executeBatch(uint256[],address[],uint256[],bytes[])",
      inputs: [
        {
          internalType: "uint256[]",
          name: "operationsType",
          type: "uint256[]",
        },
        { internalType: "address[]", name: "targets", type: "address[]" },
        { internalType: "uint256[]", name: "values", type: "uint256[]" },
        { internalType: "bytes[]", name: "datas", type: "bytes[]" },
      ],
      name: "executeBatch",
      outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4). (each iteration) - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2) (each iteration) - {UniversalReceiver} event when receiving native tokens.",
        "custom:requirements":
          "- The length of the parameters provided must be equal. - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully. - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`. - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.",
        "custom:warning":
          "- The `msg.value` should not be trusted for any method called within the batch with `operationType`: `DELEGATECALL` (4).",
        details:
          "Batch executor function that behaves the same as {execute} but allowing multiple operations in the same transaction.",
        params: {
          datas:
            "The list of calldata, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.",
          operationsType:
            "The list of operations type used: `CALL = 0`; `CREATE = 1`; `CREATE2 = 2`; `STATICCALL = 3`; `DELEGATECALL = 4`",
          targets:
            "The list of addresses to call. `targets` will be unused if a contract is created (operation types 1 and 2).",
          values: "The list of native token amounts to transfer (in Wei).",
        },
      },
      userdoc: {
        notice:
          "Calling multiple addresses `targets` using `operationsType`, transferring `values` wei and data: `datas`.",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function initialize(
     *  address initialOwner
     * )
     *
     * 0xc4d66de8 = keccak256('initialize(address)')
     */
    "0xc4d66de8": {
      sig: "initialize(address)",
      inputs: [
        { internalType: "address", name: "initialOwner", type: "address" },
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} event when funding the contract on deployment. - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}. - {DataChanged} event when setting the {_LSP3_SUPPORTED_STANDARDS_KEY}.",
        details:
          "Set `initialOwner` as the contract owner and the `SupportedStandards:LSP3Profile` data key in the ERC725Y data key/value store. - The `initialize(address)` function is payable and allows funding the contract on initialization. - The `initialOwner` will then be allowed to call protected functions marked with the `onlyOwner` modifier.",
        params: { initialOwner: "the owner of the contract" },
      },
      userdoc: {
        notice:
          "Initializing a UniversalProfile contract with owner set to address `initialOwner`.",
      },
    },

    /**
     * function isValidSignature(
     *  bytes32 dataHash,
     *  bytes signature
     * )
     *
     * 0x1626ba7e = keccak256('isValidSignature(bytes32,bytes)')
     */
    "0x1626ba7e": {
      sig: "isValidSignature(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataHash", type: "bytes32" },
        { internalType: "bytes", name: "signature", type: "bytes" },
      ],
      name: "isValidSignature",
      outputs: [
        { internalType: "bytes4", name: "returnedStatus", type: "bytes4" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:warning":
          "This function does not enforce by default the inclusion of the address of this contract in the signature digest. It is recommended that protocols or applications using this contract include the targeted address (= this contract) in the data to sign. To ensure that a signature is valid for a specific LSP0ERC725Account and prevent signatures from the same EOA to be replayed across different LSP0ERC725Accounts.",
        details:
          "Handles two cases: 1. If the owner is an EOA, recovers an address from the hash and the signature provided:      - Returns the `_ERC1271_SUCCESSVALUE` if the address recovered is the same as the owner, indicating that it was a valid signature.      - If the address is different, it returns the `_ERC1271_FAILVALUE` indicating that the signature is not valid. 2. If the owner is a smart contract, it forwards the call of {isValidSignature()} to the owner contract:      - If the contract fails or returns the `_ERC1271_FAILVALUE`, the {isValidSignature()} on the account returns the `_ERC1271_FAILVALUE`, indicating that the signature is not valid.      - If the {isValidSignature()} on the owner returned the `_ERC1271_SUCCESSVALUE`, the {isValidSignature()} on the account returns the `_ERC1271_SUCCESSVALUE`, indicating that it's a valid signature.",
        params: {
          dataHash: "The hash of the data to be validated.",
          signature:
            "A signature that can validate the previous parameter (Hash).",
        },
        returns: {
          returnedStatus:
            "A `bytes4` value that indicates if the signature is valid or not.",
        },
      },
      userdoc: {
        notice:
          "Achieves the goal of [EIP-1271] by validating signatures of smart contracts according to their own logic.",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function pendingOwner()
     *
     * 0xe30c3978 = keccak256('pendingOwner()')
     */
    "0xe30c3978": {
      sig: "pendingOwner()",
      inputs: [],
      name: "pendingOwner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:info":
          "If no ownership transfer is in progress, the pendingOwner will be `address(0).`.",
        details:
          "The address that ownership of the contract is transferred to. This address may use {acceptOwnership()} to gain ownership of the contract.",
      },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:danger":
          "Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner or an address allowed by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Renounce ownership of the contract in a 2-step process. 1. The first call will initiate the process of renouncing ownership. 2. The second call is used as a confirmation and will leave the contract without an owner.",
      },
      userdoc: {
        notice:
          "`msg.sender` is renouncing ownership of contract `address(this)`.",
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} event when receiving native tokens. - {DataChanged} event.",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} event when receiving native tokens. - {DataChanged} event. (on each iteration of setting data)",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Achieves the goal of [ERC-165] to detect supported interfaces and [LSP-17-ContractExtension] by checking if the interfaceId being queried is supported on another linked extension. If the contract doesn't support the `interfaceId`, it forwards the call to the `supportsInterface` extension according to [LSP-17-ContractExtension], and checks if the extension implements the interface defined by `interfaceId`.",
        params: {
          interfaceId: "The interface ID to check if the contract supports it.",
        },
        returns: {
          _0: "`true` if this contract implements the interface defined by `interfaceId`, `false` otherwise.",
        },
      },
      userdoc: {
        notice:
          "Checking if this contract supports the interface defined by the `bytes4` interface ID `interfaceId`.",
      },
    },

    /**
     * function transferOwnership(
     *  address pendingNewOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [
        { internalType: "address", name: "pendingNewOwner", type: "address" },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - When notifying the new owner via LSP1, the `typeId` used must be the `keccak256(...)` hash of [LSP0OwnershipTransferStarted]. - Pending owner cannot accept ownership in the same tx via the LSP1 hook.",
        details:
          "Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner. If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that ownership has been transferred to them by calling the {universalReceiver()} function on the `newOwner` contract.",
        params: { newOwner: "The address of the new owner." },
      },
      userdoc: { notice: "Transfer ownership initiated by `newOwner`." },
    },

    /**
     * function universalReceiver(
     *  bytes32 typeId,
     *  bytes receivedData
     * )
     *
     * 0x6bb56a14 = keccak256('universalReceiver(bytes32,bytes)')
     */
    "0x6bb56a14": {
      sig: "universalReceiver(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "typeId", type: "bytes32" },
        { internalType: "bytes", name: "receivedData", type: "bytes" },
      ],
      name: "universalReceiver",
      outputs: [
        { internalType: "bytes", name: "returnedValues", type: "bytes" },
      ],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} when receiving native tokens. - {UniversalReceiver} event with the function parameters, call options, and the response of the UniversalReceiverDelegates (URD) contract that was called.",
        details:
          "Achieves the goal of [LSP-1-UniversalReceiver] by allowing the account to be notified about incoming/outgoing transactions and enabling reactions to these actions. The reaction is achieved by having two external contracts ([LSP1UniversalReceiverDelegate]) that react on the whole transaction and on the specific typeId, respectively. The function performs the following steps: 1. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY].      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function. 2. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX] + `bytes32(typeId)`.   (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function. This function delegates internally the handling of native tokens to the {universalReceiver} function itself passing `_TYPEID_LSP0_VALUE_RECEIVED` as typeId and the calldata as received data.",
        params: {
          receivedData: "The data received.",
          typeId: "The type of call received.",
        },
        returns: {
          returnedValues:
            "The ABI encoded return value of the LSP1UniversalReceiverDelegate call and the LSP1TypeIdDelegate call.",
        },
      },
      userdoc: {
        notice:
          "Notifying the contract by calling its `universalReceiver` function with the following informations: typeId: `typeId`; data: `data`.",
      },
    },
  },
  LSP0ERC725Account: {
    /**
     * function RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()
     *
     * 0xead3fbdf = keccak256('RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()')
     */
    "0xead3fbdf": {
      sig: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY()",
      inputs: [],
      name: "RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()
     *
     * 0x01bfba61 = keccak256('RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()')
     */
    "0x01bfba61": {
      sig: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD()",
      inputs: [],
      name: "RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },

    /**
     * function VERSION()
     *
     * 0xffa1ad74 = keccak256('VERSION()')
     */
    "0xffa1ad74": {
      sig: "VERSION()",
      inputs: [],
      name: "VERSION",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
      userdoc: { notice: "Contract version." },
    },

    /**
     * function acceptOwnership()
     *
     * 0x79ba5097 = keccak256('acceptOwnership()')
     */
    "0x79ba5097": {
      sig: "acceptOwnership()",
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- Only the {pendingOwner} can call this function. - When notifying the previous owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_SenderNotification]. - When notifying the new owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_RecipientNotification].",
        details:
          "Transfer ownership of the contract from the current {owner()} to the {pendingOwner()}. Once this function is called: - The current {owner()} will lose access to the functions restricted to the {owner()} only. - The {pendingOwner()} will gain access to the functions restricted to the {owner()} only.",
      },
      userdoc: {
        notice:
          "`msg.sender` is accepting ownership of contract: `address(this)`.",
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function execute(
     *  uint256 operationType,
     *  address target,
     *  uint256 value,
     *  bytes data
     * )
     *
     * 0x44c028fe = keccak256('execute(uint256,address,uint256,bytes)')
     */
    "0x44c028fe": {
      sig: "execute(uint256,address,uint256,bytes)",
      inputs: [
        { internalType: "uint256", name: "operationType", type: "uint256" },
        { internalType: "address", name: "target", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "execute",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4). - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2). - {UniversalReceiver} event when receiving native tokens.",
        "custom:requirements":
          "- Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully. - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`. - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.",
        details:
          "Generic executor function to: - send native tokens to any address. - interact with any contract by passing an abi-encoded function call in the `data` parameter. - deploy a contract by providing its creation bytecode in the `data` parameter.",
        params: {
          data: "The call data, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.",
          operationType:
            "The operation type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4",
          target:
            "The address of the EOA or smart contract.  (unused if a contract is created via operation type 1 or 2)",
          value: "The amount of native tokens to transfer (in Wei)",
        },
      },
      userdoc: {
        notice:
          "Calling address `target` using `operationType`, transferring `value` wei and data: `data`.",
      },
    },

    /**
     * function executeBatch(
     *  uint256[] operationsType,
     *  address[] targets,
     *  uint256[] values,
     *  bytes[] datas
     * )
     *
     * 0x31858452 = keccak256('executeBatch(uint256[],address[],uint256[],bytes[])')
     */
    "0x31858452": {
      sig: "executeBatch(uint256[],address[],uint256[],bytes[])",
      inputs: [
        {
          internalType: "uint256[]",
          name: "operationsType",
          type: "uint256[]",
        },
        { internalType: "address[]", name: "targets", type: "address[]" },
        { internalType: "uint256[]", name: "values", type: "uint256[]" },
        { internalType: "bytes[]", name: "datas", type: "bytes[]" },
      ],
      name: "executeBatch",
      outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4). (each iteration) - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2) (each iteration) - {UniversalReceiver} event when receiving native tokens.",
        "custom:requirements":
          "- The length of the parameters provided must be equal. - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully. - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`. - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.",
        "custom:warning":
          "- The `msg.value` should not be trusted for any method called within the batch with `operationType`: `DELEGATECALL` (4).",
        details:
          "Batch executor function that behaves the same as {execute} but allowing multiple operations in the same transaction.",
        params: {
          datas:
            "The list of calldata, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.",
          operationsType:
            "The list of operations type used: `CALL = 0`; `CREATE = 1`; `CREATE2 = 2`; `STATICCALL = 3`; `DELEGATECALL = 4`",
          targets:
            "The list of addresses to call. `targets` will be unused if a contract is created (operation types 1 and 2).",
          values: "The list of native token amounts to transfer (in Wei).",
        },
      },
      userdoc: {
        notice:
          "Calling multiple addresses `targets` using `operationsType`, transferring `values` wei and data: `datas`.",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function isValidSignature(
     *  bytes32 dataHash,
     *  bytes signature
     * )
     *
     * 0x1626ba7e = keccak256('isValidSignature(bytes32,bytes)')
     */
    "0x1626ba7e": {
      sig: "isValidSignature(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataHash", type: "bytes32" },
        { internalType: "bytes", name: "signature", type: "bytes" },
      ],
      name: "isValidSignature",
      outputs: [
        { internalType: "bytes4", name: "returnedStatus", type: "bytes4" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:warning":
          "This function does not enforce by default the inclusion of the address of this contract in the signature digest. It is recommended that protocols or applications using this contract include the targeted address (= this contract) in the data to sign. To ensure that a signature is valid for a specific LSP0ERC725Account and prevent signatures from the same EOA to be replayed across different LSP0ERC725Accounts.",
        details:
          "Handles two cases: 1. If the owner is an EOA, recovers an address from the hash and the signature provided:      - Returns the `_ERC1271_SUCCESSVALUE` if the address recovered is the same as the owner, indicating that it was a valid signature.      - If the address is different, it returns the `_ERC1271_FAILVALUE` indicating that the signature is not valid. 2. If the owner is a smart contract, it forwards the call of {isValidSignature()} to the owner contract:      - If the contract fails or returns the `_ERC1271_FAILVALUE`, the {isValidSignature()} on the account returns the `_ERC1271_FAILVALUE`, indicating that the signature is not valid.      - If the {isValidSignature()} on the owner returned the `_ERC1271_SUCCESSVALUE`, the {isValidSignature()} on the account returns the `_ERC1271_SUCCESSVALUE`, indicating that it's a valid signature.",
        params: {
          dataHash: "The hash of the data to be validated.",
          signature:
            "A signature that can validate the previous parameter (Hash).",
        },
        returns: {
          returnedStatus:
            "A `bytes4` value that indicates if the signature is valid or not.",
        },
      },
      userdoc: {
        notice:
          "Achieves the goal of [EIP-1271] by validating signatures of smart contracts according to their own logic.",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function pendingOwner()
     *
     * 0xe30c3978 = keccak256('pendingOwner()')
     */
    "0xe30c3978": {
      sig: "pendingOwner()",
      inputs: [],
      name: "pendingOwner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:info":
          "If no ownership transfer is in progress, the pendingOwner will be `address(0).`.",
        details:
          "The address that ownership of the contract is transferred to. This address may use {acceptOwnership()} to gain ownership of the contract.",
      },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:danger":
          "Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner or an address allowed by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Renounce ownership of the contract in a 2-step process. 1. The first call will initiate the process of renouncing ownership. 2. The second call is used as a confirmation and will leave the contract without an owner.",
      },
      userdoc: {
        notice:
          "`msg.sender` is renouncing ownership of contract `address(this)`.",
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} event when receiving native tokens. - {DataChanged} event.",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} event when receiving native tokens. - {DataChanged} event. (on each iteration of setting data)",
        "custom:requirements":
          "Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Achieves the goal of [ERC-165] to detect supported interfaces and [LSP-17-ContractExtension] by checking if the interfaceId being queried is supported on another linked extension. If the contract doesn't support the `interfaceId`, it forwards the call to the `supportsInterface` extension according to [LSP-17-ContractExtension], and checks if the extension implements the interface defined by `interfaceId`.",
        params: {
          interfaceId: "The interface ID to check if the contract supports it.",
        },
        returns: {
          _0: "`true` if this contract implements the interface defined by `interfaceId`, `false` otherwise.",
        },
      },
      userdoc: {
        notice:
          "Checking if this contract supports the interface defined by the `bytes4` interface ID `interfaceId`.",
      },
    },

    /**
     * function transferOwnership(
     *  address pendingNewOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [
        { internalType: "address", name: "pendingNewOwner", type: "address" },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner. - When notifying the new owner via LSP1, the `typeId` used must be the `keccak256(...)` hash of [LSP0OwnershipTransferStarted]. - Pending owner cannot accept ownership in the same tx via the LSP1 hook.",
        details:
          "Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner. If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that ownership has been transferred to them by calling the {universalReceiver()} function on the `newOwner` contract.",
        params: { newOwner: "The address of the new owner." },
      },
      userdoc: { notice: "Transfer ownership initiated by `newOwner`." },
    },

    /**
     * function universalReceiver(
     *  bytes32 typeId,
     *  bytes receivedData
     * )
     *
     * 0x6bb56a14 = keccak256('universalReceiver(bytes32,bytes)')
     */
    "0x6bb56a14": {
      sig: "universalReceiver(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "typeId", type: "bytes32" },
        { internalType: "bytes", name: "receivedData", type: "bytes" },
      ],
      name: "universalReceiver",
      outputs: [
        { internalType: "bytes", name: "returnedValues", type: "bytes" },
      ],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "- {UniversalReceiver} when receiving native tokens. - {UniversalReceiver} event with the function parameters, call options, and the response of the UniversalReceiverDelegates (URD) contract that was called.",
        details:
          "Achieves the goal of [LSP-1-UniversalReceiver] by allowing the account to be notified about incoming/outgoing transactions and enabling reactions to these actions. The reaction is achieved by having two external contracts ([LSP1UniversalReceiverDelegate]) that react on the whole transaction and on the specific typeId, respectively. The function performs the following steps: 1. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY].      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function. 2. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX] + `bytes32(typeId)`.   (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function. This function delegates internally the handling of native tokens to the {universalReceiver} function itself passing `_TYPEID_LSP0_VALUE_RECEIVED` as typeId and the calldata as received data.",
        params: {
          receivedData: "The data received.",
          typeId: "The type of call received.",
        },
        returns: {
          returnedValues:
            "The ABI encoded return value of the LSP1UniversalReceiverDelegate call and the LSP1TypeIdDelegate call.",
        },
      },
      userdoc: {
        notice:
          "Notifying the contract by calling its `universalReceiver` function with the following informations: typeId: `typeId`; data: `data`.",
      },
    },
  },
  LSP4DigitalAssetMetadata: {
    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "{DataChanged} event.",
        "custom:requirements": "- SHOULD only be callable by the {owner}.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{DataChanged} event **for each data key/value pair set**.",
        "custom:requirements":
          "- SHOULD only be callable by the {owner} of the contract.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP4DigitalAssetMetadataInitAbstract: {
    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "{DataChanged} event.",
        "custom:requirements": "- SHOULD only be callable by the {owner}.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{DataChanged} event **for each data key/value pair set**.",
        "custom:requirements":
          "- SHOULD only be callable by the {owner} of the contract.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP6KeyManager: {
    /**
     * function VERSION()
     *
     * 0xffa1ad74 = keccak256('VERSION()')
     */
    "0xffa1ad74": {
      sig: "VERSION()",
      inputs: [],
      name: "VERSION",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
      userdoc: { notice: "Contract version." },
    },

    /**
     * function execute(
     *  bytes payload
     * )
     *
     * 0x09c5eabe = keccak256('execute(bytes)')
     */
    "0x09c5eabe": {
      sig: "execute(bytes)",
      inputs: [{ internalType: "bytes", name: "payload", type: "bytes" }],
      name: "execute",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{PermissionsVerified} event when the permissions related to `payload` have been verified successfully.",
        details:
          "Execute A `payload` on the linked {target} contract after having verified the permissions associated with the function being run. The `payload` MUST be a valid abi-encoded function call of one of the functions present in the linked {target}, otherwise the call will fail. The linked {target} will return some data on successful execution, or revert on failure.",
        params: {
          payload:
            "The abi-encoded function call to execute on the linked {target}.",
        },
        returns: {
          _0: "The abi-decoded data returned by the function called on the linked {target}.",
        },
      },
      userdoc: {
        notice:
          "Executing the following payload on the linked contract: `payload`",
      },
    },

    /**
     * function executeBatch(
     *  uint256[] values,
     *  bytes[] payloads
     * )
     *
     * 0xbf0176ff = keccak256('executeBatch(uint256[],bytes[])')
     */
    "0xbf0176ff": {
      sig: "executeBatch(uint256[],bytes[])",
      inputs: [
        { internalType: "uint256[]", name: "values", type: "uint256[]" },
        { internalType: "bytes[]", name: "payloads", type: "bytes[]" },
      ],
      name: "executeBatch",
      outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{PermissionsVerified} event for each permissions related to each `payload` that have been verified successfully.",
        details:
          "Same as {execute} but execute a batch of payloads (abi-encoded function calls) in a single transaction.",
        params: {
          payloads:
            "An array of abi-encoded function calls to execute successively on the linked {target}.",
          values:
            "An array of amount of native tokens to be transferred for each `payload`.",
        },
        returns: {
          _0: "An array of abi-decoded data returned by the functions called on the linked {target}.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of payloads and sensind on the linked contract. - payloads: `payloads` - values transferred for each payload: `values`",
      },
    },

    /**
     * function executeRelayCall(
     *  bytes signature,
     *  uint256 nonce,
     *  uint256 validityTimestamps,
     *  bytes payload
     * )
     *
     * 0x4c8a4e74 = keccak256('executeRelayCall(bytes,uint256,uint256,bytes)')
     */
    "0x4c8a4e74": {
      sig: "executeRelayCall(bytes,uint256,uint256,bytes)",
      inputs: [
        { internalType: "bytes", name: "signature", type: "bytes" },
        { internalType: "uint256", name: "nonce", type: "uint256" },
        {
          internalType: "uint256",
          name: "validityTimestamps",
          type: "uint256",
        },
        { internalType: "bytes", name: "payload", type: "bytes" },
      ],
      name: "executeRelayCall",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{PermissionsVerified} event when the permissions related to `payload` have been verified successfully.",
        "custom:hint":
          'If you are looking to learn how to sign and execute relay transactions via the Key Manager, see our Javascript step by step guide [_"Execute Relay Transactions"_](../../../learn/expert-guides/key-manager/execute-relay-transactions.md). See the LSP6 Standard page for more details on how to [generate a valid signature for Execute Relay Call](../../../standards/universal-profile/lsp6-key-manager.md#how-to-sign-relay-transactions).',
        details:
          "Allows any address (executor) to execute a payload (= abi-encoded function call), given they have a valid signature from a signer address and a valid `nonce` for this signer. The signature MUST be generated according to the signature format defined by the LSP25 standard. The signer that generated the `signature` MUST be a controller with some permissions on the linked {target}. The `payload` will be executed on the {target} contract once the LSP25 signature and the permissions of the signer have been verified.",
        params: {
          nonce:
            "The nonce of the address that signed the calldata (in a specific `_channel`), obtained via {getNonce}. Used to prevent replay attack.",
          payload: "The abi-encoded function call to execute.",
          signature:
            "A 65 bytes long signature for a meta transaction according to LSP25.",
          validityTimestamps:
            'Two `uint128` timestamps concatenated together that describes when the relay transaction is valid "from" (left `uint128`) and "until" as a deadline (right `uint128`).',
        },
        returns: { _0: "The data being returned by the function executed." },
      },
      userdoc: {
        notice:
          "Executing the following payload given the nonce `nonce` and signature `signature`. Payload: `payload`",
      },
    },

    /**
     * function executeRelayCallBatch(
     *  bytes[] signatures,
     *  uint256[] nonces,
     *  uint256[] validityTimestamps,
     *  uint256[] values,
     *  bytes[] payloads
     * )
     *
     * 0xa20856a5 = keccak256('executeRelayCallBatch(bytes[],uint256[],uint256[],uint256[],bytes[])')
     */
    "0xa20856a5": {
      sig: "executeRelayCallBatch(bytes[],uint256[],uint256[],uint256[],bytes[])",
      inputs: [
        { internalType: "bytes[]", name: "signatures", type: "bytes[]" },
        { internalType: "uint256[]", name: "nonces", type: "uint256[]" },
        {
          internalType: "uint256[]",
          name: "validityTimestamps",
          type: "uint256[]",
        },
        { internalType: "uint256[]", name: "values", type: "uint256[]" },
        { internalType: "bytes[]", name: "payloads", type: "bytes[]" },
      ],
      name: "executeRelayCallBatch",
      outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- the length of `signatures`, `nonces`, `validityTimestamps`, `values` and `payloads` MUST be the same. - the value sent to this function (`msg.value`) MUST be equal to the sum of all `values` in the batch. There should not be any excess value sent to this function.",
        details:
          "Same as {executeRelayCall} but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction. The `signatures` can be from multiple controllers, not necessarely the same controller, as long as each of these controllers that signed have the right permissions related to the calldata `payload` they signed.",
        params: {
          nonces:
            "An array of nonces of the addresses that signed the calldata payloads (in specific channels). Obtained via {getNonce}. Used to prevent replay attack.",
          payloads:
            "An array of abi-encoded function calls to be executed successively.",
          signatures:
            "An array of 65 bytes long signatures for meta transactions according to LSP25.",
          validityTimestamps:
            'An array of two `uint128` concatenated timestamps that describe when the relay transaction is valid "from" (left `uint128`) and "until" (right `uint128`).',
          values:
            "An array of amount of native tokens to be transferred for each calldata `payload`.",
        },
        returns: {
          _0: "An array of abi-decoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice: "Executing a batch of relay calls (= meta-transactions).",
      },
    },

    /**
     * function getNonce(
     *  address from,
     *  uint128 channelId
     * )
     *
     * 0xb44581d9 = keccak256('getNonce(address,uint128)')
     */
    "0xb44581d9": {
      sig: "getNonce(address,uint128)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "uint128", name: "channelId", type: "uint128" },
      ],
      name: "getNonce",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:hint":
          'A signer can choose its channel number arbitrarily. The recommended practice is to: - use `channelId == 0` for transactions for which the ordering of execution matters.abi _Example: you have two transactions A and B, and transaction A must be executed first and complete successfully before transaction B should be executed)._ - use any other `channelId` number for transactions that you want to be order independant (out-of-order execution, execution _"in parallel"_). _Example: you have two transactions A and B. You want transaction B to be executed a) without having to wait for transaction A to complete, or b) regardless if transaction A completed successfully or not.',
        details:
          "Get the nonce for a specific `from` address that can be used for signing relay transactions via {executeRelayCall}.",
        params: {
          channelId:
            "The channel id that the signer wants to use for executing the transaction.",
          from: "The address of the signer of the transaction.",
        },
        returns: { _0: "The current nonce on a specific `channelId`." },
      },
      userdoc: {
        notice:
          "Reading the latest nonce of address `from` in the channel ID `channelId`.",
      },
    },

    /**
     * function isValidSignature(
     *  bytes32 dataHash,
     *  bytes signature
     * )
     *
     * 0x1626ba7e = keccak256('isValidSignature(bytes32,bytes)')
     */
    "0x1626ba7e": {
      sig: "isValidSignature(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataHash", type: "bytes32" },
        { internalType: "bytes", name: "signature", type: "bytes" },
      ],
      name: "isValidSignature",
      outputs: [
        { internalType: "bytes4", name: "returnedStatus", type: "bytes4" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:warning":
          "This function does not enforce by default the inclusion of the address of this contract in the signature digest. It is recommended that protocols or applications using this contract include the targeted address (= this contract) in the data to sign. To ensure that a signature is valid for a specific LSP6KeyManager and prevent signatures from the same EOA to be replayed across different LSP6KeyManager.",
        details:
          "Checks if a signature was signed by a controller that has the permission `SIGN`. If the signer is a controller with the permission `SIGN`, it will return the ERC1271 success value.",
        params: {
          hash: "Hash of the data to be signed",
          signature: "Signature byte array associated with _data",
        },
        returns: {
          returnedStatus:
            "`0x1626ba7e` on success, or `0xffffffff` on failure.",
        },
      },
    },

    /**
     * function lsp20VerifyCall(
     *  address ,
     *  address targetContract,
     *  address caller,
     *  uint256 msgValue,
     *  bytes callData
     * )
     *
     * 0xde928f14 = keccak256('lsp20VerifyCall(address,address,address,uint256,bytes)')
     */
    "0xde928f14": {
      sig: "lsp20VerifyCall(address,address,address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "", type: "address" },
        { internalType: "address", name: "targetContract", type: "address" },
        { internalType: "address", name: "caller", type: "address" },
        { internalType: "uint256", name: "msgValue", type: "uint256" },
        { internalType: "bytes", name: "callData", type: "bytes" },
      ],
      name: "lsp20VerifyCall",
      outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:hint":
          'This function can call by any other address than the {`target`}. This allows to verify permissions in a _"read-only"_ manner. Anyone can call this function to verify if the `caller` has the right permissions to perform the abi-encoded function call `data` on the {`target`} contract (while sending `msgValue` alongside the call). If the permissions have been verified successfully and `caller` is authorized, one of the following two LSP20 success value will be returned:  - `0x1a238000`: LSP20 success value **without** post verification (last byte is `0x00`).  - `0x1a238001`: LSP20 success value **with** post-verification (last byte is `0x01`).',
        params: {
          callData: "The calldata sent by the caller to the msg.sender",
          caller:
            "The address who called the function on the `target` contract.",
          requestor: "The address that requested to make the call to `target`.",
          target:
            "The address of the contract that implements the `LSP20CallVerification` interface.",
          value:
            "The value sent by the caller to the function called on the msg.sender",
        },
        returns: {
          _0: "MUST return the first 3 bytes of `lsp20VerifyCall(address,uint256,bytes)` function selector if the call to the function is allowed, concatened with a byte that determines if the lsp20VerifyCallResult function should be called after the original function call. The byte that invoke the lsp20VerifyCallResult function is strictly `0x01`.",
        },
      },
    },

    /**
     * function lsp20VerifyCallResult(
     *  bytes32 ,
     *  bytes
     * )
     *
     * 0xd3fc45d3 = keccak256('lsp20VerifyCallResult(bytes32,bytes)')
     */
    "0xd3fc45d3": {
      sig: "lsp20VerifyCallResult(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "", type: "bytes32" },
        { internalType: "bytes", name: "", type: "bytes" },
      ],
      name: "lsp20VerifyCallResult",
      outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          callHash:
            "The keccak256 hash of the parameters of {lsp20VerifyCall} concatenated",
          callResult:
            "The value result of the function called on the msg.sender",
        },
        returns: {
          _0: "MUST return the lsp20VerifyCallResult function selector if the call to the function is allowed",
        },
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function target()
     *
     * 0xd4b83992 = keccak256('target()')
     */
    "0xd4b83992": {
      sig: "target()",
      inputs: [],
      name: "target",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details: "Get The address of the contract linked to this Key Manager.",
        returns: { _0: "The address of the linked contract" },
      },
    },
  },
  LSP6KeyManagerInit: {
    /**
     * function VERSION()
     *
     * 0xffa1ad74 = keccak256('VERSION()')
     */
    "0xffa1ad74": {
      sig: "VERSION()",
      inputs: [],
      name: "VERSION",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
      userdoc: { notice: "Contract version." },
    },

    /**
     * function execute(
     *  bytes payload
     * )
     *
     * 0x09c5eabe = keccak256('execute(bytes)')
     */
    "0x09c5eabe": {
      sig: "execute(bytes)",
      inputs: [{ internalType: "bytes", name: "payload", type: "bytes" }],
      name: "execute",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{PermissionsVerified} event when the permissions related to `payload` have been verified successfully.",
        details:
          "Execute A `payload` on the linked {target} contract after having verified the permissions associated with the function being run. The `payload` MUST be a valid abi-encoded function call of one of the functions present in the linked {target}, otherwise the call will fail. The linked {target} will return some data on successful execution, or revert on failure.",
        params: {
          payload:
            "The abi-encoded function call to execute on the linked {target}.",
        },
        returns: {
          _0: "The abi-decoded data returned by the function called on the linked {target}.",
        },
      },
      userdoc: {
        notice:
          "Executing the following payload on the linked contract: `payload`",
      },
    },

    /**
     * function executeBatch(
     *  uint256[] values,
     *  bytes[] payloads
     * )
     *
     * 0xbf0176ff = keccak256('executeBatch(uint256[],bytes[])')
     */
    "0xbf0176ff": {
      sig: "executeBatch(uint256[],bytes[])",
      inputs: [
        { internalType: "uint256[]", name: "values", type: "uint256[]" },
        { internalType: "bytes[]", name: "payloads", type: "bytes[]" },
      ],
      name: "executeBatch",
      outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{PermissionsVerified} event for each permissions related to each `payload` that have been verified successfully.",
        details:
          "Same as {execute} but execute a batch of payloads (abi-encoded function calls) in a single transaction.",
        params: {
          payloads:
            "An array of abi-encoded function calls to execute successively on the linked {target}.",
          values:
            "An array of amount of native tokens to be transferred for each `payload`.",
        },
        returns: {
          _0: "An array of abi-decoded data returned by the functions called on the linked {target}.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of payloads and sensind on the linked contract. - payloads: `payloads` - values transferred for each payload: `values`",
      },
    },

    /**
     * function executeRelayCall(
     *  bytes signature,
     *  uint256 nonce,
     *  uint256 validityTimestamps,
     *  bytes payload
     * )
     *
     * 0x4c8a4e74 = keccak256('executeRelayCall(bytes,uint256,uint256,bytes)')
     */
    "0x4c8a4e74": {
      sig: "executeRelayCall(bytes,uint256,uint256,bytes)",
      inputs: [
        { internalType: "bytes", name: "signature", type: "bytes" },
        { internalType: "uint256", name: "nonce", type: "uint256" },
        {
          internalType: "uint256",
          name: "validityTimestamps",
          type: "uint256",
        },
        { internalType: "bytes", name: "payload", type: "bytes" },
      ],
      name: "executeRelayCall",
      outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{PermissionsVerified} event when the permissions related to `payload` have been verified successfully.",
        "custom:hint":
          'If you are looking to learn how to sign and execute relay transactions via the Key Manager, see our Javascript step by step guide [_"Execute Relay Transactions"_](../../../learn/expert-guides/key-manager/execute-relay-transactions.md). See the LSP6 Standard page for more details on how to [generate a valid signature for Execute Relay Call](../../../standards/universal-profile/lsp6-key-manager.md#how-to-sign-relay-transactions).',
        details:
          "Allows any address (executor) to execute a payload (= abi-encoded function call), given they have a valid signature from a signer address and a valid `nonce` for this signer. The signature MUST be generated according to the signature format defined by the LSP25 standard. The signer that generated the `signature` MUST be a controller with some permissions on the linked {target}. The `payload` will be executed on the {target} contract once the LSP25 signature and the permissions of the signer have been verified.",
        params: {
          nonce:
            "The nonce of the address that signed the calldata (in a specific `_channel`), obtained via {getNonce}. Used to prevent replay attack.",
          payload: "The abi-encoded function call to execute.",
          signature:
            "A 65 bytes long signature for a meta transaction according to LSP25.",
          validityTimestamps:
            'Two `uint128` timestamps concatenated together that describes when the relay transaction is valid "from" (left `uint128`) and "until" as a deadline (right `uint128`).',
        },
        returns: { _0: "The data being returned by the function executed." },
      },
      userdoc: {
        notice:
          "Executing the following payload given the nonce `nonce` and signature `signature`. Payload: `payload`",
      },
    },

    /**
     * function executeRelayCallBatch(
     *  bytes[] signatures,
     *  uint256[] nonces,
     *  uint256[] validityTimestamps,
     *  uint256[] values,
     *  bytes[] payloads
     * )
     *
     * 0xa20856a5 = keccak256('executeRelayCallBatch(bytes[],uint256[],uint256[],uint256[],bytes[])')
     */
    "0xa20856a5": {
      sig: "executeRelayCallBatch(bytes[],uint256[],uint256[],uint256[],bytes[])",
      inputs: [
        { internalType: "bytes[]", name: "signatures", type: "bytes[]" },
        { internalType: "uint256[]", name: "nonces", type: "uint256[]" },
        {
          internalType: "uint256[]",
          name: "validityTimestamps",
          type: "uint256[]",
        },
        { internalType: "uint256[]", name: "values", type: "uint256[]" },
        { internalType: "bytes[]", name: "payloads", type: "bytes[]" },
      ],
      name: "executeRelayCallBatch",
      outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:requirements":
          "- the length of `signatures`, `nonces`, `validityTimestamps`, `values` and `payloads` MUST be the same. - the value sent to this function (`msg.value`) MUST be equal to the sum of all `values` in the batch. There should not be any excess value sent to this function.",
        details:
          "Same as {executeRelayCall} but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction. The `signatures` can be from multiple controllers, not necessarely the same controller, as long as each of these controllers that signed have the right permissions related to the calldata `payload` they signed.",
        params: {
          nonces:
            "An array of nonces of the addresses that signed the calldata payloads (in specific channels). Obtained via {getNonce}. Used to prevent replay attack.",
          payloads:
            "An array of abi-encoded function calls to be executed successively.",
          signatures:
            "An array of 65 bytes long signatures for meta transactions according to LSP25.",
          validityTimestamps:
            'An array of two `uint128` concatenated timestamps that describe when the relay transaction is valid "from" (left `uint128`) and "until" (right `uint128`).',
          values:
            "An array of amount of native tokens to be transferred for each calldata `payload`.",
        },
        returns: {
          _0: "An array of abi-decoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice: "Executing a batch of relay calls (= meta-transactions).",
      },
    },

    /**
     * function getNonce(
     *  address from,
     *  uint128 channelId
     * )
     *
     * 0xb44581d9 = keccak256('getNonce(address,uint128)')
     */
    "0xb44581d9": {
      sig: "getNonce(address,uint128)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "uint128", name: "channelId", type: "uint128" },
      ],
      name: "getNonce",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:hint":
          'A signer can choose its channel number arbitrarily. The recommended practice is to: - use `channelId == 0` for transactions for which the ordering of execution matters.abi _Example: you have two transactions A and B, and transaction A must be executed first and complete successfully before transaction B should be executed)._ - use any other `channelId` number for transactions that you want to be order independant (out-of-order execution, execution _"in parallel"_). _Example: you have two transactions A and B. You want transaction B to be executed a) without having to wait for transaction A to complete, or b) regardless if transaction A completed successfully or not.',
        details:
          "Get the nonce for a specific `from` address that can be used for signing relay transactions via {executeRelayCall}.",
        params: {
          channelId:
            "The channel id that the signer wants to use for executing the transaction.",
          from: "The address of the signer of the transaction.",
        },
        returns: { _0: "The current nonce on a specific `channelId`." },
      },
      userdoc: {
        notice:
          "Reading the latest nonce of address `from` in the channel ID `channelId`.",
      },
    },

    /**
     * function initialize(
     *  address target_
     * )
     *
     * 0xc4d66de8 = keccak256('initialize(address)')
     */
    "0xc4d66de8": {
      sig: "initialize(address)",
      inputs: [{ internalType: "address", name: "target_", type: "address" }],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Initialise a LSP6KeyManager and set the `target_` address in the contract storage, making this Key Manager linked to this `target_` contract.",
        params: {
          target_:
            "The address of the contract to control and forward calldata payloads to.",
        },
      },
      userdoc: {
        notice:
          "Initializing a LSP6KeyManagerInit linked to contract at address `target_`.",
      },
    },

    /**
     * function isValidSignature(
     *  bytes32 dataHash,
     *  bytes signature
     * )
     *
     * 0x1626ba7e = keccak256('isValidSignature(bytes32,bytes)')
     */
    "0x1626ba7e": {
      sig: "isValidSignature(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataHash", type: "bytes32" },
        { internalType: "bytes", name: "signature", type: "bytes" },
      ],
      name: "isValidSignature",
      outputs: [
        { internalType: "bytes4", name: "returnedStatus", type: "bytes4" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        "custom:warning":
          "This function does not enforce by default the inclusion of the address of this contract in the signature digest. It is recommended that protocols or applications using this contract include the targeted address (= this contract) in the data to sign. To ensure that a signature is valid for a specific LSP6KeyManager and prevent signatures from the same EOA to be replayed across different LSP6KeyManager.",
        details:
          "Checks if a signature was signed by a controller that has the permission `SIGN`. If the signer is a controller with the permission `SIGN`, it will return the ERC1271 success value.",
        params: {
          hash: "Hash of the data to be signed",
          signature: "Signature byte array associated with _data",
        },
        returns: {
          returnedStatus:
            "`0x1626ba7e` on success, or `0xffffffff` on failure.",
        },
      },
    },

    /**
     * function lsp20VerifyCall(
     *  address ,
     *  address targetContract,
     *  address caller,
     *  uint256 msgValue,
     *  bytes callData
     * )
     *
     * 0xde928f14 = keccak256('lsp20VerifyCall(address,address,address,uint256,bytes)')
     */
    "0xde928f14": {
      sig: "lsp20VerifyCall(address,address,address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "", type: "address" },
        { internalType: "address", name: "targetContract", type: "address" },
        { internalType: "address", name: "caller", type: "address" },
        { internalType: "uint256", name: "msgValue", type: "uint256" },
        { internalType: "bytes", name: "callData", type: "bytes" },
      ],
      name: "lsp20VerifyCall",
      outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:hint":
          'This function can call by any other address than the {`target`}. This allows to verify permissions in a _"read-only"_ manner. Anyone can call this function to verify if the `caller` has the right permissions to perform the abi-encoded function call `data` on the {`target`} contract (while sending `msgValue` alongside the call). If the permissions have been verified successfully and `caller` is authorized, one of the following two LSP20 success value will be returned:  - `0x1a238000`: LSP20 success value **without** post verification (last byte is `0x00`).  - `0x1a238001`: LSP20 success value **with** post-verification (last byte is `0x01`).',
        params: {
          callData: "The calldata sent by the caller to the msg.sender",
          caller:
            "The address who called the function on the `target` contract.",
          requestor: "The address that requested to make the call to `target`.",
          target:
            "The address of the contract that implements the `LSP20CallVerification` interface.",
          value:
            "The value sent by the caller to the function called on the msg.sender",
        },
        returns: {
          _0: "MUST return the first 3 bytes of `lsp20VerifyCall(address,uint256,bytes)` function selector if the call to the function is allowed, concatened with a byte that determines if the lsp20VerifyCallResult function should be called after the original function call. The byte that invoke the lsp20VerifyCallResult function is strictly `0x01`.",
        },
      },
    },

    /**
     * function lsp20VerifyCallResult(
     *  bytes32 ,
     *  bytes
     * )
     *
     * 0xd3fc45d3 = keccak256('lsp20VerifyCallResult(bytes32,bytes)')
     */
    "0xd3fc45d3": {
      sig: "lsp20VerifyCallResult(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "", type: "bytes32" },
        { internalType: "bytes", name: "", type: "bytes" },
      ],
      name: "lsp20VerifyCallResult",
      outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          callHash:
            "The keccak256 hash of the parameters of {lsp20VerifyCall} concatenated",
          callResult:
            "The value result of the function called on the msg.sender",
        },
        returns: {
          _0: "MUST return the lsp20VerifyCallResult function selector if the call to the function is allowed",
        },
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function target()
     *
     * 0xd4b83992 = keccak256('target()')
     */
    "0xd4b83992": {
      sig: "target()",
      inputs: [],
      name: "target",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details: "Get The address of the contract linked to this Key Manager.",
        returns: { _0: "The address of the linked contract" },
      },
    },
  },
  LSP7DigitalAsset: {
    /**
     * function authorizeOperator(
     *  address operator,
     *  uint256 amount,
     *  bytes operatorNotificationData
     * )
     *
     * 0xb49506fd = keccak256('authorizeOperator(address,uint256,bytes)')
     */
    "0xb49506fd": {
      sig: "authorizeOperator(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "authorizeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:danger":
          "To avoid front-running and Allowance Double-Spend Exploit when increasing or decreasing the authorized amount of an operator, it is advised to use the {increaseAllowance} and {decreaseAllowance} functions. For more information, see: https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/",
        details:
          "Sets an `amount` of tokens that an `operator` has access from the caller's balance (allowance). See {authorizedAmountFor}. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          amount: "The allowance amount of tokens operator has access to.",
          operator: "The address to authorize as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
        },
      },
    },

    /**
     * function authorizedAmountFor(
     *  address operator,
     *  address tokenOwner
     * )
     *
     * 0x65aeaa95 = keccak256('authorizedAmountFor(address,address)')
     */
    "0x65aeaa95": {
      sig: "authorizedAmountFor(address,address)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "authorizedAmountFor",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the amount of tokens `operator` address has access to from `tokenOwner`. Operators can send and burn tokens on behalf of their owners.",
        params: {
          operator:
            "The operator's address to query the authorized amount for.",
          tokenOwner: "The token owner that `operator` has allowance on.",
        },
        returns: {
          _0: "The amount of tokens the `operator`'s address has access on the `tokenOwner`'s balance.",
        },
      },
    },

    /**
     * function balanceOf(
     *  address tokenOwner
     * )
     *
     * 0x70a08231 = keccak256('balanceOf(address)')
     */
    "0x70a08231": {
      sig: "balanceOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the number of tokens owned by `tokenOwner`. If the token is divisible (the {decimals} function returns `18`), the amount returned should be divided by 1e18 to get a better picture of the actual balance of the `tokenOwner`. _Example:_ ``` balanceOf(someAddress) -> 42_000_000_000_000_000_000 / 1e18 = 42 tokens ```",
        params: {
          tokenOwner:
            "The address of the token holder to query the balance for.",
        },
        returns: { _0: "The amount of tokens owned by `tokenOwner`." },
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function decimals()
     *
     * 0x313ce567 = keccak256('decimals()')
     */
    "0x313ce567": {
      sig: "decimals()",
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of decimals used to get its user representation. If the asset contract has been set to be non-divisible via the `isNonDivisible_` parameter in the `constructor`, the decimals returned wiil be `0`. Otherwise `18` is the common value.",
        returns: {
          _0: "the number of decimals. If `0` is returned, the asset is non-divisible.",
        },
      },
    },

    /**
     * function decreaseAllowance(
     *  address operator,
     *  uint256 subtractedAmount,
     *  bytes operatorNotificationData
     * )
     *
     * 0x7b204c4e = keccak256('decreaseAllowance(address,uint256,bytes)')
     */
    "0x7b204c4e": {
      sig: "decreaseAllowance(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "subtractedAmount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "decreaseAllowance",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Atomically decreases the allowance granted to `operator` by the caller. This is an alternative approach to {authorizeOperator} that can be used as a mitigation for the double spending allowance problem. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          operator: "The operator to decrease allowance for `msg.sender`",
          subtractedAmount:
            "The amount to decrease by in the operator's allowance.",
        },
      },
      userdoc: {
        notice: "Decrease the allowance of `operator` by -`subtractedAmount`",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function getOperatorsOf(
     *  address tokenOwner
     * )
     *
     * 0xd72fc29a = keccak256('getOperatorsOf(address)')
     */
    "0xd72fc29a": {
      sig: "getOperatorsOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "getOperatorsOf",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns all `operator` addresses that are allowed to transfer or burn on behalf of `tokenOwner`.",
        params: { tokenOwner: "The token owner to get the operators for." },
        returns: {
          _0: "An array of operators allowed to transfer or burn tokens on behalf of `tokenOwner`.",
        },
      },
    },

    /**
     * function increaseAllowance(
     *  address operator,
     *  uint256 addedAmount,
     *  bytes operatorNotificationData
     * )
     *
     * 0x2bc1da82 = keccak256('increaseAllowance(address,uint256,bytes)')
     */
    "0x2bc1da82": {
      sig: "increaseAllowance(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "addedAmount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "increaseAllowance",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Atomically increases the allowance granted to `operator` by the caller. This is an alternative approach to {authorizeOperator} that can be used as a mitigation for the double spending allowance problem. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          addedAmount:
            "The additional amount to add on top of the current operator's allowance",
          operator: "The operator to increase the allowance for `msg.sender`",
        },
      },
      userdoc: {
        notice: "Increase the allowance of `operator` by +`addedAmount`",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function revokeOperator(
     *  address operator,
     *  bool notify,
     *  bytes operatorNotificationData
     * )
     *
     * 0x4521748e = keccak256('revokeOperator(address,bool,bytes)')
     */
    "0x4521748e": {
      sig: "revokeOperator(address,bool,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bool", name: "notify", type: "bool" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "revokeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Removes the `operator` address as an operator of callers tokens, disallowing it to send any amount of tokens on behalf of the token owner (the caller of the function `msg.sender`). See also {authorizedAmountFor}.",
        params: {
          notify: "Boolean indicating whether to notify the operator or not.",
          operator: "The address to revoke as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
        },
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "{DataChanged} event.",
        "custom:requirements": "- SHOULD only be callable by the {owner}.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{DataChanged} event **for each data key/value pair set**.",
        "custom:requirements":
          "- SHOULD only be callable by the {owner} of the contract.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.",
      },
    },

    /**
     * function totalSupply()
     *
     * 0x18160ddd = keccak256('totalSupply()')
     */
    "0x18160ddd": {
      sig: "totalSupply()",
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of existing tokens that have been minted in this contract.",
        returns: { _0: "The number of existing tokens." },
      },
    },

    /**
     * function transfer(
     *  address from,
     *  address to,
     *  uint256 amount,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x760d9bba = keccak256('transfer(address,address,uint256,bool,bytes)')
     */
    "0x760d9bba": {
      sig: "transfer(address,address,uint256,bool,bytes)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "bool", name: "force", type: "bool" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "transfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers an `amount` of tokens from the `from` address to the `to` address and notify both sender and recipients via the LSP1 {`universalReceiver(...)`} function. If the tokens are transferred by an operator on behalf of a token holder, the allowance for the operator will be decreased by `amount` once the token transfer has been completed (See {authorizedAmountFor}).",
        params: {
          amount: "The amount of tokens to transfer.",
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.",
          force:
            "When set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "The sender address.",
          to: "The recipient address.",
        },
      },
    },

    /**
     * function transferBatch(
     *  address[] from,
     *  address[] to,
     *  uint256[] amount,
     *  bool[] force,
     *  bytes[] data
     * )
     *
     * 0x2d7667c9 = keccak256('transferBatch(address[],address[],uint256[],bool[],bytes[])')
     */
    "0x2d7667c9": {
      sig: "transferBatch(address[],address[],uint256[],bool[],bytes[])",
      inputs: [
        { internalType: "address[]", name: "from", type: "address[]" },
        { internalType: "address[]", name: "to", type: "address[]" },
        { internalType: "uint256[]", name: "amount", type: "uint256[]" },
        { internalType: "bool[]", name: "force", type: "bool[]" },
        { internalType: "bytes[]", name: "data", type: "bytes[]" },
      ],
      name: "transferBatch",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Same as {`transfer(...)`} but transfer multiple tokens based on the arrays of `from`, `to`, `amount`.",
        params: {
          amount:
            "An array of amount of tokens to transfer for each `from -> to` transfer.",
          data: "An array of additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.",
          force:
            "For each transfer, when set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "An array of sending addresses.",
          to: "An array of receiving addresses.",
        },
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP7DigitalAssetInitAbstract: {
    /**
     * function authorizeOperator(
     *  address operator,
     *  uint256 amount,
     *  bytes operatorNotificationData
     * )
     *
     * 0xb49506fd = keccak256('authorizeOperator(address,uint256,bytes)')
     */
    "0xb49506fd": {
      sig: "authorizeOperator(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "authorizeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:danger":
          "To avoid front-running and Allowance Double-Spend Exploit when increasing or decreasing the authorized amount of an operator, it is advised to use the {increaseAllowance} and {decreaseAllowance} functions. For more information, see: https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/",
        details:
          "Sets an `amount` of tokens that an `operator` has access from the caller's balance (allowance). See {authorizedAmountFor}. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          amount: "The allowance amount of tokens operator has access to.",
          operator: "The address to authorize as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
        },
      },
    },

    /**
     * function authorizedAmountFor(
     *  address operator,
     *  address tokenOwner
     * )
     *
     * 0x65aeaa95 = keccak256('authorizedAmountFor(address,address)')
     */
    "0x65aeaa95": {
      sig: "authorizedAmountFor(address,address)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "authorizedAmountFor",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the amount of tokens `operator` address has access to from `tokenOwner`. Operators can send and burn tokens on behalf of their owners.",
        params: {
          operator:
            "The operator's address to query the authorized amount for.",
          tokenOwner: "The token owner that `operator` has allowance on.",
        },
        returns: {
          _0: "The amount of tokens the `operator`'s address has access on the `tokenOwner`'s balance.",
        },
      },
    },

    /**
     * function balanceOf(
     *  address tokenOwner
     * )
     *
     * 0x70a08231 = keccak256('balanceOf(address)')
     */
    "0x70a08231": {
      sig: "balanceOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the number of tokens owned by `tokenOwner`. If the token is divisible (the {decimals} function returns `18`), the amount returned should be divided by 1e18 to get a better picture of the actual balance of the `tokenOwner`. _Example:_ ``` balanceOf(someAddress) -> 42_000_000_000_000_000_000 / 1e18 = 42 tokens ```",
        params: {
          tokenOwner:
            "The address of the token holder to query the balance for.",
        },
        returns: { _0: "The amount of tokens owned by `tokenOwner`." },
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function decimals()
     *
     * 0x313ce567 = keccak256('decimals()')
     */
    "0x313ce567": {
      sig: "decimals()",
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of decimals used to get its user representation. If the asset contract has been set to be non-divisible via the `isNonDivisible_` parameter in the `constructor`, the decimals returned wiil be `0`. Otherwise `18` is the common value.",
        returns: {
          _0: "the number of decimals. If `0` is returned, the asset is non-divisible.",
        },
      },
    },

    /**
     * function decreaseAllowance(
     *  address operator,
     *  uint256 subtractedAmount,
     *  bytes operatorNotificationData
     * )
     *
     * 0x7b204c4e = keccak256('decreaseAllowance(address,uint256,bytes)')
     */
    "0x7b204c4e": {
      sig: "decreaseAllowance(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "subtractedAmount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "decreaseAllowance",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Atomically decreases the allowance granted to `operator` by the caller. This is an alternative approach to {authorizeOperator} that can be used as a mitigation for the double spending allowance problem. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          operator: "The operator to decrease allowance for `msg.sender`",
          subtractedAmount:
            "The amount to decrease by in the operator's allowance.",
        },
      },
      userdoc: {
        notice: "Decrease the allowance of `operator` by -`subtractedAmount`",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function getOperatorsOf(
     *  address tokenOwner
     * )
     *
     * 0xd72fc29a = keccak256('getOperatorsOf(address)')
     */
    "0xd72fc29a": {
      sig: "getOperatorsOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "getOperatorsOf",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns all `operator` addresses that are allowed to transfer or burn on behalf of `tokenOwner`.",
        params: { tokenOwner: "The token owner to get the operators for." },
        returns: {
          _0: "An array of operators allowed to transfer or burn tokens on behalf of `tokenOwner`.",
        },
      },
    },

    /**
     * function increaseAllowance(
     *  address operator,
     *  uint256 addedAmount,
     *  bytes operatorNotificationData
     * )
     *
     * 0x2bc1da82 = keccak256('increaseAllowance(address,uint256,bytes)')
     */
    "0x2bc1da82": {
      sig: "increaseAllowance(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "addedAmount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "increaseAllowance",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Atomically increases the allowance granted to `operator` by the caller. This is an alternative approach to {authorizeOperator} that can be used as a mitigation for the double spending allowance problem. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          addedAmount:
            "The additional amount to add on top of the current operator's allowance",
          operator: "The operator to increase the allowance for `msg.sender`",
        },
      },
      userdoc: {
        notice: "Increase the allowance of `operator` by +`addedAmount`",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function revokeOperator(
     *  address operator,
     *  bool notify,
     *  bytes operatorNotificationData
     * )
     *
     * 0x4521748e = keccak256('revokeOperator(address,bool,bytes)')
     */
    "0x4521748e": {
      sig: "revokeOperator(address,bool,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bool", name: "notify", type: "bool" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "revokeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Removes the `operator` address as an operator of callers tokens, disallowing it to send any amount of tokens on behalf of the token owner (the caller of the function `msg.sender`). See also {authorizedAmountFor}.",
        params: {
          notify: "Boolean indicating whether to notify the operator or not.",
          operator: "The address to revoke as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
        },
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "{DataChanged} event.",
        "custom:requirements": "- SHOULD only be callable by the {owner}.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{DataChanged} event **for each data key/value pair set**.",
        "custom:requirements":
          "- SHOULD only be callable by the {owner} of the contract.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function totalSupply()
     *
     * 0x18160ddd = keccak256('totalSupply()')
     */
    "0x18160ddd": {
      sig: "totalSupply()",
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of existing tokens that have been minted in this contract.",
        returns: { _0: "The number of existing tokens." },
      },
    },

    /**
     * function transfer(
     *  address from,
     *  address to,
     *  uint256 amount,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x760d9bba = keccak256('transfer(address,address,uint256,bool,bytes)')
     */
    "0x760d9bba": {
      sig: "transfer(address,address,uint256,bool,bytes)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "bool", name: "force", type: "bool" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "transfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers an `amount` of tokens from the `from` address to the `to` address and notify both sender and recipients via the LSP1 {`universalReceiver(...)`} function. If the tokens are transferred by an operator on behalf of a token holder, the allowance for the operator will be decreased by `amount` once the token transfer has been completed (See {authorizedAmountFor}).",
        params: {
          amount: "The amount of tokens to transfer.",
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.",
          force:
            "When set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "The sender address.",
          to: "The recipient address.",
        },
      },
    },

    /**
     * function transferBatch(
     *  address[] from,
     *  address[] to,
     *  uint256[] amount,
     *  bool[] force,
     *  bytes[] data
     * )
     *
     * 0x2d7667c9 = keccak256('transferBatch(address[],address[],uint256[],bool[],bytes[])')
     */
    "0x2d7667c9": {
      sig: "transferBatch(address[],address[],uint256[],bool[],bytes[])",
      inputs: [
        { internalType: "address[]", name: "from", type: "address[]" },
        { internalType: "address[]", name: "to", type: "address[]" },
        { internalType: "uint256[]", name: "amount", type: "uint256[]" },
        { internalType: "bool[]", name: "force", type: "bool[]" },
        { internalType: "bytes[]", name: "data", type: "bytes[]" },
      ],
      name: "transferBatch",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Same as {`transfer(...)`} but transfer multiple tokens based on the arrays of `from`, `to`, `amount`.",
        params: {
          amount:
            "An array of amount of tokens to transfer for each `from -> to` transfer.",
          data: "An array of additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.",
          force:
            "For each transfer, when set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "An array of sending addresses.",
          to: "An array of receiving addresses.",
        },
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP7CappedSupply: {
    /**
     * function authorizeOperator(
     *  address operator,
     *  uint256 amount,
     *  bytes operatorNotificationData
     * )
     *
     * 0xb49506fd = keccak256('authorizeOperator(address,uint256,bytes)')
     */
    "0xb49506fd": {
      sig: "authorizeOperator(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "authorizeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:danger":
          "To avoid front-running and Allowance Double-Spend Exploit when increasing or decreasing the authorized amount of an operator, it is advised to use the {increaseAllowance} and {decreaseAllowance} functions. For more information, see: https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/",
        details:
          "Sets an `amount` of tokens that an `operator` has access from the caller's balance (allowance). See {authorizedAmountFor}. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          amount: "The allowance amount of tokens operator has access to.",
          operator: "The address to authorize as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
        },
      },
    },

    /**
     * function authorizedAmountFor(
     *  address operator,
     *  address tokenOwner
     * )
     *
     * 0x65aeaa95 = keccak256('authorizedAmountFor(address,address)')
     */
    "0x65aeaa95": {
      sig: "authorizedAmountFor(address,address)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "authorizedAmountFor",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the amount of tokens `operator` address has access to from `tokenOwner`. Operators can send and burn tokens on behalf of their owners.",
        params: {
          operator:
            "The operator's address to query the authorized amount for.",
          tokenOwner: "The token owner that `operator` has allowance on.",
        },
        returns: {
          _0: "The amount of tokens the `operator`'s address has access on the `tokenOwner`'s balance.",
        },
      },
    },

    /**
     * function balanceOf(
     *  address tokenOwner
     * )
     *
     * 0x70a08231 = keccak256('balanceOf(address)')
     */
    "0x70a08231": {
      sig: "balanceOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the number of tokens owned by `tokenOwner`. If the token is divisible (the {decimals} function returns `18`), the amount returned should be divided by 1e18 to get a better picture of the actual balance of the `tokenOwner`. _Example:_ ``` balanceOf(someAddress) -> 42_000_000_000_000_000_000 / 1e18 = 42 tokens ```",
        params: {
          tokenOwner:
            "The address of the token holder to query the balance for.",
        },
        returns: { _0: "The amount of tokens owned by `tokenOwner`." },
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function decimals()
     *
     * 0x313ce567 = keccak256('decimals()')
     */
    "0x313ce567": {
      sig: "decimals()",
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of decimals used to get its user representation. If the asset contract has been set to be non-divisible via the `isNonDivisible_` parameter in the `constructor`, the decimals returned wiil be `0`. Otherwise `18` is the common value.",
        returns: {
          _0: "the number of decimals. If `0` is returned, the asset is non-divisible.",
        },
      },
    },

    /**
     * function decreaseAllowance(
     *  address operator,
     *  uint256 subtractedAmount,
     *  bytes operatorNotificationData
     * )
     *
     * 0x7b204c4e = keccak256('decreaseAllowance(address,uint256,bytes)')
     */
    "0x7b204c4e": {
      sig: "decreaseAllowance(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "subtractedAmount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "decreaseAllowance",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Atomically decreases the allowance granted to `operator` by the caller. This is an alternative approach to {authorizeOperator} that can be used as a mitigation for the double spending allowance problem. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          operator: "The operator to decrease allowance for `msg.sender`",
          subtractedAmount:
            "The amount to decrease by in the operator's allowance.",
        },
      },
      userdoc: {
        notice: "Decrease the allowance of `operator` by -`subtractedAmount`",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function getOperatorsOf(
     *  address tokenOwner
     * )
     *
     * 0xd72fc29a = keccak256('getOperatorsOf(address)')
     */
    "0xd72fc29a": {
      sig: "getOperatorsOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "getOperatorsOf",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns all `operator` addresses that are allowed to transfer or burn on behalf of `tokenOwner`.",
        params: { tokenOwner: "The token owner to get the operators for." },
        returns: {
          _0: "An array of operators allowed to transfer or burn tokens on behalf of `tokenOwner`.",
        },
      },
    },

    /**
     * function increaseAllowance(
     *  address operator,
     *  uint256 addedAmount,
     *  bytes operatorNotificationData
     * )
     *
     * 0x2bc1da82 = keccak256('increaseAllowance(address,uint256,bytes)')
     */
    "0x2bc1da82": {
      sig: "increaseAllowance(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "addedAmount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "increaseAllowance",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Atomically increases the allowance granted to `operator` by the caller. This is an alternative approach to {authorizeOperator} that can be used as a mitigation for the double spending allowance problem. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          addedAmount:
            "The additional amount to add on top of the current operator's allowance",
          operator: "The operator to increase the allowance for `msg.sender`",
        },
      },
      userdoc: {
        notice: "Increase the allowance of `operator` by +`addedAmount`",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function revokeOperator(
     *  address operator,
     *  bool notify,
     *  bytes operatorNotificationData
     * )
     *
     * 0x4521748e = keccak256('revokeOperator(address,bool,bytes)')
     */
    "0x4521748e": {
      sig: "revokeOperator(address,bool,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bool", name: "notify", type: "bool" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "revokeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Removes the `operator` address as an operator of callers tokens, disallowing it to send any amount of tokens on behalf of the token owner (the caller of the function `msg.sender`). See also {authorizedAmountFor}.",
        params: {
          notify: "Boolean indicating whether to notify the operator or not.",
          operator: "The address to revoke as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
        },
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "{DataChanged} event.",
        "custom:requirements": "- SHOULD only be callable by the {owner}.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{DataChanged} event **for each data key/value pair set**.",
        "custom:requirements":
          "- SHOULD only be callable by the {owner} of the contract.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.",
      },
    },

    /**
     * function tokenSupplyCap()
     *
     * 0x52058d8a = keccak256('tokenSupplyCap()')
     */
    "0x52058d8a": {
      sig: "tokenSupplyCap()",
      inputs: [],
      name: "tokenSupplyCap",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the maximum number of tokens that can exist to circulate. Once {totalSupply} reaches reaches {totalSuuplyCap}, it is not possible to mint more tokens.",
        returns: {
          _0: "The maximum number of tokens that can exist in the contract.",
        },
      },
      userdoc: {
        notice:
          "The maximum supply amount of tokens allowed to exist is `_TOKEN_SUPPLY_CAP`.",
      },
    },

    /**
     * function totalSupply()
     *
     * 0x18160ddd = keccak256('totalSupply()')
     */
    "0x18160ddd": {
      sig: "totalSupply()",
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of existing tokens that have been minted in this contract.",
        returns: { _0: "The number of existing tokens." },
      },
    },

    /**
     * function transfer(
     *  address from,
     *  address to,
     *  uint256 amount,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x760d9bba = keccak256('transfer(address,address,uint256,bool,bytes)')
     */
    "0x760d9bba": {
      sig: "transfer(address,address,uint256,bool,bytes)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "bool", name: "force", type: "bool" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "transfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers an `amount` of tokens from the `from` address to the `to` address and notify both sender and recipients via the LSP1 {`universalReceiver(...)`} function. If the tokens are transferred by an operator on behalf of a token holder, the allowance for the operator will be decreased by `amount` once the token transfer has been completed (See {authorizedAmountFor}).",
        params: {
          amount: "The amount of tokens to transfer.",
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.",
          force:
            "When set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "The sender address.",
          to: "The recipient address.",
        },
      },
    },

    /**
     * function transferBatch(
     *  address[] from,
     *  address[] to,
     *  uint256[] amount,
     *  bool[] force,
     *  bytes[] data
     * )
     *
     * 0x2d7667c9 = keccak256('transferBatch(address[],address[],uint256[],bool[],bytes[])')
     */
    "0x2d7667c9": {
      sig: "transferBatch(address[],address[],uint256[],bool[],bytes[])",
      inputs: [
        { internalType: "address[]", name: "from", type: "address[]" },
        { internalType: "address[]", name: "to", type: "address[]" },
        { internalType: "uint256[]", name: "amount", type: "uint256[]" },
        { internalType: "bool[]", name: "force", type: "bool[]" },
        { internalType: "bytes[]", name: "data", type: "bytes[]" },
      ],
      name: "transferBatch",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Same as {`transfer(...)`} but transfer multiple tokens based on the arrays of `from`, `to`, `amount`.",
        params: {
          amount:
            "An array of amount of tokens to transfer for each `from -> to` transfer.",
          data: "An array of additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.",
          force:
            "For each transfer, when set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "An array of sending addresses.",
          to: "An array of receiving addresses.",
        },
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP7CappedSupplyInitAbstract: {
    /**
     * function authorizeOperator(
     *  address operator,
     *  uint256 amount,
     *  bytes operatorNotificationData
     * )
     *
     * 0xb49506fd = keccak256('authorizeOperator(address,uint256,bytes)')
     */
    "0xb49506fd": {
      sig: "authorizeOperator(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "authorizeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:danger":
          "To avoid front-running and Allowance Double-Spend Exploit when increasing or decreasing the authorized amount of an operator, it is advised to use the {increaseAllowance} and {decreaseAllowance} functions. For more information, see: https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/",
        details:
          "Sets an `amount` of tokens that an `operator` has access from the caller's balance (allowance). See {authorizedAmountFor}. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          amount: "The allowance amount of tokens operator has access to.",
          operator: "The address to authorize as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
        },
      },
    },

    /**
     * function authorizedAmountFor(
     *  address operator,
     *  address tokenOwner
     * )
     *
     * 0x65aeaa95 = keccak256('authorizedAmountFor(address,address)')
     */
    "0x65aeaa95": {
      sig: "authorizedAmountFor(address,address)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "authorizedAmountFor",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the amount of tokens `operator` address has access to from `tokenOwner`. Operators can send and burn tokens on behalf of their owners.",
        params: {
          operator:
            "The operator's address to query the authorized amount for.",
          tokenOwner: "The token owner that `operator` has allowance on.",
        },
        returns: {
          _0: "The amount of tokens the `operator`'s address has access on the `tokenOwner`'s balance.",
        },
      },
    },

    /**
     * function balanceOf(
     *  address tokenOwner
     * )
     *
     * 0x70a08231 = keccak256('balanceOf(address)')
     */
    "0x70a08231": {
      sig: "balanceOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the number of tokens owned by `tokenOwner`. If the token is divisible (the {decimals} function returns `18`), the amount returned should be divided by 1e18 to get a better picture of the actual balance of the `tokenOwner`. _Example:_ ``` balanceOf(someAddress) -> 42_000_000_000_000_000_000 / 1e18 = 42 tokens ```",
        params: {
          tokenOwner:
            "The address of the token holder to query the balance for.",
        },
        returns: { _0: "The amount of tokens owned by `tokenOwner`." },
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function decimals()
     *
     * 0x313ce567 = keccak256('decimals()')
     */
    "0x313ce567": {
      sig: "decimals()",
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of decimals used to get its user representation. If the asset contract has been set to be non-divisible via the `isNonDivisible_` parameter in the `constructor`, the decimals returned wiil be `0`. Otherwise `18` is the common value.",
        returns: {
          _0: "the number of decimals. If `0` is returned, the asset is non-divisible.",
        },
      },
    },

    /**
     * function decreaseAllowance(
     *  address operator,
     *  uint256 subtractedAmount,
     *  bytes operatorNotificationData
     * )
     *
     * 0x7b204c4e = keccak256('decreaseAllowance(address,uint256,bytes)')
     */
    "0x7b204c4e": {
      sig: "decreaseAllowance(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "subtractedAmount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "decreaseAllowance",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Atomically decreases the allowance granted to `operator` by the caller. This is an alternative approach to {authorizeOperator} that can be used as a mitigation for the double spending allowance problem. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          operator: "The operator to decrease allowance for `msg.sender`",
          subtractedAmount:
            "The amount to decrease by in the operator's allowance.",
        },
      },
      userdoc: {
        notice: "Decrease the allowance of `operator` by -`subtractedAmount`",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function getOperatorsOf(
     *  address tokenOwner
     * )
     *
     * 0xd72fc29a = keccak256('getOperatorsOf(address)')
     */
    "0xd72fc29a": {
      sig: "getOperatorsOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "getOperatorsOf",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns all `operator` addresses that are allowed to transfer or burn on behalf of `tokenOwner`.",
        params: { tokenOwner: "The token owner to get the operators for." },
        returns: {
          _0: "An array of operators allowed to transfer or burn tokens on behalf of `tokenOwner`.",
        },
      },
    },

    /**
     * function increaseAllowance(
     *  address operator,
     *  uint256 addedAmount,
     *  bytes operatorNotificationData
     * )
     *
     * 0x2bc1da82 = keccak256('increaseAllowance(address,uint256,bytes)')
     */
    "0x2bc1da82": {
      sig: "increaseAllowance(address,uint256,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "uint256", name: "addedAmount", type: "uint256" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "increaseAllowance",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Atomically increases the allowance granted to `operator` by the caller. This is an alternative approach to {authorizeOperator} that can be used as a mitigation for the double spending allowance problem. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          addedAmount:
            "The additional amount to add on top of the current operator's allowance",
          operator: "The operator to increase the allowance for `msg.sender`",
        },
      },
      userdoc: {
        notice: "Increase the allowance of `operator` by +`addedAmount`",
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function revokeOperator(
     *  address operator,
     *  bool notify,
     *  bytes operatorNotificationData
     * )
     *
     * 0x4521748e = keccak256('revokeOperator(address,bool,bytes)')
     */
    "0x4521748e": {
      sig: "revokeOperator(address,bool,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bool", name: "notify", type: "bool" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "revokeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Removes the `operator` address as an operator of callers tokens, disallowing it to send any amount of tokens on behalf of the token owner (the caller of the function `msg.sender`). See also {authorizedAmountFor}.",
        params: {
          notify: "Boolean indicating whether to notify the operator or not.",
          operator: "The address to revoke as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
        },
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "{DataChanged} event.",
        "custom:requirements": "- SHOULD only be callable by the {owner}.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{DataChanged} event **for each data key/value pair set**.",
        "custom:requirements":
          "- SHOULD only be callable by the {owner} of the contract.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function tokenSupplyCap()
     *
     * 0x52058d8a = keccak256('tokenSupplyCap()')
     */
    "0x52058d8a": {
      sig: "tokenSupplyCap()",
      inputs: [],
      name: "tokenSupplyCap",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the maximum number of tokens that can exist to circulate. Once {totalSupply} reaches reaches {totalSuuplyCap}, it is not possible to mint more tokens.",
        returns: {
          _0: "The maximum number of tokens that can exist in the contract.",
        },
      },
      userdoc: {
        notice:
          "The maximum supply amount of tokens allowed to exist is `_tokenSupplyCap`.",
      },
    },

    /**
     * function totalSupply()
     *
     * 0x18160ddd = keccak256('totalSupply()')
     */
    "0x18160ddd": {
      sig: "totalSupply()",
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of existing tokens that have been minted in this contract.",
        returns: { _0: "The number of existing tokens." },
      },
    },

    /**
     * function transfer(
     *  address from,
     *  address to,
     *  uint256 amount,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x760d9bba = keccak256('transfer(address,address,uint256,bool,bytes)')
     */
    "0x760d9bba": {
      sig: "transfer(address,address,uint256,bool,bytes)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "bool", name: "force", type: "bool" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "transfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers an `amount` of tokens from the `from` address to the `to` address and notify both sender and recipients via the LSP1 {`universalReceiver(...)`} function. If the tokens are transferred by an operator on behalf of a token holder, the allowance for the operator will be decreased by `amount` once the token transfer has been completed (See {authorizedAmountFor}).",
        params: {
          amount: "The amount of tokens to transfer.",
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.",
          force:
            "When set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "The sender address.",
          to: "The recipient address.",
        },
      },
    },

    /**
     * function transferBatch(
     *  address[] from,
     *  address[] to,
     *  uint256[] amount,
     *  bool[] force,
     *  bytes[] data
     * )
     *
     * 0x2d7667c9 = keccak256('transferBatch(address[],address[],uint256[],bool[],bytes[])')
     */
    "0x2d7667c9": {
      sig: "transferBatch(address[],address[],uint256[],bool[],bytes[])",
      inputs: [
        { internalType: "address[]", name: "from", type: "address[]" },
        { internalType: "address[]", name: "to", type: "address[]" },
        { internalType: "uint256[]", name: "amount", type: "uint256[]" },
        { internalType: "bool[]", name: "force", type: "bool[]" },
        { internalType: "bytes[]", name: "data", type: "bytes[]" },
      ],
      name: "transferBatch",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Same as {`transfer(...)`} but transfer multiple tokens based on the arrays of `from`, `to`, `amount`.",
        params: {
          amount:
            "An array of amount of tokens to transfer for each `from -> to` transfer.",
          data: "An array of additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.",
          force:
            "For each transfer, when set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "An array of sending addresses.",
          to: "An array of receiving addresses.",
        },
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP8IdentifiableDigitalAsset: {
    /**
     * function authorizeOperator(
     *  address operator,
     *  bytes32 tokenId,
     *  bytes operatorNotificationData
     * )
     *
     * 0x86a10ddd = keccak256('authorizeOperator(address,bytes32,bytes)')
     */
    "0x86a10ddd": {
      sig: "authorizeOperator(address,bytes32,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "authorizeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Allow an `operator` address to transfer or burn a specific `tokenId` on behalf of its token owner. See {isOperatorFor}. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          operator: "The address to authorize as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
          tokenId: "The token ID operator has access to.",
        },
      },
    },

    /**
     * function balanceOf(
     *  address tokenOwner
     * )
     *
     * 0x70a08231 = keccak256('balanceOf(address)')
     */
    "0x70a08231": {
      sig: "balanceOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details: "Get the number of token IDs owned by `tokenOwner`.",
        params: { tokenOwner: "The address to query     *" },
        returns: {
          _0: "The total number of token IDs that `tokenOwner` owns.",
        },
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function getDataBatchForTokenIds(
     *  bytes32[] tokenIds,
     *  bytes32[] dataKeys
     * )
     *
     * 0x1d26fce6 = keccak256('getDataBatchForTokenIds(bytes32[],bytes32[])')
     */
    "0x1d26fce6": {
      sig: "getDataBatchForTokenIds(bytes32[],bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "tokenIds", type: "bytes32[]" },
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatchForTokenIds",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        params: {
          dataKeys: "An array of data keys corresponding to the token IDs.",
          tokenIds: "An array of token IDs.",
        },
        returns: {
          dataValues:
            "An array of data values for each pair of `tokenId` and `dataKey`.",
        },
      },
      userdoc: {
        notice:
          "Retrieves data in batch for multiple `tokenId` and `dataKey` pairs.",
      },
    },

    /**
     * function getDataForTokenId(
     *  bytes32 tokenId,
     *  bytes32 dataKey
     * )
     *
     * 0x16e023b3 = keccak256('getDataForTokenId(bytes32,bytes32)')
     */
    "0x16e023b3": {
      sig: "getDataForTokenId(bytes32,bytes32)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
      ],
      name: "getDataForTokenId",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        params: {
          dataKey: "The key for the data to retrieve.",
          tokenId: "The unique identifier for a token.",
        },
        returns: {
          dataValue:
            "The data value associated with the given `tokenId` and `dataKey`.",
        },
      },
      userdoc: {
        notice: "Retrieves data for a specific `tokenId` and `dataKey`.",
      },
    },

    /**
     * function getOperatorsOf(
     *  bytes32 tokenId
     * )
     *
     * 0x49a6078d = keccak256('getOperatorsOf(bytes32)')
     */
    "0x49a6078d": {
      sig: "getOperatorsOf(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "getOperatorsOf",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns all `operator` addresses that are allowed to transfer or burn a specific `tokenId` on behalf of its owner.",
        params: { tokenId: "The token ID to get the operators for." },
        returns: {
          _0: "An array of operators allowed to transfer or burn a specific `tokenId`. Requirements - `tokenId` must exist.",
        },
      },
    },

    /**
     * function isOperatorFor(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0x2a3654a4 = keccak256('isOperatorFor(address,bytes32)')
     */
    "0x2a3654a4": {
      sig: "isOperatorFor(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "isOperatorFor",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns whether `operator` address is an operator for a given `tokenId`.",
        params: {
          operator: "The address to query operator status for.",
          tokenId:
            "The token ID to check if `operator` is allowed to operate on.",
        },
        returns: {
          _0: "`true` if `operator` is an operator for `tokenId`, `false` otherwise.",
        },
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function revokeOperator(
     *  address operator,
     *  bytes32 tokenId,
     *  bool notify,
     *  bytes operatorNotificationData
     * )
     *
     * 0xdb8c9663 = keccak256('revokeOperator(address,bytes32,bool,bytes)')
     */
    "0xdb8c9663": {
      sig: "revokeOperator(address,bytes32,bool,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bool", name: "notify", type: "bool" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "revokeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Remove access of `operator` for a given `tokenId`, disallowing it to transfer `tokenId` on behalf of its owner. See also {isOperatorFor}.",
        params: {
          notify: "Boolean indicating whether to notify the operator or not",
          operator: "The address to revoke as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
          tokenId: "The tokenId `operator` is revoked from operating on.",
        },
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "{DataChanged} event.",
        "custom:requirements": "- SHOULD only be callable by the {owner}.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{DataChanged} event **for each data key/value pair set**.",
        "custom:requirements":
          "- SHOULD only be callable by the {owner} of the contract.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function setDataBatchForTokenIds(
     *  bytes32[] tokenIds,
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0xbe9f0e6f = keccak256('setDataBatchForTokenIds(bytes32[],bytes32[],bytes[])')
     */
    "0xbe9f0e6f": {
      sig: "setDataBatchForTokenIds(bytes32[],bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "tokenIds", type: "bytes32[]" },
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatchForTokenIds",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          dataKeys: "An array of data keys corresponding to the token IDs.",
          dataValues: "An array of values to set for the given data keys.",
          tokenIds: "An array of token IDs.",
        },
      },
      userdoc: {
        notice:
          "Sets data in batch for multiple `tokenId` and `dataKey` pairs.",
      },
    },

    /**
     * function setDataForTokenId(
     *  bytes32 tokenId,
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0xd6c1407c = keccak256('setDataForTokenId(bytes32,bytes32,bytes)')
     */
    "0xd6c1407c": {
      sig: "setDataForTokenId(bytes32,bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setDataForTokenId",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          dataKey: "The key for the data to set.",
          dataValue: "The value to set for the given data key.",
          tokenId: "The unique identifier for a token.",
        },
      },
      userdoc: { notice: "Sets data for a specific `tokenId` and `dataKey`." },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.",
      },
    },

    /**
     * function tokenIdsOf(
     *  address tokenOwner
     * )
     *
     * 0xa3b261f2 = keccak256('tokenIdsOf(address)')
     */
    "0xa3b261f2": {
      sig: "tokenIdsOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "tokenIdsOf",
      outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the list of token IDs that the `tokenOwner` address owns.",
        params: {
          tokenOwner:
            "The address that we want to get the list of token IDs for.",
        },
        returns: {
          _0: "An array of `bytes32[] tokenIds` owned by `tokenOwner`.",
        },
      },
    },

    /**
     * function tokenOwnerOf(
     *  bytes32 tokenId
     * )
     *
     * 0x217b2270 = keccak256('tokenOwnerOf(bytes32)')
     */
    "0x217b2270": {
      sig: "tokenOwnerOf(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "tokenOwnerOf",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details: "Returns the list of `tokenIds` for the `tokenOwner` address.",
        params: { tokenId: "tokenOwner The address to query owned tokens" },
        returns: { _0: "The owner address of the given `tokenId`." },
      },
    },

    /**
     * function totalSupply()
     *
     * 0x18160ddd = keccak256('totalSupply()')
     */
    "0x18160ddd": {
      sig: "totalSupply()",
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of existing tokens that have been minted in this contract.",
        returns: { _0: "The number of existing tokens." },
      },
    },

    /**
     * function transfer(
     *  address from,
     *  address to,
     *  bytes32 tokenId,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x511b6952 = keccak256('transfer(address,address,bytes32,bool,bytes)')
     */
    "0x511b6952": {
      sig: "transfer(address,address,bytes32,bool,bytes)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bool", name: "force", type: "bool" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "transfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfer a given `tokenId` token from the `from` address to the `to` address. If operators are set for a specific `tokenId`, all the operators are revoked after the tokenId have been transferred. The `force` parameter MUST be set to `true` when transferring tokens to Externally Owned Accounts (EOAs) or contracts that do not implement the LSP1 standard.",
        params: {
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.",
          force:
            "When set to `true`, the `to` address CAN be any addres. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "The address that owns the given `tokenId`.",
          to: "The address that will receive the `tokenId`.",
          tokenId: "The token ID to transfer.",
        },
      },
    },

    /**
     * function transferBatch(
     *  address[] from,
     *  address[] to,
     *  bytes32[] tokenId,
     *  bool[] force,
     *  bytes[] data
     * )
     *
     * 0x7e87632c = keccak256('transferBatch(address[],address[],bytes32[],bool[],bytes[])')
     */
    "0x7e87632c": {
      sig: "transferBatch(address[],address[],bytes32[],bool[],bytes[])",
      inputs: [
        { internalType: "address[]", name: "from", type: "address[]" },
        { internalType: "address[]", name: "to", type: "address[]" },
        { internalType: "bytes32[]", name: "tokenId", type: "bytes32[]" },
        { internalType: "bool[]", name: "force", type: "bool[]" },
        { internalType: "bytes[]", name: "data", type: "bytes[]" },
      ],
      name: "transferBatch",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers multiple tokens at once based on the arrays of `from`, `to` and `tokenId`. If any transfer fails, the whole call will revert.",
        params: {
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks to the `from` and `to` addresses.",
          force:
            "When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard and not revert.",
          from: "An array of sending addresses.",
          to: "An array of recipient addresses.",
          tokenId: "An array of token IDs to transfer.",
        },
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP8IdentifiableDigitalAssetInitAbstract: {
    /**
     * function authorizeOperator(
     *  address operator,
     *  bytes32 tokenId,
     *  bytes operatorNotificationData
     * )
     *
     * 0x86a10ddd = keccak256('authorizeOperator(address,bytes32,bytes)')
     */
    "0x86a10ddd": {
      sig: "authorizeOperator(address,bytes32,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "authorizeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Allow an `operator` address to transfer or burn a specific `tokenId` on behalf of its token owner. See {isOperatorFor}. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          operator: "The address to authorize as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
          tokenId: "The token ID operator has access to.",
        },
      },
    },

    /**
     * function balanceOf(
     *  address tokenOwner
     * )
     *
     * 0x70a08231 = keccak256('balanceOf(address)')
     */
    "0x70a08231": {
      sig: "balanceOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details: "Get the number of token IDs owned by `tokenOwner`.",
        params: { tokenOwner: "The address to query     *" },
        returns: {
          _0: "The total number of token IDs that `tokenOwner` owns.",
        },
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function getDataBatchForTokenIds(
     *  bytes32[] tokenIds,
     *  bytes32[] dataKeys
     * )
     *
     * 0x1d26fce6 = keccak256('getDataBatchForTokenIds(bytes32[],bytes32[])')
     */
    "0x1d26fce6": {
      sig: "getDataBatchForTokenIds(bytes32[],bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "tokenIds", type: "bytes32[]" },
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatchForTokenIds",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        params: {
          dataKeys: "An array of data keys corresponding to the token IDs.",
          tokenIds: "An array of token IDs.",
        },
        returns: {
          dataValues:
            "An array of data values for each pair of `tokenId` and `dataKey`.",
        },
      },
      userdoc: {
        notice:
          "Retrieves data in batch for multiple `tokenId` and `dataKey` pairs.",
      },
    },

    /**
     * function getDataForTokenId(
     *  bytes32 tokenId,
     *  bytes32 dataKey
     * )
     *
     * 0x16e023b3 = keccak256('getDataForTokenId(bytes32,bytes32)')
     */
    "0x16e023b3": {
      sig: "getDataForTokenId(bytes32,bytes32)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
      ],
      name: "getDataForTokenId",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        params: {
          dataKey: "The key for the data to retrieve.",
          tokenId: "The unique identifier for a token.",
        },
        returns: {
          dataValue:
            "The data value associated with the given `tokenId` and `dataKey`.",
        },
      },
      userdoc: {
        notice: "Retrieves data for a specific `tokenId` and `dataKey`.",
      },
    },

    /**
     * function getOperatorsOf(
     *  bytes32 tokenId
     * )
     *
     * 0x49a6078d = keccak256('getOperatorsOf(bytes32)')
     */
    "0x49a6078d": {
      sig: "getOperatorsOf(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "getOperatorsOf",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns all `operator` addresses that are allowed to transfer or burn a specific `tokenId` on behalf of its owner.",
        params: { tokenId: "The token ID to get the operators for." },
        returns: {
          _0: "An array of operators allowed to transfer or burn a specific `tokenId`. Requirements - `tokenId` must exist.",
        },
      },
    },

    /**
     * function isOperatorFor(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0x2a3654a4 = keccak256('isOperatorFor(address,bytes32)')
     */
    "0x2a3654a4": {
      sig: "isOperatorFor(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "isOperatorFor",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns whether `operator` address is an operator for a given `tokenId`.",
        params: {
          operator: "The address to query operator status for.",
          tokenId:
            "The token ID to check if `operator` is allowed to operate on.",
        },
        returns: {
          _0: "`true` if `operator` is an operator for `tokenId`, `false` otherwise.",
        },
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function revokeOperator(
     *  address operator,
     *  bytes32 tokenId,
     *  bool notify,
     *  bytes operatorNotificationData
     * )
     *
     * 0xdb8c9663 = keccak256('revokeOperator(address,bytes32,bool,bytes)')
     */
    "0xdb8c9663": {
      sig: "revokeOperator(address,bytes32,bool,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bool", name: "notify", type: "bool" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "revokeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Remove access of `operator` for a given `tokenId`, disallowing it to transfer `tokenId` on behalf of its owner. See also {isOperatorFor}.",
        params: {
          notify: "Boolean indicating whether to notify the operator or not",
          operator: "The address to revoke as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
          tokenId: "The tokenId `operator` is revoked from operating on.",
        },
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "{DataChanged} event.",
        "custom:requirements": "- SHOULD only be callable by the {owner}.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{DataChanged} event **for each data key/value pair set**.",
        "custom:requirements":
          "- SHOULD only be callable by the {owner} of the contract.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function setDataBatchForTokenIds(
     *  bytes32[] tokenIds,
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0xbe9f0e6f = keccak256('setDataBatchForTokenIds(bytes32[],bytes32[],bytes[])')
     */
    "0xbe9f0e6f": {
      sig: "setDataBatchForTokenIds(bytes32[],bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "tokenIds", type: "bytes32[]" },
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatchForTokenIds",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          dataKeys: "An array of data keys corresponding to the token IDs.",
          dataValues: "An array of values to set for the given data keys.",
          tokenIds: "An array of token IDs.",
        },
      },
      userdoc: {
        notice:
          "Sets data in batch for multiple `tokenId` and `dataKey` pairs.",
      },
    },

    /**
     * function setDataForTokenId(
     *  bytes32 tokenId,
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0xd6c1407c = keccak256('setDataForTokenId(bytes32,bytes32,bytes)')
     */
    "0xd6c1407c": {
      sig: "setDataForTokenId(bytes32,bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setDataForTokenId",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          dataKey: "The key for the data to set.",
          dataValue: "The value to set for the given data key.",
          tokenId: "The unique identifier for a token.",
        },
      },
      userdoc: { notice: "Sets data for a specific `tokenId` and `dataKey`." },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function tokenIdsOf(
     *  address tokenOwner
     * )
     *
     * 0xa3b261f2 = keccak256('tokenIdsOf(address)')
     */
    "0xa3b261f2": {
      sig: "tokenIdsOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "tokenIdsOf",
      outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the list of token IDs that the `tokenOwner` address owns.",
        params: {
          tokenOwner:
            "The address that we want to get the list of token IDs for.",
        },
        returns: {
          _0: "An array of `bytes32[] tokenIds` owned by `tokenOwner`.",
        },
      },
    },

    /**
     * function tokenOwnerOf(
     *  bytes32 tokenId
     * )
     *
     * 0x217b2270 = keccak256('tokenOwnerOf(bytes32)')
     */
    "0x217b2270": {
      sig: "tokenOwnerOf(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "tokenOwnerOf",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details: "Returns the list of `tokenIds` for the `tokenOwner` address.",
        params: { tokenId: "tokenOwner The address to query owned tokens" },
        returns: { _0: "The owner address of the given `tokenId`." },
      },
    },

    /**
     * function totalSupply()
     *
     * 0x18160ddd = keccak256('totalSupply()')
     */
    "0x18160ddd": {
      sig: "totalSupply()",
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of existing tokens that have been minted in this contract.",
        returns: { _0: "The number of existing tokens." },
      },
    },

    /**
     * function transfer(
     *  address from,
     *  address to,
     *  bytes32 tokenId,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x511b6952 = keccak256('transfer(address,address,bytes32,bool,bytes)')
     */
    "0x511b6952": {
      sig: "transfer(address,address,bytes32,bool,bytes)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bool", name: "force", type: "bool" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "transfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfer a given `tokenId` token from the `from` address to the `to` address. If operators are set for a specific `tokenId`, all the operators are revoked after the tokenId have been transferred. The `force` parameter MUST be set to `true` when transferring tokens to Externally Owned Accounts (EOAs) or contracts that do not implement the LSP1 standard.",
        params: {
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.",
          force:
            "When set to `true`, the `to` address CAN be any addres. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "The address that owns the given `tokenId`.",
          to: "The address that will receive the `tokenId`.",
          tokenId: "The token ID to transfer.",
        },
      },
    },

    /**
     * function transferBatch(
     *  address[] from,
     *  address[] to,
     *  bytes32[] tokenId,
     *  bool[] force,
     *  bytes[] data
     * )
     *
     * 0x7e87632c = keccak256('transferBatch(address[],address[],bytes32[],bool[],bytes[])')
     */
    "0x7e87632c": {
      sig: "transferBatch(address[],address[],bytes32[],bool[],bytes[])",
      inputs: [
        { internalType: "address[]", name: "from", type: "address[]" },
        { internalType: "address[]", name: "to", type: "address[]" },
        { internalType: "bytes32[]", name: "tokenId", type: "bytes32[]" },
        { internalType: "bool[]", name: "force", type: "bool[]" },
        { internalType: "bytes[]", name: "data", type: "bytes[]" },
      ],
      name: "transferBatch",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers multiple tokens at once based on the arrays of `from`, `to` and `tokenId`. If any transfer fails, the whole call will revert.",
        params: {
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks to the `from` and `to` addresses.",
          force:
            "When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard and not revert.",
          from: "An array of sending addresses.",
          to: "An array of recipient addresses.",
          tokenId: "An array of token IDs to transfer.",
        },
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP8CappedSupply: {
    /**
     * function authorizeOperator(
     *  address operator,
     *  bytes32 tokenId,
     *  bytes operatorNotificationData
     * )
     *
     * 0x86a10ddd = keccak256('authorizeOperator(address,bytes32,bytes)')
     */
    "0x86a10ddd": {
      sig: "authorizeOperator(address,bytes32,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "authorizeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Allow an `operator` address to transfer or burn a specific `tokenId` on behalf of its token owner. See {isOperatorFor}. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          operator: "The address to authorize as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
          tokenId: "The token ID operator has access to.",
        },
      },
    },

    /**
     * function balanceOf(
     *  address tokenOwner
     * )
     *
     * 0x70a08231 = keccak256('balanceOf(address)')
     */
    "0x70a08231": {
      sig: "balanceOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details: "Get the number of token IDs owned by `tokenOwner`.",
        params: { tokenOwner: "The address to query     *" },
        returns: {
          _0: "The total number of token IDs that `tokenOwner` owns.",
        },
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function getDataBatchForTokenIds(
     *  bytes32[] tokenIds,
     *  bytes32[] dataKeys
     * )
     *
     * 0x1d26fce6 = keccak256('getDataBatchForTokenIds(bytes32[],bytes32[])')
     */
    "0x1d26fce6": {
      sig: "getDataBatchForTokenIds(bytes32[],bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "tokenIds", type: "bytes32[]" },
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatchForTokenIds",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        params: {
          dataKeys: "An array of data keys corresponding to the token IDs.",
          tokenIds: "An array of token IDs.",
        },
        returns: {
          dataValues:
            "An array of data values for each pair of `tokenId` and `dataKey`.",
        },
      },
      userdoc: {
        notice:
          "Retrieves data in batch for multiple `tokenId` and `dataKey` pairs.",
      },
    },

    /**
     * function getDataForTokenId(
     *  bytes32 tokenId,
     *  bytes32 dataKey
     * )
     *
     * 0x16e023b3 = keccak256('getDataForTokenId(bytes32,bytes32)')
     */
    "0x16e023b3": {
      sig: "getDataForTokenId(bytes32,bytes32)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
      ],
      name: "getDataForTokenId",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        params: {
          dataKey: "The key for the data to retrieve.",
          tokenId: "The unique identifier for a token.",
        },
        returns: {
          dataValue:
            "The data value associated with the given `tokenId` and `dataKey`.",
        },
      },
      userdoc: {
        notice: "Retrieves data for a specific `tokenId` and `dataKey`.",
      },
    },

    /**
     * function getOperatorsOf(
     *  bytes32 tokenId
     * )
     *
     * 0x49a6078d = keccak256('getOperatorsOf(bytes32)')
     */
    "0x49a6078d": {
      sig: "getOperatorsOf(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "getOperatorsOf",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns all `operator` addresses that are allowed to transfer or burn a specific `tokenId` on behalf of its owner.",
        params: { tokenId: "The token ID to get the operators for." },
        returns: {
          _0: "An array of operators allowed to transfer or burn a specific `tokenId`. Requirements - `tokenId` must exist.",
        },
      },
    },

    /**
     * function isOperatorFor(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0x2a3654a4 = keccak256('isOperatorFor(address,bytes32)')
     */
    "0x2a3654a4": {
      sig: "isOperatorFor(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "isOperatorFor",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns whether `operator` address is an operator for a given `tokenId`.",
        params: {
          operator: "The address to query operator status for.",
          tokenId:
            "The token ID to check if `operator` is allowed to operate on.",
        },
        returns: {
          _0: "`true` if `operator` is an operator for `tokenId`, `false` otherwise.",
        },
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function revokeOperator(
     *  address operator,
     *  bytes32 tokenId,
     *  bool notify,
     *  bytes operatorNotificationData
     * )
     *
     * 0xdb8c9663 = keccak256('revokeOperator(address,bytes32,bool,bytes)')
     */
    "0xdb8c9663": {
      sig: "revokeOperator(address,bytes32,bool,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bool", name: "notify", type: "bool" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "revokeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Remove access of `operator` for a given `tokenId`, disallowing it to transfer `tokenId` on behalf of its owner. See also {isOperatorFor}.",
        params: {
          notify: "Boolean indicating whether to notify the operator or not",
          operator: "The address to revoke as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
          tokenId: "The tokenId `operator` is revoked from operating on.",
        },
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "{DataChanged} event.",
        "custom:requirements": "- SHOULD only be callable by the {owner}.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{DataChanged} event **for each data key/value pair set**.",
        "custom:requirements":
          "- SHOULD only be callable by the {owner} of the contract.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function setDataBatchForTokenIds(
     *  bytes32[] tokenIds,
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0xbe9f0e6f = keccak256('setDataBatchForTokenIds(bytes32[],bytes32[],bytes[])')
     */
    "0xbe9f0e6f": {
      sig: "setDataBatchForTokenIds(bytes32[],bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "tokenIds", type: "bytes32[]" },
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatchForTokenIds",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          dataKeys: "An array of data keys corresponding to the token IDs.",
          dataValues: "An array of values to set for the given data keys.",
          tokenIds: "An array of token IDs.",
        },
      },
      userdoc: {
        notice:
          "Sets data in batch for multiple `tokenId` and `dataKey` pairs.",
      },
    },

    /**
     * function setDataForTokenId(
     *  bytes32 tokenId,
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0xd6c1407c = keccak256('setDataForTokenId(bytes32,bytes32,bytes)')
     */
    "0xd6c1407c": {
      sig: "setDataForTokenId(bytes32,bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setDataForTokenId",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          dataKey: "The key for the data to set.",
          dataValue: "The value to set for the given data key.",
          tokenId: "The unique identifier for a token.",
        },
      },
      userdoc: { notice: "Sets data for a specific `tokenId` and `dataKey`." },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.",
      },
    },

    /**
     * function tokenIdsOf(
     *  address tokenOwner
     * )
     *
     * 0xa3b261f2 = keccak256('tokenIdsOf(address)')
     */
    "0xa3b261f2": {
      sig: "tokenIdsOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "tokenIdsOf",
      outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the list of token IDs that the `tokenOwner` address owns.",
        params: {
          tokenOwner:
            "The address that we want to get the list of token IDs for.",
        },
        returns: {
          _0: "An array of `bytes32[] tokenIds` owned by `tokenOwner`.",
        },
      },
    },

    /**
     * function tokenOwnerOf(
     *  bytes32 tokenId
     * )
     *
     * 0x217b2270 = keccak256('tokenOwnerOf(bytes32)')
     */
    "0x217b2270": {
      sig: "tokenOwnerOf(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "tokenOwnerOf",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details: "Returns the list of `tokenIds` for the `tokenOwner` address.",
        params: { tokenId: "tokenOwner The address to query owned tokens" },
        returns: { _0: "The owner address of the given `tokenId`." },
      },
    },

    /**
     * function tokenSupplyCap()
     *
     * 0x52058d8a = keccak256('tokenSupplyCap()')
     */
    "0x52058d8a": {
      sig: "tokenSupplyCap()",
      inputs: [],
      name: "tokenSupplyCap",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the maximum number of tokens that can exist to circulate. Once {totalSupply} reaches reaches {totalSuuplyCap}, it is not possible to mint more tokens.",
        returns: {
          _0: "The maximum number of tokens that can exist in the contract.",
        },
      },
      userdoc: {
        notice:
          "The maximum supply amount of tokens allowed to exist is `_TOKEN_SUPPLY_CAP`.",
      },
    },

    /**
     * function totalSupply()
     *
     * 0x18160ddd = keccak256('totalSupply()')
     */
    "0x18160ddd": {
      sig: "totalSupply()",
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of existing tokens that have been minted in this contract.",
        returns: { _0: "The number of existing tokens." },
      },
    },

    /**
     * function transfer(
     *  address from,
     *  address to,
     *  bytes32 tokenId,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x511b6952 = keccak256('transfer(address,address,bytes32,bool,bytes)')
     */
    "0x511b6952": {
      sig: "transfer(address,address,bytes32,bool,bytes)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bool", name: "force", type: "bool" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "transfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfer a given `tokenId` token from the `from` address to the `to` address. If operators are set for a specific `tokenId`, all the operators are revoked after the tokenId have been transferred. The `force` parameter MUST be set to `true` when transferring tokens to Externally Owned Accounts (EOAs) or contracts that do not implement the LSP1 standard.",
        params: {
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.",
          force:
            "When set to `true`, the `to` address CAN be any addres. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "The address that owns the given `tokenId`.",
          to: "The address that will receive the `tokenId`.",
          tokenId: "The token ID to transfer.",
        },
      },
    },

    /**
     * function transferBatch(
     *  address[] from,
     *  address[] to,
     *  bytes32[] tokenId,
     *  bool[] force,
     *  bytes[] data
     * )
     *
     * 0x7e87632c = keccak256('transferBatch(address[],address[],bytes32[],bool[],bytes[])')
     */
    "0x7e87632c": {
      sig: "transferBatch(address[],address[],bytes32[],bool[],bytes[])",
      inputs: [
        { internalType: "address[]", name: "from", type: "address[]" },
        { internalType: "address[]", name: "to", type: "address[]" },
        { internalType: "bytes32[]", name: "tokenId", type: "bytes32[]" },
        { internalType: "bool[]", name: "force", type: "bool[]" },
        { internalType: "bytes[]", name: "data", type: "bytes[]" },
      ],
      name: "transferBatch",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers multiple tokens at once based on the arrays of `from`, `to` and `tokenId`. If any transfer fails, the whole call will revert.",
        params: {
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks to the `from` and `to` addresses.",
          force:
            "When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard and not revert.",
          from: "An array of sending addresses.",
          to: "An array of recipient addresses.",
          tokenId: "An array of token IDs to transfer.",
        },
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
  LSP8CappedSupplyInitAbstract: {
    /**
     * function authorizeOperator(
     *  address operator,
     *  bytes32 tokenId,
     *  bytes operatorNotificationData
     * )
     *
     * 0x86a10ddd = keccak256('authorizeOperator(address,bytes32,bytes)')
     */
    "0x86a10ddd": {
      sig: "authorizeOperator(address,bytes32,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "authorizeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Allow an `operator` address to transfer or burn a specific `tokenId` on behalf of its token owner. See {isOperatorFor}. Notify the operator based on the LSP1-UniversalReceiver standard",
        params: {
          operator: "The address to authorize as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
          tokenId: "The token ID operator has access to.",
        },
      },
    },

    /**
     * function balanceOf(
     *  address tokenOwner
     * )
     *
     * 0x70a08231 = keccak256('balanceOf(address)')
     */
    "0x70a08231": {
      sig: "balanceOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details: "Get the number of token IDs owned by `tokenOwner`.",
        params: { tokenOwner: "The address to query     *" },
        returns: {
          _0: "The total number of token IDs that `tokenOwner` owns.",
        },
      },
    },

    /**
     * function batchCalls(
     *  bytes[] data
     * )
     *
     * 0x6963d438 = keccak256('batchCalls(bytes[])')
     */
    "0x6963d438": {
      sig: "batchCalls(bytes[])",
      inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
      name: "batchCalls",
      outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        "custom:info":
          "It's not possible to send value along the functions call due to the use of `delegatecall`.",
        details:
          "Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.",
        params: {
          data: "An array of ABI encoded function calls to be called on the contract.",
        },
        returns: {
          results:
            "An array of abi-encoded data returned by the functions executed.",
        },
      },
      userdoc: {
        notice:
          "Executing the following batch of abi-encoded function calls on the contract: `data`.",
      },
    },

    /**
     * function getData(
     *  bytes32 dataKey
     * )
     *
     * 0x54f6127f = keccak256('getData(bytes32)')
     */
    "0x54f6127f": {
      sig: "getData(bytes32)",
      inputs: [{ internalType: "bytes32", name: "dataKey", type: "bytes32" }],
      name: "getData",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.",
        params: { dataKey: "The data key for which to retrieve the value." },
        returns: {
          dataValue: "The bytes value stored under the specified data key.",
        },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.",
      },
    },

    /**
     * function getDataBatch(
     *  bytes32[] dataKeys
     * )
     *
     * 0xdedff9c6 = keccak256('getDataBatch(bytes32[])')
     */
    "0xdedff9c6": {
      sig: "getDataBatch(bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatch",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.",
        params: { dataKeys: "The array of keys which values to retrieve" },
        returns: { dataValues: "The array of data stored at multiple keys" },
      },
      userdoc: {
        notice:
          "Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.",
      },
    },

    /**
     * function getDataBatchForTokenIds(
     *  bytes32[] tokenIds,
     *  bytes32[] dataKeys
     * )
     *
     * 0x1d26fce6 = keccak256('getDataBatchForTokenIds(bytes32[],bytes32[])')
     */
    "0x1d26fce6": {
      sig: "getDataBatchForTokenIds(bytes32[],bytes32[])",
      inputs: [
        { internalType: "bytes32[]", name: "tokenIds", type: "bytes32[]" },
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
      ],
      name: "getDataBatchForTokenIds",
      outputs: [
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      stateMutability: "view",
      type: "function",
      devdoc: {
        params: {
          dataKeys: "An array of data keys corresponding to the token IDs.",
          tokenIds: "An array of token IDs.",
        },
        returns: {
          dataValues:
            "An array of data values for each pair of `tokenId` and `dataKey`.",
        },
      },
      userdoc: {
        notice:
          "Retrieves data in batch for multiple `tokenId` and `dataKey` pairs.",
      },
    },

    /**
     * function getDataForTokenId(
     *  bytes32 tokenId,
     *  bytes32 dataKey
     * )
     *
     * 0x16e023b3 = keccak256('getDataForTokenId(bytes32,bytes32)')
     */
    "0x16e023b3": {
      sig: "getDataForTokenId(bytes32,bytes32)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
      ],
      name: "getDataForTokenId",
      outputs: [{ internalType: "bytes", name: "dataValue", type: "bytes" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        params: {
          dataKey: "The key for the data to retrieve.",
          tokenId: "The unique identifier for a token.",
        },
        returns: {
          dataValue:
            "The data value associated with the given `tokenId` and `dataKey`.",
        },
      },
      userdoc: {
        notice: "Retrieves data for a specific `tokenId` and `dataKey`.",
      },
    },

    /**
     * function getOperatorsOf(
     *  bytes32 tokenId
     * )
     *
     * 0x49a6078d = keccak256('getOperatorsOf(bytes32)')
     */
    "0x49a6078d": {
      sig: "getOperatorsOf(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "getOperatorsOf",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns all `operator` addresses that are allowed to transfer or burn a specific `tokenId` on behalf of its owner.",
        params: { tokenId: "The token ID to get the operators for." },
        returns: {
          _0: "An array of operators allowed to transfer or burn a specific `tokenId`. Requirements - `tokenId` must exist.",
        },
      },
    },

    /**
     * function isOperatorFor(
     *  address operator,
     *  bytes32 tokenId
     * )
     *
     * 0x2a3654a4 = keccak256('isOperatorFor(address,bytes32)')
     */
    "0x2a3654a4": {
      sig: "isOperatorFor(address,bytes32)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
      ],
      name: "isOperatorFor",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns whether `operator` address is an operator for a given `tokenId`.",
        params: {
          operator: "The address to query operator status for.",
          tokenId:
            "The token ID to check if `operator` is allowed to operate on.",
        },
        returns: {
          _0: "`true` if `operator` is an operator for `tokenId`, `false` otherwise.",
        },
      },
    },

    /**
     * function owner()
     *
     * 0x8da5cb5b = keccak256('owner()')
     */
    "0x8da5cb5b": {
      sig: "owner()",
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "Returns the address of the current owner." },
    },

    /**
     * function renounceOwnership()
     *
     * 0x715018a6 = keccak256('renounceOwnership()')
     */
    "0x715018a6": {
      sig: "renounceOwnership()",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.",
      },
    },

    /**
     * function revokeOperator(
     *  address operator,
     *  bytes32 tokenId,
     *  bool notify,
     *  bytes operatorNotificationData
     * )
     *
     * 0xdb8c9663 = keccak256('revokeOperator(address,bytes32,bool,bytes)')
     */
    "0xdb8c9663": {
      sig: "revokeOperator(address,bytes32,bool,bytes)",
      inputs: [
        { internalType: "address", name: "operator", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bool", name: "notify", type: "bool" },
        {
          internalType: "bytes",
          name: "operatorNotificationData",
          type: "bytes",
        },
      ],
      name: "revokeOperator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Remove access of `operator` for a given `tokenId`, disallowing it to transfer `tokenId` on behalf of its owner. See also {isOperatorFor}.",
        params: {
          notify: "Boolean indicating whether to notify the operator or not",
          operator: "The address to revoke as an operator.",
          operatorNotificationData:
            "The data to notify the operator about via LSP1.",
          tokenId: "The tokenId `operator` is revoked from operating on.",
        },
      },
    },

    /**
     * function setData(
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0x7f23690c = keccak256('setData(bytes32,bytes)')
     */
    "0x7f23690c": {
      sig: "setData(bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setData",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events": "{DataChanged} event.",
        "custom:requirements": "- SHOULD only be callable by the {owner}.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`. The function is marked as payable to enable flexibility on child contracts. For instance to implement a fee mechanism for setting specific data.",
        params: {
          dataKey: "The data key for which to set a new value.",
          dataValue: "The new bytes value to set.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.",
      },
    },

    /**
     * function setDataBatch(
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0x97902421 = keccak256('setDataBatch(bytes32[],bytes[])')
     */
    "0x97902421": {
      sig: "setDataBatch(bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatch",
      outputs: [],
      stateMutability: "payable",
      type: "function",
      devdoc: {
        "custom:events":
          "{DataChanged} event **for each data key/value pair set**.",
        "custom:requirements":
          "- SHOULD only be callable by the {owner} of the contract.",
        "custom:warning":
          "**Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.",
        details:
          "Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.",
        params: {
          dataKeys: "An array of data keys to set bytes values for.",
          dataValues: "An array of bytes values to set for each `dataKeys`.",
        },
      },
      userdoc: {
        notice:
          "Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.",
      },
    },

    /**
     * function setDataBatchForTokenIds(
     *  bytes32[] tokenIds,
     *  bytes32[] dataKeys,
     *  bytes[] dataValues
     * )
     *
     * 0xbe9f0e6f = keccak256('setDataBatchForTokenIds(bytes32[],bytes32[],bytes[])')
     */
    "0xbe9f0e6f": {
      sig: "setDataBatchForTokenIds(bytes32[],bytes32[],bytes[])",
      inputs: [
        { internalType: "bytes32[]", name: "tokenIds", type: "bytes32[]" },
        { internalType: "bytes32[]", name: "dataKeys", type: "bytes32[]" },
        { internalType: "bytes[]", name: "dataValues", type: "bytes[]" },
      ],
      name: "setDataBatchForTokenIds",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          dataKeys: "An array of data keys corresponding to the token IDs.",
          dataValues: "An array of values to set for the given data keys.",
          tokenIds: "An array of token IDs.",
        },
      },
      userdoc: {
        notice:
          "Sets data in batch for multiple `tokenId` and `dataKey` pairs.",
      },
    },

    /**
     * function setDataForTokenId(
     *  bytes32 tokenId,
     *  bytes32 dataKey,
     *  bytes dataValue
     * )
     *
     * 0xd6c1407c = keccak256('setDataForTokenId(bytes32,bytes32,bytes)')
     */
    "0xd6c1407c": {
      sig: "setDataForTokenId(bytes32,bytes32,bytes)",
      inputs: [
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bytes32", name: "dataKey", type: "bytes32" },
        { internalType: "bytes", name: "dataValue", type: "bytes" },
      ],
      name: "setDataForTokenId",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        params: {
          dataKey: "The key for the data to set.",
          dataValue: "The value to set for the given data key.",
          tokenId: "The unique identifier for a token.",
        },
      },
      userdoc: { notice: "Sets data for a specific `tokenId` and `dataKey`." },
    },

    /**
     * function supportsInterface(
     *  bytes4 interfaceId
     * )
     *
     * 0x01ffc9a7 = keccak256('supportsInterface(bytes4)')
     */
    "0x01ffc9a7": {
      sig: "supportsInterface(bytes4)",
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
      devdoc: { details: "See {IERC165-supportsInterface}." },
    },

    /**
     * function tokenIdsOf(
     *  address tokenOwner
     * )
     *
     * 0xa3b261f2 = keccak256('tokenIdsOf(address)')
     */
    "0xa3b261f2": {
      sig: "tokenIdsOf(address)",
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "tokenIdsOf",
      outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the list of token IDs that the `tokenOwner` address owns.",
        params: {
          tokenOwner:
            "The address that we want to get the list of token IDs for.",
        },
        returns: {
          _0: "An array of `bytes32[] tokenIds` owned by `tokenOwner`.",
        },
      },
    },

    /**
     * function tokenOwnerOf(
     *  bytes32 tokenId
     * )
     *
     * 0x217b2270 = keccak256('tokenOwnerOf(bytes32)')
     */
    "0x217b2270": {
      sig: "tokenOwnerOf(bytes32)",
      inputs: [{ internalType: "bytes32", name: "tokenId", type: "bytes32" }],
      name: "tokenOwnerOf",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details: "Returns the list of `tokenIds` for the `tokenOwner` address.",
        params: { tokenId: "tokenOwner The address to query owned tokens" },
        returns: { _0: "The owner address of the given `tokenId`." },
      },
    },

    /**
     * function tokenSupplyCap()
     *
     * 0x52058d8a = keccak256('tokenSupplyCap()')
     */
    "0x52058d8a": {
      sig: "tokenSupplyCap()",
      inputs: [],
      name: "tokenSupplyCap",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Get the maximum number of tokens that can exist to circulate. Once {totalSupply} reaches reaches {totalSuuplyCap}, it is not possible to mint more tokens.",
        returns: {
          _0: "The maximum number of tokens that can exist in the contract.",
        },
      },
      userdoc: {
        notice:
          "The maximum supply amount of tokens allowed to exist is `_tokenSupplyCap`.",
      },
    },

    /**
     * function totalSupply()
     *
     * 0x18160ddd = keccak256('totalSupply()')
     */
    "0x18160ddd": {
      sig: "totalSupply()",
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
      devdoc: {
        details:
          "Returns the number of existing tokens that have been minted in this contract.",
        returns: { _0: "The number of existing tokens." },
      },
    },

    /**
     * function transfer(
     *  address from,
     *  address to,
     *  bytes32 tokenId,
     *  bool force,
     *  bytes data
     * )
     *
     * 0x511b6952 = keccak256('transfer(address,address,bytes32,bool,bytes)')
     */
    "0x511b6952": {
      sig: "transfer(address,address,bytes32,bool,bytes)",
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "bytes32", name: "tokenId", type: "bytes32" },
        { internalType: "bool", name: "force", type: "bool" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "transfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfer a given `tokenId` token from the `from` address to the `to` address. If operators are set for a specific `tokenId`, all the operators are revoked after the tokenId have been transferred. The `force` parameter MUST be set to `true` when transferring tokens to Externally Owned Accounts (EOAs) or contracts that do not implement the LSP1 standard.",
        params: {
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.",
          force:
            "When set to `true`, the `to` address CAN be any addres. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.",
          from: "The address that owns the given `tokenId`.",
          to: "The address that will receive the `tokenId`.",
          tokenId: "The token ID to transfer.",
        },
      },
    },

    /**
     * function transferBatch(
     *  address[] from,
     *  address[] to,
     *  bytes32[] tokenId,
     *  bool[] force,
     *  bytes[] data
     * )
     *
     * 0x7e87632c = keccak256('transferBatch(address[],address[],bytes32[],bool[],bytes[])')
     */
    "0x7e87632c": {
      sig: "transferBatch(address[],address[],bytes32[],bool[],bytes[])",
      inputs: [
        { internalType: "address[]", name: "from", type: "address[]" },
        { internalType: "address[]", name: "to", type: "address[]" },
        { internalType: "bytes32[]", name: "tokenId", type: "bytes32[]" },
        { internalType: "bool[]", name: "force", type: "bool[]" },
        { internalType: "bytes[]", name: "data", type: "bytes[]" },
      ],
      name: "transferBatch",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers multiple tokens at once based on the arrays of `from`, `to` and `tokenId`. If any transfer fails, the whole call will revert.",
        params: {
          data: "Any additional data the caller wants included in the emitted event, and sent in the hooks to the `from` and `to` addresses.",
          force:
            "When set to `true`, `to` may be any address. When set to `false`, `to` must be a contract that supports the LSP1 standard and not revert.",
          from: "An array of sending addresses.",
          to: "An array of recipient addresses.",
          tokenId: "An array of token IDs to transfer.",
        },
      },
    },

    /**
     * function transferOwnership(
     *  address newOwner
     * )
     *
     * 0xf2fde38b = keccak256('transferOwnership(address)')
     */
    "0xf2fde38b": {
      sig: "transferOwnership(address)",
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
      devdoc: {
        details:
          "Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.",
      },
    },
  },
};
export const ContractsDocs = {};
export const StateVariables = {};
