import { AuthenticationService } from './auth-service';

const POOL_ID = 'us-east-2_oA3vL0NU6';
const CLIENT_ID = '1gtgjrm2oj3u0cnkks0j3hkneg';

export class Session {

    private authenticator: AuthenticationService;

    public constructor() {
        this.authenticator = new AuthenticationService(POOL_ID, CLIENT_ID);
    }

    public async signUp(username: string, email: string, password: string) {
        const userRes = await this.authenticator.signUp(username, email, password);

        return userRes;
    }

    public async signIn(username: string, password: string) {
        const token = await this.authenticator.signIn(username, password);
        
        if (!token) {
            throw token;
        }

        return token;
    }

    public async logout() {
        if (this.authenticator) {
            this.authenticator.signOut();
        }
    }
}
