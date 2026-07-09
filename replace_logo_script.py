import os
from PIL import Image, ImageDraw

src_28 = "MEDIA PATS/28.png"
logo = "public/media/pats/pats-logo-nav.webp"

# Load images
img_28 = Image.open(src_28).convert("RGBA")
img_logo = Image.open(logo).convert("RGBA")

# (767, 508, 263) are the coordinates for the center PATS logo.
cx, cy, r = (767, 508, 263)

# Target diameter
new_size = int(r * 2)

# Resize new logo
img_logo = img_logo.resize((new_size, new_size), Image.Resampling.LANCZOS)

# Create a draw object to erase the old logo
draw = ImageDraw.Draw(img_28)
left = cx - r
top = cy - r
right = cx + r
bottom = cy + r

# Fill the old logo area with white (same as paper background)
draw.ellipse((left-5, top-5, right+5, bottom+5), fill=(255, 255, 255, 255))

# Paste the new logo using its alpha channel as the mask
img_28.paste(img_logo, (left, top), img_logo)

# Save back to MEDIA PATS/28.png
# We will save it as a PNG without transparency if it's supposed to be a scan, but RGBA is fine,
# since process-pats-media.py converts to BGR via cv2.imread anyway, dropping the alpha channel to white or black.
# Wait, cv2.imread without IMREAD_UNCHANGED drops alpha and assumes a dark background if we aren't careful?
# Actually, if we save as RGB it will be safer.
img_28 = img_28.convert("RGB")
img_28.save("MEDIA PATS/28.png")

print("Successfully replaced center logo in MEDIA PATS/28.png")
