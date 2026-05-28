import os
import re

blocks_dir = r"c:\Users\aline\Music\turisagencias\src\components\builder\blocks"

for root, _, files in os.walk(blocks_dir):
    for filename in files:
        if not filename.endswith('.tsx'):
            continue
            
        filepath = os.path.join(root, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # Replace data?. with node.props.
        content = re.sub(r'(?<!\w)data\?\.', 'node.props.', content)
        
        # Replace data || {} with node.props || {}
        content = content.replace('data || {}', 'node.props || {}')
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed data references in {filename}")

print("Done fixing data references.")
