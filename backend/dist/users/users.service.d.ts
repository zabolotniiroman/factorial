import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    findOrCreate(username: string): Promise<User>;
    findByUsername(username: string): Promise<User | null>;
}
//# sourceMappingURL=users.service.d.ts.map