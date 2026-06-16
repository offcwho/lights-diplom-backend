import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwt: JwtService,
    ) { }

    private sign(user: { id: string; email: string; name: string | null; role: string }) {
        const token = this.jwt.sign({ sub: user.id, email: user.email });
        return {
            accessToken: token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }

    async register(dto: RegisterDto) {
        const exists = await this.usersService.findByEmail(dto.email);
        if (exists) throw new ConflictException('Email already registered');
        const password = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create({ email: dto.email, password, name: dto.name });
        return this.sign(user);
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmailWithPassword(dto.email);
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.sign(user);
    }
}
