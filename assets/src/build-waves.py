#!/usr/bin/env python3
"""Regenerate the banner separator + wave decoration embedded in the themes.

The light backgrounds are written into themes/woodmark-light.css and the dark
backgrounds into themes/woodmark-dark.css (between the @waves-dark markers).

The sloped header band of the `banner` / `banner-subtitle` layouts has two parts:

  1. a light-tint band with a thin solid-green separator line under it, and
  2. dark-green wavy lines in the top-right corner (extracted from the corporate
     PowerPoint template; the source PNGs live next to this script).

Both are emitted as background layers on the section. markdown/Marp themes can't
reliably resolve relative image URLs, so — consistent with the rest of the theme
— the band is an inline SVG data URI and the waves a base64 PNG data URI.

Geometry is measured from the reference render
`assets/src/reference-banner-subtitle.png` (1323x744 = 1280x720 slide): the
separator line has slope -0.0878 (drops ~112px across the 1280 width, ~5deg).
That slope is the single source of truth — both layouts use it, and the wave
layer is seated so its lowest tip lands exactly on the white separator line
(between the tint band and the green line) and never crosses below it.

This script is idempotent: it rebuilds the `background:` declaration of both
rules from scratch each run. Tune GEO below and re-run from the repo root:

    python3 assets/src/build-waves.py

Requires Pillow (`pip install pillow`).
"""
import base64
import io
import math
import os
import re
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
CSS = os.path.join(ROOT, "themes", "woodmark-light.css")
CSS_DARK = os.path.join(ROOT, "themes", "woodmark-dark.css")

SLIDE_W = 1280
SCALE_W = 1300  # downscale width for the embedded wave PNG (keeps lines crisp)

# Measured separator-line slope from the reference PNG (slide px per slide px).
SLOPE = -0.0878

# Per-layout geometry. `green_left` is the y of the green line's TOP edge at the
# left slide edge (x=0); the right edge follows from SLOPE. `gap` is the white
# sliver height (tint-band bottom sits `gap` px above the green line top).
# `thick` is the green line thickness. The wave bottom tip is seated on the
# green line top edge (the bottom of the white sliver).
GEO = {
    "banner": dict(
        green_left=166, gap=7, thick=6,
        png="waves-banner.png", width=610,
    ),
    "banner-subtitle": dict(
        green_left=227, gap=7, thick=6,
        png="waves-banner-subtitle.png", width=615,
    ),
}

# anchor on padding-top to disambiguate the two rules in the CSS
PAD = {"banner": "218px", "banner-subtitle": "284px"}

# Band fill per theme: the sloped band behind the title. The separator line
# stays Woodmark green (#009b3e) in both themes.
BAND_LIGHT = "#e7f3e8"  # --wm-tint
BAND_DARK = "#204232"   # --wm-ink

# Wave-line recolour per theme. Light keeps the source art (dark-green lines on
# the light tint band); dark recolours the lines to Woodmark green so they read
# on the dark ink band.
WAVE_DARK = (0, 155, 62)  # #009b3e — Woodmark grün

# Markers around the script-managed block of dark banner backgrounds.
DARK_START = "/* @waves-dark:start */"
DARK_END = "/* @waves-dark:end */"


def encode_svg(raw):
    """Minimal URL-encoding for an inline SVG data URI (matches theme style)."""
    return (raw.replace("<", "%3C").replace(">", "%3E").replace("#", "%23")
               .replace(" ", "%20").replace(",", "%2C"))


def band_svg(g, fill=BAND_LIGHT):
    """Sloped band (at `fill`) + sloped green separator line, both at SLOPE."""
    gl = g["green_left"]
    gr = gl + SLOPE * SLIDE_W            # green top-edge y at right edge
    bl = gl - g["gap"]                   # tint-band bottom y at left edge
    br = gr - g["gap"]                   # tint-band bottom y at right edge
    t = g["thick"]
    f = lambda v: round(v, 1)
    band = f"0,0 {SLIDE_W},0 {SLIDE_W},{f(br)} 0,{f(bl)}"
    line = (f"0,{f(gl)} {SLIDE_W},{f(gr)} "
            f"{SLIDE_W},{f(gr + t)} 0,{f(gl + t)}")
    raw = (
        "<svg xmlns='http://www.w3.org/2000/svg' "
        "viewBox='0 0 1280 720' preserveAspectRatio='none'>"
        f"<polygon points='{band}' fill='{fill}'/>"
        f"<polygon points='{line}' fill='#009b3e'/>"
        "</svg>"
    )
    return f'url("data:image/svg+xml,{encode_svg(raw)}")'


def wave_image(png):
    """Cropped wave image + its base64 data URI."""
    im = Image.open(os.path.join(HERE, png)).convert("RGBA")
    im = im.crop(im.split()[3].getbbox())  # trim transparent margins
    return im


def recolor(im, rgb):
    """Replace every opaque pixel's RGB with `rgb`, preserving the alpha mask."""
    r, g, b, a = im.split()
    solid = Image.new("RGBA", im.size, (rgb[0], rgb[1], rgb[2], 0))
    solid.putalpha(a)
    return solid


def data_uri(im):
    h = round(im.height * SCALE_W / im.width)
    out = im.resize((SCALE_W, h), Image.LANCZOS)
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return f'url("data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}")'


def seat_offset(im, g):
    """Vertical offset (px from slide top) so the lowest wave tip sits exactly on
    the white separator line (the tint-band bottom edge), leaving the white
    sliver visible below the bundle, with the whole bundle staying above it."""
    W, H = im.size
    a = im.split()[3].load()
    disp = g["width"]
    scale = disp / W
    img_left = SLIDE_W - disp              # right-aligned
    gl = g["green_left"]
    band_bottom_left = gl - g["gap"]       # top of the white sliver
    # the waves end on the white separator line: seat the lowest tip on the
    # band-bottom edge so the full white sliver stays visible below them
    line = lambda x: band_bottom_left + SLOPE * x
    # For each column, the bottom-most opaque pixel; D0 = line - y_rel.
    min_d0 = None
    for ix in range(0, W, 4):
        ymax = None
        for iy in range(H - 1, -1, -1):
            if a[ix, iy] > 40:
                ymax = iy
                break
        if ymax is None:
            continue
        sx = img_left + ix * scale
        y_rel = ymax * scale
        d0 = line(sx) - y_rel
        if min_d0 is None or d0 < min_d0:
            min_d0 = d0
    # floor so the lowest tip is on/above the line, never below it
    return int(math.floor(min_d0))


def build_bg(name):
    """Light background declaration for `section.<name>`."""
    g = GEO[name]
    im = wave_image(g["png"])
    top = seat_offset(im, g)
    wave = data_uri(im)
    pos = f"right 0px top {top}px"
    print(f"  section.{name}: wave top offset = {top}px")
    return (
        "background:\n"
        f'        {wave} {pos} / {g["width"]}px auto no-repeat,\n'
        f"        {band_svg(g)} 0 0 / 100% 100% no-repeat var(--page-bg);"
    )


def build_dark_rule(name):
    """Dark `section.<name>` rule (for woodmark-dark.css): ink band + recoloured
    (lighter) waves."""
    g = GEO[name]
    im = wave_image(g["png"])
    top = seat_offset(im, g)
    wave = data_uri(recolor(im, WAVE_DARK))
    pos = f"right 0px top {top}px"
    return (
        f"section.{name} {{\n"
        "    background:\n"
        f'        {wave} {pos} / {g["width"]}px auto no-repeat,\n'
        f"        {band_svg(g, BAND_DARK)} 0 0 / 100% 100% no-repeat var(--page-bg);\n"
        "}"
    )


def main():
    # 1. Light rules live in woodmark-light.css: rewrite each banner section's
    #    `background:` in place.
    css = open(CSS).read()
    for name in ("banner", "banner-subtitle"):
        pat = re.compile(
            r"(padding-top:\s*" + re.escape(PAD[name])
            + r";\s*\n\s*)background:[\s\S]*?no-repeat var\(--(?:wm-white|page-bg)\);"
        )
        css, n = pat.subn(lambda m: m.group(1) + build_bg(name), css, count=1)
        if n != 1:
            sys.exit(f"ERROR: rule 'section.{name}' not matched ({n})")
        print(f"injected section.{name} (light)")
    open(CSS, "w").write(css)

    # 2. Dark rules live in woodmark-dark.css between the managed markers.
    dark = open(CSS_DARK).read()
    dark_block = "\n\n".join(
        build_dark_rule(name) for name in ("banner", "banner-subtitle")
    )
    replacement = f"{DARK_START}\n{dark_block}\n{DARK_END}"
    pat = re.compile(re.escape(DARK_START) + r"[\s\S]*?" + re.escape(DARK_END))
    dark, n = pat.subn(lambda m: replacement, dark, count=1)
    if n != 1:
        sys.exit(f"ERROR: dark marker block not found in woodmark-dark.css ({n})")
    open(CSS_DARK, "w").write(dark)
    print("injected dark banner / banner-subtitle block (woodmark-dark.css)")


if __name__ == "__main__":
    main()
