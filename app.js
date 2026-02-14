const STOCK_UNIVERSE = [
  { ticker: 'AAPL', market: 'USA', price: 198.2, ytd: 0.14, sinceStart: 0.52, score: 92 },
  { ticker: 'MSFT', market: 'USA', price: 425.6, ytd: 0.18, sinceStart: 0.65, score: 95 },
  { ticker: 'NVDA', market: 'USA', price: 889.5, ytd: 0.32, sinceStart: 1.2, score: 97 },
  { ticker: 'ABB', market: 'Sverige', price: 82.4, ytd: 0.11, sinceStart: 0.33, score: 81 },
  { ticker: 'VOLV-B', market: 'Sverige', price: 31.8, ytd: 0.09, sinceStart: 0.4, score: 84 },
  { ticker: 'ATCO-A', market: 'Sverige', price: 16.5, ytd: 0.06, sinceStart: 0.21, score: 77 },
  { ticker: 'ASML', market: 'Nederländerna', price: 978.1, ytd: 0.2, sinceStart: 0.58, score: 93 },
  { ticker: 'NOVO-B', market: 'Danmark', price: 133.5, ytd: 0.17, sinceStart: 0.5, score: 89 },
  { ticker: 'NESN', market: 'Schweiz', price: 113.2, ytd: 0.07, sinceStart: 0.24, score: 78 },
  { ticker: 'BMW', market: 'Tyskland', price: 106.9, ytd: 0.08, sinceStart: 0.28, score: 76 },
  { ticker: 'SHOP', market: 'Kanada', price: 78.4, ytd: 0.12, sinceStart: 0.41, score: 83 },
  { ticker: 'TSM', market: 'Taiwan', price: 146.7, ytd: 0.22, sinceStart: 0.73, score: 90 },
  { ticker: 'SONY', market: 'Japan', price: 88.4, ytd: 0.05, sinceStart: 0.2, score: 74 },
  { ticker: 'BHP', market: 'Australien', price: 47.1, ytd: 0.04, sinceStart: 0.19, score: 71 },
  { ticker: 'MELI', market: 'USA', price: 1704.3, ytd: 0.16, sinceStart: 0.56, score: 88 },
  { ticker: 'META', market: 'USA', price: 491.4, ytd: 0.24, sinceStart: 0.79, score: 96 },
  { ticker: 'AMZN', market: 'USA', price: 177.7, ytd: 0.15, sinceStart: 0.63, score: 91 },
  { ticker: 'ORCL', market: 'USA', price: 126.5, ytd: 0.13, sinceStart: 0.39, score: 80 },
  { ticker: 'LIN', market: 'USA', price: 461.3, ytd: 0.1, sinceStart: 0.35, score: 79 },
  { ticker: 'SAP', market: 'Tyskland', price: 181.5, ytd: 0.09, sinceStart: 0.27, score: 75 },
  { ticker: 'RIO', market: 'Storbritannien', price: 66.2, ytd: 0.03, sinceStart: 0.15, score: 69 },
  { ticker: 'UL', market: 'Storbritannien', price: 51.6, ytd: 0.04, sinceStart: 0.17, score: 68 },
  { ticker: 'SAN', market: 'Spanien', price: 5.1, ytd: 0.07, sinceStart: 0.2, score: 67 },
  { ticker: 'IBE', market: 'Spanien', price: 12.8, ytd: 0.05, sinceStart: 0.18, score: 66 },
  { ticker: 'SU', market: 'Kanada', price: 35.3, ytd: 0.06, sinceStart: 0.22, score: 70 },
  { ticker: 'SQM', market: 'Chile', price: 48.9, ytd: -0.02, sinceStart: 0.08, score: 60 },
  { ticker: 'PBR', market: 'Brasilien', price: 14.7, ytd: 0.01, sinceStart: 0.1, score: 62 },
  { ticker: 'HDB', market: 'Indien', price: 62.6, ytd: 0.11, sinceStart: 0.32, score: 82 },
  { ticker: 'RELIANCE', market: 'Indien', price: 34.4, ytd: 0.12, sinceStart: 0.3, score: 85 },
  { ticker: 'NVO', market: 'Danmark', price: 134.3, ytd: 0.16, sinceStart: 0.49, score: 87 },
  { ticker: 'ENEL', market: 'Italien', price: 7.1, ytd: 0.04, sinceStart: 0.16, score: 65 },
  { ticker: 'ALV', market: 'Frankrike', price: 18.2, ytd: 0.05, sinceStart: 0.19, score: 64 },
  { ticker: 'RDSA', market: 'Nederländerna', price: 33.7, ytd: 0.06, sinceStart: 0.23, score: 73 },
  { ticker: 'DB1', market: 'Tyskland', price: 209.9, ytd: 0.08, sinceStart: 0.26, score: 72 },
  { ticker: 'ERIC-B', market: 'Sverige', price: 6.4, ytd: -0.01, sinceStart: 0.11, score: 63 },
  { ticker: 'SEB-A', market: 'Sverige', price: 15.8, ytd: 0.05, sinceStart: 0.18, score: 74 },
  { ticker: 'TEL2-B', market: 'Sverige', price: 9.5, ytd: 0.02, sinceStart: 0.12, score: 61 },
  { ticker: 'ROG', market: 'Schweiz', price: 300.1, ytd: 0.04, sinceStart: 0.2, score: 70 },
  { ticker: 'RACE', market: 'Italien', price: 412.6, ytd: 0.14, sinceStart: 0.45, score: 86 },
  { ticker: 'INFY', market: 'Indien', price: 20.7, ytd: 0.08, sinceStart: 0.22, score: 76 },
  { ticker: 'TOYOTA', market: 'Japan', price: 24.8, ytd: 0.09, sinceStart: 0.31, score: 79 }
];

const portfolioSizes = [10, 20, 40];
const BENCHMARK = { name: 'S&P 500', ytd: 0.11, sinceStart: 0.38 };

const lastUpdated = document.getElementById('lastUpdated');
const marketFilters = document.getElementById('marketFilters');
const portfolioCards = document.getElementById('portfolioCards');
const performanceBoard = document.getElementById('performanceBoard');
const portfolioSizeInput = document.getElementById('portfolioSize');
const riskModeInput = document.getElementById('riskMode');

function formatSEK(value) {
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(value);
}

function formatPct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function getMarkets() {
  return [...new Set(STOCK_UNIVERSE.map((stock) => stock.market))].sort();
}

function renderMarketFilters() {
  const markets = getMarkets();
  marketFilters.innerHTML = '';

  markets.forEach((market) => {
    const id = `market-${market}`;
    const label = document.createElement('label');
    label.innerHTML = `<input id="${id}" data-market="${market}" type="checkbox" checked /> ${market}`;
    marketFilters.appendChild(label);
  });
}

function selectedMarkets() {
  return [...marketFilters.querySelectorAll('input:checked')].map((input) => input.dataset.market);
}

function hourlyPrice(basePrice) {
  const noise = (Math.random() - 0.5) * 0.04;
  return basePrice * (1 + noise);
}

function createPosition(stock, allocation, riskMode) {
  const buyPrice = hourlyPrice(stock.price);
  const shares = Math.max(1, Math.floor(allocation / buyPrice));
  const stopLoss = buyPrice * 0.92;
  const trailingStop = buyPrice * 0.9;

  return {
    ticker: stock.ticker,
    market: stock.market,
    shares,
    buyPrice,
    stopLoss,
    trailingStop,
    ytd: stock.ytd,
    sinceStart: stock.sinceStart,
    riskMode
  };
}

function buildPortfolio(stockCount, totalCapital, riskMode, markets) {
  const filtered = STOCK_UNIVERSE
    .filter((stock) => markets.includes(stock.market))
    .sort((a, b) => b.score - a.score)
    .slice(0, stockCount);

  const allocation = totalCapital / Math.max(filtered.length, 1);
  return filtered.map((stock) => createPosition(stock, allocation, riskMode));
}

function positionRiskText(position, riskMode) {
  if (riskMode === 'stop') {
    return `Stop-loss: ${formatSEK(position.stopLoss)}`;
  }
  if (riskMode === 'trailing') {
    return `Glidande stop-loss: ${formatSEK(position.trailingStop)}`;
  }
  return `Stop-loss: ${formatSEK(position.stopLoss)} · Glidande stop-loss: ${formatSEK(position.trailingStop)}`;
}

function renderPortfolioCard(stockCount, positions, riskMode) {
  const card = document.createElement('article');
  card.className = 'portfolio-card';
  card.innerHTML = `<h3>${stockCount} aktier</h3>`;

  const list = document.createElement('ul');
  positions.forEach((position) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>${position.ticker}</strong> (${position.market})<br />
      Köp: ${formatSEK(position.buyPrice)} · Antal: ${position.shares}<br />
      ${positionRiskText(position, riskMode)}
    `;
    list.appendChild(item);
  });

  card.appendChild(list);
  return card;
}

function aggregatePerformance(positions) {
  if (!positions.length) {
    return { ytd: 0, sinceStart: 0 };
  }

  const ytd = positions.reduce((sum, p) => sum + p.ytd, 0) / positions.length;
  const sinceStart = positions.reduce((sum, p) => sum + p.sinceStart, 0) / positions.length;

  return { ytd, sinceStart };
}

function renderPerformance(resultSet) {
  performanceBoard.innerHTML = '';

  resultSet.forEach(({ count, performance }) => {
    const ytdDelta = performance.ytd - BENCHMARK.ytd;
    const sinceDelta = performance.sinceStart - BENCHMARK.sinceStart;

    const card = document.createElement('div');
    card.className = 'kpi';
    card.innerHTML = `
      <div class="label">${count} aktier – YTD</div>
      <div class="value ${ytdDelta >= 0 ? 'good' : 'bad'}">${formatPct(performance.ytd)}</div>
      <div class="label">vs ${BENCHMARK.name}: ${ytdDelta >= 0 ? '+' : ''}${formatPct(ytdDelta)}</div>
      <hr />
      <div class="label">Sedan start</div>
      <div class="value ${sinceDelta >= 0 ? 'good' : 'bad'}">${formatPct(performance.sinceStart)}</div>
      <div class="label">vs ${BENCHMARK.name}: ${sinceDelta >= 0 ? '+' : ''}${formatPct(sinceDelta)}</div>
    `;

    performanceBoard.appendChild(card);
  });
}

function updateTimestamp() {
  const now = new Date();
  lastUpdated.textContent = `Senast uppdaterad: ${now.toLocaleString('sv-SE')} (uppdateras varje timme)`;
}

function generate() {
  const totalCapital = Number(portfolioSizeInput.value) || 0;
  const riskMode = riskModeInput.value;
  const markets = selectedMarkets();

  portfolioCards.innerHTML = '';

  if (!markets.length) {
    portfolioCards.innerHTML = '<p>Välj minst en marknad för att generera förslag.</p>';
    performanceBoard.innerHTML = '';
    return;
  }

  const performanceResult = [];

  portfolioSizes.forEach((count) => {
    const positions = buildPortfolio(count, totalCapital, riskMode, markets);
    portfolioCards.appendChild(renderPortfolioCard(count, positions, riskMode));
    performanceResult.push({ count, performance: aggregatePerformance(positions) });
  });

  renderPerformance(performanceResult);
  updateTimestamp();
}

function resetDefaults() {
  portfolioSizeInput.value = 1000000;
  riskModeInput.value = 'both';
  [...marketFilters.querySelectorAll('input')].forEach((input) => {
    input.checked = true;
  });
  generate();
}

renderMarketFilters();
generate();
document.getElementById('generateBtn').addEventListener('click', generate);
document.getElementById('resetBtn').addEventListener('click', resetDefaults);
setInterval(generate, 60 * 60 * 1000);
