import type { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

const BCRYPT_SALT_ROUNDS = 10;

export type PublicUser = Pick<User, 'id' | 'email' | 'createdAt'>;

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

export function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(
  email: string,
  password: string
): Promise<User> {
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  return prisma.user.create({
    data: { email, password: passwordHash },
  });
}

export function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
