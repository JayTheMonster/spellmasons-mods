/// <reference types="lodash" />
import type * as PIXI from 'pixi.js';
import { Vec2 } from '../jmath/Vec';
import { Localizable } from '../localization';
interface FloatingTextInsructions {
    coords: Vec2;
    text: Localizable;
    container?: PIXI.Container;
    style?: Partial<PIXI.ITextStyle>;
    keepWithinCameraBounds?: boolean;
    valpha?: number;
    aalpha?: number;
}
export default function floatingText({ coords, text, container, style, keepWithinCameraBounds, valpha, aalpha, }: FloatingTextInsructions): Promise<void>;
export declare const elPIXIHolder: HTMLElement;
export declare function queueCenteredFloatingText(text: Localizable, fill?: string | number): void;
export declare function centeredFloatingText(text: Localizable, fill?: string | number): void;
export declare const warnNoMoreSpellsToChoose: import("lodash").DebouncedFunc<() => void>;
export {};
