(function(root){
  'use strict';
  // Layered storybook scene. Stable decoration IDs still choose independent pieces;
  // both the room and its thumbnails use the same artwork and material definitions.
  const INK='#92755b';
  const D=root.RestaurantData||(typeof require==='function'?require('./restaurant-data.js'):null);
  const ln=(w=2.4,c=INK)=>`stroke="${c}" stroke-width="${w*.62}" stroke-linejoin="round" stroke-linecap="round"`;
  const ART='assets/restaurant/art/';
  let uid=0;
  function star(cx,cy,r,inner=r*.45,n=5){
    const pts=[];
    for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,rr=i%2?inner:r;pts.push(`${(cx+rr*Math.cos(a)).toFixed(1)},${(cy+rr*Math.sin(a)).toFixed(1)}`);}
    return pts.join(' ');
  }
  const heart=(x,y,s,fill)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0-3C-3-8-10-6-10-1C-10 4-4 7 0 10C4 7 10 4 10-1C10-6 3-8 0-3Z" fill="${fill}"/>`;
  function flower(x,y,r,petal,center='#ffd35a'){
    let out='';
    for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;out+=`<circle cx="${(x+r*.62*Math.cos(a)).toFixed(1)}" cy="${(y+r*.62*Math.sin(a)).toFixed(1)}" r="${(r*.5).toFixed(1)}" fill="${petal}"/>`;}
    return out+`<circle cx="${x}" cy="${y}" r="${(r*.36).toFixed(1)}" fill="${center}"/>`;
  }
  const pattern=(id,w,h,body)=>`<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${body}</pattern>`;
  const gingham=(id,color,size=16)=>pattern(id,size,size,`<rect width="${size}" height="${size}" fill="#fffaf2"/><rect width="${size/2}" height="${size}" fill="${color}" opacity=".45"/><rect width="${size}" height="${size/2}" fill="${color}" opacity=".45"/>`);
  function materials(u){
    const gradient=(name,colors)=>`<linearGradient id="${u}${name}" x2=".75" y2="1">${colors.map((c,i)=>`<stop offset="${i/(colors.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
    return `<defs>
      ${gradient('porcelain',['#fffef6','#f4ead8','#deceb4'])}${gradient('wood',['#e5c7a0','#c99e75','#ad7e59'])}
      ${gradient('woodDark',['#b9906c','#9c7453','#81634c'])}${gradient('gold',['#ffebae','#edc574','#c29a50'])}
      ${gradient('rose',['#efd0cc','#dba4a1','#bb8587'])}${gradient('sage',['#c4cfb3','#9bae8a','#798f70'])}
      ${gradient('blue',['#d0e5e8','#9fc3cc','#7a9da9'])}${gradient('navy',['#8c97b5','#5f7093','#465879'])}
      ${gradient('berry',['#e4a7a2','#cb817e','#af6666'])}${gradient('leaf',['#b7c7a0','#93ad80','#738e67'])}
      <radialGradient id="${u}ground"><stop stop-color="#684c33" stop-opacity=".25"/><stop offset="1" stop-color="#684c33" stop-opacity="0"/></radialGradient>
      <filter id="${u}soft" x="-25%" y="-25%" width="150%" height="165%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#685139" flood-opacity=".18"/></filter>
      <filter id="${u}paper"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" stitchTiles="stitch" seed="8"/><feColorMatrix type="saturate" values="0"/></filter>
    </defs>`;
  }
  function finish(markup,u){
    const fills={'#fff':'porcelain','#fffaf2':'porcelain','#fff8ec':'porcelain','#fff3dd':'porcelain','#c98f5d':'wood','#d39c68':'wood','#d8a574':'wood','#a8744a':'woodDark','#b27a4b':'woodDark','#ffd45c':'gold','#f3c25e':'gold','#f2c06b':'gold','#fbd3dc':'rose','#f7b6c6':'rose','#f48fa4':'rose','#f9b4c3':'rose','#ee5b5b':'berry','#e8574f':'berry','#f27a93':'berry','#8fd0e8':'blue','#7fc4d8':'blue','#86c1e8':'blue','#40508f':'navy','#6fb35a':'leaf','#8cc473':'leaf'};
    return markup.replace(/fill="(#[a-fA-F0-9]+)"/g,(match,color)=>fills[color]?`fill="url(#${u}${fills[color]})"`:match);
  }

  // ---------- Walls ----------
  function wallFill(u,base,body){return `<defs>${pattern(`${u}w`,body[0],body[1],`<rect width="${body[0]}" height="${body[1]}" fill="${base}"/>${body[2]}`)}</defs><rect width="640" height="252" fill="url(#${u}w)"/>`;}
  const WALL={
    'wall-cream':u=>wallFill(u,'#f6eedf',[40,40,'<circle cx="20" cy="20" r="1" fill="#d6c8b0" opacity=".5"/>']),
    'wall-mint':u=>wallFill(u,'#e6ede0',[36,36,'<rect width="18" height="36" fill="#dce5d3"/><rect x="26" width="1" height="36" fill="#fff" opacity=".6"/>']),
    'wall-heart':u=>wallFill(u,'#fde7e4',[48,48,heart(12,12,.7,'#f6bcc3')+heart(36,36,.7,'#f9ccd2')+'<circle cx="36" cy="12" r="2" fill="#fff"/><circle cx="12" cy="36" r="2" fill="#fff"/>']),
    'wall-star':u=>wallFill(u,'#dde5fb',[60,60,`<polygon points="${star(15,15,7)}" fill="#fff0a8"/><polygon points="${star(45,43,5)}" fill="#fff6c9"/><circle cx="44" cy="12" r="2" fill="#c3cff5"/><circle cx="14" cy="46" r="2.5" fill="#c3cff5"/>`]),
    'wall-leaf':u=>wallFill(u,'#eaf4df',[56,56,'<ellipse cx="14" cy="16" rx="9" ry="4.5" transform="rotate(-35 14 16)" fill="#c6e1aa"/><ellipse cx="42" cy="42" rx="9" ry="4.5" transform="rotate(30 42 42)" fill="#b7d99b"/><circle cx="42" cy="14" r="2.5" fill="#f6c9a4"/><circle cx="14" cy="44" r="2" fill="#fff"/>'])
  };

  // ---------- Window views (clipped to the arched window) ----------
  const WIN='M34 226V152A60 48 0 0 1 154 152V226Z';
  const sky=(u,top,bottom)=>`<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect x="28" y="98" width="134" height="134" fill="url(#${u}s)"/>`;
  const VIEW={
    'view-day':()=>`<image href="${ART}forest-gouache.webp" x="28" y="94" width="134" height="138" preserveAspectRatio="xMidYMid slice"/>`,
    'view-sunset':u=>sky(u,'#ff9d82','#ffe2ad')+`<circle cx="100" cy="196" r="24" fill="#ff7d5a" opacity=".9"/>
      <path d="M28 200Q70 176 110 196T162 190V232H28Z" fill="#bb8db9"/><path d="M28 214Q92 194 162 212V232H28Z" fill="#8f6ba1"/>
      <path d="M54 136q5-5 10 0q5-5 10 0M86 124q4-4 8 0q4-4 8 0" fill="none" ${ln(2,'#6b4a6b')}/>`,
    'view-night':u=>sky(u,'#26325e','#4b5b9a')+`<path d="M124 116a16 16 0 1 0 12 28a13 13 0 1 1-12-28Z" fill="#fff1a8"/>
      <g fill="#fff6c9"><polygon points="${star(58,126,5)}"/><polygon points="${star(88,114,3.5)}"/><polygon points="${star(76,150,3)}"/><circle cx="140" cy="164" r="1.8"/><circle cx="46" cy="160" r="1.5"/></g>
      <path d="M28 200Q70 180 110 198T162 192V232H28Z" fill="#2f4d60"/><path d="M28 214Q92 196 162 212V232H28Z" fill="#223a4c"/>
      <rect x="56" y="192" width="20" height="15" fill="#3d5a70"/><path d="M53 193L66 182L79 193Z" fill="#2c4456"/><rect x="62" y="196" width="7" height="6" fill="#ffd45c"/>`,
    'view-snow':u=>sky(u,'#cfdded','#eef4fa')+`<path d="M28 192Q70 172 108 190T162 184V232H28Z" fill="#fff"/><path d="M28 212Q92 194 162 208V232H28Z" fill="#e3edf6"/>
      <g><rect x="120" y="184" width="6" height="14" fill="#8a5a3b"/><path d="M123 146L108 172H138Z M123 160L104 190H142Z" fill="#5e9b7a"/><path d="M123 146L115 160H131Z M123 162L112 178H134Z" fill="#fff" opacity=".85"/></g>
      <g fill="#fff"><circle cx="48" cy="124" r="2.5"/><circle cx="72" cy="142" r="2"/><circle cx="96" cy="120" r="2.5"/><circle cx="60" cy="164" r="2"/><circle cx="142" cy="130" r="2"/><circle cx="88" cy="170" r="2.5"/></g>`,
    'view-sea':u=>sky(u,'#aee0f4','#e3f5fb')+`<circle cx="56" cy="128" r="12" fill="#ffd45c"/><g fill="#fff"><ellipse cx="120" cy="124" rx="15" ry="7"/><ellipse cx="130" cy="119" rx="9" ry="7"/></g>
      <rect x="28" y="184" width="134" height="48" fill="#5db3d8"/><path d="M28 196q8-5 16 0t16 0 16 0 16 0 16 0 16 0 16 0 16 0M28 212q8-5 16 0t16 0 16 0 16 0 16 0 16 0 16 0 16 0" fill="none" ${ln(2.2,'#bfe7f3')}/>
      <path d="M100 182H136L129 193H107Z" fill="#e37b52" ${ln(1.6)}/><path d="M118 181V150" ${ln(1.6)}/><path d="M119 152L134 178H119Z" fill="#fff" ${ln(1.4)}/>`
  };

  // ---------- Chef (bear) with hat and apron ----------
  const APRON_BODY='M188 230H222L225 256C238 262 244 298 238 318Q205 328 172 318C166 298 172 262 185 256Z';
  function apronShape(fill,band,strap,extra=''){
    return `<path d="M190 228Q205 214 220 228" fill="none" ${ln(4,strap)}/><path d="${APRON_BODY}" fill="${fill}" ${ln()}/>
      <rect x="180" y="252" width="50" height="9" rx="4.5" fill="${band}" ${ln(1.8)}/><path d="M194 280H216V292Q205 299 194 292Z" fill="none" ${ln(1.8)}/>${extra}`;
  }
  const APRON={
    'apron-white':()=>apronShape('#fffaf2','#e9d9c4','#e9d9c4',heart(205,286,.45,'#f4a3a8')),
    'apron-check':u=>`<defs>${gingham(`${u}ap`,'#e25a50',14)}</defs>`+apronShape(`url(#${u}ap)`,'#e25a50','#e25a50'),
    'apron-dots':u=>`<defs>${pattern(`${u}ap`,14,14,'<rect width="14" height="14" fill="#86c1e8"/><circle cx="3.5" cy="3.5" r="2.2" fill="#fff"/><circle cx="10.5" cy="10.5" r="2.2" fill="#fff"/>')}</defs>`+apronShape(`url(#${u}ap)`,'#5b9fcf','#5b9fcf'),
    'apron-rainbow':u=>`<defs><linearGradient id="${u}ap" x1="0" y1="228" x2="0" y2="324" gradientUnits="userSpaceOnUse">${['#f59a9a','#f8c27a','#fbe38a','#a6dc98','#8fcbef','#c3a7ec'].map((c,i)=>`<stop offset="${i/6}" stop-color="${c}"/><stop offset="${(i+1)/6}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`+apronShape(`url(#${u}ap)`,'#fffaf2','#f59a9a',`<polygon points="${star(205,286,5)}" fill="#fff"/>`)
  };
  const CHEF_HAT_PUFF='M172 132C154 128 154 100 178 100C180 76 230 76 232 100C256 100 256 128 238 132Z';
  const hatBand=(fill,extra='')=>`<path d="M170 128Q205 121 240 128L238 146Q205 152 172 146Z" fill="${fill}" ${ln()}/>${extra}`;
  const pleats='<path d="M190 106V124M205 100V122M220 106V124" fill="none" stroke="#eadfd2" stroke-width="2" stroke-linecap="round"/>';
  const HAT={
    'hat-white':()=>`<path d="${CHEF_HAT_PUFF}" fill="#fff" ${ln()}/>${pleats}${hatBand('#fff')}`,
    'hat-bunny':()=>`<path d="M188 100C178 72 180 50 192 50C204 50 206 76 201 100Z" fill="#fff" ${ln()}/><path d="M191 94C186 76 188 62 192 62C197 62 198 78 196 94Z" fill="#f8b9c6"/>
      <path d="M212 98C214 72 228 54 239 58C249 62 237 86 224 102Z" fill="#fff" ${ln()}/><path d="M218 94C221 76 229 66 234 67C239 69 231 84 223 96Z" fill="#f8b9c6"/>
      <path d="${CHEF_HAT_PUFF}" fill="#fff" ${ln()}/>${pleats}${hatBand('#fcd5de',`<path d="M226 136l10-7v14ZM226 136l-10-7v14Z" fill="#f28ca3" ${ln(1.6)}/><circle cx="226" cy="136" r="3" fill="#f28ca3" ${ln(1.4)}/>`)}`,
    'hat-crown':()=>`<path d="M174 140L170 106L189 121L205 96L221 121L240 106L236 140Z" fill="#ffd45c" ${ln(2.4,'#b07d24')}/><rect x="173" y="128" width="64" height="12" rx="3" fill="#f4b93a" ${ln(2,'#b07d24')}/>
      <circle cx="205" cy="134" r="4" fill="#e8574f"/><circle cx="187" cy="134" r="3" fill="#6fb7e8"/><circle cx="223" cy="134" r="3" fill="#7ccf8a"/>
      <circle cx="170" cy="105" r="4" fill="#fff2b0" ${ln(1.6,'#b07d24')}/><circle cx="205" cy="95" r="4.5" fill="#fff2b0" ${ln(1.6,'#b07d24')}/><circle cx="240" cy="105" r="4" fill="#fff2b0" ${ln(1.6,'#b07d24')}/>`,
    'hat-bear':()=>`<circle cx="180" cy="92" r="12" fill="#f2c06b" ${ln()}/><circle cx="180" cy="92" r="6" fill="#fbe0a8"/><circle cx="230" cy="92" r="12" fill="#f2c06b" ${ln()}/><circle cx="230" cy="92" r="6" fill="#fbe0a8"/>
      <path d="${CHEF_HAT_PUFF}" fill="#fff8ec" ${ln()}/>${hatBand('#f2c06b',`<g fill="#8a5a3b"><ellipse cx="205" cy="139" rx="4.5" ry="3.5"/><circle cx="199" cy="133" r="1.8"/><circle cx="205" cy="131" r="1.8"/><circle cx="211" cy="133" r="1.8"/></g>`)}`,
    'hat-strawberry':()=>`<path d="M162 148C156 110 182 90 205 90C228 90 254 110 248 148Q205 158 162 148Z" fill="#ee5b5b" ${ln()}/>
      <g fill="#ffe28a">${[[180,114],[198,104],[218,106],[234,120],[188,132],[208,124],[226,138],[172,138],[244,140],[200,142]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="2" ry="3"/>`).join('')}</g>
      <polygon points="${star(205,92,17,7)}" fill="#6fb35a" ${ln(2)}/><path d="M205 84Q206 74 212 70" fill="none" ${ln(3,'#5c9448')}/>`,
    'hat-flower':()=>`<path d="M162 152Q205 118 248 152" fill="none" ${ln(5,'#6fa35a')}/><g fill="#8cc473"><ellipse cx="174" cy="138" rx="6" ry="3" transform="rotate(-40 174 138)"/><ellipse cx="236" cy="138" rx="6" ry="3" transform="rotate(40 236 138)"/><ellipse cx="195" cy="128" rx="6" ry="3" transform="rotate(-15 195 128)"/><ellipse cx="216" cy="128" rx="6" ry="3" transform="rotate(15 216 128)"/></g>
      ${flower(166,148,9,'#f7a1b5')}${flower(185,133,9,'#fff')}${flower(205,127,11,'#ffd35a','#f28c5b')}${flower(225,133,9,'#c3a6ea')}${flower(244,148,9,'#f7a1b5')}`,
    'hat-party':u=>`<defs><clipPath id="${u}pc"><path d="M178 140L213 64L238 134Z"/></clipPath></defs><path d="M178 140L213 64L238 134Z" fill="#8fd0e8"/>
      <g clip-path="url(#${u}pc)" fill="#fff" opacity=".85"><path d="M170 112L250 94V102L170 120ZM170 132L250 114V122L170 140Z"/></g><g clip-path="url(#${u}pc)"><circle cx="210" cy="92" r="3" fill="#f28ca3"/><circle cx="200" cy="126" r="3" fill="#ffd35a"/><circle cx="222" cy="112" r="3" fill="#f28ca3"/></g>
      <path d="M178 140L213 64L238 134Z" fill="none" ${ln()}/><path d="M176 140q7-8 13-1t12-2 13-2 12-2 13-3" fill="none" ${ln(3,'#ffd35a')}/><circle cx="213" cy="63" r="9" fill="#ffd35a" ${ln(2)}/>`
  };
  function chef(hat,apron,u){
    return `<g transform="translate(7 0)">
      <ellipse cx="205" cy="338" rx="49" ry="8" fill="url(#${u}ground)"/>
      <image href="${ART}bear-gouache.webp" x="130" y="127" width="150" height="225"/>
      <g transform="translate(0 9) translate(205 270) scale(.88 .81) translate(-205 -270)" filter="url(#${u}soft)">${finish((APRON[apron]||APRON['apron-white'])(u),u)}
        <path d="M179 271q-4 22-1 38M232 271q4 22 1 38" fill="none" stroke="#907654" stroke-width="1" opacity=".16"/>
        <path d="M193 284q12 4 24 0" fill="none" stroke="#fff" stroke-width="1.2" opacity=".75"/>
      </g>
      <g transform="translate(205 146) scale(1.12 .85) translate(-205 -146)" filter="url(#${u}soft)">${finish((HAT[hat]||HAT['hat-white'])(u),u)}</g>
    </g>`;
  }

  // ---------- Tables ----------
  function clothTable(fill,top,extra=''){
    let hem='M324 262L328 304';for(let i=0;i<4;i++)hem+='q26 12 52 0';
    return `<rect x="421" y="300" width="18" height="34" fill="#a8744a" ${ln(2)}/><ellipse cx="430" cy="336" rx="34" ry="6" fill="#8f5f3c" ${ln(2)}/>
      <path d="${hem}L536 262Z" fill="${fill}" ${ln()}/><path d="M376 276L378 310M430 280V314M484 276L482 310" fill="none" ${ln(1.6,'#000')} opacity=".12"/>
      ${extra}<ellipse cx="430" cy="262" rx="106" ry="22" fill="${fill}" ${ln()}/>${top}`;
  }
  const TABLE={
    'table-wood':()=>`<image href="${ART}table-gouache.webp" x="316" y="216" width="228" height="137"/>`,
    'table-flower':u=>`<defs>${pattern(`${u}tc`,28,28,`<rect width="28" height="28" fill="#ffe39c"/>${flower(7,7,4,'#fff','#f7b267')}${flower(21,21,4,'#fff','#f7b267')}`)}</defs>`+clothTable(`url(#${u}tc)`,
      `<path d="M430 236L414 212M430 236V202M430 236L446 214" fill="none" ${ln(2.4,'#6fa35a')}/>${flower(414,210,9,'#f7a1b5')}${flower(430,200,10,'#ff8f70')}${flower(446,212,9,'#c3a6ea')}
      <path d="M420 262C412 250 414 240 424 236H436C446 240 448 250 440 262Z" fill="#7fc4d8" ${ln(2)}/>`),
    'table-ocean':u=>`<defs>${pattern(`${u}tc`,24,24,'<rect width="24" height="24" fill="#a8dbe6"/><circle cx="6" cy="6" r="2" fill="#d4f0f5"/><circle cx="18" cy="16" r="3" fill="#d4f0f5"/>')}</defs>`+clothTable(`url(#${u}tc)`,
      `<path d="M390 264Q403 236 416 264Z" fill="#ffc2b0" ${ln(2)}/><path d="M403 262V244M396 262L399 248M410 262L407 248" fill="none" ${ln(1.4)}/>
      <polygon points="${star(456,254,12,5.5)}" fill="#ffa45c" ${ln(2)}/><circle cx="430" cy="258" r="4" fill="#fff" ${ln(1.4)}/>`,
      `<path d="M334 296q12-6 24 0t24 0 24 0 24 0 24 0 24 0 24 0 24 0" fill="none" ${ln(3,'#fff')} opacity=".85"/>`),
    'table-picnic':u=>`<defs>${gingham(`${u}tc`,'#e25a50',18)}</defs>`+clothTable(`url(#${u}tc)`,
      `<path d="M411 248Q430 218 449 248" fill="none" ${ln(4,'#b77a3c')}/><ellipse cx="444" cy="240" rx="15" ry="5" transform="rotate(-25 444 240)" fill="#eab26b" ${ln(1.8)}/><circle cx="419" cy="242" r="8" fill="#e8574f" ${ln(1.8)}/>
      <path d="M406 246H454L447 268H413Z" fill="#d69b58" ${ln(2)}/><path d="M410 254H450M412 261H448M422 246L420 268M438 246L440 268" fill="none" ${ln(1.4,'#a8703b')}/>`),
    'table-candy':u=>`<defs>${pattern(`${u}tc`,24,24,`<rect width="24" height="24" fill="#fbcad6"/>${heart(6,6,.35,'#fff')}${heart(18,18,.35,'#f6a9bb')}`)}</defs>`+clothTable(`url(#${u}tc)`,
      `<rect x="426" y="252" width="8" height="10" fill="#fff" ${ln(1.6)}/><ellipse cx="430" cy="262" rx="18" ry="4" fill="#fff" ${ln(1.6)}/><ellipse cx="430" cy="252" rx="30" ry="6" fill="#fff" ${ln(2)}/>
      <rect x="412" y="226" width="36" height="24" rx="4" fill="#fff0f3" ${ln(2)}/><path d="M412 232H448V236Q444 242 440 236Q436 244 430 236Q424 242 420 236Q416 242 412 236Z" fill="#f59ab3"/>
      <circle cx="430" cy="222" r="6" fill="#e8574f" ${ln(1.6)}/><path d="M430 216l-2-4M430 216l3-3" fill="none" ${ln(1.6,'#5c9448')}/>`,
      `<g fill="#fff">${[0,1,2,3,4,5,6,7,8].map(i=>`<circle cx="${334+i*24.5}" cy="301" r="4.5"/>`).join('')}</g>`),
    'table-star':u=>`<defs>${pattern(`${u}tc`,30,30,`<rect width="30" height="30" fill="#40508f"/><polygon points="${star(8,8,4.5)}" fill="#ffe27a"/><circle cx="22" cy="22" r="1.8" fill="#dbe3ff"/>`)}</defs>`+clothTable(`url(#${u}tc)`,
      `<circle cx="430" cy="214" r="18" fill="#ffe8a0" opacity=".35" class="cafe-glow"/><rect x="424" y="228" width="12" height="28" rx="2" fill="#fff6e8" ${ln(2)}/>
      <path class="cafe-flame" d="M430 210q8 9 0 16q-8-7 0-16Z" fill="#ffb13d"/><ellipse cx="430" cy="258" rx="16" ry="5" fill="#f3c25e" ${ln(2)}/>`)
  };
  for(const id of ['table-flower','table-picnic','table-star','table-ocean','table-candy'])TABLE[id]=()=>`<image href="${ART}${id}-gouache.webp" x="316" y="216" width="228" height="137"/>`;

  // ---------- Chairs (drawn at centre x) ----------
  const legs=(cx,color)=>`<rect x="${cx-26}" y="296" width="7" height="42" rx="2" fill="${color}" ${ln(2)}/><rect x="${cx+19}" y="296" width="7" height="42" rx="2" fill="${color}" ${ln(2)}/>`;
  const seat=(cx,color)=>`<rect x="${cx-32}" y="288" width="64" height="12" rx="5" fill="${color}" ${ln()}/>`;
  const face=(cx,y,nose='#4a3326')=>`<circle cx="${cx-9}" cy="${y}" r="3" fill="#3b2a20"/><circle cx="${cx+9}" cy="${y}" r="3" fill="#3b2a20"/><ellipse cx="${cx}" cy="${y+7}" rx="3.5" ry="2.5" fill="${nose}"/><path d="M${cx-4} ${y+11}q4 3 8 0" fill="none" ${ln(1.6,'#4a3326')}/>`;
  const CHAIR={
    'chair-wood':cx=>`<image href="${ART}chair-gouache.webp" x="${cx-50}" y="201" width="100" height="146"/>`,
    'chair-panda':cx=>legs(cx,'#3b3b3b')+`<rect x="${cx-9}" y="270" width="18" height="22" fill="#3b3b3b"/>
      <circle cx="${cx-24}" cy="224" r="10" fill="#3b3b3b" ${ln(2)}/><circle cx="${cx+24}" cy="224" r="10" fill="#3b3b3b" ${ln(2)}/><circle cx="${cx}" cy="248" r="31" fill="#fff" ${ln()}/>
      <ellipse cx="${cx-11}" cy="245" rx="7" ry="9.5" transform="rotate(20 ${cx-11} 245)" fill="#3b3b3b"/><ellipse cx="${cx+11}" cy="245" rx="7" ry="9.5" transform="rotate(-20 ${cx+11} 245)" fill="#3b3b3b"/>
      <circle cx="${cx-10}" cy="244" r="2.4" fill="#fff"/><circle cx="${cx+10}" cy="244" r="2.4" fill="#fff"/><ellipse cx="${cx}" cy="256" rx="4" ry="3" fill="#3b3b3b"/><ellipse cx="${cx-19}" cy="260" rx="5" ry="3" fill="#f7b6c2" opacity=".7"/><ellipse cx="${cx+19}" cy="260" rx="5" ry="3" fill="#f7b6c2" opacity=".7"/>`+seat(cx,'#fff'),
    'chair-bunny':cx=>legs(cx,'#fff')+`<ellipse cx="${cx-12}" cy="206" rx="8" ry="24" transform="rotate(-8 ${cx-12} 206)" fill="#fbd3dc" ${ln()}/><ellipse cx="${cx-12}" cy="208" rx="3.5" ry="16" transform="rotate(-8 ${cx-12} 208)" fill="#f59ab3"/>
      <ellipse cx="${cx+12}" cy="206" rx="8" ry="24" transform="rotate(8 ${cx+12} 206)" fill="#fbd3dc" ${ln()}/><ellipse cx="${cx+12}" cy="208" rx="3.5" ry="16" transform="rotate(8 ${cx+12} 208)" fill="#f59ab3"/>
      <rect x="${cx-28}" y="224" width="56" height="66" rx="26" fill="#fbd3dc" ${ln()}/>${face(cx,248,'#f28ca3')}`+seat(cx,'#f7b6c6'),
    'chair-cat':cx=>legs(cx,'#d68c45')+`<path d="M${cx-28} 236L${cx-26} 206L${cx-8} 224ZM${cx+28} 236L${cx+26} 206L${cx+8} 224Z" fill="#f5b36b" ${ln()}/>
      <rect x="${cx-29}" y="220" width="58" height="70" rx="22" fill="#f5b36b" ${ln()}/><path d="M${cx-6} 226v8M${cx} 224v10M${cx+6} 226v8" fill="none" ${ln(2.4,'#d68c45')}/>${face(cx,248,'#f28ca3')}
      <path d="M${cx-12} 256H${cx-24}M${cx-12} 260L${cx-23} 264M${cx+12} 256H${cx+24}M${cx+12} 260L${cx+23} 264" fill="none" ${ln(1.4)}/>`+seat(cx,'#f5b36b'),
    'chair-mushroom':cx=>`<path d="M${cx-3} 330q-6 -8 -2 -14M${cx+26} 336q2-8 7-11" fill="none" ${ln(2.4,'#7fb069')}/><path d="M${cx-15} 296H${cx+15}L${cx+18} 336Q${cx} 342 ${cx-18} 336Z" fill="#fff3dd" ${ln()}/>
      <path d="M${cx-40} 298Q${cx-40} 258 ${cx} 256Q${cx+40} 258 ${cx+40} 298Q${cx} 306 ${cx-40} 298Z" fill="#e8574f" ${ln()}/>
      <g fill="#fff"><circle cx="${cx-20}" cy="280" r="6"/><circle cx="${cx+4}" cy="270" r="7"/><circle cx="${cx+24}" cy="286" r="5"/><circle cx="${cx-4}" cy="292" r="3.5"/></g>`,
    'chair-sofa':cx=>`<rect x="${cx-26}" y="316" width="7" height="22" rx="2" fill="#b8795a" ${ln(2)}/><rect x="${cx+19}" y="316" width="7" height="22" rx="2" fill="#b8795a" ${ln(2)}/>
      <path d="M${cx-10} 220l-7-9 11 3 6-8 6 8 11-3-7 9Z" fill="#6fb35a" ${ln(2)}/><rect x="${cx-31}" y="218" width="62" height="74" rx="22" fill="#f48fa4" ${ln()}/>
      <g fill="#ffe28a">${[[-14,236],[4,232],[18,246],[-6,252],[12,262],[-18,262]].map(([x,y])=>`<ellipse cx="${cx+x}" cy="${y}" rx="1.8" ry="2.8"/>`).join('')}</g>
      <rect x="${cx-39}" y="264" width="16" height="52" rx="8" fill="#f27a93" ${ln()}/><rect x="${cx+23}" y="264" width="16" height="52" rx="8" fill="#f27a93" ${ln()}/>
      <rect x="${cx-25}" y="286" width="50" height="30" rx="9" fill="#f9b4c3" ${ln()}/>`
  };
  for(const id of ['chair-bunny','chair-panda','chair-cat','chair-sofa'])CHAIR[id]=cx=>`<image href="${ART}${id}-gouache.webp" x="${cx-50}" y="201" width="100" height="146"/>`;
  CHAIR['chair-mushroom']=cx=>`<image href="${ART}chair-mushroom-gouache.webp" x="${cx-45}" y="257" width="90" height="90"/>`;
  VIEW['view-night']=()=>`<image href="${ART}night-gouache.webp" x="28" y="94" width="134" height="138" preserveAspectRatio="xMidYMid slice"/>`;

  // ---------- Room props (each placed in its own corner) ----------
  const ROOM={
    'room-window':{box:[22,226,120,118],draw:()=>`<path d="M54 250L36 338M106 250L124 338M80 250V338" fill="none" ${ln(6,'#a8744a')}/>
      <rect x="34" y="236" width="92" height="68" rx="6" fill="#3f5f4f" ${ln(6,'#b27a4b')}/><text x="80" y="256" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="Microsoft YaHei,PingFang SC,sans-serif">今日菜单</text>
      <path d="M48 276q13 12 26 0Z" fill="none" ${ln(2,'#fff')}/><path d="M56 270q-3-4 0-8M64 270q-3-4 0-8" fill="none" ${ln(1.6,'#fff')}/><path d="M86 266h26M86 276h20M86 286h24" fill="none" ${ln(2,'#fff')} opacity=".8"/>
      <polygon points="${star(64,292,5)}" fill="#ffe27a"/><rect x="38" y="304" width="84" height="5" rx="2" fill="#a8744a"/>`},
    'room-sprout':{box:[24,187,112,160],draw:()=>`<image href="${ART}plant-gouache.webp" x="28" y="192" width="105" height="151"/>`},
    'room-lamp':{box:[84,160,86,72],draw:()=>`<circle cx="126" cy="196" r="30" fill="#ffe27a" opacity=".35" class="cafe-glow"/><rect x="116" y="211" width="20" height="11" rx="3" fill="#c9966a" ${ln(2)}/>
      <polygon points="${star(126,194,18,9)}" fill="#ffe27a" ${ln(2.2,'#d19a2e')}/><circle cx="121" cy="193" r="1.8" fill="#6d4a35"/><circle cx="131" cy="193" r="1.8" fill="#6d4a35"/><path d="M122 199q4 3 8 0" fill="none" ${ln(1.4)}/>`},
    'room-rainbow':{box:[544,52,96,90],draw:()=>`<path d="M570 76L592 60L614 76" fill="none" ${ln(1.8,'#8a5a3b')}/><circle cx="592" cy="60" r="2.4" fill="#8a5a3b"/>
      <rect x="554" y="74" width="76" height="58" rx="4" fill="#fffaf0" ${ln(5,'#c98f5d')}/>
      ${[['#f59a9a',26],['#f8c27a',21],['#fbe38a',16],['#a6dc98',11],['#8fcbef',6]].map(([c,r])=>`<path d="M${592-r} 122A${r} ${r} 0 0 1 ${592+r} 122" fill="none" stroke="${c}" stroke-width="5"/>`).join('')}
      <g fill="#fff" ${ln(1.4)}><ellipse cx="566" cy="122" rx="9" ry="5"/><ellipse cx="618" cy="122" rx="9" ry="5"/></g>`},
    'room-fishbowl':{box:[28,226,104,118],draw:()=>`<rect x="52" y="300" width="6" height="38" fill="#a8744a" ${ln(2)}/><rect x="102" y="300" width="6" height="38" fill="#a8744a" ${ln(2)}/><rect x="44" y="292" width="72" height="9" rx="3" fill="#c98f5d" ${ln(2)}/>
      <path d="M60 238H100C120 250 120 284 98 292H62C40 284 40 250 60 238Z" fill="#e3f5fa" ${ln()}/><path d="M48 252H112C116 266 112 284 98 290H62C48 284 44 266 48 252Z" fill="#9fd8ea" opacity=".8"/>
      <path d="M66 290q-4-14 2-24M92 290q4-10 0-18" fill="none" ${ln(2.6,'#6cae5e')}/><g class="cafe-fish"><ellipse cx="80" cy="270" rx="10" ry="7" fill="#ff8a4c" ${ln(1.8)}/><path d="M70 270l-9-6v12Z" fill="#ff8a4c" ${ln(1.8)}/><circle cx="85" cy="268" r="1.6" fill="#3b2a20"/></g>
      <g fill="none" ${ln(1.4,'#fff')}><circle cx="92" cy="258" r="2.5"/><circle cx="96" cy="248" r="1.8"/></g><rect x="56" y="234" width="48" height="6" rx="3" fill="#e3f5fa" ${ln(2)}/>`},
    'room-clock':{box:[544,54,96,146],draw:()=>`<g class="cafe-pendulum"><path d="M592 146V184" fill="none" ${ln(2,'#8a5a3b')}/><circle cx="592" cy="188" r="7" fill="#f3c25e" ${ln(2)}/></g>
      <path d="M576 146V174M608 146V166" fill="none" ${ln(1.4,'#8a5a3b')}/><ellipse cx="576" cy="180" rx="4" ry="7" fill="#a8744a" ${ln(1.6)}/><ellipse cx="608" cy="172" rx="4" ry="7" fill="#a8744a" ${ln(1.6)}/>
      <rect x="562" y="92" width="60" height="56" rx="5" fill="#c98f5d" ${ln()}/><path d="M552 98L592 62L632 98Z" fill="#b0603f" ${ln()}/>
      <rect x="585" y="72" width="14" height="14" rx="3" fill="#5a3b28"/><circle cx="592" cy="80" r="4.5" fill="#ffd45c"/><path d="M596 80l3 1-3 1" fill="#f28c5b"/>
      <circle cx="592" cy="120" r="17" fill="#fffaf0" ${ln()}/><path d="M592 106v3M592 131v3M578 120h3M603 120h3M592 120V110M592 120l7 4" fill="none" ${ln(2)}/>`},
    'room-balloon':{box:[552,72,88,272],draw:()=>`<path d="M592 122Q598 200 604 332M618 136Q610 220 604 332M576 154Q594 240 604 332" fill="none" ${ln(1.4,'#8a7060')}/>
      <g class="cafe-sway"><ellipse cx="592" cy="100" rx="17" ry="21" fill="#ef6f6c" ${ln(2)}/><ellipse cx="618" cy="116" rx="14" ry="18" fill="#ffd45c" ${ln(2)}/><ellipse cx="576" cy="134" rx="14" ry="18" fill="#7cc3e8" ${ln(2)}/>
      <g fill="#fff" opacity=".7"><ellipse cx="585" cy="92" rx="4" ry="7" transform="rotate(20 585 92)"/><ellipse cx="612" cy="110" rx="3" ry="5" transform="rotate(20 612 110)"/><ellipse cx="570" cy="128" rx="3" ry="5" transform="rotate(20 570 128)"/></g></g>
      <path d="M596 324h16v14h-16Z" fill="#f3a0b5" ${ln(1.8)}/><path d="M604 324l-6-6M604 324l6-6" fill="none" ${ln(1.8,'#e2718d')}/>`}
  };

  // ---------- Fixed room parts ----------
  function shell(){
    let wainscot='<rect y="246" width="640" height="56" fill="#a9b59b"/><rect y="243" width="640" height="6" fill="#c8d0b9"/><rect y="250" width="640" height="2" fill="#7e9279" opacity=".5"/>';
    for(let x=12;x<640;x+=46)wainscot+=`<path d="M${x} 254v46" stroke="#8d9f85" stroke-width="1"/><path d="M${x+2} 254v46" stroke="#d9dfca" stroke-width="1" opacity=".45"/>`;
    let floor='<rect y="300" width="640" height="80" fill="#d8bf9b"/><path d="M0 323H640M0 350H640M0 377H640" stroke="#b79c78" stroke-width="1" opacity=".45"/>';
    for(let row=0;row<3;row++)for(let x=-180+row*66;x<800;x+=160)floor+=`<path d="M${x} ${300+row*26}l-12 26m28-17h85" fill="none" stroke="#ad8e68" stroke-width=".65" opacity=".28"/>`;
    floor+='<rect y="296" width="640" height="6" fill="#869678"/><rect y="302" width="640" height="5" fill="#604f37" opacity=".08"/>';
    return {wainscot,floor,rug:`<ellipse cx="425" cy="336" rx="169" ry="29" fill="#b59b77" opacity=".18"/><ellipse cx="425" cy="333" rx="164" ry="26" fill="#eae2c9"/>
      ${[0,1,2,3].map(i=>`<ellipse cx="425" cy="333" rx="${153-i*9}" ry="${22-i*3}" fill="none" stroke="${i%2?'#d6cbae':'#c2ba9c'}" stroke-width="1.3"/>`).join('')}`};
  }
  function greenery(x,y,flip=1){
    return `<g transform="translate(${x} ${y}) scale(${flip} 1)"><path d="M0 0q18 17 39 18t28 25M17 13q-5 20 9 33" fill="none" stroke="#8c9e73" stroke-width="1.5"/>
      ${[[4,4,-40],[14,12,40],[27,16,-30],[40,21,50],[52,27,-30],[60,37,45],[17,27,-40],[23,39,40]].map(([a,b,r],i)=>`<ellipse cx="${a}" cy="${b}" rx="10" ry="4.5" transform="rotate(${r} ${a} ${b})" fill="${i%2?'#a8b78b':'#829972'}"/>`).join('')}</g>`;
  }
  const sign=`<path d="M350 31v24m144-24v24" stroke="#a18b65" stroke-width="1.2"/>
    <rect x="327" y="49" width="189" height="66" rx="30" fill="#857254" opacity=".12"/>
    <rect x="327" y="46" width="189" height="66" rx="30" fill="#fcf8ec" stroke="#d4c5a8" stroke-width="1.5"/>
    <rect x="334" y="52" width="175" height="54" rx="25" fill="none" stroke="#dfd6bd" stroke-width=".8"/>
    <text x="423" y="81" text-anchor="middle" font-size="20" font-weight="700" fill="#596e54" letter-spacing="3" font-family="Microsoft YaHei,PingFang SC,sans-serif">森林小食堂</text>
    <text x="423" y="98" text-anchor="middle" font-size="7" fill="#a28b65" letter-spacing="2.5" font-family="Georgia,serif">MADE WITH LOVE</text>`;
  function pantry(u){
    return `<g opacity=".94">
      <path d="M362 167v-25q0-7 7-7h20q7 0 7 7v25Z" fill="#d9dfc7" stroke="#b0bba0" stroke-width="1"/><rect x="361" y="132" width="36" height="6" rx="2" fill="#c5ab83"/>
      <g fill="#d3ae74">${[0,1,2,3,4].map(i=>`<circle cx="${369+i*4.6}" cy="${153+i%2*6}" r="5"/>`).join('')}</g><rect x="369" y="144" width="19" height="10" rx="3" fill="#faf4e2"/>
      <path d="M418 168v-34q0-7 7-7h17q7 0 7 7v34Z" fill="#e9dfcc"/><rect x="417" y="125" width="33" height="6" rx="2" fill="#b79a73"/><path d="M422 159q11-7 23 0" fill="none" stroke="#bca27f" stroke-width="2"/>
      <path d="M480 149h24v12q-12 8-24 0Z" fill="#b9c5a9"/><path d="M504 151q10-2 7 6q-2 5-7 1" fill="none" stroke="#a3b293" stroke-width="2.3"/>
      <path d="M529 149h24v12q-12 8-24 0Z" fill="#edd0b7"/><path d="M553 151q10-2 7 6q-2 5-7 1" fill="none" stroke="#d8b899" stroke-width="2.3"/>
      <rect x="347" y="168" width="225" height="7" rx="3" fill="url(#${u}wood)"/><path d="M359 175v9h15m178-9v9h-15" fill="none" stroke="#ad9470" stroke-width="3"/>
    </g>`;
  }
  function windowFrame(u,view){
    return `<defs><clipPath id="${u}win"><path d="${WIN}"/></clipPath></defs><g clip-path="url(#${u}win)">${(VIEW[view]||VIEW['view-day'])(u)}</g>
      <path d="${WIN}" fill="none" stroke="#c0b49a" stroke-width="15" stroke-linejoin="round"/><path d="${WIN}" fill="none" stroke="#fdf9ec" stroke-width="10" stroke-linejoin="round"/>
      <path d="${WIN}" fill="none" stroke="#d7ddc7" stroke-width="1.5"/>
      <path d="M94 105V224M34 174H154" stroke="#6c8067" stroke-width="4"/><path d="M93 105V224M34 172H154" stroke="#e8eadb" stroke-width="2.5"/>
      <rect x="22" y="225" width="144" height="9" rx="3" fill="#b9a487"/><rect x="19" y="222" width="150" height="6" rx="3" fill="#f8f0df"/>
      <path d="M42 151l25-23m-20 33 31-31" stroke="#fff" stroke-width="5" opacity=".12"/>`;
  }

  const svg=(box,body,cls='cafe-art')=>`<svg class="${cls}" viewBox="${box.join(' ')}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${body}</svg>`;
  const pick=(equipped,slot,fallback)=>equipped[slot]||fallback;

  function scene(equipped,placements,changed=''){
    const u=`ca${++uid}-`,parts=shell(),chair=CHAIR[pick(equipped,'chair','chair-wood')]||CHAIR['chair-wood'];
    const legacy=D.decorations.find(d=>d.id===pick(equipped,'room','room-window'));
    const props=placements||{[legacy?.position||'floor']:legacy?.id||'room-window'};
    const layer=(id,markup)=>`<g class="cafe-piece ${changed===id?'cafe-piece-changed':''}" data-piece="${id}">${markup}</g>`;
    const propLayers=front=>Object.entries(props).filter(([pos,id])=>id&&ROOM[id]&&(pos==='floor')===front).map(([,id])=>layer(id,finish(ROOM[id].draw(u),u))).join('');
    return svg([0,0,640,380],`${materials(u)}<defs>
      <radialGradient id="${u}light" cx=".16" cy=".25" r=".85"><stop stop-color="#fffdf0" stop-opacity=".68"/><stop offset="1" stop-color="#fffdf0" stop-opacity="0"/></radialGradient>
      <linearGradient id="${u}sun" x2="1" y2="1"><stop stop-color="#fff5cc" stop-opacity=".5"/><stop offset="1" stop-color="#fff5cc" stop-opacity="0"/></linearGradient>
      </defs>${(WALL[pick(equipped,'wall','wall-cream')]||WALL['wall-cream'])(u)}${parts.wainscot}${parts.floor}
      <rect width="640" height="380" fill="url(#${u}light)"/>
      <path d="M0 0h640v15H0Z" fill="#8e9f7e"/><path d="M0 16h640v5H0Z" fill="#d9dfc7"/><path d="M0 22h640" stroke="#fff9e8" stroke-width="3"/>
      ${greenery(8,25)}${greenery(620,24,-1)}${greenery(560,18,-1)}${sign}${pantry(u)}
      <g transform="translate(14 -48) scale(1.2)" filter="url(#${u}soft)">${windowFrame(u,pick(equipped,'view','view-day'))}</g>
      <path d="M54 211l136 17 220 137H157Z" fill="url(#${u}sun)"/>
      ${parts.rug}<ellipse cx="432" cy="330" rx="141" ry="23" fill="url(#${u}ground)"/>
      <g filter="url(#${u}soft)">${propLayers(false)}${layer(equipped.chair,finish(chair(302)+chair(564),u))}</g>
      ${layer(changed===equipped.apron?equipped.apron:equipped.hat,chef(pick(equipped,'hat','hat-white'),pick(equipped,'apron','apron-white'),u))}
      <g filter="url(#${u}soft)">${layer(equipped.table,finish((TABLE[pick(equipped,'table','table-wood')]||TABLE['table-wood'])(u),u))}${propLayers(true)}</g>
      <rect width="640" height="380" filter="url(#${u}paper)" opacity=".045" style="mix-blend-mode:multiply" pointer-events="none"/>
      <g fill="#fffdf2" opacity=".7" class="cafe-sun-dust"><circle cx="257" cy="126" r="1.4"/><circle cx="289" cy="173" r="1"/><circle cx="130" cy="81" r="1.2"/></g>`,'cafe-art cafe-scene-art');
  }
  // A small picture of one decoration, shown in the decoration book and gift cards.
  function thumb(id,slot){
    const u=`ct${++uid}-`,draw=(box,markup)=>svg(box,materials(u)+finish(markup,u),'cafe-art cafe-thumb');
    if(slot==='hat')return draw([130,48,165,216],chef(id,'apron-white',u));
    if(slot==='apron')return draw([130,84,165,271],chef('hat-white',id,u));
    if(slot==='table')return draw([308,190,244,168],(TABLE[id]||TABLE['table-wood'])(u));
    if(slot==='chair')return draw(id==='chair-mushroom'?[250,253,100,97]:[248,177,104,170],(CHAIR[id]||CHAIR['chair-wood'])(300));
    if(slot==='wall')return draw([20,120,160,150],`${(WALL[id]||WALL['wall-cream'])(u)}${shell().wainscot}`);
    if(slot==='view')return draw([16,94,156,145],windowFrame(u,id));
    const room=ROOM[id]||ROOM['room-window'];
    return draw(room.box,room.draw(u));
  }
  const api={scene,thumb};
  root.RestaurantArt=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);
