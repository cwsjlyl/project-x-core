# Project X-Core　／　蒼藍核心

原創科幻像素橫向捲軸動作 RPG。向經典 16-bit／NDS 風格側視動作遊戲致敬，但**並非官方洛克人作品**，亦無使用任何官方角色、精靈圖、音樂或盜用素材。

你扮演蒼藍獵人，喺工業迴廊裡衝刺、蹬牆跳、收集裝甲零件同晶片，最後挑戰多階段首領「雷霆犀」。

## 點樣遊玩

本機開發：

```bash
npm install
npm run dev
```

瀏覽器打開 Vite 顯示嘅本機網址即可。建議用鍵盤或 iPad Safari（有螢幕虛擬按鈕）。

建置靜態檔：

```bash
npm run build
npm run preview
```

輸出喺 `dist/`，可用任何靜態空間托管。

### 鍵盤

| 按鍵 | 動作 |
| --- | --- |
| 方向鍵 或 A／D | 左右移動 |
| Z、空白鍵 或 ↑／W | 跳躍；貼牆時為蹬牆跳（可同時按住衝刺作大跳） |
| X（長按再放） | 三段蓄力手砲：輕點／中蓄／滿蓄（滿蓄可喺擊破目標時貫穿） |
| C | 衝刺（地面或牆上；裝上「空躍腿甲」後每次跳躍可空中衝刺一次） |
| E | 打開／關閉裝備介面（遊戲會暫停） |

### 觸控（iPad Safari）

畫面左下為虛擬方向鍵，右下為「跳／射／衝」，右上為「裝」。可以同鍵盤一齊用。

### 裝備同升級

- 裝甲槽：頭盔、胸甲、手臂、腿部。開局已裝備標準套裝。
- 晶片槽：2 個，全部係被動效果。
- 關卡物件層放有額外零件／晶片，碰到就會放入背包，按 E 裝備。
- 數值會即時生效（生命、攻擊、蓄力速度、減傷、燈光範圍、空中衝刺、回血、對首領傷害、無敵時間、雙發等）。
- 擊敗敵人同首領會獲得經驗，升級會提升生命上限同攻擊。

### 關卡同首領

工業迴廊由左至右推進，途中有高牆可以練習貼牆滑行同蹬牆跳。地圖係真實 Tiled 1.x JSON（`public/assets/maps/stage1.json`），以 Phaser 嘅 tilemap 載入器讀取。

關卡盡頭係首領擂台。踏入觸發區後鏡頭會鎖喺擂台，「雷霆犀」分三階段戰鬥：

1. 巡邏、砲火齊射、跳躍同角撞。
2. 約三分二血量：加速、橫向衝撞、地面震擊彈。
3. 約四分一血量：絕望模式（落彈＋螺旋彈＋衝撞），外觀會有電光光環。

擊破後會得到經驗值同獨特零件「雷霆角盔」，並顯示過關訊息。如果戰鬥中力盡，按「跳」可以在擂台入口重新起動（首領會重置，已有裝備同等級會保留）。

## GitHub Pages

專案已包含 `.github/workflows/deploy.yml`（Node 20、`npm ci`、`vite build`、upload-pages-artifact、deploy-pages）。`vite.config.ts` 已設 `base: './'` 同 `assetsInlineLimit: 0`，並附有 `public/.nojekyll`。

要發佈時：將本資料夾推到 GitHub 倉庫嘅 `main` 分支，然後喺倉庫 Settings → Pages，將 Source 設為 GitHub Actions。推送後約數十秒，就可以用：

`https://<帳戶>.github.io/<倉庫名>/`

嵌入 Google Sites：選「嵌入」→「依網址」，貼上面呢條即可。

**注意：** 目前尚未建立 GitHub 倉庫或 Pages，需要另一步先發佈。

## 技術棧

- Phaser 3.85（MIT）、TypeScript 5.6、Vite 5.4
- 內部分辨率 480×270，整數倍縮放，Arcade 物理 60fps
- 優先 WebGL；若環境唔支援會自動退回 Canvas，並略過 Light2D 以免當機
- 子彈、衝刺殘影、首領彈均使用物件池

## 素材同授權

- 地圖圖塊：Kenney.nl《Pixel Platformer Industrial Expansion》（CC0）。完整授權見 `LICENSE-Kenney-Pixel-Platformer-Industrial-Expansion.txt`。
- 背景牆面額外一列圖塊、以及全部角色／首領／子彈／拾取物，均為本專案原創烘焙貼圖。
- 程式碼：MIT，見 `LICENSE`。更詳細來源說明見 `NOTICE`。

## 呢個專案唔係官方洛克人作品

本遊戲只係向經典動作平台遊戲致敬嘅原創課堂作品，同 Capcom、洛克人、Mega Man、Rockman 系列沒有任何官方關係。請勿將本作品稱為官方續作或使用官方角色名稱作為標題。
