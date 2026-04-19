@echo off
echo === [1/4] Adicionando todos os arquivos ===
git add -A

echo === [2/4] Commit ===
git commit -m "chore: commit all pending files and deploy scripts"

echo === [3/4] Push para origin/main ===
git push origin main

echo === [4/4] Build de producao ===
npm run build

echo === [5/5] Deploy no Cloudflare Pages ===
npx wrangler pages deploy dist --project-name turisagencias --branch main --commit-dirty=true

echo === DONE ===
