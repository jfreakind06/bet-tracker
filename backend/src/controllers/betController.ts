import { Request, Response } from 'express';
import knex from 'knex';
// @ts-ignore
import config from '../../knexfile';
import { AuthRequest } from '../middleware/auth';
import { convertAmericanToDecimal, calculatePayoutFromOdds } from '../utils/convertOdds'

const db = knex(config[process.env.NODE_ENV || 'development']);

// Add a new bet
export const addBet = async (req: AuthRequest, res: Response) => {
  const { date, description, amountRisked, odds, result, payout } = req.body;

  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decimalOdds = convertAmericanToDecimal(Number(odds));
    const bet = await db('bets')
      .insert({
        user_id: userId,
        date,
        description,
        amount_risked: amountRisked,
        odds: decimalOdds,
        result,
        payout: result === 'win'
          ? calculatePayoutFromOdds(amountRisked, odds)
          : payout,
      })
      .returning('*');

    res.status(201).json(bet[0]);
  } catch (error) {
    console.error('Error adding bet:', error);
    res.status(400).json({ error: 'Failed to add bet' });
  }
};

// Get all bets for the logged-in user
export const getBets = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const bets = await db('bets')
      .where({ user_id: userId })
      .orderBy('date', 'desc');

    res.json(bets);
  } catch (error) {
    console.error('Error fetching bets:', error);
    res.status(500).json({ error: 'Failed to fetch bets' });
  }
};

// Update an existing bet
export const updateBet = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { result, payout } = req.body;
  const userId = req.user?.userId;
  
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // First check if the bet belongs to the user
    const existingBet = await db('bets')
      .where({ id, user_id: userId })
      .first();

    if (!existingBet) {
      return res.status(404).json({ error: 'Bet not found' });
    }

    // Calculate payout based on result and odds if not provided
    let finalPayout = payout;
    if (result === 'win' && !payout) {
      finalPayout = calculatePayoutFromOdds(existingBet.amount_risked, existingBet.odds);
    } else if (result === 'loss') {
      finalPayout = 0;
    } else if (result === 'push') {
      finalPayout = existingBet.amount_risked; // Return original stake
    }

    const updatedBet = await db('bets')
      .where({ id, user_id: userId })
      .update({
        result,
        payout: finalPayout,
        updated_at: new Date()
      })
      .returning('*');

    if (updatedBet.length === 0) {
      return res.status(404).json({ error: 'Bet not found' });
    }

    res.json(updatedBet[0]);
  } catch (error) {
    console.error('Error updating bet:', error);
    res.status(500).json({ error: 'Failed to update bet' });
  }
};

// Calculate ROI based on timeframe
export const getROI = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { timeframe } = req.query;
  let fromDate = new Date();

  switch (timeframe) {
    case 'day':
      fromDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      fromDate.setDate(fromDate.getDate() - fromDate.getDay());
      fromDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
      break;
    case 'year':
      fromDate = new Date(fromDate.getFullYear(), 0, 1);
      break;
    default:
      fromDate = new Date(0);
  }

  try {
    const bets = await db('bets')
      .where('user_id', userId)
      .andWhere('date', '>=', fromDate);

    const totalRisked = bets.reduce((sum, b) => sum + Number(b.amount_risked), 0);
    const totalWon = bets.reduce(
      (sum, b) => sum + (b.result === 'win' ? Number(b.payout) : 0),
      0
    );
    const roi = totalRisked > 0 ? ((totalWon - totalRisked) / totalRisked) * 100 : 0;

    res.json({ roi, totalRisked, totalWon, count: bets.length, timeframe });
  } catch (error) {
    console.error('Error calculating ROI:', error);
    res.status(500).json({ error: 'Failed to calculate ROI' });
  }
};
