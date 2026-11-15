import Phaser from 'phaser';
import { addUiText, type UiText } from './UiText';
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
  private readonly promptText: UiText;
  private readonly feedbackText: UiText;
  private readonly continueBtn: Phaser.GameObjects.Rectangle;
  private readonly continueLabel: UiText;
  private readonly choices: ChoiceBtn[] = [];
  private open = false;
  private topic: TopicId | null = null;
  private question: ScienceQuestion | null = null;
  private locked = false;

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

    this.titleText = addUiText(scene, 240, 16, '學習站', {
      size: 24,
      color: '#7ef0ff',
      originX: 0.5,
      originY: 0
    }).setScrollFactor(0);

    const close = addUiText(scene, 448, 16, '關閉', {
      size: 12,
      color: '#c9f6ff',
      originX: 1,
      originY: 0
    })
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.hide());

    this.promptText = addUiText(scene, 32, 46, '', {
      size: 12,
      color: '#e8fbff',
      wordWrap: 416
    }).setScrollFactor(0);

    for (let i = 0; i < 3; i++) {
      const y = 108 + i * 36;
      const box = scene.add
        .rectangle(240, y, 400, 30, 0x182233, 1)
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

    this.feedbackText = addUiText(scene, 240, 216, '', {
      size: 12,
      color: '#b8e6ee',
      originX: 0.5,
      originY: 0,
      wordWrap: 416,
      align: 'center'
    }).setScrollFactor(0);

    this.continueBtn = scene.add
      .rectangle(240, 248, 160, 22, 0x155a66, 1)
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
      close,
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
    this.open = true;
    this.locked = false;
    this.root.setVisible(true);
    this.scene.physics.world.pause();
    this.scene.time.paused = true;
    this.scene.tweens.pauseAll();
    this.loadQuestion();
  }

  hide(): void {
    if (!this.open) return;
    this.open = false;
    this.topic = null;
    this.question = null;
    this.locked = false;
    this.root.setVisible(false);
    this.scene.physics.world.resume();
    this.scene.time.paused = false;
    this.scene.tweens.resumeAll();
    this.onClosed();
  }

  destroy(): void {
    this.root.destroy(true);
  }

  private loadQuestion(): void {
    if (!this.topic) return;
    const info = TOPIC_BY_ID[this.topic];
    this.titleText.setText(info.stationLabel);
    this.question = pickQuestion(this.topic, this.progress.answeredIds);
    this.promptText.setText(this.question.prompt);
    this.feedbackText.setText('揀一個你認為合適嘅答案。答錯都可以再試。');
    this.feedbackText.setColor('#b8e6ee');
    this.setContinueVisible(false);
    this.question.choices.forEach((choice, i) => {
      this.choices[i].label.setText(choice);
      this.choices[i].box.setFillStyle(0x182233, 1);
      this.choices[i].box.setStrokeStyle(1, 0x3a6a7c);
      this.choices[i].box.setVisible(true);
      this.choices[i].label.setVisible(true);
    });
  }

  private onChoice(index: number): void {
    if (!this.open || this.locked || !this.question) return;
    const q = this.question;
    if (index === q.answer) {
      this.locked = true;
      this.choices.forEach((c, i) => {
        if (i === index) {
          c.box.setFillStyle(0x155a66, 1);
          c.box.setStrokeStyle(1, 0x5ce8ff);
        }
      });
      const { firstClear, points } = this.progress.markCorrect(q);
      const extra = firstClear
        ? `科學分 +${points}！呢個學習站完成喇。`
        : `科學分 +${points}！`;
      this.feedbackText.setColor('#8ffff4');
      this.feedbackText.setText(`${q.explain} ${extra}`);
      speakTerm(q.speak);
      this.setContinueVisible(true);
      this.onChanged();
    } else {
      this.choices[index].box.setFillStyle(0x3a2230, 1);
      this.choices[index].box.setStrokeStyle(1, 0xc07080);
      this.feedbackText.setColor('#ffe8a0');
      this.feedbackText.setText(`再諗諗：${q.hint}`);
    }
  }

  private setContinueVisible(visible: boolean): void {
    this.continueBtn.setVisible(visible);
    this.continueLabel.setVisible(visible);
  }
}
