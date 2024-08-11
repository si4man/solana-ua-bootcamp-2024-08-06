import { Keypair } from "@solana/web3.js";
const keypair = Keypair.generate();
console.log("Generated keypair");

console.log(`Public key: ${keypair.publicKey.toBase58()}`)
console.log(`Private key: ${keypair.secretKey}`)

