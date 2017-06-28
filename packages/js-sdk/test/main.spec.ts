import { Vault } from "../src/Vault";

describe('A test case', () => {
    it('Succeeds', () => {
        let v = new Vault();
        v.auth('some_server', 'some_username', 'some pwd', () => {

        });
    });
});
