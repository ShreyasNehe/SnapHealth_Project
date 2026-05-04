import os, glob

for filepath in glob.glob('src/**/*.tsx', recursive=True):
    with open(filepath, 'r') as f:
        content = f.read()
    if 'gemini-3-flash-preview' in content:
        content = content.replace('gemini-3-flash-preview', 'gemini-2.5-flash')
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")
