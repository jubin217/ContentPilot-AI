import os
import zipfile

def zip_dir(dir_path, zip_path):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dir_path):
            for file in files:
                file_path = os.path.join(root, file)
                # Calculate relative path to maintain directory structure inside the zip
                arcname = os.path.relpath(file_path, dir_path)
                zipf.write(file_path, arcname)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    src_dir = os.path.join(current_dir, 'dist')
    dest_zip = os.path.join(current_dir, 'contentpilot.zip')
    
    if not os.path.exists(src_dir):
        print(f"Error: {src_dir} does not exist. Please run 'npm run build' first.")
    else:
        print(f"Zipping contents of {src_dir} to {dest_zip}...")
        zip_dir(src_dir, dest_zip)
        print("Successfully zipped extension! You can now upload contentpilot.zip to Firefox Add-ons.")
