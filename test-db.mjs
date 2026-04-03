import { createClient } from "@libsql/client";

const db = createClient({ 
  url: "libsql://clinic-db-sedooo1300.aws-eu-west-1.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzUyMzM4MjYsImlkIjoiMDE5ZDU0MmMtZTEwMS03NWViLThjMzYtZTUzM2I2Y2IzNzEzIiwicmlkIjoiZTk4YjA0MWQtOTQ1ZS00ODE0LTg3YWItNGQzMDM4MWVjODkwIn0.9q6cNuQSk1dx0e97jrx_qxeshLx-7gDqqS9w20lmFiI3J7faUCSer6IKpb8VPEY3DubmUpW-mrR1QOdnpvH6Cg",
  intMode: "number"
});

try {
  const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log("Tables:", tables.rows.map(r => r.name));

  const pcols = await db.execute("PRAGMA table_info(Patient)");
  console.log("\nPatient columns:");
  pcols.rows.forEach(r => console.log(" ", r.name, r.type));

  // Create _prisma_migrations if missing
  try {
    await db.execute("SELECT 1 FROM _prisma_migrations LIMIT 1");
    console.log("\n_prisma_migrations: exists");
  } catch {
    await db.execute(`CREATE TABLE "_prisma_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )`);
    console.log("\n_prisma_migrations: created");
  }

  // Test insert
  console.log("\nTest insert...");
  await db.execute(`INSERT INTO "User" ("id","name","role","isActive","createdAt","updatedAt") VALUES ('test-1','Dr Test','doctor',1,datetime('now'),datetime('now'))`);
  await db.execute(`INSERT INTO "Patient" ("id","name","createdBy","status","createdAt","updatedAt") VALUES ('pat-1','Test Patient','test-1','active',datetime('now'),datetime('now'))`);
  console.log("✓ Insert OK!");

  // Cleanup
  await db.execute(`DELETE FROM "Patient" WHERE id='pat-1'`);
  await db.execute(`DELETE FROM "User" WHERE id='test-1'`);
  console.log("✓ Cleaned up");
} catch(e) {
  console.error("Error:", e.message);
}

await db.close();
