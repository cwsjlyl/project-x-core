export type ArmorSlot = 'helmet' | 'body' | 'arms' | 'legs';
export type EquipSlot = ArmorSlot | 'chip1' | 'chip2';
export type ItemKind = ArmorSlot | 'chip';

export interface ItemEffects {
  maxHpBonus?: number;
  atkBonus?: number;
  lightRadius?: number;
  damageReduction?: number;
  chargeSpeed?: number;
  canAirDash?: boolean;
  regenPerSecond?: number;
  bossDamageBonus?: number;
  invulnBonus?: number;
  doubleShot?: boolean;
}

export interface EquipItem {
  id: string;
  name: string;
  kind: ItemKind;
  description: string;
  effects: ItemEffects;
}

export interface DerivedStats {
  maxHpBonus: number;
  atkBonus: number;
  lightRadius: number;
  damageReduction: number;
  chargeSpeed: number;
  canAirDash: boolean;
  regenPerSecond: number;
  bossDamageBonus: number;
  invulnMs: number;
  doubleShot: boolean;
}

export const ITEM_CATALOG: Record<string, EquipItem> = {
  helm_starter: {
    id: 'helm_starter',
    name: '蒼藍頭盔',
    kind: 'helmet',
    description: '生命上限 +8，配備標準探燈。',
    effects: { maxHpBonus: 8, lightRadius: 130 }
  },
  helm_scout: {
    id: 'helm_scout',
    name: '探哨頭盔',
    kind: 'helmet',
    description: '大幅擴大燈光範圍，方便探路。',
    effects: { lightRadius: 220 }
  },
  helm_thunder: {
    id: 'helm_thunder',
    name: '潮汐甲盔',
    kind: 'helmet',
    description: '擊敗潮汐巨蟹後獲得。攻擊 +3，並強化探燈。',
    effects: { atkBonus: 3, lightRadius: 180 }
  },
  body_starter: {
    id: 'body_starter',
    name: '標準胸甲',
    kind: 'body',
    description: '基礎防護，無特別效果。',
    effects: {}
  },
  body_energy: {
    id: 'body_energy',
    name: '動能胸甲',
    kind: 'body',
    description: '受到傷害減少約 20%。',
    effects: { damageReduction: 0.2 }
  },
  arms_starter: {
    id: 'arms_starter',
    name: '標準手砲',
    kind: 'arms',
    description: '三段蓄力射擊（輕點／中蓄／滿蓄）。',
    effects: {}
  },
  arms_rapid: {
    id: 'arms_rapid',
    name: '迅擊手臂',
    kind: 'arms',
    description: '蓄力速度加快約 35%。',
    effects: { chargeSpeed: 1.35 }
  },
  legs_starter: {
    id: 'legs_starter',
    name: '標準腿甲',
    kind: 'legs',
    description: '可在地面或牆上發動衝刺。',
    effects: {}
  },
  legs_airdash: {
    id: 'legs_airdash',
    name: '空躍腿甲',
    kind: 'legs',
    description: '每次跳躍可進行一次空中衝刺。',
    effects: { canAirDash: true }
  },
  chip_charge: {
    id: 'chip_charge',
    name: '迅充晶片',
    kind: 'chip',
    description: '被動：蓄力速度再提升約 20%。',
    effects: { chargeSpeed: 1.2 }
  },
  chip_regen: {
    id: 'chip_regen',
    name: '再生晶片',
    kind: 'chip',
    description: '被動：緩慢回復生命（每秒 2 點）。',
    effects: { regenPerSecond: 2 }
  },
  chip_breaker: {
    id: 'chip_breaker',
    name: '破核晶片',
    kind: 'chip',
    description: '被動：對首領造成的傷害提升 40%。',
    effects: { bossDamageBonus: 0.4 }
  },
  chip_iframe: {
    id: 'chip_iframe',
    name: '閃避晶片',
    kind: 'chip',
    description: '被動：受傷後無敵時間延長。',
    effects: { invulnBonus: 400 }
  },
  chip_double: {
    id: 'chip_double',
    name: '雙發晶片',
    kind: 'chip',
    description: '被動：發射時追加一發並行子彈。',
    effects: { doubleShot: true }
  }
};

export const STARTER_IDS = [
  'helm_starter',
  'body_starter',
  'arms_starter',
  'legs_starter'
] as const;

export interface Loadout {
  helmet: string;
  body: string;
  arms: string;
  legs: string;
  chip1: string | null;
  chip2: string | null;
}

export class EquipmentSystem {
  readonly owned = new Set<string>();
  loadout: Loadout = {
    helmet: 'helm_starter',
    body: 'body_starter',
    arms: 'arms_starter',
    legs: 'legs_starter',
    chip1: null,
    chip2: null
  };

  constructor() {
    for (const id of STARTER_IDS) this.owned.add(id);
  }

  grant(id: string): boolean {
    if (!ITEM_CATALOG[id] || this.owned.has(id)) return false;
    this.owned.add(id);
    return true;
  }

  getItem(id: string | null): EquipItem | null {
    if (!id) return null;
    return ITEM_CATALOG[id] ?? null;
  }

  isEquipped(id: string): boolean {
    const l = this.loadout;
    return (
      l.helmet === id ||
      l.body === id ||
      l.arms === id ||
      l.legs === id ||
      l.chip1 === id ||
      l.chip2 === id
    );
  }

  equippedId(slot: EquipSlot): string | null {
    return this.loadout[slot];
  }

  /** Equip an owned item into the matching slot (chips fill first empty, or chip1). */
  equip(id: string, preferredChip?: 'chip1' | 'chip2'): boolean {
    const item = this.getItem(id);
    if (!item || !this.owned.has(id)) return false;
    if (item.kind === 'chip') {
      if (this.loadout.chip1 === id || this.loadout.chip2 === id) return true;
      const slot =
        preferredChip && !this.loadout[preferredChip]
          ? preferredChip
          : this.loadout.chip1 === null
            ? 'chip1'
            : this.loadout.chip2 === null
              ? 'chip2'
              : (preferredChip ?? 'chip1');
      this.loadout[slot] = id;
      return true;
    }
    this.loadout[item.kind] = id;
    return true;
  }

  unequipChip(slot: 'chip1' | 'chip2'): void {
    this.loadout[slot] = null;
  }

  derive(): DerivedStats {
    const ids = [
      this.loadout.helmet,
      this.loadout.body,
      this.loadout.arms,
      this.loadout.legs,
      this.loadout.chip1,
      this.loadout.chip2
    ];
    let maxHpBonus = 0;
    let atkBonus = 0;
    let lightRadius = 110;
    let damageReduction = 0;
    let chargeSpeed = 1;
    let canAirDash = false;
    let regenPerSecond = 0;
    let bossDamageBonus = 0;
    let invulnMs = 800;
    let doubleShot = false;

    for (const id of ids) {
      const item = this.getItem(id);
      if (!item) continue;
      const e = item.effects;
      maxHpBonus += e.maxHpBonus ?? 0;
      atkBonus += e.atkBonus ?? 0;
      if (e.lightRadius && e.lightRadius > lightRadius) {
        lightRadius = e.lightRadius;
      }
      damageReduction += e.damageReduction ?? 0;
      if (e.chargeSpeed) chargeSpeed *= e.chargeSpeed;
      if (e.canAirDash) canAirDash = true;
      regenPerSecond += e.regenPerSecond ?? 0;
      bossDamageBonus += e.bossDamageBonus ?? 0;
      invulnMs += e.invulnBonus ?? 0;
      if (e.doubleShot) doubleShot = true;
    }

    return {
      maxHpBonus,
      atkBonus,
      lightRadius,
      damageReduction: Math.min(0.6, damageReduction),
      chargeSpeed,
      canAirDash,
      regenPerSecond,
      bossDamageBonus,
      invulnMs,
      doubleShot
    };
  }

  ownedList(): EquipItem[] {
    const items: EquipItem[] = [];
    for (const id of Object.keys(ITEM_CATALOG)) {
      if (this.owned.has(id)) items.push(ITEM_CATALOG[id]);
    }
    return items;
  }
}
