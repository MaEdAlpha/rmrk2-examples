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
    name: "A Great Helmet",
    description: "A Wegland Helmet",
  },
  {
    symbol: "wegland_shield",
    thumb: "s1_thumb.png",
    resources: ["s1.svg"],
    name: "The Great Shield",
    description: "Shield good!",
  },
  {
    symbol: "wegland_weapon",
    thumb: "w1_thumb.png",
    resources: ["w1.svg"],
    name: "The ExtraOrdinary Weapon",
    description: "Pointy end forward!",
  },
  {
    symbol: "wegland_class",
    thumb: "t1_thumb.png",
    resources: ["t1.svg"],
    name: "The Average Name",
    description: "I speaks good",
  },  
  {
    symbol: "wegland_background",
    thumb: "bg1_thumb.png",
    resources: ["bg1.svg"],
    name: "Background",
    description: "Equipable Background",
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
      CHUNKY_ITEMS_COLLECTION_SYMBOL //WGLITMS
    );
    console.log("collectionId: ", collectionId);
    //d43593c715a56da27d-WGLITMS

    const chunkyCollectionId = Collection.generateId(
      u8aToHex(accounts[0].publicKey),
      CHUNKY_COLLECTION_SYMBOL  //WGL
    );
    console.log("chunkkyCollectionId: ", chunkyCollectionId);
    // d43593c715a56da27d-WGL

    const baseEntity = new Base(
      baseBlock,
      CHUNKY_BASE_SYMBOL, //WGLBS
      encodeAddress(kp.address, 2),
      "svg"
    );
     //console.log('baseEntity: ', baseEntity);

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

      const nftItem = new NFT({
        block: 0,
        sn: sn.toString().padStart(8, "0"),
        owner: encodeAddress(accounts[0].address, 2),
        transferable: 1,
        metadata: metadataCid,
        collection: collectionId,
        symbol: item.symbol,
      });

      return nftItem.mint();
    });

    const remarks = await Promise.all(promises);
    // console.log("Ln: 115");
    // console.log(remarks);

    const txs = remarks.map((remark) => api.tx.system.remark(remark));
    const batch = api.tx.utility.batch(txs);
    const { block } = await sendAndFinalize(batch, kp);
    console.log("MONSTERA ITEMS MINTED AT BLOCK: ", block);

    const resaddSendRemarks = [];
    //This is where you assign the items to each resource.
    const serialNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
    for(let serialNumber of serialNumbers){
      
      chunkyItems.forEach((item, index) => {
        const sn = index + 1;
        console.log('Item: '+ item.resources + ' SN: '+ sn);
  
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
          console.log('Shield Detected: ' + resource.includes("s1") + ' |||| ' + resource);
          let slotName ='';
          if(resource === "s1.svg"){
            slotName = `${baseEntity.getId()}.wegland_objectLeft`;
          } else if(resource === "w1.svg"){
            slotName =  `${baseEntity.getId()}.wegland_objectRight`;
          }else if(resource === "h1.svg"){
            slotName =  `${baseEntity.getId()}.wegland_objectTop`;
          }else if(resource === "bg1.svg"){
            slotName = `${baseEntity.getId()}.wegland_objectBackground`;
          }else if(resource === "t1.svg"){
            slotName =  `${baseEntity.getId()}.wegland_objectBottom`;
          } 

          const nftItem = nft.resadd({
            src: `ipfs://ipfs/${ASSETS_CID}/Wegland%20Items/${resource}`,
            thumb: `ipfs://ipfs/${ASSETS_CID}/Wegland%20Items/${item.thumb}`,
            id: nanoid(8),
            slot:  slotName       
          });

          console.log('\nLn143 mint-chunky\n');
          console.info(nftItem);
          
          resaddSendRemarks.push(nftItem); // might need to append to slot....maybe it overwrites ...but then that would only give the last item...
        });
  
        const chunkyNft = new NFT({
          block: chunkyBlock,
          collection: chunkyCollectionId,
          symbol: `wegland_${serialNumber}`, //need this to hit 8.
          transferable: 1,
          sn: `${serialNumber}`.padStart(8, "0"),
          owner: encodeAddress(accounts[0].address, 2),
          metadata: "",
        });
  
        //assigns item to baseNFT.
        resaddSendRemarks.push(
          nft.send(chunkyNft.getId())
        );

        console.log('ChunkyNFTID: ', chunkyNft.getId());
  
        if(sn === 1){
          console.log(`EQUIPPED HELMET for wegland_${serialNumber}`);
          resaddSendRemarks.push(nft.equip(`${baseEntity.getId()}.${"wegland_objectTop"}`));
        } 
        else if (sn === 2){
          console.log(`EQUIPPED SHEILD for wegland_${serialNumber}`);
          resaddSendRemarks.push(nft.equip(`${baseEntity.getId()}.${"wegland_objectLeft"} `));
        } 
        else if (sn === 3 ){
          console.log(`EQUIPPED WEAPON for wegland_${serialNumber}`);
          resaddSendRemarks.push(nft.equip(`${baseEntity.getId()}.${"wegland_objectRight"}`));
        } 
        else if (sn === 4){
          console.log(`EQUIPPED NAME for wegland_${serialNumber}`);
          resaddSendRemarks.push(nft.equip(`${baseEntity.getId()}.${"wegland_objectBottom"}`));
        } 
        else if (sn === 5){
          console.log(`EQUIPPED BG for wegland_${serialNumber}`);
          resaddSendRemarks.push(nft.equip(`${baseEntity.getId()}.${"wegland_objectBackground"}`));
        }
    
      });

    }

    const restxs = resaddSendRemarks.map((remark) =>
      api.tx.system.remark(remark)
    );
    
    const resbatch = api.tx.utility.batchAll(restxs);
    const { block: resaddSendBlock } = await sendAndFinalize(resbatch, kp);
    console.log("MONSTERA ITEMS RESOURCE ADDED AND SENT: ", resaddSendBlock);
    return true;

  } catch (error: any) {
    console.error("Error1:", error);
  }
};

export const createItemsCollection = async () => {
  try {
    console.log("CREATE MONSTERA ITEMS COLLECTION START -------");
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
      "/assets/wegland",
      "Monstera Preview.png",
      "RMRK2 demo Monstera items collection",
      {
        description: "This is Monstera items! RMRK2 demo nested NFTs",
        externalUri: "https://arteralabs.net",
        properties: {},
      }
    );

    const ItemsCollection = new Collection(
      0,
      9999,
      encodeAddress(accounts[0].address, 2),
      CHUNKY_ITEMS_COLLECTION_SYMBOL,
      collectionId,
      collectionMetadataCid
    );

    const { block } = await sendAndFinalize(
      api.tx.system.remark(ItemsCollection.create()),
      kp
    );
    console.log("Monstera items collection created at block: ", block);

    return block;
  } catch (error: any) {
    console.error("Error2:",error);
  }
};