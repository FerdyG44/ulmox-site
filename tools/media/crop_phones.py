#!/usr/bin/env python3
"""Cut the phone out of a store screenshot (dropping the headline panel) and
save it as a transparent WebP with the phone's own rounded corners.

usage: crop_phones.py <screenshot_dir> <out_dir> <ids...>
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

TARGET_W = 440


def phone_box(img):
    a = np.asarray(img.convert("L")).astype(int)
    h, w = a.shape
    row = a[int(h * 0.8)]
    xs = np.where(row < 70)[0]
    left, right = xs.min(), xs.max()
    band = a[:, left:right + 1] < 70
    solid = band.mean(1) > 0.6
    # the phone's top edge is the first row that starts a long run of solid
    # rows; a line of headline text can be dark but is never 60 rows tall
    top = next(y for y in range(h - 60) if solid[y:y + 60].all())
    col2 = a[:, (left + right) // 2]
    ys2 = np.where(col2 < 70)[0]
    bottom = ys2.max()
    return left, top, right + 1, bottom + 1


def main():
    src, out, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
    os.makedirs(out, exist_ok=True)
    for i in ids:
        im = Image.open(os.path.join(src, f"{i}.png")).convert("RGB")
        box = phone_box(im)
        ph = im.crop(box)
        h = round(ph.height * TARGET_W / ph.width)
        ph = ph.resize((TARGET_W, h), Image.LANCZOS).convert("RGBA")
        mask = Image.new("L", ph.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, ph.width - 1, ph.height - 1), round(TARGET_W * 0.125), fill=255)
        ph.putalpha(mask)
        ph.save(os.path.join(out, f"{i}.webp"), quality=84, method=6)
        print(i, box, ph.size)


if __name__ == "__main__":
    main()
