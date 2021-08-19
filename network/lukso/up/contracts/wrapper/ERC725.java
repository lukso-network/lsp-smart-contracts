package network.lukso.up.contracts.wrapper;

import io.reactivex.Flowable;
import io.reactivex.functions.Function;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
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
public class ERC725 extends Contract {
    public static final String BINARY = "0x60806040523480156200001157600080fd5b5060405162001f4938038062001f498339818101604052810190620000379190620004b0565b808160006200004b620001cd60201b60201c565b905080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a350620000fa620001d560201b60201c565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16146200013f576200013e81620001ff60201b60201c565b5b620001576344c028fe60e01b620003c160201b60201c565b5062000168620001d560201b60201c565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614620001ad57620001ac81620001ff60201b60201c565b5b620001c5632bd57b7360e01b620003c160201b60201c565b5050620006c2565b600033905090565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6200020f620001cd60201b60201c565b73ffffffffffffffffffffffffffffffffffffffff1662000235620001d560201b60201c565b73ffffffffffffffffffffffffffffffffffffffff16146200028e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040162000285906200059b565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141562000301576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620002f89062000557565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a380600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614156200042d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620004249062000579565b60405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b600081519050620004aa81620006a8565b92915050565b600060208284031215620004c957620004c862000602565b5b6000620004d98482850162000499565b91505092915050565b6000620004f1602683620005bd565b9150620004fe8262000607565b604082019050919050565b600062000518601c83620005bd565b9150620005258262000656565b602082019050919050565b60006200053f602083620005bd565b91506200054c826200067f565b602082019050919050565b600060208201905081810360008301526200057281620004e2565b9050919050565b60006020820190508181036000830152620005948162000509565b9050919050565b60006020820190508181036000830152620005b68162000530565b9050919050565b600082825260208201905092915050565b6000620005db82620005e2565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600080fd5b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f4552433136353a20696e76616c696420696e7465726661636520696400000000600082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b620006b381620005ce565b8114620006bf57600080fd5b50565b61187780620006d26000396000f3fe6080604052600436106100705760003560e01c8063715018a61161004e578063715018a61461010b5780637f23690c146101225780638da5cb5b1461014b578063f2fde38b1461017657610070565b806301ffc9a71461007557806344c028fe146100b257806354f6127f146100ce575b600080fd5b34801561008157600080fd5b5061009c60048036038101906100979190610fa1565b61019f565b6040516100a99190611253565b60405180910390f35b6100cc60048036038101906100c79190610fce565b610216565b005b3480156100da57600080fd5b506100f560048036038101906100f09190610f14565b61051e565b6040516101029190611292565b60405180910390f35b34801561011757600080fd5b506101206105c3565b005b34801561012e57600080fd5b5061014960048036038101906101449190610f41565b610700565b005b34801561015757600080fd5b506101606107de565b60405161016d9190611238565b60405180910390f35b34801561018257600080fd5b5061019d60048036038101906101989190610ee7565b610808565b005b60006101aa826109b4565b8061020f5750600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff165b9050919050565b61021e610a1e565b73ffffffffffffffffffffffffffffffffffffffff1661023c6107de565b73ffffffffffffffffffffffffffffffffffffffff1614610292576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161028990611374565b60405180910390fd5b828473ffffffffffffffffffffffffffffffffffffffff16867f1f920dbda597d7bf95035464170fa58d0a4b57f13a1c315ace6793b9f63688b885856040516102dc92919061126e565b60405180910390a460006109c45a6102f49190611477565b905060008614156103555761034f858585858080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505084610a26565b50610516565b60038614156103b2576103ac8484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610a3f565b50610515565b60028614156104d957600061041a84848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050506020868690506104159190611477565b610b04565b9050600061047d85858080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505060006020888890506104789190611477565b610b6b565b9050600061048c878484610c89565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2505050610514565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161050b90611394565b60405180910390fd5b5b5b505050505050565b606060026000838152602001908152602001600020805461053e9061156b565b80601f016020809104026020016040519081016040528092919081815260200182805461056a9061156b565b80156105b75780601f1061058c576101008083540402835291602001916105b7565b820191906000526020600020905b81548152906001019060200180831161059a57829003601f168201915b50505050509050919050565b6105cb610a1e565b73ffffffffffffffffffffffffffffffffffffffff166105e96107de565b73ffffffffffffffffffffffffffffffffffffffff161461063f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161063690611374565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a36000600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b610708610a1e565b73ffffffffffffffffffffffffffffffffffffffff166107266107de565b73ffffffffffffffffffffffffffffffffffffffff161461077c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161077390611374565b60405180910390fd5b818160026000868152602001908152602001600020919061079e929190610d9a565b50827fece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b283836040516107d192919061126e565b60405180910390a2505050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b610810610a1e565b73ffffffffffffffffffffffffffffffffffffffff1661082e6107de565b73ffffffffffffffffffffffffffffffffffffffff1614610884576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161087b90611374565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156108f4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108eb906112d4565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a380600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b600033905090565b6000806000845160208601878987f19050949350505050565b600081516020830184f09050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610abb576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ab290611334565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a292915050565b6000602082610b139190611421565b83511015610b56576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b4d90611354565b60405180910390fd5b60008260208501015190508091505092915050565b606081601f83610b7b9190611421565b1015610bbc576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bb3906112f4565b60405180910390fd5b8183610bc89190611421565b84511015610c0b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c02906113b4565b60405180910390fd5b6060821560008114610c2c5760405191506000825260208201604052610c7d565b6040519150601f8416801560200281840101858101878315602002848b0101015b81831015610c6a5780518352602083019250602081019050610c4d565b50868552601f19601f8301166040525050505b50809150509392505050565b60008084471015610ccf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cc6906113d4565b60405180910390fd5b600083511415610d14576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0b906112b4565b60405180910390fd5b8383516020850187f59050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610d8f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d8690611314565b60405180910390fd5b809150509392505050565b828054610da69061156b565b90600052602060002090601f016020900481019282610dc85760008555610e0f565b82601f10610de157803560ff1916838001178555610e0f565b82800160010185558215610e0f579182015b82811115610e0e578235825591602001919060010190610df3565b5b509050610e1c9190610e20565b5090565b5b80821115610e39576000816000905550600101610e21565b5090565b600081359050610e4c816117e5565b92915050565b600081359050610e61816117fc565b92915050565b600081359050610e7681611813565b92915050565b60008083601f840112610e9257610e91611600565b5b8235905067ffffffffffffffff811115610eaf57610eae6115fb565b5b602083019150836001820283011115610ecb57610eca611605565b5b9250929050565b600081359050610ee18161182a565b92915050565b600060208284031215610efd57610efc61160f565b5b6000610f0b84828501610e3d565b91505092915050565b600060208284031215610f2a57610f2961160f565b5b6000610f3884828501610e52565b91505092915050565b600080600060408486031215610f5a57610f5961160f565b5b6000610f6886828701610e52565b935050602084013567ffffffffffffffff811115610f8957610f8861160a565b5b610f9586828701610e7c565b92509250509250925092565b600060208284031215610fb757610fb661160f565b5b6000610fc584828501610e67565b91505092915050565b600080600080600060808688031215610fea57610fe961160f565b5b6000610ff888828901610ed2565b955050602061100988828901610e3d565b945050604061101a88828901610ed2565b935050606086013567ffffffffffffffff81111561103b5761103a61160a565b5b61104788828901610e7c565b92509250509295509295909350565b61105f816114ab565b82525050565b61106e816114bd565b82525050565b600061108083856113ff565b935061108d838584611529565b61109683611614565b840190509392505050565b60006110ac826113f4565b6110b681856113ff565b93506110c6818560208601611538565b6110cf81611614565b840191505092915050565b60006110e7602083611410565b91506110f282611625565b602082019050919050565b600061110a602683611410565b91506111158261164e565b604082019050919050565b600061112d600e83611410565b91506111388261169d565b602082019050919050565b6000611150601983611410565b915061115b826116c6565b602082019050919050565b6000611173601983611410565b915061117e826116ef565b602082019050919050565b6000611196601583611410565b91506111a182611718565b602082019050919050565b60006111b9602083611410565b91506111c482611741565b602082019050919050565b60006111dc601483611410565b91506111e78261176a565b602082019050919050565b60006111ff601183611410565b915061120a82611793565b602082019050919050565b6000611222601d83611410565b915061122d826117bc565b602082019050919050565b600060208201905061124d6000830184611056565b92915050565b60006020820190506112686000830184611065565b92915050565b60006020820190508181036000830152611289818486611074565b90509392505050565b600060208201905081810360008301526112ac81846110a1565b905092915050565b600060208201905081810360008301526112cd816110da565b9050919050565b600060208201905081810360008301526112ed816110fd565b9050919050565b6000602082019050818103600083015261130d81611120565b9050919050565b6000602082019050818103600083015261132d81611143565b9050919050565b6000602082019050818103600083015261134d81611166565b9050919050565b6000602082019050818103600083015261136d81611189565b9050919050565b6000602082019050818103600083015261138d816111ac565b9050919050565b600060208201905081810360008301526113ad816111cf565b9050919050565b600060208201905081810360008301526113cd816111f2565b9050919050565b600060208201905081810360008301526113ed81611215565b9050919050565b600081519050919050565b600082825260208201905092915050565b600082825260208201905092915050565b600061142c8261151f565b91506114378361151f565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561146c5761146b61159d565b5b828201905092915050565b60006114828261151f565b915061148d8361151f565b9250828210156114a05761149f61159d565b5b828203905092915050565b60006114b6826114ff565b9050919050565b60008115159050919050565b6000819050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b60005b8381101561155657808201518184015260208101905061153b565b83811115611565576000848401525b50505050565b6000600282049050600182168061158357607f821691505b60208210811415611597576115966115cc565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f437265617465323a2062797465636f6465206c656e677468206973207a65726f600082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f736c6963655f6f766572666c6f77000000000000000000000000000000000000600082015250565b7f437265617465323a204661696c6564206f6e206465706c6f7900000000000000600082015250565b7f436f756c64206e6f74206465706c6f7920636f6e747261637400000000000000600082015250565b7f746f427974657333325f6f75744f66426f756e64730000000000000000000000600082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b7f57726f6e67206f7065726174696f6e2074797065000000000000000000000000600082015250565b7f736c6963655f6f75744f66426f756e6473000000000000000000000000000000600082015250565b7f437265617465323a20696e73756666696369656e742062616c616e6365000000600082015250565b6117ee816114ab565b81146117f957600080fd5b50565b611805816114c9565b811461181057600080fd5b50565b61181c816114d3565b811461182757600080fd5b50565b6118338161151f565b811461183e57600080fd5b5056fea2646970667358221220142aaf32d91268a50b80c00913209f355c22118f3a0781103deea36c949c420364736f6c63430008060033";

    public static final String FUNC_EXECUTE = "execute";

    public static final String FUNC_GETDATA = "getData";

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

    protected static final HashMap<String, String> _addresses;

    static {
        _addresses = new HashMap<String, String>();
    }

    @Deprecated
    protected ERC725(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected ERC725(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected ERC725(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected ERC725(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
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

    public RemoteFunctionCall<TransactionReceipt> execute(BigInteger _operation, String _to, BigInteger _value, byte[] _data) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_EXECUTE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(_operation), 
                new org.web3j.abi.datatypes.Address(_to), 
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
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(newOwner)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    @Deprecated
    public static ERC725 load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new ERC725(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static ERC725 load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new ERC725(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static ERC725 load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new ERC725(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static ERC725 load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new ERC725(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<ERC725> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider, String _newOwner) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_newOwner)));
        return deployRemoteCall(ERC725.class, web3j, credentials, contractGasProvider, BINARY, encodedConstructor);
    }

    public static RemoteCall<ERC725> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider, String _newOwner) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_newOwner)));
        return deployRemoteCall(ERC725.class, web3j, transactionManager, contractGasProvider, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<ERC725> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit, String _newOwner) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_newOwner)));
        return deployRemoteCall(ERC725.class, web3j, credentials, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    @Deprecated
    public static RemoteCall<ERC725> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit, String _newOwner) {
        String encodedConstructor = FunctionEncoder.encodeConstructor(Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(_newOwner)));
        return deployRemoteCall(ERC725.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, encodedConstructor);
    }

    protected String getStaticDeployedAddress(String networkId) {
        return _addresses.get(networkId);
    }

    public static String getPreviouslyDeployedAddress(String networkId) {
        return _addresses.get(networkId);
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
}
