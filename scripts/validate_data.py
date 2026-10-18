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
 for k in ['src','preview','thumb']:assert (DIST/p[k]).is_file(),p[k]
manifest=json.loads((DIST/'source-manifest.json').read_text())
assert len(manifest)==len(photos)
for row in manifest:
 assert hashlib.sha256((DIST/row['webImage']).read_bytes()).hexdigest()==row['webImageSha256']
 assert hashlib.sha256((DIST/row['previewImage']).read_bytes()).hexdigest()==row['previewImageSha256']
 collection=row.get('sourceCollection','计算机基础知识地图')
 assert Path(collection).name==collection, 'Source collection must be a folder name'
 source=Path.home()/'Downloads'/collection/row['original']
 if source.exists():assert hashlib.sha256(source.read_bytes()).hexdigest()==row['originalSha256']
assert len((DIST/'knowledge-map.md').read_text().split('[原图]'))-1==len(nodes)
annotations=json.loads((ROOT/'source/annotations.json').read_text()) if (ROOT/'source/annotations.json').exists() else {}
for id,a in annotations.items():
 assert id in nodes and nodes[id].get('sourceText')==a['text'],f'Missing source annotation: {id}'
 assert a['text'] in (DIST/'knowledge-map.md').read_text(),f'Missing annotation in Markdown: {id}'
complexity=next(n for n in nodes.values() if n['domain']=='algorithms' and n['title']=='时间复杂度')
assert len(complexity['children'])==5
assert all(nodes[id].get('sourceText') and nodes[id].get('evidence') for id in complexity['children']), 'Time-complexity rows must retain their full descriptions and photo evidence'

def child_titles(n):return [nodes[id]['title'] for id in n['children']]
def child(n,title):return next(nodes[id] for id in n['children'] if nodes[id]['title']==title)
singly=next(n for n in nodes.values() if n['domain']=='algorithms' and n['title']=='单链表')
assert child_titles(singly)==['遍历访问结点','插入和删除','指针存储开销']
assert child(singly,'遍历访问结点')['sourceText']=='不支持随机访问，需要遍历去访问结点。'
assert child(singly,'插入和删除')['sourceText']=='插入和删除只需要移动指针，时间复杂度为 O(1)。'
trees=next(n for n in nodes.values() if n['domain']=='algorithms' and n['title']=='树与二叉树')
assert child_titles(trees)==['二叉树','哈夫曼树','字典树']
binary=child(trees,'二叉树')
assert child_titles(binary)==['特点','完全二叉树','满二叉树','二叉搜索树','平衡二叉搜索树']
features=child(binary,'特点')
assert child_titles(features)==['顺序和链式实现','遍历方式']
traversal=child(features,'遍历方式')
assert child_titles(traversal)==['广度优先搜索','深度优先搜索']
assert child_titles(child(traversal,'深度优先搜索'))==['前序遍历','中序遍历','后序遍历']
assert child_titles(child(binary,'平衡二叉搜索树'))==['红黑树']

methods=next(n for n in nodes.values() if n['domain']=='math' and n['title']=='数学学习方法')
assert child_titles(methods)==['Steve Yegge','徐文浩']
assert child(methods,'Steve Yegge')['sourceText']=='资深程序员'
assert child(methods,'徐文浩')['sourceText']=='bothub.ai 创始人'
assert child_titles(child(methods,'Steve Yegge'))==['广度优先了解概念','了解概念的用途与局限','将复杂操作暂作整体理解']
assert child_titles(child(methods,'徐文浩'))==['从工作相关领域开始','用程序实现数学问题的解法','结合在线课程系统学习']
assert all(child(methods,name).get('evidence') for name in ['Steve Yegge','徐文浩'])

storage=next(n for n in nodes.values() if n['domain']=='architecture' and n['title']=='存储器和 I/O 系统' and n['parent'] is None)
assert child_titles(storage)==['存储器层次结构','存储器和 I/O 系统']
io=child(storage,'存储器和 I/O 系统')
assert child_titles(io)==['虚拟内存和内存保护','IO_WAIT','DMA 技术','访问输入输出设备','数据完整性']
assert child(io,'IO_WAIT')['sourceText']=='CPU 和内存的通信。'
assert '准确定义' in child(io,'IO_WAIT')['note']
assert child_titles(child(io,'数据完整性'))==['RAID','Erasure Code','ECC 内存','Hadoop 和分布式存储']

assert not any(n['domain']=='os' and n['title']=='内核子系统' for n in nodes.values()), 'Removed duplicate kernel branch returned'
review=json.loads((ROOT/'source/os-detail-review.json').read_text())
for row in review['items']:
 n=nodes[row['id']]
 assert n['domain']=='os' and n['photo']==row['photo'] and n.get('sourceText')==row['text']
 if row['diagram']:assert '图' in n['note'], f'Diagram-derived text must be identified: {row["path"]}'
fs=next(n for n in nodes.values() if n['domain']=='os' and n['title']=='文件系统' and n['parent'] is None)
assert child_titles(child(fs,'进程打开的文件'))==['文件描述符','进程 A','进程 B']
assert child_titles(child(fs,'文件子系统'))==['struct file']
assert child_titles(child(fs,'虚拟文件系统 VFS'))==['struct dentry','struct inode']
assert child_titles(child(child(fs,'ext4 文件系统'),'inode'))==['Block']
assert child_titles(child(child(child(fs,'ext4 文件系统'),'inode'),'Block'))==['sector']
net=next(n for n in nodes.values() if n['domain']=='os' and n['title']=='网络通信' and n['parent'] is None)
assert child_titles(child(net,'报文封装与解封装'))==['HTTP 应用数据','TCP 报文','IP 报文','MAC 帧','发送与接收方向']

restricted=next(n for n in nodes.values() if n['domain']=='algorithms' and n['title']=='受限线性表')
expected_apps={'栈':['浏览器前进与后退','括号匹配','表达式计算'],'堆':['找第 K 大元素'],'队列':['LFU Cache']}
for parent_id in restricted['children']:
 parent=nodes[parent_id]
 groups=[nodes[id] for id in parent['children'] if nodes[id]['title']=='实际应用']
 assert len(groups)==1, f'Missing application group: {parent["title"]}'
 assert [nodes[id]['title'] for id in groups[0]['children']]==expected_apps[parent['title']]
for path,override in json.loads((ROOT/'source/node-overrides.json').read_text()).items():
 if 'id' in override:
  n=nodes[override['id']];titles=[n['title']]
  while n['parent']:
   n=nodes[n['parent']];titles.insert(0,n['title'])
  assert '/'.join([n['domain']]+titles)==path, f'Existing link changed: {path}'

assert all((t['status']=='planned' and not t['roots'] and not t['photos']) or (t['status']=='ready' and t['roots'] and t['photos']) for t in data['extensions'])
network_review=json.loads((ROOT/'source/network-protocols-review.json').read_text())
topic=next(d for d in data['domains'] if d['id']=='network-deep-dive')
assert [nodes[id]['title'] for id in topic['roots']]==network_review['topics']
assert len(network_review['topics'])==20 and len(topic['photos'])==network_review['sourcePhotos']==12
assert topic['count']==len(network_review['items'])
for row in network_review['items']:
 n=nodes[row['id']]
 assert n['domain']==topic['id'] and n['title']==row['title'] and n['photo']==row['photo'] and n['depth']==row['depth']
 assert bool(n.get('sourceText'))==row['hasDescription']
for row in network_review['verbatimPassages']:
 assert nodes[row['id']]['sourceText']==row['text'] and nodes[row['id']]['photo']==row['photo'], 'Original wording was altered'
assert {nodes[row['id']]['photo'] for row in network_review['items']}==set(topic['photos'])-{'IMG_8081'}, 'Every content photo must have structured entries; IMG_8081 is the contents page'

# Compiler articles must retain every supplied page and export the actual source Markdown.
from article_markdown import render_markdown
from html.parser import HTMLParser
article_index=json.loads((ROOT/'source/compiler-articles.json').read_text())
compiler=next(d for d in data['domains'] if d['id']=='compilers')
articles=data['articles'];assert len(articles)==8
assert compiler['presentation']=='articles' and compiler['articleIds']==[a['id'] for a in articles]
assert {p for a in articles for p in a['photos']}==set(compiler['photos'])=={f'compiler-{i:02}' for i in range(1,47)}
assert len([n for n in nodes.values() if n.get('articleId')])==8
class ArticleLinks(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.local=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  assert tag not in ('script','iframe','object','embed','style')
  assert not any(k.startswith('on') for k in attrs)
  if 'id' in attrs:self.ids.append(attrs['id'])
  for key in ('src','href'):
   value=attrs.get(key,'')
   if value:
    assert not value.lower().startswith(('javascript:','data:','file:'))
    if not value.startswith(('https:','http:','#')):self.local.append(value)
for a,entry in zip(articles,article_index):
 text=(ROOT/entry['source']).read_text()
 assert (DIST/a['markdown']).read_bytes()==(ROOT/entry['source']).read_bytes()
 assert a['text']==text and len(text)>900 and '## 面试指南' in text and '## 扩展阅读' in text
 assert render_markdown(text,a['domain'],a['id'])==(a['html'],a['toc'],a['assets'])
 parser=ArticleLinks();parser.feed(a['html'])
 assert len(parser.ids)==len(set(parser.ids)) and parser.ids==[t['id'] for t in a['toc']]
 for path in parser.local:assert (DIST/path).is_file(), path
 for photo in a['photos']:assert f'data-photo="{photo}"' in a['html']
 assert next(n for n in nodes.values() if n.get('articleId')==a['id'])['searchText']==text
compiler_review=json.loads((ROOT/'source/compiler-review.json').read_text())
assert compiler_review['sourcePages']==46 and compiler_review['articleCount']==len(articles)
for a,row in zip(articles,compiler_review['chapters']):
 assert a['id']==row['id'] and a['photos']==row['photos']
 assert hashlib.sha256(a['text'].encode()).hexdigest()==row['markdownSha256']
figures=json.loads((ROOT/'source/compiler-figures.json').read_text());assert len(figures)==20
assert {r['asset'] for r in figures}=={p for a in articles for p in a['assets']}
for row in figures:
 assert hashlib.sha256((DIST/row['asset']).read_bytes()).hexdigest()==row['assetSha256']
 assert hashlib.sha256((DIST/'photos'/(row['photo']+'.jpg')).read_bytes()).hexdigest()==row['sourceSha256']
 x,y,x2,y2=row['box'];assert 0<=x<x2<=1 and 0<=y<y2<=1
for bad in ['[bad](javascript:alert)','[bad](data:text/html,boom)','[bad](../secret)','![bad](https://example.test/image.jpg)']:
 try:render_markdown(bad,'compilers','unsafe')
 except AssertionError:pass
 else:raise AssertionError('Unsafe article markup was accepted')
assert '&lt;script&gt;' in render_markdown('<script>bad</script>','compilers','escaped')[0]
for p in DIST.rglob('*'):
 if p.suffix in ['.html','.js','.json','.css','.md']:
  assert '/Users/' not in p.read_text(),f'Local path leaked into {p}'
print(json.dumps({'status':'passed','domains':len(data['domains']),'nodes':len(nodes),'sourcePhotos':len(photos),'graphReachable':len(seen),'photosHashVerified':len(manifest),'ocrAssistedLocations':sum('evidence'in n for n in nodes.values()),'sourceAnnotations':len(annotations)},ensure_ascii=False))
