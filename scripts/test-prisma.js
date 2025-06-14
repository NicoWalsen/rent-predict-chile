// scripts/test-prisma.js

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.listing.count();
    console.log("❖ Hay", count, "listing(s) en la base de datos.");
  } catch (e) {
    console.error("ERROR al contar listings:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("ERROR al conectar con Prisma:", e);
  process.exit(1);
});
