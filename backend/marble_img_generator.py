import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import noise
import random

# Predefined aesthetic palettes (add more if needed)
GOOD_PALETTES = [
    # 1. Purple/Blue Cool
    [(172, 146, 236), (98, 204, 255), (55, 69, 145)],

    # 2. Warm Earth
    [(245, 221, 179), (198, 134, 66), (109, 85, 53)],

    # 3. Aqua
    [(184, 242, 230), (120, 198, 189), (68, 130, 122)],

    # 4. Neutral Grays
    [(220, 220, 220), (180, 180, 180), (110, 110, 110)],

    # 5. Soft Pastels
    [(255, 214, 214), (255, 240, 219), (208, 235, 255)],

    # 6. Deep Ocean
    [(20, 30, 80), (35, 80, 120), (60, 130, 150)],

    # 7. Forest Greens
    [(90, 140, 100), (60, 100, 80), (30, 60, 50)],

    # 8. Desert Sand
    [(245, 230, 200), (220, 180, 140), (170, 130, 90)],

    # 9. Sunset Glow
    [(255, 204, 102), (255, 153, 51), (204, 102, 0)],

    # 10. Rose & Plum
    [(255, 192, 203), (199, 112, 161), (103, 58, 183)],

    # 11. Mint & Coral
    [(152, 255, 152), (255, 153, 153), (255, 204, 153)],

    # 12. Autumn Leaves
    [(255, 153, 51), (204, 102, 0), (153, 76, 0)],

    # 13. Lavender & Sage
    [(230, 230, 250), (152, 251, 152), (102, 205, 170)],

    # 14. Blue & Gold
    [(70, 130, 180), (255, 215, 0), (255, 255, 224)],
]


def generate_marble_image(size=512):
    # Safer ranges
    scale = random.uniform(60.0, 100.0)
    octaves = random.randint(4, 6)
    persistence = random.uniform(0.4, 0.6)
    lacunarity = random.uniform(1.8, 2.5)
    frequency = random.uniform(3.5, 6.0)
    warp_strength = random.uniform(2.0, 10.0)
    seed = random.randint(0, 100000)

    palette = random.choice(GOOD_PALETTES)
    img = Image.new('RGB', (size, size))
    pixels = img.load()

    for y in range(size):
        for x in range(size):
            nx = x / scale
            ny = y / scale

            # Add warping
            wx = nx + warp_strength * noise.pnoise2(nx, ny, base=seed + 10)
            wy = ny + warp_strength * noise.pnoise2(ny, nx, base=seed + 20)

            val = noise.pnoise2(wx, wy, octaves=octaves, persistence=persistence,
                                lacunarity=lacunarity, repeatx=1024, repeaty=1024,
                                base=seed)

            t = 0.5 * (1 + np.sin(frequency * val))
            r = int((1 - t) * palette[0][0] + t * palette[1][0])
            g = int((1 - t) * palette[0][1] + t * palette[1][1])
            b = int((1 - t) * palette[0][2] + t * palette[2][2])
            pixels[x, y] = (r, g, b)

    # Postprocessing for contrast and clarity
    img = img.filter(ImageFilter.GaussianBlur(radius=1.0))
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.1)
    print(img)

    return img


# Example usage
if __name__ == "__main__":
    img = generate_marble_image()
    img.show()
    img.save("app/static/pretty_marble.png")
