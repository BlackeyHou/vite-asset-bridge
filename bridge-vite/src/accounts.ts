import * as cfg from "./config";
import { wallet } from "@vite/vitejs";

const mnemonic = cfg.network.mnemonic;

// test accounts
const viteWallet = wallet.getWallet(mnemonic);

const _accounts = viteWallet.deriveAddressList(0, 10);

// console.log("Default Accounts:");

_accounts.forEach((account, index) => {
  console.log(index, account.address, account.privateKey);
});

export const accounts = _accounts;

export const defaultWallet = viteWallet;

export function selectAccount(address: string) {
  return accounts.filter((t) => {
    t.address === address;
  })[0];
}

console.log(__dirname);
