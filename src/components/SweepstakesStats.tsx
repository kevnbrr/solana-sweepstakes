import React from 'react';
import { Timer, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SweepstakesStatsProps {
  endTime: Date;
  ticketsSold: number;
  isLoading: boolean;
}

const SweepstakesStats: React.FC<SweepstakesStatsProps> = ({
  endTime,
  ticketsSold,
  isLoading,
}) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Time Left</h3>
        <Timer className="w-5 h-5 text-blue-400" />
      </div>
      {isLoading ? (
        <div className="animate-pulse bg-white/20 h-6 w-24 rounded"></div>
      ) : (
        <p className="text-white/90">{formatDistanceToNow(endTime, { addSuffix: true })}</p>
      )}
    </div>
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Tickets Sold</h3>
        <Users className="w-5 h-5 text-green-400" />
      </div>
      {isLoading ? (
        <div className="animate-pulse bg-white/20 h-6 w-24 rounded"></div>
      ) : (
        <p className="text-white/90">{ticketsSold}/256</p>
      )}
    </div>
  </div>
);

export default SweepstakesStats;