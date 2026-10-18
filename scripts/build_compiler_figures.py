"""Reproduce source-page crops used in compiler Markdown articles (requires Pillow)."""
from pathlib import Path
from PIL import Image
import hashlib
import json

ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'source/compiler-figures.json'
rows=json.loads(path.read_text())
for row in rows:
    source=ROOT/'dist/photos'/(row['photo']+'.jpg')
    image=Image.open(source)
    box=tuple(round(v*(image.width if i%2==0 else image.height)) for i,v in enumerate(row['box']))
    target=ROOT/'dist'/row['asset']
    target.parent.mkdir(parents=True,exist_ok=True)
    image.crop(box).save(target,quality=92,optimize=True)
    row.update(sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),assetSha256=hashlib.sha256(target.read_bytes()).hexdigest())
path.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(f'{len(rows)} source figures rebuilt')
