import "dotenv/config";
import { Connection, Keypair, PublicKey, clusterApiUrl, Transaction, SystemProgram, NONCE_ACCOUNT_LENGTH, sendAndConfirmTransaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, getMint } from "@solana/spl-token";
import { getExplorerLink } from "@solana-developers/helpers";

let privateKey = process.env["SECRET_KEY"];
if (privateKey === undefined) {
    console.log("Add SECRET_KEY to .env!");
    process.exit(1);
}
const asArray = Uint8Array.from(JSON.parse(privateKey));
const user = Keypair.fromSecretKey(asArray);

const connection = new Connection(
    clusterApiUrl('devnet'),
    'confirmed',
  );
  
  const nonceAccount = Keypair.generate();
  
  const minimumAmount = await connection.getMinimumBalanceForRentExemption(
    NONCE_ACCOUNT_LENGTH,
  );
  
  // Form CreateNonceAccount transaction
  const transaction = new Transaction()
    .add(
    SystemProgram.createNonceAccount({
      fromPubkey: user.publicKey,
      noncePubkey: nonceAccount.publicKey,
      authorizedPubkey: user.publicKey,
      lamports: minimumAmount,
    }), 
  );
  
  let txid = await sendAndConfirmTransaction(connection, transaction, [user, nonceAccount])
  
  const nonceAccountData = await connection.getNonce(
    nonceAccount.publicKey,
    'confirmed',
  );

  const link = getExplorerLink("tx", txid, "devnet");

  console.log(`Nonce account: ${nonceAccount.publicKey}`);
  console.log(`Link: ${link}`)
