from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';data=json.loads((DIST/'data.json').read_text());nodes={n['id']:n for n in data['nodes']};assert len(nodes)==len(data['nodes'])
photos={p['id']:p for p in data['photos']};seen=set()
def walk(id,parent,domain):
 assert id not in seen, f'Duplicate or cycle: {id}'
 seen.add(id);n=nodes[id];assert n['parent']==parent;assert n['domain']==domain
 assert n['photo'] in photos;assert n['title'].strip()
 if 'evidence' in n:
  x,y,w,h=n['evidence']['box'];assert 0<=x<=1 and 0<=y<=1 and 0<w<=1 and 0<h<=1
 for c in n['children']:walk(c,id,domain)
for d in data['domains']:
 for id in d['roots']:walk(id,None,d['id'])
 assert d['count']==sum(n['domain']==d['id'] for n in nodes.values())
assert seen==set(nodes),f'Unreachable nodes: {set(nodes)-seen}'
for p in photos.values():
 for k in ['src','thumb']:assert (DIST/p[k]).is_file(),p[k]
manifest=json.loads((DIST/'source-manifest.json').read_text())
assert len(manifest)==len(photos)
for row in manifest:
 assert hashlib.sha256((DIST/row['webImage']).read_bytes()).hexdigest()==row['webImageSha256']
 source=Path('/Users/hanzhang/Downloads/计算机基础知识地图')/row['original']
 if source.exists():assert hashlib.sha256(source.read_bytes()).hexdigest()==row['originalSha256']
assert len((DIST/'knowledge-map.md').read_text().split('[原图]'))-1==len(nodes)
assert all((t['status']=='planned' and not t['roots'] and not t['photos']) or (t['status']=='ready' and t['roots'] and t['photos']) for t in data['extensions'])
for p in DIST.rglob('*'):
 if p.suffix in ['.html','.js','.json','.css','.md']:
  assert '/Users/' not in p.read_text(),f'Local path leaked into {p}'
print(json.dumps({'status':'passed','domains':len(data['domains']),'nodes':len(nodes),'sourcePhotos':len(photos),'graphReachable':len(seen),'photosHashVerified':len(manifest),'ocrAssistedLocations':sum('evidence'in n for n in nodes.values())},ensure_ascii=False))
