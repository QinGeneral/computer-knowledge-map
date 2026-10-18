"""Small, escaped Markdown renderer for the site's source-authored articles.

No browser fetch or third-party package is required. Unknown HTML is plain text.
"""
from pathlib import Path
from html import escape
from urllib.parse import urlsplit, unquote
import hashlib
import json
import re

PUBLIC = 'https://qingeneral.github.io/computer-knowledge-map/'


def safe_url(value):
    value = value.strip()
    parts = urlsplit(value)
    assert not any(ord(c) < 32 for c in value), 'Control character in URL'
    assert '\\' not in value and not value.startswith('//'), 'Ambiguous URL'
    assert parts.scheme in ('', 'https', 'http'), 'Unsupported URL scheme'
    if not parts.scheme:
        assert not value.startswith('/') and '..' not in unquote(parts.path).split('/'), 'Unsafe relative URL'
    return value


def render_markdown(source, domain, article_id):
    toc, assets = [], []
    def inline(value):
        # Tokenize before escaping; generated tags never re-enter the parser.
        pattern = r'!\[([^\]]*)\]\(([^\s)]+)\)|\[([^\]]+)\]\(([^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*'
        out, start = [], 0
        for match in re.finditer(pattern, value):
            out.append(escape(value[start:match.start()]))
            alt, image, label, url, code, strong = match.groups()
            if image:
                image = safe_url(image)
                local = image.removeprefix(PUBLIC)
                assert local.startswith('figures/compilers/'), 'Article figures must be packaged locally'
                assets.append(local)
                photo = 'compiler-' + re.search(r'compiler-(\d+)', local)[1]
                out.append(f'<button class="article-figure" data-photo="{photo}" aria-label="打开原图：{escape(alt, quote=True)}"><img src="{escape(local, quote=True)}" alt="{escape(alt, quote=True)}" loading="lazy"><span>{escape(alt)} · 点击对照原图</span></button>')
            elif url:
                url = safe_url(url)
                local = url.removeprefix(PUBLIC)
                photo = re.fullmatch(r'photos/(compiler-\d+)\.jpg', local)
                if photo:
                    out.append(f'<a href="{escape(local, quote=True)}" data-photo="{photo[1]}">{escape(label)}</a>')
                elif urlsplit(url).scheme:
                    out.append(f'<a href="{escape(url, quote=True)}" target="_blank" rel="noopener noreferrer">{escape(label)}</a>')
                else:
                    out.append(f'<a href="{escape(url, quote=True)}">{escape(label)}</a>')
            elif code is not None:
                out.append('<code>'+escape(code)+'</code>')
            else:
                out.append('<strong>'+escape(strong)+'</strong>')
            start = match.end()
        out.append(escape(value[start:]))
        return ''.join(out)

    lines = source.splitlines()
    html, paragraph, listing, code = [], [], None, None
    def flush():
        if paragraph:
            html.append('<p>'+inline(''.join(paragraph))+'</p>')
            paragraph.clear()
    def close_list():
        nonlocal listing
        if listing:
            html.append('</'+listing+'>')
            listing = None
    for line in lines:
        if code is not None:
            if line.startswith('```'):
                html.append('<pre><code>'+escape('\n'.join(code))+'</code></pre>')
                code = None
            else:
                code.append(line)
            continue
        if line.startswith('```'):
            flush(); close_list(); code=[]; continue
        heading = re.fullmatch(r'(#{1,4}) (.+)', line)
        item = re.match(r'^(?:([-*]) |(\d+)\. )(.+)', line)
        if not line.strip():
            flush(); close_list()
        elif heading:
            flush(); close_list()
            level, title = len(heading[1]), heading[2]
            if level == 1: continue  # Reader supplies the one page heading.
            sid='section-'+hashlib.sha256((article_id+'/'+str(len(toc))+'/'+title).encode()).hexdigest()[:10]
            toc.append({'id':sid,'title':title,'level':level})
            html.append(f'<h{level} id="{sid}">{inline(title)}</h{level}>')
        elif item:
            flush()
            kind='ul' if item[1] else 'ol'
            if listing!=kind:
                close_list();listing=kind
                html.append('<'+kind+(f' start="{item[2]}"' if kind=='ol' else '')+'>')
            html.append('<li>'+inline(item[3])+'</li>')
        elif line.startswith('> '):
            flush();close_list();html.append('<blockquote>'+inline(line[2:])+'</blockquote>')
        elif line.startswith('!['):
            flush();close_list();html.append('<figure>'+inline(line)+'</figure>')
        else:
            close_list();paragraph.append(line.strip())
    flush();close_list()
    assert code is None, 'Unclosed code fence'
    return ''.join(html), toc, sorted(set(assets))


def build_articles(root, topic):
    index_path=(root/topic['articleIndex']).resolve()
    assert index_path.is_relative_to(root/'source')
    index=json.loads(index_path.read_text())
    out=[]
    for entry in index:
        source_path=(root/entry['source']).resolve()
        assert source_path.is_relative_to(root/'source/articles')
        text=source_path.read_text()
        assert text.startswith('# '+entry['title']+'\n')
        rendered,toc,assets=render_markdown(text,topic['id'],entry['id'])
        target=Path('articles')/topic['id']/(entry['id']+'.md')
        (root/'dist'/target).parent.mkdir(parents=True,exist_ok=True)
        (root/'dist'/target).write_text(text)
        for asset in assets: assert (root/'dist'/asset).is_file(), asset
        out.append({k:v for k,v in entry.items() if k!='source'} | {'domain':topic['id'],'markdown':target.as_posix(),'html':rendered,'text':text,'toc':toc,'assets':assets})
    assert len({a['id'] for a in out})==len(out)
    return out
