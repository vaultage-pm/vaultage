import { injectable } from 'tsyringe';
import { createConsumer } from 'rest-ts-axios';
import axios from 'axios';

@injectable()
export class TransportPrimitivesProvider {
    /* istanbul ignore next */
    public readonly createConsumer = createConsumer;
    /* istanbul ignore next */
    public readonly axios = axios;
}