FROM node:16-alpine
# docker-compose側から、コンテナ起動時のディレクトリ位置を引数として受け取り、そこで起動するよう設定
ARG FRONT_WORKDIR
WORKDIR ${FRONT_WORKDIR}
# 時刻は、日本時間のものに設定しておく
ENV TZ Asia/Tokyo
# dockerイメージのビルド時に実行されるコマンド
# パッケージマネージャapkのアップデート
RUN apk update
RUN apk upgrade
# gitはインストールしておきたい。また、git rebase等でvimも必要になるのでインストール
RUN apk add git vim
