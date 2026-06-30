#!/usr/bin/env python3
"""
Fix dark-only Tailwind classes in dashboard pages.
Adds light-mode equivalents so bg-slate-900 → bg-white dark:bg-slate-900, etc.
"""
import re, sys, os

# Files to process
FILES = [
    'src/app/cameras/CamerasClient.tsx',
    'src/app/dashboard/DashboardClient.tsx',
    'src/app/containers/ContainersClient.tsx',
    'src/app/routes/RoutesClient.tsx',
    'src/app/map/MapClient.tsx',
    'src/app/feedback/FeedbackClient.tsx',
    'src/app/client/ClientDashboard.tsx',
    'src/components/DashboardLayout.tsx',
]

# Replacement rules: (pattern, replacement)
# Order matters — more specific first
RULES = [
    # Backgrounds — panels/cards
    (r'\bbg-slate-950/40\b',        'bg-white/80 dark:bg-slate-950/40'),
    (r'\bbg-slate-900/40\b',        'bg-white/80 dark:bg-slate-900/40'),
    (r'\bbg-slate-900/60\b',        'bg-white/80 dark:bg-slate-900/60'),
    (r'\bbg-slate-900/80\b',        'bg-white/90 dark:bg-slate-900/80'),
    (r'\bbg-slate-900/30\b',        'bg-slate-100/30 dark:bg-slate-900/30'),
    (r'\bbg-slate-950/30\b',        'bg-slate-100/30 dark:bg-slate-950/30'),
    (r'\bbg-slate-950/50\b',        'bg-white/50 dark:bg-slate-950/50'),
    (r'\bbg-slate-950/80\b',        'bg-white/90 dark:bg-slate-950/80'),
    (r'\bbg-slate-950/90\b',        'bg-white/95 dark:bg-slate-950/90'),
    # Solid backgrounds
    (r'\bbg-slate-950\b',           'bg-white dark:bg-slate-950'),
    (r'\bbg-slate-900\b',           'bg-slate-50 dark:bg-slate-900'),
    (r'\bbg-slate-800\b',           'bg-slate-100 dark:bg-slate-800'),
    # Borders
    (r'\bborder-slate-800/80\b',    'border-slate-200/80 dark:border-slate-800/80'),
    (r'\bborder-slate-800/60\b',    'border-slate-200/60 dark:border-slate-800/60'),
    (r'\bborder-slate-800\b',       'border-slate-200 dark:border-slate-800'),
    (r'\bborder-slate-700\b',       'border-slate-300 dark:border-slate-700'),
    # Text colors
    (r'\btext-white\b',             'text-slate-900 dark:text-white'),
    (r'\btext-slate-100\b',         'text-slate-800 dark:text-slate-100'),
    (r'\btext-slate-200\b',         'text-slate-700 dark:text-slate-200'),
    (r'\btext-slate-300\b',         'text-slate-600 dark:text-slate-300'),
    (r'\btext-slate-400\b',         'text-slate-500 dark:text-slate-400'),
    (r'\btext-slate-500\b',         'text-slate-500 dark:text-slate-500'),
    (r'\btext-slate-600\b',         'text-slate-500 dark:text-slate-600'),
    (r'\btext-slate-700\b',         'text-slate-600 dark:text-slate-700'),
    (r'\btext-slate-800\b',         'text-slate-700 dark:text-slate-800'),
    # Ring
    (r'\bring-slate-800\b',         'ring-slate-200 dark:ring-slate-800'),
    # Hover backgrounds
    (r'\bhover:bg-slate-800\b',     'hover:bg-slate-100 dark:hover:bg-slate-800'),
    (r'\bhover:bg-slate-800/50\b',  'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'),
    (r'\bhover:border-slate-700\b', 'hover:border-slate-300 dark:hover:border-slate-700'),
    # Divide
    (r'\bdivide-slate-800\b',       'divide-slate-200 dark:divide-slate-800'),
    (r'\bdivide-slate-800/50\b',    'divide-slate-200/50 dark:divide-slate-800/50'),
    # Placeholder
    (r'\bplaceholder-slate-600\b',  'placeholder-slate-400 dark:placeholder-slate-600'),
    # Scrollbar / misc
    (r'\bscrollbar-thumb-slate-800\b', 'scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800'),
]

# Patterns to SKIP (already have dark: or light variant or are in specific contexts)
SKIP_PATTERNS = [
    r'dark:',           # already has dark: variant
    r'^\s*//',          # comments
    r'^\s*\*',          # JSDoc
]

def should_skip_line(line):
    for pat in SKIP_PATTERNS:
        if re.search(pat, line):
            return True
    return False

def fix_file(filepath):
    if not os.path.exists(filepath):
        print(f'  SKIP (not found): {filepath}')
        return 0
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    changes = 0
    
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        if should_skip_line(line):
            new_lines.append(line)
            continue
        
        new_line = line
        for pattern, replacement in RULES:
            # Only replace if not already preceded by 'dark:'
            # Use a negative lookbehind for 'dark:'
            new_line_attempt = re.sub(
                r'(?<!dark:)' + pattern,
                replacement,
                new_line
            )
            if new_line_attempt != new_line:
                changes += 1
                new_line = new_line_attempt
        
        new_lines.append(new_line)
    
    new_content = '\n'.join(new_lines)
    
    if new_content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'  ✅ Fixed {changes} patterns in {filepath}')
    else:
        print(f'  ⬜ No changes needed: {filepath}')
    
    return changes

if __name__ == '__main__':
    base = os.path.dirname(os.path.abspath(__file__))
    project = os.path.join(base, '..')
    
    total = 0
    for rel_path in FILES:
        full_path = os.path.join(project, rel_path)
        total += fix_file(full_path)
    
    print(f'\nTotal replacements: {total}')
