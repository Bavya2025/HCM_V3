import os
import subprocess

backend_dir = r"c:\Users\user\Desktop\HCM_V3\HCM_V3\backend"
frontend_src_dir = r"c:\Users\user\Desktop\HCM_V3\HCM_V3\frontend\src"

scm_modules = [
    "masters", "procurement", "warehouse", "inventory", 
    "logistics", "indent", "consumption", "approvals", 
    "accounts", "assets", "healthcare", "reports"
]

def scaffold_backend():
    os.chdir(backend_dir)
    for mod in scm_modules:
        if not os.path.exists(mod):
            subprocess.run(["python", "manage.py", "startapp", mod])
            print(f"Created Django app: {mod}")

def scaffold_frontend():
    pages_dir = os.path.join(frontend_src_dir, "pages", "scm")
    os.makedirs(pages_dir, exist_ok=True)
    for mod in scm_modules:
        file_path = os.path.join(pages_dir, f"{mod.capitalize()}.jsx")
        if not os.path.exists(file_path):
            with open(file_path, "w") as f:
                f.write(f"""import React from 'react';

const {mod.capitalize()} = () => {{
    return (
        <div style={{{{ padding: '2rem' }}}}>
            <h1>{mod.capitalize()} Module</h1>
            <p>Under construction...</p>
        </div>
    );
}};

export default {mod.capitalize()};
""")
            print(f"Created React page: {mod.capitalize()}.jsx")

if __name__ == "__main__":
    scaffold_backend()
    scaffold_frontend()
    print("Scaffolding completed.")
