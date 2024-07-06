import type * as commonTypes from './types/types/commonTypes';

import UndeadBlade from './undead_blade/undead_blade';
import Wodes_Grimoire from './Wodes_Grimoire/Index';
import Renes_Gimmicks from './Renes_gimmicks/Index';
import Melonlords_Strategies from './Melonlords_strategies/Index';

const mods: commonTypes.Mod[] = [
    UndeadBlade,
    Wodes_Grimoire,
    Renes_Gimmicks,
    Melonlords_Strategies
];
console.log('Mods: Add mods', mods);
globalThis.mods = mods;