import { createBase } from "./create-base";
import { mintChunky } from "./mint-chunky";
import { addBaseResource } from "./mint-chunky";
import { mintItems } from "./mint-chunky-items";

export const runMintSequence = async () => {
  try {
    //const baseBlock = await createBase();
    //const chunkiesBlock = await mintChunky();
    //await addBaseResource(31, 6); //chunkiesBlock, baseBlock
    await mintItems(31, 6);
     process.exit(0);
  } catch (error: any) {
    console.error("Error6:",error);
    process.exit(0);
  }
};

runMintSequence();
