(function(root){
  'use strict';
  // Hand-drawn SVG restaurant. Every decoration is drawn in the same 640×380 scene
  // coordinates, so hats sit on the chef's head and props fit their own corner.
  // Thumbnails reuse the same drawing and only crop the view box.
  const INK='#6d4a35';
  const ln=(w=2.4,c=INK)=>`stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
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

  // ---------- Walls ----------
  function wallFill(u,base,body){return `<defs>${pattern(`${u}w`,body[0],body[1],`<rect width="${body[0]}" height="${body[1]}" fill="${base}"/>${body[2]}`)}</defs><rect width="640" height="252" fill="url(#${u}w)"/>`;}
  const WALL={
    'wall-cream':u=>wallFill(u,'#fbedd5',[40,40,'<rect width="20" height="40" fill="#f6e2c4"/>']),
    'wall-mint':u=>wallFill(u,'#e4f4e8',[36,36,'<rect width="18" height="36" fill="#cdeadb"/><rect x="26" width="2" height="36" fill="#fff" opacity=".7"/>']),
    'wall-heart':u=>wallFill(u,'#fde7e4',[48,48,heart(12,12,.7,'#f6bcc3')+heart(36,36,.7,'#f9ccd2')+'<circle cx="36" cy="12" r="2" fill="#fff"/><circle cx="12" cy="36" r="2" fill="#fff"/>']),
    'wall-star':u=>wallFill(u,'#dde5fb',[60,60,`<polygon points="${star(15,15,7)}" fill="#fff0a8"/><polygon points="${star(45,43,5)}" fill="#fff6c9"/><circle cx="44" cy="12" r="2" fill="#c3cff5"/><circle cx="14" cy="46" r="2.5" fill="#c3cff5"/>`]),
    'wall-leaf':u=>wallFill(u,'#eaf4df',[56,56,'<ellipse cx="14" cy="16" rx="9" ry="4.5" transform="rotate(-35 14 16)" fill="#c6e1aa"/><ellipse cx="42" cy="42" rx="9" ry="4.5" transform="rotate(30 42 42)" fill="#b7d99b"/><circle cx="42" cy="14" r="2.5" fill="#f6c9a4"/><circle cx="14" cy="44" r="2" fill="#fff"/>'])
  };

  // ---------- Window views (clipped to the arched window) ----------
  const WIN='M34 226V152A60 48 0 0 1 154 152V226Z';
  const sky=(u,top,bottom)=>`<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect x="28" y="98" width="134" height="134" fill="url(#${u}s)"/>`;
  const VIEW={
    'view-day':u=>sky(u,'#b9e0f5','#e6f5fb')+`<circle cx="128" cy="130" r="13" fill="#ffd45c"/><g fill="#fff"><ellipse cx="64" cy="134" rx="17" ry="8"/><ellipse cx="76" cy="128" rx="11" ry="9"/></g>
      <path d="M28 196Q66 168 104 190T162 182V232H28Z" fill="#a8d68f"/><path d="M28 210Q92 188 162 206V232H28Z" fill="#86c27a"/>
      <rect x="57" y="178" width="7" height="22" fill="#8a5a3b"/><circle cx="60" cy="172" r="14" fill="#6cae5e"/><circle cx="126" cy="186" r="9" fill="#5f9f55"/>`,
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
    const fur='#c48a58';
    return `<g transform="translate(7 0)">
      <ellipse cx="205" cy="339" rx="56" ry="7" fill="${INK}" opacity=".13"/>
      <ellipse cx="183" cy="330" rx="19" ry="10" fill="#a96f45" ${ln()}/><ellipse cx="227" cy="330" rx="19" ry="10" fill="#a96f45" ${ln()}/>
      <path d="M162 320C156 272 166 226 205 222C244 226 254 272 248 320Q205 334 162 320Z" fill="${fur}" ${ln()}/>
      ${(APRON[apron]||APRON['apron-white'])(u)}
      <ellipse cx="159" cy="262" rx="13" ry="25" transform="rotate(22 159 262)" fill="${fur}" ${ln()}/>
      <g class="cafe-wave"><ellipse cx="256" cy="242" rx="13" ry="25" transform="rotate(-38 256 242)" fill="${fur}" ${ln()}/><circle cx="268" cy="226" r="5" fill="#eeb49c"/></g>
      <circle cx="167" cy="144" r="15" fill="${fur}" ${ln()}/><circle cx="167" cy="144" r="7.5" fill="#eeb49c"/>
      <circle cx="243" cy="144" r="15" fill="${fur}" ${ln()}/><circle cx="243" cy="144" r="7.5" fill="#eeb49c"/>
      <circle cx="205" cy="180" r="44" fill="${fur}" ${ln()}/>
      <ellipse cx="205" cy="197" rx="20" ry="14" fill="#f3d9b8"/><ellipse cx="205" cy="189" rx="7" ry="5" fill="#4a3326"/>
      <path d="M205 194V199M198 200Q205 206 212 200" fill="none" ${ln(2.2,'#4a3326')}/>
      <circle cx="187" cy="174" r="4.8" fill="#3b2a20"/><circle cx="223" cy="174" r="4.8" fill="#3b2a20"/><circle cx="188.6" cy="172.4" r="1.6" fill="#fff"/><circle cx="224.6" cy="172.4" r="1.6" fill="#fff"/>
      <ellipse cx="175" cy="193" rx="7.5" ry="4.5" fill="#f08f86" opacity=".55"/><ellipse cx="235" cy="193" rx="7.5" ry="4.5" fill="#f08f86" opacity=".55"/>
      ${(HAT[hat]||HAT['hat-white'])(u)}
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
    'table-wood':()=>`<rect x="342" y="272" width="12" height="64" rx="3" fill="#a8744a" ${ln(2)}/><rect x="506" y="272" width="12" height="64" rx="3" fill="#a8744a" ${ln(2)}/>
      <ellipse cx="430" cy="272" rx="106" ry="22" fill="#a8744a" ${ln()}/><rect x="325" y="262" width="210" height="10" fill="#a8744a"/>
      <ellipse cx="430" cy="262" rx="106" ry="22" fill="#d39c68" ${ln()}/><path d="M360 262Q430 252 500 262M380 270Q430 264 480 270" fill="none" ${ln(1.6,'#bf8755')}/>
      <ellipse cx="398" cy="262" rx="24" ry="8" fill="#fff" ${ln(2)}/><ellipse cx="398" cy="257" rx="12" ry="7" fill="#f3c47a" ${ln(1.6)}/>
      <path d="M448 246H468V260Q458 268 448 260Z" fill="#fff" ${ln(2)}/><path d="M468 250q7 0 7 5t-7 5" fill="none" ${ln(2)}/><path d="M454 240q-3-5 0-9M461 240q-3-5 0-9" fill="none" ${ln(1.6,'#c9a58a')}/>`,
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

  // ---------- Chairs (drawn at centre x) ----------
  const legs=(cx,color)=>`<rect x="${cx-26}" y="296" width="7" height="42" rx="2" fill="${color}" ${ln(2)}/><rect x="${cx+19}" y="296" width="7" height="42" rx="2" fill="${color}" ${ln(2)}/>`;
  const seat=(cx,color)=>`<rect x="${cx-32}" y="288" width="64" height="12" rx="5" fill="${color}" ${ln()}/>`;
  const face=(cx,y,nose='#4a3326')=>`<circle cx="${cx-9}" cy="${y}" r="3" fill="#3b2a20"/><circle cx="${cx+9}" cy="${y}" r="3" fill="#3b2a20"/><ellipse cx="${cx}" cy="${y+7}" rx="3.5" ry="2.5" fill="${nose}"/><path d="M${cx-4} ${y+11}q4 3 8 0" fill="none" ${ln(1.6,'#4a3326')}/>`;
  const CHAIR={
    'chair-wood':cx=>legs(cx,'#b27a4b')+`<rect x="${cx-29}" y="216" width="8" height="76" rx="3" fill="#b27a4b" ${ln(2)}/><rect x="${cx+21}" y="216" width="8" height="76" rx="3" fill="#b27a4b" ${ln(2)}/>
      <rect x="${cx-15}" y="228" width="6" height="60" fill="#d8a574" ${ln(1.6)}/><rect x="${cx-3}" y="228" width="6" height="60" fill="#d8a574" ${ln(1.6)}/><rect x="${cx+9}" y="228" width="6" height="60" fill="#d8a574" ${ln(1.6)}/>
      <rect x="${cx-33}" y="208" width="66" height="16" rx="7" fill="#c98f5d" ${ln()}/>`+seat(cx,'#c98f5d'),
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

  // ---------- Room props (each placed in its own corner) ----------
  const ROOM={
    'room-window':{box:[22,226,120,118],draw:()=>`<path d="M54 250L36 338M106 250L124 338M80 250V338" fill="none" ${ln(6,'#a8744a')}/>
      <rect x="34" y="236" width="92" height="68" rx="6" fill="#3f5f4f" ${ln(6,'#b27a4b')}/><text x="80" y="256" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="Microsoft YaHei,PingFang SC,sans-serif">今日菜单</text>
      <path d="M48 276q13 12 26 0Z" fill="none" ${ln(2,'#fff')}/><path d="M56 270q-3-4 0-8M64 270q-3-4 0-8" fill="none" ${ln(1.6,'#fff')}/><path d="M86 266h26M86 276h20M86 286h24" fill="none" ${ln(2,'#fff')} opacity=".8"/>
      <polygon points="${star(64,292,5)}" fill="#ffe27a"/><rect x="38" y="304" width="84" height="5" rx="2" fill="#a8744a"/>`},
    'room-sprout':{box:[24,200,112,146],draw:()=>`<g ${ln(2)}>
      <ellipse cx="60" cy="262" rx="12" ry="28" transform="rotate(-38 60 262)" fill="#6cae5e"/><ellipse cx="102" cy="258" rx="12" ry="28" transform="rotate(35 102 258)" fill="#6cae5e"/>
      <ellipse cx="80" cy="236" rx="13" ry="30" fill="#7fbf6c"/><ellipse cx="68" cy="280" rx="10" ry="20" transform="rotate(-70 68 280)" fill="#5f9f55"/><ellipse cx="94" cy="280" rx="10" ry="20" transform="rotate(70 94 280)" fill="#5f9f55"/></g>
      <path d="M80 212V290M60 262L80 292M102 258L80 292" fill="none" ${ln(1.6,'#4f8a47')}/>
      <path d="M56 298H104L98 338H62Z" fill="#e08a5f" ${ln()}/><rect x="52" y="292" width="56" height="10" rx="4" fill="#ea9a70" ${ln()}/><path d="M70 316q10 6 20 0" fill="none" ${ln(2,'#fff')} opacity=".7"/>`},
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
    let awning='<rect y="0" width="640" height="10" fill="#b8503c"/>';
    for(let i=0;i<20;i++)awning+=`<rect x="${i*32}" y="8" width="32" height="28" fill="${i%2?'#fff4e0':'#d8664f'}"/>`;
    awning+='<rect y="36" width="640" height="12" fill="#6d4a35" opacity=".06"/>';
    for(let i=0;i<20;i++)awning+=`<path d="M${i*32} 35a16 13 0 0 0 32 0Z" fill="${i%2?'#fff4e0':'#d8664f'}" ${ln(1.6,'#b8503c')}/>`;
    let wainscot='<rect y="246" width="640" height="54" fill="#e7c9a0"/><rect y="243" width="640" height="8" rx="2" fill="#c9966a"/>';
    for(let x=14;x<640;x+=80)wainscot+=`<rect x="${x}" y="258" width="56" height="32" rx="4" fill="none" stroke="#d4b085" stroke-width="2"/>`;
    let floor='<rect y="300" width="640" height="80" fill="#dcae7e"/><path d="M0 318H640M0 342H640M0 366H640" stroke="#c99a69" stroke-width="2"/>';
    for(let x=40,row=0;row<3;row++,x=row*50+40)for(let i=x;i<640;i+=150)floor+=`<path d="M${i} ${[300,318,342][row]}V${[318,342,366][row]}" stroke="#c99a69" stroke-width="2"/>`;
    floor+='<rect y="296" width="640" height="8" fill="#b98356"/>';
    return {awning,wainscot,floor,rug:`<ellipse cx="430" cy="342" rx="156" ry="17" fill="#f2c4a4"/><ellipse cx="430" cy="342" rx="140" ry="12" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 6" opacity=".7"/>`};
  }
  const sign=`<path d="M270 44V62M370 44V62" stroke="#8a5a3b" stroke-width="2.5"/><rect x="246" y="60" width="148" height="40" rx="12" fill="#9b633f" ${ln()}/><rect x="253" y="66" width="134" height="28" rx="8" fill="#b97a4e"/>
    <text x="320" y="87" text-anchor="middle" font-size="19" font-weight="800" fill="#fff4dc" letter-spacing="3" font-family="Microsoft YaHei,PingFang SC,sans-serif">森林小食堂</text>
    <ellipse cx="250" cy="64" rx="10" ry="5" transform="rotate(-30 250 64)" fill="#7fb069" ${ln(1.6)}/><ellipse cx="390" cy="64" rx="10" ry="5" transform="rotate(30 390 64)" fill="#7fb069" ${ln(1.6)}/>`;
  const pendant=`<path d="M430 46V110" stroke="#7a5238" stroke-width="2"/><ellipse cx="430" cy="146" rx="42" ry="16" fill="#fff3c4" opacity=".35" class="cafe-glow"/><circle cx="430" cy="134" r="7" fill="#fff4c7" ${ln(1.6)}/><path d="M413 110H447L461 132H399Z" fill="#f3c25e" ${ln()}/>`;
  function windowFrame(u,view){
    return `<defs><clipPath id="${u}win"><path d="${WIN}"/></clipPath></defs><g clip-path="url(#${u}win)">${(VIEW[view]||VIEW['view-day'])(u)}</g>
      <path d="${WIN}" fill="none" stroke="#c98f5d" stroke-width="10" stroke-linejoin="round"/><path d="${WIN}" fill="none" stroke="#fff6e6" stroke-width="2.5"/>
      <path d="M94 106V224M36 172H152" stroke="#c98f5d" stroke-width="6"/><rect x="22" y="222" width="144" height="11" rx="4" fill="#c98f5d" ${ln()}/>`;
  }
  const curtains=`<path d="M20 96H52C44 140 50 170 62 192C46 196 34 206 26 222Z" fill="#f2a893" ${ln(2)}/><path d="M168 96H136C144 140 138 170 126 192C142 196 154 206 162 222Z" fill="#f2a893" ${ln(2)}/>
    <path d="M30 104q6 40 18 80M158 104q-6 40-18 80" fill="none" ${ln(1.6,'#e08b75')}/><rect x="14" y="90" width="160" height="7" rx="3.5" fill="#b77a4c" ${ln(1.8)}/>`;

  const svg=(box,body,cls='cafe-art')=>`<svg class="${cls}" viewBox="${box.join(' ')}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${body}</svg>`;
  const pick=(equipped,slot,fallback)=>equipped[slot]||fallback;

  function scene(equipped){
    const u=`ca${++uid}-`,parts=shell(),room=ROOM[pick(equipped,'room','room-window')]||ROOM['room-window'],chair=CHAIR[pick(equipped,'chair','chair-wood')]||CHAIR['chair-wood'];
    return svg([0,0,640,380],`${(WALL[pick(equipped,'wall','wall-cream')]||WALL['wall-cream'])(u)}${parts.wainscot}${parts.floor}${parts.rug}${parts.awning}${sign}${pendant}
      ${windowFrame(u,pick(equipped,'view','view-day'))}${curtains}${room.draw(u)}${chair(300)}${chair(560)}
      ${chef(pick(equipped,'hat','hat-white'),pick(equipped,'apron','apron-white'),u)}${(TABLE[pick(equipped,'table','table-wood')]||TABLE['table-wood'])(u)}`,'cafe-art cafe-scene-art');
  }
  // A small picture of one decoration, shown in the decoration book and gift cards.
  function thumb(id,slot){
    const u=`ct${++uid}-`,cls='cafe-art cafe-thumb';
    if(slot==='hat')return svg([130,40,164,160],chef(id,'apron-white',u),cls);
    if(slot==='apron')return svg([124,176,176,172],chef('hat-white',id,u),cls);
    if(slot==='table')return svg([314,190,232,156],(TABLE[id]||TABLE['table-wood'])(u),cls);
    if(slot==='chair')return svg([248,186,104,156],(CHAIR[id]||CHAIR['chair-wood'])(300),cls);
    if(slot==='wall')return svg([20,120,160,150],`${(WALL[id]||WALL['wall-cream'])(u)}${shell().wainscot}`,cls);
    if(slot==='view')return svg([16,92,156,148],windowFrame(u,id),cls);
    const room=ROOM[id]||ROOM['room-window'];
    return svg(room.box,room.draw(u),cls);
  }
  const api={scene,thumb};
  root.RestaurantArt=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);
