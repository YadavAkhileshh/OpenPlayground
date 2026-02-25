from PIL import Image
import os

filename = "logo.jpg"
if os.path.exists(filename):
    img = Image.open(filename)
    # Convert to RGB in case it's RGBA
    img = img.convert('RGB')
    
    # Save with optimize and lower quality
    img.save(filename, "JPEG", optimize=True, quality=60)
    print(f"Compressed {filename}. New size: {os.path.getsize(filename)/1024:.2f} KB")
else:
    print(f"{filename} not found.")
