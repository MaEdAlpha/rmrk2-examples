import { createBase } from "./create-base";
import { mintChunky } from "./mint-chunky";
import { addBaseResource } from "./mint-chunky";
import { mintItems } from "./mint-chunky-items";

export const runMintSequence = async () => {
  try {
    const baseBlock = await createBase();
    const chunkiesBlock = await mintChunky();
    await addBaseResource(chunkiesBlock, baseBlock); //chunkiesBlock, baseBlock
    await mintItems(chunkiesBlock, baseBlock);
     process.exit(0);
  } catch (error: any) {
    console.error("Error6:",error);
    process.exit(0);
  }
};

runMintSequence();
