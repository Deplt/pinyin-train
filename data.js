(function (root) {
  const make = (text, word, emoji, audio, group) => ({ id: text, text, word, emoji, audio: audio || text, group });
  const initials = [
    ['b','白兔','🐰'],['p','山坡','⛰️'],['m','小猫','🐱'],['f','蜜蜂','🐝'],
    ['d','大象','🐘'],['t','兔子','🐇'],['n','奶牛','🐮'],['l','老虎','🐯'],
    ['g','公鸡','🐓'],['k','蝌蚪','🫧'],['h','河马','🦛'],['j','金鱼','🐠'],
    ['q','青蛙','🐸'],['x','小熊','🐻'],['zh','蜘蛛','🕷️'],['ch','长颈鹿','🦒'],
    ['sh','狮子','🦁'],['r','热气球','🎈'],['z','足球','⚽'],['c','彩虹','🌈'],
    ['s','松鼠','🐿️'],['y','鸭子','🦆'],['w','乌龟','🐢']
  ].map(x => make(...x));
  const finals = [
    ['a','阿姨','👩','a','单韵母'],['o','喔喔','🐓','o','单韵母'],['e','白鹅','🪿','e','单韵母'],
    ['i','衣服','👕','i','单韵母'],['u','乌鸦','🐦‍⬛','u','单韵母'],['ü','小鱼','🐠','v','单韵母'],
    ['ai','白菜','🥬','ai','复韵母'],['ei','杯子','☕','ei','复韵母'],['ui','乌龟','🐢','ui','复韵母'],
    ['ao','桃子','🍑','ao','复韵母'],['ou','海鸥','🕊️','ou','复韵母'],['iu','气球','🎈','iu','复韵母'],
    ['ie','蝴蝶','🦋','ie','复韵母'],['üe','月亮','🌙','ve','复韵母']
  ].map(x => make(...x));
  const nasals = [
    ['an','安全','🪖','an','前鼻韵母'],['en','恩人','🐻','en','前鼻韵母'],
    ['in','音乐','🎵','in','前鼻韵母'],['un','春笋','🎋','un','前鼻韵母'],
    ['ün','白云','☁️','vn','前鼻韵母'],['ang','水缸','🪣','ang','后鼻韵母'],
    ['eng','台灯','💡','eng','后鼻韵母'],['ing','老鹰','🦅','ing','后鼻韵母'],
    ['ong','闹钟','⏰','ong','后鼻韵母'],['er','耳朵','👂','er','特殊韵母']
  ].map(x => make(...x));
  const whole = [
    ['zhi','蜘蛛','🕷️'],['chi','吃饭','🍚'],['shi','狮子','🦁'],['ri','日历','📅'],
    ['zi','字卡','🪪'],['ci','刺猬','🦔'],['si','丝瓜','🥒'],['yi','衣服','👕'],
    ['wu','乌龟','🐢'],['yu','小鱼','🐠'],['ye','椰子','🥥'],['yue','月亮','🌙'],
    ['yuan','圆圈','⭕'],['yin','音乐','🎵'],['yun','白云','☁️'],['ying','老鹰','🦅']
  ].map(x => make(...x, `${x[0]}1`));
  const toneNames = ['一声平','二声扬','三声拐弯','四声降'];
  const tones = [
    ['a','ā á ǎ à'],['o','ō ó ǒ ò'],['e','ē é ě è'],
    ['i','ī í ǐ ì'],['u','ū ú ǔ ù'],['v','ǖ ǘ ǚ ǜ'],['ba','bā bá bǎ bà']
  ].flatMap(([base, values]) => values.split(' ').map((text, i) => ({
    ...make(text, base === 'ba' ? ['八','拔萝卜','把伞','爸爸'][i] : toneNames[i], ['🐦','🐥','🐼','🦔'][i], `${base}${i + 1}`, '四声'),
    base, tone: i + 1
  })));
  const stations = [
    {id:'initials',name:'声母森林',short:'声母',emoji:'🌳',color:'#e5f2dd',accent:'#4a8050',sample:'b p m f',desc:'和小动物一起，找找声母朋友',tip:'声母读得轻、短、有力。',items:initials},
    {id:'finals',name:'韵母花园',short:'单韵母和复韵母',emoji:'🌷',color:'#fff0d5',accent:'#a66a27',sample:'a o e · ai ei',desc:'单韵母、复韵母，都来花园集合',tip:'单韵母口形不变，复韵母口形要滑动。',items:finals},
    {id:'nasals',name:'鼻韵母山谷',short:'鼻韵母和特殊韵母',emoji:'⛰️',color:'#e5eff9',accent:'#437a9c',sample:'an ang · er',desc:'听清小尾巴，分清前鼻音和后鼻音',tip:'前鼻音收在 n，后鼻音收在 ng；er 可以自成音节。',items:nasals},
    {id:'whole',name:'整体认读小镇',short:'整体认读音节',emoji:'🏡',color:'#f2e9f8',accent:'#8760a2',sample:'zhi chi shi',desc:'熟悉的整体认读朋友，见面就读',tip:'整体认读音节要整体读，不能拆开拼。',items:whole},
    {id:'tones',name:'声调彩虹站',short:'声调与标调规则',emoji:'🌈',color:'#ffe9e1',accent:'#b7684c',sample:'ā á ǎ à',desc:'坐上声音滑梯，听一听四声的变化',tip:'一声平，二声扬，三声拐弯，四声降。',items:tones}
  ];
  const stickers = [
    // Saved collections refer to these IDs. Keep released IDs and order; append new friends only.
    ['rabbit','🐰','兔子列车长'],['squirrel','🐿️','松鼠好朋友'],['bear','🐻','森林小熊'],
    ['panda','🐼','竹林熊猫'],['fox','🦊','聪明小狐狸'],['deer','🦌','花园小鹿'],
    ['owl','🦉','智慧猫头鹰'],['hedgehog','🦔','勇敢小刺猬'],['frog','🐸','池塘歌唱家'],
    ['lion','🦁','阳光小狮子'],['penguin','🐧','快乐小企鹅'],['unicorn','🦄','彩虹独角兽'],
    ['cat','🐱','花园小猫'],['dog','🐶','热心小狗'],['tiger','🐯','勇气小老虎'],
    ['elephant','🐘','大象好伙伴'],['giraffe','🦒','长颈鹿向导'],['zebra','🦓','条纹小斑马'],
    ['monkey','🐵','机灵小猴子'],['koala','🐨','抱抱考拉'],['sloth','🦥','慢慢小树懒'],
    ['raccoon','🦝','探险小浣熊'],['otter','🦦','水獭游泳家'],['beaver','🦫','河狸小工匠'],
    ['hippo','🦛','河马大朋友'],['rhino','🦏','犀牛守护者'],['kangaroo','🦘','蹦蹦小袋鼠'],
    ['camel','🐪','沙漠小骆驼'],['horse','🐴','草原小马'],['cow','🐮','牧场小奶牛'],
    ['sheep','🐑','绵绵小羊'],['pig','🐷','开心小猪'],['alpaca','🦙','软软羊驼'],
    ['duck','🦆','池塘小鸭'],['chick','🐥','叽叽小鸡'],['parrot','🦜','鹦鹉歌唱家'],
    ['peacock','🦚','漂亮小孔雀'],['swan','🦢','湖畔小天鹅'],['turtle','🐢','坚持小乌龟'],
    ['dolphin','🐬','海豚领航员'],['whale','🐳','喷水小鲸鱼'],['seal','🦭','拍手小海豹'],
    ['octopus','🐙','章鱼小画家'],['crab','🦀','横走小螃蟹'],['fish','🐠','珊瑚小鱼'],
    ['butterfly','🦋','蝴蝶舞蹈家'],['bee','🐝','勤劳小蜜蜂'],['ladybug','🐞','花间小瓢虫']
  ].map(([id,emoji,name]) => ({id,emoji,name}));
  const data = { stations, stickers, toneNames };
  root.PinyinData = data;
  if (typeof module !== 'undefined') module.exports = data;
})(typeof globalThis !== 'undefined' ? globalThis : window);
