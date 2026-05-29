// Provenance map — schematic, route-focused
// Pacific-centered crop: Australia (origin) → Pacific transit → US West Coast (destination)
(function(){
  const FULL_W = 1000, FULL_H = 500;
  // Pacific-centered projection: shift longitudes so 180° (date line) sits at the horizontal center.
  // Longitudes < 0 wrap to (lon + 360) so the US west coast lands to the right of Asia/Australia.
  function proj(lon, lat) {
    const lonShift = lon < 0 ? lon + 360 : lon; // 0..360, with Americas now > 180
    return [ (lonShift - 60) / 360 * FULL_W, (90 - lat) / 180 * FULL_H ];
    // Australia (~132°) → x ≈ 200; Hawaii (~-157→203°) → x ≈ 397; San Diego (~-117→243°) → x ≈ 508
  }

  // Crop window — span Australia (left) → Pacific (mid) → US West Coast (right)
  const CROP = { x: 175, y: 95, w: 360, h: 230 };

  const STOPS = [
    { id: 'origin',  name: 'Allied Extraction',      lon: 131.92, lat: -13.50, status: 'EXTRACTED'           },
    { id: 'darwin',  name: 'Port of Darwin',        lon: 130.84, lat: -12.46, status: 'IN PORT'             },
    { id: 'pacific', name: 'Pacific Transit',       lon: -160,   lat: 12,     status: 'IN TRANSIT'          },
    { id: 'usdib',   name: 'US Defense Industrial Base', lon: -118.25, lat: 33.74, status: 'DESTINATION'    }
  ];
  const ACTIVE = 2;

  // Schematic land masses (visual cue, not cartography). Coordinates in the Pacific-centered frame.
  const LAND_SHAPES = `
    <!-- Australia -->
    <path d="M 195 270 Q 215 254 245 250 Q 275 252 290 268 Q 298 285 292 308 Q 280 330 252 338 Q 220 340 200 332 Q 188 320 188 300 Q 188 282 195 270 Z"
          fill="#1B221C" stroke="#2E3A2F" stroke-width="0.5"/>
    <!-- Indonesia / island arc -->
    <ellipse cx="218" cy="240" rx="14" ry="3" fill="#1B221C"/>
    <ellipse cx="245" cy="244" rx="9" ry="2.4" fill="#1B221C"/>
    <ellipse cx="262" cy="248" rx="6" ry="2" fill="#1B221C"/>
    <!-- Papua New Guinea -->
    <ellipse cx="280" cy="232" rx="11" ry="2.6" fill="#1B221C"/>

    <!-- Hawaiian island chain (mid-Pacific reference) -->
    <ellipse cx="395" cy="220" rx="2" ry="0.8" fill="#1B221C"/>
    <ellipse cx="392" cy="222" rx="1.4" ry="0.6" fill="#1B221C"/>
    <ellipse cx="389" cy="224" rx="1.1" ry="0.5" fill="#1B221C"/>

    <!-- US West Coast (California / Baja silhouette) -->
    <path d="M 495 165
             Q 500 178 503 195
             Q 504 215 507 235
             Q 510 252 514 268
             Q 518 282 523 295
             Q 526 305 524 312
             L 530 312
             L 534 268
             L 538 215
             L 540 165
             Z"
          fill="#1B221C" stroke="#2E3A2F" stroke-width="0.5"/>
    <!-- continental US bulk fading off-frame to the right -->
    <path d="M 525 160 L 540 158 L 540 312 L 530 312 Q 528 280 530 230 Q 528 195 525 160 Z"
          fill="#1B221C" stroke="#2E3A2F" stroke-width="0.5"/>
  `;

  window.ProvenanceMap = function(target) {
    const svg = `
      <svg viewBox="${CROP.x} ${CROP.y} ${CROP.w} ${CROP.h}"
           xmlns="http://www.w3.org/2000/svg"
           preserveAspectRatio="xMidYMid meet"
           style="width:100%; height:100%; display:block;">
        <defs>
          <radialGradient id="pmpulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#D9532C" stop-opacity="0.95"/>
            <stop offset="55%" stop-color="#D9532C" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#D9532C" stop-opacity="0"/>
          </radialGradient>
          <filter id="pmglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- ocean -->
        <rect x="${CROP.x}" y="${CROP.y}" width="${CROP.w}" height="${CROP.h}" fill="#0E1110"/>

        <!-- subtle grid -->
        <g stroke="#181D1A" stroke-width="0.2">
          ${[...Array(13)].map((_,i) => `<line x1="${CROP.x + i*CROP.w/12}" y1="${CROP.y}" x2="${CROP.x + i*CROP.w/12}" y2="${CROP.y+CROP.h}"/>`).join('')}
          ${[...Array(8)].map((_,i) => `<line x1="${CROP.x}" y1="${CROP.y + i*CROP.h/7}" x2="${CROP.x+CROP.w}" y2="${CROP.y + i*CROP.h/7}"/>`).join('')}
        </g>
        <!-- equator -->
        <line x1="${CROP.x}" y1="${FULL_H/2}" x2="${CROP.x+CROP.w}" y2="${FULL_H/2}"
              stroke="#252B26" stroke-width="0.4" stroke-dasharray="1.2 2.4"/>
        <!-- date line -->
        <line x1="${(180 - 60)/360*FULL_W}" y1="${CROP.y}" x2="${(180 - 60)/360*FULL_W}" y2="${CROP.y+CROP.h}"
              stroke="#252B26" stroke-width="0.3" stroke-dasharray="0.8 2"/>

        <!-- land -->
        ${LAND_SHAPES}

        <!-- region labels -->
        <text x="220" y="305" fill="#3F4A3D" font-family="JetBrains Mono, monospace" font-size="6" letter-spacing="0.3em">AUSTRALIA</text>
        <text x="350" y="135" fill="#3F4A3D" font-family="JetBrains Mono, monospace" font-size="6" letter-spacing="0.3em">PACIFIC OCEAN</text>
        <text x="498" y="148" fill="#3F4A3D" font-family="JetBrains Mono, monospace" font-size="5" letter-spacing="0.3em">UNITED STATES</text>

        <!-- route arcs -->
        ${STOPS.slice(0,-1).map((s,i) => {
          const a = proj(s.lon, s.lat), b = proj(STOPS[i+1].lon, STOPS[i+1].lat);
          const mx = (a[0]+b[0])/2, my = Math.min(a[1],b[1]) - 14;
          const isActive = i === ACTIVE-1;
          return `<path d="M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}"
                    fill="none"
                    stroke="${isActive ? '#D9532C' : '#5C6A56'}"
                    stroke-width="${isActive ? 0.9 : 0.5}"
                    stroke-dasharray="${isActive ? '0' : '1.6 1.8'}"
                    opacity="${isActive ? 1 : 0.85}"/>`;
        }).join('')}

        <!-- direction arrowhead on active leg -->
        ${(() => {
          const a = proj(STOPS[ACTIVE-1].lon, STOPS[ACTIVE-1].lat);
          const b = proj(STOPS[ACTIVE].lon, STOPS[ACTIVE].lat);
          const t = 0.5;
          const mx = (a[0]+b[0])/2, my = Math.min(a[1],b[1]) - 14;
          // tangent at t=0.5 of quadratic bezier
          const tx = 2*(1-t)*(mx-a[0]) + 2*t*(b[0]-mx);
          const ty = 2*(1-t)*(my-a[1]) + 2*t*(b[1]-my);
          const x = (1-t)*(1-t)*a[0] + 2*(1-t)*t*mx + t*t*b[0];
          const y = (1-t)*(1-t)*a[1] + 2*(1-t)*t*my + t*t*b[1];
          return `<g transform="translate(${x}, ${y}) rotate(${Math.atan2(ty, tx)*180/Math.PI})">
            <polygon points="0,0 -5,-2 -5,2" fill="#D9532C"/>
          </g>`;
        })()}

        <!-- stops -->
        ${STOPS.map((s,i) => {
          const [x,y] = proj(s.lon, s.lat);
          const isActive = i === ACTIVE;
          const isPast = i < ACTIVE;
          const color = isActive ? '#D9532C' : (isPast ? '#9CA88A' : '#C5C2B8');
          // Last stop (US destination) flips label to the left so it doesn't clip the right edge
          const right = (s.id !== 'usdib');
          const labelX = right ? x + 5 : x - 5;
          const anchor = right ? 'start' : 'end';
          // Wrap long destination label across two lines
          const isLong = s.id === 'usdib';
          return `
            <g>
              ${isActive ? `<circle cx="${x}" cy="${y}" r="6" fill="url(#pmpulse)">
                <animate attributeName="r" from="3" to="14" dur="1.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.95" to="0" dur="1.8s" repeatCount="indefinite"/>
              </circle>` : ''}
              <circle cx="${x}" cy="${y}" r="${isActive ? 2.6 : 1.4}" fill="${color}" filter="url(#pmglow)">
                ${isActive ? `<animate attributeName="r" values="2.6;3.8;2.6" dur="1s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="1;0.35;1" dur="1s" repeatCount="indefinite"/>` : ''}
              </circle>
              ${isLong ? `
                <text x="${labelX}" y="${y - 4}" fill="${isActive ? '#F2EEE5' : (isPast ? '#9CA88A' : '#C5C2B8')}"
                      text-anchor="${anchor}"
                      font-family="JetBrains Mono, monospace" font-size="6" letter-spacing="0.05em" font-weight="600">
                  US DEFENSE
                </text>
                <text x="${labelX}" y="${y + 2.5}" fill="${isActive ? '#F2EEE5' : (isPast ? '#9CA88A' : '#C5C2B8')}"
                      text-anchor="${anchor}"
                      font-family="JetBrains Mono, monospace" font-size="6" letter-spacing="0.05em" font-weight="600">
                  INDUSTRIAL BASE
                </text>
                <text x="${labelX}" y="${y + 9}" fill="${isActive ? '#D9532C' : '#7A7A6E'}"
                      text-anchor="${anchor}"
                      font-family="JetBrains Mono, monospace" font-size="4.4" letter-spacing="0.12em">
                  ${s.status}
                </text>
              ` : `
                <text x="${labelX}" y="${y - 4}" fill="${isActive ? '#F2EEE5' : (isPast ? '#9CA88A' : '#C5C2B8')}"
                      text-anchor="${anchor}"
                      font-family="JetBrains Mono, monospace" font-size="6" letter-spacing="0.05em" font-weight="600">
                  ${s.name.toUpperCase()}
                </text>
                <text x="${labelX}" y="${y + 3}" fill="${isActive ? '#D9532C' : '#7A7A6E'}"
                      text-anchor="${anchor}"
                      font-family="JetBrains Mono, monospace" font-size="4.4" letter-spacing="0.12em">
                  ${s.status}
                </text>
              `}
            </g>
          `;
        }).join('')}

        <!-- Compass -->
        <g transform="translate(${CROP.x + CROP.w - 18}, ${CROP.y + 15})">
          <circle r="5" fill="none" stroke="#3F4A3D" stroke-width="0.4"/>
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#3F4A3D" stroke-width="0.4"/>
          <text x="0" y="-6.5" fill="#3F4A3D" font-family="JetBrains Mono, monospace" font-size="4" text-anchor="middle">N</text>
        </g>
      </svg>
    `;
    target.innerHTML = svg;
  };
})();
