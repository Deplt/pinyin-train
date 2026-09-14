(function (root) {
  const shuffle = (items, random = Math.random) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const defaults = () => ({version:1,stars:0,trips:0,stickers:[],completed:{},seen:{},sound:true});
  function restore(raw, data) {
    const p = defaults();
    if (!raw || raw.version !== 1) return p;
    const count = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
    p.stars = count(raw.stars); p.trips = count(raw.trips); p.sound = raw.sound !== false;
    p.stickers = data.stickers.map(s => s.id).filter(id => Array.isArray(raw.stickers) && raw.stickers.includes(id));
    for (const station of data.stations) {
      p.completed[station.id] = count(raw.completed?.[station.id]);
      p.seen[station.id] = station.items.map(i => i.id).filter(id => Array.isArray(raw.seen?.[station.id]) && raw.seen[station.id].includes(id));
    }
    return p;
  }
  const confusion = [ ['b','p','d'],['m','n','l'],['f','h','t'],['g','k','h'],['j','q','x'],
    ['zh','ch','sh','r','z','c','s'],['an','ang','en','eng'],['in','ing','un','ün'],['ie','ei','üe'],
    ['ai','ei','ui'],['ao','ou','iu'],['zhi','chi','shi','zi','ci','si'],['yi','yin','ying'],['yu','yun','yuan','yue'] ];
  function createRound(station, progress, random = Math.random) {
    const seen = new Set(progress.seen[station.id] || []);
    const chosen = [...shuffle(station.items.filter(i => !seen.has(i.id)), random), ...shuffle(station.items.filter(i => seen.has(i.id)), random)].slice(0,5);
    return {stationId:station.id,index:0,finished:false,awarded:false,questions:chosen.map(target => {
      const candidates = station.items.filter(item => item.id !== target.id && (!target.tone || item.base === target.base));
      const group = confusion.find(g => g.includes(target.id)) || [];
      const near = shuffle(candidates.filter(c => group.includes(c.id)), random);
      const other = shuffle(candidates.filter(c => !group.includes(c.id)), random);
      const options = shuffle([target,...near,...other].slice(0,target.tone ? 4 : 3),random);
      return {target,options,solved:false,mistakes:[],hinted:false};
    })};
  }
  function answer(round, choiceId, progress) {
    const q = round?.questions[round.index];
    if (!q || q.solved || round.finished || !q.options.some(i => i.id === choiceId)) return {accepted:false};
    if (choiceId !== q.target.id) {
      if (!q.mistakes.includes(choiceId)) q.mistakes.push(choiceId);
      return {accepted:true,correct:false};
    }
    q.solved = true;
    progress.stars += 1;
    progress.seen[round.stationId] ||= [];
    if (!progress.seen[round.stationId].includes(choiceId)) progress.seen[round.stationId].push(choiceId);
    return {accepted:true,correct:true};
  }
  function finish(round, progress, stickers) {
    if (!round || round.awarded || !round.questions.every(q => q.solved)) return null;
    round.finished = true; round.awarded = true;
    progress.trips += 1;
    progress.completed[round.stationId] = (progress.completed[round.stationId] || 0) + 1;
    const sticker = stickers.find(s => !progress.stickers.includes(s.id));
    if (sticker) progress.stickers.push(sticker.id);
    return {sticker:sticker || null,stars:5};
  }
  const api = {defaults,restore,shuffle,createRound,answer,finish};
  root.PinyinCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
