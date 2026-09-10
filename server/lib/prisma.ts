import { PrismaClient } from '@prisma/client';

// Instância única compartilhada entre toda a aplicação (evita esgotar
// o pool de conexões do Postgres com múltiplos PrismaClient em dev/hot-reload).
export const prisma = new PrismaClient();
