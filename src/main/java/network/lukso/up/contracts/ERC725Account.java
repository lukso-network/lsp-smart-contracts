package network.lukso.up.contracts;

import io.reactivex.Flowable;
import io.reactivex.functions.Function;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.DynamicBytes;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Bytes4;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.RemoteCall;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.BaseEventResponse;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

/**
 * <p>Auto generated code.
 * <p><strong>Do not modify!</strong>
 * <p>Please use the <a href="https://docs.web3j.io/command_line.html">web3j command line tools</a>,
 * or the org.web3j.codegen.SolidityFunctionWrapperGenerator in the 
 * <a href="https://github.com/web3j/web3j/tree/master/codegen">codegen module</a> to update.
 *
 * <p>Generated with web3j version 1.4.1.
 */
@SuppressWarnings("rawtypes")
public class ERC725Account extends Contract {
    public static final String BINARY = "60806040523480156200001157600080fd5b5060405162002af638038062002af6833981810160405281019062000037919062000641565b80808160006200004c620002ae60201b60201c565b905080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a350620000fb620002b660201b60201c565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161462000140576200013f81620002e060201b60201c565b5b620001586344c028fe60e01b620004a260201b60201c565b5062000169620002b660201b60201c565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614620001ae57620001ad81620002e060201b60201c565b5b620001c6632bd57b7360e01b620004a260201b60201c565b505060007feafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d660001b905063afdeb5d660e01b6040516020016200020a91906200078f565b604051602081830303815290604052600260008381526020019081526020016000209080519060200190620002419291906200057a565b50807fece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b260026000848152602001908152602001600020604051620002869190620007ac565b60405180910390a2620002a6631626ba7e60e01b620004a260201b60201c565b5050620009fc565b600033905090565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b620002f0620002ae60201b60201c565b73ffffffffffffffffffffffffffffffffffffffff1662000316620002b660201b60201c565b73ffffffffffffffffffffffffffffffffffffffff16146200036f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620003669062000814565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415620003e2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620003d990620007d0565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a380600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614156200050e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200050590620007f2565b60405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b8280546200058890620008cd565b90600052602060002090601f016020900481019282620005ac5760008555620005f8565b82601f10620005c757805160ff1916838001178555620005f8565b82800160010185558215620005f8579182015b82811115620005f7578251825591602001919060010190620005da565b5b5090506200060791906200060b565b5090565b5b80821115620006265760008160009055506001016200060c565b5090565b6000815190506200063b81620009e2565b92915050565b6000602082840312156200065a57620006596200093c565b5b60006200066a848285016200062a565b91505092915050565b62000688620006828262000881565b62000903565b82525050565b600081546200069d81620008cd565b620006a981866200084b565b94506001821660008114620006c75760018114620006da5762000711565b60ff198316865260208601935062000711565b620006e58562000836565b60005b838110156200070957815481890152600182019150602081019050620006e8565b808801955050505b50505092915050565b6000620007296026836200085c565b9150620007368262000941565b604082019050919050565b600062000750601c836200085c565b91506200075d8262000990565b602082019050919050565b6000620007776020836200085c565b91506200078482620009b9565b602082019050919050565b60006200079d828462000673565b60048201915081905092915050565b60006020820190508181036000830152620007c881846200068e565b905092915050565b60006020820190508181036000830152620007eb816200071a565b9050919050565b600060208201905081810360008301526200080d8162000741565b9050919050565b600060208201905081810360008301526200082f8162000768565b9050919050565b60008190508160005260206000209050919050565b600082825260208201905092915050565b600082825260208201905092915050565b60006200087a82620008ad565b9050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006002820490506001821680620008e657607f821691505b60208210811415620008fd57620008fc6200090d565b5b50919050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600080fd5b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f4552433136353a20696e76616c696420696e7465726661636520696400000000600082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b620009ed816200086d565b8114620009f957600080fd5b50565b6120ea8062000a0c6000396000f3fe60806040526004361061007f5760003560e01c8063715018a61161004e578063715018a6146101a95780637f23690c146101c05780638da5cb5b146101e9578063f2fde38b14610214576100d1565b806301ffc9a7146100d65780631626ba7e1461011357806344c028fe1461015057806354f6127f1461016c576100d1565b366100d1573461008d61023d565b73ffffffffffffffffffffffffffffffffffffffff167f7e71433ddf847725166244795048ecf3e3f9f35628254ecbf73605666423349360405160405180910390a3005b600080fd5b3480156100e257600080fd5b506100fd60048036038101906100f89190611466565b610245565b60405161010a91906117fe565b60405180910390f35b34801561011f57600080fd5b5061013a6004803603810190610135919061140a565b6102bc565b604051610147919061188e565b60405180910390f35b61016a600480360381019061016591906114c0565b6103f0565b005b34801561017857600080fd5b50610193600480360381019061018e919061137d565b6106f8565b6040516101a091906118cd565b60405180910390f35b3480156101b557600080fd5b506101be61079d565b005b3480156101cc57600080fd5b506101e760048036038101906101e291906113aa565b6108da565b005b3480156101f557600080fd5b506101fe6109b8565b60405161020b91906117e3565b60405180910390f35b34801561022057600080fd5b5061023b60048036038101906102369190611350565b6109e2565b005b600033905090565b600061025082610b8e565b806102b55750600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff165b9050919050565b60006102ce6102c96109b8565b610bf8565b1561038e576102e3631626ba7e60e01b610245565b6102f45763ffffffff60e01b610387565b6102fc6109b8565b73ffffffffffffffffffffffffffffffffffffffff16631626ba7e84846040518363ffffffff1660e01b8152600401610336929190611819565b60206040518083038186803b15801561034e57600080fd5b505afa158015610362573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103869190611493565b5b90506103ea565b6103988383610c05565b73ffffffffffffffffffffffffffffffffffffffff166103b66109b8565b73ffffffffffffffffffffffffffffffffffffffff16146103de5763ffffffff60e01b6103e7565b631626ba7e60e01b5b90505b92915050565b6103f861023d565b73ffffffffffffffffffffffffffffffffffffffff166104166109b8565b73ffffffffffffffffffffffffffffffffffffffff161461046c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161046390611a2f565b60405180910390fd5b828473ffffffffffffffffffffffffffffffffffffffff16867f1f920dbda597d7bf95035464170fa58d0a4b57f13a1c315ace6793b9f63688b885856040516104b69291906118a9565b60405180910390a460006109c45a6104ce9190611b88565b9050600086141561052f57610529858585858080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505084610c7f565b506106f0565b600386141561058c576105868484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610c98565b506106ef565b60028614156106b35760006105f484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050506020868690506105ef9190611b88565b610d5d565b9050600061065785858080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505060006020888890506106529190611b88565b610dc4565b90506000610666878484610ee2565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a25050506106ee565b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106e590611a4f565b60405180910390fd5b5b5b505050505050565b606060026000838152602001908152602001600020805461071890611c89565b80601f016020809104026020016040519081016040528092919081815260200182805461074490611c89565b80156107915780601f1061076657610100808354040283529160200191610791565b820191906000526020600020905b81548152906001019060200180831161077457829003601f168201915b50505050509050919050565b6107a561023d565b73ffffffffffffffffffffffffffffffffffffffff166107c36109b8565b73ffffffffffffffffffffffffffffffffffffffff1614610819576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161081090611a2f565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a36000600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6108e261023d565b73ffffffffffffffffffffffffffffffffffffffff166109006109b8565b73ffffffffffffffffffffffffffffffffffffffff1614610956576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161094d90611a2f565b60405180910390fd5b818160026000868152602001908152602001600020919061097892919061117e565b50827fece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b283836040516109ab9291906118a9565b60405180910390a2505050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6109ea61023d565b73ffffffffffffffffffffffffffffffffffffffff16610a086109b8565b73ffffffffffffffffffffffffffffffffffffffff1614610a5e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a5590611a2f565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610ace576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ac59061194f565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a380600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b600080823b119050919050565b60006041825114610c4b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c429061192f565b60405180910390fd5b60008060006020850151925060408501519150606085015160001a9050610c7486828585610ff3565b935050505092915050565b6000806000845160208601878987f19050949350505050565b600081516020830184f09050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610d14576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0b906119ef565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a292915050565b6000602082610d6c9190611b32565b83511015610daf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610da690611a0f565b60405180910390fd5b60008260208501015190508091505092915050565b606081601f83610dd49190611b32565b1015610e15576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e0c9061198f565b60405180910390fd5b8183610e219190611b32565b84511015610e64576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e5b90611a6f565b60405180910390fd5b6060821560008114610e855760405191506000825260208201604052610ed6565b6040519150601f8416801560200281840101858101878315602002848b0101015b81831015610ec35780518352602083019250602081019050610ea6565b50868552601f19601f8301166040525050505b50809150509392505050565b60008084471015610f28576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f1f90611a8f565b60405180910390fd5b600083511415610f6d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f649061190f565b60405180910390fd5b8383516020850187f59050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610fe8576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fdf906119cf565b60405180910390fd5b809150509392505050565b60007f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08260001c111561105b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110529061196f565b60405180910390fd5b601b8460ff1614806110705750601c8460ff16145b6110af576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110a6906119af565b60405180910390fd5b6000600186868686604051600081526020016040526040516110d49493929190611849565b6020604051602081039080840390855afa1580156110f6573d6000803e3d6000fd5b505050602060405103519050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415611172576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611169906118ef565b60405180910390fd5b80915050949350505050565b82805461118a90611c89565b90600052602060002090601f0160209004810192826111ac57600085556111f3565b82601f106111c557803560ff19168380011785556111f3565b828001600101855582156111f3579182015b828111156111f25782358255916020019190600101906111d7565b5b5090506112009190611204565b5090565b5b8082111561121d576000816000905550600101611205565b5090565b600061123461122f84611ad4565b611aaf565b9050828152602081018484840111156112505761124f611d88565b5b61125b848285611c47565b509392505050565b60008135905061127281612058565b92915050565b6000813590506112878161206f565b92915050565b60008135905061129c81612086565b92915050565b6000815190506112b181612086565b92915050565b60008083601f8401126112cd576112cc611d7e565b5b8235905067ffffffffffffffff8111156112ea576112e9611d79565b5b60208301915083600182028301111561130657611305611d83565b5b9250929050565b600082601f83011261132257611321611d7e565b5b8135611332848260208601611221565b91505092915050565b60008135905061134a8161209d565b92915050565b60006020828403121561136657611365611d92565b5b600061137484828501611263565b91505092915050565b60006020828403121561139357611392611d92565b5b60006113a184828501611278565b91505092915050565b6000806000604084860312156113c3576113c2611d92565b5b60006113d186828701611278565b935050602084013567ffffffffffffffff8111156113f2576113f1611d8d565b5b6113fe868287016112b7565b92509250509250925092565b6000806040838503121561142157611420611d92565b5b600061142f85828601611278565b925050602083013567ffffffffffffffff8111156114505761144f611d8d565b5b61145c8582860161130d565b9150509250929050565b60006020828403121561147c5761147b611d92565b5b600061148a8482850161128d565b91505092915050565b6000602082840312156114a9576114a8611d92565b5b60006114b7848285016112a2565b91505092915050565b6000806000806000608086880312156114dc576114db611d92565b5b60006114ea8882890161133b565b95505060206114fb88828901611263565b945050604061150c8882890161133b565b935050606086013567ffffffffffffffff81111561152d5761152c611d8d565b5b611539888289016112b7565b92509250509295509295909350565b61155181611bbc565b82525050565b61156081611bce565b82525050565b61156f81611bda565b82525050565b61157e81611be4565b82525050565b60006115908385611b10565b935061159d838584611c47565b6115a683611d97565b840190509392505050565b60006115bc82611b05565b6115c68185611b10565b93506115d6818560208601611c56565b6115df81611d97565b840191505092915050565b60006115f7601883611b21565b915061160282611da8565b602082019050919050565b600061161a602083611b21565b915061162582611dd1565b602082019050919050565b600061163d601f83611b21565b915061164882611dfa565b602082019050919050565b6000611660602683611b21565b915061166b82611e23565b604082019050919050565b6000611683602283611b21565b915061168e82611e72565b604082019050919050565b60006116a6600e83611b21565b91506116b182611ec1565b602082019050919050565b60006116c9602283611b21565b91506116d482611eea565b604082019050919050565b60006116ec601983611b21565b91506116f782611f39565b602082019050919050565b600061170f601983611b21565b915061171a82611f62565b602082019050919050565b6000611732601583611b21565b915061173d82611f8b565b602082019050919050565b6000611755602083611b21565b915061176082611fb4565b602082019050919050565b6000611778601483611b21565b915061178382611fdd565b602082019050919050565b600061179b601183611b21565b91506117a682612006565b602082019050919050565b60006117be601d83611b21565b91506117c98261202f565b602082019050919050565b6117dd81611c3a565b82525050565b60006020820190506117f86000830184611548565b92915050565b60006020820190506118136000830184611557565b92915050565b600060408201905061182e6000830185611566565b818103602083015261184081846115b1565b90509392505050565b600060808201905061185e6000830187611566565b61186b60208301866117d4565b6118786040830185611566565b6118856060830184611566565b95945050505050565b60006020820190506118a36000830184611575565b92915050565b600060208201905081810360008301526118c4818486611584565b90509392505050565b600060208201905081810360008301526118e781846115b1565b905092915050565b60006020820190508181036000830152611908816115ea565b9050919050565b600060208201905081810360008301526119288161160d565b9050919050565b6000602082019050818103600083015261194881611630565b9050919050565b6000602082019050818103600083015261196881611653565b9050919050565b6000602082019050818103600083015261198881611676565b9050919050565b600060208201905081810360008301526119a881611699565b9050919050565b600060208201905081810360008301526119c8816116bc565b9050919050565b600060208201905081810360008301526119e8816116df565b9050919050565b60006020820190508181036000830152611a0881611702565b9050919050565b60006020820190508181036000830152611a2881611725565b9050919050565b60006020820190508181036000830152611a4881611748565b9050919050565b60006020820190508181036000830152611a688161176b565b9050919050565b60006020820190508181036000830152611a888161178e565b9050919050565b60006020820190508181036000830152611aa8816117b1565b9050919050565b6000611ab9611aca565b9050611ac58282611cbb565b919050565b6000604051905090565b600067ffffffffffffffff821115611aef57611aee611d4a565b5b611af882611d97565b9050602081019050919050565b600081519050919050565b600082825260208201905092915050565b600082825260208201905092915050565b6000611b3d82611c30565b9150611b4883611c30565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611b7d57611b7c611cec565b5b828201905092915050565b6000611b9382611c30565b9150611b9e83611c30565b925082821015611bb157611bb0611cec565b5b828203905092915050565b6000611bc782611c10565b9050919050565b60008115159050919050565b6000819050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600060ff82169050919050565b82818337600083830152505050565b60005b83811015611c74578082015181840152602081019050611c59565b83811115611c83576000848401525b50505050565b60006002820490506001821680611ca157607f821691505b60208210811415611cb557611cb4611d1b565b5b50919050565b611cc482611d97565b810181811067ffffffffffffffff82111715611ce357611ce2611d4a565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f45434453413a20696e76616c6964207369676e61747572650000000000000000600082015250565b7f437265617465323a2062797465636f6465206c656e677468206973207a65726f600082015250565b7f45434453413a20696e76616c6964207369676e6174757265206c656e67746800600082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f45434453413a20696e76616c6964207369676e6174757265202773272076616c60008201527f7565000000000000000000000000000000000000000000000000000000000000602082015250565b7f736c6963655f6f766572666c6f77000000000000000000000000000000000000600082015250565b7f45434453413a20696e76616c6964207369676e6174757265202776272076616c60008201527f7565000000000000000000000000000000000000000000000000000000000000602082015250565b7f437265617465323a204661696c6564206f6e206465706c6f7900000000000000600082015250565b7f436f756c64206e6f74206465706c6f7920636f6e747261637400000000000000600082015250565b7f746f427974657333325f6f75744f66426f756e64730000000000000000000000600082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b7f57726f6e67206f7065726174696f6e2074797065000000000000000000000000600082015250565b7f736c6963655f6f75744f66426f756e6473000000000000000000000000000000600082015250565b7f437265617465323a20696e73756666696369656e742062616c616e6365000000600082015250565b61206181611bbc565b811461206c57600080fd5b50565b61207881611bda565b811461208357600080fd5b50565b61208f81611be4565b811461209a57600080fd5b50565b6120a681611c30565b81146120b157600080fd5b5056fea26469706673582212206a198bd5b57bfd887acff9dad2885d2385a36306beb5bdac242d5ba89d18ae0364736f6c63430008070033";

    public static final String FUNC_EXECUTE = "execute";

    public static final String FUNC_GETDATA = "getData";

    public static final String FUNC_ISVALIDSIGNATURE = "isValidSignature";

    public static final String FUNC_OWNER = "owner";

    public static final String FUNC_RENOUNCEOWNERSHIP = "renounceOwnership";

    public static final String FUNC_SETDATA = "setData";

    public static final String FUNC_SUPPORTSINTERFACE = "supportsInterface";

    public static final String FUNC_TRANSFEROWNERSHIP = "transferOwnership";

    public static final Event CONTRACTCREATED_EVENT = new Event("ContractCreated", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}));
    ;

    public static final Event DATACHANGED_EVENT = new Event("DataChanged", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<DynamicBytes>() {}));
    ;

    public static final Event EXECUTED_EVENT = new Event("Executed", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>(true) {}, new TypeReference<Address>(true) {}, new TypeReference<Uint256>(true) {}, new TypeReference<DynamicBytes>() {}));
    ;

    public static final Event OWNERSHIPTRANSFERRED_EVENT = new Event("OwnershipTransferred", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event VALUERECEIVED_EVENT = new Event("ValueReceived", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Uint256>(true) {}));
    ;

    @Deprecated
    protected ERC725Account(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected ERC725Account(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected ERC725Account(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected ERC725Account(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public List<ContractCreatedEventResponse> getContractCreatedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(CONTRACTCREATED_EVENT, transactionReceipt);
        ArrayList<ContractCreatedEventResponse> responses = new ArrayList<ContractCreatedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            ContractCreatedEventResponse typedResponse = new ContractCreatedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.contractAddress = (String) eventValues.getIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<ContractCreatedEventResponse> contractCreatedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, ContractCreatedEventResponse>() {
            @Override
            public ContractCreatedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(CONTRACTCREATED_EVENT, log);
                ContractCreatedEventResponse typedResponse = new ContractCreatedEventResponse();
                typedResponse.log = log;
                typedResponse.contractAddress = (String) eventValues.getIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<ContractCreatedEventResponse> contractCreatedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(CONTRACTCREATED_EVENT));
        return contractCreatedEventFlowable(filter);
    }

    public List<DataChangedEventResponse> getDataChangedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(DATACHANGED_EVENT, transactionReceipt);
        ArrayList<DataChangedEventResponse> responses = new ArrayList<DataChangedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            DataChangedEventResponse typedResponse = new DataChangedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.key = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.value = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<DataChangedEventResponse> dataChangedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, DataChangedEventResponse>() {
            @Override
            public DataChangedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(DATACHANGED_EVENT, log);
                DataChangedEventResponse typedResponse = new DataChangedEventResponse();
                typedResponse.log = log;
                typedResponse.key = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.value = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<DataChangedEventResponse> dataChangedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(DATACHANGED_EVENT));
        return dataChangedEventFlowable(filter);
    }

    public List<ExecutedEventResponse> getExecutedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(EXECUTED_EVENT, transactionReceipt);
        ArrayList<ExecutedEventResponse> responses = new ArrayList<ExecutedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            ExecutedEventResponse typedResponse = new ExecutedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._operation = (BigInteger) eventValues.getIndexedValues().get(0).getValue();
            typedResponse._to = (String) eventValues.getIndexedValues().get(1).getValue();
            typedResponse._value = (BigInteger) eventValues.getIndexedValues().get(2).getValue();
            typedResponse._data = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<ExecutedEventResponse> executedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, ExecutedEventResponse>() {
            @Override
            public ExecutedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(EXECUTED_EVENT, log);
                ExecutedEventResponse typedResponse = new ExecutedEventResponse();
                typedResponse.log = log;
                typedResponse._operation = (BigInteger) eventValues.getIndexedValues().get(0).getValue();
                typedResponse._to = (String) eventValues.getIndexedValues().get(1).getValue();
                typedResponse._value = (BigInteger) eventValues.getIndexedValues().get(2).getValue();
                typedResponse._data = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<ExecutedEventResponse> executedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(EXECUTED_EVENT));
        return executedEventFlowable(filter);
    }

    public List<OwnershipTransferredEventResponse> getOwnershipTransferredEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(OWNERSHIPTRANSFERRED_EVENT, transactionReceipt);
        ArrayList<OwnershipTransferredEventResponse> responses = new ArrayList<OwnershipTransferredEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            OwnershipTransferredEventResponse typedResponse = new OwnershipTransferredEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.previousOwner = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.newOwner = (String) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<OwnershipTransferredEventResponse> ownershipTransferredEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, OwnershipTransferredEventResponse>() {
            @Override
            public OwnershipTransferredEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(OWNERSHIPTRANSFERRED_EVENT, log);
                OwnershipTransferredEventResponse typedResponse = new OwnershipTransferredEventResponse();
                typedResponse.log = log;
                typedResponse.previousOwner = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.newOwner = (String) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<OwnershipTransferredEventResponse> ownershipTransferredEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(OWNERSHIPTRANSFERRED_EVENT));
        return ownershipTransferredEventFlowable(filter);
    }

    public List<ValueReceivedEventResponse> getValueReceivedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(VALUERECEIVED_EVENT, transactionReceipt);
        ArrayList<ValueReceivedEventResponse> responses = new ArrayList<ValueReceivedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            ValueReceivedEventResponse typedResponse = new ValueReceivedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.sender = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.value = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<ValueReceivedEventResponse> valueReceivedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, ValueReceivedEventResponse>() {
            @Override
            public ValueReceivedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(VALUERECEIVED_EVENT, log);
                ValueReceivedEventResponse typedResponse = new ValueReceivedEventResponse();
                typedResponse.log = log;
                typedResponse.sender = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.value = (BigInteger) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<ValueReceivedEventResponse> valueReceivedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(VALUERECEIVED_EVENT));
        return valueReceivedEventFlowable(filter);
    }

    public RemoteFunctionCall<TransactionReceipt> execute(BigInteger _operation, String _to, BigInteger _value, byte[] _data) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_EXECUTE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_operation), 
                new org.web3j.abi.datatypes.Address(160, _to), 
                new org.web3j.abi.datatypes.generated.Uint256(_value), 
                new org.web3j.abi.datatypes.DynamicBytes(_data)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<byte[]> getData(byte[] _key) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_GETDATA, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_key)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<DynamicBytes>() {}));
        return executeRemoteCallSingleValueReturn(function, byte[].class);
    }

    public RemoteFunctionCall<byte[]> isValidSignature(byte[] _hash, byte[] _signature) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_ISVALIDSIGNATURE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_hash), 
                new org.web3j.abi.datatypes.DynamicBytes(_signature)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bytes4>() {}));
        return executeRemoteCallSingleValueReturn(function, byte[].class);
    }

    public RemoteFunctionCall<String> owner() {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_OWNER, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteFunctionCall<TransactionReceipt> renounceOwnership() {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_RENOUNCEOWNERSHIP, 
                Arrays.<Type>asList(), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> setData(byte[] _key, byte[] _value) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_SETDATA, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_key), 
                new org.web3j.abi.datatypes.DynamicBytes(_value)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<Boolean> supportsInterface(byte[] interfaceId) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_SUPPORTSINTERFACE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes4(interfaceId)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteFunctionCall<TransactionReceipt> transferOwnership(String newOwner) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_TRANSFEROWNERSHIP, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, newOwner)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    @Deprecated
    public static ERC725Account load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new ERC725Account(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static ERC725Account load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new ERC725Account(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static ERC725Account load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new ERC725Account(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static ERC725Account load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new ERC725Account(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<ERC725Account> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider, String _newOwner) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _newOwner)));
        return deployRemoteCall(ERC725Account.class, web3j, credentials, contractGasProvider, BINARY, encodedConstructor);
    }

    public static RemoteCall<ERC725Account> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider, String _newOwner) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _newOwner)));
        return deployRemoteCall(ERC725Account.class, web3j, transactionManager, contractGasProvider, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<ERC725Account> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit, String _newOwner) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _newOwner)));
        return deployRemoteCall(ERC725Account.class, web3j, credentials, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<ERC725Account> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit, String _newOwner) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _newOwner)));
        return deployRemoteCall(ERC725Account.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    public static class ContractCreatedEventResponse extends BaseEventResponse {
        public String contractAddress;
    }

    public static class DataChangedEventResponse extends BaseEventResponse {
        public byte[] key;

        public byte[] value;
    }

    public static class ExecutedEventResponse extends BaseEventResponse {
        public BigInteger _operation;

        public String _to;

        public BigInteger _value;

        public byte[] _data;
    }

    public static class OwnershipTransferredEventResponse extends BaseEventResponse {
        public String previousOwner;

        public String newOwner;
    }

    public static class ValueReceivedEventResponse extends BaseEventResponse {
        public String sender;

        public BigInteger value;
    }
}
