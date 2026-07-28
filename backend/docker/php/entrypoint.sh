#!/bin/sh
set -e

cd /var/www/html

# Queue / scheduler: wait for vendor from app, skip migrate/seed
if [ "${SKIP_SETUP:-0}" = "1" ]; then
  i=0
  while [ ! -f vendor/autoload.php ] && [ "$i" -lt 180 ]; do
    sleep 1
    i=$((i + 1))
  done
  exec "$@"
fi

echo "Waiting for Postgres..."
until php -r "try { new PDO('pgsql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: '5432') . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Exception \$e) { exit(1); }" 2>/dev/null; do
  sleep 1
done
echo "Postgres is ready."

if [ ! -f vendor/autoload.php ]; then
  echo "Installing Composer dependencies into volume..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force || true
fi

if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  php artisan migrate --force --no-interaction || true
fi

if [ "${RUN_SEEDERS:-1}" = "1" ]; then
  php artisan db:seed --force --no-interaction || true
fi

# Speed up request boot (config left uncached so .env edits still apply)
php artisan route:cache || true
php artisan event:cache || true

chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || true

exec "$@"
