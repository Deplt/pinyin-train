(() => {
  'use strict';
  const D = window.PinyinData, C = window.PinyinCore;
  const app = document.querySelector('#app'), modal = document.querySelector('#modal');
  const STORAGE_KEY = 'pinyin-forest-train-v1';
  let storageAvailable = true, saved;
  try { const raw=localStorage.getItem(STORAGE_KEY); try {saved=JSON.parse(raw);} catch {saved=null;} }
  catch { storageAvailable = false; }
  let progress = C.restore(saved, D);
  let view = 'map', selected = 'initials', book = 'initials', round = null, reward = null;
  let toastTimer, audioSerial = 0, lastFocus, audioError = '', audioPlaying = false;
  let restaurant = null;
  const player = document.querySelector('#game-audio');
  const animals = ['🐰','🐿️','🐻','🦊','🐼'];
  const station = id => D.stations.find(s => s.id === id);
  const currentQuestion = () => round?.questions[round.index];
  const icons = {
    map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z"/><path d="M9 3v16M15 5v16"/>',
    book:'<path d="M12 5v16M3 3h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3Z"/>',
    star:'<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
    sound:'<path d="m11 4-6 5H2v6h3l6 5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute:'<path d="m11 4-6 5H2v6h3l6 5Z"/><path d="m16 9 6 6m0-6-6 6"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    back:'<path d="M20 12H4m6-6-6 6 6 6"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="15" cy="17" r="3" fill="currentColor"/>',
    play:'<path d="m8 4 12 8-12 8Z" fill="currentColor" stroke="none"/>',
    bulb:'<path d="M9 18h6m-5 3h4M8 15a7 7 0 1 1 8 0l-1 3H9Z"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.star}</svg>`;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function save() {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(progress)); }
    catch { storageAvailable = false; }
  }
  function toast(text) {
    clearTimeout(toastTimer);
    const el = document.querySelector('#toast'); el.textContent = text; el.classList.add('visible');
    toastTimer = setTimeout(() => el.classList.remove('visible'),3400);
  }
  function stopAudio() {
    restaurant?.stopAudio();
    audioSerial++; player.pause(); player.removeAttribute('src'); player.load();
    audioPlaying = false; updateAudioUI();
  }
  function updateAudioUI() {
    const button = document.querySelector('[data-action="listen"]');
    if (button) {
      button.classList.toggle('playing',audioPlaying);
      button.setAttribute('aria-label',audioPlaying ? '正在播放，点击重新听' : '听拼音，再听一次');
      button.querySelector('strong').textContent = audioPlaying ? '仔细听一听' : '点我听拼音';
    }
    const warning = document.querySelector('#audio-warning');
    if (warning) {warning.textContent = audioError; warning.hidden = !audioError;}
    const bookStatus = document.querySelector('#book-audio-status');
    if (bookStatus) bookStatus.textContent = audioError || (audioPlaying ? '正在读，跟着念一念吧。' : '点一张小卡片，听听它的声音。');
  }
  async function playFile(src, {question = null, phonetic = false} = {}) {
    stopAudio(); const serial = audioSerial;
    audioError = '';
    if (!progress.sound) { progress.sound = true; save(); updateSoundButton(); }
    player.src = src;
    player.onended = () => {if (serial === audioSerial) {audioPlaying = false; updateAudioUI();}};
    player.onerror = () => {
      if (serial !== audioSerial) return;
      audioPlaying = false;
      audioError = phonetic ? '声音暂时没播放出来，请再点一次喇叭。也可以请爸爸妈妈读一遍。' : '';
      updateAudioUI();
    };
    try {
      await player.play();
      if (serial !== audioSerial) return;
      audioPlaying = true;
      if (question && question === currentQuestion()) question.heard = true;
      updateAudioUI();
    } catch (e) {
      if (serial !== audioSerial || e.name === 'AbortError') return;
      audioPlaying = false;
      audioError = '点一下喇叭开启声音；如果仍然没有声音，请检查手机音量。'; updateAudioUI();
    }
  }
  const voice = name => {if(progress.sound) void playFile(`assets/voice/${name}.wav`);};
  const playItem = (item, question) => playFile(`assets/audio/${encodeURIComponent(item.audio)}.mp3`,{question,phonetic:true});
  function header() {
    const nav = [['map','map','冒险地图'],['restaurant','restaurant','动物餐厅'],['stickers','star','我的贴纸'],['book','book','复习小书']];
    const cafeStatus=view==='restaurant'?restaurant.status():null;
    const sound=cafeStatus?cafeStatus.sound:progress.sound;
    return `<header class="topbar">
      <button class="brand" data-action="nav" data-view="map" aria-label="拼音小火车，回到冒险地图"><span class="brand-icon" aria-hidden="true">🚂</span><span><strong>拼音小火车</strong><small>森林出发啦 · PINYIN EXPRESS</small></span></button>
      <nav class="nav" aria-label="主要导航">${nav.map(([key,i,label]) => `<button data-action="nav" data-view="${key}" class="${view === key ? 'active' : ''}" ${view===key?'aria-current="page"':''}>${icon(i)}${label}</button>`).join('')}</nav>
      <div class="header-actions"><span class="star-counter" aria-label="${cafeStatus?`餐厅已接待 ${cafeStatus.served} 位客人`:`小火车已收集 ${progress.stars} 颗星星`}">${cafeStatus?'♥':'⭐'} <b id="stars">${cafeStatus?cafeStatus.served:progress.stars}</b></span><button class="icon-button" data-action="sound" id="sound-button" aria-label="${sound?'关闭':'开启'}声音" aria-pressed="${sound}">${icon(sound?'sound':'mute')}</button></div>
    </header>`;
  }
  function mapPage() {
    const s = station(selected);
    return `<main>
      <section class="intro"><div><div class="eyebrow">叮叮！森林专列准备出发</div><h1>小小列车长，今天去哪儿？</h1><p>听一听，接上小动物，一起开启拼音之旅。</p></div><span class="soft-pill">☀️ 每次一小站，快乐学拼音</span></section>
      <div class="landscape"><img src="assets/train-forest.png" alt="兔子列车长开着绿色小火车，载着森林动物经过花丛和小车站" fetchpriority="high"><span class="scene-label">🌿 森林专列 · 欢迎上车</span><span class="scene-note">接满 <strong>5 位乘客</strong>，带一张贴纸回家 🎁</span><button class="primary scene-start" data-action="start">出发，接乘客！${icon('arrow')}</button></div>
      <section aria-labelledby="station-heading"><div class="section-heading"><h2 id="station-heading">${icon('map')} 选择你的下一站</h2><span>5 个车站 · 都是学过的朋友</span></div>
      <div class="station-grid">${D.stations.map((st,i) => {const seen = progress.seen[st.id]?.length || 0;return `<button class="station-card ${selected===st.id?'selected':''}" style="--station-bg:${st.color};--station-accent:${st.accent}" data-action="select" data-id="${st.id}" aria-pressed="${selected===st.id}" aria-label="选择${st.name}，${st.items.length}个练习内容"><div class="station-top"><span class="station-num">第 ${['一','二','三','四','五'][i]} 站</span><span class="station-check">${selected===st.id?'●':progress.completed[st.id]?'✓':''}</span></div><div class="station-art" aria-hidden="true">${st.emoji}</div><h3>${st.name}</h3><p class="sample pinyin" lang="zh-Latn">${st.sample}</p><div class="station-count"><span>${st.items.length} 个${st.id==='tones'?'声调':'拼音'}</span><span>${seen?`已练 ${seen} 个`:'等你来玩'}</span></div><div class="mini-progress"><i style="width:${seen/st.items.length*100}%"></i></div></button>`;}).join('')}</div></section>
      <div class="departure"><div class="departure-copy"><span class="emoji" aria-hidden="true">${s.emoji}</span><div><strong>下一站：${s.name}</strong><p>${s.desc} · 每轮 5 题</p></div></div><button class="primary" data-action="start">出发，接乘客！${icon('arrow')}</button></div>
      <footer class="footnote"><span>💛 慢慢来，可以反复听，答错也没关系。</span><button class="text-button" data-action="settings">${icon('settings')} 家长小贴士</button></footer>
      <div class="cafe-stall-link"><div><strong>🧑‍🍳 森林里的小餐厅开张啦</strong><p>换上围裙，拼出好吃的，装饰自己的餐厅。两款游戏分别收集奖励。</p></div><button class="secondary" data-action="nav" data-view="restaurant">去当小厨师 →</button></div>
    </main>`;
  }
  function tripScene() {
    return `<div class="trip-scene"><img src="assets/train-forest.png" alt="小火车正在森林车站等待乘客"><div class="passenger-strip" aria-label="已接到 ${round.questions.filter(q=>q.solved).length} 位乘客，共 5 位">${round.questions.map((q,i) => `<span class="passenger-slot ${q.solved?'boarded':i===round.index?'current':''}">${q.solved?animals[i]:i===round.index?'🎫':'·'}</span>`).join('')}</div></div>`;
  }
  function gamePage() {
    const s = station(round.stationId), q = currentQuestion();
    const hints = q.hinted ? `<div class="hint-picture"><span aria-hidden="true">${q.target.emoji}</span>${q.target.tone ? `${D.toneNames[q.target.tone-1]}，找找声调小帽子。` : `想一想学习图里的「${q.target.word}」`}</div>` : '';
    let feedback = q.solved ? `接到${['小兔','小松鼠','小熊','小狐狸','小熊猫'][round.index]}啦！真棒，送你一颗星星 ⭐` : q.mistakes.length ? '没关系，再听一次，换一张车票试试看。' : '哪张车票的拼音，和你听到的一样？';
    return `<main><div class="trip-top"><button class="text-button" data-action="leave">${icon('back')} 返回地图</button><span class="trip-title">${s.emoji} ${s.name}</span><span class="soft-pill">第 ${round.index+1} / 5 位乘客</span></div>${tripScene()}
      <section class="game-panel"><p class="round-kicker">${animals[round.index]} 小乘客在等你</p><h1>${q.solved?'找到车票，欢迎上车！':q.target.tone?'听听声音，找对声调':'听一听，找到小乘客的车票'}</h1><p class="game-instruction">${q.target.tone?'字母一样，声音的高低不一样哦。':'先点小喇叭，再点一张拼音车票。'}</p>
      <button class="listen-button" data-action="listen" aria-label="听拼音，再听一次"><span class="speaker-disc">${icon('sound')}</span><span><strong>点我听拼音</strong><small>可以一遍一遍听哦</small></span></button>
      <p id="audio-warning" class="audio-warning" role="status" ${audioError?'':'hidden'}>${audioError}</p>
      ${hints}<div class="answer-grid ${q.target.tone?'four':''}" role="group" aria-label="拼音车票">${q.options.map(item => {const wrong=q.mistakes.includes(item.id), correct=q.solved&&item.id===q.target.id;return `<button class="answer pinyin ${wrong?'wrong':''} ${correct?'correct':''} ${q.hinted&&item.id===q.target.id?'hinted':''}" data-action="answer" data-id="${item.id}" aria-label="车票 ${item.text}" ${q.solved||wrong?'disabled':''}><span lang="zh-Latn">${item.text}</span>${correct?'<span class="answer-mark">✓</span>':''}</button>`;}).join('')}</div>
      <p class="feedback ${q.solved?'success':q.mistakes.length?'warning':''}" role="status" aria-live="polite">${feedback}</p>
      <div class="game-footer">${q.solved ? `<button class="primary" data-action="next">${round.index===4?'乘客到齐，出发领奖！':'接下一位小乘客'}${icon('arrow')}</button>` : `<button class="text-button" data-action="hint">${icon('bulb')} 给我一点提示</button><button class="text-button" data-action="howto">${icon('sound')} 怎么玩</button>`}</div></section></main>`;
  }
  function stickersPage() {
    return `<main><div class="page-heading"><div class="eyebrow">我的森林收藏</div><h1>每一张贴纸，都是一次小进步</h1><p>完成一趟小火车，就有一位新朋友来报到。</p></div><div class="collection-summary"><span aria-hidden="true">🎒</span><div><h2>已经认识 ${progress.stickers.length} / ${D.stickers.length} 位森林朋友</h2><p>完成 ${progress.trips} 趟旅程，收集 ${progress.stars} 颗星星。${progress.stickers.length===D.stickers.length?'朋友们都到齐啦！':'下一位朋友，正在车站等你。'}</p></div></div><div class="sticker-grid">${D.stickers.map((s,i) => {const unlocked=progress.stickers.includes(s.id);return `<div class="sticker ${unlocked?'':'locked'}"><div class="sticker-emoji" aria-hidden="true">${unlocked?s.emoji:'?'}</div><strong>${unlocked?s.name:`第 ${i+1} 位朋友`}</strong><small>${unlocked?'已经成为好朋友':`再完成 ${D.stickers.slice(0,i+1).filter(friend=>!progress.stickers.includes(friend.id)).length} 趟获得`}</small></div>`;}).join('')}</div><div class="departure"><div class="departure-copy"><span class="emoji">🚂</span><div><strong>一起去森林里转转吧</strong><p>答错不扣星星，用提示也能获得奖励。</p></div></div><button class="primary" data-action="nav" data-view="map">去接小乘客${icon('arrow')}</button></div>${storageAvailable?'':'<p class="audio-warning">这个浏览器暂时不能保存记录；本次仍可正常收集，关闭后可能丢失。</p>'}</main>`;
  }
  function bookPage() {
    const s = station(book);
    return `<main><div class="page-heading"><div class="eyebrow">熟悉的小书，新的一次发现</div><h1>和老朋友打个招呼</h1><p>点拼音听一听，也可以打开你学过的那张图。</p></div><div class="book-tabs" role="group" aria-label="选择复习内容">${D.stations.map(s => `<button data-action="book-tab" data-id="${s.id}" class="${book===s.id?'active':''}" aria-pressed="${book===s.id}">${s.emoji} ${s.short}</button>`).join('')}</div><div class="book-layout"><section class="book-main"><h2>${s.short}</h2><p>${s.tip}</p><p id="book-audio-status" class="book-audio-status" role="status">点一张小卡片，听听它的声音。</p><div class="learn-grid">${s.items.map(item=>`<button class="learn-tile" data-action="learn" data-id="${item.id}" aria-label="听 ${item.text} 的发音"><span class="pinyin" lang="zh-Latn">${item.text}</span><span class="learn-emoji" aria-hidden="true">${item.emoji}</span><small>${item.word}</small></button>`).join('')}</div>${book==='tones'?'<div class="rule"><strong>标调小口诀</strong>有 a 不放过，没 a 找 o、e。<br>i、u 并列标在后，单个韵母不用说。<br>i 上标调要去点，轻声不标调。<br><span class="pinyin">例：hǎo · guī · liú · nǚ</span></div>':''}<div class="book-controls"><button class="text-button" data-action="poster">${icon('book')} 看原来的学习图</button><button class="primary" data-action="book-start">去这一站玩${icon('arrow')}</button></div></section><aside><button class="poster-button" data-action="poster" aria-label="放大${s.short}学习图"><img src="assets/posters/${s.id}.png" alt="家长提供的${s.short}学习图" loading="lazy"></button><p class="poster-caption">🔎 点一下，打开熟悉的学习图</p></aside></div></main>`;
  }
  function rewardPage() {
    const sticker = reward.sticker;
    return `<main><div class="trip-top"><button class="text-button" data-action="nav" data-view="map">${icon('back')} 回到地图</button><span class="trip-title">🎉 ${station(round.stationId).name}，到站啦！</span></div><section class="complete">${Array.from({length:16},(_,i)=>`<span aria-hidden="true" class="confetti" style="--x:${5+i*6}%;--delay:${i%5*.1}s">${['⭐','✦','🌼','🍃'][i%4]}</span>`).join('')}<div class="complete-emoji" aria-hidden="true">${sticker?.emoji||'🏅'}</div><div class="eyebrow">今天的森林小礼物</div><h1>${sticker?`获得「${sticker.name}」贴纸！`:'小小列车长，又完成一趟！'}</h1><p>5 位小乘客都到站了，谢谢你的帮助。</p><div class="reward-line"><strong>⭐ +5 星星</strong><span>${sticker?'新贴纸已放进收藏册':'森林朋友为你鼓掌'}</span></div><p style="margin-bottom:12px;font-size:13px">这些是今天遇到的朋友，点一下再听听：</p><div class="round-review">${round.questions.map(q=>`<button class="pinyin" data-action="review" data-id="${q.target.id}" aria-label="复习 ${q.target.text}">${q.target.text}</button>`).join('')}</div><div class="complete-actions"><button class="primary" data-action="nav" data-view="stickers">看看我的贴纸${icon('star')}</button><button class="secondary" data-action="nav" data-view="map">返回冒险地图</button></div><p class="rest-note">一趟旅程完成啦，看看远处，休息一下吧 🌿</p></section></main>`;
  }
  function render() {
    app.innerHTML = `<div class="shell">${header()}${view==='map'?mapPage():view==='restaurant'?restaurant.render():view==='game'?gamePage():view==='book'?bookPage():view==='reward'?rewardPage():stickersPage()}</div>`;
    updateAudioUI();
  }
  function updateSoundButton() {
    const el = document.querySelector('#sound-button');
    if (el) {el.innerHTML=icon(progress.sound?'sound':'mute');el.setAttribute('aria-label',`${progress.sound?'关闭':'开启'}声音`);el.setAttribute('aria-pressed',String(progress.sound));}
  }
  function go(next) {
    stopAudio(); audioError = ''; view = next; render(); window.scrollTo({top:0,behavior:'instant'});
  }
  function start(id = selected) {
    if (!station(id)) return;
    selected=id; round=C.createRound(station(id),progress); reward=null;
    go('game');
    if(progress.sound) void playItem(currentQuestion().target,currentQuestion());
  }
  function openModal(html, className = '') {
    stopAudio();lastFocus=document.activeElement;
    modal.className=className;modal.innerHTML=html;modal.showModal();
  }
  const modalHeader = title => `<div class="modal-top"><h2>${title}</h2><button class="icon-button" data-action="close-modal" aria-label="关闭">${icon('close')}</button></div>`;
  function closeModal() {modal.close();lastFocus?.focus();}
  function settings() {
    openModal(`${modalHeader('家长小贴士')}<div class="modal-copy"><p>五个车站对应您提供的五张学习图，所有车站都能直接进入。每轮 5 题，优先练习还没遇到的拼音。</p><p><strong>奖励规则</strong><br>接到一位乘客得 1 颗星星，完成一轮获得 1 张新动物贴纸，按顺序收集，共 ${D.stickers.length} 张。答错、重听和使用提示都不扣分。</p><p><strong>陪玩建议</strong><br>先一起听，再请孩子选车票。声母是教学呼读音；整体认读音节按整个音节听。听到后可以跟读，本版不使用麦克风评分。</p><p><strong>保存在哪里？</strong><br>记录保存在当前设备、当前浏览器。换手机或清除浏览器数据后，不会自动同步。${storageAvailable?'':'当前浏览器无法保存，请更换普通浏览模式。'}</p><p>拼音音频来源：<a href="https://github.com/cmguo/PinYinSound" target="_blank" rel="noopener noreferrer">PinYinSound</a>。语音引导为合成语音，学习图为家长提供。</p></div><div class="modal-row"><div><strong>听听游戏说明</strong><p>和孩子一起熟悉玩法</p></div><button class="secondary" data-action="howto">${icon('sound')} 播放</button></div><div class="modal-row"><div><strong>重新开始收藏</strong><p>会清空这台设备上的星星和贴纸</p></div><button class="secondary danger" data-action="reset-confirm">清空记录</button></div>`);
  }
  function navigate(next) {
    if (!['map','book','stickers','restaurant'].includes(next)) return;
    if (view==='game' && round && !round.finished) {
      openModal(`${modalHeader('小火车要先停一会儿吗？')}<div class="modal-copy"><p>已经获得的星星会保留。这趟还没接满 5 位乘客，回到地图后会重新开始一轮。</p></div><div class="complete-actions"><button class="primary" data-action="close-modal">继续接乘客</button><button class="secondary" data-action="leave-confirm" data-view="${next}">先停一会儿</button></div>`);
    } else go(next);
  }
  function handleAction(el) {
    const action=el.dataset.action,id=el.dataset.id;
    if(action.startsWith('cafe-')&&view==='restaurant')return restaurant.handleAction(el);
    if(action==='sound'&&view==='restaurant')return restaurant.toggleSound();
    if(action==='nav') return navigate(el.dataset.view);
    if(action==='select') {selected=id;render();return;}
    if(action==='start') return start();
    if(action==='listen') return void playItem(currentQuestion().target,currentQuestion());
    if(action==='answer') {
      const q=currentQuestion();
      if(!q.heard&&!q.hinted) {toast('先点喇叭听一听，再来选车票吧。');return;}
      const result=C.answer(round,id,progress);
      if(!result.accepted)return;
      save();render();voice(result.correct?'correct':'retry');return;
    }
    if(action==='next') {
      if(!currentQuestion()?.solved)return;
      if(round.index===4){reward=C.finish(round,progress,D.stickers);if(reward){save();go('reward');voice('arrived');}}
      else {round.index++;go('game');if(progress.sound)void playItem(currentQuestion().target,currentQuestion());}
      return;
    }
    if(action==='hint') {const q=currentQuestion();q.hinted=true;render();voice('hint');return;}
    if(action==='howto') return voice('howto');
    if(action==='leave') return navigate('map');
    if(action==='leave-confirm') {closeModal();round=null;go(el.dataset.view);return;}
    if(action==='sound') {progress.sound=!progress.sound;save();if(!progress.sound)stopAudio();updateSoundButton();toast(progress.sound?'声音开启啦':'声音已关闭，点喇叭可重新开启');return;}
    if(action==='book-tab') {book=id;stopAudio();audioError='';render();return;}
    if(action==='learn') return void playItem(station(book).items.find(i=>i.id===id));
    if(action==='review') return void playItem(round.questions.find(q=>q.target.id===id).target);
    if(action==='book-start') return start(book);
    if(action==='poster') return openModal(`${modalHeader(station(book).short)}<img src="assets/posters/${book}.png" alt="${station(book).short}原始学习图">`,'poster-modal');
    if(action==='settings') return settings();
    if(action==='close-modal') return closeModal();
    if(action==='reset-confirm') {modal.innerHTML=`${modalHeader('确定清空收藏吗？')}<div class="modal-copy"><p>这会删除当前浏览器里的 ${progress.stars} 颗星星、${progress.stickers.length} 张贴纸和练习记录，不能撤销。</p></div><div class="complete-actions"><button class="primary" data-action="close-modal">保留我的收藏</button><button class="secondary danger" data-action="reset">确定清空</button></div>`;return;}
    if(action==='reset') {progress=C.defaults();save();round=null;closeModal();go('map');toast('收藏册重新准备好了，一起出发吧。');}
  }
  document.addEventListener('click',event=>{
    const el=event.target.closest('[data-action]');
    if(el&&!el.disabled) handleAction(el);
  });
  modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();}});
  modal.addEventListener('close',()=>{stopAudio();lastFocus?.focus();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
  window.addEventListener('pagehide',()=>stopAudio());
  window.addEventListener('beforeunload',event=>{if(view==='game'&&round?.questions.some(q=>q.solved)&&!round.finished){event.preventDefault();event.returnValue='';}});
  icons.restaurant='<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M16 3v8h4V3M20 11v10"/>';
  restaurant=window.RestaurantGame.create({onChange:render,player:document.querySelector('#restaurant-audio')});
  render();
  // Optional browser-native agent support. The same validated actions power the UI.
  const modelContext=document.modelContext;
  if(modelContext?.registerTool) {
    const lifecycle=new AbortController();
    const tools=[
      {name:'get_pinyin_train_progress',title:'查看拼音小火车进度',description:'Read current local stars, completed trips, stickers and the visible station. Does not reveal quiz answers.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({view,station:round?.stationId||selected,stars:progress.stars,trips:progress.trips,stickers:progress.stickers.length})},
      {name:'start_pinyin_train_station',title:'开始一站拼音游戏',description:'Start a new five-question trip at a named station. Fails if another trip is active.',inputSchema:{type:'object',properties:{station:{type:'string',enum:D.stations.map(s=>s.id)}},required:['station'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||Object.keys(input).some(k=>k!=='station')||!station(input.station))throw new Error('Invalid station');if(view==='game'||modal.open)throw new Error('Finish or leave the current activity first');start(input.station);return{view,station:round.stationId,questions:5};}}
    ];
    for(const tool of tools){try{Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
})();
