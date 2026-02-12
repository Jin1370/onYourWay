//데이터베이스와 통신할 수 있는 입구(Prisma Client 인스턴스)를 하나로 정의하고 내보내 어디서든 데이터를 읽고 쓸 수 있게 됨
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

export default db;
