import React from 'react';
import { useSweepstakes } from '../hooks/useSweepstakes';
import PrizePool from './PrizePool';
import SweepstakesStats from './SweepstakesStats';
import BuyTicketForm from './BuyTicketForm';

const SweepstakesUI: React.FC = () => {
  const { prizePool, ticketsSold, endTime, isLoading, refreshData } = useSweepstakes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <PrizePool amount={prizePool} isLoading={isLoading} />
          <SweepstakesStats
            endTime={endTime}
            ticketsSold={ticketsSold}
            isLoading={isLoading}
          />
        </div>
        <BuyTicketForm onPurchase={refreshData} />
      </div>
    </div>
  );
};

export default SweepstakesUI;