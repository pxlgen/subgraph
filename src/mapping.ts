import { CellMinted, URI } from "../generated/Muralis/Muralis";
import { Cell } from "../generated/schema";
import { log } from "@graphprotocol/graph-ts";

export function handleCellMinted(event: CellMinted): void {
  log.info("Cell ID: {}", [event.params.id.toHex()]);
  let cell = new Cell(event.params.id.toHex());
  cell.owner = event.params.to;
  cell.index = event.params.index.toI32();
  cell.ipfsHash = event.params.tokenuri;
  cell.save();
}

export function handleUpdatedURI(event: URI): void {
  log.info("URI ID: {}", [event.params.id.toHex()]);
  let id = event.params.id.toHex();
  let cell = Cell.load(id);
  cell.ipfsHash = event.params.value;
  cell.save();
}
