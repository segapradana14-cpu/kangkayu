import { PrismaClient } from '@prisma/client';

// Satu koneksi dipakai ulang agar tidak membuat koneksi baru setiap kali kode dimuat ulang saat development.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
