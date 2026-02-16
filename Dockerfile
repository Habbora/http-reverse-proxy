FROM oven/bun

WORKDIR /app

COPY . .

RUN mkdir -p /data
ENV DB_FILE_NAME=/data/db.sqlite
VOLUME ["/data"]

RUN bun install

CMD ["bun", "run", "src/index.ts"]
