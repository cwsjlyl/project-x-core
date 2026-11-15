export type TopicId = 'sound' | 'force' | 'magnet' | 'materials' | 'weather';

export interface TopicInfo {
  id: TopicId;
  name: string;
  stationLabel: string;
}

export interface ScienceQuestion {
  id: string;
  topic: TopicId;
  prompt: string;
  choices: [string, string, string];
  answer: 0 | 1 | 2;
  explain: string;
  hint: string;
  speak: string;
}

export const TOPICS: TopicInfo[] = [
  { id: 'sound', name: '聲動', stationLabel: '聲動學習站' },
  { id: 'force', name: '齊心合力', stationLabel: '齊心合力學習站' },
  { id: 'magnet', name: '磁向南北', stationLabel: '磁向南北學習站' },
  { id: 'materials', name: '產品大解構', stationLabel: '產品大解構學習站' },
  { id: 'weather', name: '天氣日記', stationLabel: '天氣日記學習站' }
];

export const TOPIC_BY_ID: Record<TopicId, TopicInfo> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t])
) as Record<TopicId, TopicInfo>;

/** 對齊校本 2627 學段二課題同生字，供課堂探索練習。 */
export const SCIENCE_QUESTIONS: ScienceQuestion[] = [
  // 聲動
  {
    id: 'sound-1',
    topic: 'sound',
    prompt: '物件發出聲音時，通常會點樣？',
    choices: ['振動', '熔化', '變成磁鐵'],
    answer: 0,
    explain: '聲音多數由物件振動產生，再傳送到我哋嘅耳朵。',
    hint: '試吓敲敲枱或者鼓，睇吓表面會唔會郁。',
    speak: '振動'
  },
  {
    id: 'sound-2',
    topic: 'sound',
    prompt: '「音量」係指聲音嘅邊一樣？',
    choices: ['高低', '強弱（大細聲）', '顏色'],
    answer: 1,
    explain: '音量講聲音嘅強弱，即係大聲定細聲。',
    hint: '調喇叭嘅「大細聲」就係調音量。',
    speak: '音量'
  },
  {
    id: 'sound-3',
    topic: 'sound',
    prompt: '「音調」嘅高低，通常同咩有關？',
    choices: ['振動快慢', '物件顏色', '天氣晴朗'],
    answer: 0,
    explain: '振動快，音調較高；振動慢，音調較低。',
    hint: '音調係比較「高低音」，唔係大細聲。',
    speak: '音調'
  },
  {
    id: 'sound-4',
    topic: 'sound',
    prompt: '喺圖書館想減低噪音，邊個做法較好？',
    choices: ['大聲講電話', '開喇叭聽音樂', '細聲講說話／保持安靜'],
    answer: 2,
    explain: '保持安靜、細聲說話，就可以減低噪音。',
    hint: '圖書館需要一個安靜嘅環境。',
    speak: '安靜'
  },

  // 齊心合力
  {
    id: 'force-1',
    topic: 'force',
    prompt: '想令紙箱移動，我哋可以點做？',
    choices: ['淨係望住佢', '推動或拉動', '等佢自己行'],
    answer: 1,
    explain: '力可以推動或拉動物件，令佢移動。',
    hint: '推同拉都係施力嘅方法。',
    speak: '推動'
  },
  {
    id: 'force-2',
    topic: 'force',
    prompt: '用斜面搬重物上高，同直接抬高比，通常會點？',
    choices: ['更費力', '完全唔使力', '較慳力，但移動距離較長'],
    answer: 2,
    explain: '斜面係一種簡單機械，可以慳力，不過要行較長路程。',
    hint: '斜面幫助我哋用較少力，慢慢搬上去。',
    speak: '斜面'
  },
  {
    id: 'force-3',
    topic: 'force',
    prompt: '槓桿有咩好處？',
    choices: ['用較少力撬起或移動物件', '令物件變重', '令物件消失'],
    answer: 0,
    explain: '槓桿都係簡單機械，用得合適就可以慳力。',
    hint: '諗吓用槓桿撬起石頭或者開鐵罐。',
    speak: '槓桿'
  },
  {
    id: 'force-4',
    topic: 'force',
    prompt: '小組一齊搬重物，最重要係？',
    choices: ['各自拉唔同方向', '齊心合作，向同一方向出力', '只得一人出力就得'],
    answer: 1,
    explain: '分工合作、方向一致，先容易一齊移動重物。',
    hint: '齊心合力，大家向同一方向用力。',
    speak: '合作'
  },

  // 磁向南北
  {
    id: 'magnet-1',
    topic: 'magnet',
    prompt: '磁鐵較容易吸住邊種物料？',
    choices: ['鐵', '塑膠', '紙'],
    answer: 0,
    explain: '磁鐵對含鐵嘅物件有磁性，會互相吸引。',
    hint: '諗吓鐵夾、鐵釘同部分冰箱門。',
    speak: '鐵'
  },
  {
    id: 'magnet-2',
    topic: 'magnet',
    prompt: '兩塊磁鐵嘅相同磁極靠近時，會點？',
    choices: ['相吸（吸埋）', '相斥（推開）', '發出聲音'],
    answer: 1,
    explain: '相同磁極會相斥，唔同磁極會相吸。',
    hint: 'N 同 N、S 同 S 靠近時會互相推開。',
    speak: '相斥'
  },
  {
    id: 'magnet-3',
    topic: 'magnet',
    prompt: '指南針紅色一端通常指向邊個方向？',
    choices: ['東方', '西方', '北方'],
    answer: 2,
    explain: '指南針可以指示南北方向，紅色一端多數指向北方。',
    hint: '指南針幫助我哋搵北方同南方。',
    speak: '北方'
  },
  {
    id: 'magnet-4',
    topic: 'magnet',
    prompt: '使用細粒磁鐵時，最重要注意咩？',
    choices: ['唔好放入口，小心誤吞', '用力拋向同學', '整碎再玩'],
    answer: 0,
    explain: '用磁鐵要注意安全，細粒嘅唔可以放入口。',
    hint: '細小物件要小心使用，以免誤吞。',
    speak: '安全'
  },

  // 產品大解構
  {
    id: 'materials-1',
    topic: 'materials',
    prompt: '膠水瓶（水樽）主要係咩物料？',
    choices: ['塑膠', '玻璃', '木材'],
    answer: 0,
    explain: '常見水樽多用塑膠造，用完可以回收。',
    hint: '輕輕一捏就會變形嘅樽，多數係塑膠。',
    speak: '塑膠'
  },
  {
    id: 'materials-2',
    topic: 'materials',
    prompt: '汽水鋁罐主要係咩物料？',
    choices: ['紙', '金屬', '布'],
    answer: 1,
    explain: '鋁罐屬於金屬物料，可以回收再造。',
    hint: '罐身硬硬地、冰凍時摸落涼涼地。',
    speak: '金屬'
  },
  {
    id: 'materials-3',
    topic: 'materials',
    prompt: '紙皮箱主要係咩物料？',
    choices: ['玻璃', '金屬', '紙'],
    answer: 2,
    explain: '紙皮箱用紙造，用完可以回收再造。',
    hint: '紙皮同書本都屬於紙類物料。',
    speak: '紙'
  },
  {
    id: 'materials-4',
    topic: 'materials',
    prompt: '用完嘅塑膠、金屬、紙同玻璃，我哋應該點做？',
    choices: ['分類回收，再造資源', '全部掉入海里', '通通燒咗就算'],
    answer: 0,
    explain: '分類回收再造，可以珍惜物料、減少浪費。',
    hint: '唔同物料要放入正確嘅回收箱。',
    speak: '回收'
  },

  // 天氣日記
  {
    id: 'weather-1',
    topic: 'weather',
    prompt: '「晴朗」嘅天氣通常係點？',
    choices: ['陽光充足，雲較少', '成日落大雨', '完全睇唔到天'],
    answer: 0,
    explain: '晴朗即係天氣清朗，陽光較多、雲較少。',
    hint: '晴朗嘅日子，天空較少被雲遮住。',
    speak: '晴朗'
  },
  {
    id: 'weather-2',
    topic: 'weather',
    prompt: '天氣日記入面嘅「氣溫」係記錄咩？',
    choices: ['風吹得有幾快', '空氣有幾熱幾凍', '今日有冇噪音'],
    answer: 1,
    explain: '氣溫又叫溫度，記錄空氣有幾熱幾凍，常用℃表示。',
    hint: '我哋會用溫度計嚟量度氣溫。',
    speak: '氣溫'
  },
  {
    id: 'weather-3',
    topic: 'weather',
    prompt: '點解要每日記錄天氣？',
    choices: ['觀察變化同規律，幫助預測', '令雨自動停', '令磁鐵指向南方'],
    answer: 0,
    explain: '把天氣記錄低，就可以觀察變化同規律，再嘗試預測。',
    hint: '日記就係把每日觀察寫低嚟比較。',
    speak: '記錄'
  },
  {
    id: 'weather-4',
    topic: 'weather',
    prompt: '「濕度」高嗰陣，空氣通常會點？',
    choices: ['一定會好大風', '一定會好乾', '較為潮濕'],
    answer: 2,
    explain: '濕度講空氣有幾潮濕；濕度高就會覺得黏黏地。',
    hint: '落雨前，有時會覺得空氣比較濕。',
    speak: '濕度'
  },

  // 聲動（加題）
  {
    id: 'sound-5',
    topic: 'sound',
    prompt: '聲音通常要靠咩先可以傳到我哋嘅耳朵？',
    choices: ['空氣或其他媒介', '完全空虛嘅空間就夠', '一定要有磁鐵'],
    answer: 0,
    explain: '聲音需要媒介嚟傳播，課室裏面最常見嘅媒介就係空氣。',
    hint: '如果冇空氣，聲音就好難傳過去。',
    speak: '空氣'
  },
  {
    id: 'sound-6',
    topic: 'sound',
    prompt: '想令鄰座同學聽得清楚，但又唔想嘈到全班，應該點？',
    choices: ['用最大聲叫', '靠近啲，用適中嘅音量講', '大力拍檯'],
    answer: 1,
    explain: '靠近對方同控制音量，就可以聽得清楚，又減少噪音。',
    hint: '重點係「大細聲」要適中，唔使成個禮堂都聽到。',
    speak: '音量'
  },
  {
    id: 'sound-7',
    topic: 'sound',
    prompt: '用厚布或者海綿包住鬧鐘，通常會點？',
    choices: ['聲音變得較細', '鬧鐘一定會停', '聲音變成香味'],
    answer: 0,
    explain: '柔軟物料可以吸收部分振動，令傳到外面嘅聲音較細，有隔音作用。',
    hint: '試吓用毛巾包住發聲嘅物件，聽聽聲音有冇變。',
    speak: '隔音'
  },
  {
    id: 'sound-8',
    topic: 'sound',
    prompt: '琴嘅高音鍵同低音鍵，主要分別喺邊樣？',
    choices: ['音調高低唔同', '一定係顏色唔同', '一個有聲音，一個完全冇聲'],
    answer: 0,
    explain: '高音鍵振動較快，音調較高；低音鍵振動較慢，音調較低。',
    hint: '記住：音調係高低音，音量先係大細聲。',
    speak: '音調'
  },

  // 齊心合力（加題）
  {
    id: 'force-5',
    topic: 'force',
    prompt: '把書本放喺桌面上，想令佢郁，最直接嘅方法係？',
    choices: ['對住書本說話', '用手推或者拉', '等磁鐵自己吸走所有紙'],
    answer: 1,
    explain: '施力先可以改變物件嘅運動，推同拉都係常用嘅方法。',
    hint: '力要接觸或者拉動物件，先容易令佢移動。',
    speak: '施力'
  },
  {
    id: 'force-6',
    topic: 'force',
    prompt: '喺光滑地板同粗糙地毯上推同一只紙箱，通常邊度較費力？',
    choices: ['光滑地板較費力', '粗糙地毯較費力', '兩處完全一樣'],
    answer: 1,
    explain: '粗糙表面摩擦力較大，所以喺地毯上推箱通常較費力。',
    hint: '表面愈粗糙，愈容易「拖住」物件。',
    speak: '摩擦'
  },
  {
    id: 'force-7',
    topic: 'force',
    prompt: '用槓桿撬起重物時，如果用力嘅位置離支點較遠，通常會點？',
    choices: ['較慳力', '一定更費力', '重物會自己消失'],
    answer: 0,
    explain: '支點、用力點同重物位置配合得好，槓桿就可以慳力。',
    hint: '試吓用尺撬起書本，手離支點遠啲會較輕鬆。',
    speak: '支點'
  },
  {
    id: 'force-8',
    topic: 'force',
    prompt: '兩組同學拔河，如果出力方向相反而且大小接近，繩會點？',
    choices: ['一定飛出去', '較難向任何一方移動', '繩會變成磁鐵'],
    answer: 1,
    explain: '方向相反嘅力會互相抵消，所以難向前推進。齊心向同一方向先有效。',
    hint: '齊心合力講嘅係方向一致。',
    speak: '方向'
  },

  // 磁向南北（加題）
  {
    id: 'magnet-5',
    topic: 'magnet',
    prompt: '磁鐵靠近一張普通紙同鐵迴紋針，通常會點？',
    choices: ['紙同針都會被吸起', '多數只會吸起鐵迴紋針', '兩者都一定唔郁'],
    answer: 1,
    explain: '常見磁鐵較容易吸住含鐵嘅物件，普通紙通常唔會被吸起。',
    hint: '先試鐵製品，再試紙同塑膠，比較一下。',
    speak: '含鐵'
  },
  {
    id: 'magnet-6',
    topic: 'magnet',
    prompt: '把兩塊磁鐵嘅唔同磁極靠近，會觀察到咩？',
    choices: ['互相吸引', '互相推開', '一齊發出大霧'],
    answer: 0,
    explain: '唔同磁極會相吸，相同磁極會相斥。可以用呢個方法分辨磁極。',
    hint: 'N 同 S 靠近，通常會吸埋一齊。',
    speak: '相吸'
  },
  {
    id: 'magnet-7',
    topic: 'magnet',
    prompt: '戶外遠足時，指南針最主要幫我哋做咩？',
    choices: ['量度氣溫', '指示方向，搵南北', '令背包變輕'],
    answer: 1,
    explain: '指南針可以指示南北，幫助我哋認路同確定方向。',
    hint: '指南針同地圖一齊用，就唔易迷路。',
    speak: '方向'
  },
  {
    id: 'magnet-8',
    topic: 'magnet',
    prompt: '磁力會隨住距離改變，以下邊句較合理？',
    choices: ['離得愈遠，磁力通常愈弱', '離得愈遠，磁力一定愈強', '距離完全冇影響'],
    answer: 0,
    explain: '磁鐵靠近物件時吸引力較明顯，離遠咗就會變弱。',
    hint: '慢慢移近同移開磁鐵，觀察迴紋針嘅反應。',
    speak: '距離'
  },

  // 產品大解構（加題）
  {
    id: 'materials-5',
    topic: 'materials',
    prompt: '窗同部分水杯係透明同易碎嘅，多數用咩物料？',
    choices: ['玻璃', '布', '海綿'],
    answer: 0,
    explain: '玻璃透明、較硬但易碎，常用嚟做窗同部分杯具，要小心使用。',
    hint: '睇得通、敲落有清脆聲，又怕摔破嘅，多數係玻璃。',
    speak: '玻璃'
  },
  {
    id: 'materials-6',
    topic: 'materials',
    prompt: '課室木尺同部分枱椅，主要用咩物料？',
    choices: ['木材', '金屬鋁罐', '膠水'],
    answer: 0,
    explain: '木材來自樹木，常用嚟做尺、櫃同部分家具，要珍惜使用。',
    hint: '摸落有木紋、較輕嘅尺，多數係木做。',
    speak: '木材'
  },
  {
    id: 'materials-7',
    topic: 'materials',
    prompt: '雨衣同部分雨傘面，點解常用塑膠或者防水布？',
    choices: ['因為呢啲物料較容易防水', '因為佢哋一定食得', '因為可以變成磁鐵'],
    answer: 0,
    explain: '唔同物料有唔同特性。防水物料可以阻隔雨水，適合用嚟做雨具。',
    hint: '解構一件產品時，要諗「佢有咩特性、點解用呢種物料」。',
    speak: '防水'
  },
  {
    id: 'materials-8',
    topic: 'materials',
    prompt: '一枝用完嘅塑膠筆同紙盒，最合適嘅處理係？',
    choices: ['按物料分類回收', '一齊掉入去水渠', '燒咗算'],
    answer: 0,
    explain: '塑膠同紙係唔同物料，分類回收先可以再造，減少浪費。',
    hint: '先認物料，再放入正確嘅回收箱。',
    speak: '分類'
  },

  // 天氣日記（加題）
  {
    id: 'weather-5',
    topic: 'weather',
    prompt: '「降雨」係指乜？',
    choices: ['有雨水由天空落下', '太陽特別猛烈', '完全冇雲'],
    answer: 0,
    explain: '降雨即係有雨水落下。天氣日記可以記錄有冇雨、雨大定細。',
    hint: '記得帶備雨具嘅日子，通常同降雨有關。',
    speak: '降雨'
  },
  {
    id: 'weather-6',
    topic: 'weather',
    prompt: '想知道今日有幾熱幾凍，用咩工具最合適？',
    choices: ['溫度計', '指南針', '放大鏡'],
    answer: 0,
    explain: '溫度計用嚟量度氣溫，單位常用℃，可以寫入天氣日記。',
    hint: '氣溫同溫度計係一對好朋友。',
    speak: '溫度計'
  },
  {
    id: 'weather-7',
    topic: 'weather',
    prompt: '天上有好多雲、陽光較少，但未落雨，較常形容做？',
    choices: ['陰天', '晴朗無雲', '一定係颱風眼'],
    answer: 0,
    explain: '陰天雲量較多、陽光較少。把呢啲觀察寫低，就係天氣日記嘅一部分。',
    hint: '同「晴朗」相反，天空多數被雲遮住。',
    speak: '陰天'
  },
  {
    id: 'weather-8',
    topic: 'weather',
    prompt: '風較大嘅日子，以下邊個做法較合適？',
    choices: ['收好輕嘅物件，小心拿穩帽子', '把紙張全部放上天台', '完全唔使理會'],
    answer: 0,
    explain: '風大會吹走輕嘅物件。觀察風力，可以幫我哋做合適準備。',
    hint: '天氣日記都可以簡單記錄「無風、微風、大風」。',
    speak: '風力'
  },
  {
    id: 'weather-9',
    topic: 'weather',
    prompt: '根據天氣去選擇衣著，邊句最合理？',
    choices: ['氣溫低就要加衣保暖', '無論幾凍都著短袖就得', '落大雨反而唔好帶雨傘'],
    answer: 0,
    explain: '觀察氣溫同降雨，可以幫助我哋選擇合適衣著同用具。',
    hint: '天氣日記唔單止記錄，仲可以幫助日常生活。',
    speak: '衣著'
  },

  // 額外題目，優先留俾首領科學題
  {
    id: 'sound-b1',
    topic: 'sound',
    prompt: '聽音樂會覺得「呢個音好尖、好高」，主要係形容邊樣？',
    choices: ['音調較高', '一定係音量最細', '空氣突然消失'],
    answer: 0,
    explain: '「高音、尖音」多數指音調高，同振動較快有關。',
    hint: '高低音係音調，大細聲先係音量。',
    speak: '高音'
  },
  {
    id: 'force-b1',
    topic: 'force',
    prompt: '把重物放上小車再推，同直接抬起行一段路比，通常點解會較輕鬆？',
    choices: ['車輪幫助移動，減少費力', '小車會消除重力', '因為小車有磁性'],
    answer: 0,
    explain: '用合適工具幫助施力，例如小車，就可以較慳力噉搬運。',
    hint: '齊心合力之外，仲可以善用簡單工具。',
    speak: '工具'
  },
  {
    id: 'magnet-b1',
    topic: 'magnet',
    prompt: '把指南針放喺強磁鐵旁邊，可能會點？',
    choices: ['指針可能被干擾，讀數唔準', '指南針會量度氣溫', '完全唔會有任何影響'],
    answer: 0,
    explain: '附近如果有強磁鐵，可能干擾指南針，所以使用時要遠離其他磁鐵。',
    hint: '指南針自己都係利用磁力嚟指示方向。',
    speak: '干擾'
  },
  {
    id: 'materials-b1',
    topic: 'materials',
    prompt: '同一枝膠水筆，筆桿、筆芯同蓋可能用唔同物料，呢種觀察叫做？',
    choices: ['把產品解構，認物料同用途', '測量今日氣溫', '比較音調高低'],
    answer: 0,
    explain: '產品大解構就係把一件物品拆開嚟睇，認識唔同部分用咩物料、有咩用途。',
    hint: '一項產品往往由多種物料組成。',
    speak: '解構'
  },
  {
    id: 'weather-b1',
    topic: 'weather',
    prompt: '連續一星期記錄晴朗、陰天同降雨，最主要有咩好處？',
    choices: ['睇到天氣變化同規律', '令第二日一定唔會落雨', '令磁鐵指向東方'],
    answer: 0,
    explain: '持續記錄先容易比較變化、找出規律，再嘗試預測天氣。',
    hint: '單日觀察都有用，一連串記錄就更清楚。',
    speak: '規律'
  }
];

export function questionsFor(topic: TopicId): ScienceQuestion[] {
  return SCIENCE_QUESTIONS.filter((q) => q.topic === topic);
}

export function pickQuestion(
  topic: TopicId,
  answeredIds: ReadonlySet<string>
): ScienceQuestion {
  const bank = questionsFor(topic);
  const unused = bank.filter((q) => !answeredIds.has(q.id));
  const pool = unused.length > 0 ? unused : bank;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Prefer unused questions so boss quizzes stay fresh. */
export function pickBossQuestion(answeredIds: ReadonlySet<string>): ScienceQuestion {
  const unused = SCIENCE_QUESTIONS.filter((q) => !answeredIds.has(q.id));
  const pool = unused.length > 0 ? unused : SCIENCE_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function speakTerm(term: string): void {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !term) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(term);
    utter.lang = 'zh-HK';
    utter.rate = 0.9;
    const voices = synth.getVoices();
    const hk =
      voices.find((v) => /zh-HK/i.test(v.lang)) ||
      voices.find((v) => /yue|cantonese/i.test(`${v.lang} ${v.name}`)) ||
      voices.find((v) => /zh-TW/i.test(v.lang));
    if (hk) utter.voice = hk;
    synth.speak(utter);
  } catch {
    /* optional pronunciation aid */
  }
}

export class ScienceProgress {
  score = 0;
  readonly clearedTopics = new Set<TopicId>();
  readonly answeredIds = new Set<string>();
  /** Correct answers counted toward clearing each station (needs 2). */
  readonly topicCorrects: Record<TopicId, number> = {
    sound: 0,
    force: 0,
    magnet: 0,
    materials: 0,
    weather: 0
  };

  get clearedCount(): number {
    return this.clearedTopics.size;
  }

  get totalStations(): number {
    return TOPICS.length;
  }

  get allCleared(): boolean {
    return this.clearedTopics.size >= TOPICS.length;
  }

  isCleared(topic: TopicId): boolean {
    return this.clearedTopics.has(topic);
  }

  correctCount(topic: TopicId): number {
    return this.topicCorrects[topic] ?? 0;
  }

  markCorrect(question: ScienceQuestion, points = 10): {
    justCleared: boolean;
    firstClear: boolean;
    correctCount: number;
    points: number;
  } {
    this.answeredIds.add(question.id);
    this.score += points;
    const prev = this.topicCorrects[question.topic] ?? 0;
    const next = prev + 1;
    this.topicCorrects[question.topic] = next;
    const justCleared = next >= 2 && !this.clearedTopics.has(question.topic);
    if (next >= 2) this.clearedTopics.add(question.topic);
    return { justCleared, firstClear: justCleared, correctCount: next, points };
  }
}
