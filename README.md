# Pitek Oy:n verkkosivusto

Kevyt staattinen verkkosivusto, joka on toteutettu HTML-, CSS- ja JavaScript-tiedostoilla ilman erillistä rakennusvaihetta.

## Rakenne

- `index.html`: etusivu, palvelut ja yhteystiedot
- palvelukohtaiset `.html`-tiedostot sekä `hinnasto.html` ja `ajankohtaista.html`
- `header.html` ja `footer.html`: JavaScriptillä ladattavat yhteiset sivunosat
- `style.css`: sivuston ulkoasu ja responsiivisuus
- `main.js`: yhteisten osien lataus, navigaatio, karuselli, kartta ja uutisten avaus
- `.webp`-tiedostot: sivuston kuvat

## Paikallinen katselu

Sivusto kannattaa avata paikallisen HTTP-palvelimen kautta, koska selain ei yleensä salli `header.html`- ja `footer.html`-tiedostojen lataamista suoraan `file://`-osoitteesta.

Esimerkiksi Pythonilla:

```text
python -m http.server 8000
```

Sivusto avautuu osoitteessa `http://localhost:8000/`.

## Muutostapa

Muutokset tehdään omalle Git-haaralle. Haara yhdistetään päähaaraan ja julkaistaan vasta omistajan hyväksynnän jälkeen.

