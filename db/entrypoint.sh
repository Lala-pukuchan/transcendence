#!/bin/sh
set -e

# PostgreSQLサービスが開始されるのを待つ
until psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c '\l'; do
  echo "Postgres is unavailable - sleeping"
  sleep 5
done

echo "Postgres is up - executing command"

# テーブルを作成
psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" <<EOSQL
    CREATE TABLE IF NOT EXISTS public.room_info (
        room_id char NOT NULL,
        room_name character varying(16) COLLATE pg_catalog."default",
        room_type_1 char NOT NULL,
        room_type_2 char NOT NULL,
        room_password char
    ) TABLESPACE pg_default;
    ALTER TABLE public.room_info OWNER TO ${POSTGRES_USER};
EOSQL