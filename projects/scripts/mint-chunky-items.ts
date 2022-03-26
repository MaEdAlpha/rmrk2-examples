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

const equipableItems = [
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

    const serialNumbers = [1, 2, 3, 4, 5, 6, 7, 8]; //total number of base combinations.
    const collectionId = Collection.generateId(
      u8aToHex(accounts[0].publicKey),
      CHUNKY_ITEMS_COLLECTION_SYMBOL //WGLITMS
    );
    console.log("collectionId: ", collectionId);
    //collectionId:  d43593c715a56da27d-WGLITMS

    const parentCollectionID = Collection.generateId(
      u8aToHex(accounts[0].publicKey),
      CHUNKY_COLLECTION_SYMBOL  //WGL
    );
    console.log("chunkkyCollectionId: ", parentCollectionID);
    // d43593c715a56da27d-WGL

    const baseEntity = new Base(
      baseBlock,
      CHUNKY_BASE_SYMBOL, //WGLBS
      encodeAddress(kp.address, 2),
      "svg"
    );
     //console.log('baseEntity: ', baseEntity);

    await createItemsCollection(); //creates grouping for equipableNfts returns a block number.
 
    const promises = equipableItems.map(async (item, index) => {

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
        collection: collectionId, // collectionId:  d43593c715a56da27d-WGLITMS
        symbol: item.symbol,
      });

      return nftItem.mint(); //NEED TO CREATE AN NFT FOR ALL 8 MODELS (need 32.)
    });

    const remarks = await Promise.all(promises);
    // console.log("Ln: 115");
    // console.log(remarks);

    const txs = remarks.map((remark) => api.tx.system.remark(remark));
    const batch = api.tx.utility.batch(txs);

    const { block } = await sendAndFinalize(batch, kp);
    
    console.log("MONSTERA ITEMS MINTED AT BLOCK: ", block);

    
    ///// APPEND item to NFT BaseResource 
    const resaddSendRemarks = []; //define array

    equipableItems.forEach( (item, index) => { //go through each item (you only have 4 items, this is why you only see 8th base with all assets.) change to total items.
      const sn = index + 1;
      //console.log('Item: '+ item.resources + ' SN: '+ sn);
      //nft = itemNft
      const equipableNft = new NFT({
        block, //changed this..
        sn: sn.toString().padStart(8, "0"),
        owner: encodeAddress(accounts[0].address, 2),
        transferable: 1,
        metadata: `ipfs://ipfs/falalalalaa`,
        collection: collectionId, // collectionId:  d43593c715a56da27d-WGLITMS
        symbol: item.symbol,
      });

      //for each resource in resources array assign to NFT...... code you need to fix.
      item.resources.forEach((resource) => {
        console.log("||||||||");
        console.log(resource);
        console.log("||||||||");
        let slotName ='s1.svg';
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

        //adds link between slot and equipableNft. slot ex: "base-3-WGLBS.wegland_objectBottom" to resources[] of nft
        const nftItem = equipableNft.resadd({
          src: `ipfs://ipfs/${ASSETS_CID}/Wegland%20Items/${resource}`,
          thumb: `ipfs://ipfs/${ASSETS_CID}/Wegland%20Items/${item.thumb}`,
          id: nanoid(8),
          slot: slotName       
        });

        // console.log('\nLn143 mint-chunky\n');
        // console.info(nftItem);
       
        resaddSendRemarks.push(nftItem);  //pushes each nftItem you  built to an array which you batchAll(transactions)

        for( let serialNumber of serialNumbers ){   //This is where you assign the equipableNft to each chunkyNft(parentNFT).

          const parentNFT = new NFT({
            block: chunkyBlock,
            collection: parentCollectionID,  //chunkkyCollectionId:  d43593c715a56da27d-WGL
            symbol: `wegland_${serialNumber}`, //need this to hit 8.
            transferable: 1,
            sn: `${serialNumber}`.padStart(8, "0"),
            owner: encodeAddress(accounts[0].address, 2),
            metadata: "",
          });

          resaddSendRemarks.push( //creats a RMRK 'remark' resource and pushes into an array.
            equipableNft.send(parentNFT.getId()) //send(recipient:string) sends equiableNFT to the Parent.
          );

          console.log('parentNFTID: ', parentNFT.getId());
          
          if(sn === 1){
            console.log(`EQUIPPED HELMET for wegland_${sn}`);
            resaddSendRemarks.push(equipableNft.equip(`${baseEntity.getId()}.${"wegland_objectTop"}`));
          } 
          else if (sn === 2){
          console.log(`EQUIPPED SHEILD for wegland_${sn}`);
          resaddSendRemarks.push(equipableNft.equip(`${baseEntity.getId()}.${"wegland_objectLeft"}`));
          } 
          else if (sn === 3 ){
            console.log(`EQUIPPED WEAPON for wegland_${sn}`);
            resaddSendRemarks.push(equipableNft.equip(`${baseEntity.getId()}.${"wegland_objectRight"}`));
          } 
          else if (sn === 4){
            console.log(`EQUIPPED NAME for wegland_${sn}`);
            resaddSendRemarks.push(equipableNft.equip(`${baseEntity.getId()}.${"wegland_objectBottom"}`));
          } 
          else if (sn === 5){
            console.log(`EQUIPPED BG for wegland_${sn}`);
            resaddSendRemarks.push(equipableNft.equip(`${baseEntity.getId()}.${"wegland_objectBackground"}`));
          }    
        }
      });

    });
    //formats? I think
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
      collectionId, // collectionId:  d43593c715a56da27d-WGLITMS
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