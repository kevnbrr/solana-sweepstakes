import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Ticket } from 'lucide-react';
import { useProgram } from '../hooks/useProgram';

interface BuyTicketFormProps {
  onPurchase: () => void;
}

export default function BuyTicketForm({ onPurchase }: BuyTicketFormProps) {
  const { connected } = useWallet();
  const { buyTicket } = useProgram();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const entryFee = 0.1; // SOL

  const handleBuyTicket = async () => {
    if (!connected || isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);
      
      const signature = await buyTicket();
      console.log('Transaction successful:', signature);
      await onPurchase();
    } catch (err: any) {
      console.error('Error buying ticket:', err);
      setError(err.message || 'Failed to purchase ticket. Please ensure you have enough SOL and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Enter Sweepstakes</h2>
      <div className="space-y-6">
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80">Entry Fee</span>
            <span className="text-white font-semibold">{entryFee} SOL</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/80">Your Tickets</span>
            <span className="text-white font-semibold">
              {connected ? '0' : '-'}
            </span>
          </div>
        </div>

        {!connected ? (
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !transition-colors" />
          </div>
        ) : (
          <>
            <button
              onClick={handleBuyTicket}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Ticket className="w-5 h-5" />
              <span>{isProcessing ? 'Processing...' : 'Buy Ticket'}</span>
            </button>
            
            {error && (
              <div className="text-red-400 text-sm text-center mt-2 bg-red-400/10 rounded-lg p-2 border border-red-400/20">
                {error}
              </div>
            )}
          </>
        )}

        <div className="text-white/60 text-sm">
          <p>• 80% of entry fees go to the prize pool</p>
          <p>• Winner is randomly selected after 30 days or 256 tickets</p>
          <p>• Funds are automatically transferred to the winner</p>
        </div>
      </div>
    </div>
  );
}