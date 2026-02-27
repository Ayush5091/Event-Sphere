CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Event" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "location" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  
  -- New Fields added:
  "imageUrl" TEXT,          -- For AWS S3 URLs
  "category" TEXT,          -- e.g., 'Technical', 'Sports'
  "organizer" TEXT NOT NULL,-- e.g., 'Computer Science Dept'
  "status" TEXT NOT NULL DEFAULT 'UPCOMING', 
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Registration" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "eventId" UUID NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
  "studentName" TEXT NOT NULL,
  "studentEmail" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  
  -- New Field added:
  "status" TEXT NOT NULL DEFAULT 'REGISTERED', -- Could also be 'ATTENDED' later
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Table to define who is an admin
CREATE TABLE "Admin" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
