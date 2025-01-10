// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {
    _KECCAK256_BYTES
} from "@lukso/lsp2-contracts/contracts/LSP2Constants.sol";

struct Link {
    string title;
    string url;
}

struct Attribute {
    string key;
    string value;
    string valueType;
}

struct Verification {
    string method;
    bytes32 data;
}

struct Image {
    uint256 width;
    uint256 height;
    string url;
    Verification verification;
}

struct Asset {
    string url;
    string fileType;
    Verification verification;
}

struct LSP7Asset {
    address contractAddress;
}

struct LSP8Asset {
    address contractAddress;
    bytes32 tokenId;
}

struct Icons {
    Image[] icons;
    LSP7Asset[] lsp7icons;
    LSP8Asset[] lsp8icons;
}

struct Assets {
    Asset[] assets;
    LSP7Asset[] lsp7assets;
    LSP8Asset[] lsp8assets;
}
struct GroupImageField {
    Image[] images;
    LSP7Asset[] lsp7images;
    LSP8Asset[] lsp8images;
}

struct Images {
    GroupImageField[] imageFields;
}

library LSP4Utils {
    using Strings for uint256;
    using Strings for address;

    function toJSON(Link memory link) internal pure returns (string memory) {
        return
            string.concat(
                '{"title":"',
                link.title,
                '","url":"',
                link.url,
                '"}'
            );
    }

    function toJSON(
        Link[] memory links
    ) internal pure returns (string memory object) {
        for (uint256 index; index < links.length; index++) {
            object = string.concat(object, toJSON(links[index]));

            if (index != links.length - 1) {
                object = string.concat(object, ",");
            }
        }
    }

    function toJSON(
        Attribute memory attribute
    ) internal pure returns (string memory) {
        return
            string.concat(
                '{"key":"',
                attribute.key,
                '","value":"',
                attribute.value,
                '","type":"',
                attribute.valueType,
                '"}'
            );
    }

    function toJSON(
        Attribute[] memory attributes
    ) internal pure returns (string memory object) {
        for (uint256 index; index < attributes.length; index++) {
            object = string.concat(object, toJSON(attributes[index]));

            if (index != attributes.length - 1) {
                object = string.concat(object, ",");
            }
        }
    }

    function toJSON(Image memory image) internal pure returns (string memory) {
        return
            string.concat(
                '{"width":',
                image.width.toString(),
                ',"height":',
                image.height.toString(),
                ',"url":"',
                image.url,
                '","verification":{"method":"',
                image.verification.method,
                '","data":"',
                uint256(image.verification.data).toHexString(32),
                '"}}'
            );
    }

    function toJSON(
        Image[] memory images
    ) internal pure returns (string memory object) {
        for (uint256 index; index < images.length; index++) {
            object = string.concat(object, toJSON(images[index]));

            if (index != images.length - 1) {
                object = string.concat(object, ",");
            }
        }
    }

    function toJSON(
        Image[][] memory images
    ) internal pure returns (string memory object) {
        for (uint256 index; index < images.length; index++) {
            object = string.concat(object, "[", toJSON(images[index]), "]");

            if (index != images.length - 1) {
                object = string.concat(object, ",");
            }
        }
    }

    function toJSON(Asset memory asset) internal pure returns (string memory) {
        return
            string.concat(
                '{"url":"',
                asset.url,
                '","fileType":"',
                asset.fileType,
                '","verification":{"method":"',
                asset.verification.method,
                '","data":"',
                uint256(asset.verification.data).toHexString(32),
                '"}}'
            );
    }

    function toJSON(
        Asset[] memory assets
    ) internal pure returns (string memory object) {
        for (uint256 index; index < assets.length; index++) {
            object = string.concat(object, toJSON(assets[index]));

            if (index != assets.length - 1) {
                object = string.concat(object, ",");
            }
        }
    }

    function toJSON(
        LSP7Asset memory asset
    ) internal pure returns (string memory) {
        return
            string.concat(
                '{"address":"',
                asset.contractAddress.toHexString(),
                '"}'
            );
    }

    function toJSON(
        LSP7Asset[] memory assets
    ) internal pure returns (string memory object) {
        for (uint256 index; index < assets.length; index++) {
            object = string.concat(object, toJSON(assets[index]));

            if (index != assets.length - 1) {
                object = string.concat(object, ",");
            }
        }
    }

    function toJSON(
        LSP7Asset[][] memory assets
    ) internal pure returns (string memory object) {
        for (uint256 index; index < assets.length; index++) {
            object = string.concat(object, "[", toJSON(assets[index]), "]");

            if (index != assets.length - 1) {
                object = string.concat(object, ",");
            }
        }
    }

    function toJSON(
        LSP8Asset memory asset
    ) internal pure returns (string memory) {
        return
            string.concat(
                '{"address":"',
                asset.contractAddress.toHexString(),
                '","tokenId":"',
                uint256(asset.tokenId).toHexString(),
                '"}'
            );
    }

    function toJSON(
        LSP8Asset[] memory assets
    ) internal pure returns (string memory object) {
        for (uint256 index; index < assets.length; index++) {
            object = string.concat(object, toJSON(assets[index]));

            if (index != assets.length - 1) {
                object = string.concat(object, ",");
            }
        }
    }

    function toJSON(
        LSP8Asset[][] memory assets
    ) internal pure returns (string memory object) {
        for (uint256 index; index < assets.length; index++) {
            object = string.concat(object, "[", toJSON(assets[index]), "]");

            if (index != assets.length - 1) {
                object = string.concat(object, ",");
            }
        }
    }

    function toJSON(
        Icons memory icons
    ) internal pure returns (string memory object) {
        object = string.concat(
            toJSON(icons.icons),
            icons.icons.length > 0 &&
                (icons.lsp7icons.length > 0 || icons.lsp8icons.length > 0)
                ? ","
                : "",
            toJSON(icons.lsp7icons),
            icons.lsp7icons.length > 0 && icons.lsp8icons.length > 0 ? "," : "",
            toJSON(icons.lsp8icons)
        );
    }

    function toJSON(
        Images memory images
    ) internal pure returns (string memory object) {
        for (uint256 index = 0; index < images.imageFields.length; index++) {
            GroupImageField memory image = images.imageFields[index];
            object = string.concat(
                object,
                "[",
                toJSON(image.images),
                image.images.length > 0 &&
                    (image.lsp7images.length > 0 || image.lsp8images.length > 0)
                    ? ","
                    : "",
                toJSON(image.lsp7images),
                image.lsp7images.length > 0 && image.lsp8images.length > 0
                    ? ","
                    : "",
                toJSON(image.lsp8images),
                "]"
            );

            if (index != images.imageFields.length - 1) {
                object = string.concat(object, ",");
            }
        }
    }

    function toJSON(
        Assets memory assets
    ) internal pure returns (string memory object) {
        object = string.concat(
            toJSON(assets.assets),
            assets.assets.length > 0 &&
                (assets.lsp7assets.length > 0 || assets.lsp8assets.length > 0)
                ? ","
                : "",
            toJSON(assets.lsp7assets),
            assets.lsp7assets.length > 0 && assets.lsp8assets.length > 0
                ? ","
                : "",
            toJSON(assets.lsp8assets)
        );
    }

    function toLSP4MetadataJSON(
        string memory name,
        string memory description,
        Link[] memory links,
        Attribute[] memory attributes,
        Icons memory icons,
        Images memory images,
        Assets memory assets
    ) public pure returns (string memory) {
        return
            string.concat(
                'data:application/json;charset=UTF-8,{"LSP4Metadata":{"name":"',
                name,
                '","description":"',
                description,
                '","links":[',
                toJSON(links),
                '],"attributes":[',
                toJSON(attributes),
                '],"icon":[',
                toJSON(icons),
                '],"images":[',
                toJSON(images),
                '],"assets":[',
                toJSON(assets),
                "]}}"
            );
    }

    function toVerifiableURI(
        string memory data
    ) internal pure returns (bytes memory verifiableURI) {
        return
            bytes.concat(
                bytes2(0),
                _KECCAK256_BYTES,
                bytes2(0x0020),
                keccak256(bytes(data)),
                bytes(data)
            );
    }
}
