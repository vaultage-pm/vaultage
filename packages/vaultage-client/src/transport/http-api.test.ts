import { AxiosResponse, AxiosStatic } from 'axios';
import { instance, Mock, mock, mockInstance, verify, when, contains, anything } from 'omnimock';
import { ApiConsumer } from 'rest-ts-axios';
import { api, VaultageConfig, PushPullResponse } from 'vaultage-protocol';

import { ERROR_CODE, VaultageError } from '../VaultageError';
import { HttpApi } from './http-api';
import { TransportPrimitivesProvider } from './transport-primitives-provider';
import { ResponseUtils } from './response-utils';


describe('HttpApi', () => {
    let service: HttpApi;

    let transportPrimitives: Mock<TransportPrimitivesProvider>;
    let consumer: Mock<ApiConsumer<typeof api>>;
    let axios: AxiosStatic;
    let responseUtils: Mock<ResponseUtils>;

    const fakeAuth = () => ({
        username: 'John',
        password: 'Cena'
    });

    const fakeCredentials = () => ({
        localKey: 'l0c4l-key',
        remoteKey: 'r3m0t3-key',
        serverURL: 'the-url',
        username: 'johncena'
    });

    const fakeParams = () => ({
        remoteKey: 'r3m0t3-key',
        username: 'johncena'
    });

    beforeEach(() => {
        transportPrimitives = mock(TransportPrimitivesProvider);
        consumer = mock('consumer');
        axios = mockInstance('axios');
        responseUtils = mock(ResponseUtils);
        when(transportPrimitives.axios.create({ baseURL: 'the-url' })).return(axios).anyTimes();
        when(transportPrimitives.createConsumer(api, axios)).return(instance(consumer));

        service = new HttpApi(instance(transportPrimitives), instance(responseUtils));
    });

    afterEach(() => {
        verify(transportPrimitives);
        verify(consumer);
    });

    describe('pullConfig', () => {
        it('pulls the config with no params', async () => {
            const mockResponse = mockInstance<VaultageConfig>('config');
            when(consumer.pullConfig()).resolve(mockInstance<AxiosResponse<VaultageConfig>>('response', {
                data: mockResponse
            }));
            const response = await service.pullConfig('the-url');
            expect(response).toBe(mockResponse);
        });

        it('catches and converts transport errors', async () => {
            when(consumer.pullConfig()).reject(new Error('root cause'));
            try {
                await service.pullConfig('the-url');
                fail('expected an error');
            } catch (e) {
                expect((e as VaultageError).code).toBe(ERROR_CODE.NETWORK_ERROR);
            }
        });

        it('pulls the cipher with credentials', async () => {
            const mockResponse = mockInstance<VaultageConfig>('config');
            when(transportPrimitives.axios.create({ baseURL: 'the-url', auth: fakeAuth() })).return(axios);
            when(consumer.pullConfig()).resolve(mockInstance<AxiosResponse<VaultageConfig>>('response', {
                data: mockResponse
            }));
            const response = await service.pullConfig('the-url', {
                auth: fakeAuth()
            });
            expect(response).toBe(mockResponse);
        });
    });

    describe('pushCipher', () => {
        it('pushes the cipher with no params', async () => {
            const mockResponse = mockInstance<PushPullResponse>('response', {
                error: undefined,
                data: 'c1ph3r'
            });
            when(consumer.pullCipher({ params: contains(fakeParams()) }))
                .resolve(mockInstance<AxiosResponse<PushPullResponse>>('response', {
                    data: mockResponse
                }));
            when(responseUtils.checkResponseBody(mockResponse)).return(undefined);

            const response = await service.pullCipher(fakeCredentials());
            expect(response).toBe('c1ph3r');
        });

        it('catches and converts transport errors', async () => {
            when(consumer.pullCipher({ params: contains(fakeParams()) })).reject(new Error('root cause'));
            try {
                await service.pullCipher(fakeCredentials());
                fail('expected an error');
            } catch (e) {
                expect((e as VaultageError).code).toBe(ERROR_CODE.NETWORK_ERROR);
            }
        });

        it('forwards validation errors', async () => {
            const mockResponse = mockInstance<PushPullResponse>('response', {
                error: undefined,
                data: 'c1ph3r'
            });
            when(consumer.pullCipher({ params: contains(fakeParams()) }))
                .resolve(mockInstance<AxiosResponse<PushPullResponse>>('response', {
                    data: mockResponse
                }));
            when(responseUtils.checkResponseBody(mockResponse)).throw(new Error('test error'));
            try {
                await service.pullCipher(fakeCredentials());
                fail('expected an error');
            } catch (e) {
                expect(e.message).toBe('test error');
            }
        });

        it('pulls the config with credentials', async () => {
            const mockResponse = mockInstance<PushPullResponse>('config', {
                error: undefined,
                data: 'c1ph3r'
            });
            when(transportPrimitives.axios.create({ baseURL: 'the-url', auth: fakeAuth() })).return(axios);
            when(consumer.pullCipher({ params: contains(fakeParams()) }))
                .resolve(mockInstance<AxiosResponse<PushPullResponse>>('response', {
                    data: mockResponse
                }));
            when(responseUtils.checkResponseBody(mockResponse)).return(undefined);

            const response = await service.pullCipher(fakeCredentials(), {
                auth: fakeAuth()
            });
            expect(response).toBe('c1ph3r');
        });
    });

    describe('pullCipher', () => {
        it('pulls the cipher with no params', async () => {
            const mockResponse = mockInstance<PushPullResponse>('response', {
                error: undefined,
                data: 'c1ph3r'
            });
            when(consumer.pushCipher({
                params: contains(fakeParams()),
                body: {
                    new_password: 'new-remote',
                    new_data: 'c1ph3r',
                    old_hash: 'finger old',
                    new_hash: 'finger new',
                    force: false
                }
            }))
                .resolve(mockInstance<AxiosResponse<PushPullResponse>>('response', {
                    data: mockResponse
                }));
            when(responseUtils.checkResponseBody(mockResponse)).return(undefined);

            await service.pushCipher(fakeCredentials(), 'new-remote', 'c1ph3r', 'finger old', 'finger new');
        });

        it('fills blanks out empty remote key', async () => {
            const mockResponse = mockInstance<PushPullResponse>('response', {
                error: undefined,
                data: 'c1ph3r'
            });
            when(consumer.pushCipher({
                params: contains(fakeParams()),
                body: {
                    new_password: undefined,
                    new_data: 'c1ph3r',
                    old_hash: 'finger old',
                    new_hash: 'finger new',
                    force: false
                }
            }))
                .resolve(mockInstance<AxiosResponse<PushPullResponse>>('response', {
                    data: mockResponse
                }));
            when(responseUtils.checkResponseBody(mockResponse)).return(undefined);

            await service.pushCipher(fakeCredentials(), '', 'c1ph3r', 'finger old', 'finger new');
        });

        it('catches and converts transport errors', async () => {
            when(consumer.pushCipher(anything())).reject(new Error('root cause'));
            try {
                await service.pushCipher(fakeCredentials(), 'new-remote', 'c1ph3r', 'finger old', 'finger new');
                fail('expected an error');
            } catch (e) {
                expect((e as VaultageError).code).toBe(ERROR_CODE.NETWORK_ERROR);
            }
        });

        // it('forwards validation errors', async () => {
        //     const mockResponse = mockInstance<PushPullResponse>('response', {
        //         error: undefined,
        //         data: 'c1ph3r'
        //     });
        //     when(consumer.pushCipher({ params: contains(fakeParams()) }))
        //         .resolve(mockInstance<AxiosResponse<PushPullResponse>>('response', {
        //             data: mockResponse
        //         }));
        //     when(responseUtils.checkResponseBody(mockResponse)).throw(new Error('test error'));
        //     try {
        //         await service.pullCipher(fakeCredentials());
        //         fail('expected an error');
        //     } catch (e) {
        //         expect(e.message).toBe('test error');
        //     }
        // });

        // it('pushes the cipher with credentials', async () => {
        //     const mockResponse = mockInstance<PushPullResponse>('config', {
        //         error: undefined,
        //         data: 'c1ph3r'
        //     });
        //     when(transportPrimitives.axios.create({ baseURL: 'the-url', auth: fakeAuth() })).return(axios);
        //     when(consumer.pushCipher({ params: contains(fakeParams()) }))
        //         .resolve(mockInstance<AxiosResponse<PushPullResponse>>('response', {
        //             data: mockResponse
        //         }));
        //     when(responseUtils.checkResponseBody(mockResponse)).return(undefined);

        //     const response = await service.pullCipher(fakeCredentials(), {
        //         auth: fakeAuth()
        //     });
        //     expect(response).toBe('c1ph3r');
        // });
    });
});
