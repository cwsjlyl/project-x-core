import type { ScienceQuestion } from './ScienceBank';

/** 森林／極地／沙漠學習站題庫：香港小學二年級科學探索，港式繁中，非評核試卷。 */
export const BIOME_QUESTIONS: ScienceQuestion[] = [
  {
    id: 'forest_life-1',
    topic: 'forest_life',
    prompt: '松鼠通常住喺邊度？',
    choices: ['樹上或者樹洞', '海底', '沙漠沙丘中間'],
    answer: 0,
    explain: '好多松鼠會喺樹上活動，又會用樹洞做安身嘅地方。',
    hint: '諗吓公園或者山林裏面，松鼠多數喺邊度跳來跳去。',
    speak: '樹上'
  },
  {
    id: 'forest_life-2',
    topic: 'forest_life',
    prompt: '狐狸同松鼠相比，邊樣較常喺地面搵食物？',
    choices: ['狐狸', '兩邊都只會飛', '兩邊都只會游水'],
    answer: 0,
    explain: '狐狸多數喺地面活動同搵食物，松鼠就較常喺樹上。',
    hint: '觀察動物時，可以先睇佢哋主要喺樹定地上活動。',
    speak: '地面'
  },
  {
    id: 'forest_life-3',
    topic: 'forest_life',
    prompt: '貓頭鷹多數喺咩時候比較活躍？',
    choices: ['夜晚', '只得正午先會出動', '只會喺落大雨時出現'],
    answer: 0,
    explain: '好多貓頭鷹夜晚先出動捉食物，日間多數休息。',
    hint: '有啲動物日頭活動，有啲夜晚先出來。',
    speak: '夜晚'
  },
  {
    id: 'forest_life-4',
    topic: 'forest_life',
    prompt: '森林裏面嘅小鳥，最常用咩方法移動？',
    choices: ['飛行', '鑽入地底好深', '喺水底長期生活'],
    answer: 0,
    explain: '小鳥有翅膀，主要靠飛行喺樹林之間移動。',
    hint: '觀察小鳥最明顯嘅特徵係翅膀。',
    speak: '飛行'
  },
  {
    id: 'forest_life-5',
    topic: 'forest_life',
    prompt: '想安全觀察林間小動物，應該點做？',
    choices: ['保持距離，安靜觀察', '大聲追趕同捕捉', '用石頭擲向動物'],
    answer: 0,
    explain: '觀察動物要保持距離、保持安靜，先唔會嚇親佢哋，自己亦較安全。',
    hint: '我哋係去認識動物，唔係去打擾佢哋。',
    speak: '觀察'
  },
  {
    id: 'forest_life-6',
    topic: 'forest_life',
    prompt: '松鼠喜歡儲起邊類食物過冬？',
    choices: ['堅果或者種子', '大石', '塑膠樽'],
    answer: 0,
    explain: '松鼠會蒐集堅果、種子等食物，儲起嚟慢慢食。',
    hint: '秋天有時會見到松鼠喺度搬細細粒嘅果實。',
    speak: '堅果'
  },
  {
    id: 'forest_life-7',
    topic: 'forest_life',
    prompt: '以下邊種屬於森林常見嘅動物？',
    choices: ['松鼠', '鯨魚', '駱駝'],
    answer: 0,
    explain: '松鼠係樹林裏面好常見嘅小動物；鯨魚住喺海，駱駝較常喺乾旱地方。',
    hint: '諗吓校園附近樹林會見到邊啲動物。',
    speak: '松鼠'
  },
  {
    id: 'forest_life-8',
    topic: 'forest_life',
    prompt: '點解森林可以成為好多動物嘅家？',
    choices: ['有食物、藏身處同適合生活嘅環境', '完全冇植物', '一定冇水亦冇陰影'],
    answer: 0,
    explain: '森林有植物、食物同可以藏身嘅地方，所以好多動物都可以喺度生活。',
    hint: '動物需要食、住同一個適合自己嘅環境。',
    speak: '家園'
  },
  {
    id: 'forest_plants-1',
    topic: 'forest_plants',
    prompt: '綠色植物生長，通常最需要邊啲條件？',
    choices: ['陽光、空氣同水', '只需要石頭', '完全唔需要光同水'],
    answer: 0,
    explain: '綠色植物多數需要陽光、空氣同水，先可以健康生長。',
    hint: '試吓把盆栽放到暗處同缺水，睇吓會點。',
    speak: '陽光'
  },
  {
    id: 'forest_plants-2',
    topic: 'forest_plants',
    prompt: '樹葉主要有咩作用？',
    choices: ['接收陽光，幫助植物製造養分', '專門用來發出聲音', '令樹木變成動物'],
    answer: 0,
    explain: '葉子可以接收陽光，幫助植物製造生長所需嘅養分。',
    hint: '大樹嘅葉子多數向住陽光。',
    speak: '葉子'
  },
  {
    id: 'forest_plants-3',
    topic: 'forest_plants',
    prompt: '種子通常有咩用途？',
    choices: ['長出新植物', '令泥土變成金屬', '發出指南針方向'],
    answer: 0,
    explain: '種子喺合適嘅環境下可以發芽，長出新嘅植物。',
    hint: '花盆裏面種綠豆，就會見到種子發芽。',
    speak: '種子'
  },
  {
    id: 'forest_plants-4',
    topic: 'forest_plants',
    prompt: '植物嘅根主要做咩？',
    choices: ['固定植物，吸收水和養分', '專門用來飛行', '發出很大嘅聲音'],
    answer: 0,
    explain: '根會抓住泥土，仲可以吸收水和養分，幫助植物生長。',
    hint: '輕輕拔起一棵小菜，就會見到根喺泥土裏面。',
    speak: '根'
  },
  {
    id: 'forest_plants-5',
    topic: 'forest_plants',
    prompt: '把一盆小植物長期放喺完全冇光嘅櫃桶，通常會點？',
    choices: ['生長較差，葉子可能變黃或枯萎', '一定長得更快更高', '即刻變成石頭'],
    answer: 0,
    explain: '缺少陽光，綠色植物就較難製造養分，生長會變差。',
    hint: '植物同我哋一樣，都需要合適嘅生活條件。',
    speak: '陽光'
  },
  {
    id: 'forest_plants-6',
    topic: 'forest_plants',
    prompt: '森林裏面高高大大嘅樹，屬於邊類生物？',
    choices: ['植物', '動物', '石頭'],
    answer: 0,
    explain: '樹係植物，會生長、需要陽光同水，但唔會自己走來走去。',
    hint: '生物可以分為動物、植物等；樹唔會自行移動。',
    speak: '植物'
  },
  {
    id: 'forest_plants-7',
    topic: 'forest_plants',
    prompt: '想幫校園小盆栽生長得更好，邊個做法較合適？',
    choices: ['適量澆水，放到有光線嘅地方', '每日倒入大量鹹水', '用黑布長期完全蓋住'],
    answer: 0,
    explain: '適量嘅水同足夠光線，先有助盆栽健康生長；太多唔適合嘅水或者長期冇光都唔好。',
    hint: '照顧植物要適中，唔係愈多水就愈好。',
    speak: '澆水'
  },
  {
    id: 'forest_plants-8',
    topic: 'forest_plants',
    prompt: '花凋謝之後，有時會結出咩嚟延續生命？',
    choices: ['果實同種子', '磁鐵', '膠盒'],
    answer: 0,
    explain: '好多開花植物喺花謝之後會結出果實，裏面有種子，可以長出新植物。',
    hint: '觀察校園花卉，有時花後會見到細果。',
    speak: '果實'
  },
  {
    id: 'forest_home-1',
    topic: 'forest_home',
    prompt: '大樹可以為林間動物提供咩？',
    choices: ['陰影、食物同棲息嘅地方', '只會提供塑膠', '只會提供汽車'],
    answer: 0,
    explain: '大樹可以遮陰、提供果實或葉子作食物，亦可以做巢穴或棲息處。',
    hint: '鳥兒築巢，好多時會揀樹枝之間。',
    speak: '棲息'
  },
  {
    id: 'forest_home-2',
    topic: 'forest_home',
    prompt: '森林地面層層落葉，慢慢會變成咩？',
    choices: ['養分豐富嘅泥土', '即刻變成金屬', '永遠唔會改變'],
    answer: 0,
    explain: '落葉腐爛之後，可以變成有養分嘅泥土，幫助其他植物生長。',
    hint: '落葉唔係垃圾，喺自然裏面會慢慢變化。',
    speak: '泥土'
  },
  {
    id: 'forest_home-3',
    topic: 'forest_home',
    prompt: '點解森林裏面會比較清涼？',
    choices: ['樹木阻擋部分陽光，提供陰影', '森林一定靠近火山', '樹木會發出雪花'],
    answer: 0,
    explain: '茂密嘅樹冠可以阻擋部分陽光，令林下較為陰涼。',
    hint: '夏天行入樹蔭，通常會覺得涼快啲。',
    speak: '樹蔭'
  },
  {
    id: 'forest_home-4',
    topic: 'forest_home',
    prompt: '以下邊樣最能夠形容「棲息地」？',
    choices: ['動物生活同搵食嘅地方', '一本故事書嘅封面', '一件不能移動嘅傢俬名稱'],
    answer: 0,
    explain: '棲息地就係動物生活、藏身同搵食物嘅環境，例如森林、草地。',
    hint: '唔同動物適合唔同嘅生活環境。',
    speak: '棲息地'
  },
  {
    id: 'forest_home-5',
    topic: 'forest_home',
    prompt: '如果把整片樹林完全砍走，林間動物可能會點？',
    choices: ['失去家園同食物，生活變得困難', '全部即刻變成魚', '完全唔受影響'],
    answer: 0,
    explain: '樹木係好多動物嘅家同食物來源，樹林消失就會令佢哋難以生活。',
    hint: '想保護動物，亦要保護佢哋住嘅環境。',
    speak: '家園'
  },
  {
    id: 'forest_home-6',
    topic: 'forest_home',
    prompt: '行山時聽到蟲鳴同鳥叫，主要說明咩？',
    choices: ['呢度可能有生物喺度生活', '一定有工廠好近', '聲音一定來自石頭'],
    answer: 0,
    explain: '蟲鳴鳥叫係生物發出嘅聲音，表示附近可能有動物活動。',
    hint: '用耳朵都可以觀察大自然。',
    speak: '觀察'
  },
  {
    id: 'forest_home-7',
    topic: 'forest_home',
    prompt: '蘑菇同大樹一齊出現喺森林，說明森林裏面？',
    choices: ['有多樣生物一齊生活', '只可以有一種生物', '完全冇生物'],
    answer: 0,
    explain: '森林裏面可以同時有大樹、小草、蘑菇同動物，生物種類好多樣。',
    hint: '多樣嘅生物一齊生活，令森林更加豐富。',
    speak: '多樣'
  },
  {
    id: 'forest_home-8',
    topic: 'forest_home',
    prompt: '細小溪流穿過森林，對動物同植物有咩幫助？',
    choices: ['提供水分', '令所有植物即刻枯乾', '令動物全部飛走'],
    answer: 0,
    explain: '溪流可以提供水分，幫助植物生長，動物亦可以喺附近飲水。',
    hint: '生物都需要水先可以生活。',
    speak: '水分'
  },
  {
    id: 'forest_care-1',
    topic: 'forest_care',
    prompt: '喺郊野公園行山之後，垃圾應該點處理？',
    choices: ['帶走或放入垃圾桶，唔好亂丟', '掉入樹林就當消失', '堆喺溪邊就算'],
    answer: 0,
    explain: '垃圾要帶走或者放入垃圾桶，先唔會傷害植物同動物，亦保持環境清潔。',
    hint: '「自己垃圾自己帶走」係愛護郊野嘅好習慣。',
    speak: '清潔'
  },
  {
    id: 'forest_care-2',
    topic: 'forest_care',
    prompt: '看見樹上有雀巢，最合適嘅做法係？',
    choices: ['遠啲觀察，唔好騷擾', '伸手攞走巢裏面嘅東西', '大力搖樹睇吓會唔會跌出嚟'],
    answer: 0,
    explain: '雀巢係鳥兒嘅家，我哋可以遠遠觀察，但唔好騷擾。',
    hint: '愛護動物，先由唔打擾佢哋開始。',
    speak: '保護'
  },
  {
    id: 'forest_care-3',
    topic: 'forest_care',
    prompt: '點解唔應該隨便採摘郊野所有花草？',
    choices: ['植物係自然環境一部分，過度採摘會影響其他生物', '花草完全唔屬於大自然', '採摘後植物一定即刻長得更好'],
    answer: 0,
    explain: '花草同樹木都係自然嘅一部分，隨便採摘可能影響其他生物同環境。',
    hint: '可以用眼睛同相機記錄美麗嘅植物。',
    speak: '愛護'
  },
  {
    id: 'forest_care-4',
    topic: 'forest_care',
    prompt: '露營時點樣先較安全同愛護山林？',
    choices: ['遵守營地規則，小心用火，離開前清理乾淨', '喺樹林任何地方都堆火', '把所有枯枝一次燒晒'],
    answer: 0,
    explain: '遵守規則、小心用火同清理營地，先可以保護自己同山林。',
    hint: '郊外用火要特別小心，因為植物同泥土都怕火災。',
    speak: '安全'
  },
  {
    id: 'forest_care-5',
    topic: 'forest_care',
    prompt: '把塑膠袋留喺森林地面，可能有咩問題？',
    choices: ['污染環境，動物可能誤以為係食物', '令樹木長得更快', '自動變成肥料同空氣'],
    answer: 0,
    explain: '塑膠袋好難自然分解，仲可能被動物誤食，所以一定要帶走。',
    hint: '塑膠唔係落葉，唔會快快地變成泥土。',
    speak: '污染'
  },
  {
    id: 'forest_care-6',
    topic: 'forest_care',
    prompt: '愛護森林，同學可以做嘅小事係？',
    choices: ['參與學校種植或清潔活動，珍惜用紙', '每日折斷一條樹枝', '把課室植物全部掉走'],
    answer: 0,
    explain: '參與種植、清潔同珍惜用紙，都係日常可以做到嘅愛護自然行動。',
    hint: '小事加起來，都可以幫助保護環境。',
    speak: '珍惜'
  },
  {
    id: 'forest_care-7',
    topic: 'forest_care',
    prompt: '喺林徑見到受傷嘅小動物，較合適嘅做法係？',
    choices: ['通知成人或管理員，唔好自行亂捉', '即刻捉回家長期飼養唔告訴大人', '用石頭趕佢走'],
    answer: 0,
    explain: '遇到受傷動物，應告訴老師、家長或管理員，專業處理先較安全。',
    hint: '關心動物，亦要注意自己同動物嘅安全。',
    speak: '通知'
  },
  {
    id: 'forest_care-8',
    topic: 'forest_care',
    prompt: '校園自然角有時會保留少量落葉同枯枝，主要係因為？',
    choices: ['可以成為小蟲嘅棲息處，亦會變做養分', '一定會發出有害氣體所以要堆高', '可以當金屬重用'],
    answer: 0,
    explain: '適量嘅落葉同枯枝可以成為小生物嘅家，腐爛後仲可以為泥土增加養分。',
    hint: '自然角唔一定要睇落完全光秃秃先算乾淨。',
    speak: '落葉'
  },
  {
    id: 'polar_animals-1',
    topic: 'polar_animals',
    prompt: '企鵝主要靠咩喺冰天雪地移動同搵食？',
    choices: ['行走、滑動同游水', '長期飛好高去捉雲', '喺沙漠奔跑'],
    answer: 0,
    explain: '企鵝多數喺冰上行走或滑動，入水游水去捉食物。',
    hint: '企鵝有翅膀，但更擅長游水多過高飛。',
    speak: '游水'
  },
  {
    id: 'polar_animals-2',
    topic: 'polar_animals',
    prompt: '北極熊身上厚厚嘅毛同脂肪，主要幫助佢？',
    choices: ['保暖', '發出磁力', '喺沙漠散熱'],
    answer: 0,
    explain: '厚毛同皮下脂肪可以減少熱量散失，幫助北極熊喺寒冷地方保暖。',
    hint: '好似我哋冬天着厚衫一樣。',
    speak: '保暖'
  },
  {
    id: 'polar_animals-3',
    topic: 'polar_animals',
    prompt: '海豹適合喺邊種環境生活？',
    choices: ['寒冷、靠近海洋或冰塊嘅地方', '只可以住喺熱烘烘嘅沙漠中心', '只可以住喺巿區商場'],
    answer: 0,
    explain: '海豹擅長游水，多數生活喺寒冷嘅海域同冰上。',
    hint: '睇動物生活嘅地方，可以認識佢哋點樣適應環境。',
    speak: '海洋'
  },
  {
    id: 'polar_animals-4',
    topic: 'polar_animals',
    prompt: '以下邊種係極地常見動物？',
    choices: ['企鵝', '駱駝', '松鼠'],
    answer: 0,
    explain: '企鵝係寒冷地方常見嘅動物；駱駝較常喺乾旱地區，松鼠較常喺樹林。',
    hint: '唔同環境住住唔同動物。',
    speak: '企鵝'
  },
  {
    id: 'polar_animals-5',
    topic: 'polar_animals',
    prompt: '小北極熊寶寶通常點樣度過嚴寒？',
    choices: ['靠近媽媽，用毛同脂肪保暖', '把冰塊當被來蓋', '完全唔需要任何保護'],
    answer: 0,
    explain: '小熊會靠近媽媽，再靠自身嘅毛同脂肪保暖。',
    hint: '細小嘅動物更需要成人照顧同保暖。',
    speak: '靠近'
  },
  {
    id: 'polar_animals-6',
    topic: 'polar_animals',
    prompt: '企鵝聚集喺一齊，有時係為咗？',
    choices: ['互相靠近嚟保暖', '令冰山即刻溶解', '一齊發出指南針方向'],
    answer: 0,
    explain: '靠得近可以減少身體四周嘅寒風，大家一齊保暖。',
    hint: '人冷嘅時候，有時都會靠埋一齊。',
    speak: '聚集'
  },
  {
    id: 'polar_animals-7',
    topic: 'polar_animals',
    prompt: '北極熊白色嘅毛，喺冰雪環境有咩好處？',
    choices: ['較容易同周圍環境相似，方便活動同接近獵物', '令身體一定會更熱過太陽', '令熊可以飛起'],
    answer: 0,
    explain: '同環境相近嘅顏色，可以幫助動物較唔顯眼，方便活動或接近食物。',
    hint: '觀察動物顏色時，可以諗吓佢哋住喺邊度。',
    speak: '顏色'
  },
  {
    id: 'polar_animals-8',
    topic: 'polar_animals',
    prompt: '如果極地冰面大面積減少，依賴冰塊生活嘅動物可能會點？',
    choices: ['搵食同休息變得困難', '全部即刻變成沙漠動物', '完全唔受影響'],
    answer: 0,
    explain: '有啲極地動物需要冰面休息或搵食，冰減少就會令生活變得困難。',
    hint: '環境改變，會影響住喺嗰度嘅生物。',
    speak: '環境'
  },
  {
    id: 'polar_warm-1',
    topic: 'polar_warm',
    prompt: '天氣好凍嘅時候，我哋可以點樣保暖？',
    choices: ['加衣服，戴帽同手套', '只着單衣企喺風口', '把水淋到身上'],
    answer: 0,
    explain: '加衣服、戴帽同手套，可以減少身體熱量散失，幫助保暖。',
    hint: '冬天出門，大人成日提醒我哋着多件。',
    speak: '衣服'
  },
  {
    id: 'polar_warm-2',
    topic: 'polar_warm',
    prompt: '毛衣同外套可以保暖，主要因為佢哋能夠？',
    choices: ['減少身體嘅熱量散走', '令空氣即刻變成火', '發出好強烈嘅光'],
    answer: 0,
    explain: '厚衣服可以把一層空氣留住，減少熱量散失，所以會覺得暖。',
    hint: '用手摸毛衣，會覺得厚厚地、暖暖地。',
    speak: '保暖'
  },
  {
    id: 'polar_warm-3',
    topic: 'polar_warm',
    prompt: '動物用毛皮或者羽毛，作用同人着衫有啲相似，都係為咗？',
    choices: ['保持體溫', '令身體發出音樂', '把水變成冰'],
    answer: 0,
    explain: '毛皮同羽毛可以幫助動物保持體溫，好似我哋着暖衫一樣。',
    hint: '比較人同動物點樣應付寒冷，會發現有相似之處。',
    speak: '體溫'
  },
  {
    id: 'polar_warm-4',
    topic: 'polar_warm',
    prompt: '喝暖飲、留喺溫暖室內，對身體有咩幫助？',
    choices: ['幫助保持溫暖', '令身體一定會更凍', '令雪自動停'],
    answer: 0,
    explain: '暖飲同溫暖嘅室內環境，都可以幫助身體保持暖和。',
    hint: '凍嘅日子返屋企，室內通常會覺得較暖。',
    speak: '溫暖'
  },
  {
    id: 'polar_warm-5',
    topic: 'polar_warm',
    prompt: '手凍嘅時候互相搓手，主要想點？',
    choices: ['令雙手暖和啲', '令手變成冰塊', '令手失去感覺'],
    answer: 0,
    explain: '搓手可以令雙手暖和啲，係一種簡單嘅保暖方法。',
    hint: '運動時身體都會覺得較暖。',
    speak: '搓手'
  },
  {
    id: 'polar_warm-6',
    topic: 'polar_warm',
    prompt: '點解濕透嘅衣服喺冬天會令人更冷？',
    choices: ['濕衣服較容易帶走身體嘅熱', '濕衣服一定更厚所以更暖', '水會自動變成火'],
    answer: 0,
    explain: '濕衣服會帶走身體較多熱量，所以凍天穿濕衫會更冷，要盡快換乾衫。',
    hint: '游完水要抹乾同換衫，先唔易着涼。',
    speak: '乾燥'
  },
  {
    id: 'polar_warm-7',
    topic: 'polar_warm',
    prompt: '嚴寒時戴帽，主要可以保護邊度減少散失熱量？',
    choices: ['頭同耳朵', '只保護腳底', '只保護手肘'],
    answer: 0,
    explain: '頭同耳朵較容易感到寒冷，戴帽可以減少呢度嘅熱量散失。',
    hint: '冬天帽通常會遮住耳仔。',
    speak: '帽子'
  },
  {
    id: 'polar_warm-8',
    topic: 'polar_warm',
    prompt: '把熱水袋或者暖包靠近身體，要注意咩？',
    choices: ['唔好過熱，避免燙傷，並要有成人指導', '直接把開水倒在皮膚上', '把暖包放入口中'],
    answer: 0,
    explain: '保暖工具要安全使用，溫度唔好過高，細路要用時應有成人指導。',
    hint: '保暖同安全要一齊注意。',
    speak: '安全'
  },
  {
    id: 'polar_ice-1',
    topic: 'polar_ice',
    prompt: '水喺足夠寒冷嘅時候，通常會變成咩？',
    choices: ['冰', '蒸氣一定即刻變石頭', '即刻變成沙子'],
    answer: 0,
    explain: '水喺溫度夠低時會結冰，變成固體。',
    hint: '冬天有時會見到結冰嘅水窪。',
    speak: '結冰'
  },
  {
    id: 'polar_ice-2',
    topic: 'polar_ice',
    prompt: '雪花通常喺邊種天氣出現？',
    choices: ['寒冷而且有水氣嘅天氣', '十分炎熱乾燥嘅中午', '一定只會喺沙漠中心出現'],
    answer: 0,
    explain: '雪係水氣喺寒冷環境下形成嘅晶體，再落到地面。',
    hint: '香港好少落雪，但可以喺書本同短片認識。',
    speak: '雪'
  },
  {
    id: 'polar_ice-3',
    topic: 'polar_ice',
    prompt: '冰塊離開冷凍環境、放到溫暖地方，通常會點？',
    choices: ['慢慢融化成水', '即刻變成木頭', '永遠保持原狀'],
    answer: 0,
    explain: '溫度升高，冰就會融化變返做水。',
    hint: '把冰粒放到手心，就會見到佢慢慢變水。',
    speak: '融化'
  },
  {
    id: 'polar_ice-4',
    topic: 'polar_ice',
    prompt: '冰面好滑，行上去要點樣先較安全？',
    choices: ['慢慢行，小心唔好跑跳', '用力衝刺同滑行比賽', '閉埋眼向前衝'],
    answer: 0,
    explain: '冰面摩擦較細，容易滑倒，所以要慢慢行、小心腳步。',
    hint: '好似地上有水咁，都要小心行。',
    speak: '小心'
  },
  {
    id: 'polar_ice-5',
    topic: 'polar_ice',
    prompt: '觀察冰同水，可以認識物質嘅咩變化？',
    choices: ['形態變化，例如液體同固體互相轉變', '顏色一定會變成綠色', '一定會發出香味'],
    answer: 0,
    explain: '水可以結冰變成固體，冰亦可以融化變返液體，呢啲都係形態上嘅變化。',
    hint: '用日常觀察都可以學科學。',
    speak: '形態'
  },
  {
    id: 'polar_ice-6',
    topic: 'polar_ice',
    prompt: '用放大鏡或者顯微相片睇雪花，通常會見到咩？',
    choices: ['有規律嘅花紋同形狀', '完全冇任何形狀', '一定係正方形磁鐵'],
    answer: 0,
    explain: '雪花有好多美麗而有規律嘅形狀，可以慢慢觀察。',
    hint: '每片雪花都值得仔細睇。',
    speak: '形狀'
  },
  {
    id: 'polar_ice-7',
    topic: 'polar_ice',
    prompt: '把一杯水同一塊冰一齊比較，最明顯唔同嘅係？',
    choices: ['一個較易流動，一個較堅硬定形', '兩個都一定係熱烘烘', '兩個都一定係氣體'],
    answer: 0,
    explain: '水係液體，較容易流動；冰係固體，有較固定嘅形狀。',
    hint: '用手輕輕掂一掂（注意安全），就可以比較。',
    speak: '固體'
  },
  {
    id: 'polar_ice-8',
    topic: 'polar_ice',
    prompt: '戶外冰柱喺陽光照射下，常常會點？',
    choices: ['慢慢滴水同融化', '即刻變得更長並且變成鐵', '完全唔會有變化'],
    answer: 0,
    explain: '陽光令溫度升高，冰柱就會慢慢融化並滴下水來。',
    hint: '喺寒冷地方，屋簷有時會見到冰柱。',
    speak: '滴水'
  },
  {
    id: 'polar_weather-1',
    topic: 'polar_weather',
    prompt: '極地全年多數係點嘅天氣？',
    choices: ['非常寒冷，部分地方有冰雪', '全年好似夏天咁炎熱', '完全冇風亦唔會凍'],
    answer: 0,
    explain: '極地係地球上好寒冷嘅地方，好多地方長年有冰雪。',
    hint: '睇地圖時，接近地球兩極嘅地方通常較冷。',
    speak: '寒冷'
  },
  {
    id: 'polar_weather-2',
    topic: 'polar_weather',
    prompt: '氣溫好低嘅時候，我們呼出嘅氣有時會見到白煙，主要因為？',
    choices: ['呼出嘅水氣喺冷空氣中凝結成細小水點', '口裏面一定有火', '空氣變成沙子'],
    answer: 0,
    explain: '呼出嘅氣有水氣，遇冷後凝結成細小水點，看起來好似白煙。',
    hint: '冬天室外有時會見到自己嘅呼吸。',
    speak: '水氣'
  },
  {
    id: 'polar_weather-3',
    topic: 'polar_weather',
    prompt: '寒冷天氣下記錄日記，應該特別留意咩？',
    choices: ['氣溫、有冇冰雪同風力', '今日有冇磁鐵', '鄰座嘅音量'],
    answer: 0,
    explain: '寒冷地方嘅天氣日記，可以記錄氣溫、冰雪同風嘅情況，方便比較變化。',
    hint: '記錄幫助我哋認識天氣規律。',
    speak: '記錄'
  },
  {
    id: 'polar_weather-4',
    topic: 'polar_weather',
    prompt: '大風加低温，通常會令人覺得點？',
    choices: ['更加寒冷', '一定更加悶熱', '完全感覺唔到溫度'],
    answer: 0,
    explain: '風會帶走身體周圍嘅熱，低温再加大風就會覺得更冷，所以更要做好保暖。',
    hint: '有風嘅冬天，有時覺得比冇風時更凍。',
    speak: '風力'
  },
  {
    id: 'polar_weather-5',
    topic: 'polar_weather',
    prompt: '極地全日日照時間會隨季節轉變。呢種觀察屬於邊類？',
    choices: ['天氣同環境觀察', '磁力遊戲', '物料回收分類'],
    answer: 0,
    explain: '留意日照長短同季節變化，都係觀察天氣同環境嘅一部分。',
    hint: '唔同季節，日頭長短可以唔同。',
    speak: '季節'
  },
  {
    id: 'polar_weather-6',
    topic: 'polar_weather',
    prompt: '喺嚴寒戶外停留太耐，可能有咩影響？',
    choices: ['身體過冷，需要返入溫暖地方', '一定更健康所以要愈耐愈好', '完全唔會有感覺變化'],
    answer: 0,
    explain: '人體喺過冷嘅環境停留太耐會唔舒服，甚至有危險，要適時返入溫暖地方。',
    hint: '保暖同適時休息都好重要。',
    speak: '適時'
  },
  {
    id: 'polar_weather-7',
    topic: 'polar_weather',
    prompt: '冰雪天氣行路，最需要注意咩？',
    choices: ['地面可能好滑，要慢慢行', '一定要脫鞋跑步', '閉上眼向前走'],
    answer: 0,
    explain: '冰雪令地面更滑，慢慢行、穿合適鞋履先較安全。',
    hint: '安全先行，先再觀察風景。',
    speak: '安全'
  },
  {
    id: 'polar_weather-8',
    topic: 'polar_weather',
    prompt: '比較香港冬天同極地，最明顯嘅分別係？',
    choices: ['極地通常寒冷得多，常有冰雪', '兩邊全年都一樣熱', '香港一定比極地更冷'],
    answer: 0,
    explain: '香港冬天較涼，但極地會寒冷得多，仲常常有冰雪。',
    hint: '比較唔同地方嘅天氣，可以認識地球環境多樣。',
    speak: '比較'
  },
  {
    id: 'desert_animals-1',
    topic: 'desert_animals',
    prompt: '駱駝嘅腳掌較闊，喺沙漠行路有咩好處？',
    choices: ['較唔容易陷入沙中', '令駱駝可以飛', '令沙子變成水'],
    answer: 0,
    explain: '闊腳掌可以分散身體重量，令駱駝較唔容易陷入鬆軟嘅沙裏面。',
    hint: '好似穿着較闊嘅鞋走喺軟沙上。',
    speak: '腳掌'
  },
  {
    id: 'desert_animals-2',
    topic: 'desert_animals',
    prompt: '狐獴或者耳廓狐嘅大耳朵，其中一個作用係？',
    choices: ['幫助散熱', '專門用來貯存大量食水', '令身體可以發光電'],
    answer: 0,
    explain: '較大嘅耳朵可以幫助部分沙漠動物散走熱量，適應炎熱環境。',
    hint: '熱嘅時候，身體都要諗辦法降溫。',
    speak: '散熱'
  },
  {
    id: 'desert_animals-3',
    topic: 'desert_animals',
    prompt: '沙漠蜥蜴喜歡晒太陽，之後又會走到陰影，主要為咗？',
    choices: ['調節身體溫度', '令沙子開花', '發出聲音吸引磁鐵'],
    answer: 0,
    explain: '蜥蜴會利用陽光同陰影嚟調節身體溫度，以免過熱或過冷。',
    hint: '觀察動物點樣使用環境，可以認識適應方法。',
    speak: '溫度'
  },
  {
    id: 'desert_animals-4',
    topic: 'desert_animals',
    prompt: '以下邊種較常生活喺沙漠？',
    choices: ['駱駝', '企鵝', '鯨魚'],
    answer: 0,
    explain: '駱駝較能適應乾旱同炎熱嘅沙漠；企鵝同鯨魚就生活喺寒冷或者海洋環境。',
    hint: '動物同佢哋嘅居住環境係相配嘅。',
    speak: '駱駝'
  },
  {
    id: 'desert_animals-5',
    topic: 'desert_animals',
    prompt: '有啲沙漠動物選擇夜晚先出來活動，主要因為？',
    choices: ['夜晚通常較涼，較容易活動', '夜晚沙漠一定會落大雪', '夜晚完全冇任何危險'],
    answer: 0,
    explain: '沙漠日頭好熱，夜晚較涼，所以有啲動物會改為夜晚先出來搵食。',
    hint: '換個時間活動，都係適應環境嘅方法。',
    speak: '夜晚'
  },
  {
    id: 'desert_animals-6',
    topic: 'desert_animals',
    prompt: '蠍子同沙蜥都有較硬或者有保護作用嘅身體表面，幫助佢哋？',
    choices: ['減少損傷同適應乾燥環境', '喺水底長期呼吸', '喺樹上築巢長住'],
    answer: 0,
    explain: '較堅硬或有保護作用嘅身體表面，可以幫助呢啲動物適應乾燥同地面生活。',
    hint: '觀察動物身體特徵，可以猜想佢哋點生活。',
    speak: '保護'
  },
  {
    id: 'desert_animals-7',
    topic: 'desert_animals',
    prompt: '想安全認識沙漠動物，應該點？',
    choices: ['睇書、短片或喺合適場地觀察，唔好隨便捕捉', '即刻捉回家唔告知大人', '走入真正沙漠中心離開隊伍'],
    answer: 0,
    explain: '認識動物可以用書本、短片同安全嘅觀察；隨便捕捉或者離開隊伍都不安全。',
    hint: '學習同安全要一齊做到。',
    speak: '觀察'
  },
  {
    id: 'desert_animals-8',
    topic: 'desert_animals',
    prompt: '駱駝可以較耐先飲一次水，說明佢能夠？',
    choices: ['較適應缺水嘅環境', '完全唔需要任何水分', '把沙子當每日三餐'],
    answer: 0,
    explain: '駱駝有適應乾旱環境嘅本領，可以較耐先再補充水分，但仍然需要水。',
    hint: '適應唔等於完全唔需要水。',
    speak: '適應'
  },
  {
    id: 'desert_adapt-1',
    topic: 'desert_adapt',
    prompt: '「適應環境」係指生物能夠？',
    choices: ['配合自己住嘅地方嚟生活', '把環境完全變成另一個星球', '完全唔使用身邊任何資源'],
    answer: 0,
    explain: '適應環境就係生物用身體特徵或者生活方法，配合自己住嘅地方生存。',
    hint: '唔同地方嘅生物，往往有唔同本領。',
    speak: '適應'
  },
  {
    id: 'desert_adapt-2',
    topic: 'desert_adapt',
    prompt: '淺色嘅毛皮喺陽光猛烈嘅沙漠，有時可以幫助？',
    choices: ['減少吸收過多熱力', '令動物一定更熱', '令沙子自動變冷'],
    answer: 0,
    explain: '較淺嘅顏色吸收熱力較少，對生活喺炎熱地方嘅動物有幫助。',
    hint: '夏天着淺色衫，有時會覺得冇深色咁熱。',
    speak: '顏色'
  },
  {
    id: 'desert_adapt-3',
    topic: 'desert_adapt',
    prompt: '有啲沙漠植物葉子細而少，主要有助？',
    choices: ['減少水分散失', '令植物一定更快枯乾', '專門用來發出聲音'],
    answer: 0,
    explain: '細小或者較少嘅葉子，可以減少水分由葉面散走，有助喺乾旱地方生存。',
    hint: '植物都有適應環境嘅方法。',
    speak: '水分'
  },
  {
    id: 'desert_adapt-4',
    topic: 'desert_adapt',
    prompt: '仙人掌身體肥厚，其中一個作用係？',
    choices: ['儲存水分', '專門儲存磁鐵', '發出很大風聲'],
    answer: 0,
    explain: '仙人掌肥厚嘅莖可以儲存水分，幫助佢喺少雨嘅地方生活。',
    hint: '沙漠植物要好珍惜得到嘅水。',
    speak: '儲水'
  },
  {
    id: 'desert_adapt-5',
    topic: 'desert_adapt',
    prompt: '人喺炎熱乾燥嘅地方活動，較合適嘅準備係？',
    choices: ['帶足夠食水，做好防曬同休息', '完全唔飲水又長時間行晒', '穿着厚重濕透嘅棉被'],
    answer: 0,
    explain: '帶備食水、遮擋強烈陽光同適時休息，先可以較安全地活動。',
    hint: '適應環境，人亦要預先做好準備。',
    speak: '準備'
  },
  {
    id: 'desert_adapt-6',
    topic: 'desert_adapt',
    prompt: '比較駱駝同企鵝，最能說明咩科學想法？',
    choices: ['唔同環境生活住唔同特徵嘅動物', '所有動物都必須完全一樣', '動物同環境完全冇關係'],
    answer: 0,
    explain: '駱駝適應乾旱炎熱，企鵝適應寒冷海洋，說明生物特徵同生活環境有關。',
    hint: '用比較可以更清楚睇到適應嘅道理。',
    speak: '比較'
  },
  {
    id: 'desert_adapt-7',
    topic: 'desert_adapt',
    prompt: '沙子日間好熱、夜晚較涼，對生活喺沙漠嘅動物有咩影響？',
    choices: ['佢哋要配合溫度變化嚟活動同藏身', '溫度變化完全唔會影響動物', '動物一定全日唔郁'],
    answer: 0,
    explain: '沙漠日夜溫差可以好大，動物會用藏身、夜晚活動等方法嚟配合。',
    hint: '環境唔淨止有熱，仲有變化。',
    speak: '溫差'
  },
  {
    id: 'desert_adapt-8',
    topic: 'desert_adapt',
    prompt: '把同一種需要好多水嘅植物移到好乾燥嘅沙地，長期可能會點？',
    choices: ['生長困難，甚至枯乾', '一定即刻變成仙人掌', '完全唔受影響'],
    answer: 0,
    explain: '唔係每種植物都適合乾燥環境，缺少所需水分就會生長困難。',
    hint: '生物同環境要互相配合。',
    speak: '配合'
  },
  {
    id: 'desert_water-1',
    topic: 'desert_water',
    prompt: '沙漠裏面最缺少嘅通常係咩？',
    choices: ['食水同雨水', '陽光', '沙子'],
    answer: 0,
    explain: '沙漠好少雨，食水十分珍貴，生物都要想辦法得到同珍惜水。',
    hint: '一提起沙漠，就會諗到乾同熱。',
    speak: '食水'
  },
  {
    id: 'desert_water-2',
    topic: 'desert_water',
    prompt: '點解日常生活都要珍惜食水？',
    choices: ['食水係重要資源，唔好浪費', '水永遠都用唔完，完全唔使理會', '關掉水龍頭後水會自動增多'],
    answer: 0,
    explain: '食水係生活必需而且有限嘅資源，人人都應該珍惜，唔好浪費。',
    hint: '香港食水都要經過處理先送到屋企。',
    speak: '珍惜'
  },
  {
    id: 'desert_water-3',
    topic: 'desert_water',
    prompt: '刷牙或者洗手時，較珍惜食水嘅做法係？',
    choices: ['唔使用時關掉水龍頭', '讓水全日開住', '用完再加開兩個龍頭一齊沖'],
    answer: 0,
    explain: '唔需要用水時關掉龍頭，就可以減少浪費。',
    hint: '小小習慣，都可以節省好多水。',
    speak: '關掉'
  },
  {
    id: 'desert_water-4',
    topic: 'desert_water',
    prompt: '植物都需要水，澆水時應該點？',
    choices: ['適量澆，避免浪費同浸壞根部', '一次過把整桶水全部倒入', '完全永遠唔澆'],
    answer: 0,
    explain: '適量澆水先對植物有幫助；太多可能浪費同傷害根部，太少又會乾。',
    hint: '照顧植物同珍惜食水可以一齊做到。',
    speak: '適量'
  },
  {
    id: 'desert_water-5',
    topic: 'desert_water',
    prompt: '喺沙漠故事裏面，旅客常常帶備水樽，係因為？',
    choices: ['沿途好難找到足夠食水', '水樽可以當指南針', '水樽可以令天氣轉冷'],
    answer: 0,
    explain: '沙漠少雨又熱，沿途唔容易找到食水，所以要預先帶備。',
    hint: '出行前準備所需物品，係一種安全習慣。',
    speak: '準備'
  },
  {
    id: 'desert_water-6',
    topic: 'desert_water',
    prompt: '以下邊樣做法最唔珍惜食水？',
    choices: ['淋浴時長時間讓水開住唔使用', '用洗菜水淋花（喺合適情況下）', '發現漏水立即告訴成人修理'],
    answer: 0,
    explain: '長時間讓水開住係浪費；重用水同修理漏水就係珍惜食水嘅做法。',
    hint: '先諗一諗，呢次用水係咪真係需要。',
    speak: '浪費'
  },
  {
    id: 'desert_water-7',
    topic: 'desert_water',
    prompt: '人體為什麼需要飲水？',
    choices: ['幫助身體正常運作', '水只係用來發出聲音', '完全唔飲水亦完全冇影響'],
    answer: 0,
    explain: '水對身體好重要，適量飲水可以幫助身體正常運作。',
    hint: '天氣炎熱時，更要記得適時飲水。',
    speak: '飲水'
  },
  {
    id: 'desert_water-8',
    topic: 'desert_water',
    prompt: '學校或家中發現水龍頭滴水，應該點做？',
    choices: ['關好或者請成人幫忙修理', '當睇唔到', '用石頭堵塞出水口'],
    answer: 0,
    explain: '滴水都係浪費，關好龍頭或者請成人修理，先係正確做法。',
    hint: '小滴水匯聚起來都係好大嘅量。',
    speak: '修理'
  },
  {
    id: 'desert_heat-1',
    topic: 'desert_heat',
    prompt: '沙漠日間最常令人注意到嘅天氣特徵係？',
    choices: ['高溫同強烈陽光', '長期結冰', '每日必會落大雪'],
    answer: 0,
    explain: '沙漠日間通常好熱，陽光強烈，而且好少雨水。',
    hint: '炎熱同乾燥，係沙漠天氣嘅重要特點。',
    speak: '高溫'
  },
  {
    id: 'desert_heat-2',
    topic: 'desert_heat',
    prompt: '炎熱天氣外出，點樣保護自己較合適？',
    choices: ['戴帽、搽防曬、着淺色衫同帶水', '唔戴帽又長時間對住烈日', '把厚棉襖扣到最頂'],
    answer: 0,
    explain: '遮擋陽光、着較淺色衣服同帶備食水，都係炎熱天氣嘅保護方法。',
    hint: '保護自己同認識天氣係一齊嘅。',
    speak: '防曬'
  },
  {
    id: 'desert_heat-3',
    topic: 'desert_heat',
    prompt: '中午陽光最猛嘅時候，較合適嘅安排係？',
    choices: ['喺陰涼處休息，減少長時間暴曬', '偏偏揀最猛嘅時間長跑唔休息', '脫掉所有遮擋直接晒好耐'],
    answer: 0,
    explain: '強烈陽光下長時間暴曬唔安全，應該搵陰涼處休息。',
    hint: '行程可以配合天氣嚟安排。',
    speak: '陰涼'
  },
  {
    id: 'desert_heat-4',
    topic: 'desert_heat',
    prompt: '沙子喺烈日下摸落可能好燙，說明咩？',
    choices: ['陽光可以把地面晒得好熱，要小心接觸', '沙子永遠都係冰凍', '溫度同陽光完全冇關係'],
    answer: 0,
    explain: '陽光會令地面同沙子變熱，甚至燙手，接觸前要小心。',
    hint: '用觀察同小心觸摸（或問成人）去認識溫度。',
    speak: '溫度'
  },
  {
    id: 'desert_heat-5',
    topic: 'desert_heat',
    prompt: '記錄炎熱天氣時，可以寫低邊啲資料？',
    choices: ['氣溫、陽光同有冇風', '今日書本有幾多頁', '磁鐵指向邊度'],
    answer: 0,
    explain: '天氣日記可以記錄氣溫、陽光同風，方便之後比較。',
    hint: '同一種記錄方法，可以用喺唔同天氣。',
    speak: '記錄'
  },
  {
    id: 'desert_heat-6',
    topic: 'desert_heat',
    prompt: '感到頭暈、好熱同口乾時，應該點？',
    choices: ['走到陰涼處休息同告知成人，適時飲水', '繼續喺烈日下劇烈運動', '完全唔告訴任何人'],
    answer: 0,
    explain: '過熱同缺水會令身體唔舒服，要立即到陰涼處、飲水同告訴成人。',
    hint: '身體發出嘅訊號要認真對待。',
    speak: '休息'
  },
  {
    id: 'desert_heat-7',
    topic: 'desert_heat',
    prompt: '建築物同樹蔭喺炎熱天氣有咩作用？',
    choices: ['提供遮蔭，減少直接晒到陽光', '令陽光變得更猛', '把水全部蒸發走就算'],
    answer: 0,
    explain: '樹蔭同建築物可以阻擋部分陽光，令下面較為涼快。',
    hint: '夏天行入走廊或者樹下，通常會覺得冇咁熱。',
    speak: '遮蔭'
  },
  {
    id: 'desert_heat-8',
    topic: 'desert_heat',
    prompt: '比較沙漠同極地嘅天氣，可以幫助我哋認識？',
    choices: ['地球唔同地方有好唔同嘅環境', '全世界天氣一定完全相同', '天氣同科學完全冇關係'],
    answer: 0,
    explain: '一個好熱好乾，一個好寒冷，比較之後更能明白地球環境好多樣。',
    hint: '陽光沙灘、森林、極地同沙漠，都可以成為觀察天氣嘅課堂。',
    speak: '多樣'
  },
];
