import os

path = r'c:\Users\aline\Music\turisagencias\python_engine\agents'
OLD = 'from langchain.prompts import PromptTemplate'
NEW = 'from langchain_core.prompts import PromptTemplate'

for fname in os.listdir(path):
    if not fname.endswith('.py'):
        continue
    fpath = os.path.join(path, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    if OLD in content:
        content = content.replace(OLD, NEW)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed: {fname}')

print('Done.')
