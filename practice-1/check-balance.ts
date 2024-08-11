import "dotenv/config";
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    clusterApiUrl
} from "@solana/web3.js"

const connection = new Connection(clusterApiUrl("devnet"));
console.log(`Connected to devnet`)

const publicKey = new PublicKey("CcLvBNcfz489QvDxsCT4onnzoLphYnPFtkVcKAPvYwGU");
const balanceInLamports = await connection.getBalance(publicKey);
const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;

console.log(`Public key ${publicKey} balance is ${balanceInSol}`)