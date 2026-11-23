#!/bin/sh
# Aplica as migracoes e, so quando o banco esta vazio, roda o seed de exemplo
# (o seed apaga tudo antes de criar; por isso nunca roda num banco com dados).
set -e
npx prisma migrate deploy
if [ "${SEED_SE_VAZIO:-1}" = "1" ]; then
  if node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.usuario.count().then(n=>p.\$disconnect().then(()=>process.exit(n===0?0:1))).catch(()=>process.exit(1))"; then
    echo "Banco vazio: rodando o seed de exemplo"
    npx prisma db seed
  fi
fi
exec node dist/src/server.js
