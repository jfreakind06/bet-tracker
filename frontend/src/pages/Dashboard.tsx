import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../pagesCss/Dashboard.css'

interface Bet {
  id: number;
  date: string;
  description: string;
  amount_risked: number;
  odds: number;
  result: string;
  payout: number;
}

interface RoiData {
  roi: number;
  totalRisked: number;
  totalWon: number;
  count: number;
  timeframe: string;
}

const Dashboard: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [roi, setRoi] = useState<RoiData | null>(null);
  const [form, setForm] = useState({
    date: '',
    description: '',
    amountRisked: '',
    odds: '',
    result: '',
    payout: '',
  });
  const [timeframe, setTimeframe] = useState<string>('week');
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem('token');

  const fetchBets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/bets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBets(res.data);
    } catch (err) {
      console.error('Failed to fetch bets', err);
    }
  };

  const fetchROI = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/bets/roi?timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoi(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch ROI', err);
      setError('Failed to fetch ROI.');
    }
  };

  const addBet = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/bets',
        {
          ...form,
          amountRisked: parseFloat(form.amountRisked),
          odds: parseFloat(form.odds),
          payout: parseFloat(form.payout),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBets([res.data, ...bets]);
      setForm({
        date: '',
        description: '',
        amountRisked: '',
        odds: '',
        result: '',
        payout: '',
      });
    } catch (err) {
      console.error('Failed to add bet', err);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  useEffect(() => {
    fetchROI();
  }, [timeframe]);

  useEffect(() => {
  const amount = parseFloat(form.amountRisked);
  const odds = parseFloat(form.odds);

  if (
    form.result === 'win' &&
    !isNaN(amount) &&
    !isNaN(odds)
  ) {
    let payout = 0;
    if (odds > 0) {
      payout = amount + (amount * odds) / 100;
    } else {
      payout = amount + (amount * 100) / Math.abs(odds);
    }

    setForm((prev) => ({ ...prev, payout: payout.toFixed(2) }));
  }
}, [form.amountRisked, form.odds, form.result]);


  return (
    <div className="dashboard">
      <h2 className="dashboard__heading">My Bets</h2>

      <form
        className="dashboard__form"
        onSubmit={(e) => {
          e.preventDefault();
          addBet();
        }}
      >
        <input
          className="dashboard__input"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          className="dashboard__input"
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          className="dashboard__input"
          type="number"
          placeholder="Amount Risked"
          value={form.amountRisked}
          onChange={(e) => setForm({ ...form, amountRisked: e.target.value })}
          required
        />
        <input
          className="dashboard__input"
          type="number"
          placeholder="Odds"
          value={form.odds}
          onChange={(e) => setForm({ ...form, odds: e.target.value })}
          required
        />
        <label htmlFor="result" className="dashboard__label">
        Bet Outcome:
        </label>
        <select
            id="result"
            className="dashboard__input"
            value={form.result}
            onChange={(e) => setForm({ ...form, result: e.target.value })}
            required
        >
            <option value="" disabled>
                -- Select Outcome --
            </option>
            <option value="win">✅ Win</option>
            <option value="loss">❌ Loss</option>
            <option value="push">➖ Push</option>
        </select>
        <input
          className="dashboard__input"
          type="number"
          placeholder="Payout"
          value={form.payout}
          onChange={(e) => setForm({ ...form, payout: e.target.value })}
          required
        />
        <button className="dashboard__button" type="submit">Add Bet</button>
      </form>

      <ul className="dashboard__bets">
        {bets.map((bet) => (
          <li key={bet.id} className="dashboard__bet">
            <strong>{bet.date}</strong> — {bet.description} — ${bet.amount_risked} @ {bet.odds} — {bet.result} — Won ${bet.payout}
          </li>
        ))}
      </ul>

      <hr className="dashboard__divider" />

      <h2 className="dashboard__heading">ROI Summary</h2>
      <div className="dashboard__filter">
        <label htmlFor="timeframe">Timeframe: </label>
        <select
          id="timeframe"
          className="dashboard__input"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {error && <p className="dashboard__error">{error}</p>}

      {roi && (
        <div className="dashboard__roi">
          <p><strong>ROI:</strong> {roi.roi.toFixed(2)}%</p>
          <p><strong>Total Risked:</strong> ${roi.totalRisked.toFixed(2)}</p>
          <p><strong>Total Won:</strong> ${roi.totalWon.toFixed(2)}</p>
          <p><strong>Number of Bets:</strong> {roi.count}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
