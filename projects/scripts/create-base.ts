import { IBasePart } from "rmrk-tools/dist/classes/base";
import {
  ASSETS_CID,
  CHUNKY_BASE_SYMBOL,
  CHUNKY_ITEMS_COLLECTION_SYMBOL,
  WS_URL,
} from "./constants";
import { cryptoWaitReady, encodeAddress } from "@polkadot/util-crypto";
import { getApi, getKeyringFromUri, getKeys, sendAndFinalize } from "./utils";
import { Collection, Base } from "rmrk-tools";
import { u8aToHex } from "@polkadot/util";

//get pinned ipfs src for each image and build your bases. 
export const fixedParts: IBasePart[] = [
  {
    type: "fixed",
    id: "wegland_body_1",
    src: `ipfs://ipfs/${ASSETS_CID}/v1/b1.svg`,
    z: 1,
  },
  {
    type: "fixed",
    id: "wegland_body_2",
    src: `ipfs://ipfs/${ASSETS_CID}/v2/b2.svg`,
    z: 1,
  },
  {
    type: "fixed",
    id: "wegland_body_3",
    src: `ipfs://ipfs/${ASSETS_CID}/v3/b3.svg`,
    z: 1,
  },
  {
    type: "fixed",
    id: "wegland_body_4",
    src: `ipfs://ipfs/${ASSETS_CID}/v4/b4.svg`,
    z: 1,
  },
  {
    type: "fixed",
    id: "wegland_body_5",
    src: `ipfs://ipfs/${ASSETS_CID}/v5/b5.svg`,
    z: 1,
  },
  {
    type: "fixed",
    id: "wegland_body_6",
    src: `ipfs://ipfs/${ASSETS_CID}/v6/b6.svg`,
    z: 1,
  },
  {
    type: "fixed",
    id: "wegland_body_7",
    src: `ipfs://ipfs/${ASSETS_CID}/v7/b7.svg`,
    z: 1,
  },
  {
    type: "fixed",
    id: "wegland_body_8",
    src: `ipfs://ipfs/${ASSETS_CID}/v8/b8.svg`,
    z: 1,
  },
  {
    type: "fixed",
    id: "wegland_eyes_1",
    src: `ipfs://ipfs/${ASSETS_CID}/v1/e1.svg`,
    z: 2,
  },
  {
    type: "fixed",
    id: "wegland_eyes_2",
    src: `ipfs://ipfs/${ASSETS_CID}/v2/e2.svg`,
    z: 2,
  },
  {
    type: "fixed",
    id: "wegland_eyes_3",
    src: `ipfs://ipfs/${ASSETS_CID}/v3/e3.svg`,
    z: 2,
  },
  {
    type: "fixed",
    id: "wegland_eyes_4",
    src: `ipfs://ipfs/${ASSETS_CID}/v4/e4.svg`,
    z: 2,
  },
  {
    type: "fixed",
    id: "wegland_eyes_5",
    src: `ipfs://ipfs/${ASSETS_CID}/v5/e1.svg`,
    z: 2,
  },
  {
    type: "fixed",
    id: "wegland_eyes_6",
    src: `ipfs://ipfs/${ASSETS_CID}/v6/e2.svg`,
    z: 2,
  },
  {
    type: "fixed",
    id: "wegland_eyes_7",
    src: `ipfs://ipfs/${ASSETS_CID}/v7/e3.svg`,
    z: 2,
  },
  {
    type: "fixed",
    id: "wegland_eyes_8",
    src: `ipfs://ipfs/${ASSETS_CID}/v8/e4.svg`,
    z: 2,
  },
  {
    type: "fixed",
    id: "wegland_mouth_1",
    src: `ipfs://ipfs/${ASSETS_CID}/v1/m1.svg`,
    z: 3,
  },
  {
    type: "fixed",
    id: "wegland_mouth_2",
    src: `ipfs://ipfs/${ASSETS_CID}/v2/m2.svg`,
    z: 3,
  },
  {
    type: "fixed",
    id: "wegland_mouth_3",
    src: `ipfs://ipfs/${ASSETS_CID}/v3/m3.svg`,
    z: 3,
  },
  {
    type: "fixed",
    id: "wegland_mouth_4",
    src: `ipfs://ipfs/${ASSETS_CID}/v4/m4.svg`,
    z: 3,
  },{
    type: "fixed",
    id: "wegland_mouth_5",
    src: `ipfs://ipfs/${ASSETS_CID}/v5/m1.svg`,
    z: 3,
  },
  {
    type: "fixed",
    id: "wegland_mouth_6",
    src: `ipfs://ipfs/${ASSETS_CID}/v6/m2.svg`,
    z: 3,
  },
  {
    type: "fixed",
    id: "wegland_mouth_7",
    src: `ipfs://ipfs/${ASSETS_CID}/v7/m3.svg`,
    z: 3,
  },
  {
    type: "fixed",
    id: "wegland_mouth_8",
    src: `ipfs://ipfs/${ASSETS_CID}/v8/m4.svg`,
    z: 3,
  },
  {
    type: "fixed",
    id: "text_1",
    src: `ipfs://ipfs/${ASSETS_CID}/v1/text.svg`,
    z: 4,
  },
  {
    type: "fixed",
    id: "text_2",
    src: `ipfs://ipfs/${ASSETS_CID}/v2/text.svg`,
    z: 4,
  },
  {
    type: "fixed",
    id: "text_3",
    src: `ipfs://ipfs/${ASSETS_CID}/v3/text.svg`,
    z: 4,
  },
  {
    type: "fixed",
    id: "text_4",
    src: `ipfs://ipfs/${ASSETS_CID}/v4/text.svg`,
    z: 4,
  },
  {
    type: "fixed",
    id: "text_5",
    src: `ipfs://ipfs/${ASSETS_CID}/v5/text.svg`,
    z: 4,
  },
  {
    type: "fixed",
    id: "text_6",
    src: `ipfs://ipfs/${ASSETS_CID}/v6/text.svg`,
    z: 4,
  },
  {
    type: "fixed",
    id: "text_7",
    src: `ipfs://ipfs/${ASSETS_CID}/v7/text.svg`,
    z: 4,
  },
  {
    type: "fixed",
    id: "text_8",
    src: `ipfs://ipfs/${ASSETS_CID}/v8/text.svg`,
    z: 4,
  },
];

//get equiable parts. 'equiappable is a string[] which lets you load each svg item in left or right parts. 
//can set a default item by adding src: property. Will fall back on this asset if nothing is assigned. (possibly use for card text);
const getSlotKanariaParts = (equippable: string[] | "*" = []): IBasePart[] => {
  return [
    {
      type:"slot",
      id:"wegland_objectBackground", //background
      equippable,
      z: 0
    },
    {
      type: "slot",
      id: "wegland_objectLeft", //sheild
      equippable,
      z: 6,
    },
    {
      type: "slot",
      id: "wegland_objectRight", //weapon
      equippable,
      z: 7,
    },
    {
      type: "slot",
      id: "wegland_objectTop", //helmet
      equippable,
      z: 5,
    },
    {
      type: "slot",
      id: "wegland_objectBottom", //Name
      equippable,
      z: 8,
    },
  ];
};

export const createBase = async () => {
  try {
    console.log("CREATE CHUNKY BASE START -------");
    await cryptoWaitReady();
    const accounts = getKeys();
    const ws = WS_URL;
    const phrase = process.env.PRIVAKE_KEY; // basic dev keystore set to Alice Mnemonic
    const api = await getApi(ws);
    const kp = getKeyringFromUri(phrase);

    const collectionId = Collection.generateId(
      u8aToHex(accounts[0].publicKey),
      CHUNKY_ITEMS_COLLECTION_SYMBOL
    );

    console.log("collectionId", collectionId);

    const baseParts = [...fixedParts, ...getSlotKanariaParts([collectionId])];
    
    //creates the base
    const baseEntity = new Base(
      0,
      CHUNKY_BASE_SYMBOL,
      encodeAddress(kp.address, 2), //convert to Kusama formate) ss58Format:2
      "svg",
      baseParts
    );

    const { block } = await sendAndFinalize(
      api.tx.system.remark(baseEntity.base()),
      kp
    );
    console.log("Base created at block: ", block);
    return block;
  } catch (error: any) {
    console.error("Error:",error);
  }
};
