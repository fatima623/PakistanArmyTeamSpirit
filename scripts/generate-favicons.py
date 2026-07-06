"""Generate favicon assets from public/images/logo.webp. Requires: pip install pillow"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "images" / "logo.webp"
PUBLIC = ROOT / "public"
APP = ROOT / "src" / "app"
BG = (30, 38, 33, 255)


def render(size: int, padding: float = 0.14) -> Image.Image:
    logo = Image.open(SRC).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), BG)
    inner = int(size * (1 - 2 * padding))
    copy = logo.copy()
    copy.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    x = (size - copy.width) // 2
    y = (size - copy.height) // 2
    canvas.paste(copy, (x, y), copy)
    return canvas.convert("RGB")


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    APP.mkdir(parents=True, exist_ok=True)

    for size, name in [
        (16, "favicon-16x16.png"),
        (32, "favicon-32x32.png"),
        (48, "favicon-48x48.png"),
        (180, "apple-touch-icon.png"),
    ]:
        render(size).save(PUBLIC / name)

    render(32).save(APP / "icon.png")
    render(180).save(APP / "apple-icon.png")

    imgs = [render(s) for s in (16, 32, 48)]
    imgs[0].save(
        APP / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=imgs[1:],
    )
    print("Favicon assets written.")


if __name__ == "__main__":
    main()
