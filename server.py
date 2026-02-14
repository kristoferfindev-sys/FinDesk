#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from urllib.request import urlopen, Request
import datetime as dt
import hashlib
import json
import math
import os
import time

PORT = int(os.environ.get('PORT', '8000'))
REQUEST_TIMEOUT_S = 6
CACHE_TTL_S = 60 * 60

SYMBOL_MAP = {
    'AAPL': 'AAPL', 'MSFT': 'MSFT', 'NVDA': 'NVDA', 'META': 'META', 'AMZN': 'AMZN',
    'ABB': 'ABB.ST', 'VOLV-B': 'VOLV-B.ST', 'ATCO-A': 'ATCO-A.ST', 'SEB-A': 'SEB-A.ST',
    'ERIC-B': 'ERIC-B.ST', 'TEL2-B': 'TEL2-B.ST', 'ASML': 'ASML.AS', 'NOVO-B': 'NOVO-B.CO',
    'NVO': 'NVO', 'NESN': 'NESN.SW', 'BMW': 'BMW.DE', 'SAP': 'SAP.DE', 'DB1': 'DB1.DE',
    'SHOP': 'SHOP', 'SU': 'SU', 'TSM': 'TSM', 'SONY': 'SONY', 'TOYOTA': '7203.T', 'BHP': 'BHP.AX',
    'MELI': 'MELI', 'ORCL': 'ORCL', 'LIN': 'LIN', 'RIO': 'RIO', 'UL': 'UL', 'SAN': 'SAN',
    'IBE': 'IBE.MC', 'SQM': 'SQM', 'PBR': 'PBR', 'HDB': 'HDB', 'RELIANCE': 'RELIANCE.NS',
    'ENEL': 'ENEL.MI', 'ALV': 'CA.PA', 'RDSA': 'SHEL.AS', 'ROG': 'ROG.SW', 'RACE': 'RACE.MI',
    'INFY': 'INFY', 'SPY': 'SPY'
}

REFERENCE_PRICES = {
    'AAPL': 185, 'MSFT': 420, 'NVDA': 880, 'META': 490, 'AMZN': 175, 'ABB': 81, 'VOLV-B': 31,
    'ATCO-A': 16, 'SEB-A': 15, 'ERIC-B': 6, 'TEL2-B': 9, 'ASML': 960, 'NOVO-B': 132, 'NVO': 130,
    'NESN': 112, 'BMW': 106, 'SAP': 180, 'DB1': 208, 'SHOP': 77, 'SU': 35, 'TSM': 145, 'SONY': 87,
    'TOYOTA': 24, 'BHP': 46, 'MELI': 1690, 'ORCL': 125, 'LIN': 460, 'RIO': 66, 'UL': 51, 'SAN': 5,
    'IBE': 12, 'SQM': 48, 'PBR': 14, 'HDB': 62, 'RELIANCE': 34, 'ENEL': 7, 'ALV': 18, 'RDSA': 33,
    'ROG': 299, 'RACE': 410, 'INFY': 20, 'SPY': 560
}

CACHE = {}


def fallback_ohlc(symbol: str):
    base = REFERENCE_PRICES.get(symbol, 50)
    seed = int(hashlib.md5(symbol.encode()).hexdigest()[:8], 16)
    today = dt.datetime.utcnow().date()
    candles = []
    price = base * (0.8 + (seed % 40) / 100)
    for i in range(365):
        day = today - dt.timedelta(days=365 - i)
        if day.weekday() >= 5:
            continue
        cyc = math.sin((i + seed % 29) / 18) * 0.012
        drift = 0.0005
        noise = (((seed >> (i % 16)) & 15) - 8) / 1000
        change = drift + cyc + noise
        o = price
        c = max(0.1, price * (1 + change))
        h = max(o, c) * (1 + abs(noise) * 0.4)
        l = min(o, c) * (1 - abs(noise) * 0.4)
        candles.append({
            'time': int(dt.datetime(day.year, day.month, day.day, tzinfo=dt.timezone.utc).timestamp()),
            'open': round(o, 4), 'high': round(h, 4), 'low': round(l, 4), 'close': round(c, 4), 'volume': 100000
        })
        price = c
    return candles


def fetch_yahoo_ohlc(symbol: str):
    mapped = SYMBOL_MAP.get(symbol, symbol)
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{mapped}?range=1y&interval=1d&events=history"
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0 FinDesk/1.0'})
    with urlopen(req, timeout=REQUEST_TIMEOUT_S) as response:
        data = json.loads(response.read().decode('utf-8'))

    result = data.get('chart', {}).get('result', [])
    if not result:
        return {'symbol': symbol, 'mapped': mapped, 'candles': fallback_ohlc(symbol), 'source': 'fallback'}

    payload = result[0]
    timestamps = payload.get('timestamp', [])
    quote = payload.get('indicators', {}).get('quote', [{}])[0]
    candles = []
    opens, highs, lows, closes, volumes = (
        quote.get('open', []), quote.get('high', []), quote.get('low', []), quote.get('close', []), quote.get('volume', [])
    )
    for i, ts in enumerate(timestamps):
        o = opens[i] if i < len(opens) else None
        h = highs[i] if i < len(highs) else None
        l = lows[i] if i < len(lows) else None
        c = closes[i] if i < len(closes) else None
        v = volumes[i] if i < len(volumes) else 0
        if None in (o, h, l, c):
            continue
        candles.append({'time': int(ts), 'open': float(o), 'high': float(h), 'low': float(l), 'close': float(c), 'volume': int(v or 0)})

    if not candles:
        return {'symbol': symbol, 'mapped': mapped, 'candles': fallback_ohlc(symbol), 'source': 'fallback'}
    return {'symbol': symbol, 'mapped': mapped, 'candles': candles, 'source': 'yahoo'}


def get_symbol_data(symbol: str):
    now = time.time()
    cached = CACHE.get(symbol)
    if cached and now - cached['ts'] < CACHE_TTL_S:
        return cached['data']

    try:
        data = fetch_yahoo_ohlc(symbol)
    except Exception:
        data = {'symbol': symbol, 'mapped': SYMBOL_MAP.get(symbol, symbol), 'candles': fallback_ohlc(symbol), 'source': 'fallback'}

    CACHE[symbol] = {'ts': now, 'data': data}
    return data


class Handler(BaseHTTPRequestHandler):
    def _json(self, payload, status=200):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/ohlc':
            symbol = parse_qs(parsed.query).get('symbol', [''])[0].strip().upper()
            if not symbol:
                self._json({'error': 'missing symbol'}, 400)
                return
            self._json(get_symbol_data(symbol))
            return

        if parsed.path in ('/', '/index.html'):
            return self._serve('index.html', 'text/html; charset=utf-8')
        if parsed.path == '/app.js':
            return self._serve('app.js', 'application/javascript; charset=utf-8')
        if parsed.path == '/styles.css':
            return self._serve('styles.css', 'text/css; charset=utf-8')
        self.send_error(404, 'Not Found')

    def _serve(self, filename, ctype):
        if not os.path.exists(filename):
            self.send_error(404, 'Not Found')
            return
        with open(filename, 'rb') as f:
            content = f.read()
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        self.wfile.write(content)


if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), Handler)
    print(f'FinDesk running on http://0.0.0.0:{PORT}')
    server.serve_forever()
