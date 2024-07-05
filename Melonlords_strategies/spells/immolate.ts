/// <reference path="../../globalTypes.d.ts" />
import type { Spell } from '../../types/cards/index';

const {
    PixiUtils,
    rand,
    cardUtils,
    commonTypes,
    cards
} = globalThis.SpellmasonsAPI;

const { randFloat } = rand;
const { refundLastSpell } = cards;
const { containerSpells } = PixiUtils;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { oneOffImage } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const cardId = 'Immolate';
const animationPath = 'Immolate';
const damageDone = 20;

const spell: Spell = {
    card: {
        id: cardId,
        category: CardCategory.Damage,
        supportQuantity: true,
        manaCost: 15,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.COMMON],
        thumbnail: 'spellmasons-mods/Melonlords_strategies/visuals/icons/spell'+ cardId +'.png',
        animationPath,
        sfx: 'hurt',
        description: [`Deals ${damageDone} to targets within range, regardless of Line of Sight. A fire spell`],
        effect: async (state, card, quantity, underworld, prediction) => {
            // Living targets
            // TODO: Perhaps it will burn up corpses?
            const targets = state.targetedUnits.filter(u => u.alive);

            //Refund if no targets, this is before mana trails to help save time
            if (targets.length == 0) {
                refundLastSpell(state, prediction, 'No valid targets. Cost refunded.');
                return state;
            }

            // Client side only
            if (!prediction && !globalThis.headless) {
                // Loop through targets
                for (let unit of targets) {
                    // Play animation
                    const spellEffectImage = oneOffImage(unit, animationPath, containerSpells);
                    spellEffectImage
                    // Inflict damage to targets
                    Unit.takeDamage({
                        unit: unit,
                        amount: (damageDone * quantity),
                        sourceUnit: state.casterUnit,
                        fromVec2: state.casterUnit,
                    }, underworld, prediction);
                }
            }
            // Prediction and server side
            else {
                // Loop through targets
                for (let unit of targets) {
                    // Inflict damage to targets
                    Unit.takeDamage({
                        unit: unit,
                        amount: (damageDone * quantity),
                        sourceUnit: state.casterUnit,
                        fromVec2: state.casterUnit,
                    }, underworld, prediction);
                }
            }

            // To allow for animations of current spell to finish before 
            // the next spell in the cast order starts
            if (!prediction && !globalThis.headless) {
                await new Promise((resolve) => {
                    setTimeout(resolve, 800);2
                })
            }
            return state;
        },
    },
};

export default spell;
