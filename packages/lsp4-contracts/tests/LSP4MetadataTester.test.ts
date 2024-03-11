import { ethers } from 'hardhat';
import { expect } from 'chai';
import { concat, hexlify, keccak256, randomBytes, toBeHex, toUtf8Bytes } from 'ethers';

import { LSP4MetadataTester, LSP4MetadataTester__factory } from '../types';

describe('testing LSP4MetadataTester', () => {
  let lspMetadataTester: LSP4MetadataTester;

  before(async () => {
    const signers = await ethers.getSigners();
    lspMetadataTester = await new LSP4MetadataTester__factory(signers[0]).deploy();
  });

  it('testing `toJson(Link)`', async () => {
    const link = {
      title: 'Twitter',
      url: 'https://twitter.com/first_one_username',
    };

    const result = await lspMetadataTester['toJson((string,string))'](link);

    expect(result).to.equal(JSON.stringify(link));
  });

  it('testing `toJson(Link[])`', async () => {
    const links = [
      {
        title: 'Twitter',
        url: 'https://twitter.com/first_one_username',
      },
      {
        title: 'X',
        url: 'https://twitter.com/some_other_username',
      },
    ];

    const result = await lspMetadataTester['toJson((string,string)[])'](links);

    expect(result).to.equal(JSON.stringify(links));
  });

  it('testing `toJson(Attribute)`', async () => {
    const attribute = {
      key: 'Skin',
      value: 'Orca',
      valueType: 'string',
    };

    const result = await lspMetadataTester['toJson((string,string,string))'](attribute);

    expect(result).to.equal(
      JSON.stringify({
        key: attribute.key,
        value: attribute.value,
        type: attribute.valueType,
      }),
    );
  });

  it('testing `toJson(Attribute[])`', async () => {
    const attributes = [
      {
        key: 'Skin',
        value: 'Orca',
        valueType: 'string',
      },
      {
        key: 'Eyes',
        value: 'Chill',
        valueType: 'string',
      },
    ];

    const result = await lspMetadataTester['toJson((string,string,string)[])'](attributes);

    expect(result).to.equal(
      JSON.stringify(
        attributes.map(({ key, value, valueType }) => ({
          key,
          value,
          type: valueType,
        })),
      ),
    );
  });

  it('testing `toJson(Image)`', async () => {
    const image = {
      width: '50',
      height: '50',
      url: 'ipfs://<image-cid>',
      verification: {
        method: 'keccak256(bytes)',
        data: hexlify(randomBytes(32)),
      },
    };

    const result = await lspMetadataTester['toJson((uint256,uint256,string,(string,bytes32)))'](
      image,
    );

    expect(result).to.equal(JSON.stringify(image));
  });

  it('testing `toJson(Image[])`', async () => {
    const images = [
      {
        width: '1024',
        height: '1024',
        url: 'ipfs://<first-image-cid-high-res>',
        verification: {
          method: 'keccak256(bytes)',
          data: hexlify(randomBytes(32)),
        },
      },
      {
        width: '512',
        height: '512',
        url: 'ipfs://<first-image-cid-low-res>',
        verification: {
          method: 'keccak256(bytes)',
          data: hexlify(randomBytes(32)),
        },
      },
    ];

    const result = await lspMetadataTester['toJson((uint256,uint256,string,(string,bytes32))[])'](
      images,
    );

    expect(result).to.equal(JSON.stringify(images));
  });

  it('testing `toJson(Image[][])`', async () => {
    const images = [
      [
        {
          width: '1024',
          height: '1024',
          url: 'ipfs://<first-image-cid-high-res>',
          verification: {
            method: 'keccak256(bytes)',
            data: hexlify(randomBytes(32)),
          },
        },
        {
          width: '512',
          height: '512',
          url: 'ipfs://<first-image-cid-low-res>',
          verification: {
            method: 'keccak256(bytes)',
            data: hexlify(randomBytes(32)),
          },
        },
      ],
      [
        {
          width: '1024',
          height: '1024',
          url: 'ipfs://<second-image-cid-high-res>',
          verification: {
            method: 'keccak256(bytes)',
            data: hexlify(randomBytes(32)),
          },
        },
        {
          width: '512',
          height: '512',
          url: 'ipfs://<second-image-cid-low-res>',
          verification: {
            method: 'keccak256(bytes)',
            data: hexlify(randomBytes(32)),
          },
        },
      ],
    ];

    const result = await lspMetadataTester['toJson((uint256,uint256,string,(string,bytes32))[][])'](
      images,
    );

    expect(result).to.equal(JSON.stringify(images));
  });

  it('testing `toJson(Asset)`', async () => {
    const asset = {
      url: 'ipfs://<video-cid>',
      fileType: 'mp4',
      verification: {
        method: 'keccak256(bytes)',
        data: hexlify(randomBytes(32)),
      },
    };

    const result = await lspMetadataTester['toJson((string,string,(string,bytes32)))'](asset);

    expect(result).to.equal(JSON.stringify(asset));
  });

  it('testing `toJson(Asset[])`', async () => {
    const assets = [
      {
        url: 'ipfs://<first-video-cid>',
        fileType: 'mp4',
        verification: {
          method: 'keccak256(bytes)',
          data: hexlify(randomBytes(32)),
        },
      },
      {
        url: 'ipfs://<second-video-cid>',
        fileType: 'mp4',
        verification: {
          method: 'keccak256(bytes)',
          data: hexlify(randomBytes(32)),
        },
      },
    ];

    const result = await lspMetadataTester['toJson((string,string,(string,bytes32))[])'](assets);

    expect(result).to.equal(JSON.stringify(assets));
  });

  it('testing `toJson(LSP7Asset)`', async () => {
    const lsp7asset = {
      contractAddress: hexlify(randomBytes(20)),
    };

    const result = await lspMetadataTester['toJson((address))'](lsp7asset);

    expect(result).to.equal(JSON.stringify({ address: lsp7asset.contractAddress }));
  });

  it('testing `toJson(LSP7Asset[])`', async () => {
    const lsp7assets = [
      {
        contractAddress: hexlify(randomBytes(20)),
      },
      {
        contractAddress: hexlify(randomBytes(20)),
      },
    ];

    const result = await lspMetadataTester['toJson((address)[])'](lsp7assets);

    expect(result).to.equal(
      JSON.stringify(lsp7assets.map(({ contractAddress }) => ({ address: contractAddress }))),
    );
  });

  it('testing `toJson(LSP8Asset)`', async () => {
    const lsp8Asset = {
      contractAddress: hexlify(randomBytes(20)),
      tokenId: hexlify(randomBytes(32)),
    };

    const result = await lspMetadataTester['toJson((address,bytes32))'](lsp8Asset);

    expect(result).to.equal(
      JSON.stringify({
        address: lsp8Asset.contractAddress,
        tokenId: lsp8Asset.tokenId,
      }),
    );
  });

  it('testing `toJson(LSP8Asset[])`', async () => {
    const lsp8Assets = [
      {
        contractAddress: hexlify(randomBytes(20)),
        tokenId: hexlify(randomBytes(32)),
      },
      {
        contractAddress: hexlify(randomBytes(20)),
        tokenId: hexlify(randomBytes(32)),
      },
    ];

    const result = await lspMetadataTester['toJson((address,bytes32)[])'](lsp8Assets);

    expect(result).to.equal(
      JSON.stringify(
        lsp8Assets.map(({ contractAddress, tokenId }) => ({
          address: contractAddress,
          tokenId,
        })),
      ),
    );
  });

  it('testing `toVerifiableUri(...)`', async () => {
    const data = 'Some random data, can be text, can be JSON';

    const identifier = toBeHex(0, 2);
    const verificationMethod = hexlify(keccak256(toUtf8Bytes('keccak256(bytes)'))).substring(0, 10);
    const verificationDataLength = toBeHex(32, 2);
    const verificationData = hexlify(keccak256(toUtf8Bytes(data)));
    const encodedData = toUtf8Bytes(data);

    const result = await lspMetadataTester.toVerifiableUri(data);

    expect(result).to.equal(
      concat([
        identifier,
        verificationMethod,
        verificationDataLength,
        verificationData,
        encodedData,
      ]),
    );
  });

  it('testing `toLsp4Metadata(...)`', async () => {
    const attributes = JSON.stringify([
      {
        key: 'Skin',
        value: 'Orca',
        type: 'string',
      },
      {
        key: 'Eyes',
        value: 'Chill',
        type: 'string',
      },
    ]);
    const images = JSON.stringify([
      [
        {
          width: '50',
          height: '50',
          url: 'ipfs://<image-cid>',
          verification: {
            method: 'keccak256(bytes)',
            data: hexlify(randomBytes(32)),
          },
        },
      ],
    ]);
    const assets = JSON.stringify([
      {
        url: 'ipfs://<first-video-cid>',
        fileType: 'mp4',
        verification: {
          method: 'keccak256(bytes)',
          data: hexlify(randomBytes(32)),
        },
      },
      {
        url: 'ipfs://<second-video-cid>',
        fileType: 'mp4',
        verification: {
          method: 'keccak256(bytes)',
          data: hexlify(randomBytes(32)),
        },
      },
    ]);

    const data = `${attributes},${images},${assets}`;
    const result = await lspMetadataTester.toLsp4Metadata(data);

    expect(result).to.equal(`data:application/json;charset=UTF-8,{"LSP4Metadata":{${data}}}`);
  });
});
