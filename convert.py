import sys, pathlib, re, os

root = pathlib.Path('.').resolve()
exclude = {'node_modules', '.next', '.git', 'dist', 'out'}

# Find all .js files
files = []
for p in root.rglob('*.js'):
    if any(part in exclude for part in p.parts):
        continue
    files.append(p)

# Determine if JSX and rename
tsx_files = []
ts_files = []

for f in files:
    content = f.read_text(errors='ignore')
    has_jsx = bool(re.search(r'<[A-Za-z]', content))
    new_ext = '.tsx' if has_jsx else '.ts'
    new_path = f.with_suffix(new_ext)
    
    if f.name != new_path.name:  # Only if renaming
        f.rename(new_path)
        if has_jsx:
            tsx_files.append((f.name, new_path.name))
        else:
            ts_files.append((f.name, new_path.name))

print(f"Converted {len(tsx_files)} to .tsx")
print(f"Converted {len(ts_files)} to .ts")
for old, new in (tsx_files + ts_files)[:50]:
    print(f"{old} -> {new}")
