import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('8TJjyzq3iXc48MgV6TD5DumKKwfWKU14Qpi5cCACuKd1');
const SWEEPSTAKES_ACCOUNT = new PublicKey('6VdwfxHpz4nPPuGFcvYHHGvQaMKxvYZR9FnKqGKxhKrT');
const DEVELOPER_WALLET = new PublicKey('5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG');
const PRIZE_POOL_ACCOUNT = new PublicKey('7WNkC3cjwqxXtyN2ghgBQ2kHrE4GQKjiaM2GXhHj3NrT');

export const useProgram = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const buyTicket = async () => {
    if (!publicKey) throw new Error('Wallet not connected');

    try {
      // Create the transfer instruction for entry fee
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: SWEEPSTAKES_ACCOUNT,
        lamports: 0.1 * LAMPORTS_PER_SOL,
      });

      // Create the program instruction
      const programInstruction = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          {
            pubkey: SWEEPSTAKES_ACCOUNT,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: publicKey,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: DEVELOPER_WALLET,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: PRIZE_POOL_ACCOUNT,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: Buffer.from([0]),
      });

      // Get the latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      // Create and populate the transaction
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(transferInstruction, programInstruction);

      // Send the transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      return signature;
    } catch (error: any) {
      console.error('Transaction error:', error);
      throw new Error(error.message || 'Failed to process transaction');
    }
  };

  return {
    buyTicket,
  };
};