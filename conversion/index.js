<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <!-- Allow zooming (user-scalable & max-scale) so page won't be stuck zoomed out -->
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes" />
  <title>Crypto & Fiat Converter</title>
  <style>
    :root{
      --card-w: 420px;
      --accent: #2575fc;
      --glass: rgba(255,255,255,0.12);
      --glass-border: rgba(255,255,255,0.25);
    }
    html,body{height:100%;margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial;}
    body{
      display:flex;align-items:center;justify-content:center;
      background: linear-gradient(180deg,#6a11cb 0%, #2575fc 55%, #2bd1c5 100%);
      padding:20px;
    }

    /* Card (same visual design) */
    .card{
      width:100%;
      max-width:var(--card-w);
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
      border-radius:18px;
      padding:28px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(8px);
      box-sizing: border-box;
    }
    .title{
      color:white; text-align:center; font-weight:700; font-size:20px; margin-bottom:18px;
      letter-spacing:0.2px;
    }

    /* vertical layout */
    .block{ margin-bottom:18px; }
    .label{ color:#ffffffcc; font-size:15px; margin-bottom:10px; display:flex;align-items:center; justify-content:space-between; }
    .inline-controls{ display:flex; gap:12px; align-items:center; }

    /* select and inputs (same styling) */
    select.custom, input.custom {
      padding:12px 14px;
      border-radius:14px;
      border: none;
      outline: none;
      font-size:16px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
      -webkit-appearance: none;
      appearance: none;
    }
    select.custom { background:white; color:#111; min-width:110px; }
    input.custom { flex:1; background:white; color:#000; font-weight:700; text-align:left; }

    /* big rounded white input container (same design) */
    .bigbox{
      border-radius:40px;
      padding:14px;
      background:white;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      border: 6px solid rgba(255,255,255,0.6);
      display:flex;
      align-items:center;
      gap:12px;

      /* prevent children from visually overflowing the rounded container */
      overflow: hidden;
      box-sizing: border-box;
    }

    /* Reduce space used by the currency select and expand input area:
       - give the select a fixed small flex-basis so it doesn't take too much room
       - allow the input to occupy most space and increase its font-size so more digits
         are visible.
       These changes are limited to .bigbox so other selects/inputs remain unchanged. */
    .bigbox select.custom {
      /* smaller visible footprint for currency selector */
      flex: 0 0 84px; /* fixed width area for select */
      min-width: 64px;
      padding:10px 10px;
      border-radius:12px;
      box-sizing: border-box;
      font-size:15px;
    }

    /* ensure the input can shrink and not push outside the parent.
       Show up to 10 characters visibly (not 8). Reduce font-size slightly so 10 digits fit.
       After the visible area, overflow is clipped without ellipsis. */
    .bigbox input.custom {
      background:transparent;
      border:none;
      font-size:34px; /* slightly smaller than before to fit 10 digits */
      color:#000;
      padding:6px 8px;

      /* flex-shrink so it doesn't force parent wider than max-width */
      min-width: 0;
      flex: 1 1 auto;
      box-sizing: border-box;

      /* keep content on one line and hide overflow after N characters (no dots) */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: clip;

      /* limit visible characters to ~10 digits (plus a small padding) */
      /* 10ch approximates width for 10 characters in the current font-size */
      max-width: calc(10ch + 36px);
    }

    /* remove swap/result UI but keep spacing aligned like original */
    .spacer { height:10px; }

    /* small meta — removed time, keep space for subtle messages */
    .meta{ color:#ffffffcc; font-size:13px; margin-top:6px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; min-height:18px; }

    /* responsive adjustments for mobile (portable) */
    @media (max-width:460px){
      :root{ --card-w: 95vw; }
      .card{ padding:20px; border-radius:16px; }

      /* scale input and select for smaller screens */
      .bigbox select.custom { flex: 0 0 72px; min-width:56px; padding:9px 8px; font-size:14px; }
      .bigbox input.custom { font-size:30px; /* show ~10 chars with adjusted font */ max-width: calc(10ch + 30px); }

      select.custom, input.custom { padding:10px 12px; font-size:15px; border-radius:12px; }
      .title{ font-size:18px; }
    }
    /* extra spacing for very small screens */
    @media (max-width:340px){
      .bigbox { gap:8px; padding:10px; border-radius:30px; }
      .bigbox select.custom { flex: 0 0 60px; min-width:48px; padding:8px; font-size:13px; }
      .bigbox input.custom { font-size:22px; max-width: calc(10ch + 22px); }
    }
  </style>
</head>
<body>
  <div class="card" role="application" aria-label="Crypto and Fiat Converter">
    <div class="title">Crypto & Fiat Converter</div>

    <!-- FROM -->
    <div class="block">
      <div class="label">
        <div>From</div>
        <div style="font-size:13px;color:#ffffffaa" id="from-type-indicator"></div>
      </div>

      <div class="inline-controls bigbox" style="align-items:center;">
        <select id="from-select" class="custom" aria-label="From currency"></select>
        <input id="from-input" class="custom" type="text" placeholder="Input amount" inputmode="decimal" aria-label="From amount" />
      </div>
      <div class="meta"><div id="from-help"></div><div></div></div>
    </div>

    <div class="spacer"></div>

    <!-- TO -->
    <div class="block">
      <div class="label">
        <div>To</div>
        <div style="font-size:13px;color:#ffffffaa" id="to-type-indicator"></div>
      </div>

      <div class="inline-controls bigbox" style="align-items:center;">
        <select id="to-select" class="custom" aria-label="To currency"></select>
        <input id="to-input" class="custom" type="text" placeholder="Result / Input" inputmode="decimal" aria-label="To amount" />
      </div>
      <div class="meta"><div id="to-help"></div><div id="error-msg" style="color:#ffdddd"></div></div>
    </div>

    <!-- kept spacing where result used to be so design remains visually identical -->
    <div style="height:6px"></div>
  </div>

  <script>
  (function(){
    // -------------------------------
    // Config (unchanged)
    // -------------------------------
    const SYMBOLS = [
      'USD','NGN','EUR','GBP','INR','AUD','CAD','JPY','CNY','SGD',
      'BTC','ETH','BNB','TRX','USDT','USDC','LTC','XRP','DOGE','ADA'
    ];

    const SYMBOL_TO_COINGECKO_ID = {
      'BTC': 'bitcoin','ETH': 'ethereum','BNB': 'binancecoin','TRX': 'tron',
      'USDT': 'tether','USDC': 'usd-coin','LTC': 'litecoin','XRP': 'ripple',
      'DOGE': 'dogecoin','ADA': 'cardano'
    };

    const isCryptoSymbol = s => Boolean(SYMBOL_TO_COINGECKO_ID[s]);
    const pairKey = (a,b) => a + '->' + b;

    const CRYPTO_INTERMEDIATE_SYMBOL = 'BTC';
    const CRYPTO_INTERMEDIATE_ID = SYMBOL_TO_COINGECKO_ID[CRYPTO_INTERMEDIATE_SYMBOL];

    // -------------------------------
    // DOM refs
    // -------------------------------
    const fromSelect = document.getElementById('from-select');
    const toSelect   = document.getElementById('to-select');
    const fromInput  = document.getElementById('from-input');
    const toInput    = document.getElementById('to-input');
    const fromTypeIndicator = document.getElementById('from-type-indicator');
    const toTypeIndicator   = document.getElementById('to-type-indicator');
    const errorMsg = document.getElementById('error-msg');

    // -------------------------------
    // Helpers added (formatting + caret-preserve + composition handling)
    // -------------------------------
    // format number string with commas (preserves decimals)
    function formatWithCommas(str){
      if (str == null || str === '') return '';
      // remove existing commas first
      str = String(str).replace(/,/g, '');
      // allow leading minus
      const neg = str.startsWith('-');
      if (neg) str = str.slice(1);
      const parts = str.split('.');
      let intPart = parts[0] || '0';
      const decPart = parts.length > 1 ? parts.slice(1).join('.') : null;
      // insert commas into integer part
      intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return neg ? '-' + intPart + (decPart ? '.' + decPart : '') : intPart + (decPart ? '.' + decPart : '');
    }

    // remove commas (unformat) -> returns plain digits and dot
    function unformat(str){
      if (str == null) return '';
      return String(str).replace(/,/g, '');
    }

    // safe numeric parse that removes commas
    function parseNumberFromInput(str){
      const cleaned = unformat((str||'').trim());
      if (cleaned === '' || isNaN(Number(cleaned))) return NaN;
      return Number(cleaned);
    }

    // Format input value and preserve caret position while adding commas live.
    // This function now:
    //  - computes caret in raw (non-comma) coords
    //  - sets formatted value
    //  - updates caret asynchronously using requestAnimationFrame + setTimeout fallback
    //  - only applies caret if input is still focused
    function formatInputLivePreserveCaret(inputEl){
      const old = inputEl.value || '';
      const oldCaret = inputEl.selectionStart || 0;

      // compute index in raw (non-comma) string that caret points to
      let rawIndex = 0;
      for (let i = 0; i < oldCaret; i++){
        if (old[i] !== ',') rawIndex++;
      }

      // Clean input: allow digits, dot, minus; remove commas now
      let cleaned = old.replace(/[^\d.\-]/g, ''); // remove any non-digit/non-dot/non-minus
      // normalize minus: keep only leading minus if present
      const neg = cleaned.startsWith('-');
      if (neg) cleaned = cleaned.slice(1);
      // remove all extra dots (keep only first)
      const parts = cleaned.split('.');
      if (parts.length > 1) cleaned = parts[0] + '.' + parts.slice(1).join('');
      // Remove leading zeros like earlier behavior (but keep single '0')
      if (/^0[0-9]/.test(cleaned)) {
        cleaned = cleaned.replace(/^0+/, '');
        if (cleaned === '') cleaned = '0';
      }
      // Reconstruct with sign for formatting
      const withSign = (neg ? '-' : '') + cleaned;

      // Now format with commas
      const formatted = formatWithCommas(withSign);

      // apply formatted value
      inputEl.value = formatted;

      // Map rawIndex to new caret position in formatted string.
      // rawIndex counts characters in the *cleaned-with-sign* string ignoring commas.
      // We'll iterate formatted and count non-comma characters until we reach rawIndex.
      let count = 0;
      let newCaret = formatted.length;
      for (let i = 0; i < formatted.length; i++){
        if (formatted[i] !== ',') count++;
        if (count > rawIndex) { newCaret = i + 1; break; }
      }
      if (rawIndex === 0) {
        // If caret was at very start, put caret after any leading sign if present.
        newCaret = formatted.startsWith('-') ? 1 : 0;
      }
      if (newCaret < 0) newCaret = 0;
      if (newCaret > formatted.length) newCaret = formatted.length;

      // set caret asynchronously so mobile IME selection updates settle first
      function applyCaret(){
        if (document.activeElement === inputEl) {
          try { inputEl.setSelectionRange(newCaret, newCaret); } catch (e) { /* ignore */ }
        }
      }
      // try RAF first, then setTimeout fallback
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(()=>{
          // small timeout inside RAF to accommodate some mobile timing quirks
          setTimeout(applyCaret, 0);
        });
      } else {
        setTimeout(applyCaret, 0);
      }
    }

    // -------------------------------
    // Composition flags for inputs (to avoid formatting while IME composing)
    // -------------------------------
    let fromComposing = false;
    let toComposing = false;
    fromInput.addEventListener('compositionstart', ()=>{ fromComposing = true; });
    fromInput.addEventListener('compositionend', (e)=>{ fromComposing = false; /* format now that composition ended */ formatInputLivePreserveCaret(fromInput); });
    toInput.addEventListener('compositionstart', ()=>{ toComposing = true; });
    toInput.addEventListener('compositionend', (e)=>{ toComposing = false; formatInputLivePreserveCaret(toInput); });

    // -------------------------------
    // Populate selects
    // -------------------------------
    function buildOptions(){
      SYMBOLS.forEach(sym=>{
        const opt1 = document.createElement('option'); opt1.value = sym; opt1.textContent = sym;
        fromSelect.appendChild(opt1);
        const opt2 = opt1.cloneNode(true); toSelect.appendChild(opt2);
      });
      fromSelect.value = 'USD'; toSelect.value = 'TRX';
    }
    buildOptions();

    // -------------------------------
    // Cache & fetch (unchanged behavior)
    // -------------------------------
    let lastRatesCache = {}; // { 'A->B': { rate, ts } }
    const CACHE_TTL = 25 * 60 * 1000; // 25 minutes

    async function fetchRate(fromSym, toSym){
      const key = pairKey(fromSym,toSym);
      const now = Date.now();
      const cached = lastRatesCache[key];
      if (cached && (now - cached.ts) < CACHE_TTL) return cached.rate;

      errorMsg.textContent = '';
      try {
        const fromIsCrypto = isCryptoSymbol(fromSym);
        const toIsCrypto   = isCryptoSymbol(toSym);
        let rate = null;

        if (!fromIsCrypto && !toIsCrypto){
          // 1) convert endpoint
          try {
            const res = await fetch(`https://api.exchangerate.host/convert?from=${encodeURIComponent(fromSym)}&to=${encodeURIComponent(toSym)}&amount=1`);
            if (res && res.ok){
              const j = await res.json();
              if (j && typeof j.result === 'number') rate = j.result;
            }
          } catch (e) { console.warn('convert failed', e); }

          // 2) latest endpoint
          if (rate == null) {
            try {
              const res2 = await fetch(`https://api.exchangerate.host/latest?base=${encodeURIComponent(fromSym)}&symbols=${encodeURIComponent(toSym)}`);
              if (res2 && res2.ok){
                const j2 = await res2.json();
                if (j2 && j2.rates && (typeof j2.rates[toSym] === 'number')) rate = j2.rates[toSym];
              }
            } catch (e2) { console.warn('latest failed', e2); }
          }

          // 3) USD-intermediate
          if (rate == null) {
            try {
              const res3 = await fetch(`https://api.exchangerate.host/latest?base=USD&symbols=${encodeURIComponent(fromSym)},${encodeURIComponent(toSym)}`);
              if (res3 && res3.ok){
                const j3 = await res3.json();
                const rFrom = j3?.rates?.[fromSym];
                const rTo = j3?.rates?.[toSym];
                if (typeof rFrom === 'number' && typeof rTo === 'number' && rFrom !== 0) {
                  rate = rTo / rFrom;
                }
              }
            } catch (e3) { console.warn('USD-intermediate failed', e3); }
          }

          // 4) crypto intermediate (Bitcoin)
          if (rate == null) {
            try {
              const vsList = `${fromSym.toLowerCase()},${toSym.toLowerCase()}`;
              const res4 = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(CRYPTO_INTERMEDIATE_ID)}&vs_currencies=${encodeURIComponent(vsList)}`);
              if (res4 && res4.ok){
                const j4 = await res4.json();
                const obj = j4?.[CRYPTO_INTERMEDIATE_ID];
                const priceInFrom = obj?.[fromSym.toLowerCase()];
                const priceInTo   = obj?.[toSym.toLowerCase()];
                if (typeof priceInFrom === 'number' && typeof priceInTo === 'number' && priceInFrom !== 0) {
                  rate = priceInTo / priceInFrom;
                }
              }
            } catch (e4) { console.warn('crypto-intermediate failed', e4); }
          }
        } else if (fromIsCrypto && !toIsCrypto){
          const coinId = SYMBOL_TO_COINGECKO_ID[fromSym];
          const vs = toSym.toLowerCase();
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=${encodeURIComponent(vs)}`);
          const j = await res.json();
          rate = j?.[coinId]?.[vs] ?? null;
        } else if (!fromIsCrypto && toIsCrypto){
          const coinId = SYMBOL_TO_COINGECKO_ID[toSym];
          const vs = fromSym.toLowerCase();
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=${encodeURIComponent(vs)}`);
          const j = await res.json();
          const priceOfOneToInFrom = j?.[coinId]?.[vs] ?? null;
          if (priceOfOneToInFrom) rate = 1 / priceOfOneToInFrom;
        } else {
          const idA = SYMBOL_TO_COINGECKO_ID[fromSym];
          const idB = SYMBOL_TO_COINGECKO_ID[toSym];
          const ids = `${idA},${idB}`;
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd`);
          const j = await res.json();
          const aUsd = j?.[idA]?.usd ?? null;
          const bUsd = j?.[idB]?.usd ?? null;
          if (aUsd && bUsd) rate = aUsd / bUsd;
        }

        if (rate == null) throw new Error('no rate');
        lastRatesCache[key] = { rate, ts: Date.now() };
        return rate;
      } catch (err) {
        console.error('fetchRate error', err);
        errorMsg.textContent = 'Error fetching rate';
        throw err;
      }
    }

    // -------------------------------
    // Format helper (unchanged except we also use commas)
    // -------------------------------
    function formatNumber(v){
      if (!isFinite(v)) return '';
      const abs = Math.abs(v);
      if (abs === 0) return '0';
      if (abs >= 1) return Number(v).toFixed(6).replace(/\.?0+$/, '');
      return Number(v).toPrecision(12).replace(/\.?0+$/, '');
    }

    // -------------------------------
    // Two-way conversion (modified to use unformat/formatWithCommas)
    // -------------------------------
    let userEditing = null; // 'from' | 'to' | null
    let convertTimer = null;
    function debounceConvert(fn, delay = 180){
      if (convertTimer) clearTimeout(convertTimer);
      convertTimer = setTimeout(fn, delay);
    }

    async function convertFromTo(){
      const fromSym = (fromSelect.value || '').toUpperCase();
      const toSym = (toSelect.value || '').toUpperCase();
      const raw = (fromInput.value || '').trim();
      const amt = parseNumberFromInput(raw);
      if (isNaN(amt)) { toInput.value = ''; return; }
      try {
        const rate = await fetchRate(fromSym, toSym);
        const converted = amt * rate;
        // format converted with commas for display
        toInput.value = formatWithCommas(formatNumber(converted));
      } catch (err) { /* errorMsg set in fetchRate */ }
    }

    async function convertToFrom(){
      const fromSym = (fromSelect.value || '').toUpperCase();
      const toSym = (toSelect.value || '').toUpperCase();
      const raw = (toInput.value || '').trim();
      const amt = parseNumberFromInput(raw);
      if (isNaN(amt)) { fromInput.value = ''; return; }
      try {
        const rate = await fetchRate(fromSym, toSym);
        if (!rate) { fromInput.value = ''; return; }
        const converted = amt / rate;
        fromInput.value = formatWithCommas(formatNumber(converted));
      } catch (err) { /* errorMsg set in fetchRate */ }
    }

    // -------------------------------
    // Input sanitization (adjusted to allow commas while typing but used mostly for other flows)
    // -------------------------------
    function sanitizeInput(raw){
      // allow digits and dot and comma while typing (we remove commas on parse)
      let cleaned = String(raw).replace(/[^\d.,\-]/g, '');
      // normalize minus to leading only
      const neg = cleaned.startsWith('-');
      if (neg) cleaned = '-' + cleaned.slice(1).replace(/-/g,'');
      // remove extra dots
      const parts = cleaned.split('.');
      if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
      // remove leading zeros (excluding decimals) similar to prior behavior (strip leading zeros)
      let maybeNeg = cleaned.startsWith('-') ? '-' : '';
      let body = maybeNeg ? cleaned.slice(1) : cleaned;
      body = body.replace(/,/g, '');
      if (/^0[0-9]/.test(body)) {
        body = body.replace(/^0+/, '');
        if (body === '') body = '0';
      }
      cleaned = maybeNeg + body;
      return cleaned;
    }

    // Live-formatting input while preserving caret
    fromInput.addEventListener('input', (e)=>{
      // if IME composition in progress, don't format immediately
      if (!fromComposing) {
        formatInputLivePreserveCaret(e.target);
      }
      // mark editing and debounce conversions as before
      userEditing = 'from';
      debounceConvert(async ()=>{ await convertFromTo(); userEditing = null; }, 180);
    });

    toInput.addEventListener('input', (e)=>{
      if (!toComposing) {
        formatInputLivePreserveCaret(e.target);
      }
      userEditing = 'to';
      debounceConvert(async ()=>{ await convertToFrom(); userEditing = null; }, 180);
    });

    // Format inputs when user focuses (clicks) the amount or when result is written.
    // When focusing: format the current numeric value with commas for readability.
    // When blur: keep formatted view.
    function tryFormatInputIfNumber(inputEl){
      const raw = (inputEl.value || '').trim();
      const n = parseNumberFromInput(raw);
      if (!isNaN(n)) {
        inputEl.value = formatWithCommas(unformat(formatNumber(n)));
      }
    }

    fromInput.addEventListener('focus', (e)=>{
      tryFormatInputIfNumber(e.target);
    });
    toInput.addEventListener('focus', (e)=>{
      tryFormatInputIfNumber(e.target);
    });

    // When they blur, keep the formatted view (so commas remain visible).
    fromInput.addEventListener('blur', (e)=>{
      tryFormatInputIfNumber(e.target);
    });
    toInput.addEventListener('blur', (e)=>{
      tryFormatInputIfNumber(e.target);
    });

    // When selects change
    async function onCurrencyChange(){
      fromTypeIndicator.textContent = isCryptoSymbol(fromSelect.value) ? 'crypto' : 'fiat';
      toTypeIndicator.textContent   = isCryptoSymbol(toSelect.value) ? 'crypto' : 'fiat';
      errorMsg.textContent = '';

      if (userEditing === 'from') { debounceConvert(convertFromTo); return; }
      if (userEditing === 'to') { debounceConvert(convertToFrom); return; }

      const fromVal = (fromInput.value || '').trim();
      const toVal = (toInput.value || '').trim();
      if (fromVal !== '') { debounceConvert(convertFromTo); return; }
      if (toVal !== '') { debounceConvert(convertToFrom); return; }

      toInput.value = '1';
      try {
        const rate = await fetchRate(fromSelect.value, toSelect.value);
        if (rate) {
          const impliedFrom = 1 / rate;
          // display impliedFrom with commas
          fromInput.value = formatWithCommas(formatNumber(impliedFrom));
          await convertFromTo();
        } else {
          fromInput.value = '';
        }
      } catch (err) { fromInput.value = ''; }
    }

    fromSelect.addEventListener('change', onCurrencyChange);
    toSelect.addEventListener('change', onCurrencyChange);

    // -------------------------------
    // Auto-refresh logic (unchanged aside from formatted display)
    // -------------------------------
    const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
    let autoInterval = null;

    async function refreshCurrentPair(){
      // clear cache for current pair to force fresh fetch
      const key = pairKey(fromSelect.value, toSelect.value);
      if (lastRatesCache[key]) delete lastRatesCache[key];

      // Attempt to fetch fresh rate, then re-run conversion according to focus/inputs
      try {
        await fetchRate(fromSelect.value, toSelect.value);
        // Keep behavior consistent: if user is editing, re-run what they are editing; else prefer from->to if from has value
        if (userEditing === 'from') { await convertFromTo(); return; }
        if (userEditing === 'to') { await convertToFrom(); return; }
        const fromVal = (fromInput.value || '').trim();
        const toVal = (toInput.value || '').trim();
        if (fromVal !== '') { await convertFromTo(); return; }
        if (toVal !== '') { await convertToFrom(); return; }
        // both empty: set to=1 and compute implied from
        toInput.value = '1';
        const rate = await fetchRate(fromSelect.value, toSelect.value);
        if (rate) {
          const impliedFrom = 1 / rate;
          fromInput.value = formatWithCommas(formatNumber(impliedFrom));
          await convertFromTo();
        }
      } catch (err) {
        // keep previous values; error message already set by fetchRate
      }
    }

    function startAutoRefresh(){
      stopAutoRefresh();
      // run first refresh in background (do not override user typing), then schedule
      autoInterval = setInterval(async ()=>{
        if (document.visibilityState === 'visible') {
          await refreshCurrentPair();
        }
      }, REFRESH_INTERVAL_MS);
    }

    function stopAutoRefresh(){
      if (autoInterval) { clearInterval(autoInterval); autoInterval = null; }
    }

    // Visibility handling
    document.addEventListener('visibilitychange', ()=>{
      if (document.visibilityState === 'visible') {
        // refresh immediately when returning
        refreshCurrentPair().catch(()=>{});
        startAutoRefresh();
      } else {
        stopAutoRefresh();
      }
    });

    // -------------------------------
    // Initial boot (format displayed numbers with commas)
    // -------------------------------
    (async function init(){
      fromTypeIndicator.textContent = isCryptoSymbol(fromSelect.value) ? 'crypto' : 'fiat';
      toTypeIndicator.textContent   = isCryptoSymbol(toSelect.value) ? 'crypto' : 'fiat';
      toInput.value = '1';
      try {
        const rate = await fetchRate(fromSelect.value, toSelect.value);
        if (rate) {
          const impliedFrom = 1 / rate;
          fromInput.value = formatWithCommas(formatNumber(impliedFrom));
        }
      } catch (_) {
        fromInput.value = '';
      }
      // start auto-refresh after initialization
      startAutoRefresh();
    })();

    // stop interval when leaving/unloading (best-effort)
    window.addEventListener('beforeunload', ()=>{ stopAutoRefresh(); });

  })();
  </script>
</body>
</html>
