(() => {
'use strict';
const data=window.KNOWLEDGE_DATA;
const $=id=>document.getElementById(id), e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nodeMap=new Map(data.nodes.map(n=>[n.id,n])), domainMap=new Map(data.domains.map(d=>[d.id,d])), extensionMap=new Map(data.extensions.map(d=>[d.id,d])), photoMap=new Map(data.photos.map(p=>[p.id,p]));
const paths={code:'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',book:'M4 3h13a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3zm0 14h16M8 7h8M8 11h5',tree:'M12 3v6M5 16v-3h14v3M12 9H8M12 16v-7M3 17h4v4H3zM10 17h4v4h-4zM17 17h4v4h-4zM10 2h4v4h-4z',math:'M20 3H5l7 9-7 9h15',settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1zM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',chip:'M6 6h12v12H6zM9 9h6v6H9zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4',network:'M6 7l10-3M6 9l10 10M18 6v10M7 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0M22 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0M22 20a3 3 0 1 1-6 0 3 3 0 0 1 6 0',file:'M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6',clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v6l4 2',search:'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',arrow:'M5 12h14M13 6l6 6-6 6',chevron:'M9 5l7 7-7 7',download:'M12 3v12M7 10l5 5 5-5M4 16v5h16v-5',close:'M5 5l14 14M19 5L5 19',external:'M14 3h7v7M21 3L11 13M10 3H3v18h18v-7',plus:'M4 12h16M12 4v16',minus:'M4 12h16',photo:'M3 3h18v18H3zM3 17l5-6 4 4 3-3 6 6M16 7h.01',globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',link:'M10 13l4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0'};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.file}"/></svg>`;
const subjectIcons=['book','tree','math','settings','chip','network','file'];
function mountIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.outerHTML=icon(el.dataset.icon));}
const norm=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s+/g,'').replace(/[·/／_、，,()（）-]/g,'');
const ancestry=n=>{const out=[];for(let c=n;c;c=nodeMap.get(c.parent))out.unshift(c);return out;};
const crumb=n=>[domainMap.get(n.domain).title,...ancestry(n).slice(0,-1).map(n=>n.title)].join(' › ');
const articleMap=new Map((data.articles||[]).map(a=>[a.id,a]));
const domainView=id=>domainMap.get(id)?.presentation==='articles'?'articles':'tree';
const readState=()=>{
 const p=new URLSearchParams(location.hash.slice(1));
 let view=['overview','tree','photos','articles'].includes(p.get('view'))?p.get('view'):'overview';
 let domain=domainMap.has(p.get('domain'))||extensionMap.has(p.get('domain'))?p.get('domain'):'';
 if(view==='tree'&&domainView(domain)==='articles')view='articles';
 if(view==='articles'&&domainView(domain)!=='articles')domain=data.domains.find(d=>d.presentation==='articles')?.id||'';
 let article=articleMap.get(p.get('article'))?.domain===domain?p.get('article'):'';
 const node=nodeMap.get(p.get('node'));
 if(node?.articleId){view='articles';domain=node.domain;article=node.articleId;}
 const section=articleMap.get(article)?.toc.some(t=>t.id===p.get('section'))?p.get('section'):'';
 return {view,domain,q:(p.get('q')||'').slice(0,180),node:node&&!node.articleId?node.id:'',article,section};
};
const href=s=>{const p=new URLSearchParams();Object.entries(s).forEach(([k,v])=>{if(v)p.set(k,v)});return '#'+p.toString();};
let state=readState(),previous=null,cropVersion=0,photoVersion=0,photoScale=1,photoEvidence=null,mindmapInstance=null;
function go(patch,replace=false){const next={...state,...patch};const url=href(next);if(replace){history.replaceState(null,'',url);render();}else if(location.hash!==url)location.hash=url;}
const articleUI=window.createKnowledgeArticles({data,href,e,icon});
function navigateDomain(id){go({view:domainView(id),domain:id,q:'',node:'',article:'',section:''});}
function openNode(id){const n=nodeMap.get(id);if(n?.articleId)go({view:'articles',domain:n.domain,article:n.articleId,section:'',q:'',node:''});else go({node:id});}
function scrollArticle(){
 document.querySelectorAll('.article-toc a').forEach(a=>{if(a.dataset.section===state.section)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 if(state.section)requestAnimationFrame(()=>{document.getElementById(state.section)?.scrollIntoView({block:'start'});});
}

function sidebar(){
 $('domainNav').innerHTML=`<a href="${href({view:state.view==='articles'?'overview':state.view})}" class="nav-item" data-home ${!state.domain?'aria-current="page"':''}>${icon('grid')}<span>全部知识</span></a>`+data.domains.filter(d=>!d.extension).map((d,i)=>`<a class="nav-item" href="${href({view:state.view==='photos'?'photos':'tree',domain:d.id})}" ${state.domain===d.id&&state.view!=='overview'?'aria-current="page"':''}>${icon(subjectIcons[i])}<span>${e(d.title)}</span></a>`).join('');
 $('extensionNav').innerHTML=data.extensions.map(d=>`<a class="nav-item" href="${href({view:domainView(d.id),domain:d.id})}" ${state.domain===d.id?'aria-current="page"':''}>${icon(d.id==='compilers'?'code':d.status==='ready'?'globe':'clock')}<span>${e(d.title)}</span>${d.status==='ready'?'':'<small>待补充</small>'}</a>`).join('');
 $('domainPicker').innerHTML=`<option value="">全部知识</option>`+data.domains.filter(d=>!d.extension).map(d=>`<option value="${d.id}" ${state.domain===d.id?'selected':''}>${e(d.title)}</option>`).join('')+`<optgroup label="专题扩展">`+data.extensions.map(d=>`<option value="${d.id}" ${state.domain===d.id?'selected':''}>${e(d.title)}${d.status==='ready'?'':' · 待补充'}</option>`).join('')+'</optgroup>';
 document.querySelectorAll('[data-view]').forEach(a=>{if(a.dataset.view===state.view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');a.href=href({view:a.dataset.view,domain:a.dataset.view==='overview'||a.dataset.view==='tree'&&domainView(state.domain)==='articles'?'':a.dataset.view==='articles'?'compilers':state.domain});});
}
function searchBox(){return `<div class="search">${icon('search')}<input id="searchInput" type="search" aria-label="搜索知识概念" placeholder="搜索概念、协议、算法…" value="${e(state.q)}" maxlength="180" autocomplete="off"><kbd>/</kbd></div>`;}
function footer(){return `<footer class="page-foot"><span>${data.domains.length} 个领域 · ${data.nodes.filter(n=>!n.articleId).length} 个层级条目${data.articles?.length?' · '+data.articles.length+' 篇文章':''} · ${data.photos.length} 张照片</span><span>条目数含分组节点；同名概念保留各自结构位置。</span><a href="knowledge-map.md" download>Markdown</a><a href="data.json" download>JSON</a></footer>`;}
function home(){
 const layerButton=(label,domain)=>`<button data-domain="${domain}">${label}</button>`;
 return `<div class="home-grid"><section class="home-copy"><h1>连接计算机知识的每一层</h1><p class="intro">从硬件到系统，从算法到应用。按结构探索，回到原图核对。</p>${searchBox()}<div class="subject-list">${data.domains.filter(d=>!d.extension).map((d,i)=>`<a class="subject-row" href="${href({view:domainView(d.id),domain:d.id})}"><span class="number">${String(i+1).padStart(2,'0')}</span><h2>${e(d.title)}</h2><p>${e(d.description)}</p>${icon('chevron')}</a>`).join('')}</div></section><section class="layer-panel" aria-labelledby="layersTitle"><h2 id="layersTitle">计算机的知识层次</h2><div class="layer-diagram"><div class="layer single">${layerButton('计算机应用程序','overview')}</div><div class="layer-trunk"></div><div class="layer">${layerButton('操作系统','os')}${layerButton('编译原理','compilers')}${layerButton('计算机网络','networks')}</div><div class="layer-trunk"></div><div class="layer single">${layerButton('计算机体系结构','architecture')}</div><div class="layer-trunk"></div><div class="layer single">${layerButton('计算机组成','architecture')}</div><div class="layer-trunk short"></div><div class="layer hardware-layer">${layerButton('CPU / GPU','architecture')}${layerButton('内存 / 硬盘','architecture')}${layerButton('显示器 / 键盘','overview')}</div></div><a class="layer-bottom" href="#view=tree&domain=overview">从总览开始${icon('arrow')}</a></section></div><section class="grow-band"><h2>让知识继续生长</h2><div class="grow-links">${data.extensions.map((d,i)=>`<a href="${href({view:domainView(d.id),domain:d.id})}">${icon(i?'file':'globe')}${e(d.title)}<span>${d.status==='ready'?domainMap.get(d.id).count+(domainView(d.id)==='articles'?' 篇文章':' 个条目'):'等待后续图片'}</span>${icon('chevron','arrow')}</a>`).join('')}</div></section>${footer()}`;
}
function pending(d){return `<header class="page-head"><div><h1>${e(d.title)}</h1><p>专题扩展</p></div></header><section class="pending-topic">${icon('clock')}<h2>结构已预留，等待后续图片</h2><p>${e(d.description)}</p><div class="related-topics">${d.relatedDomains.map(id=>`<button class="button" data-domain="${id}">${e(domainMap.get(id).title)}${icon('arrow')}</button>`).join('')}</div><div class="pending-outline"><strong>先沿着已有结构探索</strong>后续专题将接入同一套思维导图、搜索和原图对照。当前没有新增的专题条目。</div></section>${footer()}`;}
function tree(){
 const d=domainMap.get(state.domain),ext=extensionMap.get(state.domain);if(ext&&ext.status!=='ready')return pending(ext);
 return `<header class="page-head"><div><h1>${e(d?.title||'全部知识')}</h1><p>${e(d?.description||'以思维导图探索知识结构，展开分支，查看概念与来源。')}</p></div><a class="button" href="${href({view:'photos',domain:state.domain})}">${icon('photo')}查看原图资料</a></header><div class="tree-tools">${searchBox()}<button class="button" data-expand="true">${icon('chevron','expand-icon')}全部展开</button><button class="button" data-expand="false">${icon('chevron','collapse-icon')}全部收起</button></div><div id="treeResults"></div>${footer()}`;
}
function updateTree(){
 const el=$('treeResults');if(!el)return;
 mindmapInstance?.destroy();mindmapInstance=null;
 const nodes=data.nodes.filter(n=>(!state.domain||n.domain===state.domain));
 let matches=null;
 if(state.q.trim()){
  const tokens=state.q.trim().split(/\s+/).map(norm);
  matches=nodes.filter(n=>tokens.every(t=>norm(n.title+' '+(n.searchText||'')+' '+(n.sourceText||'')+' '+n.note+' '+crumb(n)).includes(t))).map(n=>n.id);
 }
 el.innerHTML=(matches?`<div class="result-info" role="status" aria-live="polite"><span>匹配 <strong>${matches.length}</strong> 个条目 · 保留所属分支</span><button data-clear>清除搜索</button></div>`:'')+(matches&&!matches.length?`<div class="empty"><h2>没有找到相关条目</h2><p>试试“TCP”“内存”“二叉树”，或切换到全部知识搜索。</p><button class="button" data-clear>清除搜索</button>${state.domain?'<button class="button" data-search-all>搜索全部领域</button>':''}</div>`:'<div id="mindmapHost"></div>');
 if($('mindmapHost'))mindmapInstance=window.createKnowledgeMindmap($('mindmapHost'),{domains:data.domains,nodes:data.nodes,domainId:state.domain,matches,onOpenNode:openNode,onOpenDomain:navigateDomain});
}
function photos(){
 const d=domainMap.get(state.domain),ext=extensionMap.get(state.domain);if(ext&&ext.status!=='ready')return pending(ext);
 const ps=d?data.photos.filter(p=>d.photos.includes(p.id)):data.photos;
 return `<header class="page-head"><div><h1>${d?e(d.title)+' · ':''}原图资料</h1><p>${ps.length} 张照片 · 保留完整画面，支持放大与条目来源对照。</p></div><a class="button" href="${href({view:domainView(state.domain),domain:state.domain})}">${icon(domainView(state.domain)==='articles'?'file':'tree')}返回${domainView(state.domain)==='articles'?'文章目录':'知识树'}</a></header><div class="gallery">${ps.map(p=>`<figure class="photo-card"><button data-photo="${p.id}" aria-label="放大${e(p.title)}"><img src="${p.thumb}" alt="${e(p.title)}" loading="lazy" width="840" height="630"><span class="photo-overlay">${icon('plus')}</span></button><figcaption><h2>${e(p.title)}</h2><p>${e(p.id)} · ${p.domains.map(id=>e(domainMap.get(id).title)).join(' / ')||'目录'}</p></figcaption></figure>`).join('')}</div><details class="source-info"><summary>资料来源与整理说明</summary><p>${e(data.contentPolicy)}</p><p>原始 HEIC / JPEG 文件保留在来源目录，站点提供完整 JPEG、清晰预览与缩略图。每张源文件和网页图片均记录 SHA-256。局部定位来自 OCR，可能有偏移；请结合完整照片核对。整理版保留原图的分组逻辑，并非更新后的技术规范。</p><a href="source-manifest.json" download>下载来源校验清单</a><a href="data.json" download>下载结构数据</a><a href="knowledge-map.md" download>下载 Markdown</a></details>${footer()}`;
}
function render(){
 const next=readState();const old=previous;state=next;document.body.classList.toggle('map-view',state.view==='tree'&&!extensionMap.has(state.domain)||state.view==='tree'&&extensionMap.get(state.domain)?.status==='ready');
 const sameMain=old&&['view','domain','q','article'].every(k=>old[k]===state[k]);
 if(!sameMain){mindmapInstance?.destroy();mindmapInstance=null;if(!old||old.view!==state.view||old.domain!==state.domain||old.article!==state.article)window.scrollTo(0,0);sidebar();$('content').innerHTML=state.view==='overview'?home():state.view==='tree'?tree():state.view==='articles'?articleUI.render(state)+footer():photos();if(state.view==='tree')updateTree();}
 const title=domainMap.get(state.domain)?.title||extensionMap.get(state.domain)?.title;
 document.title=(state.article?articleMap.get(state.article).title:state.node?nodeMap.get(state.node).title:title||'计算机基础知识地图')+(state.article||state.node||title?' · 计算机基础知识地图':'');
 if(state.node)showNode(state.node);else if($('detailDialog').open)$('detailDialog').close();
 previous={...state};mountIcons();if(state.view==='articles')scrollArticle();
}
function syncScrollLock(){document.body.classList.toggle('dialog-open',!!document.querySelector('dialog[open]'));}
function showNode(id){
 const n=nodeMap.get(id);if(!n)return;
 const parents=ancestry(n);const d=domainMap.get(n.domain),p=photoMap.get(n.photo),related=data.nodes.filter(x=>x.id!==id&&norm(x.title)===norm(n.title));
 $('detailContent').innerHTML=`<header class="detail-top"><div><h2 id="detailTitle">${e(n.title)}</h2><p>${e(d.title)} · ${n.children.length?'分支节点':'知识条目'}</p></div><button class="icon-button" data-close="detailDialog" aria-label="关闭条目详情">${icon('close')}</button></header><div class="detail-body">${window.KnowledgeDiagrams?.get(n.id)?`<section class="detail-diagram" aria-label="${e(window.KnowledgeDiagrams.get(n.id).title)}"><div class="detail-diagram-viewport">${window.KnowledgeDiagrams.render(n.id)}</div><p>${window.KnowledgeDiagrams.get(n.id).interactive===false?'小屏幕可横向滚动图示。':'点击图中条目查看详情；小屏幕可横向滚动图示。'}</p></section>`:''}<nav class="breadcrumbs" aria-label="条目所在结构"><button data-domain="${d.id}">${e(d.title)}</button>${parents.slice(0,-1).map(c=>icon('chevron')+`<button data-node="${c.id}">${e(c.title)}</button>`).join('')}</nav>${n.sourceText?`<section class="source-transcription"><h3>原图说明</h3><p>${e(n.sourceText)}</p></section>`:''}${n.note?`<div class="detail-note"><span class="detail-note-label">整理说明</span>${e(n.note)}</div>`:''}<section class="detail-section"><h3>${n.children.length?'下一级知识':'所在分支'}</h3>${n.children.length?`<div class="child-list">${n.children.map(id=>`<button class="button" data-node="${id}">${e(nodeMap.get(id).title)}${icon('chevron')}</button>`).join('')}</div>`:`<p class="leaf-context">位于“${e(nodeMap.get(n.parent)?.title||d.title)}”分支。沿上方路径返回，或对照下面的照片了解上下文。</p>`}</section><section class="detail-section"><h3>原图对照${n.evidence?' · 辅助定位':''}</h3><button class="source-crop" data-photo="${n.photo}" data-source-node="${n.id}" aria-label="放大条目来源原图"><img id="sourceFallback" src="${e(p.thumb)}" alt="${e(p.title)}"><canvas id="sourceCanvas" hidden></canvas><span id="cropLoading" class="crop-loading">正在加载清晰预览…</span></button><div class="source-caption"><span>${e(p?.title||n.photo)} · ${e(n.photo)}</span><button data-photo="${n.photo}" data-source-node="${n.id}">放大核对 ${icon('external')}</button></div>${n.evidence?`<details class="ocr-record"><summary>查看辅助识别记录</summary><p>识别文字：${e(n.evidence.text)}。定位来自 OCR，可能与相邻条目重叠，请以完整照片为准。</p></details>`:'<p class="ocr-record">该条目未自动定位到局部，显示完整照片以便核对。</p>'}</section>${related.length?`<section class="detail-section"><h3>在其他结构中</h3><div class="child-list">${related.map(x=>`<button class="button" data-node="${x.id}">${e(domainMap.get(x.domain).title)} · ${e(nodeMap.get(x.parent)?.title||x.title)}</button>`).join('')}</div></section>`:''}<div class="detail-actions"><button class="button" id="copyLink" data-copy="${id}">${icon('link')}复制条目链接</button><button class="button" data-locate="${id}">${icon('tree')}在导图中定位</button></div><p class="detail-footnote">内容与层级按照片整理。原图中的简化表述在相关条目另作说明；未补写照片中不存在的课程正文。</p></div>`;
 const dlg=$('detailDialog');if(!dlg.open)dlg.showModal();dlg.scrollTop=0;syncScrollLock();
 const version=++cropVersion;const im=new Image();im.onload=()=>{if(version!==cropVersion)return;const cv=$('sourceCanvas');if(!cv)return;let x=0,y=0,w=1,h=1;if(n.evidence){const b=n.evidence.box;w=Math.min(1,Math.max(.36,b[2]*1.6));x=Math.max(0,Math.min(1-w,b[0]-(w-b[2])*.45));h=Math.min(1,Math.max(.13,b[3]*5));y=Math.max(0,Math.min(1-h,b[1]-(h-b[3])*.45));}cv.width=1200;cv.height=Math.max(130,Math.round(1200*h*im.height/(w*im.width)));cv.getContext('2d').drawImage(im,x*im.width,y*im.height,w*im.width,h*im.height,0,0,cv.width,cv.height);cv.hidden=false;$('sourceFallback').hidden=true;$('cropLoading').hidden=true;};im.onerror=()=>{if(version===cropVersion&&$('cropLoading'))$('cropLoading').textContent='局部加载失败，点击打开完整原图。';};im.src=p?.preview||p?.src||`photos/${n.photo}.jpg`;
}
function fitPhoto(){const im=$('fullPhoto'),vp=$('photoViewport');if(!im.naturalWidth)return;photoScale=Math.min((vp.clientWidth-20)/im.naturalWidth,(vp.clientHeight-20)/im.naturalHeight,1);applyZoom();vp.scrollTop=0;vp.scrollLeft=0;}
function applyZoom(){const im=$('fullPhoto');$('photoStage').style.width=Math.round(im.naturalWidth*photoScale)+'px';$('zoomLevel').textContent=Math.round(photoScale*100)+'%';$('zoomIn').disabled=photoScale>=2.99;$('zoomOut').disabled=photoScale<=.05;if(photoEvidence){const [x,y,w,h]=photoEvidence.box;Object.assign($('sourceMarker').style,{left:x*100+'%',top:y*100+'%',width:w*100+'%',height:h*100+'%'});}}
function zoom(f){const vp=$('photoViewport'),old=photoScale;const cx=vp.scrollLeft+vp.clientWidth/2,cy=vp.scrollTop+vp.clientHeight/2;photoScale=Math.min(3,Math.max(.05,old*f));applyZoom();vp.scrollLeft=cx*photoScale/old-vp.clientWidth/2;vp.scrollTop=cy*photoScale/old-vp.clientHeight/2;}
function showPhoto(id,nodeId){
 const p=photoMap.get(id);if(!p)return;
 const version=++photoVersion,im=$('fullPhoto'),status=$('photoStatus'),statusText=$('photoStatusText'),retry=$('photoRetry');
 photoEvidence=nodeMap.get(nodeId)?.evidence||null;
 $('photoTitle').textContent=p.title;$('photoCaption').textContent=p.id+(photoEvidence?' · 绿色框为 OCR 辅助定位':' · 可使用下方按钮放大并滚动查看');$('originalLink').href=p.src;
 im.alt=p.title;im.onload=()=>{if(version===photoVersion)fitPhoto();};im.onerror=()=>{if(version===photoVersion){status.hidden=false;statusText.textContent='图片加载失败，可重试预览或打开完整图片。';retry.hidden=false;}};
 $('sourceMarker').hidden=!photoEvidence;status.hidden=false;statusText.textContent='正在加载清晰预览…';retry.hidden=true;retry.onclick=()=>showPhoto(id,nodeId);
 if(!$('photoDialog').open)$('photoDialog').showModal();syncScrollLock();
 im.src=p.thumb;if(im.complete&&im.naturalWidth)fitPhoto();
 const medium=new Image();
 medium.onload=()=>{if(version!==photoVersion||!$('photoDialog').open)return;im.onload=()=>{if(version===photoVersion){fitPhoto();status.hidden=true;}};im.src=medium.src;if(im.complete&&im.naturalWidth){fitPhoto();status.hidden=true;}};
 medium.onerror=()=>{if(version===photoVersion){statusText.textContent='清晰预览暂未加载，当前显示缩略图。可重试预览或打开完整图片。';retry.hidden=false;}};
 medium.src=p.preview||p.src;
}
document.addEventListener('click',async ev=>{
 const t=ev.target.closest('button,a');if(!t)return;
 if(t.dataset.section){document.querySelector('.mobile-article-toc')?.removeAttribute('open');if(state.section===t.dataset.section)scrollArticle();}
 if(t.dataset.node){ev.preventDefault();openNode(t.dataset.node);}
 if(t.dataset.domain){ev.preventDefault();navigateDomain(t.dataset.domain);}
 if(t.dataset.close){$(t.dataset.close).close();}
 if(t.dataset.photo){ev.preventDefault();showPhoto(t.dataset.photo,t.dataset.sourceNode);}
 if(t.dataset.expand){if(t.dataset.expand==='true')mindmapInstance?.expandAll();else mindmapInstance?.collapseAll();}
 if(t.hasAttribute('data-clear')){go({q:''},true);$('searchInput')?.focus();}
 if(t.hasAttribute('data-search-all'))go({domain:''});
 if(t.dataset.locate){const n=nodeMap.get(t.dataset.locate);if(n.articleId){openNode(n.id);return;}go({view:'tree',domain:n.domain,q:'',node:''});requestAnimationFrame(()=>requestAnimationFrame(()=>{mindmapInstance?.focusNode(n.id);$('mindmapHost')?.scrollIntoView({block:'nearest'});}));}
 if(t.dataset.copy){try{await navigator.clipboard.writeText(location.href);t.textContent='链接已复制';}catch{t.textContent='请复制浏览器地址栏链接';}}
});
document.addEventListener('input',ev=>{if(ev.target.id!=='searchInput')return;const value=ev.target.value,pos=ev.target.selectionStart;if(state.view==='articles'){go({q:value,article:'',section:''},true);$('searchInput')?.focus();try{$('searchInput')?.setSelectionRange(pos,pos);}catch{}}else if(state.view!=='tree'){go({view:'tree',domain:'',q:value,node:''},true);$('searchInput').focus();try{$('searchInput').setSelectionRange(pos,pos);}catch{}}else{state.q=value;history.replaceState(null,'',href(state));previous={...state};updateTree();}});
$('domainPicker').addEventListener('change',ev=>go({view:state.view==='photos'?'photos':domainView(ev.target.value),domain:ev.target.value,q:'',node:'',article:'',section:''}));
$('detailDialog').addEventListener('close',()=>{cropVersion++;if(readState().node){const next={...readState(),node:''};history.replaceState(null,'',href(next));state=next;previous={...state};document.title=(domainMap.get(state.domain)?.title||'知识树')+' · 计算机基础知识地图';}syncScrollLock();});
$('photoDialog').addEventListener('close',()=>{photoVersion++;syncScrollLock();});
for(const dlg of [$('detailDialog'),$('photoDialog')])dlg.addEventListener('click',ev=>{if(ev.target===dlg){const r=dlg.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dlg.close();}});
$('zoomIn').addEventListener('click',()=>zoom(1.4));$('zoomOut').addEventListener('click',()=>zoom(1/1.4));$('zoomFit').addEventListener('click',fitPhoto);
window.addEventListener('hashchange',render);window.addEventListener('resize',()=>{if($('photoDialog').open)fitPhoto();});
document.addEventListener('keydown',ev=>{if(ev.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){ev.preventDefault();if(!$('searchInput'))go({view:'tree',domain:'',q:''},true);$('searchInput')?.focus();}});
render();
})();
