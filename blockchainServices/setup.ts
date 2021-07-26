const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const { Ledger } = require('@polkadot/hw-ledger')
const networks = require('@polkadot/networks');
const { assert, u8aToBuffer, hexToU8a, u8aToHex } = require('@polkadot/util');
const { newStatemineApp } = require('@zondax/ledger-substrate')
const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid')
import type { Signer, SignerResult } from '@polkadot/api/types';
import type { Ledger as LedgerType } from '@polkadot/hw-ledger';
import type { Registry, SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import {createSubmittable} from '@polkadot/api/submittable'
import { TypeRegistry } from '@polkadot/types';
import { keyring } from '@polkadot/ui-keyring';


const getApi = async () => {
  try {
    const registry = new TypeRegistry();
    // const ledger = new Ledger('hid', 'statemine')
    // const ledgerSigner = new LedgerSigner(registry, ledger, 0, 0)
    const wsProvider = new WsProvider("wss://statemine.api.onfinality.io/public-ws");
    const api = new ApiPromise({
      provider: wsProvider,
      // signer:  ledgerSigner
    });
    await api.isReady;
    await cryptoWaitReady();
    return api;
  } catch (e) {
    console.log("error setting up api");
    throw new Error(e.message);
  }
};

const getKeypair = async (mneumonic: string) => {
  try {
    // const ledger = new Ledger('hid', 'statemine')
    // const address = await ledger.getAddress()
    // console.log({address, ledger})
    // console.log({networks: networks.all[2].network})
    // const keyring = new Keyring({ type: "sr25519" });
    return {address: "JMdbWK5cy3Bm4oCyhWNLQJoC4cczNgJsyk7nLZHMqFT7z7R"}//keyring.addFromUri(mneumonic);
  } catch (e) {
    console.log("error setting up keypair");
    throw new Error(e.message);
  }
};

function isRawPayload (payload: any) {
  return !!(payload).data;
}

let id = 0;

class LedgerSigner implements Signer {
  readonly #accountOffset: number;
  readonly #addressOffset: number;
  readonly #getLedger: LedgerType;
  readonly #registry: Registry;

  constructor (registry: Registry, getLedger: LedgerType, accountOffset: number, addressOffset: number) {
    this.#accountOffset = accountOffset;
    this.#addressOffset = addressOffset;
    this.#getLedger = getLedger;
    this.#registry = registry;
  }

  public async signPayload (payload: SignerPayloadJSON): Promise<SignerResult> {
    const raw = this.#registry.createType('ExtrinsicPayload', payload, { version: payload.version });
    const { signature } = await this.#getLedger.sign(raw.toU8a(true), this.#accountOffset, this.#addressOffset);

    return { id: ++id, signature };
  }


}

const signAndSend = async (call: any, api: any, sender: any) => {
  // console.log(TransportNodeHid)
  console.log({sender})
  // await keyring.loadAll({ type: "sr25519"})
  // const pair = keyring.getPair(sender.address)
  const ledger = new Ledger('hid', 'statemine')
  const ledgerSigner = new LedgerSigner(api.registry, ledger, 0, 0)
  //https://github.com/polkadot-js/api/blob/3c59a4d4171b263a6f5203ca69a8d88b30cff6c3/packages/api/src/promise/index.spec.ts#L135
  console.log({data: u8aToHex(call.data)})
  const newCall = await api.tx.balances.transfer(sender.address, 1)
  const toSend = {data: u8aToHex(newCall.data)}
  const signAsync = await call.signAsync(sender.address, {signer: ledgerSigner})
  console.log({signAsync: signAsync.toString()})
  // const test = await api.tx(signAsync).sign()//await api.tx({signer: ledgerSigner}, call).sign()//await api.sign(sender.address, toSend)//
  // console.log({test})
  // console.log(test)
  // await api.setSigner({signer: ledgerSigner})
  // console.log(api.signer)
  // ledgerSigner.signPayload(call)
  // const newCall = api.tx({signer: ledgerSigner}).assets.mint(0, sender, 1);
  // const result = await call.sign({signer: ledgerSigner})
  // console.log(result)
  // const transport = await TransportNodeHid.default.create(1000)
  // const ledger = new newStatemineApp(transport)
  // console.log(call)
  // const block = await api.rpc.chain.getBlock()
  // const header = await api.rpc.chain.getHeader()
  // const era =  call.era.toJSON()

  // const payloadData = {
  //   address: sender.address,
  //   blockNumber: header.number,
  //   blockHash: block.block.header.hash,
  //   era: era.immortalEra,
  //   genesisHash: api.genesisHash,
  //   method: u8aToHex(call.data),
  //   nonce: call.nonce,
  //   runtimeVersion: api.runtimeVersion,
  //   specVersion: api.runtimeVersion.specVersion,
  //   transactionVersion: api.runtimeVersion.transactionVersion, 
  //   signedExtensions: api.registry.signedExtensions,
  //   tip: call.tip,
  //   version: call.version
  // }
  // console.log({
  //   payloadData,
  // })

  // console.log({payload})
  // const preSign = api.registry.createType('ExtrinsicPayload', payload, { version: payload.version }).sign(this.#keyringPair);

  // taken from zondax test cases and works
  // const newCall = "0x32034d13006efeddaf4a8573bdf943c5b9c201fc1d4ad37c6ea2f239326a7d97e1411d588004d503000b63ce64c10c050100000001000000b0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafeb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe"
  // const payload =  api.createType('ExtrinsicPayload', payloadData, { version: call.version });
  // const payload = api.createType(api.registry, 4, payloadData)
  // const buffer = hexToU8a(txToSend)
  // console.log(api.registry, api.runtimeVersion.transactionVersion)
  // const payload = api.createType("ExtrinsicPayload", payloadData,  { version: call.version })
  // const payload = api.createType("ExtrinsicPayload", call.data,  { version: call.version })
  // const payload = api.createType("Extrinsic", payloadData);
  // console.log({payload: Buffer.from(payload.toU8a(true)).toString("hex")})
  // const blob = (payload.toU8a(true))
  // console.log({blob})
  // fails with either unexpected buffer end or tx not supported
  // const signed = await ledger.sign((payload.toU8a(true)))
  // console.log({signed})
  // console.log("sending transaction")
  signAsync.send(({ status, events, dispatchError }: any) => {
      // status would still be set, but in the case of error we can shortcut
      // to just check it (so an error would indicate InBlock or Finalized)
      if (dispatchError) {
        if (dispatchError.isModule) {
          // for module errors, we have the section indexed, lookup
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          const { documentation, method, section } = decoded;
  
          console.log(`${section}.${method}: ${documentation.join(" ")}`);
          process.exit();
        } else {
          // Other, CannotLookup, BadOrigin, no extra info
          console.log(dispatchError.toString());
          process.exit();
        }
      } else {
        if (status.isFinalized) {
          console.log("transaction successful");
          process.exit();
        }
      }
    });
  }
  


module.exports = {
  getApi,
  getKeypair,
  signAndSend
};
