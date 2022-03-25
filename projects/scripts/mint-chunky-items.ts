import {
  ASSETS_CID,
  CHUNKY_COLLECTION_SYMBOL,
  CHUNKY_ITEMS_COLLECTION_SYMBOL,
  WS_URL,
  CHUNKY_BASE_SYMBOL
} from "./constants";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { getApi, getKeyringFromUri, getKeys, sendAndFinalize } from "./utils";
import { Collection, NFT, Base } from "rmrk-tools";
import { u8aToHex } from "@polkadot/util";
import { encodeAddress } from "@polkadot/keyring";
import { nanoid } from "nanoid";
import {pinSingleMetadataFromDir} from "./pinata-utils";

const chunkyItems = [
  {
    symbol: "wegland_helmet",
    thumb: "h1_thumb.png",
    resources: ["h1.svg"],
    name: "Great Helmet",
    description: "A Wegland Helmet",
  },
  {
    symbol: "wegland_sheild",
    thumb: "s1_thumb.png",
    resources: ["s1.svg"],
    name: "The Great Shield",
    description: "Shield good!",
  },
  {
    symbol: "wegland_weapon",
    thumb: "w1_thumb.png",
    resources: ["w1.svg"],
    name: "The Weapon",
    description: "Pointy end forward!",
  },
  {
    symbol: "wegland_class",
    thumb: "t1_thumb.png",
    resources: ["t1.svg"],
    name: "The breed",
    description: "I speaks good",
  },
];

export const mintItems = async (chunkyBlock: number, baseBlock: number) => {
  try {
    console.log("CREATE MONSTERA ITEMS START -------");
    await cryptoWaitReady();
    const accounts = getKeys();
    const ws = WS_URL;
    const phrase = process.env.PRIVAKE_KEY;
    const api = await getApi(ws);
    const kp = getKeyringFromUri(phrase);

    const collectionId = Collection.generateId(
      u8aToHex(accounts[0].publicKey),
      CHUNKY_ITEMS_COLLECTION_SYMBOL
    );

    const chunkyCollectionId = Collection.generateId(
      u8aToHex(accounts[0].publicKey),
      CHUNKY_COLLECTION_SYMBOL
    );

    const baseEntity = new Base(
      baseBlock,
      CHUNKY_BASE_SYMBOL,
      encodeAddress(kp.address, 2),
      "svg"
    );

    await createItemsCollection();

    const promises = chunkyItems.map(async (item, index) => {
      const sn = index + 1;

      const metadataCid = await pinSingleMetadataFromDir(
        "/assets/wegland/Wegland Items",
        item.thumb,
        item.name,
        {
          description: item.description,
          externalUri: "https://arteralabs.net",
        }
      );

      const nft = new NFT({
        block: 0,
        sn: sn.toString().padStart(8, "0"),
        owner: encodeAddress(accounts[0].address, 2),
        transferable: 1,
        metadata: metadataCid,
        collection: collectionId,
        symbol: item.symbol,
      });

      return nft.mint();
    });

    const remarks = await Promise.all(promises);

    const txs = remarks.map((remark) => api.tx.system.remark(remark));
    const batch = api.tx.utility.batch(txs);
    const { block } = await sendAndFinalize(batch, kp);
    console.log("MONSTERA ITEMS MINTED AT BLOCK: ", block);

    const resaddSendRemarks = [];

    chunkyItems.forEach((item, index) => {
      const sn = index + 1;
      const nft = new NFT({
        block,
        sn: sn.toString().padStart(8, "0"),
        owner: encodeAddress(accounts[0].address, 2),
        transferable: 1,
        metadata: `ipfs://ipfs/falalalalaa`,
        collection: collectionId,
        symbol: item.symbol,
      });

      item.resources.forEach((resource) => {
        resaddSendRemarks.push(
          nft.resadd({
            src: `ipfs://ipfs/${ASSETS_CID}/Wegland Items/${resource}`,
            thumb: `ipfs://ipfs/${ASSETS_CID}/Wegland Items/${item.thumb}`,
            id: nanoid(8),
            slot: resource.includes("s1") ?  `${baseEntity.getId()}.wegland_objectLeft`
            : resource.includes("w1") ? `${baseEntity.getId()}.wegland_objectRight`
            : resource.includes("h1") ? `${baseEntity.getId()}.wegland_objectTop`
            : `${baseEntity.getId()}.wegland_objectBottom`          
          })
        );
      });

      const chunkyNft = new NFT({
        block: chunkyBlock,
        collection: chunkyCollectionId,
        symbol: `wegland_${sn}`,
        transferable: 1,
        sn: `${sn}`.padStart(8, "0"),
        owner: encodeAddress(accounts[0].address, 2),
        metadata: "",
      });

      resaddSendRemarks.push(nft.send(chunkyNft.getId()));
      resaddSendRemarks.push(nft.equip(`${baseEntity.getId()}.${"wegland_objectLeft"}`));
      resaddSendRemarks.push(nft.equip(`${baseEntity.getId()}.${"wegland_objectRight"}`));
      resaddSendRemarks.push(nft.equip(`${baseEntity.getId()}.${"wegland_objectTop"}`));
      resaddSendRemarks.push(nft.equip(`${baseEntity.getId()}.${"wegland_objectBottom"}`));
    });

    const restxs = resaddSendRemarks.map((remark) =>
      api.tx.system.remark(remark)
    );
    const resbatch = api.tx.utility.batch(restxs);
    const { block: resaddSendBlock } = await sendAndFinalize(resbatch, kp);
    console.log("CHUNKY ITEMS RESOURCE ADDED AND SENT: ", resaddSendBlock);
    return true;
  } catch (error: any) {
    console.error("Error1:", error);
  }
};

export const createItemsCollection = async () => {
  try {
    console.log("CREATE CHUNKY ITEMS COLLECTION START -------");
    await cryptoWaitReady();
    const accounts = getKeys();
    const ws = WS_URL;
    const phrase = process.env.PRIVAKE_KEY;
    const api = await getApi(ws);
    const kp = getKeyringFromUri(phrase);

    const collectionId = Collection.generateId(
      u8aToHex(accounts[0].publicKey),
      CHUNKY_ITEMS_COLLECTION_SYMBOL
    );

    const collectionMetadataCid = await pinSingleMetadataFromDir(
      "/assets/chunky",
      "Chunky Preview.png",
      "RMRK2 demo chunky items collection",
      {
        description: "This is Chunky items! RMRK2 demo nested NFTs",
        externalUri: "https://rmrk.app",
        properties: {},
      }
    );

    const ItemsCollection = new Collection(
      0,
      0,
      encodeAddress(accounts[0].address, 2),
      CHUNKY_ITEMS_COLLECTION_SYMBOL,
      collectionId,
      collectionMetadataCid
    );

    const { block } = await sendAndFinalize(
      api.tx.system.remark(ItemsCollection.create()),
      kp
    );
    console.log("Chunky items collection created at block: ", block);

    return block;
  } catch (error: any) {
    console.error("Error2:",error);
  }
};
