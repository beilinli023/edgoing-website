/*
  Warnings:

  - You are about to drop the column `city` on the `china_programs` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_china_programs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "language" TEXT NOT NULL DEFAULT 'zh',
    "country" TEXT,
    "cityId" TEXT,
    "duration" TEXT NOT NULL,
    "deadline" DATETIME,
    "featuredImage" TEXT,
    "gallery" TEXT,
    "highlights" TEXT,
    "academics" TEXT,
    "itinerary" TEXT,
    "requirements" TEXT,
    "type" TEXT,
    "gradeLevel" TEXT,
    "sessions" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "china_programs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "china_programs_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_china_programs" ("academics", "authorId", "country", "createdAt", "deadline", "description", "duration", "featuredImage", "gallery", "gradeLevel", "highlights", "id", "itinerary", "language", "publishedAt", "requirements", "sessions", "slug", "status", "title", "type", "updatedAt") SELECT "academics", "authorId", "country", "createdAt", "deadline", "description", "duration", "featuredImage", "gallery", "gradeLevel", "highlights", "id", "itinerary", "language", "publishedAt", "requirements", "sessions", "slug", "status", "title", "type", "updatedAt" FROM "china_programs";
DROP TABLE "china_programs";
ALTER TABLE "new_china_programs" RENAME TO "china_programs";
CREATE UNIQUE INDEX "china_programs_slug_key" ON "china_programs"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
