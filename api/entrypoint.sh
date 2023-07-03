#!/bin/sh
set -x

cd ./${API_PROJ_NAME}
yarn add prisma --dev
yarn prisma migrate dev --name init

yarn start:dev