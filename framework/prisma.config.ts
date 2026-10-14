import "dotenv/config";
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';
console.log(process.env.DATABASE_URL);
export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma", // Keep this as a plain string path
    db: {
      connection: process.env.DATABASE_URL!,
    },
  }),
});
