/// <reference path="../../globalTypes.d.ts" />
import type { Spell } from '../../types/cards/index';
import { crippleCardId } from './cripple';
import { lesserSlowCardId } from './lesser_slow';

const {
    PixiUtils,
    rand,
    cardUtils,
    commonTypes,
    cards,
    FloatingText
} = globalThis.SpellmasonsAPI;

const { randInt } = rand;
const { refundLastSpell } = cards;
const { containerSpells } = PixiUtils;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { oneOffImage, playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const cardId = 'Rock Spike';
const animationPath = 'Rock Spike';
const damageDone = 10;
const delayBetweenAnimationsStart = 400;

const spell: Spell = {
    card: {
        id: cardId,
        category: CardCategory.Damage,
        supportQuantity: true,
        manaCost: 10,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.COMMON],
        //thumbnail: 'spellmasons-mods/Melonlords_strategies/visuals/icons/spell'+ cardId +'.png',
        thumbnail: 'spellmasons-mods/Melonlords_strategies/visuals/icons/spellImmolate.png',
        //animationPath,
        sfx: 'hurt',
        description: [`Deals ${damageDone} to targets within range and slowing them by 80%, regardless of Line of Sight. An earth spell`],
        effect: async (state, card, quantity, underworld, prediction) => {
            // Living targets
            const targets = state.targetedUnits.filter(u => u.alive);
            let delayBetweenAnimations = delayBetweenAnimationsStart;
            //Refund if no targets, this is before mana trails to help save time
            if (targets.length == 0) {
                refundLastSpell(state, prediction, 'No valid targets. Cost refunded.');
                return state;
            }
            // Loop through the instances of the spell
            for (let q = 0; q < quantity; q++) {
                // Client side only
                if (!prediction && !globalThis.headless) {
                    // Play sound effect once for each target but every spell instances - client side only
                    playDefaultSpellSFX(card, prediction);
                    // Loop through targets
                    for (let unit of targets) {
                        // const spellEffectImage = oneOffImage(unit, animationPath, containerSpells);
                        // spellEffectImage
                        // if (spellEffectImage) {
                        //     // Randomize x-coord a bit so that subsequent spikes don't perfectly overlap
                        //     spellEffectImage.sprite.x += randInt(24, 40);
                        // }
                        // Inflict damage to targets
                        Unit.takeDamage({
                            unit: unit,
                            amount: damageDone,
                            sourceUnit: state.casterUnit,
                            fromVec2: state.casterUnit,
                        }, underworld, prediction);
                        // Apply modifiers - cripple or slow
                        if (quantity >= 5 && q == 0) {
                            Unit.addModifier(
                                unit, 
                                crippleCardId,
                                underworld, 
                                prediction,
                                quantity);
                            FloatingText.default({ coords: unit, text: 'Crippled' });
                        }
                        else if (quantity < 5) {
                            Unit.addModifier(
                                unit, 
                                lesserSlowCardId,
                                underworld, 
                                prediction,
                                quantity);
                            FloatingText.default({ coords: unit, text: 'Slowed' });
                        }
                    }
                    // Wait some delay between attacks
                    await new Promise(resolve => setTimeout(resolve, delayBetweenAnimations));
                    // Juice: Speed up subsequent hits
                    delayBetweenAnimations *= 0.80
                    // Don't let it go below 20 milliseconds
                    delayBetweenAnimations = Math.max(20, delayBetweenAnimations);                    
                }
                else {
                    // Loop through targets
                    for (let unit of targets) {
                        // Inflict damage to targets
                        Unit.takeDamage({
                            unit: unit,
                            amount: damageDone,
                            sourceUnit: state.casterUnit,
                            fromVec2: state.casterUnit,
                        }, underworld, prediction);
                        // Show modifiers - cripple or slow
                        // if (quantity >= 3 && !globalThis.headless) {
                        //     FloatingText.default({ coords: unit, text: 'Will cripple' });
                        // }
                        // else if (!globalThis.headless) {
                        //     FloatingText.default({ coords: unit, text: 'Will slow' });
                        // }
                    }
                }
            }

            // To allow for animations of current spell to finish before 
            // the next spell in the cast order starts
            if (!prediction && !globalThis.headless) {
                await new Promise((resolve) => {
                    setTimeout(resolve, 800);
                })
            }
            return state;
        },
    },
};

export default spell;
