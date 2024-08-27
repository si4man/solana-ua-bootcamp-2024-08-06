import "dotenv/config";
import {
    Connection, clusterApiUrl, Keypair, PublicKey, sendAndConfirmTransaction, Transaction,
} from "@solana/web3.js";
import { getExplorerLink } from "@solana-developers/helpers";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

// Загружаем приватный ключ отправителя из .env файла
let privateKey = process.env["SECRET_KEY"];
if (privateKey === undefined) {
    console.log("Add SECRET_KEY to .env!");
    process.exit(1);
}
const asArray = Uint8Array.from(JSON.parse(privateKey));
const user = Keypair.fromSecretKey(asArray);

const connection = new Connection(clusterApiUrl("devnet"));

// Задаем публичный ключ multisig аккаунта
const multisigPubkey = new PublicKey("9e8xMeoaTaQUwrMDLgptVFx6FfwxGrDRj9YPpVC3mjDK");

// Приватные ключи участников multisig
const signer1PrivateKey = Uint8Array.from(JSON.parse(process.env["SIGNER1_KEY"] || "[]"));
const signer2PrivateKey = Uint8Array.from(JSON.parse(process.env["SIGNER2_KEY"] || "[]"));
const signer3PrivateKey = Uint8Array.from(JSON.parse(process.env["SIGNER3_KEY"] || "[]"));

const signer1 = Keypair.fromSecretKey(signer1PrivateKey);
const signer2 = Keypair.fromSecretKey(signer2PrivateKey);
const signer3 = Keypair.fromSecretKey(signer3PrivateKey);

const multisigSigners = [signer1, signer2, signer3];

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const tokenMintAccount = new PublicKey(
    "EJ3w17fceNYGBewnRN5FyjHW8tJjKgTLozZ7VLCbNG53"
);

const metadataData = {
    name: "Multicamp Coins",
    symbol: "MULTICMP",
    uri: "",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
};

// Находим PDA для метаданных
const [metadataPDA, _metadataBump] = PublicKey.findProgramAddressSync(
    [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        tokenMintAccount.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
);

// Создаем инструкцию для создания аккаунта метаданных
const createMetadataAccountInstruction =
    createCreateMetadataAccountV3Instruction(
        {
            metadata: metadataPDA,
            mint: tokenMintAccount,
            mintAuthority: multisigPubkey,  // Используем multisig в качестве mint authority
            payer: user.publicKey,  // Плательщик транзакции
            updateAuthority: multisigPubkey,  // Multisig также будет update authority
        },
        {
            createMetadataAccountArgsV3: {
                collectionDetails: null,
                data: metadataData,
                isMutable: true,
            },
        }
    );

// Создаем транзакцию и добавляем инструкцию создания метаданных
const transaction = new Transaction();
transaction.add(createMetadataAccountInstruction);

// Подписываем транзакцию всеми участниками multisig
transaction.partialSign(...multisigSigners);

// Отправляем транзакцию в сеть
const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [user, ...multisigSigners]  // Все участники multisig должны подписать транзакцию
);

console.log(`✅ Транзакция завершена: ${signature}`);

const tokenMintLink = getExplorerLink(
    "address",
    tokenMintAccount.toString(),
    "devnet"
);
console.log(`✅ Посмотрите на токен-минт снова: ${tokenMintLink}!`);
