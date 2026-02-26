-- CreateTable
CREATE TABLE "HashCode" (
    "id" TEXT NOT NULL,
    "hashCode" TEXT NOT NULL,
    "hashCodeExpires" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "HashCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HashCode_userId_key" ON "HashCode"("userId");

-- AddForeignKey
ALTER TABLE "HashCode" ADD CONSTRAINT "HashCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
