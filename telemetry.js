// Live-ish sustainability telemetry simulator — numbers tick in real time
// so the demo feels alive during the pitch.

(function(){
  // Baseline values chosen to feel real and specific (not round marketing numbers)
  const START = Date.now();
  // Small pseudo-random walker, deterministic-ish per key
  function walker(seed) {
    let s = seed;
    return function(amp){
      s = (s * 9301 + 49297) % 233280;
      return (s / 233280 - 0.5) * 2 * amp;
    };
  }

  const state = {
    // Water clarity: % of EPA clean baseline at the downstream sensor
    waterClarity: { base: 94.1, amp: 0.6, unit: '%', label: 'Creek clarity vs. baseline' },
    // pH drift toward neutral 7
    waterPH:      { base: 6.82, amp: 0.04, unit: '',  label: 'Downstream pH' },
    // Heavy metals: iron ppm — dropping slowly
    iron:         { base: 0.41, amp: 0.03, unit: ' ppm', label: 'Dissolved iron' },
    // CO2 avoided today (tonnes) — cumulative since midnight
    co2DayTonnes: { base: 38.6, amp: 0.0, unit: ' t',  label: 'CO₂ avoided · today', cumulativePerHour: 1.72 },
    // Energy stored (MWh) gravity-based
    energyMWh:    { base: 112.4, amp: 0.0, unit: ' MWh', label: 'Gravity storage · charge', cumulativePerHour: 0.41 },
    // Hectares actively restored
    hectares:     { base: 247, amp: 0.0, unit: ' ha', label: 'Hectares in active restoration' },
    // Local jobs sustained
    jobs:         { base: 63, amp: 0.0, unit: '', label: 'Site jobs (local hire)' },
    // Wildlife sightings last 30d
    wildlife:     { base: 412, amp: 0.0, unit: '', label: 'Camera-trap sightings · 30d' },
    // Visitors talking to the mine today (the mine's own audience)
    conversations:{ base: 1843, amp: 0.0, unit: '', label: 'Conversations · today', cumulativePerHour: 38 },
    // Brook trout (returned species)
    trout:        { base: 317, amp: 0.0, unit: '', label: 'Brook trout observed · season' },
    // Uptime
    uptime:       { base: 99.94, amp: 0.01, unit: '%', label: 'Telemetry uptime' },
  };

  const rand = walker(7);

  function currentValue(key) {
    const s = state[key]; if (!s) return null;
    const elapsedHours = (Date.now() - START) / 3600_000;
    let v = s.base;
    if (s.cumulativePerHour) v += s.cumulativePerHour * elapsedHours;
    v += rand(s.amp);
    return v;
  }

  function fmt(key) {
    const s = state[key]; if (!s) return '';
    const v = currentValue(key);
    let str;
    if (key === 'waterPH' || key === 'iron') str = v.toFixed(2);
    else if (key === 'waterClarity' || key === 'uptime') str = v.toFixed(2);
    else if (key === 'co2DayTonnes' || key === 'energyMWh') str = v.toFixed(1);
    else str = Math.round(v).toLocaleString('en-US');
    return str + s.unit;
  }

  // Deltas (vs 30 days ago) — baked baselines for the "change since" copy
  const deltas = {
    waterClarity: { d30: '+9.4 pts', d365: '+38 pts vs 2023' },
    iron:         { d30: '−0.12 ppm', d365: '−1.7 ppm vs 2023' },
    co2DayTonnes: { d30: '+18% vs Mar avg' },
    trout:        { d30: '+41 vs last season' },
    hectares:     { d30: '+6 this month' },
    jobs:         { d30: '+4 hires this quarter' },
  };

  window.MineTelemetry = {
    get: fmt,
    raw: currentValue,
    delta: (k, which='d30') => (deltas[k] && deltas[k][which]) || '',
    labels: () => Object.fromEntries(Object.entries(state).map(([k,v])=>[k,v.label])),
    keys: () => Object.keys(state),
  };

  // Broadcast tick so subscribers can repaint
  setInterval(() => {
    window.dispatchEvent(new CustomEvent('mine-tick'));
  }, 1200);
})();
