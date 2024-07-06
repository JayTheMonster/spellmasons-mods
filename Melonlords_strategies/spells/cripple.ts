/// <reference path="../../globalTypes.d.ts" />
import type { Spell } from '../../types/cards/index';
// Couldn't figure out how to get this from the API stuff
import { IUnit } from '../../types/entity/Unit';
import Underworld from '../../types/Underworld';

const {
    PixiUtils,
    rand,
    cardUtils,
    cardsUtil,
    commonTypes,
    cards,
    FloatingText
} = globalThis.SpellmasonsAPI;

const { randFloat } = rand;
const { refundLastSpell } = cards;
const { containerSpells } = PixiUtils;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { playDefaultSpellAnimation, playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;
const { getOrInitModifier } = cardsUtil

// Most of the code below is copied from the spell 'slow' as of July 2024
export const crippleCardId = 'Cripple';
const changeProportion = 0.50;
function remove(unit: IUnit, underworld: Underworld) {
  if (!unit.modifiers[crippleCardId]) {
    console.error(`Missing modifier object for ${crippleCardId}; cannot remove.  This should never happen`);
    return;
  }
  // Safely restore unit's original properties
  const { staminaMax, moveSpeed } = unit.modifiers[crippleCardId].originalStats;

  const staminaChange = staminaMax / unit.staminaMax;
  unit.stamina *= staminaChange;
  unit.stamina = Math.floor(unit.stamina);
  unit.staminaMax = staminaMax;
  // Prevent unexpected overflow
  unit.stamina = Math.min(staminaMax, unit.stamina);

  unit.moveSpeed = moveSpeed;
}
function add(unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) {
  const { staminaMax, moveSpeed } = unit;
  const modifier = getOrInitModifier(unit, crippleCardId, {
    isCurse: true,
    quantity,
    originalStats: {
      staminaMax,
      moveSpeed
    }
  }, () => { });
  const quantityModifiedChangeProportion = Math.pow(changeProportion, quantity);
  unit.moveSpeed *= quantityModifiedChangeProportion;
  unit.staminaMax *= quantityModifiedChangeProportion;
  unit.stamina *= quantityModifiedChangeProportion;
}

const spell: Spell = {
  card: {
    id: crippleCardId,
    category: CardCategory.Curses,
    supportQuantity: false,
    manaCost: 40,
    healthCost: 0,
    expenseScaling: 3,
    probability: probabilityMap[CardRarity.RARE],
    //thumbnail: 'spellmasons-mods/Melonlords_strategies/visuals/icons/spell'+ cardId +'.png',
    thumbnail: 'spellmasons-mods/Melonlords_strategies/visuals/icons/spellImmolate.png',
    description: ['Cripples a targeted unit.'],
    effect: async (state, card, quantity, underworld, prediction) => {
        // Living targets
        const targets = state.targetedUnits.filter(u => u.alive);

        //Refund if no targets, this is before mana trails to help save time
        if (targets.length == 0) {
            refundLastSpell(state, prediction, 'No valid targets. Cost refunded.');
            return state;
        }

        await Promise.all([playDefaultSpellAnimation(card, targets, prediction), playDefaultSpellSFX(card, prediction)]);
        for (let unit of targets) {
            Unit.addModifier(unit, crippleCardId, underworld, prediction, quantity);
            if (!prediction) {
                FloatingText.default({ coords: unit, text: 'Crippled' });
            }
            // else {
            //     FloatingText.default({coords: unit, text: 'Will cripple'});
            // }
        }
        
        return state;
    },
  },
  modifiers: {
    add,
    remove,
  },
  events: {
  },
};
export default spell;
