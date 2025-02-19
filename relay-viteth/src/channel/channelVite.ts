// ---------
// ---------
import * as utils from "../utils/utils";
import { ViteAPI, abi } from "@vite/vitejs";
const { HTTP_RPC } = require("@vite/vitejs-http");
import { wallet, accountBlock } from "@vite/vitejs";
import { constant } from "@vite/vitejs";
import _viteAbi from "./channel.vite.abi.json";
import { offChainCode } from "./channel.vite.code.json";
import { decodeLog } from "@vite/vitejs/distSrc/abi";

interface ConfirmedInfo {
  scannedHeight: string;
  index: string;
}

const VITE_INFO_PATH_PREFIX = "./.channel_vite/info";

const ConfirmedThreshold = 1;

export class ChannelVite {
  infoPath: string;

  viteProvider: any;
  viteChannelAddress: string;

  viteChannelAbi: any[];
  viteOffChainCode: any;

  signerAddress: string;
  signerPrivateKey: string;

  constructor(cfg: any) {
    this.viteChannelAbi = _viteAbi;
    this.viteOffChainCode = Buffer.from(offChainCode, "hex").toString("base64");
    this.infoPath = VITE_INFO_PATH_PREFIX;
    this.viteProvider = new ViteAPI(new HTTP_RPC(cfg.url), () => {
      console.log("vite provider connected");
    });
    this.viteChannelAddress = cfg.address;
    const viteWallet = wallet.getWallet(cfg.mnemonic);
    const viteSigner = viteWallet.deriveAddressList(0, 1)[0];
    this.signerAddress = viteSigner.address;
    this.signerPrivateKey = viteSigner.privateKey;
  }

  getInfo(prefix: string): any {
    let json = utils.readJson(this.infoPath + prefix);
    if (!json) {
      return json;
    }
    let info = JSON.parse(json);
    return info;
  }

  updateInfo(prefix: string, info: any) {
    utils.writeJson(this.infoPath + prefix, JSON.stringify(info));
  }

  async scanInputEvents(fromHeight: string) {
    console.log("vite", "scan input events", fromHeight);
    return this.scanEvents(fromHeight, "Input");
  }

  async scanInputProvedEvents(fromHeight: string) {
    console.log("vite", "scan proved events", fromHeight);
    return this.scanEvents(fromHeight, "InputProved");
  }

  async scanEvents(fromHeight: string, eventName: string) {
    const channelAddress = this.viteChannelAddress;
    let heightRange = {
      [channelAddress]: {
        fromHeight: (BigInt(fromHeight) + 1n).toString(),
        toHeight: "0",
      },
    };
    // console.log(JSON.stringify(heightRange));
    const vmLogs = await this.viteProvider.request("ledger_getVmLogsByFilter", {
      addressHeightRange: heightRange,
    });

    if (!vmLogs) {
      return {
        toHeight: fromHeight,
        events: [],
      };
    }
    const eventAbi = this.viteChannelAbi.find(
      (item: { name: string; type: string }) =>
        item.type === "event" && item.name === eventName
    );

    const events = vmLogs.filter((x: any) => {
      return this.encodeLogId(eventAbi) === x.vmlog.topics[0];
    });

    if (!events || events.length === 0) {
      return { toHeight: fromHeight, events: [] };
    }

    return {
      toHeight: fromHeight,
      events: events.map((input: any) => {
        const event: any = this.decodeEvent(
          input.vmlog,
          this.viteChannelAbi,
          eventName
        );
        return {
          event: event,
          height: input.accountBlockHeight,
          hash: input.accountBlockHash,
        };
      }),
    };
  }

  // filterInputLog(
  //   log: any,
  //   channelAbi: Array<{ name: string; type: string; }>,
  //   name: string
  // ) {

  //   const targetAbi = channelAbi.find(
  //     (item) => item.type === "event" && item.name === name
  //   );

  //   log.topics[0] ==
  //   const result = abi.decodeLog(
  //     channelAbi,
  //     Buffer.from(log.data ? log.data : "", "base64").toString("hex"),
  //     log.topics.slice(1, log.topics.length),
  //     ""
  //   );
  // }
  decodeEvent(
    log: any,
    channelAbi: Array<{ name: string; type: string }>,
    name: string
  ) {
    const result = abi.decodeLog(
      channelAbi,
      Buffer.from(log.data ? log.data : "", "base64").toString("hex"),
      log.topics.slice(1, log.topics.length),
      name
    );
    return Object.assign(result, { name: name });
  }

  decodeLog(log: any, channelAbi: Array<{ name: string; type: string }>) {
    // console.log(JSON.stringify(log));
    // console.log(JSON.stringify(channelAbi));
    // console.log(log, log['topics'], log['topics'][0]);
    const abiItem = channelAbi.find(
      (item) => this.encodeLogId(item) === log.topics[0]
    );

    // console.log(abiItem);
    const result = abi.decodeLog(
      channelAbi,
      Buffer.from(log.data ? log.data : "", "base64").toString("hex"),
      log.topics.slice(1, log.topics.length),
      abiItem?.name
    );
    return Object.assign(result, { name: abiItem?.name });
  }

  encodeLogId(item: { name: string; type: string }) {
    let id = "";
    if (item.type === "function") {
      id = abi.encodeFunctionSignature(item);
    } else if (item.type === "event") {
      id = abi.encodeLogSignature(item);
    }
    return id;
  }

  async output(id: string, address: string, value: string) {
    const sendResult = await writeContract(
      this.viteProvider,
      this.signerAddress,
      this.signerPrivateKey,
      this.viteChannelAddress,
      this.viteChannelAbi,
      "output",
      [id, address, value]
    );
  }

  async approveOutput(id: string) {
    const sendResult = await writeContract(
      this.viteProvider,
      this.signerAddress,
      this.signerPrivateKey,
      this.viteChannelAddress,
      this.viteChannelAbi,
      "approveOutput",
      [id]
    );
  }

  async approveAndExecOutput(id: string, dest: string, value: string) {
    const sendResult = await writeContract(
      this.viteProvider,
      this.signerAddress,
      this.signerPrivateKey,
      this.viteChannelAddress,
      this.viteChannelAbi,
      "approveAndExecOutput",
      [id, dest, value]
    );
  }

  async proveInputId(v: number, r: string, s: string, id: string) {
    const sendResult = await writeContract(
      this.viteProvider,
      this.signerAddress,
      this.signerPrivateKey,
      this.viteChannelAddress,
      this.viteChannelAbi,
      "proveInputId",
      [v, r, s, id]
    );
  }

  async inputIndex() {
    return readContract(
      this.viteProvider,
      this.viteChannelAddress,
      this.viteChannelAbi,
      this.viteOffChainCode,
      "inputIndex",
      []
    );
  }

  async prevInputId() {
    return readContract(
      this.viteProvider,
      this.viteChannelAddress,
      this.viteChannelAbi,
      this.viteOffChainCode,
      "prevInputId",
      []
    );
  }

  async outputIndex() {
    return readContract(
      this.viteProvider,
      this.viteChannelAddress,
      this.viteChannelAbi,
      this.viteOffChainCode,
      "outputIndex",
      []
    );
  }

  async prevOutputId() {
    return readContract(
      this.viteProvider,
      this.viteChannelAddress,
      this.viteChannelAbi,
      this.viteOffChainCode,
      "prevOutputId",
      []
    );
  }

  async approvedCnt(id: string) {
    return readContract(
      this.viteProvider,
      this.viteChannelAddress,
      this.viteChannelAbi,
      this.viteOffChainCode,
      "approvedCnt",
      [id]
    );
  }
  async approvedKeepers(id: string, address: string) {
    return readContract(
      this.viteProvider,
      this.viteChannelAddress,
      this.viteChannelAbi,
      this.viteOffChainCode,
      "approvedKeepers",
      [id, address]
    );
  }
}

async function writeContract(
  provider: any,
  from: string,
  signerKey: string,
  to: string,
  abi: Array<{ name: string; type: string }>,
  methodName: string,
  params: any[]
) {
  const tokenId = constant.Vite_TokenId;
  const amount = "0";

  const methodAbi = abi.find((x) => {
    return x.name === methodName && x.type === "function";
  });
  if (!methodAbi) {
    throw new Error("method not found: " + methodName);
  }
  const block = accountBlock.createAccountBlock("callContract", {
    address: from,
    abi: methodAbi,
    toAddress: to,
    params: params,
    tokenId: tokenId,
    amount: amount,
  });
  block.setProvider(provider).setPrivateKey(signerKey);

  await block.autoSetPreviousAccountBlock();
  const result = await block.sign().send();
  console.log("send block success", result);
  return result;
}

async function readContract(
  provider: any,
  to: string,
  abi: Array<{ name: string; type: string }>,
  code: any,
  methodName: string,
  params: any[]
) {
  const methodAbi = abi.find((x) => {
    return x.type === "offchain" && x.name === methodName;
  });
  if (!methodAbi) {
    throw new Error("method not found:" + methodName);
  }

  // console.log(to, methodAbi);
  return provider.callOffChainContract({
    address: to,
    abi: methodAbi,
    code: code,
    params: params,
  });
}

export async function confirmed(provider: any, hash: string) {
  return provider
    .request("ledger_getAccountBlockByHash", hash)
    .then((block: any) => {
      if (!block) {
        return false;
      } else {
        if (!block.confirmedHash) {
          return false;
        }
        if (block.confirmedTimes < ConfirmedThreshold) {
          return false;
        }
        return true;
      }
    });
}
