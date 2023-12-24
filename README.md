# ft_transcendence
## How to start project
```
# react
$ docker-compose exec front sh -c "yarn create vite <環境変数FRONT_PROJ_NAMEの値> --template react-ts"

# nest.js
$ docker-compose exec api sh -c "nest new <環境変数API_PROJ_NAMEの値> --package-manager yarn --skip-install --skip-git"
```
- [How to create project](https://qiita.com/katkatprog/items/a53fa97ba60fa361983a)

# front
## How to install MUI
```
frontのコンテナに入った上で行うこと
$ cd /workspace/front/react_app
$ npm install @mui/material @emotion/react @emotion/styled
$ npm install @mui/icons-material @mui/material @emotion/styled @emotion/react
$ npm install @mui/x-data-grid
```

## How to install Babel
```
frontのコンテナに入った上で行うこと
$ cd /workspace/front/react_app
$ npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/preset-react @babel/register
```

## version up npm
```
/workspace/front/react_app # npm update -g npm

removed 17 packages, changed 101 packages, and audited 251 packages in 10s

28 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
/workspace/front/react_app # npm -v
9.7.2
```

## react-router-dom
```
cd /workspace/front/react_app
npm install react-router-dom
```

## install socket
```
cd /workspace/front/react_app
npm install @types/socket.io-client
```

## install jwt handler
```
cd /workspace/front/react_app
npm install react-jwt
```

# back
## prisma
```
cd /nest_app/prisma
npx prisma studio
```
- after changing db table, pls drop table and migrate again
```
psql -h localhost -U postgres
password: yuhmatsu
DROP TABLE public."User" CASCADE;
exit
yarn prisma migrate dev
```

## install swagger
```
cd /workspace/api/nest_app
yarn add @nestjs/swagger swagger-ui-express
```

## install socket
```
cd /workspace/api/nest_app
yarn add @nestjs/websockets @nestjs/platform-socket.io
yarn add @types/socket.io
```

## install passport
```
cd /workspace/api/nest_app
yarn add @nestjs/passport passport passport-42 express-session
cd src
nest g module auth
nest g service auth
nest g controller auth
yarn add -D @types/express-session
```

## How to set up app in 42
- [create new app](https://profile.intra.42.fr/oauth/applications/new)
- [view created app](https://profile.intra.42.fr/oauth/applications/14601)

![app](./readme_img/app.png)

- set the below information in .env
```
ex.)
FORTY_TWO_ClIENT_ID=
FORTY_TWO_CLIENT_SECRET=
FORTY_TWO_CALL_BACK_URL=/auth/redirect
```

- login url
  - http://localhost:3000/auth/login

## How ot set up app in Google Auth TFA
```
cd /workspace/api/nest_app
yarn add @nestjs/jwt
yarn add passport-jwt
yarn add otplib
yarn add qrcode
```
```
curl http://localhost:3000/auth/profile -H "Authorization: Bearer <token>"
{"id":"f434212f-4dc2-4d8f-a884-775200ed3893","fortyTwoId":"<42id>","username":"<username>","avatar":"default.jpg","wins":0,"losses":0,"ladderLevel":0,"achievements":[]}

curl -X POST http://localhost:3000/auth/2fa/generate -H "Authorization: Bearer <token>"

curl -X POST http://localhost:3000/auth/2fa/authenticate -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"twoFactorAuthenticationCode": "031590"}'

```
