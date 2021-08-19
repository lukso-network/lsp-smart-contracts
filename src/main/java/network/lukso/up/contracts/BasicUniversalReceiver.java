package network.lukso.up.contracts;

import io.reactivex.Flowable;
import io.reactivex.functions.Function;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.DynamicBytes;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Bytes32;
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
public class BasicUniversalReceiver extends Contract {
    public static final String BINARY = "608060405234801561001057600080fd5b5061040d806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80636bb56a1414610030575b600080fd5b61004a6004803603810190610045919061019c565b610060565b6040516100579190610240565b60405180910390f35b60007fb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b60001b8314806100b557507f29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe89560001b83145b6100be57600080fd5b82833373ffffffffffffffffffffffffffffffffffffffff167f54b98940949b5ac0325c889c84db302d4e18faec431b48bdc81706bfe482cfbd85604051610106919061025b565b60405180910390a482905092915050565b600061012a610125846102a2565b61027d565b905082815260208101848484011115610146576101456103a0565b5b6101518482856102f9565b509392505050565b600081359050610168816103c0565b92915050565b600082601f8301126101835761018261039b565b5b8135610193848260208601610117565b91505092915050565b600080604083850312156101b3576101b26103aa565b5b60006101c185828601610159565b925050602083013567ffffffffffffffff8111156101e2576101e16103a5565b5b6101ee8582860161016e565b9150509250929050565b610201816102ef565b82525050565b6000610212826102d3565b61021c81856102de565b935061022c818560208601610308565b610235816103af565b840191505092915050565b600060208201905061025560008301846101f8565b92915050565b600060208201905081810360008301526102758184610207565b905092915050565b6000610287610298565b9050610293828261033b565b919050565b6000604051905090565b600067ffffffffffffffff8211156102bd576102bc61036c565b5b6102c6826103af565b9050602081019050919050565b600081519050919050565b600082825260208201905092915050565b6000819050919050565b82818337600083830152505050565b60005b8381101561032657808201518184015260208101905061030b565b83811115610335576000848401525b50505050565b610344826103af565b810181811067ffffffffffffffff821117156103635761036261036c565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b6103c9816102ef565b81146103d457600080fd5b5056fea26469706673582212205f5ad136ab033649568b1376349134c2a83f2b62328e4a18a82f2d4e83d948b164736f6c63430008070033";

    public static final String FUNC_UNIVERSALRECEIVER = "universalReceiver";

    public static final Event UNIVERSALRECEIVER_EVENT = new Event("UniversalReceiver", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Bytes32>(true) {}, new TypeReference<Bytes32>(true) {}, new TypeReference<DynamicBytes>() {}));
    ;

    @Deprecated
    protected BasicUniversalReceiver(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected BasicUniversalReceiver(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected BasicUniversalReceiver(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected BasicUniversalReceiver(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public List<UniversalReceiverEventResponse> getUniversalReceiverEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(UNIVERSALRECEIVER_EVENT, transactionReceipt);
        ArrayList<UniversalReceiverEventResponse> responses = new ArrayList<UniversalReceiverEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            UniversalReceiverEventResponse typedResponse = new UniversalReceiverEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.from = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.typeId = (byte[]) eventValues.getIndexedValues().get(1).getValue();
            typedResponse.returnedValue = (byte[]) eventValues.getIndexedValues().get(2).getValue();
            typedResponse.receivedData = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<UniversalReceiverEventResponse> universalReceiverEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, UniversalReceiverEventResponse>() {
            @Override
            public UniversalReceiverEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(UNIVERSALRECEIVER_EVENT, log);
                UniversalReceiverEventResponse typedResponse = new UniversalReceiverEventResponse();
                typedResponse.log = log;
                typedResponse.from = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.typeId = (byte[]) eventValues.getIndexedValues().get(1).getValue();
                typedResponse.returnedValue = (byte[]) eventValues.getIndexedValues().get(2).getValue();
                typedResponse.receivedData = (byte[]) eventValues.getNonIndexedValues().get(0).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<UniversalReceiverEventResponse> universalReceiverEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(UNIVERSALRECEIVER_EVENT));
        return universalReceiverEventFlowable(filter);
    }

    public RemoteFunctionCall<TransactionReceipt> universalReceiver(byte[] typeId, byte[] data) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_UNIVERSALRECEIVER, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(typeId), 
                new org.web3j.abi.datatypes.DynamicBytes(data)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    @Deprecated
    public static BasicUniversalReceiver load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new BasicUniversalReceiver(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static BasicUniversalReceiver load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new BasicUniversalReceiver(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static BasicUniversalReceiver load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new BasicUniversalReceiver(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static BasicUniversalReceiver load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new BasicUniversalReceiver(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<BasicUniversalReceiver> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return deployRemoteCall(BasicUniversalReceiver.class, web3j, credentials, contractGasProvider, BINARY, "");
    }

    @Deprecated
    public static RemoteCall<BasicUniversalReceiver> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return deployRemoteCall(BasicUniversalReceiver.class, web3j, credentials, gasPrice, gasLimit, BINARY, "");
    }

    public static RemoteCall<BasicUniversalReceiver> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return deployRemoteCall(BasicUniversalReceiver.class, web3j, transactionManager, contractGasProvider, BINARY, "");
    }

    @Deprecated
    public static RemoteCall<BasicUniversalReceiver> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return deployRemoteCall(BasicUniversalReceiver.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, "");
    }

    public static class UniversalReceiverEventResponse extends BaseEventResponse {
        public String from;

        public byte[] typeId;

        public byte[] returnedValue;

        public byte[] receivedData;
    }
}
