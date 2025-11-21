import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly usersService;
    constructor(usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        username: string;
        userId: string;
        isAuthenticated: boolean;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map