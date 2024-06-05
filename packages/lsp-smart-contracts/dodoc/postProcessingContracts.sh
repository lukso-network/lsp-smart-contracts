if [ -z "$(ls -A ./docs/contracts/@lukso)" ]; then
   echo "Folder ./docs/contracts/@lukso is empty"
   exit 1
fi

for folder in ./docs/contracts/@lukso/*; do 
    ## remove the longest string from right to left
    ## which starts with "."
    lspN=${folder##*/}
    lspN=${lspN%%-*}

    case $lspN in

    lsp0)
        mkdir ./docs/contracts/LSP0ERC725Account/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP0ERC725Account/

        echo Contents from $folder/contracts have been moved
        ;;
    
    lsp14)
        mkdir ./docs/contracts/LSP14Ownable2Step/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP14Ownable2Step/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp16)
        mkdir ./docs/contracts/LSP16UniversalFactory/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP16UniversalFactory/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp17contractextension)
        mkdir ./docs/contracts/LSP17ContractExtension/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP17ContractExtension/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp1delegate)
        mkdir ./docs/contracts/LSP1UniversalReceiver/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP1UniversalReceiver/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp20)
        mkdir ./docs/contracts/LSP20CallVerification/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP20CallVerification/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp23)
        mkdir ./docs/contracts/LSP23LinkedContractsFactory/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP23LinkedContractsFactory/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp25)
        mkdir ./docs/contracts/LSP25ExecuteRelayCall/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP25ExecuteRelayCall/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp4)
        mkdir ./docs/contracts/LSP4DigitalAssetMetadata/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP4DigitalAssetMetadata/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp6)
        mkdir ./docs/contracts/LSP6KeyManager/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP6KeyManager/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp7)
        mkdir ./docs/contracts/LSP7DigitalAsset/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP7DigitalAsset/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp8)
        mkdir ./docs/contracts/LSP8IdentifiableDigitalAsset/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP8IdentifiableDigitalAsset/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp9)
        mkdir ./docs/contracts/LSP9Vault/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP9Vault/

        echo Contents from $folder/contracts have been moved
        ;;

    universalprofile)
        mkdir ./docs/contracts/UniversalProfile/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/UniversalProfile/

        echo Contents from $folder/contracts have been moved
        ;;

    *)
        echo $lspN does not have post processing.
        exit 1
        ;;

    esac
done

rm -rf ./docs/contracts/@lukso

if [ -z "$(ls -A ./docs/contracts/@lukso)" ]; then
   echo "Folder ./docs/contracts/@lukso is empty"
   exit 1
fi

for folder in ./docs/contracts/@lukso/*; do 
    ## remove the longest string from right to left
    ## which starts with "."
    lspN=${folder##*/}
    lspN=${lspN%%-*}

    case $lspN in

    lsp0)
        mkdir ./docs/contracts/LSP0ERC725Account/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP0ERC725Account/

        echo Contents from $folder/contracts have been moved
        ;;
    
    lsp14)
        mkdir ./docs/contracts/LSP14Ownable2Step/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP14Ownable2Step/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp16)
        mkdir ./docs/contracts/LSP16UniversalFactory/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP16UniversalFactory/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp17contractextension)
        mkdir ./docs/contracts/LSP17ContractExtension/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP17ContractExtension/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp1delegate)
        mkdir ./docs/contracts/LSP1UniversalReceiver/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP1UniversalReceiver/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp20)
        mkdir ./docs/contracts/LSP20CallVerification/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP20CallVerification/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp23)
        mkdir ./docs/contracts/LSP23LinkedContractsFactory/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP23LinkedContractsFactory/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp25)
        mkdir ./docs/contracts/LSP25ExecuteRelayCall/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP25ExecuteRelayCall/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp4)
        mkdir ./docs/contracts/LSP4DigitalAssetMetadata/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP4DigitalAssetMetadata/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp6)
        mkdir ./docs/contracts/LSP6KeyManager/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP6KeyManager/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp7)
        mkdir ./docs/contracts/LSP7DigitalAsset/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP7DigitalAsset/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp8)
        mkdir ./docs/contracts/LSP8IdentifiableDigitalAsset/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP8IdentifiableDigitalAsset/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp9)
        mkdir ./docs/contracts/LSP9Vault/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/LSP9Vault/

        echo Contents from $folder/contracts have been moved
        ;;

    universalprofile)
        mkdir ./docs/contracts/UniversalProfile/

        cp -r \
            $folder/contracts/ \
            ./docs/contracts/UniversalProfile/

        echo Contents from $folder/contracts have been moved
        ;;

    *)
        echo $lspN does not have post processing.
        exit 1
        ;;

    esac
done

rm -rf ./docs/contracts/@lukso
