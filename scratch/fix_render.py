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
        
        # In renderComponent, if we see ({ props, styles }), replace it with ({ node })
        # and prepend node. to props and styles where missing
        if re.search(r'renderComponent:\s*\(\{\s*props\s*,\s*styles\s*\}\)\s*=>', content):
            content = re.sub(
                r'renderComponent:\s*\(\{\s*props\s*,\s*styles\s*\}\)\s*=>',
                r'renderComponent: ({ node }) =>',
                content
            )
            # my previous script replaced `props.` with `node.props.` everywhere, so `node.props.` is actually what we want now inside renderComponent!
            # However, `styles` might not have been replaced. Let's replace `styles.` with `node.styles.`
            # Wait, `styles` is often destructured or passed directly like `style={{...styles}}`.
            # We can just change `...styles` to `...node.styles`.
            content = re.sub(r'(?<!node\.)styles', r'node.styles', content)
            
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed renderComponent in {filename}")

print("Done fixing renderComponent.")
