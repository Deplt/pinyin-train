(function(root){
  'use strict';
  // Each recipe uses two-part Pinyin spelling, with the tone kept on the final.
  const recipes=[
    ['pear','梨','🍐','lí','l','í','li2','i2','n','ǐ'],
    ['peach','桃','🍑','táo','t','áo','tao2','ao2','d','ào'],
    ['rice','饭','🍚','fàn','f','àn','fan4','an4','h','án'],
    ['tea','茶','🍵','chá','ch','á','cha2','a2','c','ǎ'],
    ['candy','糖','🍬','táng','t','áng','tang2','ang2','d','án'],
    ['egg','蛋','🥚','dàn','d','àn','dan4','an4','b','àng'],
    ['milk','奶','🥛','nǎi','n','ǎi','nai3','ai3','l','ài'],
    ['meat','肉','🍖','ròu','r','òu','rou4','ou4','l','óu'],
    ['bean','豆','🫘','dòu','d','òu','dou4','ou4','t','ǒu'],
    ['greens','菜','🥬','cài','c','ài','cai4','ai4','ch','ǎi'],
    ['soup','汤','🥣','tāng','t','āng','tang1','ang1','d','áng'],
    ['bun','包','🥟','bāo','b','āo','bao1','ao1','p','áo']
  ].map(([id,word,emoji,pinyin,initial,final,audio,finalAudio,nearInitial,nearFinal])=>({
    id,word,emoji,pinyin,parts:[initial,final],audio,partAudio:[initial,finalAudio],cards:[initial,final,nearInitial,nearFinal]
  }));
  const slots=[{id:'hat',name:'帽子',icon:'👒'},{id:'apron',name:'围裙',icon:'👕'},{id:'table',name:'餐桌',icon:'🍽️'},{id:'chair',name:'椅子',icon:'🪑'},{id:'room',name:'小摆设',icon:'🪴'},{id:'wall',name:'墙纸',icon:'🎨'},{id:'view',name:'窗外',icon:'🌳'}];
  const positions=[{id:'floor',name:'窗边',icon:'🪴',starter:'room-window'},{id:'shelf',name:'窗台',icon:'⭐'},{id:'wallart',name:'挂画',icon:'🖼️'},{id:'party',name:'角落',icon:'🎈'}];
  const propPositions={'room-window':'floor','room-sprout':'floor','room-fishbowl':'floor','room-lamp':'shelf','room-rainbow':'wallart','room-clock':'wallart','room-balloon':'party'};
  // Keep released decoration IDs stable. These never use the train's sticker IDs or storage.
  const starters=[
    ['hat-white','hat','小白厨师帽'],['apron-white','apron','白白小围裙'],['table-wood','table','温暖木桌'],['chair-wood','chair','小木椅'],
    ['room-window','room','今日小黑板'],['wall-cream','wall','奶油色墙纸'],['view-day','view','晴天森林']
  ];
  // Every finished visit (3 guests) unlocks exactly one gift, in this order.
  // The first twelve keep their original order so older saves continue naturally.
  const gifts=[
    ['room-sprout','room','窗边小绿植'],['hat-bunny','hat','兔耳厨师帽'],['table-flower','table','花朵餐桌'],['chair-panda','chair','熊猫椅子'],
    ['room-lamp','room','星星小夜灯'],['hat-crown','hat','小小主厨冠'],['table-ocean','table','海洋餐桌'],['chair-bunny','chair','兔兔椅子'],
    ['room-rainbow','room','彩虹挂画'],['hat-bear','hat','小熊厨师帽'],['table-picnic','table','野餐格子桌'],['chair-cat','chair','猫咪椅子'],
    ['wall-mint','wall','薄荷条纹墙'],['view-sunset','view','晚霞满天'],['apron-check','apron','红格子围裙'],['hat-strawberry','hat','草莓帽'],
    ['room-fishbowl','room','小鱼缸'],['table-candy','table','甜甜蛋糕桌'],['chair-mushroom','chair','蘑菇小凳'],['wall-heart','wall','粉色爱心墙'],
    ['view-night','view','星星和月亮'],['apron-dots','apron','蓝色波点围裙'],['hat-flower','hat','小花环'],['room-clock','room','咕咕钟'],
    ['table-star','table','星空烛光桌'],['chair-sofa','chair','草莓小沙发'],['wall-star','wall','星星墙纸'],['view-snow','view','下雪啦'],
    ['apron-rainbow','apron','彩虹围裙'],['hat-party','hat','派对尖尖帽'],['room-balloon','room','彩色气球'],['wall-leaf','wall','森林叶子墙'],
    ['view-sea','view','大海和小船']
  ];
  const decorations=[...starters.map(d=>[...d,false]),...gifts.map(d=>[...d,true])].map(([id,slot,name,gift])=>({id,slot,name,gift,...(slot==='room'?{position:propPositions[id]}:{})}));
  // A theme is a preference list, never an unlock. Use the first owned piece in each list.
  const themes=[
    {id:'forest',name:'森林木屋',icon:'🌿',description:'温暖木色，窗边有一点绿',pieces:{hat:['hat-bear','hat-white'],apron:['apron-check','apron-white'],table:['table-picnic','table-wood'],chair:['chair-cat','chair-wood'],wall:['wall-leaf','wall-mint','wall-cream'],view:['view-day']},props:{floor:['room-sprout','room-window'],shelf:[],wallart:['room-clock'],party:[]}},
    {id:'garden',name:'花园茶屋',icon:'🌼',description:'小花、兔耳和柔软的奶油色',pieces:{hat:['hat-flower','hat-bunny','hat-white'],apron:['apron-white'],table:['table-flower','table-wood'],chair:['chair-bunny','chair-wood'],wall:['wall-mint','wall-cream'],view:['view-day']},props:{floor:['room-sprout','room-window'],shelf:[],wallart:['room-rainbow'],party:[]}},
    {id:'night',name:'星空小店',icon:'🌙',description:'点一盏暖灯，等星星来做客',pieces:{hat:['hat-crown','hat-white'],apron:['apron-dots','apron-white'],table:['table-star','table-wood'],chair:['chair-panda','chair-wood'],wall:['wall-star','wall-cream'],view:['view-night','view-day']},props:{floor:['room-window'],shelf:['room-lamp'],wallart:[],party:['room-balloon']}}
  ];
  const artAssets=['bear-gouache','forest-gouache','table-gouache','chair-gouache','plant-gouache','table-flower-gouache','table-picnic-gouache','table-star-gouache','chair-bunny-gouache','chair-panda-gouache','chair-cat-gouache','night-gouache'];
  const guests=[{name:'小兔',emoji:'🐰'},{name:'小熊',emoji:'🐻'},{name:'小狐狸',emoji:'🦊'},{name:'熊猫',emoji:'🐼'},{name:'小猫',emoji:'🐱'},{name:'小鹿',emoji:'🦌'}];
  const data={recipes,decorations,slots,positions,themes,artAssets,guests};
  root.RestaurantData=data;
  if(typeof module!=='undefined')module.exports=data;
})(typeof globalThis!=='undefined'?globalThis:window);
