FROM node:16-alpine
# docker-compose側から、コンテナ起動時のディレクトリ位置を引数として受け取り、そこで起動するよう設定
ARG FRONT_WORKDIR
WORKDIR ${FRONT_WORKDIR}
# 時刻は、日本時間のものに設定しておく
ENV TZ Asia/Tokyo
# dockerイメージのビルド時に実行されるコマンド
# パッケージマネージャapkのアップデート
RUN apk update && apk upgrade && apk add --no-cache git vim bash
# gitはインストールしておきたい。また、git rebase等でvimも必要になるのでインストール

RUN echo -e '#!/bin/bash\ngit add' > /usr/bin/ga && \
	chmod +x /usr/bin/ga
RUN echo -e '#!/bin/bash\ngit add -A && git commit' > /usr/bin/gac && \
	chmod +x /usr/bin/gac
RUN echo -e '#!/bin/bash\ngit branch' > /usr/bin/gb && \
	chmod +x /usr/bin/gb
RUN echo -e '#!/bin/bash\ngit commit' > /usr/bin/gc && \
	chmod +x /usr/bin/gc
RUN echo -e '#!/bin/bash\ngit checkout' > /usr/bin/gco && \
	chmod +x /usr/bin/gco
RUN echo -e '#!/bin/bash\ngit remote set-url origin' > /usr/bin/grnew && \
	chmod +x /usr/bin/grnew
RUN echo -e '#!/bin/bash\ngit status' > /usr/bin/gs && \
	chmod +x /usr/bin/gs
RUN echo -e '#!/bin/bash\nls -A' > /usr/bin/la && \
	chmod +x /usr/bin/la
RUN echo -e '#!/bin/bash\nls -alF' > /usr/bin/ll && \
	chmod +x /usr/bin/ll
RUN echo -e '#!/bin/bash\nrm -i' > /usr/bin/rm && \
	chmod +x /usr/bin/rm
