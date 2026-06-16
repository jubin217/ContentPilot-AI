import os
import zipfile

def zip_source(base_dir, zip_path):
    # Files and folders to include in the source code package
    include_paths = [
        'src',
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.js',
        'postcss.config.js',
        'build.js',
        'index.html',
        'README.md',
        'zip_extension.py'
    ]
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for item in include_paths:
            full_item_path = os.path.join(base_dir, item)
            if not os.path.exists(full_item_path):
                continue
                
            if os.path.isdir(full_item_path):
                # Add folder and all its contents
                for root, dirs, files in os.walk(full_item_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, base_dir)
                        zipf.write(file_path, arcname)
            else:
                # Add single file
                arcname = os.path.basename(full_item_path)
                zipf.write(full_item_path, arcname)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dest_zip = os.path.join(current_dir, 'source_code.zip')
    
    print(f"Zipping raw source files in {current_dir} to {dest_zip}...")
    zip_source(current_dir, dest_zip)
    print("Successfully packaged source code! You can now upload source_code.zip to Firefox reviewer section.")
