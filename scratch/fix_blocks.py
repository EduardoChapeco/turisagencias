import os
import re

blocks_dir = r"c:\Users\aline\Music\turisagencias\src\components\builder\blocks"

for root, _, files in os.walk(blocks_dir):
    for filename in files:
        if not filename.endswith('.tsx') and not filename.endswith('.ts'):
            continue
            
        filepath = os.path.join(root, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # 1. Fix ({ data, onChange }: any) -> ({ node, onChange })
        if re.search(r'settingsComponent:\s*\(\{\s*data\s*,\s*onChange\s*\}\s*:\s*any\)\s*=>', content):
            content = re.sub(
                r'settingsComponent:\s*\(\{\s*data\s*,\s*onChange\s*\}\s*:\s*any\)\s*=>',
                r'settingsComponent: ({ node, onChange }) =>',
                content
            )
            content = content.replace('data.', 'node.props.')
            content = content.replace('data || {}', 'node.props || {}')
            content = content.replace('...data', '...node.props')
            # Fixing onChange calls like onChange({ ...data, url: e.target.value })
            # to onChange({ props: { ...node.props, url: e.target.value } })
            content = re.sub(
                r'onChange\(\s*\{\s*\.\.\.node\.props\s*,([^}]*)\}\s*\)',
                r'onChange({ props: { ...node.props, \1} })',
                content
            )
            
        # 2. Fix ({ props, updateProps }) -> ({ node, onChange })
        if re.search(r'settingsComponent:\s*\(\{\s*props\s*,\s*updateProps\s*\}\)\s*=>', content):
            content = re.sub(
                r'settingsComponent:\s*\(\{\s*props\s*,\s*updateProps\s*\}\)\s*=>',
                r'settingsComponent: ({ node, onChange }) =>',
                content
            )
            content = content.replace('props.', 'node.props.')
            # Fixing updateProps({ url: ... }) to onChange({ props: { ...node.props, url: ... } })
            content = re.sub(
                r'updateProps\(\s*\{([^}]*)\}\s*\)',
                r'onChange({ props: { ...node.props, \1} })',
                content
            )
            
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed props/data arguments in {filename}")

print("Done fixing block arguments.")
