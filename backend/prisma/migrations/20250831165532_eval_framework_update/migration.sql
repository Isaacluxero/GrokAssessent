/*
  Warnings:

  - You are about to drop the column `expected` on the `eval_cases` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `eval_runs` table. All the data in the column will be lost.
  - Added the required column `category` to the `eval_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `criteria` to the `eval_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `eval_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectedOutput` to the `eval_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `eval_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualOutput` to the `eval_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `caseName` to the `eval_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `eval_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectedOutput` to the `eval_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `input` to the `eval_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelUsed` to the `eval_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overallScore` to the `eval_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promptUsed` to the `eval_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scores` to the `eval_runs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "eval_cases" DROP COLUMN "expected",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "criteria" JSONB NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "expectedOutput" JSONB NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "eval_runs" DROP COLUMN "result",
ADD COLUMN     "actualOutput" JSONB NOT NULL,
ADD COLUMN     "caseName" TEXT NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "expectedOutput" JSONB NOT NULL,
ADD COLUMN     "input" JSONB NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "modelUsed" TEXT NOT NULL,
ADD COLUMN     "overallScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "promptUsed" TEXT NOT NULL,
ADD COLUMN     "scores" JSONB NOT NULL;
