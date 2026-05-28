git ls-files src > docs\audit\src-files.txt
git ls-files supabase > docs\audit\supabase-files.txt
git ls-files docs > docs\audit\docs-files.txt
copy package.json docs\audit\package-json.snapshot.json
git grep -n "\.from" src supabase > docs\audit\supabase-from-usages.txt
git grep -E -n "functions\.invoke|supabase\.functions|fetch\(" src supabase > docs\audit\api-edge-usages.txt
git grep -E -n "as any|: any|@ts-ignore|@ts-expect-error" src supabase > docs\audit\any-and-ignore-usages.txt
git grep -E -n -i "mock|fake|demo|sample|placeholder|dummy|setTimeout|localStorage|sessionStorage|Math\.random|coming soon|em breve|TODO|FIXME" src supabase > docs\audit\mock-fake-scan.txt
git grep -E -n "shadow-|box-shadow|drop-shadow|glass|backdrop|z-\[|overflow-x|fixed|absolute|Sidebar|sidebar" src > docs\audit\design-scan.txt
