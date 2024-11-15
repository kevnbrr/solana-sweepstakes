import React from 'react';
import { Trophy } from 'lucide-react';

interface PrizePoolProps {
  amount: number;
  isLoading: boolean;
}

const PrizePool: React.FC<PrizePoolProps> = ({ amount, isLoading }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white">Current Prize Pool</h2>
      <Trophy className="w-8 h-8 text-yellow-400" />
    </div>
    <div className="text-5xl font-bold text-white">
      {isLoading ? (
        <div className="animate-pulse bg-white/20 h-12 w-32 rounded"></div>
      ) : (
        <>
          {amount.toFixed(2)} <span className="text-2xl">SOL</span>
        </>
      )}
    </div>
  </div>
);

export default PrizePool;