const API_BASE = 'https://bet-tracker-production.up.railway.app';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getBets() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/bets`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
}

export async function addBet(betData: any) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/bets`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(betData),
  });
  return res.json();
}

export async function updateBet(betId: number, result: string, payout?: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/bets/${betId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ result, payout }),
  });
  return res.json();
}

export async function getROI(timeframe?: string) {
  const token = localStorage.getItem('token');
  const url = timeframe ? `${API_BASE}/bets/roi?timeframe=${timeframe}` : `${API_BASE}/bets/roi`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
}
