"""Import photos without changing originals; keep a SHA-256 ledger and web thumbnails."""
from pathlib import Path
import argparse,hashlib,json,subprocess,tempfile
from PIL import Image,ImageOps
p=argparse.ArgumentParser();p.add_argument('directory',type=Path);args=p.parse_args()
root=Path(__file__).resolve().parents[1];dist=root/'dist';out=dist/'photos';out.mkdir(exist_ok=True)
ledger_path=dist/'source-manifest.json';ledger=json.loads(ledger_path.read_text()) if ledger_path.exists() else []
by_name={r['original']:r for r in ledger}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for source in sorted(args.directory.iterdir()):
 if source.suffix.lower() not in ['.heic','.jpg','.jpeg','.png']:continue
 original_hash=sha(source);old=by_name.get(source.name);target=out/(source.stem+'.jpg');thumb=out/(source.stem+'-thumb.jpg')
 if old and old['originalSha256']!=original_hash:raise SystemExit(f'Source name collision: {source.name}; preserve the old source and give the new file a unique name.')
 if old and target.exists() and sha(target)==old['webImageSha256'] and thumb.exists():continue
 if target.exists() and not old:raise SystemExit(f'Untracked destination already exists: {target.name}')
 with tempfile.TemporaryDirectory(dir=root/'source') as tmp:
  decoded=source
  if source.suffix.lower()=='.heic':
   decoded=Path(tmp)/'decoded.jpg';subprocess.run(['sips','-s','format','jpeg',str(source),'--out',str(decoded)],check=True,stdout=subprocess.DEVNULL)
  with Image.open(decoded) as im:
   clean=ImageOps.exif_transpose(im).convert('RGB');clean.save(target,quality=95)
   clean.thumbnail((840,630));clean.save(thumb,quality=82)
 by_name[source.name]={'original':source.name,'sourceCollection':args.directory.resolve().name,'originalSha256':original_hash,'webImage':'photos/'+target.name,'webImageSha256':sha(target)}
ledger_path.write_text(json.dumps(list(by_name.values()),ensure_ascii=False,indent=2)+'\n')
print(f'{len(by_name)} source files in ledger; originals unchanged.')
