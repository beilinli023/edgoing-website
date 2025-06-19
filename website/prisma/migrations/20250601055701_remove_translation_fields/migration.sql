/*
  Warnings:

  - You are about to drop the column `content` on the `china_program_translations` table. All the data in the column will be lost.
  - You are about to drop the column `seoDescription` on the `china_program_translations` table. All the data in the column will be lost.
  - You are about to drop the column `seoTitle` on the `china_program_translations` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_china_program_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT,
    "academics" TEXT,
    "itinerary" TEXT,
    "requirements" TEXT,
    "materials" TEXT,
    CONSTRAINT "china_program_translations_programId_fkey" FOREIGN KEY ("programId") REFERENCES "china_programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_china_program_translations" ("academics", "description", "highlights", "id", "itinerary", "language", "materials", "programId", "requirements", "title") SELECT "academics", "description", "highlights", "id", "itinerary", "language", "materials", "programId", "requirements", "title" FROM "china_program_translations";
DROP TABLE "china_program_translations";
ALTER TABLE "new_china_program_translations" RENAME TO "china_program_translations";
CREATE UNIQUE INDEX "china_program_translations_programId_language_key" ON "china_program_translations"("programId", "language");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
