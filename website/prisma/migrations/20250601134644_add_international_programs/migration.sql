-- CreateTable
CREATE TABLE "international_programs" (
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
    CONSTRAINT "international_programs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "international_programs_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "international_program_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" TEXT,
    "highlights" TEXT,
    "academics" TEXT,
    "itinerary" TEXT,
    "requirements" TEXT,
    "sessions" TEXT,
    "materials" TEXT,
    CONSTRAINT "international_program_translations_programId_fkey" FOREIGN KEY ("programId") REFERENCES "international_programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "international_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "studentPhone" TEXT,
    "studentAge" INTEGER,
    "parentName" TEXT,
    "parentEmail" TEXT,
    "parentPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "international_applications_programId_fkey" FOREIGN KEY ("programId") REFERENCES "international_programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "international_programs_slug_key" ON "international_programs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "international_program_translations_programId_language_key" ON "international_program_translations"("programId", "language");
