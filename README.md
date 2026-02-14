# FinDesk

FinDesk är en webbdashboard för investeringar med **faktiska marknadsdata** och teknisk analys.

## Funktioner

- Ange portföljstorlek i SEK.
- Generera tre portföljförslag med **10**, **20** och **40** aktier.
- Välj riskläge:
  - endast stop-loss
  - endast glidande stop-loss
  - båda
- Begränsa urvalet till valda aktiemarknader.
- Rekommendationer rangordnas med teknisk analys (SMA20/SMA50, RSI, MACD).
- Klicka på en aktie för att se candlestick-graf i TradingView-liknande stil (Lightweight Charts).
- Prestanda visas för varje portföljförslag:
  - YTD
  - sedan start
  - jämförelse mot S&P 500
- Data uppdateras automatiskt varje timme.

## Kör lokalt

```bash
python3 server.py
```

Öppna sedan `http://localhost:8000` i en webbläsare.


## Datakälla

- Appen försöker hämta live-data från Yahoo Finance.
- Om extern åtkomst blockeras används en lokal fallback-serie så dashboarden fortsätter fungera utan avbrott.
- Om `/api/ohlc` inte finns (t.ex. om man råkar köra en statisk server) använder frontend också en lokal fallback, så sidan visar fortfarande portföljförslag.
- Svar cachas i 1 timme på serversidan för stabilare laddning.
