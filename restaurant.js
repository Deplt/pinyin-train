(function(root){
  'use strict';
  const D=root.RestaurantData,C=root.RestaurantCore;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function create({onChange,player,storage}){
    let saved,storageAvailable=true;
    try{storage=storage||root.localStorage;const raw=storage.getItem(C.STORAGE_KEY);try{saved=JSON.parse(raw);}catch{saved=null;}}catch{storageAvailable=false;}
    const p=C.restore(saved);
    let screen='room',decorSlot='all',audioToken=0,audioError='',playing=false;
    let drag=null,suppressClickUntil=0;
    const save=()=>{try{storage.setItem(C.STORAGE_KEY,JSON.stringify(p));}catch{storageAvailable=false;}};
    const current=()=>C.recipe(p.session?.orders[p.session.index].recipeId);
    const voice=name=>`assets/restaurant/voice/${name}.wav`;
    const phonetic=name=>`assets/audio/${encodeURIComponent(name)}.mp3`;
    function audioUI(){
      const status=document.querySelector('#cafe-audio-status');
      if(status)status.textContent=audioError||(playing?'正在读，跟着念一念吧。':'没听清？小喇叭可以反复点。');
    }
    function stopAudio(){cancelDrag();audioToken++;player?.pause();player?.removeAttribute('src');player?.load();playing=false;audioUI();}
    function cancelDrag(){
      if(!drag)return;
      const d=drag;drag=null;
      d.ghost?.remove();d.source.classList.remove('dragging');d.target?.classList.remove('drop-target');
      if(d.moved)suppressClickUntil=Date.now()+500;
      if(d.source.hasPointerCapture?.(d.pointerId))d.source.releasePointerCapture(d.pointerId);
    }
    function slotAt(x,y){return document.elementFromPoint(x,y)?.closest('[data-action="cafe-place"]')||null;}
    document.addEventListener('pointerdown',event=>{
      if(drag)return;
      suppressClickUntil=0;
      const source=event.target.closest('[data-action="cafe-pick"]');
      if(!source||source.disabled||event.isPrimary===false||event.button!==0||screen!=='kitchen'||p.session?.phase!=='building')return;
      drag={source,card:source.dataset.id,pointerId:event.pointerId,x:event.clientX,y:event.clientY,moved:false,session:p.session,index:p.session.index};
      source.setPointerCapture?.(event.pointerId);
    });
    document.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<8)return;
      event.preventDefault();
      if(!drag.moved){
        drag.moved=true;drag.source.classList.add('dragging');
        const ghost=document.createElement('div');ghost.className='cafe-drag-ghost pinyin';ghost.textContent=drag.card;ghost.setAttribute('aria-hidden','true');
        document.body.appendChild(ghost);drag.ghost=ghost;
      }
      drag.ghost.style.left=`${event.clientX}px`;drag.ghost.style.top=`${event.clientY}px`;
      const target=slotAt(event.clientX,event.clientY);
      if(target!==drag.target){drag.target?.classList.remove('drop-target');target?.classList.add('drop-target');drag.target=target;}
    },{passive:false});
    document.addEventListener('pointerup',event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      const d=drag,target=d.moved?slotAt(event.clientX,event.clientY):null;
      if(d.moved)event.preventDefault();
      cancelDrag();
      if(d.moved&&target&&p.session===d.session&&p.session.index===d.index&&C.place(p,Number(target.dataset.index),d.card)){save();onChange();}
    });
    for(const type of ['pointercancel','lostpointercapture'])document.addEventListener(type,event=>{if(drag&&event.pointerId===drag.pointerId)cancelDrag();});
    // A drag may be followed by a browser-generated click. Ignore that click,
    // otherwise dropping on a filled slot could immediately clear the card again.
    document.addEventListener('click',event=>{
      if(event.detail!==0&&Date.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    document.addEventListener('dragstart',event=>{if(event.target.closest('[data-action="cafe-pick"]'))event.preventDefault();});
    function play(sources,explicit=false){
      stopAudio();audioError='';
      if(explicit&&!p.sound){p.sound=true;save();onChange();}
      if(!p.sound||!player)return;
      const token=audioToken;
      let index=0;
      const failed=()=>{if(token!==audioToken)return;playing=false;audioError='声音没播放出来，点喇叭再试一次，也可以请爸爸妈妈读一遍。';audioUI();};
      const next=()=>{
        if(token!==audioToken)return;
        if(index===sources.length){playing=false;audioUI();return;}
        player.src=sources[index++];player.onended=next;player.onerror=failed;
        Promise.resolve(player.play()).then(()=>{if(token===audioToken){playing=true;audioUI();}}).catch(failed);
      };
      next();
    }
    function toggleSound(){p.sound=!p.sound;save();stopAudio();onChange();}
    function scene(compact=false){
      const equipped=Object.values(p.equipped).map(id=>D.decorations.find(d=>d.id===id));
      const chosen=slot=>equipped.find(d=>d.slot===slot);
      return `<div class="cafe-scene ${compact?'compact':''} ${equipped.map(d=>d.id).join(' ')}" role="img" aria-label="我的餐厅：${equipped.map(d=>d.name).join('、')}">
        <div class="cafe-awning" aria-hidden="true"></div><div class="cafe-shop-sign">森林小食堂 <span>开张啦</span></div>
        <div class="cafe-window" aria-hidden="true"><span>☁️</span><i>🌳</i></div><div class="cafe-room-prop" aria-hidden="true">${chosen('room').emoji}</div>
        <div class="cafe-chef" aria-hidden="true"><span class="cafe-hat">${chosen('hat').emoji}</span><span>🐻</span></div>
        <div class="cafe-table" aria-hidden="true"><span>${chosen('table').id==='table-wood'?'🍽️':chosen('table').emoji}</span></div>
        <div class="cafe-chair left" aria-hidden="true">${chosen('chair').emoji}</div><div class="cafe-chair right" aria-hidden="true">${chosen('chair').emoji}</div>
        <div class="cafe-scene-caption">我的小餐厅 · 每件装饰都由你来选</div>
      </div>`;
    }
    function warning(){return storageAvailable?'':'<p class="audio-warning" role="status">这个浏览器暂时不能保存餐厅记录；关闭后可能丢失，请使用可保存数据的普通浏览模式。</p>';}
    function nextGift(){return D.decorations.find(d=>d.guests&&!p.unlocked.includes(d.id));}
    function progressCard(){
      const d=nextGift();
      return `<div class="cafe-goal"><span class="cafe-goal-icon" aria-hidden="true">${d?.emoji||'🏡'}</span><div><strong>${d?`下一份礼物：${d.name}`:'餐厅装饰都收集齐啦！'}</strong><p>${d?`再接待 ${Math.max(0,d.guests-p.served)} 位客人 · 再试 ${Math.max(0,d.foods-C.foods(p))} 道不同食物`:'继续接待朋友，让熟悉的拼音更熟练。'}</p></div><button class="text-button" data-action="cafe-decor">装饰册 →</button></div>`;
    }
    function room(){
      const active=p.session&&p.session.phase!=='done';
      return `<div class="cafe-heading"><div><div class="eyebrow">围上小围裙，一起开张吧</div><h1>欢迎来到动物小餐厅</h1><p>听点餐，拼一拼，把好吃的端给朋友。</p></div><span class="cafe-label">🍽️ 每次 3 位小客人</span></div>
        <div class="cafe-home-layout">${scene()}<section class="cafe-welcome"><span class="cafe-welcome-icon" aria-hidden="true">🧑‍🍳</span><h2>今天，你是小厨师！</h2><div class="cafe-steps"><span>① 听点餐</span><span>② 拼食物</span><span>③ 端上桌</span></div><button class="primary cafe-primary" data-action="cafe-start">${active?'继续接待客人':'穿好围裙，开张！'} →</button><button class="text-button" data-action="cafe-howto">🔊 听听怎么玩</button><p class="cafe-saving">${active?'上次做到的地方已保存，接着玩就好。':'慢慢拼，没有倒计时，提示也不扣奖励。'}</p></section></div>
        <div class="cafe-stats"><div><strong>♥ ${p.served}</strong><span>接待的客人</span></div><div><strong>🍲 ${C.foods(p)} / ${D.recipes.length}</strong><span>尝试的食物</span></div><div><strong>🎁 ${p.unlocked.length} / ${D.decorations.filter(d=>d.guests).length}</strong><span>解锁的装饰</span></div></div>
        ${progressCard()}<div class="section-heading"><h2>今天也有好吃的</h2><span>点食物，听听完整拼音</span></div><div class="cafe-menu">${D.recipes.map(r=>`<button class="cafe-menu-card ${p.dishes[r.id]?'visited':''}" data-action="cafe-preview" data-id="${r.id}" aria-label="听 ${r.pinyin}，${r.word}"><span aria-hidden="true">${r.emoji}</span><strong class="pinyin">${r.pinyin}</strong><small>${r.word}${p.dishes[r.id]?' · 做过啦':''}</small></button>`).join('')}</div>
        <p class="cafe-parent-note">💛 餐厅装饰和小火车贴纸分别收集；这里的进度不会改动小火车的星星、贴纸和练习记录。</p>`;
    }
    function kitchen(){
      const s=p.session,r=current(),guest=D.guests[(s.guestOffset+s.index)%D.guests.length];
      if(s.phase==='done')return receipt();
      const building=s.phase==='building',served=s.phase==='served';
      return `<div class="cafe-trip-top"><button class="text-button" data-action="cafe-room">← 回到餐厅</button><span>${s.orders.map((_,i)=>`<span class="cafe-guest-dot ${i<s.index||i===s.index&&served?'served':''}">${i<s.index||i===s.index&&served?'✓':i+1}</span>`).join('')}</span><strong>第 ${s.index+1} / 3 位</strong></div>
        <section class="cafe-counter"><div class="cafe-customer" aria-hidden="true">${guest.emoji}</div><div class="cafe-order"><small>${guest.name}${served?'吃得很开心':'来点餐啦'}</small><h1>${served?'谢谢你，真好吃！':`我想${['tea','milk','soup'].includes(r.id)?'喝':'吃'}${r.word}！`}</h1><button class="cafe-listen" data-action="cafe-listen">🔊 ${served?'再听一次拼音':'听听点餐'}</button></div><div class="cafe-order-food" aria-hidden="true">${r.emoji}</div></section>
        ${building?`<section class="cafe-prep"><h2>点两张卡片，拼出好吃的</h2><p class="cafe-instruction">点一下，卡片自动入格；也可以拖进去。</p>
          <div class="cafe-spelling">${s.picked.map((v,i)=>`${i?'<span class="cafe-plus" aria-hidden="true">＋</span>':''}<button class="cafe-slot pinyin ${v?'filled':''}" data-action="cafe-place" data-index="${i}" aria-label="第 ${i+1} 个拼音格${v?`，${esc(v)}，点一下取下`:'，空'}"><span>${esc(v||'?')}</span><small>${i?'韵母':'声母'}</small></button>`).join('')}</div>
          ${s.hinted?`<p class="cafe-hint" role="status">小提示：<span class="pinyin">${r.parts[0]} ＋ ${r.parts[1]} → ${r.pinyin}</span></p>`:''}
          <div class="cafe-cards" role="group" aria-label="选择拼音卡片">${s.orders[s.index].cards.map(card=>`<button class="cafe-card pinyin ${s.picked.includes(card)?'placed':''} ${s.hinted&&r.parts.includes(card)?'hinted':''}" data-action="cafe-pick" data-id="${esc(card)}" aria-label="拼音卡片 ${esc(card)}" aria-pressed="${s.picked.includes(card)}">${esc(card)}</button>`).join('')}</div>
          <p class="cafe-feedback" role="status" aria-live="polite">${s.checked?'差一点点，再听一听，换张卡片试试。':'想换答案？直接点另一张卡；点格子可以取下来。'}</p>
          <div class="cafe-actions"><button class="text-button" data-action="cafe-hint">💡 帮我拼一拼</button><button class="primary cafe-primary" data-action="cafe-cook" ${s.picked.some(v=>v===null)?'disabled':''}>拼好了，做好吃的！</button></div></section>`:
          `<section class="cafe-dish ${served?'served':''}"><div class="cafe-plate" aria-hidden="true">${r.emoji}</div><h2>${served?'客人吃到好吃的啦！':'拼对啦，好吃的做好了！'}</h2><button class="cafe-blend pinyin" data-action="cafe-blend" aria-label="听拼读 ${r.pinyin}">${r.parts[0]} ＋ ${r.parts[1]} → <strong>${r.pinyin}</strong> <span>🔊</span></button><p>${served?'♥ 接待人数 +1，餐厅记录已经保存。':'听一听，跟着念，再端给小客人。'}</p><button class="primary cafe-primary" data-action="${served?'cafe-next':'cafe-serve'}">${served?'请下一位客人 →':`端给${guest.name} 🍽️`}</button></section>`}`;
    }
    function receipt(){
      const s=p.session,gifts=s.rewards.map(id=>D.decorations.find(d=>d.id===id));
      return `<section class="cafe-receipt"><div class="cafe-receipt-top">本次营业的小收获</div><span class="cafe-receipt-emoji" aria-hidden="true">🧑‍🍳</span><div class="eyebrow">三位客人，都吃饱啦</div><h1>谢谢你，小小厨师！</h1><p>今天接待 3 位朋友，练习了这些食物：</p><div class="cafe-receipt-foods">${s.orders.map(o=>{const r=C.recipe(o.recipeId);return `<button data-action="cafe-preview" data-id="${r.id}"><span>${r.emoji}</span><strong class="pinyin">${r.pinyin}</strong><small>${r.word} · 🔊</small></button>`;}).join('')}</div>
        ${gifts.length?`<div class="cafe-gift"><span aria-hidden="true">🎁</span><div><h2>解锁新装饰啦！</h2><p>${gifts.map(d=>`${d.emoji} ${d.name}`).join('、')}</p></div></div>`:'<p class="cafe-no-gift">餐厅又热闹了一点，下一份装饰也更近了。</p>'}
        <div class="complete-actions"><button class="primary cafe-primary" data-action="cafe-decor">去布置我的餐厅 →</button><button class="secondary" data-action="cafe-room">回到餐厅</button></div><p class="rest-note">忙完一小轮，看看远处，休息一下吧 🌿</p></section>${progressCard()}`;
    }
    function decor(){
      return `<div class="cafe-heading"><div><div class="eyebrow">我的小餐厅，我来布置</div><h1>把喜欢的装饰摆上去</h1><p>已经得到的装饰可以反复更换，不用花星星。</p></div><button class="text-button" data-action="cafe-room">← 回到餐厅</button></div>${scene(true)}
        <div class="cafe-decor-tabs" role="group" aria-label="装饰分类">${[{id:'all',name:'全部装饰'},...D.slots].map(s=>`<button data-action="cafe-filter" data-id="${s.id}" aria-pressed="${decorSlot===s.id}">${s.name}</button>`).join('')}</div><div class="cafe-decor-grid">${D.decorations.filter(d=>decorSlot==='all'||d.slot===decorSlot).map(d=>{
          const unlocked=C.available(p,d),equipped=p.equipped[d.slot]===d.id;
          return `<article class="cafe-decoration ${unlocked?'':'locked'} ${equipped?'equipped':''}"><span class="cafe-decoration-icon" aria-hidden="true">${d.emoji}</span><h2>${d.name}</h2><p>${unlocked?(d.guests?'努力得到的小礼物':'开店就有的小装备'):`再接待 ${Math.max(0,d.guests-p.served)} 位客人<br>再试 ${Math.max(0,d.foods-C.foods(p))} 道不同食物`}</p><button class="secondary" data-action="cafe-equip" data-id="${d.id}" ${!unlocked||equipped?'disabled':''}>${equipped?'✓ 正在用':unlocked?'用这个':'还在等你'}</button></article>`;
        }).join('')}</div><p class="cafe-parent-note">装饰同时看接待人数和不同食物的练习数。餐厅奖励独立保存，小火车的 48 张贴纸仍由小火车旅程获得。</p>`;
    }
    function render(){cancelDrag();return `<main class="cafe">${screen==='kitchen'?kitchen():screen==='decor'?decor():room()}<p id="cafe-audio-status" class="cafe-audio-status" role="status">${audioError||'没听清？小喇叭可以反复点。'}</p>${warning()}</main>`;}
    function handleAction(el){
      const {action,id,index}=el.dataset;
      if(action==='cafe-room'){stopAudio();screen='room';onChange();root.scrollTo({top:0,behavior:'instant'});return;}
      if(action==='cafe-start'){C.start(p);save();screen='kitchen';onChange();root.scrollTo({top:0,behavior:'instant'});if(p.session.phase==='building')play([voice(`order-${current().id}`),phonetic(current().audio)]);return;}
      if(action==='cafe-decor'){stopAudio();screen='decor';onChange();return;}
      if(action==='cafe-filter'){if(['all',...D.slots.map(s=>s.id)].includes(id)){decorSlot=id;onChange();}return;}
      if(action==='cafe-equip'){if(C.equip(p,id)){save();onChange();}return;}
      if(action==='cafe-preview'){const r=C.recipe(id);if(r)play([phonetic(r.audio)],true);return;}
      if(action==='cafe-howto'){play([voice('howto-tap-drag')],true);return;}
      if(screen!=='kitchen'||!p.session)return;
      const r=current();
      if(action==='cafe-listen'){play([voice(`order-${r.id}`),phonetic(r.audio)],true);return;}
      if(action==='cafe-blend'){play([...r.partAudio.map(phonetic),phonetic(r.audio)],true);return;}
      if(action==='cafe-pick'){if(C.pick(p,id)){const focused=document.activeElement===el;save();onChange();if(focused)document.querySelector(`[data-action="cafe-pick"][data-id="${id}"]`)?.focus({preventScroll:true});}return;}
      if(action==='cafe-place'){if(C.clear(p,Number(index))){save();onChange();}return;}
      if(action==='cafe-hint'){if(C.hint(p)){save();onChange();play([...r.partAudio.map(phonetic),phonetic(r.audio)]);}return;}
      if(action==='cafe-cook'){const result=C.cook(p);if(result.accepted){save();onChange();play(result.correct?[...r.partAudio.map(phonetic),phonetic(r.audio)]:[voice('retry')]);}return;}
      if(action==='cafe-serve'){const result=C.serve(p);if(result){save();onChange();play([voice(result.done?'finished':'thanks')]);}return;}
      if(action==='cafe-next'){if(C.next(p)){save();onChange();root.scrollTo({top:0,behavior:'instant'});play([voice(`order-${current().id}`),phonetic(current().audio)]);}return;}
    }
    return {render,handleAction,stopAudio,toggleSound,status:()=>({served:p.served,sound:p.sound})};
  }
  root.RestaurantGame={create};
  if(typeof module!=='undefined')module.exports={create};
})(typeof globalThis!=='undefined'?globalThis:window);
