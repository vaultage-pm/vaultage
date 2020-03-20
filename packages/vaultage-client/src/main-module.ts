import { Container } from 'inversify';
import { HttpApi } from './transport/http-api';
import { HttpService } from './transport/http-service';
import { MainService } from './main-service';
import { MergeService } from './merge-service';

export function createMainContainer() {
    const container = new Container();
    container.bind(HttpApi).toSelf().inSingletonScope();
    container.bind(HttpService).toSelf().inSingletonScope();
    container.bind(MainService).toSelf().inSingletonScope();
    container.bind(MergeService).toSelf().inSingletonScope();

    return container;
}
