#!/usr/bin/env bash
# BEAUTY SPHERE — скрипт инициализации Git и подготовки к пушу на GitHub.
# Запускать из папки сайта:  bash setup-github.sh

set -e
cd "$(dirname "$0")"

echo "→ Текущая папка: $(pwd)"
echo

# 1. Чистим возможный stale-lock от предыдущих попыток
if [ -f .git/index.lock ]; then
  rm -f .git/index.lock && echo "✓ Удалён остаток .git/index.lock"
fi

# 2. Если git не инициализирован — инициализируем
if [ ! -d .git ]; then
  git init -b main
  echo "✓ Git инициализирован (ветка main)"
else
  echo "→ Git уже есть"
  # Делаем main-ветку, если по умолчанию была master
  current=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
  if [ "$current" != "main" ] && [ -z "$(git rev-parse --verify main 2>/dev/null)" ]; then
    git symbolic-ref HEAD refs/heads/main
    echo "✓ Ветка установлена main"
  fi
fi

# 3. Конфигурируем имя/email только для этого репо (если ещё не установлено)
if [ -z "$(git config user.email)" ]; then
  git config user.email "beauty.sphere.dag@gmail.com"
fi
if [ -z "$(git config user.name)" ]; then
  git config user.name "BEAUTY SPHERE"
fi

# 4. Добавляем все файлы и делаем первый коммит (если ещё не сделан)
git add .
if git diff --cached --quiet; then
  echo "→ Нет изменений для коммита — пропускаю"
else
  git commit -m "BEAUTY SPHERE: каталог, корзина, коды доступа SHA-256, WhatsApp-чекаут"
  echo "✓ Коммит сделан"
fi

# 5. Подсказки следующих шагов
cat <<'EOF'

────────────────────────────────────────────────────────────
  Локальный репозиторий готов. Дальше — создать репо на GitHub.
────────────────────────────────────────────────────────────

1. Откройте https://github.com/new
2. Repository name:  beauty-sphere     (или любое другое имя)
3. Public  (если хотите бесплатные GitHub Pages — нужен public)
   ИЛИ Private (если у вас платный GitHub — можно private)
4. НЕ ставьте галочку "Add a README" (у нас уже есть)
5. Нажмите Create repository
6. На следующей странице GitHub покажет команды.
   Скопируйте свой URL вида:  https://github.com/ВАШ_ЛОГИН/beauty-sphere.git
   и запустите:

     git remote add origin https://github.com/ВАШ_ЛОГИН/beauty-sphere.git
     git push -u origin main

   GitHub попросит логин (через браузер откроется окно авторизации).

7. После пуша — включить GitHub Pages:
   Settings → Pages → Source: GitHub Actions → Save
   (или: Branch: main, /(root))
   Через 1–2 минуты сайт будет доступен по адресу
   https://ВАШ_ЛОГИН.github.io/beauty-sphere/

EOF
