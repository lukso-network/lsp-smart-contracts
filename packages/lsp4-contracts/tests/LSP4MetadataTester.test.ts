import { ethers } from 'hardhat';
import { expect } from 'chai';
import { concat, hexlify, keccak256, randomBytes, toBeHex, toUtf8Bytes } from 'ethers';

import { LSP4MetadataTester, LSP4MetadataTester__factory } from '../typechain';

describe('testing LSP4MetadataTester', () => {
  let lspMetadataTester: LSP4MetadataTester;

  before(async () => {
    const signers = await ethers.getSigners();
    lspMetadataTester = await new LSP4MetadataTester__factory(signers[0]).deploy();
  });

  it('testing `toJSON(Link)`', async () => {
    const link = {
      title: 'Twitter',
      url: 'https://twitter.com/first_one_username',
    };

    const result = await lspMetadataTester['toJSON((string,string))'](link);

    expect(result).to.equal(JSON.stringify(link));
  });

  it('testing `toJSON(Link[])`', async () => {
    const firstLink = {
      title: 'Twitter',
      url: 'https://twitter.com/first_one_username',
    };
    const secondLink = {
      title: 'X',
      url: 'https://twitter.com/some_other_username',
    };
    const links = [firstLink, secondLink];

    const result = await lspMetadataTester['toJSON((string,string)[])'](links);

    expect(result).to.equal(`${JSON.stringify(firstLink)},${JSON.stringify(secondLink)}`);
  });

  it('testing `toJSON(Attribute)`', async () => {
    const attribute = {
      key: 'Skin',
      value: 'Orca',
      valueType: 'string',
    };

    const result = await lspMetadataTester['toJSON((string,string,string))'](attribute);

    expect(result).to.equal(
      JSON.stringify({
        key: attribute.key,
        value: attribute.value,
        type: attribute.valueType,
      }),
    );
  });

  it('testing `toJSON(Attribute[])`', async () => {
    const firstAttribute = {
      key: 'Skin',
      value: 'Orca',
      valueType: 'string',
    };
    const secondAttribute = {
      key: 'Eyes',
      value: 'Chill',
      valueType: 'string',
    };
    const attributes = [firstAttribute, secondAttribute];

    const result = await lspMetadataTester['toJSON((string,string,string)[])'](attributes);

    expect(result).to.equal(
      `${JSON.stringify({
        key: firstAttribute.key,
        value: firstAttribute.value,
        type: firstAttribute.valueType,
      })},${JSON.stringify({
        key: secondAttribute.key,
        value: secondAttribute.value,
        type: secondAttribute.valueType,
      })}`,
    );
  });

  it('testing `toJSON(Image)`', async () => {
    const image = {
      width: 50,
      height: 50,
      url: 'ipfs://<image-cid>',
      verification: {
        method: 'keccak256(bytes)',
        data: hexlify(randomBytes(32)),
      },
    };

    const result = await lspMetadataTester['toJSON((uint256,uint256,string,(string,bytes32)))'](
      image,
    );

    expect(result).to.equal(JSON.stringify(image));
  });

  it('testing `toJSON(Image[])`', async () => {
    const firstImage = {
      width: 1024,
      height: 1024,
      url: 'ipfs://<first-image-cid-high-res>',
      verification: {
        method: 'keccak256(bytes)',
        data: hexlify(randomBytes(32)),
      },
    };
    const secondImage = {
      width: 512,
      height: 512,
      url: 'ipfs://<first-image-cid-low-res>',
      verification: {
        method: 'keccak256(bytes)',
        data: hexlify(randomBytes(32)),
      },
    };
    const images = [firstImage, secondImage];

    const result = await lspMetadataTester['toJSON((uint256,uint256,string,(string,bytes32))[])'](
      images,
    );

    expect(result).to.equal(`${JSON.stringify(firstImage)},${JSON.stringify(secondImage)}`);
  });

  it('testing `toJSON(Image[][])`', async () => {
    const firstImagesGroup = [
      {
        width: 1024,
        height: 1024,
        url: 'ipfs://<first-image-cid-high-res>',
        verification: {
          method: 'keccak256(bytes)',
          data: hexlify(randomBytes(32)),
        },
      },
      {
        width: 512,
        height: 512,
        url: 'ipfs://<first-image-cid-low-res>',
        verification: {
          method: 'keccak256(bytes)',
          data: hexlify(randomBytes(32)),
        },
      },
    ];
    const secondImagesGroup = [
      {
        width: 1024,
        height: 1024,
        url: 'ipfs://<second-image-cid-high-res>',
        verification: {
          method: 'keccak256(bytes)',
          data: hexlify(randomBytes(32)),
        },
      },
      {
        width: 512,
        height: 512,
        url: 'ipfs://<second-image-cid-low-res>',
        verification: {
          method: 'keccak256(bytes)',
          data: hexlify(randomBytes(32)),
        },
      },
    ];
    const images = [firstImagesGroup, secondImagesGroup];

    const result = await lspMetadataTester['toJSON((uint256,uint256,string,(string,bytes32))[][])'](
      images,
    );

    expect(result).to.equal(
      `${JSON.stringify(firstImagesGroup)},${JSON.stringify(secondImagesGroup)}`,
    );
  });

  it('testing `toJSON(Asset)`', async () => {
    const asset = {
      url: 'ipfs://<video-cid>',
      fileType: 'mp4',
      verification: {
        method: 'keccak256(bytes)',
        data: hexlify(randomBytes(32)),
      },
    };

    const result = await lspMetadataTester['toJSON((string,string,(string,bytes32)))'](asset);

    expect(result).to.equal(JSON.stringify(asset));
  });

  it('testing `toJSON(Asset[])`', async () => {
    const firstAsset = {
      url: 'ipfs://<first-video-cid>',
      fileType: 'mp4',
      verification: {
        method: 'keccak256(bytes)',
        data: hexlify(randomBytes(32)),
      },
    };
    const secondAsset = {
      url: 'ipfs://<second-video-cid>',
      fileType: 'mp4',
      verification: {
        method: 'keccak256(bytes)',
        data: hexlify(randomBytes(32)),
      },
    };
    const assets = [firstAsset, secondAsset];

    const result = await lspMetadataTester['toJSON((string,string,(string,bytes32))[])'](assets);

    expect(result).to.equal(`${JSON.stringify(firstAsset)},${JSON.stringify(secondAsset)}`);
  });

  it('testing `toJSON(LSP7Asset)`', async () => {
    const lsp7asset = {
      contractAddress: hexlify(randomBytes(20)),
    };

    const result = await lspMetadataTester['toJSON((address))'](lsp7asset);

    expect(result).to.equal(JSON.stringify({ address: lsp7asset.contractAddress }));
  });

  it('testing `toJSON(LSP7Asset[])`', async () => {
    const firstLsp7Asset = {
      contractAddress: hexlify(randomBytes(20)),
    };
    const secondLsp7Asset = {
      contractAddress: hexlify(randomBytes(20)),
    };
    const lsp7assets = [firstLsp7Asset, secondLsp7Asset];

    const result = await lspMetadataTester['toJSON((address)[])'](lsp7assets);

    expect(result).to.equal(
      `${JSON.stringify({ address: firstLsp7Asset.contractAddress })},${JSON.stringify({
        address: secondLsp7Asset.contractAddress,
      })}`,
    );
  });

  it('testing `toJSON(LSP7Asset[][])`', async () => {
    const firstLsp7AssetGroup = [
      {
        contractAddress: hexlify(randomBytes(20)),
      },
      {
        contractAddress: hexlify(randomBytes(20)),
      },
    ];
    const secondLsp7AssetGroup = [
      {
        contractAddress: hexlify(randomBytes(20)),
      },
      {
        contractAddress: hexlify(randomBytes(20)),
      },
    ];
    const lsp7assets = [firstLsp7AssetGroup, secondLsp7AssetGroup];

    const result = await lspMetadataTester['toJSON((address)[][])'](lsp7assets);

    expect(result).to.equal(
      `${JSON.stringify(
        firstLsp7AssetGroup.map(({ contractAddress }) => ({ address: contractAddress })),
      )},${JSON.stringify(
        secondLsp7AssetGroup.map(({ contractAddress }) => ({ address: contractAddress })),
      )}`,
    );
  });

  it('testing `toJSON(LSP8Asset)`', async () => {
    const lsp8Asset = {
      contractAddress: hexlify(randomBytes(20)),
      tokenId: hexlify(randomBytes(32)),
    };

    const result = await lspMetadataTester['toJSON((address,bytes32))'](lsp8Asset);

    expect(result).to.equal(
      JSON.stringify({
        address: lsp8Asset.contractAddress,
        tokenId: lsp8Asset.tokenId,
      }),
    );
  });

  it('testing `toJSON(LSP8Asset[])`', async () => {
    const firstLsp8Asset = {
      contractAddress: hexlify(randomBytes(20)),
      tokenId: hexlify(randomBytes(32)),
    };
    const secondLsp8Asset = {
      contractAddress: hexlify(randomBytes(20)),
      tokenId: hexlify(randomBytes(32)),
    };
    const lsp8Assets = [firstLsp8Asset, secondLsp8Asset];

    const result = await lspMetadataTester['toJSON((address,bytes32)[])'](lsp8Assets);

    expect(result).to.equal(
      `${JSON.stringify({
        address: firstLsp8Asset.contractAddress,
        tokenId: firstLsp8Asset.tokenId,
      })},${JSON.stringify({
        address: secondLsp8Asset.contractAddress,
        tokenId: secondLsp8Asset.tokenId,
      })}`,
    );
  });

  it('testing `toJSON(LSP8Asset[][])`', async () => {
    const firstLsp8AssetGroup = [
      {
        contractAddress: hexlify(randomBytes(20)),
        tokenId: hexlify(randomBytes(32)),
      },
      {
        contractAddress: hexlify(randomBytes(20)),
        tokenId: hexlify(randomBytes(32)),
      },
    ];
    const secondLsp8AssetGroup = [
      {
        contractAddress: hexlify(randomBytes(20)),
        tokenId: hexlify(randomBytes(32)),
      },
      {
        contractAddress: hexlify(randomBytes(20)),
        tokenId: hexlify(randomBytes(32)),
      },
    ];
    const lsp8Assets = [firstLsp8AssetGroup, secondLsp8AssetGroup];

    const result = await lspMetadataTester['toJSON((address,bytes32)[][])'](lsp8Assets);

    expect(result).to.equal(
      `${JSON.stringify(
        firstLsp8AssetGroup.map(({ contractAddress, tokenId }) => ({
          address: contractAddress,
          tokenId,
        })),
      )},${JSON.stringify(
        secondLsp8AssetGroup.map(({ contractAddress, tokenId }) => ({
          address: contractAddress,
          tokenId,
        })),
      )}`,
    );
  });

  it('testing `toVerifiableURI(...)`', async () => {
    const data = 'Some random data, can be text, can be JSON';

    const identifier = toBeHex(0, 2);
    const verificationMethod = hexlify(keccak256(toUtf8Bytes('keccak256(bytes)'))).substring(0, 10);
    const verificationDataLength = toBeHex(32, 2);
    const verificationData = hexlify(keccak256(toUtf8Bytes(data)));
    const encodedData = toUtf8Bytes(data);

    const result = await lspMetadataTester.toVerifiableURI(data);

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

  it('testing `toJSON(Icons)`', async () => {
    // Sample Verification Data
    const verificationExample = {
      method: 'keccak256(bytes)',
      data: ethers.hexlify(ethers.randomBytes(32)),
    };

    // Sample Icons
    const icons = [
      {
        width: 128,
        height: 128,
        url: 'https://example.com/icon1.png',
        verification: verificationExample,
      },
      {
        width: 256,
        height: 256,
        url: 'https://example.com/icon2.png',
        verification: verificationExample,
      },
    ];
    const lsp7icons = [{ contractAddress: ethers.hexlify(ethers.randomBytes(20)) }];
    const lsp8icons = [
      {
        contractAddress: ethers.hexlify(ethers.randomBytes(20)),
        tokenId: ethers.hexlify(ethers.randomBytes(32)),
      },
    ];

    const result = await lspMetadataTester[
      'toJSON(((uint256,uint256,string,(string,bytes32))[],(address)[],(address,bytes32)[]))'
    ]({ icons, lsp7icons, lsp8icons });

    expect(result).to.equal(
      `${icons.map((asset) => JSON.stringify(asset))},${lsp7icons.map(({ contractAddress }) =>
        JSON.stringify({ address: contractAddress }),
      )},${lsp8icons.map(({ contractAddress, tokenId }) =>
        JSON.stringify({ address: contractAddress, tokenId }),
      )}`,
    );
  });

  it('testing `toJSON(Images)`', async () => {
    // Sample Images
    // Sample Verification Data
    const verificationExample1 = {
      method: 'keccak256(bytes)',
      data: ethers.hexlify(ethers.randomBytes(32)),
    };

    const verificationExample2 = {
      method: 'keccak256(bytes)',
      data: ethers.hexlify(ethers.randomBytes(32)),
    };

    // Expanded GroupImageField array with multiple entries
    const imageFieldsArray = [
      // First GroupImageField
      {
        images: [
          {
            width: 500,
            height: 300,
            url: 'https://example.com/image1.png',
            verification: verificationExample1,
          },
          {
            width: 600,
            height: 400,
            url: 'https://example.com/image2.png',
            verification: verificationExample1,
          },
        ],
        lsp7images: [{ contractAddress: ethers.hexlify(ethers.randomBytes(20)) }],
        lsp8images: [
          {
            contractAddress: ethers.hexlify(ethers.randomBytes(20)),
            tokenId: ethers.hexlify(ethers.randomBytes(32)),
          },
        ],
      },
      // Second GroupImageField
      {
        images: [
          {
            width: 700,
            height: 500,
            url: 'https://example.com/image3.png',
            verification: verificationExample2,
          },
          {
            width: 800,
            height: 600,
            url: 'https://example.com/image4.png',
            verification: verificationExample2,
          },
        ],
        lsp7images: [{ contractAddress: ethers.hexlify(ethers.randomBytes(20)) }],
        lsp8images: [
          {
            contractAddress: ethers.hexlify(ethers.randomBytes(20)),
            tokenId: ethers.hexlify(ethers.randomBytes(32)),
          },
        ],
      },
      // Add more GroupImageField entries as required
    ];

    const result = await lspMetadataTester[
      'toJSON((((uint256,uint256,string,(string,bytes32))[],(address)[],(address,bytes32)[])[]))'
    ]({ imageFields: imageFieldsArray });

    expect(result).to.equal(
      imageFieldsArray
        .map(
          ({ images, lsp7images, lsp8images }) =>
            `[${images.map((asset) => JSON.stringify(asset))},${lsp7images.map(
              ({ contractAddress }) => JSON.stringify({ address: contractAddress }),
            )},${lsp8images.map(({ contractAddress, tokenId }) =>
              JSON.stringify({ address: contractAddress, tokenId }),
            )}]`,
        )
        .toString(),
    );
  });

  it.skip('testing `toJSON(Assets)`', async () => {
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
    const lsp7assets = [
      {
        contractAddress: hexlify(randomBytes(20)),
      },
      {
        contractAddress: hexlify(randomBytes(20)),
      },
    ];
    const lsp8assets = [
      {
        contractAddress: hexlify(randomBytes(20)),
        tokenId: hexlify(randomBytes(32)),
      },
      {
        contractAddress: hexlify(randomBytes(20)),
        tokenId: hexlify(randomBytes(32)),
      },
    ];

    const result = await lspMetadataTester[
      'toJSON(((string,string,(string,bytes32))[],(address)[],(address,bytes32)[]))'
    ]({
      assets,
      lsp7assets,
      lsp8assets,
    });

    expect(result).to.equal(
      `${assets.map((asset) => JSON.stringify(asset))},${lsp7assets.map(({ contractAddress }) =>
        JSON.stringify({ address: contractAddress }),
      )},${lsp8assets.map(({ contractAddress, tokenId }) =>
        JSON.stringify({ address: contractAddress, tokenId }),
      )}`,
    );
  });

  it.skip('testing `toLSP4MetadataJSON(...)`', async () => {
    const name = 'Some Name';
    const desription = 'Some Description';

    // Sample Verification Data
    const verificationExample = {
      method: 'keccak256(bytes)',
      data: ethers.hexlify(ethers.randomBytes(32)),
    };

    // Sample Links
    const links = [
      { title: 'Google', url: 'https://google.com' },
      { title: 'Bing', url: 'https://bing.com' },
    ];

    // Sample Attributes
    const attributes = [
      { key: 'Color', value: 'Blue', valueType: 'string' },
      { key: 'Size', value: 'Large', valueType: 'string' },
    ];

    // Sample Icons
    const icons = {
      icons: [
        {
          width: 128,
          height: 128,
          url: 'https://example.com/icon1.png',
          verification: verificationExample,
        },
        {
          width: 256,
          height: 256,
          url: 'https://example.com/icon2.png',
          verification: verificationExample,
        },
      ],
      lsp7icons: [{ contractAddress: ethers.hexlify(ethers.randomBytes(20)) }],
      lsp8icons: [
        {
          contractAddress: ethers.hexlify(ethers.randomBytes(20)),
          tokenId: ethers.hexlify(ethers.randomBytes(32)),
        },
      ],
    };

    // Sample Images
    // Sample Verification Data
    const verificationExample1 = {
      method: 'keccak256(bytes)',
      data: ethers.hexlify(ethers.randomBytes(32)),
    };

    const verificationExample2 = {
      method: 'keccak256(bytes)',
      data: ethers.hexlify(ethers.randomBytes(32)),
    };

    // Expanded GroupImageField array with multiple entries
    const imageFieldsArray = [
      // First GroupImageField
      {
        images: [
          {
            width: 500,
            height: 300,
            url: 'https://example.com/image1.png',
            verification: verificationExample1,
          },
          {
            width: 600,
            height: 400,
            url: 'https://example.com/image2.png',
            verification: verificationExample1,
          },
        ],
        lsp7images: [{ contractAddress: ethers.hexlify(ethers.randomBytes(20)) }],
        lsp8images: [
          {
            contractAddress: ethers.hexlify(ethers.randomBytes(20)),
            tokenId: ethers.hexlify(ethers.randomBytes(32)),
          },
        ],
      },
      // Second GroupImageField
      {
        images: [
          {
            width: 700,
            height: 500,
            url: 'https://example.com/image3.png',
            verification: verificationExample2,
          },
          {
            width: 800,
            height: 600,
            url: 'https://example.com/image4.png',
            verification: verificationExample2,
          },
        ],
        lsp7images: [{ contractAddress: ethers.hexlify(ethers.randomBytes(20)) }],
        lsp8images: [
          {
            contractAddress: ethers.hexlify(ethers.randomBytes(20)),
            tokenId: ethers.hexlify(ethers.randomBytes(32)),
          },
        ],
      },
      // Add more GroupImageField entries as required
    ];

    // Structuring the Images object
    const images = {
      imageFields: imageFieldsArray,
    };

    // Sample Assets
    const assets = {
      assets: [
        {
          url: 'https://example.com/asset1.png',
          fileType: 'image/png',
          verification: verificationExample,
        },
        {
          url: 'https://example.com/asset2.png',
          fileType: 'image/jpeg',
          verification: verificationExample,
        },
      ],
      lsp7assets: [{ contractAddress: ethers.hexlify(ethers.randomBytes(20)) }],
      lsp8assets: [
        {
          contractAddress: ethers.hexlify(ethers.randomBytes(20)),
          tokenId: ethers.hexlify(ethers.randomBytes(32)),
        },
      ],
    };

    const result = await lspMetadataTester.toLSP4MetadataJSON(
      name,
      desription,
      links,
      attributes,
      icons,
      images,
      assets,
    );

    console.log(result);

    // expect(result).to.equal(data);
  });
});
