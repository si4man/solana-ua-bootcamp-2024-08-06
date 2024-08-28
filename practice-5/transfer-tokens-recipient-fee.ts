import 'dotenv/config';
import { clusterApiUrl, Connection, Keypair, Transaction, PublicKey, Blockhash } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from '@solana/spl-token';
import { getExplorerLink } from "@solana-developers/helpers";

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const fromWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.SECRET_KEY)));
    const toWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.SECOND_SECRET_KEY)));

    const mint = new PublicKey("7vCYr8adYrGQcHJYH5JDjkFMrGRV5g4ZvgCkVc6fDnbJ");

    console.log(`Отправитель: ${fromWallet.publicKey.toBase58()}`);
    console.log(`Получатель: ${toWallet.publicKey.toBase58()}`);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, fromWallet.publicKey);
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, toWallet, mint, toWallet.publicKey);

    // console.log(`Аккаунт токенов отправителя: ${fromTokenAccount.address.toBase58()}`);
    // console.log(`Аккаунт токенов получателя: ${toTokenAccount.address.toBase58()}`);

    // использование transfer() не подразумевает такое использование
    const transaction = new Transaction();

    const transferInstruction = createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        10 // 0.1
    );
    transaction.add(transferInstruction);

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    transaction.feePayer = toWallet.publicKey; // кто платит за транзу

    transaction.partialSign(fromWallet);

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false });
    console.log('Транзакция сериализована и передана получателю.');

    const deserializedTransaction = Transaction.from(serializedTransaction);

    console.log('Получатель подписывает транзакцию...');
    deserializedTransaction.partialSign(toWallet);

    console.log('Отправка транзакции в сеть...');
    const txid = await connection.sendRawTransaction(deserializedTransaction.serialize());

    const link = getExplorerLink("transaction", txid, "devnet");
    console.log("Транзакция успешно отправлена:", link);
})();
