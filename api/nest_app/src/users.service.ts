import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma : PrismaService) {}

    async createUser(data: CreateUserDto) {
        return this.prisma.user.create({
            data: {
                username: data.username,
                avatar: data.avatar || 'default.jpg'
            },
        });
    }
}