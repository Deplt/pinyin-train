(function(root){
  'use strict';
  const D=root.RestaurantData||(typeof require==='function'?require('./restaurant-data.js'):null);
  const STORAGE_KEY='pinyin-animal-restaurant-v1';
  const recipe=id=>D.recipes.find(r=>r.id===id);
  const count=n=>Number.isSafeInteger(n)&&n>=0?n:0;
  const defaults=()=>({version:1,served:0,shifts:0,dishes:{},unlocked:[],equipped:Object.fromEntries(D.decorations.filter(d=>!d.guests).map(d=>[d.slot,d.id])),sound:true,session:null});
  const foods=p=>Object.keys(p.dishes).filter(id=>recipe(id)&&p.dishes[id]>0).length;
  const available=(p,d)=>!d.guests||p.unlocked.includes(d.id);
  function restore(raw){
    const p=defaults();
    if(!raw||raw.version!==1)return p;
    p.served=count(raw.served);p.shifts=count(raw.shifts);p.sound=raw.sound!==false;
    for(const r of D.recipes)if(count(raw.dishes?.[r.id]))p.dishes[r.id]=count(raw.dishes[r.id]);
    p.unlocked=D.decorations.filter(d=>d.guests&&Array.isArray(raw.unlocked)&&raw.unlocked.includes(d.id)).map(d=>d.id);
    for(const slot of D.slots){const d=D.decorations.find(d=>d.slot===slot.id&&d.id===raw.equipped?.[slot.id]);if(d&&available(p,d))p.equipped[slot.id]=d.id;}
    const s=raw.session;
    if(s&&Array.isArray(s.orders)&&s.orders.length===3&&new Set(s.orders.map(o=>o?.recipeId)).size===3&&s.orders.every(o=>{
      const r=recipe(o?.recipeId);return r&&Array.isArray(o.cards)&&o.cards.length===4&&new Set(o.cards).size===4&&o.cards.every(c=>r.cards.includes(c));
    })&&Number.isInteger(s.index)&&s.index>=0&&s.index<3&&['building','cooked','served','done'].includes(s.phase)){
      const r=recipe(s.orders[s.index].recipeId),cards=s.orders[s.index].cards;
      const picked=Array.from({length:2},(_,i)=>cards.includes(s.picked?.[i])?s.picked[i]:null);
      const validPhase=s.phase==='building'||picked.every((v,i)=>v===r.parts[i]);
      if(validPhase&&(s.phase!=='done'||s.index===2)&&(s.phase!=='served'||s.index<2))p.session={
        orders:s.orders.map(o=>({recipeId:o.recipeId,cards:[...o.cards]})),index:s.index,phase:s.phase,picked,
        hinted:s.hinted===true,checked:s.checked===true,guestOffset:count(s.guestOffset)%D.guests.length,
        rewards:D.decorations.filter(d=>Array.isArray(s.rewards)&&s.rewards.includes(d.id)&&p.unlocked.includes(d.id)).map(d=>d.id)
      };
    }
    return p;
  }
  function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function start(p,random=Math.random){
    if(p.session&&p.session.phase!=='done')return p.session;
    const ordered=[...shuffle(D.recipes.filter(r=>!p.dishes[r.id]),random),...shuffle(D.recipes.filter(r=>p.dishes[r.id]),random)];
    p.session={orders:ordered.slice(0,3).map(r=>({recipeId:r.id,cards:shuffle(r.cards,random)})),index:0,phase:'building',picked:[null,null],hinted:false,checked:false,guestOffset:p.shifts%D.guests.length,rewards:[]};
    return p.session;
  }
  function place(p,index,card){
    const s=p.session;
    if(!s||s.phase!=='building'||![0,1].includes(index)||!s.orders[s.index].cards.includes(card))return false;
    s.picked[index]=card;s.checked=false;return true;
  }
  function clear(p,index){if(!p.session||p.session.phase!=='building'||![0,1].includes(index))return false;p.session.picked[index]=null;p.session.checked=false;return true;}
  function hint(p){if(!p.session||p.session.phase!=='building')return false;p.session.hinted=true;return true;}
  function cook(p){
    const s=p.session;if(!s||s.phase!=='building'||s.picked.some(v=>v===null))return {accepted:false};
    s.checked=true;const correct=recipe(s.orders[s.index].recipeId).parts.every((part,i)=>part===s.picked[i]);
    if(correct)s.phase='cooked';return {accepted:true,correct};
  }
  function serve(p){
    const s=p.session;if(!s||s.phase!=='cooked')return null;
    const id=s.orders[s.index].recipeId;p.served++;p.dishes[id]=(p.dishes[id]||0)+1;
    const unlocked=D.decorations.filter(d=>d.guests&&!p.unlocked.includes(d.id)&&p.served>=d.guests&&foods(p)>=d.foods);
    p.unlocked.push(...unlocked.map(d=>d.id));s.rewards.push(...unlocked.map(d=>d.id));
    s.phase=s.index===2?'done':'served';if(s.phase==='done')p.shifts++;
    return {unlocked,done:s.phase==='done'};
  }
  function next(p){const s=p.session;if(!s||s.phase!=='served')return false;s.index++;s.phase='building';s.picked=[null,null];s.hinted=false;s.checked=false;return true;}
  function equip(p,id){const d=D.decorations.find(d=>d.id===id);if(!d||!available(p,d))return false;p.equipped[d.slot]=d.id;return true;}
  const api={STORAGE_KEY,defaults,restore,foods,available,recipe,start,place,clear,hint,cook,serve,next,equip};
  root.RestaurantCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);
