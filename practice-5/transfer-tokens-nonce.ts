const {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
  NonceAccount,
  clusterApiUrl
} = require('@solana/web3.js');
require('dotenv').config();

const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');
const fromWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.SECRET_KEY)));
const toWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.SECOND_SECRET_KEY)));
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 9);
const waitTime = 5000;

const getExplorerLink = (type, txid, network) => `https://explorer.solana.com/${type}/${txid}?cluster=${network}`;

(async () => {
  const nonceAccountPubkey = new PublicKey("FYZ3BqnatmAvjF1kxTL96fGLbaBuhdViQ3SHbBN5BavN");
  const nonceAccountInfo = await connection.getAccountInfo(nonceAccountPubkey);
  const nonceAccount = NonceAccount.fromAccountData(nonceAccountInfo.data);

  const transferAmount = 1200000; // 0.0012 SOL в лампортах

  console.log('Публичный ключ отправителя:', fromWallet.publicKey.toBase58());
  console.log('Публичный ключ получателя:', toWallet.publicKey.toBase58());
  console.log('Сумма перевода:', transferAmount / MINOR_UNITS_PER_MAJOR_UNITS);

  const durableTransaction = new Transaction();
  durableTransaction.feePayer = fromWallet.publicKey;
  durableTransaction.recentBlockhash = nonceAccount.nonce;

  durableTransaction.add(
    SystemProgram.nonceAdvance({
      noncePubkey: nonceAccountPubkey,
      authorizedPubkey: fromWallet.publicKey,
    })
  );

  durableTransaction.add(
    SystemProgram.transfer({
      fromPubkey: fromWallet.publicKey,
      toPubkey: toWallet.publicKey,
      lamports: transferAmount,
    })
  );

  console.log(`Ожидаем ${waitTime / 1000} секунд`);

  setTimeout(async () => {
    durableTransaction.sign(fromWallet);
    console.log('Получатель подписал транзакцию')
    const serializedTransaction = durableTransaction.serialize();
    const signature = await connection.sendRawTransaction(serializedTransaction);
    
    await connection.confirmTransaction(signature);
    console.log('Транзакция подтверждена');

    const explorerLink = getExplorerLink("tx", signature, "devnet");
    console.log('Ссылка на Explorer:', explorerLink);
  }, waitTime);
})();
