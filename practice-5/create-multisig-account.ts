import "dotenv/config";
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { createMultisig } from '@solana/spl-token';

async function createMultisigAccount() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  let privateKey = process.env["SECRET_KEY"];
  if (privateKey === undefined) {
      console.log("Add SECRET_KEY to .env!");
      process.exit(1);
  }
  const asArray = Uint8Array.from(JSON.parse(privateKey));
  const payer = Keypair.fromSecretKey(asArray);

  const signer1 = Keypair.generate();
  const signer2 = Keypair.generate();
  const signer3 = Keypair.generate();

  console.log("Signer 1:", signer1.publicKey.toBase58());
  console.log("Signer 1 private key:", signer1.secretKey)

  console.log("Signer 2:", signer2.publicKey.toBase58());
  console.log("Signer 2 private key:", signer2.secretKey)

  console.log("Signer 3:", signer3.publicKey.toBase58());
  console.log("Signer 3 private key:", signer3.secretKey)


  const multisigKey = await createMultisig(
    connection,
    payer,
    [
      signer1.publicKey,
      signer2.publicKey,
      signer3.publicKey
    ],
    2
  );

  console.log("Multisig account created:", multisigKey);
  console.log(multisigKey)
}

createMultisigAccount().catch(console.error);
