import os
import re

pattern = re.compile(r'(?<![-a-zA-Z0-9])shadow(-sm|-md|-lg|-xl|-2xl|-inner|-none|-[a-z0-9\[\]/#-]+)?(?![a-zA-Z0-9-])')

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            new_content = pattern.sub('', content)
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print('Updated ' + path)
