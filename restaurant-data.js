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
  const slots=[{id:'hat',name:'厨师帽'},{id:'table',name:'餐桌'},{id:'chair',name:'椅子'},{id:'room',name:'小摆设'}];
  // Keep released decoration IDs stable. These never use the train's sticker IDs or storage.
  const decorations=[
    ['hat-white','hat','小白厨师帽','👨‍🍳',0,0],['table-wood','table','温暖木桌','🪵',0,0],
    ['chair-wood','chair','小木椅','🪑',0,0],['room-window','room','晴天窗台','☀️',0,0],
    ['room-sprout','room','窗边小绿植','🪴',3,3],['hat-bunny','hat','兔耳厨师帽','🐰',6,4],
    ['table-flower','table','花朵餐桌','🌼',9,6],['chair-panda','chair','熊猫椅子','🐼',12,8],
    ['room-lamp','room','星星小夜灯','🌟',18,10],['hat-crown','hat','小小主厨冠','👑',24,12],
    ['table-ocean','table','海洋餐桌','🐚',30,12],['chair-bunny','chair','兔兔椅子','🐰',36,12],
    ['room-rainbow','room','彩虹挂画','🌈',42,12],['hat-bear','hat','小熊厨师帽','🐻',48,12],
    ['table-picnic','table','野餐格子桌','🧺',54,12],['chair-cat','chair','猫咪椅子','🐱',60,12]
  ].map(([id,slot,name,emoji,guests,foods])=>({id,slot,name,emoji,guests,foods}));
  const guests=[{name:'小兔',emoji:'🐰'},{name:'小熊',emoji:'🐻'},{name:'小狐狸',emoji:'🦊'},{name:'熊猫',emoji:'🐼'},{name:'小猫',emoji:'🐱'},{name:'小鹿',emoji:'🦌'}];
  const data={recipes,decorations,slots,guests};
  root.RestaurantData=data;
  if(typeof module!=='undefined')module.exports=data;
})(typeof globalThis!=='undefined'?globalThis:window);
