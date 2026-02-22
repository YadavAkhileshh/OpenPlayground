import os
import re

js_dir = 'js'

# Regex to match basic function declarations:
# function funcName(args) {
func_pattern = re.compile(r'^(\s*)function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*\{', re.MULTILINE)
# async function funcName(args) {
async_func_pattern = re.compile(r'^(\s*)async\s+function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*\{', re.MULTILINE)

# Also anonymous functions in event listeners:
# function (e) {  -->  (e) => {
anon_func_pattern = re.compile(r'function\s*\((.*?)\)\s*\{')

for filename in os.listdir(js_dir):
    if filename.endswith('.js'):
        filepath = os.path.join(js_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # We'll skip minified or huge libraries if they existed, but these are all custom
        
        # Replace async functions
        new_content = async_func_pattern.sub(r'\1const \2 = async (\3) => {', content)
        
        # Replace normal functions
        new_content = func_pattern.sub(r'\1const \2 = (\3) => {', new_content)
        
        # Replace anonymous functions (excluding if they are already replaced somehow, but the above patterns match ^\s*)
        new_content = anon_func_pattern.sub(r'(\1) => {', new_content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Refactored {filename} to ES6 syntax')
