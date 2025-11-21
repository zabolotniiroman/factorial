import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        username: string;
        userId: string;
        isAuthenticated: boolean;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map