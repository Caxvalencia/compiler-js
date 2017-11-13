import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';

@suite('ExampleTest')
export class ExampleTest {

    @test
    public testIsOk() {
        expect(true, 'Passed');
    }
}