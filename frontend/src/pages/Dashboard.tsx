import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../pagesCss/Dashboard.css';
import RoiSummary from '../components/RoiSummary';

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');

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
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to add bet', err);
    }
  };

  const filteredBets = bets.filter((bet) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return bet.result === '';
    return bet.result === activeTab;
  });

  useEffect(() => {
    fetchBets();
  }, []);

  useEffect(() => {
    fetchROI();
  }, [timeframe]);

  useEffect(() => {
    const amount = parseFloat(form.amountRisked);
    const odds = parseFloat(form.odds);

    if (form.result === 'win' && !isNaN(amount) && !isNaN(odds)) {
      let payout = 0;
      if (odds > 0) {
        payout = amount + (amount * odds) / 100;
      } else {
        payout = amount + (amount * 100) / Math.abs(odds);
      }

      setForm((prev) => ({ ...prev, payout: payout.toFixed(2) }));
    }
  }, [form.amountRisked, form.odds, form.result]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    if (modalOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalOpen]);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Bet Tracker</h1>
        <button className="dashboard__add-btn" onClick={() => setModalOpen(true)}>
          + Add Bet
        </button>
      </header>

      <nav className="dashboard__tabs">
        {['all', 'win', 'loss', 'push', 'open'].map((tab) => (
          <button
            key={tab}
            className={`dashboard__tab ${activeTab === tab ? 'dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <section className="dashboard__list">
        {filteredBets.map((bet) => (
          <div key={bet.id} className={`dashboard__bet dashboard__bet--${bet.result || 'open'}`}>
            <div className="dashboard__bet-main">
              <span>{bet.date}</span>
              <strong>{bet.description}</strong>
              <span>${bet.amount_risked} @ {bet.odds}</span>
              <span>{bet.result || 'Open'}</span>
            </div>
            <div className="dashboard__bet-payout">
              {bet.result === 'win' && <>Won ${bet.payout}</>}
              {bet.result === '' && <>Potential Winnings: ${(Math.abs(bet.odds) >= 100 ? bet.odds > 0
                ? bet.amount_risked + (bet.amount_risked * bet.odds) / 100
                : bet.amount_risked + (bet.amount_risked * 100) / Math.abs(bet.odds)
              : 0).toFixed(2)}</>}
            </div>
          </div>
        ))}
      </section>

      <RoiSummary
        roi={roi}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        error={error}
      />
      {modalOpen && (
        <div className="dashboard__modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="dashboard__modal" onClick={(e) => e.stopPropagation()}>
            <button className="dashboard__modal-close" onClick={() => setModalOpen(false)}>
              ✖
            </button>
            <h3>Add a New Bet</h3>
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
                placeholder="Odds (e.g., -110 or +120)"
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
                <option value="" disabled>-- Select Outcome --</option>
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
              <button className="dashboard__button" type="submit">Submit Bet</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
