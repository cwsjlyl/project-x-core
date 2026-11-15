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

  markCorrect(question: ScienceQuestion, points = 10): { firstClear: boolean; points: number } {
    this.answeredIds.add(question.id);
    this.score += points;
    const firstClear = !this.clearedTopics.has(question.topic);
    this.clearedTopics.add(question.topic);
    return { firstClear, points };
  }
}
