import { State } from '../state';

export interface IFsm {
    init: State;
    end: State;
}
