import { IPlatform } from './platform';
import { IGlobal } from './global';
import { IDom } from './dom';
import { IFeature } from './feature';
import { JSDOM } from 'jsdom';
export declare function buildPal(): {
    global: IGlobal;
    platform: IPlatform;
    dom: IDom;
    feature: IFeature;
    jsdom: JSDOM;
};
