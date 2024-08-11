import { Keypair } from "@solana/web3.js";

let finded = false
const prefix = "alex"

while (!finded) {
    let keypair = Keypair.generate()
    let publicKey = keypair.publicKey.toBase58()
    let publicKeyPrefix = publicKey.substring(0, prefix.length).toLowerCase();

    if (publicKeyPrefix != prefix) {
        console.log(`New key generated: ${publicKey}`)
    } else {
        finded = true;
        console.log(`\nKey with prefix "${prefix}" generated: ${publicKey}`)
        const privateKey = keypair.secretKey
        console.log(`Private key: ${privateKey}`)
    }
}


