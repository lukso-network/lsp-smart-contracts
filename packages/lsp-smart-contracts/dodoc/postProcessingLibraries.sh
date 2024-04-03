if [ -z "$(ls -A ./docs/libraries/@lukso)" ]; then
   echo "Folder ./docs/libraries/@lukso is empty"
   exit 1
fi

for folder in ./docs/libraries/@lukso/*; do 
    ## remove the longest string from right to left
    ## which starts with "."
    lspN=${folder##*/}
    lspN=${lspN%%-*}

    case $lspN in

    lsp1)
        mkdir ./docs/libraries/LSP1UniversalReceiver/

        cp -r \
            $folder/contracts/ \
            ./docs/libraries/LSP1UniversalReceiver/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp2)
        mkdir ./docs/libraries/LSP2ERC725YJSONSchema/

        cp -r \
            $folder/contracts/ \
            ./docs/libraries/LSP2ERC725YJSONSchema/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp5)
        mkdir ./docs/libraries/LSP5ReceivedAssets/

        cp -r \
            $folder/contracts/ \
            ./docs/libraries/LSP5ReceivedAssets/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp6)
        mkdir ./docs/libraries/LSP6KeyManager/

        cp -r \
            $folder/contracts/ \
            ./docs/libraries/LSP6KeyManager/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp10)
        mkdir ./docs/libraries/LSP10ReceivedVaults/

        cp -r \
            $folder/contracts/ \
            ./docs/libraries/LSP10ReceivedVaults/

        echo Contents from $folder/contracts have been moved
        ;;

    lsp17contractextension)
        mkdir ./docs/libraries/LSP17ContractExtension/

        cp -r \
            $folder/contracts/ \
            ./docs/libraries/LSP17ContractExtension/

        echo Contents from $folder/contracts have been moved
        ;;

    *)
        echo $lspN does not have post processing.
        exit 1
        ;;

    esac
done

rm -rf ./docs/libraries/@lukso
