"""Build small reading previews from preserved web JPEGs, without requiring original HEICs."""
from pathlib import Path
import hashlib,json
from PIL import Image
root=Path(__file__).resolve().parents[1];dist=root/'dist';path=dist/'source-manifest.json'
ledger=json.loads(path.read_text());total=0
for row in ledger:
 source=dist/row['webImage'];preview=source.with_name(source.stem+'-preview.jpg')
 assert hashlib.sha256(source.read_bytes()).hexdigest()==row['webImageSha256']
 if not preview.exists():
  with Image.open(source) as im:
   im.thumbnail((2200,2200));im.save(preview,quality=86,optimize=True)
 row.update(previewImage=str(preview.relative_to(dist)),previewImageSha256=hashlib.sha256(preview.read_bytes()).hexdigest())
 total+=preview.stat().st_size
path.write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n')
print(len(ledger),'previews,',round(total/len(ledger)/1024),'KiB average; full JPEGs unchanged.')
