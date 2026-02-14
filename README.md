# FinDesk

FinDesk är en enkel webbdashboard för finansiella investeringar.

## Funktioner

- Ange portföljstorlek i SEK.
- Generera tre portföljförslag med **10**, **20** och **40** aktier.
- Visar i listformat för varje position:
  - köppris
  - antal aktier
  - stop-loss och/eller glidande stop-loss beroende på vald strategi
- Välj riskläge:
  - endast stop-loss
  - endast glidande stop-loss
  - båda
- Begränsa urvalet till valda aktiemarknader.
- Standardläge inkluderar alla tillgängliga marknader i datamängden (marknader med stop-loss-stöd i Avanza-flödet).
- Prestanda visas för varje portföljförslag:
  - YTD
  - sedan start
  - jämförelse mot S&P 500
- Data uppdateras automatiskt varje timme.

## Kör lokalt

```bash
python3 -m http.server 8000
```

Öppna sedan `http://localhost:8000` i en webbläsare.
