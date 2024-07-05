
import { Mod } from '../types/types/commonTypes';

//Imports for spells here
import Immolate from './spells/immolate';
import RockSpike from './spells/rock_spike';
import Cripple from './spells/cripple';

const mod: Mod = {
    modName: 'Melonlord\'s Strategies',
    author: 'JayTheMonster',
    description: 'The foreseen great strategies of the fearsome Melonlord!',
    screenshot: 'spellmasons-mods/Melonlords_strategies/visuals/icons/spellImmolate.png',
    spells: [
        //Add or Remove spells here.
        Immolate,
        RockSpike,
        Cripple
    ],
    spritesheet: 'spellmasons-mods/Melonlords_strategies/visuals/Immolate.json'
};
export default mod;