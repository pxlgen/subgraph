import { PlotMinted, URI, TransferSingle } from "../generated/PxlGen/PxlGen";
import { Token, Owner, TokenTransfer } from "../generated/schema";
import { log } from "@graphprotocol/graph-ts";

const PLOT_TYPE: string = "Plot";
const PRINT_TYPE: string = "Print";
const ZERO_ADDR: string = "0x0000000000000000000000000000000000000000";

export function getOwner(o: string): Owner {
  let owner = Owner.load(o);
  if (owner == null) {
    owner = new Owner(o);
    owner.totalOwned = 0;
  }
  return owner as Owner;
}

export function handlePlotMinted(event: PlotMinted): void {
  log.info("Plot ID: {}", [event.params.id.toHex()]);
  log.info("Plot Index: {}", [event.params.index.toString()]);

  let ownerID = event.params.to.toHex();
  let owner = getOwner(ownerID);
  owner.totalOwned = owner.totalOwned + 1;

  let plot = new Token(event.params.id.toHex());
  plot.owner = ownerID;
  plot.index = event.params.index.toI32();
  plot.ipfsHash = event.params.uri + "/" + event.params.index.toString() + ".json";
  plot.createdAt = event.block.timestamp;
  plot.type = PLOT_TYPE;

  plot.save();
  owner.save();
}

export function handleUpdatedURI(event: URI): void {
  log.info("URI ipfsHash: {}", [event.params.value]);
  let id = event.params.id.toHex();
  let plot = Token.load(id);
  plot.ipfsHash = event.params.value;
  plot.save();
}

export function handleTransferSingle(event: TransferSingle): void {
  if (event.params.from.toHexString() != ZERO_ADDR && event.params.to.toHexString() != ZERO_ADDR) {
    log.info("handleTransferSingle to not zero: {}", [event.params.to.toHexString()]);

    let tokenId = event.params.id.toHex();
    let token = Token.load(tokenId);
    if (token !== null) {
      let oldOwnerID = event.params.from.toHex();
      let oldOwner = getOwner(oldOwnerID);
      oldOwner.totalOwned = oldOwner.totalOwned - 1;
      oldOwner.save();

      let newOwnerID = event.params.to.toHex();
      let newOwner = getOwner(newOwnerID);
      newOwner.totalOwned = newOwner.totalOwned + 1;
      newOwner.save();

      token.owner = newOwnerID;
      token.save();

      let transfer = new TokenTransfer(event.transaction.hash.toHex());
      transfer.token = tokenId;
      transfer.to = event.params.to;
      transfer.from = event.params.from;
      transfer.createdAt = event.block.timestamp;
      transfer.save();
    }
  }
}
