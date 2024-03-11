// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {
    Link,
    Attribute,
    Image,
    Asset,
    LSP7Asset,
    LSP8Asset,
    LSP4Utils
} from "../LSP4Utils.sol";

contract LSP4MetadataTester {
    using LSP4Utils for string;
    using LSP4Utils for Link;
    using LSP4Utils for Link[];
    using LSP4Utils for Attribute;
    using LSP4Utils for Attribute[];
    using LSP4Utils for Image;
    using LSP4Utils for Image[];
    using LSP4Utils for Image[][];
    using LSP4Utils for Asset;
    using LSP4Utils for Asset[];
    using LSP4Utils for LSP7Asset;
    using LSP4Utils for LSP7Asset[];
    using LSP4Utils for LSP8Asset;
    using LSP4Utils for LSP8Asset[];

    function toJson(Link memory link) public pure returns (string memory) {
        return link.toJson();
    }

    function toJson(Link[] memory links) public pure returns (string memory) {
        return links.toJson();
    }

    function toJson(
        Attribute memory attribute
    ) public pure returns (string memory) {
        return attribute.toJson();
    }

    function toJson(
        Attribute[] memory attributes
    ) public pure returns (string memory) {
        return attributes.toJson();
    }

    function toJson(Image memory image) public pure returns (string memory) {
        return image.toJson();
    }

    function toJson(Image[] memory images) public pure returns (string memory) {
        return images.toJson();
    }

    function toJson(
        Image[][] memory images
    ) public pure returns (string memory) {
        return images.toJson();
    }

    function toJson(Asset memory asset) public pure returns (string memory) {
        return asset.toJson();
    }

    function toJson(Asset[] memory assets) public pure returns (string memory) {
        return assets.toJson();
    }

    function toJson(
        LSP7Asset memory asset
    ) public pure returns (string memory) {
        return asset.toJson();
    }

    function toJson(
        LSP7Asset[] memory assets
    ) public pure returns (string memory) {
        return assets.toJson();
    }

    function toJson(
        LSP8Asset memory asset
    ) public pure returns (string memory) {
        return asset.toJson();
    }

    function toJson(
        LSP8Asset[] memory assets
    ) public pure returns (string memory) {
        return assets.toJson();
    }

    function toVerifiableUri(
        string memory data
    ) public pure returns (bytes memory verifiableUri) {
        return data.toVerifiableURI();
    }

    function toLsp4Metadata(
        string memory data
    ) public pure returns (string memory) {
        return data.toLsp4Metadata();
    }
}
