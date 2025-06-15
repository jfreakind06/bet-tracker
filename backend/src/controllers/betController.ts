import { Request, Response } from 'express';
import db from '../db';

export const addBet = async (req: any, res: Response) => {
  const { date, description, amountRisked, odds, result, payout } = req.body;
  try {
    const bet = await db('bets').insert({
      user_id: req.user.userId,
      date,
      description,
      amount_risked: amountRisked,
      odds,
      result,
      payout,
    }).returning('*');
    res.json(bet[0]);
  } catch {
    res.status(400).json({ error: 'Failed to add bet' });
  }
};

export const getBets = async (req: any, res: Response) => {
  const bets = await db('bets')
    .where({ user_id: req.user.userId })
    .orderBy('date', 'desc');
  res.json(bets);
};

export const getROI = async (req: any, res: Response) => {
  const { timeframe } = req.query;
  const userId = req.user.userId;
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

  const bets = await db('bets')
    .where('user_id', userId)
    .andWhere('date', '>=', fromDate);

  const totalRisked = bets.reduce((sum, b) => sum + Number(b.amount_risked), 0);
  const totalWon = bets.reduce((sum, b) => sum + (b.result === 'win' ? Number(b.payout) : 0), 0);
  const roi = totalRisked > 0 ? ((totalWon - totalRisked) / totalRisked) * 100 : 0;

  res.json({ roi, totalRisked, totalWon, count: bets.length, timeframe });
};
