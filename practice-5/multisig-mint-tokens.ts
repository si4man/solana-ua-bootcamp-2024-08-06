import "dotenv/config";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, getMint } from "@solana/spl-token";
import { getExplorerLink } from "@solana-developers/helpers";

let privateKey = process.env["SECRET_KEY"];
if (privateKey === undefined) {
    console.log("Add SECRET_KEY to .env!");
    process.exit(1);
}
const asArray = Uint8Array.from(JSON.parse(privateKey));
const payer = Keypair.fromSecretKey(asArray);

const connection = new Connection(clusterApiUrl("devnet"));

const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const mintTokenCounter = 3

const mint = new PublicKey("7vCYr8adYrGQcHJYH5JDjkFMrGRV5g4ZvgCkVc6fDnbJ");
const multisigKey = new PublicKey("BZP3gkg8jsM1cE1XesVkFoiNxwjz5qw3ZHaaKVghqnpn");

console.log('Prepare to mint tokens, init signers.')

const signer1PrivateKey = Uint8Array.from(JSON.parse(process.env["SIGNER1_KEY"] || "[]"));
const signer2PrivateKey = Uint8Array.from(JSON.parse(process.env["SIGNER2_KEY"] || "[]"));
const signer3PrivateKey = Uint8Array.from(JSON.parse(process.env["SIGNER3_KEY"] || "[]"));

const signer1 = Keypair.fromSecretKey(signer1PrivateKey);
const signer2 = Keypair.fromSecretKey(signer2PrivateKey);
const signer3 = Keypair.fromSecretKey(signer3PrivateKey);


console.log(`Signer 1: ${signer1.publicKey}`)
console.log(`Signer 2: ${signer2.publicKey}`)
console.log(`Signer 3: ${signer3.publicKey}`)


const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
);

console.log(`Associated Token Account: ${associatedTokenAccount.address.toBase58()}`);

const transactionSignature = await mintTo(
    connection,
    payer,
    mint,
    associatedTokenAccount.address,
    multisigKey,
    mintTokenCounter * MINOR_UNITS_PER_MAJOR_UNITS,
    [
        signer1,
        signer2,
        signer3
    ]
)

const mintInfo = await getMint(
    connection,
    mint
)

const link = getExplorerLink("transaction", transactionSignature, "devnet");

console.log(`\nMinted ${mintTokenCounter} token (Supply is ${Number(mintInfo.supply) / MINOR_UNITS_PER_MAJOR_UNITS}), link: ${link}`);