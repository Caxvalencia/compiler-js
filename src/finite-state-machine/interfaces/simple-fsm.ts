import { State } from '../state';

export interface ISimpleFSM {
  init: State;
  end: State;
}
