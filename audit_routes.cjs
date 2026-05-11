const fs = require('fs');

const sidebar = fs.readFileSync('src/components/AppSidebar.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

const urlRegex = /url:\s*'([^']+)'/g;
let match;
const sidebarUrls = [];
while ((match = urlRegex.exec(sidebar)) !== null) {
  sidebarUrls.push(match[1]);
}

console.log("=== AUDIT SIDEBAR VS APP.TSX ===");
let hasErrors = false;
for (const url of sidebarUrls) {
  // Try to find <Route path="url"
  if (!app.includes(`path="${url}"`)) {
    console.log(`[ERROR] Rota presente na Sidebar mas AUSENTE em App.tsx: ${url}`);
    hasErrors = true;
  }
}
if (!hasErrors) console.log("[OK] Todas as rotas da Sidebar existem no App.tsx");

// Verificar se as páginas do App.tsx existem fisicamente
const routeRegex = /<Route[^>]+path="([^"]+)"[^>]+element={<(?:ProtectedWithOrg><(?:TripsRole|AdminRole)>)?([^/> ]+)/g;
const routes = [];
while ((match = routeRegex.exec(app)) !== null) {
    if (match[1] === '*' || match[1].includes(':')) continue; // skip dynamic or wildcard
    routes.push({ path: match[1], component: match[2] });
}

console.log("\n=== AUDIT APP.TSX VS FILES ===");
// App.tsx tem imports lazy, vamos pegar os imports do App.tsx
const importRegex = /const (\w+)\s*=\s*lazy\(\(\) => import\('\.\/pages\/([^']+)'\)\);|import (\w+) from '\.\/pages\/([^']+)';/g;
const componentsToPath = {};
while ((match = importRegex.exec(app)) !== null) {
    const compName = match[1] || match[3];
    const compPath = match[2] || match[4];
    componentsToPath[compName] = compPath;
}

let fileErrors = false;
for (const route of routes) {
    const compName = route.component;
    const relPath = componentsToPath[compName];
    if (relPath) {
        const fullPathTsx = `src/pages/${relPath}.tsx`;
        const fullPathIndex = `src/pages/${relPath}/index.tsx`;
        if (!fs.existsSync(fullPathTsx) && !fs.existsSync(fullPathIndex)) {
            console.log(`[ERROR] Rota ${route.path} aponta para ${compName}, mas o arquivo ${fullPathTsx} NÃO EXISTE!`);
            fileErrors = true;
        }
    } else {
        // Ignorar coisas como ProtectedRoute, AdminRole, que não são páginas
    }
}
if (!fileErrors) console.log("[OK] Todas as páginas declaradas no App.tsx existem fisicamente");
