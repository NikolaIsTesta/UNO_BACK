-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    "deck" JSONB NOT NULL,
    "spentCards" JSONB,
    "currentCards" JSONB,
    "currentPlayer" INTEGER DEFAULT 0,
    "direction" BOOLEAN DEFAULT false,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lobby" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "numPlayers" INTEGER NOT NULL,
    "hostId" INTEGER NOT NULL,

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT,
    "lobbyId" INTEGER,
    "numberInTurn" INTEGER,
    "ready" BOOLEAN DEFAULT false,
    "cards" JSONB[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_lobbyId_key" ON "Game"("lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_code_key" ON "Lobby"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_hostId_key" ON "Lobby"("hostId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE SET NULL ON UPDATE CASCADE;
