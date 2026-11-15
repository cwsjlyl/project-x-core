import Phaser from 'phaser';
import { addUiText, type UiText } from './UiText';
import { gameAudio } from './Audio';
import {
  TOPIC_BY_ID,
  pickQuestion,
  speakTerm,
  type ScienceProgress,
  type ScienceQuestion,
  type TopicId
} from './ScienceBank';

interface ChoiceBtn {
  box: Phaser.GameObjects.Rectangle;
  label: UiText;
}

export class ScienceUI {
  private readonly root: Phaser.GameObjects.Container;
  private readonly titleText: UiText;
  private readonly closeLabel: UiText;
  private readonly promptText: UiText;
  private readonly feedbackText: UiText;
  private readonly continueBtn: Phaser.GameObjects.Rectangle;
  private readonly continueLabel: UiText;
  private readonly choices: ChoiceBtn[] = [];
  private open = false;
  private topic: TopicId | null = null;
  private question: ScienceQuestion | null = null;
  private locked = false;
  private bossMode = false;
  private onBossResolved: ((correct: boolean) => void) | null = null;
  private resolved: boolean | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly progress: ScienceProgress,
    private readonly onChanged: () => void,
    private readonly onClosed: () => void
  ) {
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(1300).setVisible(false);

    const dim = scene.add.rectangle(240, 135, 480, 270, 0x02060c, 0.86).setScrollFactor(0);
    dim.setInteractive();

    const panel = scene.add
      .rectangle(240, 135, 456, 250, 0x101826, 0.98)
      .setStrokeStyle(1, 0x3ecfff)
      .setScrollFactor(0);

    this.titleText = addUiText(scene, 240, 12, '學習站', {
      size: 24,
      color: '#7ef0ff',
      originX: 0.5,
      originY: 0
    }).setScrollFactor(0);

    this.closeLabel = addUiText(scene, 448, 14, '關閉', {
      size: 12,
      color: '#c9f6ff',
      originX: 1,
      originY: 0
    })
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    this.closeLabel.on('pointerdown', () => this.hide());

    this.promptText = addUiText(scene, 32, 42, '', {
      size: 12,
      color: '#e8fbff',
      wordWrap: 416
    }).setScrollFactor(0);

    for (let i = 0; i < 3; i++) {
      const y = 96 + i * 30;
      const box = scene.add
        .rectangle(240, y, 400, 26, 0x182233, 1)
        .setStrokeStyle(1, 0x3a6a7c)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      const label = addUiText(scene, 240, y, '', {
        size: 12,
        color: '#e8fbff',
        originX: 0.5,
        originY: 0.5,
        wordWrap: 380,
        align: 'center'
      }).setScrollFactor(0);
      const index = i;
      box.on('pointerdown', () => this.onChoice(index));
      label.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.onChoice(index));
      this.choices.push({ box, label });
    }

    this.feedbackText = addUiText(scene, 240, 188, '', {
      size: 12,
      color: '#b8e6ee',
      originX: 0.5,
      originY: 0,
      wordWrap: 416,
      align: 'center'
    }).setScrollFactor(0);

    this.continueBtn = scene.add
      .rectangle(240, 248, 160, 20, 0x155a66, 1)
      .setStrokeStyle(1, 0x5ce8ff)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.continueLabel = addUiText(scene, 240, 248, '繼續探索', {
      size: 12,
      color: '#8ffff4',
      originX: 0.5,
      originY: 0.5
    })
      .setScrollFactor(0)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    const finish = () => this.hide();
    this.continueBtn.on('pointerdown', finish);
    this.continueLabel.on('pointerdown', finish);

    this.root.add([
      dim,
      panel,
      this.titleText,
      this.closeLabel,
      this.promptText,
      this.feedbackText,
      this.continueBtn,
      this.continueLabel
    ]);
    this.choices.forEach((c) => this.root.add([c.box, c.label]));
  }

  get isOpen(): boolean {
    return this.open;
  }

  show(topic: TopicId): void {
    this.topic = topic;
    this.bossMode = false;
    this.onBossResolved = null;
    this.resolved = null;
    this.open = true;
    this.locked = false;
    this.closeLabel.setVisible(true);
    this.root.setVisible(true);
    this.pauseWorld();
    if (!this.progress.canAsk(topic)) {
      this.showFinished(topic);
      return;
    }
    this.loadQuestion();
  }

  /** Boss quarter-HP quiz. Physics stay paused until the player continues. */
  showBossQuestion(question: ScienceQuestion, onResolved: (correct: boolean) => void): void {
    this.topic = question.topic;
    this.bossMode = true;
    this.onBossResolved = onResolved;
    this.resolved = null;
    this.open = true;
    this.locked = false;
    this.question = question;
    this.closeLabel.setVisible(false);
    this.root.setVisible(true);
    this.pauseWorld();
    this.titleText.setText('首領科學題');
    this.promptText.setText(question.prompt);
    this.placeFeedback(188);
    this.feedbackText.setColor('#b8e6ee');
    this.feedbackText.setText('答對會電擊首領，答錯主角會被電擊。');
    this.setContinueVisible(false);
    this.showChoices(question);
  }

  /** Local preview: open a station and lock in the correct answer immediately. */
  previewCorrect(topic: TopicId = 'sound'): void {
    this.show(topic);
    if (this.question) this.onChoice(this.question.answer);
  }

  hide(): void {
    if (!this.open) return;
    this.open = false;
    this.topic = null;
    this.question = null;
    this.locked = false;
    this.root.setVisible(false);
    this.resumeWorld();
    const bossCb = this.onBossResolved;
    const resolved = this.resolved;
    this.onBossResolved = null;
    this.bossMode = false;
    this.resolved = null;
    this.onClosed();
    // Closing mid-quiz must not soft-lock the fight: treat as "no extra stun" if unanswered.
    if (bossCb && resolved !== null) bossCb(resolved);
    else if (bossCb) bossCb(false);
  }

  destroy(): void {
    this.root.destroy(true);
  }

  private pauseWorld(): void {
    this.scene.physics.world.pause();
    this.scene.time.paused = true;
    this.scene.tweens.pauseAll();
  }

  private resumeWorld(): void {
    this.scene.physics.world.resume();
    this.scene.time.paused = false;
    this.scene.tweens.resumeAll();
  }

  private showFinished(topic: TopicId): void {
    const info = TOPIC_BY_ID[topic];
    this.titleText.setText(info.stationLabel);
    this.question = null;
    this.locked = true;
    this.promptText.setText('呢個學習站完成啦。');
    this.hideChoices();
    this.placeFeedback(96);
    this.feedbackText.setColor('#8ffff4');
    this.feedbackText.setText('完成啦！每個學習站最多答兩題。科學分只計算答對嘅題目。');
    this.continueLabel.setText('繼續探索');
    this.setContinueVisible(true);
  }

  private loadQuestion(): void {
    if (!this.topic) return;
    const info = TOPIC_BY_ID[this.topic];
    this.titleText.setText(info.stationLabel);
    this.question = pickQuestion(this.topic, this.progress.answeredIds);
    this.promptText.setText(this.question.prompt);
    this.placeFeedback(188);
    const left = this.progress.remainingAttempts(this.topic);
    this.feedbackText.setText(
      left === 1
        ? '揀一個你認為合適嘅答案。呢個學習站仲有一題。'
        : '揀一個你認為合適嘅答案。呢個學習站最多可以答兩題。'
    );
    this.feedbackText.setColor('#b8e6ee');
    this.setContinueVisible(false);
    this.showChoices(this.question);
  }

  private showChoices(question: ScienceQuestion): void {
    question.choices.forEach((choice, i) => {
      const y = 96 + i * 30;
      this.choices[i].box.setPosition(240, y);
      this.choices[i].label.setPosition(240, y);
      this.choices[i].label.setText(choice);
      this.choices[i].box.setFillStyle(0x182233, 1);
      this.choices[i].box.setStrokeStyle(1, 0x3a6a7c);
      this.choices[i].box.setVisible(true);
      this.choices[i].label.setVisible(true);
    });
  }

  private hideChoices(): void {
    this.choices.forEach((c) => {
      c.box.setVisible(false);
      c.label.setVisible(false);
    });
  }

  private placeFeedback(y: number): void {
    this.feedbackText.setY(y);
  }

  private layoutAfterAnswer(): void {
    // Explanation occupies the space left by hidden choices. Continue sits below it.
    const explainTop = 86;
    this.placeFeedback(explainTop);
    const textH = Math.max(16, this.feedbackText.fill.height);
    const btnY = Math.min(252, Math.max(explainTop + textH + 16, 230));
    this.continueBtn.setY(btnY);
    this.continueLabel.setY(btnY);
  }

  private onChoice(index: number): void {
    if (!this.open || this.locked || !this.question) return;
    const q = this.question;
    if (index === q.answer) {
      this.locked = true;
      this.hideChoices();
      this.resolved = true;
      let extra = '';
      if (!this.bossMode) {
        const { justCleared, points, remaining } = this.progress.markCorrect(q);
        if (justCleared || remaining <= 0) extra = `科學分 +${points}！呢個學習站完成啦。`;
        else extra = `科學分 +${points}！仲有一題。`;
        this.onChanged();
      } else {
        extra = '答對喇！電擊會令首領暫停。';
      }
      if (!this.bossMode) gameAudio.play('correct');
      this.feedbackText.setColor('#8ffff4');
      this.feedbackText.setText(`${q.explain} ${extra}`);
      speakTerm(q.speak);
      this.continueLabel.setText(this.bossMode ? '繼續戰鬥' : '繼續探索');
      this.setContinueVisible(true);
      this.layoutAfterAnswer();
    } else {
      this.choices[index].box.setFillStyle(0x3a2230, 1);
      this.choices[index].box.setStrokeStyle(1, 0xc07080);
      this.feedbackText.setColor('#ffe8a0');
      this.placeFeedback(188);
      this.feedbackText.setText(`再諗諗：${q.hint}`);
      if (this.bossMode) {
        this.locked = true;
        this.resolved = false;
        this.hideChoices();
        this.feedbackText.setText(`答錯喇！${q.hint}　主角會被電擊暫停。`);
        this.continueLabel.setText('繼續戰鬥');
        this.setContinueVisible(true);
        this.layoutAfterAnswer();
      } else {
        this.locked = true;
        this.hideChoices();
        const { justCleared, remaining } = this.progress.markAttempt(q);
        let extra = '';
        if (justCleared || remaining <= 0) extra = '呢個學習站完成啦。';
        else extra = '仲有一題。';
        gameAudio.play('wrong');
        this.feedbackText.setText(`答錯喇！${q.hint}　${extra}`);
        this.continueLabel.setText('繼續探索');
        this.setContinueVisible(true);
        this.layoutAfterAnswer();
        this.onChanged();
      }
    }
  }

  private setContinueVisible(visible: boolean): void {
    this.continueBtn.setVisible(visible);
    this.continueLabel.setVisible(visible);
  }
}
