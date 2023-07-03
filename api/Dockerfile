# 基本的にはfrontのものと同じ
FROM node:16-alpine
ARG API_WORKDIR
WORKDIR ${API_WORKDIR}
ENV TZ Asia/Tokyo
RUN apk update && apk upgrade && apk add --no-cache git vim bash
# NestJSをグローバルインストールしておく
RUN yarn global add @nestjs/cli


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

COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]