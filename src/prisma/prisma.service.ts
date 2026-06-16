
import { Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) throw new NotFoundException("Не удалось нихуя")

        super({ adapter });
    }

    async onModuleInit() {
        console.log('Connecting to database...');
        await this.$connect();
        console.log('Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}