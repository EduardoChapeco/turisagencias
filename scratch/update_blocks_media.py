import os
import re

blocks_dir = r"c:\Users\aline\Music\turisagencias\src\components\builder\blocks"

# We want to replace standard <input> fields for image URLs with <MediaPicker>
# A typical pattern is:
# <Label...>URL da Imagem...</Label>\s*<input[^>]+value=\{node\.props\.([a-zA-Z0-9_]+Image|image[a-zA-Z0-9_]*|url|bgImage)\s*\|\|\s*['"]([^'"]*)['"]\}[^>]+onChange=\{\(e\) => onChange\(\{ props: \{ \.\.\.node\.props, \1: e\.target\.value \} \}\)\}[^>]*>

# Since regex on JSX is hard, we can look for specific files containing 'imageUrl' or 'image' and replace them.
# Let's just do a simpler search and replace for the most common ones:
files_to_check = os.listdir(blocks_dir)
count = 0

for file in files_to_check:
    if not file.endswith('.tsx'): continue
    filepath = os.path.join(blocks_dir, file)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # Needs to add import { MediaPicker } from '../MediaPicker'; if we use it.
    if '<MediaPicker' not in content and 'MediaPicker' not in content:
        import_stmt = "import { MediaPicker } from '../MediaPicker';\n"
        # Find where imports end
        # Let's just put it after the first import
        content = re.sub(r'^(import.*?;\n)', r'\1' + import_stmt, content, count=1)
        
    # Replace <Label...>...Imagem...</Label> \n <input ... />
    # This regex looks for an input that updates a prop containing "image" or "url" (case insensitive)
    # We'll do it manually for a few if regex is too risky, but let's try a safe regex:
    
    pattern = re.compile(
        r'<Label[^>]*>([^<]*Imagem[^<]*)</Label>\s*<input[^>]*value=\{([^\}]+)\}[^>]*onChange=\{[\(]?e[\)]?\s*=>\s*onChange\(\{\s*props:\s*\{\s*\.\.\.node\.props,\s*([a-zA-Z0-9_]+)\s*:\s*e\.target\.value\s*\}\s*\}\)\}[^>]*>',
        re.IGNORECASE | re.DOTALL
    )
    
    def repl(m):
        label_text = m.group(1).strip()
        val_expr = m.group(2).strip()
        prop_name = m.group(3).strip()
        return f'<MediaPicker label="{label_text}" value={{{val_expr}}} onChange={{url => onChange({{ props: {{ ...node.props, {prop_name}: url }} }})}} />'

    content, num_subs = pattern.subn(repl, content)
    
    # Check for another common pattern without explicit Label, or just Label in a div
    pattern2 = re.compile(
        r'<input[^>]*value=\{([^\}]+)\}[^>]*onChange=\{[\(]?e[\)]?\s*=>\s*onChange\(\{\s*props:\s*\{\s*\.\.\.node\.props,\s*([a-zA-Z0-9_]*[iI]mage[a-zA-Z0-9_]*)\s*:\s*e\.target\.value\s*\}\s*\}\)\}[^>]*>',
        re.DOTALL
    )
    def repl2(m):
        val_expr = m.group(1).strip()
        prop_name = m.group(2).strip()
        return f'<MediaPicker label="Imagem" value={{{val_expr}}} onChange={{url => onChange({{ props: {{ ...node.props, {prop_name}: url }} }})}} />'
        
    content, num_subs2 = pattern2.subn(repl2, content)
    
    if num_subs > 0 or num_subs2 > 0:
        # Check if we really added MediaPicker
        if '<MediaPicker' in content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file} ({num_subs + num_subs2} replacements)")
            count += 1

print(f"Total files updated: {count}")
