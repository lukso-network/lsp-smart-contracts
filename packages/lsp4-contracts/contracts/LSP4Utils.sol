// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

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

library LSP4Utils {
    using Strings for uint256;
    using Strings for address;

    function toJson(Link memory link) internal pure returns (string memory) {
        return
            string.concat(
                "{",
                '"title":',
                string.concat('"', link.title, '"'),
                ",",
                '"url":',
                string.concat('"', link.url, '"'),
                "}"
            );
    }

    function toJson(
        Link[] memory links
    ) internal pure returns (string memory object) {
        for (uint256 index; index < links.length; index++) {
            object = string.concat(object, toJson(links[index]));

            if (index != links.length - 1) {
                object = string.concat(object, ",");
            }
        }

        object = string.concat("[", object, "]");
    }

    function toJson(
        Attribute memory attribute
    ) internal pure returns (string memory) {
        return
            string.concat(
                "{",
                '"key":',
                string.concat('"', attribute.key, '"'),
                ",",
                '"value":',
                string.concat('"', attribute.value, '"'),
                ",",
                '"type":',
                string.concat('"', attribute.valueType, '"'),
                "}"
            );
    }

    function toJson(
        Attribute[] memory attributes
    ) internal pure returns (string memory object) {
        for (uint256 index; index < attributes.length; index++) {
            object = string.concat(object, toJson(attributes[index]));

            if (index != attributes.length - 1) {
                object = string.concat(object, ",");
            }
        }

        object = string.concat("[", object, "]");
    }

    function toJson(Image memory image) internal pure returns (string memory) {
        return
            string.concat(
                "{",
                '"width":',
                string.concat('"', image.width.toString(), '"'),
                ",",
                '"height":',
                string.concat('"', image.height.toString(), '"'),
                ",",
                '"url":',
                string.concat('"', image.url, '"'),
                ",",
                '"verification":',
                "{",
                '"method":',
                string.concat('"', image.verification.method, '"'),
                ",",
                '"data":',
                string.concat(
                    '"',
                    uint256(image.verification.data).toHexString(32),
                    '"'
                ),
                "}",
                "}"
            );
    }

    function toJson(
        Image[] memory images
    ) internal pure returns (string memory object) {
        for (uint256 index; index < images.length; index++) {
            object = string.concat(object, toJson(images[index]));

            if (index != images.length - 1) {
                object = string.concat(object, ",");
            }
        }

        object = string.concat("[", object, "]");
    }

    function toJson(
        Image[][] memory images
    ) internal pure returns (string memory object) {
        for (uint256 index; index < images.length; index++) {
            object = string.concat(object, toJson(images[index]));

            if (index != images.length - 1) {
                object = string.concat(object, ",");
            }
        }

        object = string.concat("[", object, "]");
    }

    function toJson(Asset memory asset) internal pure returns (string memory) {
        return
            string.concat(
                "{",
                '"url":',
                string.concat('"', asset.url, '"'),
                ",",
                '"fileType":',
                string.concat('"', asset.fileType, '"'),
                ",",
                '"verification":',
                "{",
                '"method":',
                string.concat('"', asset.verification.method, '"'),
                ",",
                '"data":',
                string.concat(
                    '"',
                    uint256(asset.verification.data).toHexString(32),
                    '"'
                ),
                "}",
                "}"
            );
    }

    function toJson(
        Asset[] memory assets
    ) internal pure returns (string memory object) {
        for (uint256 index; index < assets.length; index++) {
            object = string.concat(object, toJson(assets[index]));

            if (index != assets.length - 1) {
                object = string.concat(object, ",");
            }
        }

        object = string.concat("[", object, "]");
    }

    function toJson(
        LSP7Asset memory asset
    ) internal pure returns (string memory) {
        return
            string.concat(
                "{",
                '"address":',
                string.concat('"', asset.contractAddress.toHexString(), '"'),
                "}"
            );
    }

    function toJson(
        LSP7Asset[] memory assets
    ) internal pure returns (string memory object) {
        for (uint256 index; index < assets.length; index++) {
            object = string.concat(object, toJson(assets[index]));

            if (index != assets.length - 1) {
                object = string.concat(object, ",");
            }
        }

        object = string.concat("[", object, "]");
    }

    function toJson(
        LSP8Asset memory asset
    ) internal pure returns (string memory) {
        return
            string.concat(
                "{",
                '"address":',
                string.concat('"', asset.contractAddress.toHexString(), '"'),
                ",",
                '"tokenId":',
                string.concat('"', uint256(asset.tokenId).toHexString(), '"'),
                "}"
            );
    }

    function toJson(
        LSP8Asset[] memory assets
    ) internal pure returns (string memory object) {
        for (uint256 index; index < assets.length; index++) {
            object = string.concat(object, toJson(assets[index]));

            if (index != assets.length - 1) {
                object = string.concat(object, ",");
            }
        }

        object = string.concat("[", object, "]");
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

    function toLsp4Metadata(
        string memory lsp4Metadata
    ) internal pure returns (string memory) {
        return (
            string.concat(
                "data:application/json;charset=UTF-8,",
                "{",
                '"LSP4Metadata":',
                "{",
                lsp4Metadata,
                "}",
                "}"
            )
        );
    }
}
