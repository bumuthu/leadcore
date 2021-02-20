const config = require('config');
import { PathLike } from 'fs';
import { stringify } from 'qs';
import { AuthenticationService } from './auth-service';

const debug = require('debug')('session');

export class Session {

    private username: string;
    private password: string;
    private email: string;
    private token: string;
    private role: string;
    private poolId: string;
    private clientId: string;

    private authenticator: AuthenticationService;
    private requestConfig: any;

    public constructor(id: string) {

        this.username = config.get('sessions.' + id + '.username');
        this.password = config.get('sessions.' + id + '.password');
        this.email = config.get('sessions.' + id + '.email');
        this.role = config.get('sessions.' + id + '.role');
        this.poolId = config.get('aws-config.pool-id');
        this.clientId = config.get('aws-config.client-id');

        this.authenticator = new AuthenticationService(this.poolId, this.clientId);

        debug('created username=' + this.username + ', password=' + this.password);
    }

    public async signUp() {
        await this.authenticator.signUp(this.username, this.email, this.password)
    }

    public async login() {
        this.token = await this.authenticator.signIn(this.username, this.password);
        debug('TOKEN', this.token)
        if (!this.token) {
            throw this.token;
        }

        this.requestConfig = {
            returnRejectedPromiseOnError: true,
            withCredentials: true,
            timeout: 30000,
            baseURL: config.get('urls.base-url'),
            headers: {
                common: {
                    accept: 'application/json',
                    authorization: 'Bearer ' + this.token,
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    pragma: 'no-cache',
                },
            },
            paramsSerializer: (params: PathLike) => {
                stringify(params, {
                    indices: false,
                });
            },
        };

        debug('request config' + JSON.stringify(this.requestConfig, null, 2));
    }

    public async logout() {
        if (this.authenticator) {
            this.authenticator.signOut();
        }

        debug('logout username=' + this.username);
    }
}
