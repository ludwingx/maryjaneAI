-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('FUNCTIONAL', 'NON_FUNCTIONAL', 'BUSINESS_RULE', 'USE_CASE', 'USER_STORY');

-- CreateEnum
CREATE TYPE "DeliverableType" AS ENUM ('USER_STORIES', 'USE_CASES', 'FUNCTIONAL_REQUIREMENTS', 'NON_FUNCTIONAL_REQUIREMENTS', 'DATA_DICTIONARY', 'BUSINESS_RULES', 'ENTITY_MAP', 'FULL_DOCUMENT');

-- CreateEnum
CREATE TYPE "ProfessionalLevel" AS ENUM ('JUNIOR', 'SEMI_SENIOR', 'SENIOR', 'TECH_LEAD', 'ARCHITECT', 'SPECIALIST');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('TECHNICAL', 'BACHELOR', 'ENGINEERING', 'MASTER', 'DOCTORATE');

-- CreateEnum
CREATE TYPE "CostOfLiving" AS ENUM ('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "MarketScope" AS ENUM ('LOCAL', 'LATAM', 'NORTH_AMERICA', 'EUROPE', 'GLOBAL');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'STARTUP', 'SME', 'ENTERPRISE', 'GOVERNMENT', 'NGO', 'UNIVERSITY');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('VERY_URGENT', 'URGENT', 'NORMAL', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "ClarityLevel" AS ENUM ('VERY_CLEAR', 'PARTIAL', 'VERY_AMBIGUOUS');

-- CreateEnum
CREATE TYPE "AvailabilityLevel" AS ENUM ('RESPONSIVE', 'SLOW', 'HARD_TO_REACH');

-- CreateEnum
CREATE TYPE "ChangeLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "BusinessValue" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'TRANSFORMATIONAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('FULL_UPFRONT', 'MILESTONES', 'MONTHLY', 'ON_DELIVERY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT,
    "transcript" JSONB,
    "notes" JSONB,
    "audioUrl" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "RequirementType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "priority" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISuggestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "category" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AISuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "DeliverableType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rateGeneral" DOUBLE PRECISION NOT NULL DEFAULT 35,
    "rateFrontend" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "rateBackend" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "rateAI" DOUBLE PRECISION NOT NULL DEFAULT 55,
    "rateDesign" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "rateConsulting" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "rateDevOps" DOUBLE PRECISION NOT NULL DEFAULT 45,
    "rateQA" DOUBLE PRECISION NOT NULL DEFAULT 28,
    "yearsExperience" INTEGER NOT NULL DEFAULT 1,
    "professionalLevel" "ProfessionalLevel" NOT NULL DEFAULT 'SEMI_SENIOR',
    "educationLevel" "EducationLevel" NOT NULL DEFAULT 'BACHELOR',
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completedProjects" INTEGER NOT NULL DEFAULT 0,
    "internetCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "electricityCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coworkingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hostingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "licenseCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "domainCostYearly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accountingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "incomeTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "providerCountry" TEXT NOT NULL DEFAULT 'Bolivia',
    "mainCurrency" TEXT NOT NULL DEFAULT 'USD',
    "localCurrency" TEXT NOT NULL DEFAULT 'Bs',
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 6.96,
    "costOfLiving" "CostOfLiving" NOT NULL DEFAULT 'LOW',
    "marketScope" "MarketScope" NOT NULL DEFAULT 'LATAM',
    "aiTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiProductivityBoost" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "teamMembers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectContext" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientType" "ClientType" NOT NULL DEFAULT 'SME',
    "clientIndustry" TEXT NOT NULL DEFAULT 'Tech',
    "clientCountry" TEXT NOT NULL DEFAULT '',
    "clientLanguage" TEXT NOT NULL DEFAULT 'es',
    "clientTimezone" TEXT NOT NULL DEFAULT 'America/Guatemala',
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'NORMAL',
    "clientBudget" TEXT NOT NULL DEFAULT 'MEDIUM',
    "requirementsClarity" "ClarityLevel" NOT NULL DEFAULT 'PARTIAL',
    "clientAvailability" "AvailabilityLevel" NOT NULL DEFAULT 'RESPONSIVE',
    "changeProbability" "ChangeLevel" NOT NULL DEFAULT 'MEDIUM',
    "businessValue" "BusinessValue" NOT NULL DEFAULT 'MEDIUM',
    "estimatedMeetings" INTEGER NOT NULL DEFAULT 3,
    "estimatedRevisions" INTEGER NOT NULL DEFAULT 3,
    "profitMargin" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "negotiatedDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isRecurringClient" BOOLEAN NOT NULL DEFAULT false,
    "isStrategicProject" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'MILESTONES',
    "upfrontPercentage" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "includedRevisions" INTEGER NOT NULL DEFAULT 3,
    "supportMonths" INTEGER NOT NULL DEFAULT 1,
    "warrantyMonths" INTEGER NOT NULL DEFAULT 3,
    "trainingHours" INTEGER NOT NULL DEFAULT 4,
    "codeOwnership" BOOLEAN NOT NULL DEFAULT true,
    "ndaRequired" BOOLEAN NOT NULL DEFAULT false,
    "lateDeliveryPenalty" BOOLEAN NOT NULL DEFAULT false,
    "earlyDeliveryBonus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_userId_key" ON "ProviderProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectContext_projectId_key" ON "ProjectContext"("projectId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISuggestion" ADD CONSTRAINT "AISuggestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderProfile" ADD CONSTRAINT "ProviderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContext" ADD CONSTRAINT "ProjectContext_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
