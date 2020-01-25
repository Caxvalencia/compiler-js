import { Transition, State } from './state';

export class Helpers {
  static replaceEnd(
    transitions: Transition,
    endStateToFind,
    nextState: State
  ): Transition {
    for (let key in transitions) {
      if (transitions[key].indexOf(endStateToFind) === -1) {
        transitions[key].forEach((state: State) => {
          Helpers.replaceEnd(
            state.getTransitions(),
            endStateToFind,
            nextState
          );
        });

        continue;
      }

      transitions[key] = [nextState];
    }

    return transitions;
  }

  static makeIterator(data: Array<any>) {
    return {
      index: -1,
      next() {
        this.index++;

        return { value: data[this.index] };
      },
      before() {
        this.index--;

        return { value: data[this.index] };
      }
    };
  }
}
