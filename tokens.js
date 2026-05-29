// Design tokens — Terra Mater × M2i. Editorial documentary tone.
// Earth palette: deep charcoal, bone, ochre clay accent, moss.

window.TMTokens = {
  color: {
    bg:        '#0E1210',   // deep charcoal, almost black with green undertone
    bgPanel:   '#171B18',   // slightly lifted panel
    bgWarm:    '#E8E1D4',   // warm bone / paper
    bgWarm2:   '#D9CFBE',   // deeper bone
    ink:       '#F2EEE5',   // warm off-white on dark
    inkDim:    '#A9A79E',   // muted warm grey
    inkDim2:   '#6F6E67',
    inkDark:   '#171B18',   // dark on warm bg
    inkDarkDim:'#4A4D45',
    rule:      '#2B2F2B',   // rule on dark
    ruleWarm:  '#B7AF9D',   // rule on warm
    ochre:     '#C58A3B',   // clay / ochre accent
    ochreDim:  '#8F6228',
    moss:      '#6E7F4A',   // muted moss green
    water:     '#6B8CA3',   // muted water blue
    rust:      '#A85A3E',   // rust (the 'wound')
  },
  type: {
    // Slide-scale sizes (1920x1080)
    display:  128,  // cover headline
    title:    64,
    subtitle: 44,
    body:     32,
    small:    26,
    caption:  20,
    // families
    serif:   "'Fraunces Placeholder', 'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    sans:    "'Söhne Placeholder', 'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono:    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  space: {
    paddingTop:    100,
    paddingBottom: 80,
    paddingX:      120,
    titleGap:      52,
    itemGap:       28,
    sectionGap:    72,
  },
};

// Serif pairing — using Fraunces (editorial, documentary feel) + Inter Tight + JetBrains Mono
// Inject the Google Fonts link once
(function loadFonts(){
  if (document.getElementById('tm-fonts')) return;
  const l = document.createElement('link');
  l.id = 'tm-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(l);
  // Re-map placeholders
  window.TMTokens.type.serif = "'Fraunces', Georgia, 'Times New Roman', serif";
  window.TMTokens.type.sans  = "'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif";
})();
