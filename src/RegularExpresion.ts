export const Operators = {
    EPSILON: '#',
    ZERO_OR_MANY: '*',
    OR: '|'
};

class State {
    nextStates: Array<State>;
    transition: string;
    isAccepted: boolean;

    constructor(
        transition?: any,
        nextStates?: Array<State>,
        isAccepted = false
    ) {
        this.transition = transition;
        this.nextStates = nextStates || [];
        this.isAccepted = isAccepted;
    }

    process(input?: string): Array<State> {
        return input === this.transition ? this.nextStates : null;
    }
}

interface IFsm {
    init: State;
    end: State;
}

class SimpleFsm implements IFsm {
    init: State;
    end: State;

    constructor(transition?) {
        this.end = new State(null, null, true);
        this.init = new State(transition, [this.end]);
    }
}

class KleeneFsm {
    /**
     * @param fsm
     */
    static apply(fsm: IFsm): IFsm {
        let kleene = new SimpleFsm();
        kleene.end = new State(Operators.EPSILON, [fsm.end], false);
        kleene.init = new State(fsm.init.transition, [kleene.end]);

        fsm.init.transition = Operators.EPSILON;
        fsm.init.nextStates.unshift(kleene.init);

        fsm.end.transition = Operators.EPSILON;
        fsm.end.nextStates = [kleene.init];

        return fsm;
    }
}

class ConcatFsm {
    /**
     * @param {IFsm} fsmFirst
     * @param {IFsm} fsmSecond
     */
    static apply(fsmFirst: IFsm, fsmSecond: IFsm) {
        fsmFirst.end.transition = Operators.EPSILON;
        fsmFirst.end.isAccepted = false;
        fsmFirst.end.nextStates = [fsmSecond.init];

        return fsmSecond;
    }
}

class UnionFsm {
    static fsmFirst: IFsm;
    static fsmSecond: IFsm;
    /**
     * @param fsmFirst
     * @param fsmSecond
     */
    static apply(fsmFirst: IFsm, fsmSecond?: IFsm) {
        this.fsmFirst = fsmFirst;
        this.fsmSecond = fsmSecond;

        let union = new SimpleFsm();
        union.end = new State(null, null, false);
        union.init = new State(Operators.EPSILON, [
            fsmFirst.init,
            fsmSecond.init
        ]);

        return union;
    }
}

declare let console;

export class RegularExpresion {
    protected separator: string = '-';
    protected source: string;

    constructor(regExp: string) {
        this.source = regExp;
    }

    /**
     * Convert to Deterministic Finite Automata
     * @return {Object}
     */
    public toDFA() {
        return this.toNFAe();
    }

    /**
     * @return {IFsm}
     */
    public toNFAe() {
        let fsm: SimpleFsm;
        let beforeFsm: SimpleFsm = null;
        let beforeChar = null;

        this.source.split('').forEach(character => {
            if (character === Operators.ZERO_OR_MANY) {
                fsm = KleeneFsm.apply(fsm);
                beforeFsm = fsm;

                return;
            }

            if (character === Operators.OR) {
                beforeChar = character;

                return;
            }

            //Stack?
            if (beforeChar === Operators.OR) {
                beforeFsm = UnionFsm.apply(fsm, new SimpleFsm(character));
                fsm = UnionFsm.fsmSecond;
                beforeChar = character;

                return;
            }

            fsm = new SimpleFsm(character);

            if (beforeFsm !== null) {
                ConcatFsm.apply(beforeFsm, fsm);
            }

            beforeFsm = fsm;
            beforeChar = character;
        });

        return fsm;
    }

    resolve(stack, input): any {
        return true;
    }
}
