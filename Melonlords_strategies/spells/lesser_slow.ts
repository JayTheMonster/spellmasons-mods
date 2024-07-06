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
// Include parts from spell 'freeze' for a limited-timed slow effect
export const lesserSlowCardId = 'Lesser Slow';
const changeProportion = 0.80;
const spell: Spell = {
  card: {
    id: lesserSlowCardId,
    category: CardCategory.Curses,
    supportQuantity: true,
    manaCost: 10,
    healthCost: 0,
    expenseScaling: 1,
    probability: probabilityMap[CardRarity.UNCOMMON],
    //thumbnail: 'spellmasons-mods/Melonlords_strategies/visuals/icons/spell'+ cardId +'.png',
    thumbnail: 'spellmasons-mods/Melonlords_strategies/visuals/icons/spellImmolate.png',
    description: ['Slows a targeted unit by 80% for 2 turns.'],
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
            Unit.addModifier(unit, lesserSlowCardId, underworld, prediction, quantity);
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
    onTurnEnd: async (unit: IUnit, underworld: Underworld, prediction: boolean) => {
      // Retrieve spell effect modifier
      const modifier = unit.modifiers[lesserSlowCardId];
      if (modifier) {
        // Decrement how many turns left the unit is slowed
        modifier.quantity--;
        updateTooltip(unit, modifier.quantity, prediction);
        if (modifier.quantity == 0) {
          // Remove slow effects at 0
          remove(unit, underworld);
          Unit.removeModifier(unit, lesserSlowCardId, underworld);
        }
      }
    },
  },
};
// Removing the spell's effect
function remove(unit: IUnit, underworld: Underworld) {
    if (!unit.modifiers[lesserSlowCardId]) {
        console.error(`Missing modifier object for ${lesserSlowCardId}; cannot remove.  This should never happen`);
        return;
    }
    // Safely restore unit's original properties
    const { staminaMax, moveSpeed } = unit.modifiers[lesserSlowCardId].originalStats;

    const staminaChange = staminaMax / unit.staminaMax;
    unit.stamina *= staminaChange;
    unit.stamina = Math.floor(unit.stamina);
    unit.staminaMax = staminaMax;
    // Prevent unexpected overflow
    unit.stamina = Math.min(staminaMax, unit.stamina);

    unit.moveSpeed = moveSpeed;
}
// Adding the spell's effect
function add(unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) {
    const { staminaMax, moveSpeed } = unit;
    // Adds a endTurnEvent to the unit
    // Should only run if lesser slow was not affecting the unit already
    if(!unit.onTurnEndEvents.includes(lesserSlowCardId)) {
        unit.onTurnEndEvents.push(lesserSlowCardId);
    }
    // Getting or initializing modifier status on unit
    const modifier = getOrInitModifier(unit, lesserSlowCardId, {
        isCurse: true,
        quantity,
        originalStats: {
        staminaMax,
        moveSpeed
        }
    }, () => { });
    // Calculate total slow proportion and change unit's speed/stamina
    const quantityModifiedChangeProportion = Math.pow(changeProportion, quantity);
    unit.moveSpeed *= quantityModifiedChangeProportion;
    unit.staminaMax *= quantityModifiedChangeProportion;
    unit.stamina *= quantityModifiedChangeProportion;
}
// Function to update the tooltip with how many turns are left
function updateTooltip(unit: IUnit, quantity: number, prediction: boolean) {
  if (!prediction && unit.modifiers[lesserSlowCardId]) {
    // Set tooltip:
    unit.modifiers[lesserSlowCardId].tooltip = lesserSlowCardId + ' for ' + quantity + ' turns';
  }
}
export default spell;
