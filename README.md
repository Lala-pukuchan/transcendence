# ft_transcendence
## How to start project
```
# react
$ docker-compose exec front sh -c "yarn create vite <環境変数FRONT_PROJ_NAMEの値> --template react-ts"

# nest.js
$ docker-compose exec api sh -c "nest new <環境変数API_PROJ_NAMEの値> --package-manager yarn --skip-install --skip-git"
```
- [How to create project](https://qiita.com/katkatprog/items/a53fa97ba60fa361983a)

## How to install MUI
```
$ cd /workspace/front/react_app
$ npm install @mui/material @emotion/react @emotion/styled
```

## How to install Babel
```
npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/preset-react @babel/register
```