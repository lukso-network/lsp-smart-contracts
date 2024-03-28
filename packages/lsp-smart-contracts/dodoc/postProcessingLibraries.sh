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
            ./$folder/libraries/ \
            ./docs/libraries/LSP1UniversalReceiver/
        rm -r ./$folder

        echo Contents from $folder/libraries have been moved
        ;;

    lsp2)
        mkdir ./docs/libraries/LSP2ERC725YJSONSchema/

        cp -r \
            ./$folder/libraries/ \
            ./docs/libraries/LSP2ERC725YJSONSchema/
        rm -r ./$folder

        echo Contents from $folder/libraries have been moved
        ;;

    lsp5)
        mkdir ./docs/libraries/LSP5ReceivedAssets/

        cp -r \
            ./$folder/libraries/ \
            ./docs/libraries/LSP5ReceivedAssets/
        rm -r ./$folder

        echo Contents from $folder/libraries have been moved
        ;;

    lsp6)
        mkdir ./docs/libraries/LSP6KeyManager/

        cp -r \
            ./$folder/libraries/ \
            ./docs/libraries/LSP6KeyManager/
        rm -r ./$folder

        echo Contents from $folder/libraries have been moved
        ;;

    lsp10)
        mkdir ./docs/libraries/LSP10ReceivedVaults/

        cp -r \
            ./$folder/libraries/ \
            ./docs/libraries/LSP10ReceivedVaults/
        rm -r ./$folder

        echo Contents from $folder/libraries have been moved
        ;;

    lsp17contractextension)
        mkdir ./docs/libraries/LSP17ContractExtension/

        cp -r \
            ./$folder/libraries/ \
            ./docs/libraries/LSP17ContractExtension/
        rm -r ./$folder

        echo Contents from $folder/libraries have been moved
        ;;

    *)
        echo $lspN does not have post processing.
        exit 1
        ;;

    esac

    rm -rf ./docs/libraries/@lukso
done