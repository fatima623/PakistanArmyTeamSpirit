"""
Process raw MEDIA PATS photographs into deskewed, cropped website assets.
Outputs to public/media/pats/ — never use raw JPEGs on the site.
"""
from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "MEDIA PATS"
OUT = ROOT / "public" / "media" / "pats"

BOOKLET_PAGES = list(range(1, 23))
BRANDING = [25, 26, 27]
GALLERY = [21, 22, 23, 24]
OVERVIEW_PANELS = [29, 30, 31, 32]
DARK_THEME = [28]

SOURCE_EXTENSIONS = (".jpeg", ".jpg", ".png", ".webp")


def source_path(index: int) -> Path | None:
    for ext in SOURCE_EXTENSIONS:
        candidate = SRC / f"{index}{ext}"
        if candidate.exists():
            return candidate
    return None


# (output_name, source_index, use_perspective_warp, crop_box LTRB as fractions)
WEBSITE_CROPS: list[tuple[str, int, bool, tuple[float, float, float, float]]] = [
    ("card-register", 26, False, (0.1, 0.14, 0.9, 0.82)),
    ("card-operations", 7, True, (0.06, 0.1, 0.94, 0.9)),
    ("card-international", 24, True, (0.08, 0.12, 0.92, 0.88)),
    ("about-feature", 23, True, (0.1, 0.14, 0.9, 0.86)),
    ("nav-emblem", 25, False, (0.18, 0.18, 0.82, 0.82)),
    ("video-concept", 6, True, (0.08, 0.12, 0.92, 0.85)),
    ("video-gallery", 24, True, (0.1, 0.15, 0.9, 0.88)),
    ("video-operations", 7, True, (0.12, 0.18, 0.88, 0.82)),
    ("awards-feature", 18, True, (0.08, 0.1, 0.92, 0.9)),
    ("footer-texture", 22, True, (0.05, 0.18, 0.95, 0.92)),
    ("gallery-hero", 24, True, (0.06, 0.1, 0.94, 0.9)),
    ("gallery-alt", 21, True, (0.08, 0.12, 0.92, 0.88)),
    ("documents-thumb", 3, True, (0.1, 0.12, 0.9, 0.85)),
]


def order_points(pts: np.ndarray) -> np.ndarray:
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect


def find_document_quad(gray: np.ndarray) -> np.ndarray | None:
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 50, 150)
    edged = cv2.dilate(edged, None, iterations=1)
    contours, _ = cv2.findContours(edged, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:16]
    h, w = gray.shape[:2]
    min_area = h * w * 0.22
    for cnt in contours:
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
        if len(approx) == 4 and cv2.contourArea(cnt) > min_area:
            return approx.reshape(4, 2).astype("float32")
    return None


def perspective_warp(bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    quad = find_document_quad(gray)
    h, w = gray.shape[:2]
    if quad is None:
        margin_x = int(w * 0.1)
        margin_y = int(h * 0.1)
        return bgr[margin_y : h - margin_y, margin_x : w - margin_x]
    rect = order_points(quad)
    (tl, tr, br, bl) = rect
    width_a = np.linalg.norm(br - bl)
    width_b = np.linalg.norm(tr - tl)
    max_w = int(max(width_a, width_b))
    height_a = np.linalg.norm(tr - br)
    height_b = np.linalg.norm(tl - bl)
    max_h = int(max(height_a, height_b))
    max_w = max(max_w, 800)
    max_h = max(max_h, 1000)
    dst = np.array(
        [[0, 0], [max_w - 1, 0], [max_w - 1, max_h - 1], [0, max_h - 1]],
        dtype="float32",
    )
    m = cv2.getPerspectiveTransform(rect, dst)
    return cv2.warpPerspective(bgr, m, (max_w, max_h))


def bgr_to_pil(bgr: np.ndarray, *, booklet: bool) -> Image.Image:
    if booklet:
        bgr = perspective_warp(bgr)
    else:
        h, w = bgr.shape[:2]
        mx, my = int(w * 0.1), int(h * 0.1)
        bgr = bgr[my : h - my, mx : w - mx]
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    pil = ImageOps.exif_transpose(pil)
    pil = ImageOps.autocontrast(pil, cutoff=1)
    pil = ImageEnhance.Contrast(pil).enhance(1.1)
    pil = ImageEnhance.Sharpness(pil).enhance(1.4)
    pil = pil.filter(ImageFilter.UnsharpMask(radius=1.2, percent=130, threshold=3))
    return pil


def fractional_crop(img: Image.Image, box: tuple[float, float, float, float]) -> Image.Image:
    l, t, r, b = box
    w, h = img.size
    return img.crop((int(l * w), int(t * h), int(r * w), int(b * h)))


def save_webp(img: Image.Image, path: Path, max_width: int = 1600) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.Resampling.LANCZOS)
    if img.mode == "RGBA":
        img.save(path, "WEBP", quality=92, method=6)
    else:
        img.save(path, "WEBP", quality=90, method=6)


def remove_near_white_background(pil: Image.Image) -> Image.Image:
    """Turn paper / table whites into transparency — logos only, no matte."""
    rgba = np.array(pil.convert("RGBA"))
    rgb = rgba[:, :, :3].astype(np.float32)
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    # Only strip true paper white — avoid crushing dark green / gold logo ink
    bg_strength = np.clip((lum - 210) / 35, 0, 1) * np.clip(1 - spread / 32, 0, 1)
    alpha = rgba[:, :, 3].astype(np.float32) * (1 - bg_strength)
    rgba[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)
    return Image.fromarray(rgba)


def trim_alpha_bbox(pil: Image.Image, *, padding: int = 8) -> Image.Image:
    if pil.mode != "RGBA":
        pil = pil.convert("RGBA")
    arr = np.array(pil)
    ys, xs = np.where(arr[:, :, 3] > 20)
    if len(xs) == 0:
        return pil
    l, t, r, b = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    l = max(0, l - padding)
    t = max(0, t - padding)
    r = min(pil.width, r + padding)
    b = min(pil.height, b + padding)
    return pil.crop((l, t, r, b))


def add_transparent_padding(
    pil: Image.Image, pad_x_frac: float, pad_y_frac: float
) -> Image.Image:
    w, h = pil.size
    pad_x = int(w * pad_x_frac)
    pad_y = int(h * pad_y_frac)
    canvas = Image.new("RGBA", (w + pad_x * 2, h + pad_y * 2), (0, 0, 0, 0))
    canvas.paste(pil, (pad_x, pad_y), pil)
    return canvas


def process_file(
    src: Path, dest: Path, *, booklet: bool = False, max_width: int = 1600
) -> dict:
    bgr = cv2.imread(str(src))
    if bgr is None:
        return {"src": src.name, "error": "read_failed"}
    pil = bgr_to_pil(bgr, booklet=booklet)
    save_webp(pil, dest, max_width=max_width)
    return {
        "src": src.name,
        "out": str(dest.relative_to(ROOT)).replace("\\", "/"),
        "w": pil.width,
        "h": pil.height,
    }


def process_page_hero_operations(*, max_width: int = 1280) -> dict:
    """Full-frame MEDIA PATS/7 for inner-page Operations hero (no booklet warp)."""
    src = source_path(7)
    if src is None:
        return {"name": "page-hero-operations", "error": "missing_source"}
    bgr = cv2.imread(str(src))
    if bgr is None:
        return {"name": "page-hero-operations", "error": "read_failed"}
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    pil = ImageOps.exif_transpose(pil)
    pil = ImageEnhance.Contrast(pil).enhance(1.08)
    pil = ImageEnhance.Sharpness(pil).enhance(1.2)
    dest = OUT / "crops" / "page-hero-operations.webp"
    save_webp(pil, dest, max_width=max_width)
    return {
        "name": "page-hero-operations",
        "src": src.name,
        "out": str(dest.relative_to(ROOT)).replace("\\", "/"),
        "w": pil.width,
        "h": pil.height,
    }


def process_crop(
    name: str,
    index: int,
    booklet: bool,
    box: tuple[float, float, float, float],
    *,
    max_width: int = 1400,
) -> dict:
    src = source_path(index)
    if src is None:
        return {"name": name, "error": "missing_source"}
    bgr = cv2.imread(str(src))
    if bgr is None:
        return {"name": name, "error": "read_failed"}
    pil = fractional_crop(bgr_to_pil(bgr, booklet=booklet), box)
    dest = OUT / "crops" / f"{name}.webp"
    save_webp(pil, dest, max_width=max_width)
    return {
        "name": name,
        "src": src.name,
        "out": str(dest.relative_to(ROOT)).replace("\\", "/"),
        "w": pil.width,
        "h": pil.height,
    }


# MEDIA PATS/28 — three circular emblems (reference scan 1536×1024)
_PHOTO_28_REF_SIZE = (1536, 1024)
_PHOTO_28_CIRCLES = (
    (289, 474, 237),  # left — swords (recolor disk to green)
    (767, 508, 263),  # center — PATS
    (1243, 486, 248),  # right — swords (red disk reference)
)


def _photo_28_emblem_circles(w: int, h: int) -> list[tuple[int, int, int]]:
    rw, rh = _PHOTO_28_REF_SIZE
    sx, sy = w / rw, h / rh
    sr = min(sx, sy)
    return [
        (int(cx * sx), int(cy * sy), max(80, int(r * sr)))
        for cx, cy, r in _PHOTO_28_CIRCLES
    ]


def _circle_mask(h: int, w: int, cx: int, cy: int, r: int, *, scale: float = 0.9) -> np.ndarray:
    yy, xx = np.ogrid[:h, :w]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    return dist <= r * scale


def _emblem_insignia_mask(
    rgb: np.ndarray,
    cx: int,
    cy: int,
    r: int,
    *,
    rim_white_min: float | None = None,
) -> np.ndarray:
    """Gold ring / crest / white highlights — keep out of solid disk fill."""
    h, w = rgb.shape[:2]
    yy, xx = np.ogrid[:h, :w]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    in_circle = dist <= r * 0.98
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    spread = rgb.max(axis=2).astype(np.float32) - rgb.min(axis=2).astype(np.float32)
    gold = (
        (rgb[:, :, 0].astype(int) > 130)
        & (rgb[:, :, 1].astype(int) > 95)
        & (rgb[:, :, 2].astype(int) < 145)
        & (spread > 18)
    )
    white = (lum > 188) & (spread < 55)
    if rim_white_min is not None:
        white = white & (dist > r * rim_white_min)
    outer_ring = (dist > r * 0.76) & gold
    return in_circle & (gold | white | outer_ring)


def _emblem_dark_insignia_mask(rgb: np.ndarray, cx: int, cy: int, r: int) -> np.ndarray:
    """Crescent, star, sword blades — keep black ink when expanding disk fill."""
    h, w = rgb.shape[:2]
    yy, xx = np.ogrid[:h, :w]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    in_core = dist <= r * 0.86
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    spread = rgb.max(axis=2).astype(np.float32) - rgb.min(axis=2).astype(np.float32)
    dark = (lum < 88) & (spread < 50)
    return in_core & dark


def _fill_emblem_disk_solid(
    rgb: np.ndarray,
    cx: int,
    cy: int,
    r: int,
    target: tuple[int, int, int],
    *,
    inner_scale: float = 0.9,
    preserve_dark_insignia: bool = False,
    rim_white_min: float | None = None,
) -> None:
    """Fill the full inner disk (e.g. black → flat army green), like the red emblem."""
    h, w = rgb.shape[:2]
    inner = _circle_mask(h, w, cx, cy, r, scale=inner_scale)
    keep = _emblem_insignia_mask(rgb, cx, cy, r, rim_white_min=rim_white_min)
    if preserve_dark_insignia:
        keep = keep | _emblem_dark_insignia_mask(rgb, cx, cy, r)
    fill = inner & ~keep
    if np.any(fill):
        rgb[fill] = np.array(target, dtype=np.uint8)


def _green_from_red_disk(red_rgb: tuple[int, int, int]) -> tuple[int, int, int]:
    """Muted forest green with similar visual weight to the right red disk."""
    r, g, b = red_rgb
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    g_out = int(np.clip(lum * 1.02, 68, 118))
    return (int(g_out * 0.24), g_out, int(g_out * 0.28))


def _left_emblem_recolor_like_red(
    rgb: np.ndarray,
    cx: int,
    cy: int,
    r: int,
    green_ref: tuple[int, int, int],
) -> None:
    """Recolor left disk matte to green (textured), like natural red on the right — not flat neon."""
    orig = rgb.copy()
    h, w = rgb.shape[:2]
    yy, xx = np.ogrid[:h, :w]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    lum = 0.299 * orig[:, :, 0] + 0.587 * orig[:, :, 1] + 0.114 * orig[:, :, 2]
    spread = orig.max(axis=2).astype(np.float32) - orig.min(axis=2).astype(np.float32)
    white_rim = (dist >= r * 0.94) & (lum > 168) & (spread < 70)
    gold = (
        (orig[:, :, 0].astype(int) > 130)
        & (orig[:, :, 1].astype(int) > 95)
        & (orig[:, :, 2].astype(int) < 145)
        & (spread > 18)
    )
    in_disk = dist <= r * 0.93
    black_ink = in_disk & (dist <= r * 0.78) & (lum < 44) & ~gold
    matte = in_disk & ~white_rim & ~gold & ~black_ink & (lum < 115)

    gr = np.array(green_ref, dtype=np.float32)
    if np.any(matte):
        l = lum[matte].astype(np.float32)
        mean_l = max(float(l.mean()), 1.0)
        scale = np.clip(l / mean_l, 0.5, 1.25)[:, np.newaxis]
        rgb[matte] = np.clip(gr * scale, 0, 255).astype(np.uint8)

    rgb[black_ink] = orig[black_ink]
    rgb[gold] = orig[gold]
    rgb[white_rim] = orig[white_rim]


def _clip_emblems_alpha(
    rgba: np.ndarray,
    circles: list[tuple[int, int, int]],
) -> None:
    """Hard clip each emblem; trim left inner edge so green does not sit on the PATS logo."""
    h, w = rgba.shape[:2]
    yy, xx = np.ogrid[:h, :w]
    keep = np.zeros((h, w), dtype=bool)
    for i, (cx, cy, r) in enumerate(circles):
        dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
        rim = 0.92 if i == 0 else 0.96
        keep |= dist <= r * rim
    rgba[~keep, 3] = 0

    if len(circles) >= 2:
        (lx, ly, lr), (cx, cy, cr), *_ = circles
        dist_l = np.sqrt((xx - lx) ** 2 + (yy - ly) ** 2)
        dist_c = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
        # Fade left emblem where it would overlap the center disk
        overlap = (
            (dist_l < lr * 0.94)
            & (dist_c < cr * 0.92)
            & (xx > lx + lr * 0.12)
        )
        rgba[overlap, 3] = 0


def _remove_paper_white(pil: Image.Image) -> Image.Image:
    """Strip scan paper only — keep emblems fully opaque (no dimming on dark ink)."""
    rgba = np.array(pil.convert("RGBA"))
    rgb = rgba[:, :, :3].astype(np.float32)
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    paper = (lum > 238) & (spread < 28)
    rgba[paper, 3] = 0
    visible = rgba[:, :, 3] > 12
    rgba[visible, 3] = 255
    return Image.fromarray(rgba)


def process_photo_28_footer() -> dict:
    """MEDIA PATS/28 — transparent footer mark; natural emblem colors (no recolor)."""
    src = source_path(28)
    if src is None:
        return {"name": "photo-28-footer", "error": "missing_source"}
    bgr = cv2.imread(str(src))
    if bgr is None:
        return {"name": "photo-28-footer", "error": "read_failed"}
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    pil = ImageOps.exif_transpose(pil)
    pil = _remove_paper_white(pil)
    pil = trim_alpha_bbox(pil, padding=12)
    dest = OUT / "crops" / "photo-28-footer.png"
    dest.parent.mkdir(parents=True, exist_ok=True)
    pil.save(dest, optimize=True)
    return {
        "name": "photo-28-footer",
        "src": src.name,
        "out": str(dest.relative_to(ROOT)).replace("\\", "/"),
        "w": pil.width,
        "h": pil.height,
        "alpha": True,
        "natural": True,
    }


def process_photo_28_background() -> dict:
    """MEDIA PATS/28 — three logo patches, white removed, transparent padding."""
    src = source_path(28)
    if src is None:
        return {"name": "bg-28-logos", "error": "missing_source"}
    bgr = cv2.imread(str(src))
    if bgr is None:
        return {"name": "bg-28-logos", "error": "read_failed"}
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    pil = ImageOps.exif_transpose(pil)
    pil = remove_near_white_background(pil)
    pil = trim_alpha_bbox(pil)
    pil = add_transparent_padding(pil, 0.1, 0.08)
    pil = ImageEnhance.Contrast(pil).enhance(1.02)
    dest = OUT / "crops" / "bg-28-logos.webp"
    save_webp(pil, dest, max_width=1920)
    # Full-color copy for footer / display (never run aggressive bg removal on this file)
    full_dest = OUT / "crops" / "photo-28.png"
    src_pil = Image.open(src)
    src_pil = ImageOps.exif_transpose(src_pil)
    src_pil.save(full_dest, optimize=True)
    return {
        "name": "bg-28-logos",
        "src": src.name,
        "out": str(dest.relative_to(ROOT)).replace("\\", "/"),
        "w": pil.width,
        "h": pil.height,
        "alpha": True,
    }


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"Source folder not found: {SRC}")

    manifest: dict = {"booklet": [], "branding": [], "gallery": [], "panels": [], "crops": [], "other": []}

    for n in BOOKLET_PAGES:
        src = source_path(n)
        if src is not None:
            dest = OUT / "booklet" / f"page-{n:02d}.webp"
            manifest["booklet"].append(process_file(src, dest, booklet=True))

    for n in BRANDING:
        src = source_path(n)
        if src is not None:
            dest = OUT / "branding" / f"cover-{n}.webp"
            manifest["branding"].append(process_file(src, dest, booklet=False, max_width=1200))

    for n in GALLERY:
        src = source_path(n)
        if src is not None:
            dest = OUT / "gallery" / f"edition-{n}.webp"
            manifest["gallery"].append(process_file(src, dest, booklet=True, max_width=1800))

    for n in OVERVIEW_PANELS:
        src = source_path(n)
        if src is not None:
            dest = OUT / "panels" / f"panel-{n}.webp"
            manifest["panels"].append(process_file(src, dest, booklet=True))

    for n in DARK_THEME:
        src = source_path(n)
        if src is not None:
            dest = OUT / "booklet" / f"theme-{n}.webp"
            manifest["other"].append(process_file(src, dest, booklet=True))

    for crop_def in WEBSITE_CROPS:
        if len(crop_def) == 5:
            crop_name, index, booklet, box, max_w = crop_def
            manifest["crops"].append(
                process_crop(crop_name, index, booklet, box, max_width=max_w)
            )
        else:
            manifest["crops"].append(process_crop(*crop_def))

    manifest["crops"].append(process_photo_28_background())
    manifest["crops"].append(process_photo_28_footer())
    manifest["crops"].append(process_page_hero_operations())

    meta_path = OUT / "manifest.json"
    meta_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Processed assets -> {OUT}")
    print(f"Crops: {len(manifest['crops'])}")
    print(f"Manifest -> {meta_path}")


if __name__ == "__main__":
    main()
