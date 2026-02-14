const STOCK_UNIVERSE = [
  { ticker: 'AAPL', market: 'USA' }, { ticker: 'MSFT', market: 'USA' }, { ticker: 'NVDA', market: 'USA' },
  { ticker: 'META', market: 'USA' }, { ticker: 'AMZN', market: 'USA' }, { ticker: 'ABB', market: 'Sverige' },
  { ticker: 'VOLV-B', market: 'Sverige' }, { ticker: 'ATCO-A', market: 'Sverige' }, { ticker: 'SEB-A', market: 'Sverige' },
  { ticker: 'ERIC-B', market: 'Sverige' }, { ticker: 'TEL2-B', market: 'Sverige' }, { ticker: 'ASML', market: 'Nederländerna' },
  { ticker: 'NOVO-B', market: 'Danmark' }, { ticker: 'NVO', market: 'Danmark' }, { ticker: 'NESN', market: 'Schweiz' },
  { ticker: 'BMW', market: 'Tyskland' }, { ticker: 'SAP', market: 'Tyskland' }, { ticker: 'DB1', market: 'Tyskland' },
  { ticker: 'SHOP', market: 'Kanada' }, { ticker: 'SU', market: 'Kanada' }, { ticker: 'TSM', market: 'Taiwan' },
  { ticker: 'SONY', market: 'Japan' }, { ticker: 'TOYOTA', market: 'Japan' }, { ticker: 'BHP', market: 'Australien' },
  { ticker: 'MELI', market: 'USA' }, { ticker: 'ORCL', market: 'USA' }, { ticker: 'LIN', market: 'USA' },
  { ticker: 'RIO', market: 'Storbritannien' }, { ticker: 'UL', market: 'Storbritannien' }, { ticker: 'SAN', market: 'Spanien' },
  { ticker: 'IBE', market: 'Spanien' }, { ticker: 'SQM', market: 'Chile' }, { ticker: 'PBR', market: 'Brasilien' },
  { ticker: 'HDB', market: 'Indien' }, { ticker: 'RELIANCE', market: 'Indien' }, { ticker: 'ENEL', market: 'Italien' },
  { ticker: 'ALV', market: 'Frankrike' }, { ticker: 'RDSA', market: 'Nederländerna' }, { ticker: 'ROG', market: 'Schweiz' },
  { ticker: 'RACE', market: 'Italien' }, { ticker: 'INFY', market: 'Indien' }
];
const portfolioSizes = [10, 20, 40];
const BENCHMARK_TICKER = 'SPY';

const el = {
  lastUpdated: document.getElementById('lastUpdated'),
  marketFilters: document.getElementById('marketFilters'),
  portfolioCards: document.getElementById('portfolioCards'),
  performanceBoard: document.getElementById('performanceBoard'),
  portfolioSize: document.getElementById('portfolioSize'),
  riskMode: document.getElementById('riskMode'),
  modal: document.getElementById('chartModal'),
  closeModal: document.getElementById('closeModal'),
  modalTitle: document.getElementById('modalTitle'),
  modalSummary: document.getElementById('modalSummary'),
  chartContainer: document.getElementById('chartContainer')
};

const marketDataCache = new Map();
let chart = null;
let currentSymbol = null;

const formatSEK = (v) => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 2 }).format(v);
const formatPct = (v) => `${(v * 100).toFixed(2)}%`;
const avg = (arr) => (arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0);

function sma(values, period) {
  if (values.length < period) return [];
  const out = [];
  for (let i = period - 1; i < values.length; i += 1) {
    out.push({ index: i, value: avg(values.slice(i - period + 1, i + 1)) });
  }
  return out;
}

function ema(values, period) {
  if (!values.length) return [];
  const k = 2 / (period + 1);
  const out = [];
  let prev = values[0];
  values.forEach((v, idx) => {
    prev = idx === 0 ? v : (v * k + prev * (1 - k));
    out.push(prev);
  });
  return out;
}

function rsi(values, period = 14) {
  if (values.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = values.length - period; i < values.length; i += 1) {
    const delta = values[i] - values[i - 1];
    if (delta > 0) gains += delta;
    else losses -= delta;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

function macd(values) {
  if (!values.length) return { macd: 0, signal: 0 };
  const e12 = ema(values, 12);
  const e26 = ema(values, 26);
  const macdLine = values.map((_, i) => (e12[i] || 0) - (e26[i] || 0));
  const signal = ema(macdLine, 9);
  return { macd: macdLine.at(-1) || 0, signal: signal.at(-1) || 0 };
}

function calculateAnalysis(candles) {
  if (!candles?.length) {
    return { last: 0, ytd: 0, sinceStart: 0, sma20: 0, sma50: 0, rsi: 50, macd: { macd: 0, signal: 0 }, score: 0 };
  }

  const closes = candles.map((c) => c.close);
  const last = closes.at(-1);
  const ytdStart = candles.find((c) => new Date(c.time * 1000).getUTCMonth() === 0)?.close || closes[0];
  const sinceStart = closes[0] ? (last - closes[0]) / closes[0] : 0;
  const ytd = ytdStart ? (last - ytdStart) / ytdStart : 0;
  const sma20 = sma(closes, 20).at(-1)?.value || last;
  const sma50 = sma(closes, 50).at(-1)?.value || last;
  const rsiVal = rsi(closes);
  const macdVal = macd(closes);

  let score = 0;
  if (last > sma20) score += 1;
  if (sma20 > sma50) score += 1;
  if (rsiVal > 45 && rsiVal < 70) score += 1;
  if (macdVal.macd > macdVal.signal) score += 1;

  return { last, ytd, sinceStart, sma20, sma50, rsi: rsiVal, macd: macdVal, score };
}

async function fetchSymbolData(symbol) {
  if (marketDataCache.has(symbol)) return marketDataCache.get(symbol);
  const res = await fetch(`/api/ohlc?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error(`Kunde inte hämta data för ${symbol}`);
  const payload = await res.json();
  if (!payload.candles?.length) throw new Error(`Ingen prisdata för ${symbol}`);
  const analysis = calculateAnalysis(payload.candles);
  const full = { ...payload, analysis };
  marketDataCache.set(symbol, full);
  return full;
}

function selectedMarkets() {
  return [...el.marketFilters.querySelectorAll('input:checked')].map((i) => i.dataset.market);
}

function renderMarketFilters() {
  const markets = [...new Set(STOCK_UNIVERSE.map((s) => s.market))].sort();
  el.marketFilters.innerHTML = '';
  markets.forEach((market) => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" data-market="${market}" checked/> ${market}`;
    el.marketFilters.appendChild(label);
  });
}

function riskText(position, mode) {
  if (mode === 'stop') return `Stop-loss: ${formatSEK(position.stopLoss)}`;
  if (mode === 'trailing') return `Glidande stop-loss: ${formatSEK(position.trailingStop)}`;
  return `Stop-loss: ${formatSEK(position.stopLoss)} · Glidande stop-loss: ${formatSEK(position.trailingStop)}`;
}

function createPosition(stock, capitalPerStock, analysis) {
  const shares = analysis.last > 0 ? Math.max(1, Math.floor(capitalPerStock / analysis.last)) : 0;
  return {
    ...stock,
    shares,
    buyPrice: analysis.last,
    stopLoss: analysis.last * 0.92,
    trailingStop: analysis.last * 0.9,
    ytd: analysis.ytd,
    sinceStart: analysis.sinceStart,
    analysis
  };
}

async function rankedStocks(markets) {
  const universe = STOCK_UNIVERSE.filter((s) => markets.includes(s.market));
  const enriched = await Promise.all(universe.map(async (stock) => {
    try {
      const data = await fetchSymbolData(stock.ticker);
      return { ...stock, data, score: data.analysis.score };
    } catch {
      return null;
    }
  }));
  return enriched.filter(Boolean).sort((a, b) => b.score - a.score || b.data.analysis.ytd - a.data.analysis.ytd);
}

function renderPortfolioCard(stockCount, positions, riskMode) {
  const card = document.createElement('article');
  card.className = 'portfolio-card';
  card.innerHTML = `<h3>${stockCount} aktier</h3>`;
  const list = document.createElement('ul');
  positions.forEach((p) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'stock-btn';
    button.innerHTML = `<strong>${p.ticker}</strong> (${p.market})<br/>Köp: ${formatSEK(p.buyPrice)} · Antal: ${p.shares}<br/>${riskText(p, riskMode)}<br/>TA: RSI ${p.analysis.rsi.toFixed(1)}, SMA20 ${p.analysis.sma20.toFixed(2)}, SMA50 ${p.analysis.sma50.toFixed(2)}`;
    button.addEventListener('click', () => openChartModal(p.ticker));
    item.appendChild(button);
    list.appendChild(item);
  });
  card.appendChild(list);
  return card;
}

function renderPerformance(results, benchmark) {
  el.performanceBoard.innerHTML = '';
  results.forEach(({ count, perf }) => {
    const ytdDelta = perf.ytd - benchmark.ytd;
    const sinceDelta = perf.sinceStart - benchmark.sinceStart;
    const card = document.createElement('div');
    card.className = 'kpi';
    card.innerHTML = `<div class="label">${count} aktier – YTD</div>
      <div class="value ${ytdDelta >= 0 ? 'good' : 'bad'}">${formatPct(perf.ytd)}</div>
      <div class="label">vs S&P 500: ${ytdDelta >= 0 ? '+' : ''}${formatPct(ytdDelta)}</div><hr/>
      <div class="label">Sedan start</div>
      <div class="value ${sinceDelta >= 0 ? 'good' : 'bad'}">${formatPct(perf.sinceStart)}</div>
      <div class="label">vs S&P 500: ${sinceDelta >= 0 ? '+' : ''}${formatPct(sinceDelta)}</div>`;
    el.performanceBoard.appendChild(card);
  });
}

function aggregatePerformance(positions) {
  return {
    ytd: avg(positions.map((p) => p.ytd)),
    sinceStart: avg(positions.map((p) => p.sinceStart))
  };
}

async function generate() {
  const totalCapital = Number(el.portfolioSize.value) || 0;
  const riskMode = el.riskMode.value;
  const markets = selectedMarkets();
  if (!markets.length) {
    el.portfolioCards.innerHTML = '<p>Välj minst en marknad.</p>';
    el.performanceBoard.innerHTML = '';
    return;
  }

  el.portfolioCards.innerHTML = '<p>Laddar marknadsdata och teknisk analys...</p>';

  try {
    const ranked = await rankedStocks(markets);
    const benchmark = (await fetchSymbolData(BENCHMARK_TICKER)).analysis;

    if (!ranked.length) {
      el.portfolioCards.innerHTML = '<p>Kunde inte läsa marknadsdata just nu. Försök igen om en stund.</p>';
      el.performanceBoard.innerHTML = '';
      return;
    }

    el.portfolioCards.innerHTML = '';
    const perfResults = [];
    portfolioSizes.forEach((count) => {
      const picks = ranked.slice(0, Math.min(count, ranked.length));
      const perStock = totalCapital / Math.max(picks.length, 1);
      const positions = picks.map((s) => createPosition(s, perStock, s.data.analysis));
      el.portfolioCards.appendChild(renderPortfolioCard(count, positions, riskMode));
      perfResults.push({ count, perf: aggregatePerformance(positions) });
    });

    renderPerformance(perfResults, benchmark);
    el.lastUpdated.textContent = `Senast uppdaterad: ${new Date().toLocaleString('sv-SE')} (nästa uppdatering om 1h)`;
  } catch {
    el.portfolioCards.innerHTML = '<p>Ett fel uppstod vid hämtning av marknadsdata.</p>';
    el.performanceBoard.innerHTML = '';
  }
}

async function openChartModal(symbol) {
  currentSymbol = symbol;
  const data = await fetchSymbolData(symbol);

  if (typeof LightweightCharts === 'undefined') {
    el.modal.classList.remove('hidden');
    el.modalTitle.textContent = `${symbol} – graf kunde inte laddas`;
    el.modalSummary.textContent = 'Chart-biblioteket kunde inte hämtas i den här miljön.';
    el.chartContainer.innerHTML = '';
    return;
  }

  const candles = data.candles.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }));
  const closes = candles.map((c) => c.close);
  const sma20Data = sma(closes, 20).map((p) => ({ time: candles[p.index].time, value: p.value }));
  const sma50Data = sma(closes, 50).map((p) => ({ time: candles[p.index].time, value: p.value }));

  el.modal.classList.remove('hidden');
  el.modalTitle.textContent = `${symbol} – Candle sticks & teknisk analys`;
  el.modalSummary.textContent = `Källa: ${data.source === 'yahoo' ? 'Yahoo Finance (live)' : 'Lokal fallback'} · RSI(14): ${data.analysis.rsi.toFixed(2)} · MACD: ${data.analysis.macd.macd.toFixed(3)} / Signal: ${data.analysis.macd.signal.toFixed(3)}`;
  el.chartContainer.innerHTML = '';

  chart = LightweightCharts.createChart(el.chartContainer, {
    layout: { background: { color: '#ffffff' }, textColor: '#1f2a44' },
    grid: { vertLines: { color: '#f0f3fa' }, horzLines: { color: '#f0f3fa' } },
    rightPriceScale: { borderColor: '#d9e3f5' },
    timeScale: { borderColor: '#d9e3f5' }
  });

  const candlestickSeries = chart.addCandlestickSeries({
    upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350'
  });
  candlestickSeries.setData(candles);

  const sma20Series = chart.addLineSeries({ color: '#2962FF', lineWidth: 2, title: 'SMA20' });
  sma20Series.setData(sma20Data);
  const sma50Series = chart.addLineSeries({ color: '#FF6D00', lineWidth: 2, title: 'SMA50' });
  sma50Series.setData(sma50Data);
  chart.timeScale().fitContent();
}

function closeModal() {
  el.modal.classList.add('hidden');
  if (chart) chart.remove();
  chart = null;
  currentSymbol = null;
}

function resetDefaults() {
  el.portfolioSize.value = 1000000;
  el.riskMode.value = 'both';
  [...el.marketFilters.querySelectorAll('input')].forEach((i) => { i.checked = true; });
  generate();
}

renderMarketFilters();
generate();
document.getElementById('generateBtn').addEventListener('click', generate);
document.getElementById('resetBtn').addEventListener('click', resetDefaults);
el.closeModal.addEventListener('click', closeModal);
el.modal.addEventListener('click', (e) => { if (e.target === el.modal) closeModal(); });
setInterval(() => {
  marketDataCache.clear();
  if (!currentSymbol) generate();
}, 60 * 60 * 1000);
