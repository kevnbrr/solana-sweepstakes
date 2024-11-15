use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("DZCPEGzDuqrm5XGh8FxiMxYTd4zyGkJqV9MR3WkXgJTR");

#[program]
pub mod solana_sweepstakes {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, developer_wallet: Pubkey) -> Result<()> {
        let sweepstakes = &mut ctx.accounts.sweepstakes;
        sweepstakes.authority = ctx.accounts.authority.key();
        sweepstakes.developer_wallet = developer_wallet;
        sweepstakes.prize_pool = 0;
        sweepstakes.tickets_sold = 0;
        sweepstakes.start_time = Clock::get()?.unix_timestamp;
        sweepstakes.is_active = true;
        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        let sweepstakes = &mut ctx.accounts.sweepstakes;
        let clock = Clock::get()?;

        require!(
            sweepstakes.is_active,
            SweepstakesError::SweepstakesNotActive
        );

        require!(
            sweepstakes.tickets_sold < 256,
            SweepstakesError::MaxTicketsReached
        );

        require!(
            clock.unix_timestamp - sweepstakes.start_time <= 30 * 24 * 60 * 60,
            SweepstakesError::SweepstakesExpired
        );

        // Transfer SOL from buyer
        let entry_fee = 100_000_000; // 0.1 SOL in lamports
        let developer_fee = entry_fee / 5; // 20%
        let prize_pool_amount = entry_fee - developer_fee;

        // Transfer developer fee
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.developer_wallet.to_account_info(),
                },
            ),
            developer_fee,
        )?;

        // Add to prize pool
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.prize_pool.to_account_info(),
                },
            ),
            prize_pool_amount,
        )?;

        sweepstakes.tickets_sold += 1;
        sweepstakes.prize_pool += prize_pool_amount;

        // Check if sweepstakes should end
        if sweepstakes.tickets_sold >= 256 {
            sweepstakes.is_active = false;
            // Trigger winner selection
            select_winner(ctx)?;
        }

        Ok(())
    }

    pub fn select_winner(ctx: Context<SelectWinner>) -> Result<()> {
        let sweepstakes = &mut ctx.accounts.sweepstakes;
        require!(!sweepstakes.is_active, SweepstakesError::SweepstakesStillActive);

        // Use recent blockhash as randomness source
        let recent_slothash = Clock::get()?.unix_timestamp;
        let winner_index = (recent_slothash as u64 % sweepstakes.tickets_sold as u64) as u8;

        // Transfer prize pool to winner
        // Implementation details for winner transfer...

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 32 + 8 + 1 + 8 + 1)]
    pub sweepstakes: Account<'info, Sweepstakes>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub sweepstakes: Account<'info, Sweepstakes>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Safe because this is just a fund recipient
    #[account(mut)]
    pub developer_wallet: AccountInfo<'info>,
    /// CHECK: Safe because this is just a fund recipient
    #[account(mut)]
    pub prize_pool: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SelectWinner<'info> {
    #[account(mut)]
    pub sweepstakes: Account<'info, Sweepstakes>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Sweepstakes {
    pub authority: Pubkey,
    pub developer_wallet: Pubkey,
    pub prize_pool: u64,
    pub tickets_sold: u8,
    pub start_time: i64,
    pub is_active: bool,
}

#[error_code]
pub enum SweepstakesError {
    #[msg("Sweepstakes is not active")]
    SweepstakesNotActive,
    #[msg("Maximum number of tickets already sold")]
    MaxTicketsReached,
    #[msg("Sweepstakes has expired")]
    SweepstakesExpired,
    #[msg("Sweepstakes is still active")]
    SweepstakesStillActive,
}