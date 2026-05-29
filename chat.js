// Talking Mine chat component — supports two modes:
//   - 'live'        : Doug + Al alternating, with live telemetry tokens (slide 3)
//   - 'provenance'  : 3-way (Doug, Al, Mine) about traceability — no telemetry (slide 4)
//   - 'community'   : static 2-exchange render (legacy, unused)

(function(){
  const SCRIPTS = {
    live: [
      { who: 'doug', text: "Morning. What's our DoD-compliant inventory at Hawthorne right now?" },
      { who: 'mine', text: "Morning, Doug. Current verified stockpile: {{inventory}} tonnes of critical mineral materials. Chain-of-custody documentation complete on all active batches. Last DoD compliance audit: 72 hours ago. All certifications current." },

      { who: 'al',   text: "I need a Senate briefing packet — Armed Services subcommittee. How fast can you pull that?" },
      { who: 'mine', text: "Draft ready. Four pages: verified stockpile levels, provenance chain from allied extraction to Hawthorne, allied supply chain diagram, and a China-dependency comparison. I've added a 90-day forward trajectory. Sending to your inbox now." },

      { who: 'doug', text: "Anything the Army inspector might flag on Tuesday?" },
      { who: 'mine', text: "Two items. Batch 7C-Bravo tracer readings haven't been counter-verified by the receiving lab — I've sent them a reminder. And the Q1 environmental compliance report is due Friday. Draft is ready for Al's review." },

      { who: 'al',   text: "Give me one sentence for the investor call at three." },
      { who: 'mine', text: "Hawthorne CMR holds verified critical mineral inventory in an allied supply chain — traceable from extraction, auditable by DoD, zero dependence on adversarial sources. Want me to push that into the IR deck?" },
    ],

    provenance: [
      { who: 'al',   text: "Tell me about the last DoD consignment. Where did the material originate and how do I prove it?" },
      { who: 'mine', text: "Batch 4F2A-9C13 — 2,180 tonnes of processed critical minerals. Originated at an allied extraction site, verified at Hawthorne CMR, delivered to the defense contractor. Every step is documented. Chain of custody: complete and auditable." },

      { who: 'doug', text: "Spell it out — how do you actually know where it came from?" },
      { who: 'mine', text: "At the primary crusher, each batch is dosed with a molecular tracer — a unique rare-earth and isotope signature, chemically bonded to the ore. Survives processing, shipping, and smelting. The receiving QC labs verify against my ledger on arrival." },

      { who: 'al',   text: "And how do we know the record hasn't been touched?" },
      { who: 'mine', text: "Each tracer signature is hashed and committed to a permissioned blockchain at the moment of dosing. From there it's append-only. Every custody handover — truck out, port receipt, Hawthorne intake, contractor delivery — writes a signed event. Tampering would require breaking molecular chemistry and consensus cryptography simultaneously." },

      { who: 'doug', text: "Show me the chain." },
      { who: 'mine', text: "Here's the public verifier for batch 4F2A-9C13. Opens to the full custody chain — extraction origin → Hawthorne CMR → defense contractor. DoD compliance can pull this at any time.", link: { url: "trace.hawthorne-cmr.io/batch/4F2A-9C13", qr: true } },
    ],

    community: [
      { who: 'mine', text: "Doug, Al — heads up. Federal funding for the wetlands monitoring fell through this morning. I've drafted a community call-to-action and posted it to the public site. Forty-three letters to representatives in the first hour. Want me to escalate to the chamber of commerce?" },
      { who: 'al',   text: "Yes — and loop in the indigenous land council. Draft something respectful, send it to me before it goes out." },
    ]
  };

  function resolveTokens(str) {
    return str.replace(/\{\{([a-zA-Z0-9]+)(?:\.([a-zA-Z0-9]+))?\}\}/g, (_, key, mod) => {
      if (key === 'inventory') return '847';
      if (mod === 'delta') return window.MineTelemetry ? window.MineTelemetry.delta(key) : '';
      return window.MineTelemetry ? (window.MineTelemetry.get(key) || '—') : '—';
    });
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  const PERSONAS = {
    doug: { initials: 'DC', name: 'DOUG COLE',        role: 'M2i GLOBAL · CEO',         cls: 'tm-bubble-doug', avCls: 'tm-avatar-doug' },
    al:   { initials: 'AR', name: 'ALBERTO ROSENDE',  role: 'M2i GLOBAL · STRATEGY',    cls: 'tm-bubble-al',   avCls: 'tm-avatar-al'   },
    mine: { initials: 'HC', name: 'HAWTHORNE CMR',    role: 'CRITICAL MINERALS · DEPOT', cls: 'tm-bubble-mine', avCls: 'tm-avatar-mine' }
  };

  function makeQR(text) {
    let cells = '';
    const seed = [...text].reduce((a,c)=>a+c.charCodeAt(0),0);
    for (let y = 0; y < 11; y++) {
      for (let x = 0; x < 11; x++) {
        const v = ((seed * (x+1) * (y+3)) ^ (x*y+seed)) & 1;
        const corner = (x<3&&y<3) || (x>7&&y<3) || (x<3&&y>7);
        const cornerEdge = (x===0||x===2||y===0||y===2) || (x===8||x===10||y===0||y===2) || (x===0||x===2||y===8||y===10);
        const fill = corner ? (cornerEdge ? 1 : 0) : v;
        if (fill) cells += `<rect x="${x*4}" y="${y*4}" width="4" height="4" fill="#0F1310"/>`;
      }
    }
    return `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" style="width:64px;height:64px;background:#F2EEE5;padding:4px;border-radius:3px;">${cells}</svg>`;
  }

  window.TalkingMineChat = function mount(root, opts={}) {
    opts = Object.assign({ mode: 'live', autoplay: true, startDelay: 600, typingSpeed: 22, betweenDelay: 900, showHeader: true, showComposer: true, showTelemetry: true }, opts);
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    const SCRIPT = SCRIPTS[opts.mode] || SCRIPTS.live;

    root.innerHTML = '';
    root.classList.add('tm-chat-root');
    if (opts.mode === 'community') root.classList.add('tm-chat-community');

    const grid = el('div', 'tm-chat-grid');
    if (!opts.showTelemetry && !opts.sidePanel) grid.classList.add('tm-chat-grid-wide');
    root.appendChild(grid);

    const chatCol = el('div', 'tm-chat-col');
    if (opts.showHeader) {
      const header = el('div', 'tm-chat-header');
      header.innerHTML = `
        <div class="tm-chat-header-left">
          <div class="tm-avatar tm-avatar-mine"><span>HC</span></div>
          <div>
            <div class="tm-chat-title">Hawthorne CMR</div>
            <div class="tm-chat-sub"><span class="live-dot"></span>Live · Listening on web, secure briefing portal, SMS</div>
          </div>
        </div>
        <div class="tm-chat-header-right mono">${opts.headerLabel || 'THE TALKING MINE · DEMO'}</div>
      `;
      chatCol.appendChild(header);
    }

    const scroll = el('div', 'tm-chat-scroll chat-scroll');
    chatCol.appendChild(scroll);

    if (opts.showComposer) {
      const composer = el('div', 'tm-chat-composer');
      composer.innerHTML = `
        <div class="tm-chat-composer-input">Ask Hawthorne CMR anything…</div>
        <button class="tm-chat-replay" title="Replay demo">↻ Replay</button>
      `;
      chatCol.appendChild(composer);
    }
    grid.appendChild(chatCol);

    if (opts.showTelemetry) {
      const panel = el('div', 'tm-panel');
      panel.innerHTML = `
        <div class="tm-panel-head">
          <div style="min-width:0; flex:1;">
            <div class="eyebrow" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">LIVE TELEMETRY</div>
            <div class="tm-panel-clock mono" style="margin-top:4px;"></div>
          </div>
          <div class="mono" style="font-size:10px; color:#7BB661; letter-spacing:0.16em; white-space:nowrap; flex-shrink:0;">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#7BB661; box-shadow:0 0 6px #7BB661; vertical-align:1px; margin-right:6px;"></span>
            STREAMING
          </div>
        </div>
        <div class="tm-panel-grid">
          ${[
            ['waterClarity','Clarity'],['waterPH','pH'],
            ['iron','Dissolved Fe'],['co2DayTonnes','CO₂ today'],
            ['energyMWh','Storage'],['hectares','Hectares'],
            ['trout','Trout · season'],['conversations','Convos · today'],
            ['jobs','Local hires'],['uptime','Uptime'],
          ].map(([k,label]) => `
            <div class="tm-metric" data-key="${k}">
              <div class="tm-metric-label mono">${label.toUpperCase()}</div>
              <div class="tm-metric-value serif">${window.MineTelemetry ? window.MineTelemetry.get(k) : '—'}</div>
              <div class="tm-metric-delta mono">${window.MineTelemetry ? (window.MineTelemetry.delta(k)||'&nbsp;') : ''}</div>
            </div>
          `).join('')}
        </div>
        <div class="tm-panel-foot mono">Stream: site-ingest · 4 sensors · last sync 00:00:01</div>
      `;
      grid.appendChild(panel);
      const clock = panel.querySelector('.tm-panel-clock');
      function repaint() {
        panel.querySelectorAll('.tm-metric').forEach(m => {
          const k = m.dataset.key;
          if (window.MineTelemetry) m.querySelector('.tm-metric-value').textContent = window.MineTelemetry.get(k);
        });
        const d = new Date(), pad = n => String(n).padStart(2,'0');
        clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}  LOCAL`;
      }
      repaint();
      window.addEventListener('mine-tick', repaint);
    } else if (opts.sidePanel) {
      const side = el('div', 'tm-panel tm-panel-provenance');
      side.id = opts.sidePanel.id || 'tm-side-panel';
      grid.appendChild(side);
    }

    let stopped = false;
    let running = false;
    let gen = 0;

    function renderBubble(beat) {
      const persona = PERSONAS[beat.who] || PERSONAS.mine;
      const row = el('div', 'tm-msg tm-' + beat.who);
      const avatar = el('div', 'tm-avatar ' + persona.avCls, `<span>${persona.initials}</span>`);
      const bubble = el('div', 'tm-bubble ' + persona.cls);
      const name = el('div', 'tm-name mono', persona.name + ' · ' + persona.role);
      const body = el('div', 'tm-bubble-body');
      bubble.appendChild(name); bubble.appendChild(body);
      row.appendChild(avatar); row.appendChild(bubble);
      return { row, body, bubble, beat };
    }

    async function playOne(beat, myGen) {
      if (stopped || myGen !== gen) return;
      const { row, body, bubble } = renderBubble(beat);
      scroll.appendChild(row);
      scroll.scrollTop = scroll.scrollHeight;

      if (beat.who === 'mine') {
        body.innerHTML = '<span class="tm-typing"><i></i><i></i><i></i></span>';
        await wait(720);
        if (stopped || myGen !== gen) return;
      }
      const text = resolveTokens(beat.text);
      body.innerHTML = '';
      for (let j = 0; j < text.length; j++) {
        if (stopped || myGen !== gen) return;
        body.textContent += text[j];
        scroll.scrollTop = scroll.scrollHeight;
        const ch = text[j];
        const delay = (ch === '.' || ch === '?' || ch === ',') ? 90 : opts.typingSpeed;
        await wait(delay);
      }
      if (beat.link) {
        const att = el('div', 'tm-attachment');
        att.innerHTML = `
          <div class="tm-attachment-qr">${makeQR(beat.link.url)}</div>
          <div class="tm-attachment-body">
            <div class="tm-attachment-label mono">PUBLIC PROVENANCE LEDGER · BATCH 4F2A-9C13</div>
            <div class="tm-attachment-link mono">${beat.link.url} <span class="tm-attachment-copy">⧉ copy</span></div>
            <div class="tm-attachment-chain mono">ALLIED EXTRACTION → HAWTHORNE CMR → US DEFENSE INDUSTRIAL BASE</div>
          </div>
        `;
        bubble.appendChild(att);
        scroll.scrollTop = scroll.scrollHeight;
      }
      await wait(opts.betweenDelay);
    }

    async function run() {
      const myGen = ++gen;
      stopped = false;
      running = true;
      scroll.innerHTML = '';
      await wait(opts.startDelay);
      for (let i = 0; i < SCRIPT.length; i++) {
        if (stopped || myGen !== gen) { running = false; return; }
        await playOne(SCRIPT[i], myGen);
      }
      if (myGen !== gen) { running = false; return; }
      const done = el('div', 'tm-done mono', '— end of demo · replay any time —');
      scroll.appendChild(done); scroll.scrollTop = scroll.scrollHeight;
      running = false;
    }

    function renderStatic() {
      scroll.innerHTML = '';
      SCRIPT.forEach(beat => {
        const { row, body } = renderBubble(beat);
        body.textContent = resolveTokens(beat.text);
        scroll.appendChild(row);
      });
    }

    const replayBtn = chatCol.querySelector('.tm-chat-replay');
    if (replayBtn) replayBtn.addEventListener('click', () => {
      stopped = true;
      setTimeout(() => { stopped = false; running = false; run(); }, 80);
    });

    if (opts.staticRender) renderStatic();
    else if (opts.autoplay) run();

    return {
      replay: () => { stopped = true; gen++; setTimeout(() => { run(); }, 80); },
      stop: () => { stopped = true; gen++; }
    };
  };
})();
