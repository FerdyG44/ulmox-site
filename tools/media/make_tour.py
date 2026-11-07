#!/usr/bin/env python3
"""Render the ULMOX "how it works" tour: a looping carousel collage of the
eight store screenshots, as an MP4 (H.264, faststart) and a JPEG poster.

usage: make_tour.py <screenshot_dir> <out_basename> [--seconds-per-slide 3]
"""
import argparse
import glob
import math
import os
import subprocess

from PIL import Image, ImageDraw, ImageFilter

W, H = 1280, 720
FPS = 30
HOLD = 2.3        # seconds a slide rests in the centre
MOVE = 0.9        # seconds of the slide transition
CARD_H = 600      # centre card height
INK = (10, 9, 8)
GOLD = (233, 201, 139)


def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * x * (x * (6 * x - 15) + 10)   # smootherstep


def rounded(img, radius):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, img.size[0] - 1, img.size[1] - 1), radius, fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def background():
    bg = Image.new("RGB", (W, H), INK)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse((W / 2 - 520, H / 2 - 300, W / 2 + 520, H / 2 + 330), fill=GOLD + (60,))
    d.ellipse((-260, H - 260, 380, H + 300), fill=(120, 170, 160, 26))
    d.ellipse((W - 360, -300, W + 280, 260), fill=(240, 190, 130, 22))
    glow = glow.filter(ImageFilter.GaussianBlur(150))
    bg.paste(glow, (0, 0), glow)
    # gentle vignette
    vig = Image.new("L", (W, H), 0)
    ImageDraw.Draw(vig).ellipse((-W * 0.25, -H * 0.4, W * 1.25, H * 1.4), fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(120))
    dark = Image.new("RGB", (W, H), (4, 4, 3))
    bg = Image.composite(bg, dark, vig)
    # fine grain for a less "digital" ground
    noise = Image.effect_noise((W, H), 9).convert("RGB")
    bg = Image.blend(bg, noise, 0.025)
    return bg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    args = ap.parse_args()

    files = sorted(glob.glob(os.path.join(args.src, "0*.png")))
    assert len(files) == 8, files
    n = len(files)

    base_h = CARD_H
    cards = []
    for f in files:
        im = Image.open(f).convert("RGB")
        w = round(im.width * base_h / im.height)
        im = im.resize((w, base_h), Image.LANCZOS)
        cards.append(rounded(im, 26))
    cw, ch = cards[0].size

    pad = 60
    sh = Image.new("RGBA", (cw + pad * 2, ch + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((pad, pad + 18, pad + cw, pad + ch + 18), 30, fill=(0, 0, 0, 190))
    shadow = sh.filter(ImageFilter.GaussianBlur(26))

    bg = background()
    period = HOLD + MOVE
    total = int(round(n * period * FPS))

    proc = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p",
         "-profile:v", "high", "-movflags", "+faststart", "-an", args.out + ".mp4"],
        stdin=subprocess.PIPE)

    poster = None
    for fi in range(total):
        s = fi / FPS
        k = int(s // period)
        local = s - k * period
        t = k + (ease((local - HOLD) / MOVE) if local > HOLD else 0.0)

        frame = bg.copy()
        layers = []
        for i in range(n):
            p = (i - t + n / 2) % n - n / 2      # signed distance from centre, wrapped
            a = abs(p)
            if a > 2.6:
                continue
            scale = 1.0 - 0.2 * min(a, 1) - 0.16 * max(0, min(a - 1, 1)) - 0.1 * max(0, a - 2)
            sign = 1 if p >= 0 else -1
            off = 330 * min(a, 1) + 270 * max(0, min(a - 1, 1)) + 200 * max(0, a - 2)
            x = W / 2 + sign * off
            bright = 1.0 - 0.42 * min(a, 1) - 0.25 * max(0, min(a - 1, 1))
            layers.append((a, i, x, scale, bright))
        for a, i, x, scale, bright in sorted(layers, reverse=True):
            w2, h2 = max(1, round(cw * scale)), max(1, round(ch * scale))
            y = H / 2 - h2 / 2 - 6
            s_img = shadow.resize((round(shadow.width * scale), round(shadow.height * scale)), Image.BILINEAR)
            frame.paste(s_img, (round(x - s_img.width / 2), round(y - pad * scale)), s_img)
            c = cards[i].resize((w2, h2), Image.BILINEAR)
            if bright < 0.999:
                rgb = c.convert("RGB").point(lambda v, b=bright: int(v * b))
                rgb.putalpha(c.getchannel("A"))
                c = rgb
            frame.paste(c, (round(x - w2 / 2), round(y)), c)

        # progress: eight hairline dots, the current one a short gold bar
        d = ImageDraw.Draw(frame)
        cur = int(round(t)) % n
        gap = 18
        x0 = W / 2 - (n - 1) * gap / 2 - 9
        for i in range(n):
            cx = x0 + i * gap + (18 if i > cur else 0)
            if i == cur:
                d.rounded_rectangle((cx - 4, H - 34, cx + 22, H - 29), 3, fill=GOLD)
            else:
                d.ellipse((cx - 3, H - 34.5, cx + 3, H - 28.5), fill=(120, 112, 98))

        if fi == int(HOLD * 0.5 * FPS):
            poster = frame.copy()
        proc.stdin.write(frame.tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise SystemExit("ffmpeg failed")

    poster.save(args.out + ".jpg", quality=82, optimize=True, progressive=True)


if __name__ == "__main__":
    main()
