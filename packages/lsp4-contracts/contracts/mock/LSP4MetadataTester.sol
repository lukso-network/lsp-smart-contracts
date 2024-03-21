// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    Link,
    Attribute,
    Image,
    Asset,
    LSP7Asset,
    LSP8Asset,
    Icons,
    Images,
    Assets,
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
    using LSP4Utils for LSP7Asset[][];
    using LSP4Utils for LSP8Asset;
    using LSP4Utils for LSP8Asset[];
    using LSP4Utils for LSP8Asset[][];
    using LSP4Utils for Icons;
    using LSP4Utils for Images;
    using LSP4Utils for Assets;

    function toJSON(Link memory link) public pure returns (string memory) {
        return link.toJSON();
    }

    function toJSON(Link[] memory links) public pure returns (string memory) {
        return links.toJSON();
    }

    function toJSON(
        Attribute memory attribute
    ) public pure returns (string memory) {
        return attribute.toJSON();
    }

    function toJSON(
        Attribute[] memory attributes
    ) public pure returns (string memory) {
        return attributes.toJSON();
    }

    function toJSON(Image memory image) public pure returns (string memory) {
        return image.toJSON();
    }

    function toJSON(Image[] memory images) public pure returns (string memory) {
        return images.toJSON();
    }

    function toJSON(
        Image[][] memory images
    ) public pure returns (string memory) {
        return images.toJSON();
    }

    function toJSON(Asset memory asset) public pure returns (string memory) {
        return asset.toJSON();
    }

    function toJSON(Asset[] memory assets) public pure returns (string memory) {
        return assets.toJSON();
    }

    function toJSON(
        LSP7Asset memory asset
    ) public pure returns (string memory) {
        return asset.toJSON();
    }

    function toJSON(
        LSP7Asset[] memory assets
    ) public pure returns (string memory) {
        return assets.toJSON();
    }

    function toJSON(
        LSP7Asset[][] memory assets
    ) public pure returns (string memory) {
        return assets.toJSON();
    }

    function toJSON(
        LSP8Asset memory asset
    ) public pure returns (string memory) {
        return asset.toJSON();
    }

    function toJSON(
        LSP8Asset[] memory assets
    ) public pure returns (string memory) {
        return assets.toJSON();
    }

    function toJSON(
        LSP8Asset[][] memory assets
    ) public pure returns (string memory) {
        return assets.toJSON();
    }

    function toJSON(Icons memory icons) public pure returns (string memory) {
        return icons.toJSON();
    }

    function toJSON(Images memory images) public pure returns (string memory) {
        return images.toJSON();
    }

    function toJSON(Assets memory assets) public pure returns (string memory) {
        return assets.toJSON();
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
            toLSP4MetadataJSON(
                name,
                description,
                links,
                attributes,
                icons,
                images,
                assets
            );
    }

    function toVerifiableURI(
        string memory data
    ) public pure returns (bytes memory verifiableUri) {
        return data.toVerifiableURI();
    }
}
