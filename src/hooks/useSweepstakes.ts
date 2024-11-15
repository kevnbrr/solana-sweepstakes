import { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const PROGRAM_ID = new PublicKey('8TJjyzq3iXc48MgV6TD5DumKKwfWKU14Qpi5cCACuKd1');
const SWEEPSTAKES_ACCOUNT = new PublicKey('6VdwfxHpz4nPPuGFcvYHHGvQaMKxvYZR9FnKqGKxhKrT');

export const useSweepstakes = () => {
  const { connection } = useConnection();
  const { connected } = useWallet();
  const [prizePool, setPrizePool] = useState<number>(0);
  const [ticketsSold, setTicketsSold] = useState<number>(0);
  const [endTime] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSweepstakesData = async () => {
    if (!connection) return;
    
    try {
      const accountInfo = await connection.getAccountInfo(SWEEPSTAKES_ACCOUNT);
      if (accountInfo) {
        const prizePoolLamports = accountInfo.lamports;
        setPrizePool(prizePoolLamports / LAMPORTS_PER_SOL);
        setTicketsSold(Math.floor(Math.random() * 256));
      }
    } catch (error) {
      console.error('Error fetching sweepstakes data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!connection) return;
    
    fetchSweepstakesData();
    
    const subscriptionId = connection.onAccountChange(
      SWEEPSTAKES_ACCOUNT,
      fetchSweepstakesData,
      'confirmed'
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, connected]);

  return {
    prizePool,
    ticketsSold,
    endTime,
    isLoading,
    refreshData: fetchSweepstakesData
  };
};