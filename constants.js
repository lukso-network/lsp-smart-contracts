/**
 * Set of constants values as defined in each LUKSO Standards Proposals (LSPs).
 * @see https://github.com/lukso-network/LIPs/tree/main/LSPs
 */

// ERC165
// ----------

const INTERFACE_IDS = {
	ERC165: '0x01ffc9a7',
	ERC1271: '0x1626ba7e',
	ERC20: '0x36372b07',
	ERC223: '0x87d43052',
	ERC721: '0x80ac58cd',
	ERC721Metadata: '0x5b5e139f',
	ERC777: '0xe58e113c',
	ERC1155: '0xd9b67a26',
	ERC725X: '0x44c028fe',
	ERC725Y: '0x714df77c',
	LSP0ERC725Account: '0x9a3bfe88',
	LSP1UniversalReceiver: '0x6bb56a14',
	LSP1UniversalReceiverDelegate: '0xa245bbda',
	LSP6KeyManager: '0xc403d48f',
	LSP7DigitalAsset: '0xe33f65c3',
	LSP8IdentifiableDigitalAsset: '0x49399145',
	LSP9Vault: '0x8c1d44f6',
	ClaimOwnership: '0xd225f160',
};

// ERC1271
// ----------

const ERC1271_VALUES = {
	MAGIC_VALUE: '0x1626ba7e',
	FAIL_VALUE: '0xffffffff',
};

// ERC725X
// ----------

const OPERATION_TYPES = {
	CALL: 0,
	CREATE: 1,
	CREATE2: 2,
	STATICCALL: 3,
	DELEGATECALL: 4,
};

// ERC725Y
// ----------

const SupportedStandards = {
	LSP3UniversalProfile: {
		key: '0xeafec4d89fa9619884b60000abe425d64acd861a49b8ddf5c0b6962110481f38',
		value: '0xabe425d6',
	},
	LSP4DigitalAsset: {
		key: '0xeafec4d89fa9619884b60000a4d96624a38f7ac2d8d9a604ecf07c12c77e480c',
		value: '0xa4d96624',
	},
	LSP9Vault: {
		key: '0xeafec4d89fa9619884b600007c0334a14085fefa8b51ae5a40895018882bdb90',
		value: '0x7c0334a1',
	},
};

/**
 * For more infos on the type of each keys
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md
 */
const ERC725YKeys = {
	LSP0: {
		// keccak256('LSP1UniversalReceiverDelegate')
		LSP1UniversalReceiverDelegate:
			'0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
	},
	LSP3: {
		// keccak256('LSP3Profile')
		LSP3Profile: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
	},
	LSP4: {
		// keccak256('LSP4TokenName')
		LSP4TokenName: '0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1',
		// keccak256('LSP4TokenSymbol')
		LSP4TokenSymbol: '0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756',
		// keccak256('LSP4Metadata')
		LSP4Metadata: '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e',
		// keccak256('"LSP4Creators[]')
		'LSP4Creators[]': {
			// use this key to get the number of elements in the array
			length: '0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7',
			// use this key + bytes16(index) to access an index in the array
			index: '0x114bd03b3a46d48759680d81ebb2b414',
		},
	},
	LSP5: {
		// LSP5ReceivedAssetsMap:<address>
		LSP5ReceivedAssetsMap: '0x812c4334633eb816c80d0000',
		// keccak256('LSP5ReceivedAssets[]')
		'LSP5ReceivedAssets[]': {
			length: '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
			index: '0x6460ee3c0aac563ccbf76d6e1d07bada',
		},
	},
	LSP6: {
		// keccak256('AddressPermissions[]')
		'AddressPermissions[]': {
			length: '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
			index: '0xdf30dba06db6a30e65354d9a64c60986',
		},
		// AddressPermissions:Permissions:<address>
		'AddressPermissions:Permissions': '0x4b80742de2bf82acb3630000',
		// AddressPermissions:AllowedAddresses:<address>
		'AddressPermissions:AllowedAddresses': '0x4b80742de2bfc6dd6b3c0000',
		// AddressPermissions:AllowedFunctions:<address>
		'AddressPermissions:AllowedFunctions': '0x4b80742de2bf8efea1e80000',
		// AddressPermissions:AllowedStandards:<address>
		'AddressPermissions:AllowedStandards': '0x4b80742de2bf3efa94a30000',
		// AddressPermissions:AllowedERC725YKeys:<address>
		'AddressPermissions:AllowedERC725YKeys': '0x4b80742de2bf90b8b4850000',
	},
	LSP10: {
		// keccak256('LSP10VaultsMap')
		LSP10VaultsMap: '0x192448c3c0f88c7f238c0000',
		// keccak256('LSP10Vaults[]')
		'LSP10Vaults[]': {
			length: '0x55482936e01da86729a45d2b87a6b1d3bc582bea0ec00e38bdb340e3af6f9f06',
			index: '0x55482936e01da86729a45d2b87a6b1d3',
		},
	},
	LSP12: {
		// LSP12IssuedAssetsMap:<address>
		LSP12IssuedAssetsMap: '0x74ac2555c10b9349e78f0000',
		// keccak256('LSP12IssuedAssets[]')
		'LSP12IssuedAssets[]': {
			length: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
			index: '0x7c8c3416d6cda87cd42c71ea1843df28',
		},
	},
};

const BasicUPSetup_Schema = [
	{
		name: 'LSP3Profile',
		key: ERC725YKeys.LSP3['LSP3Profile'],
		keyType: 'Singleton',
		valueContent: 'JSONURL',
		valueType: 'bytes',
	},
	{
		name: 'LSP1UniversalReceiverDelegate',
		key: ERC725YKeys.LSP0['LSP1UniversalReceiverDelegate'],
		keyType: 'Singleton',
		valueContent: 'Address',
		valueType: 'address',
	},
	{
		name: 'LSP12IssuedAssets[]',
		key: ERC725YKeys.LSP12['LSP12IssuedAssets[]'].length,
		keyType: 'Array',
		valueContent: 'Number',
		valueType: 'uint256',
	},
];

// LSP6
// ----------

// All Permissions currently exclude DELEGATECALL for security
const ALL_PERMISSIONS = '0x0000000000000000000000000000000000000000000000000000000000007fbf';

// prettier-ignore
const PERMISSIONS = {
    CHANGEOWNER:          "0x0000000000000000000000000000000000000000000000000000000000000001", // .... .... .... 0001
    CHANGEPERMISSIONS:    "0x0000000000000000000000000000000000000000000000000000000000000002", // .... .... .... 0010
    ADDPERMISSIONS:       "0x0000000000000000000000000000000000000000000000000000000000000004", // .... .... .... 0100
    SETDATA:              "0x0000000000000000000000000000000000000000000000000000000000000008", // .... .... .... 1000
    CALL:                 "0x0000000000000000000000000000000000000000000000000000000000000010", // .... .... 0001 ....
    STATICCALL:           "0x0000000000000000000000000000000000000000000000000000000000000020", // .... .... 0010 ....
    DELEGATECALL:         "0x0000000000000000000000000000000000000000000000000000000000000040", // .... .... 0100 ....
    DEPLOY:               "0x0000000000000000000000000000000000000000000000000000000000000080", // .... .... 1000 ....
    TRANSFERVALUE:        "0x0000000000000000000000000000000000000000000000000000000000000100", // .... 0001 .... ....
    SIGN:                 "0x0000000000000000000000000000000000000000000000000000000000000200", // .... 0010 .... ....
    SUPER_SETDATA:        "0x0000000000000000000000000000000000000000000000000000000000000400", // .... 0100 .... ....
    SUPER_TRANSFERVALUE:  "0x0000000000000000000000000000000000000000000000000000000000000800", // .... 1000 .... ....
    SUPER_CALL:           "0x0000000000000000000000000000000000000000000000000000000000001000", // 0001 .... .... ....
    SUPER_STATICCALL:     "0x0000000000000000000000000000000000000000000000000000000000002000", // 0010 .... .... ....
    SUPER_DELEGATECALL:   "0x0000000000000000000000000000000000000000000000000000000000004000", // 0100 .... .... ....
}

const LSP1_TYPE_IDS = {
	// keccak256('LSP7TokensSender')
	LSP7_TOKENSENDER: '0x40b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e9',
	// keccak256('LSP7TokensRecipient')
	LSP7_TOKENRECIPIENT: '0xdbe2c314e1aee2970c72666f2ebe8933a8575263ea71e5ff6a9178e95d47a26f',
	// keccak256('LSP8TokensSender')
	LSP8_TOKENSENDER: '0x3724c94f0815e936299cca424da4140752198e0beb7931a6e0925d11bc97544c',
	// keccak256('LSP8TokensRecipient')
	LSP8_TOKENRECIPIENT: '0xc7a120a42b6057a0cbed111fbbfbd52fcd96748c04394f77fc2c3adbe0391e01',
	// keccak256("LSP9VaultSender")
	LSP9_VAULTSENDER: '0x3ca9f769340018257ac15b3a00e502e8fb730d66086f774210f84d0205af31e7',
	// keccak256("LSP9VaultRecipient")
	LSP9_VAULTRECIPIENT: '0x09aaf55960715d8d86b57af40be36b0bfd469c9a3643445d8c65d39e27b4c56f',
};

// ----------

const Errors = {
	LSP6: {
		'0xf292052a': {
			error: 'NoPermissionsSet(address)',
			message: 'LSP6: No permissions are set for this address.',
		},
		'0x3bdad6e6': {
			error: 'NotAuthorised(address,string)',
			message: 'LSP6: Not authorized (missing permission).',
		},
		'0x2879b128': {
			error: 'NotAllowedAddress(address,address)',
			message: 'LSP6: not allowed to interact with address.',
		},
		'0x84135110': {
			error: 'NotAllowedFunction(address,bytes4)',
			message: 'LSP6: not allowed to run the function.',
		},
		'0x3003e7ae': {
			error: 'NotAllowedERC725YKey(address,bytes32)',
			message: 'LSP6: not allowed to set the ERC725Y data key.',
		},
	},
	LSP7: {
		'0xc5e194ab': {
			error: 'LSP7AmountExceedsBalance(address,address,uint256)',
			message: "LSP7: token amount exceeds sender's balance.",
		},
		'0xf3a6b691': {
			error: 'LSP7AmountExceedsAuthorizedAmount(address,uint256,address,uint256)',
			message: "LSP7: token amount exceeds operator's allowance.",
		},
		'0x6355e766': {
			error: 'LSP7CannotUseAddressZeroAsOperator()',
			message: 'LSP7: cannot authorize address(0) as operator for LSP7 token.',
		},
		'0xd2d5ec30': {
			error: 'LSP7CannotSendWithAddressZero()',
			message: 'LSP7: cannot send token with address(0).',
		},
		'0x263eee8d': {
			error: 'LSP7InvalidTransferBatch()',
			message: 'LSP7: invalid transfer batch.',
		},
		'0xa608fbb6': {
			error: 'LSP7NotifyTokenReceiverContractMissingLSP1Interface(address)',
			message: 'LSP7: token recipient does not implement LSP1 standard.',
		},
		'0x26c247f4': {
			error: 'LSP7NotifyTokenReceiverIsEOA(address)',
			message: 'LSP7: token recipient is an Externally Owned Account.',
		},
	},
	LSP7CappedSupply: {
		'0xacf1d8c5': {
			error: 'LSP7CappedSupplyRequired()',
			message: 'LSP7CappedSupply: cap supply number required',
		},
		'0xeacbf0d1': {
			error: 'LSP7CappedSupplyCannotMintOverCap()',
			message: 'LSP7CappedSupply: cannot mint over the max cap supply',
		},
	},
	LSP8: {
		'0xae8f9a36': {
			error: 'LSP8NonExistentTokenId(bytes32)',
			message: 'LSP8: token id does not exist.',
		},
		'0x5b271ea2': {
			error: 'LSP8NotTokenOwner(address,bytes32,address)',
			message: 'LSP8: tokenOwner given as parameter does not own this token id.',
		},
		'0x1294d2a9': {
			error: 'LSP8NotTokenOperator(bytes32,address)',
			message: 'LSP8: caller is not an operator for this token id.',
		},
		'0x9577b8b3': {
			error: 'LSP8CannotUseAddressZeroAsOperator()',
			message: 'LSP8: cannot use address(0) as an operator for token id.',
		},
		'0x24ecef4d': {
			error: 'LSP8CannotSendToAddressZero()',
			message: 'LSP8: cannot send to address(0).',
		},
		'0x34c7b511': {
			error: 'LSP8TokenIdAlreadyMinted(bytes32)',
			message: 'LSP8: tokenId already exist (= already minted).',
		},
		'0x93a83119': {
			error: 'LSP8InvalidTransferBatch()',
			message: 'LSP8: invalid transfer batch.',
		},
		'0x4349776d': {
			error: 'LSP8NotifyTokenReceiverContractMissingLSP1Interface(address)',
			message: 'LSP8: token recipient does not implement LSP1 standard.',
		},
		'0x03173137': {
			error: 'LSP8NotifyTokenReceiverIsEOA(address)',
			message: 'LSP8: token recipient is an Externally Owned Account.',
		},
	},
	LSP8CappedSupply: {
		'0x38d9fc30': {
			error: 'LSP8CappedSupplyRequired()',
			message: 'LSP8CappedSupply: cap supply number required',
		},
		'0xe8ba2291': {
			error: 'LSP8CappedSupplyCannotMintOverCap()',
			message: 'LSP8CappedSupply: cannot mint over the max cap supply',
		},
	},
};

// ----------

const EventSignatures = {
	ERC173: {
		/**
		 * event OwnershipTransferred(
		 *    address indexed previousOwner,
		 *    address indexed newOwner,
		 * );
		 *
		 * signature = keccak256('OwnershipTransferred(address,address)')
		 */
		OwnershipTransfered: '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
	},
	ERC725X: {
		/**
		 * event ContractCreated(
		 *     uint256 indexed _operation,
		 *     address indexed _contractAddress,
		 *     uint256 indexed _value
		 * );
		 *
		 * signature = keccak256('ContractCreated(uint256,address,uint256)')
		 */
		ContractCreated: '0x01c42bd7e97a66166063b02fce6924e6656b6c2c61966630165095c4fb0b7b2f',
		/**
		 * event Executed(
		 *      uint256 indexed _operation,
		 *      address indexed _to,
		 *      uint256 indexed _value,
		 *      bytes4 _data
		 * );
		 *
		 * signature = keccak256('Executed(uint256,address,uint256,bytes4)')
		 */
		Executed: '0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e',
	},
	ERC725Y: {
		/**
		 * event DataChanged(bytes32 indexed key);
		 *
		 * signature = keccak256('DataChanged(bytes32)')
		 */
		DataChanged: '0xcdf4e344c0d23d4cdd0474039d176c55b19d531070dbe17856bfb993a5b5720b',
	},
	// ERC725Account
	LSP0: {
		/**
		 * event ValueReceived(
		 *      address indexed sender,
		 *      uint256 indexed value
		 * );
		 *
		 * signature = keccak256('ValueReceived(address,uint256)')
		 */
		ValueReceived: '0x7e71433ddf847725166244795048ecf3e3f9f35628254ecbf736056664233493',
	},
	LSP1: {
		/**
		 * event UniversalReceiver(
		 *    address indexed from,
		 * 	  uint256 value,
		 *    bytes32 indexed typeId,
		 *    bytes indexed returnedValue,
		 *    bytes receivedData
		 * );
		 *
		 * signature = keccak256('UniversalReceiver(address,uint256,bytes32,bytes,bytes)')
		 */
		UniversalReceiver: '0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2',
	},
	LSP6: {
		/**
		 * event Executed(
		 *     uint256 indexed _value,
		 *     bytes4 _data
		 * );
		 *
		 * signature = keccak256('Executed(uint256,bytes4)')
		 */
		Executed: '0x6b9340454526f665e369d7ac17353d0b73774a4a80f746b959ece8130e0f1d72',
	},
	LSP7: {
		/**
		 * event Transfer(
		 *     address indexed operator,
		 *     address indexed from,
		 *     address indexed to,
		 *     uint256 amount,
		 *     bool force,
		 *     bytes data
		 * );
		 *
		 * signature = keccak256('Transfer(address,address,address,uint256,bool,bytes)')
		 */
		Transfer: '0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6',
		/**
		 * event AuthorizedOperator(
		 *     address indexed operator,
		 *     address indexed tokenOwner,
		 *     uint256 indexed amount
		 * );
		 *
		 * signature = keccak256('AuthorizedOperator(address,address,uint256)')
		 */
		AuthorizedOperator: '0xd66aff874162a96578e919097b6f6d153dfd89a5cec41bb331fdb0c4aec16e2c',
		/**
		 * event RevokedOperator(
		 *     address indexed operator,
		 *     address indexed tokenOwner
		 * );
		 *
		 * signature = keccak256('RevokedOperator(address,address)')
		 */
		RevokedOperator: '0x50546e66e5f44d728365dc3908c63bc5cfeeab470722c1677e3073a6ac294aa1',
	},
	LSP8: {
		/**
		 * event Transfer(
		 *     address operator,
		 *     address indexed from,
		 *     address indexed to,
		 *     bytes32 indexed tokenId,
		 *     bool force,
		 *     bytes data
		 * );
		 *
		 * signature = keccak256('Transfer(address,address,address,bytes32,bool,bytes)')
		 */
		Transfer: 'b333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf',
		/**
		 * event AuthorizedOperator(
		 *     address indexed operator,
		 *     address indexed tokenOwner,
		 *     bytes32 indexed tokenId
		 * );
		 *
		 * signature = keccak256('AuthorizedOperator(address,address,bytes32)')
		 */
		AuthorizedOperator: '34b797fc5a526f7bf1d2b5de25f6564fd85ae364e3ee939aee7c1ac27871a988',
		/**
		 * event RevokedOperator(
		 *     address indexed operator,
		 *     address indexed tokenOwner,
		 *     bytes32 indexed tokenId
		 * );
		 *
		 * signature = keccak256('RevokedOperator(address,address,bytes32)')
		 */
		RevokedOperator: '17d5389f6ab6adb2647dfa0aa365c323d37adacc30b33a65310b6158ce1373d5',
	},
	Helpers: {
		/**
		 * event ReceivedERC777(
		 *    address indexed token,
		 *    address indexed _operator,
		 *    address indexed _from,
		 *    address _to,
		 *    uint256 _amount
		 * );
		 *
		 * signature = keccak256('ReceivedERC777(address,address,address,address,uint256)')
		 */
		ReceivedERC777: '0xdc38539587ea4d67f9f649ad9269646bab26927bad175bdcdfdab5dd297d5e1c',
	},
};

module.exports = {
	INTERFACE_IDS,
	ERC1271_VALUES,
	OPERATION_TYPES,
	SupportedStandards,
	ERC725YKeys,
	BasicUPSetup_Schema,
	ALL_PERMISSIONS,
	PERMISSIONS,
	LSP1_TYPE_IDS,
	Errors,
	EventSignatures,
};
