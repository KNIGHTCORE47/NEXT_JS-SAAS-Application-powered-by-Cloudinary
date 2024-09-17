/*
  Warnings:

  - Changed the type of `duration` on the `Video` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "duration",
ADD COLUMN     "duration" DOUBLE PRECISION NOT NULL;
