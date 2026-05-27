import os
import re

pattern = re.compile(r'(?<![-a-zA-Z0-9])shadow(-sm|-md|-lg|-xl|-2xl|-inner|-[a-z0-9\[\]/#-]+)?(?![a-zA-Z0-9-])')

count = 0
for root, dirs, files in os.walk(r'c:\Users\aline\Music\turisagencias\src'):
    if 'components\\ui' in root or 'components/ui' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Substitui os matches por nada, mas preserva os espaços ao redor (ou melhor, evita double spaces)
            new_content = pattern.sub('', content)
            
            # Cleanup double spaces left behind
            new_content = re.sub(r' +', ' ', new_content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
                print('Updated ' + path)

print(f"Finished updating {count} files.")
