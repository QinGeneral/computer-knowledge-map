/* Interactive, dependency-free mind map; content stays in native HTML buttons. */
window.createKnowledgeMindmap = function createKnowledgeMindmap(host, options) {
  'use strict';
  const {domains, nodes, domainId, matches, onOpenNode, onOpenDomain}=options;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svg=(path)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
  const symbols={plus:svg('M5 12h14M12 5v14'),minus:svg('M5 12h14'),fit:svg('M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5M8 12h8M12 8v8'),full:svg('M9 3H3v6M15 3h6v6M21 15v6h-6M3 15v6h6')};
  const all=new Map(nodes.map(n=>[n.id,{...n,kind:'concept',detailId:n.id}]));
  const selected=domains.find(d=>d.id===domainId);
  const hitSet=matches===null?null:new Set(matches);
  const included=hitSet?new Set(hitSet):null;
  if(included)for(const id of hitSet){let n=all.get(id);while(n?.parent){included.add(n.parent);n=all.get(n.parent);}}
  const childrenOf=n=>n.children.filter(id=>!included||all.get(id)?.kind!=='concept'||included.has(id));
  const readyDomains=selected?[selected]:domains.filter(d=>!included||d.roots.some(id=>included.has(id)));
  for(const d of readyDomains)all.set('domain:'+d.id,{id:'domain:'+d.id,title:d.title,children:d.roots,parent:'map-root',kind:'domain',domain:d.id});
  const root={id:'map-root',title:selected?.title||'计算机基础知识',children:selected?selected.roots:readyDomains.map(d=>'domain:'+d.id),kind:'root',parent:null};
  all.set(root.id,root);
  const expanded=new Set([root.id]);
  const shownDiagrams=new Set(),diagramScales=new Map();
  if(hitSet)for(const id of all.keys())expanded.add(id);
  else if(selected){const first=root.children.find(id=>all.get(id)?.children.length);if(first&&!window.KnowledgeDiagrams?.get(first)&&all.get(first).children.length<=6)expanded.add(first);}
  const palette=['#267b67','#537aa1','#8d7750','#6c8190','#72895c','#8d6f88','#4d8f94'];
  const colors=new Map();root.children.forEach((id,i)=>{const paint=id=>{colors.set(id,palette[i%palette.length]);all.get(id)?.children.forEach(paint);};paint(id);});
  let disposed=false,frame=0,positions=new Map(),bounds=null,scale=1,pan={x:0,y:0},initial=true,dragged=false,suppressClickUntil=0;
  const controller=new AbortController(),signal=controller.signal;
  host.innerHTML=`<div class="mindmap-shell"><div class="mindmap-viewport" tabindex="0" role="region" aria-label="思维导图画布" aria-describedby="mindmapHelp"><div class="mindmap-stage"><svg class="mindmap-edges" aria-hidden="true"><g></g></svg><div class="mindmap-nodes"></div></div></div><div class="mindmap-caption"><span id="mindmapHelp"><span class="mm-desktop-help">拖动画布移动 · Ctrl / ⌘ + 滚轮缩放</span><span class="mm-touch-help">单指拖动 · 双指缩放</span></span><span class="mm-caption-right"><span class="mm-visible" aria-live="polite"></span><span class="mm-source-help">原图说明随节点呈现</span></span></div><div class="mindmap-controls" aria-label="思维导图显示控制"><button type="button" data-map-action="out" aria-label="缩小导图">${symbols.minus}</button><output class="mm-zoom" aria-label="导图缩放比例">100%</output><button type="button" data-map-action="in" aria-label="放大导图">${symbols.plus}</button><span class="mm-control-divider"></span><button type="button" data-map-action="fit" aria-label="适应画布" title="适应画布">${symbols.fit}</button><button type="button" data-map-action="actual" class="mm-actual" title="原始大小">1:1</button><button type="button" data-map-action="full" aria-label="全屏导图" title="全屏导图">${symbols.full}</button></div></div>`;
  const shell=host.firstElementChild,viewport=shell.querySelector('.mindmap-viewport'),stage=shell.querySelector('.mindmap-stage'),edgeGroup=shell.querySelector('.mindmap-edges g'),nodeLayer=shell.querySelector('.mindmap-nodes');
  const measuring=document.createElement('canvas').getContext('2d');
  const diagramOf=n=>n.kind==='concept'?window.KnowledgeDiagrams?.get(n.id):null;
  const sizeOf=n=>{
    const diagram=diagramOf(n);if(diagram&&shownDiagrams.has(n.id))return {w:diagram.width+24,h:diagram.height+100};
    const caption=diagram?null:n.sourceText,note=diagram?null:n.note;
    const fontSize=n.kind==='root'?20:n.kind==='domain'?15:14;
    measuring.font=`${n.kind==='concept'?'500':'600'} ${fontSize}px ${n.kind==='root'?'"Songti SC", serif':'-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'}`;
    const textWidth=measuring.measureText(n.title).width+(note?20:0);
    const padding=diagram||childrenOf(n).length?(n.kind==='root'?84:66):36;
    let width=Math.min(n.kind==='root'?300:236,Math.max(n.kind==='root'?200:100,Math.ceil(textWidth)+padding));
    if(caption)width=Math.max(width,300);
    const lines=Math.max(1,Math.ceil(textWidth/(width-padding)));
    let captionLines=0;if(caption){measuring.font='400 12px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';let lineWidth=0;captionLines=1;for(const character of caption){const charWidth=measuring.measureText(character).width;if(lineWidth+charWidth>width-padding){captionLines++;lineWidth=charWidth;}else lineWidth+=charWidth;}}
    return {w:width,h:Math.max(n.kind==='root'?60:44,lines*(n.kind==='root'?28:21)+20+(caption?captionLines*18+7:0))};
  };
  function subtree(id){
    const n=all.get(id),children=expanded.has(id)?childrenOf(n).map(subtree):[],size=sizeOf(n);
    return {n,...size,children,span:Math.max(size.h,children.reduce((sum,c)=>sum+c.span,0)+Math.max(0,children.length-1)*18)};
  }
  function layout(){
    const rootSize=sizeOf(root),groups={left:[],right:[]};let left=0,right=0;
    for(const id of expanded.has(root.id)?childrenOf(root):[]){const branch=subtree(id);if(!selected&&left<right){groups.left.push(branch);left+=branch.span+26;}else{groups.right.push(branch);right+=branch.span+26;}}
    const result=new Map([[root.id,{n:root,x:0,y:0,...rootSize,side:0}]]);
    function place(branch,parent,side,center){
      const x=parent.x+side*(parent.w/2+52+branch.w/2);
      const point={n:branch.n,w:branch.w,h:branch.h,x,y:center,side,parent:parent.n.id};result.set(branch.n.id,point);
      let y=center-(branch.children.reduce((s,c)=>s+c.span,0)+Math.max(0,branch.children.length-1)*18)/2;
      for(const child of branch.children){place(child,point,side,y+child.span/2);y+=child.span+18;}
    }
    for(const [side,branches] of [[-1,groups.left],[1,groups.right]]){
      let y=-(branches.reduce((s,c)=>s+c.span,0)+Math.max(0,branches.length-1)*26)/2;
      for(const branch of branches){place(branch,result.get(root.id),side,y+branch.span/2);y+=branch.span+26;}
    }
    positions=result;const pts=[...result.values()];bounds={minX:Math.min(...pts.map(p=>p.x-p.w/2)),maxX:Math.max(...pts.map(p=>p.x+p.w/2)),minY:Math.min(...pts.map(p=>p.y-p.h/2)),maxY:Math.max(...pts.map(p=>p.y+p.h/2))};
  }
  function transform(){
    stage.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${scale})`;
    shell.querySelector('.mm-zoom').textContent=Math.round(scale*100)+'%';
    shell.querySelector('[data-map-action="in"]').disabled=scale>=3;
    shell.querySelector('[data-map-action="out"]').disabled=scale<=.025;
  }
  function fit(readable=false){
    if(!bounds||!viewport.clientWidth)return;
    if(readable&&hitSet&&viewport.clientWidth<900){
      const first=[...positions.values()].find(p=>hitSet.has(p.n.id)&&p.n.sourceText)||[...positions.values()].find(p=>hitSet.has(p.n.id)&&!childrenOf(p.n).length);
      if(first){
        const group=[...positions.values()].filter(p=>hitSet.has(p.n.id)&&p.parent===first.parent);
        const minY=Math.min(...group.map(p=>p.y-p.h/2)),maxY=Math.max(...group.map(p=>p.y+p.h/2));
        const maxW=Math.max(...group.map(p=>p.w));
        scale=Math.min(1,(viewport.clientWidth-32)/maxW,(viewport.clientHeight-100)/(maxY-minY));
        scale=Math.max(.1,scale);pan={x:viewport.clientWidth/2-first.x*scale,y:(viewport.clientHeight-40)/2-(minY+maxY)/2*scale};transform();return;
      }
    }
    scale=Math.min(1,(viewport.clientWidth-76)/(bounds.maxX-bounds.minX),(viewport.clientHeight-90)/(bounds.maxY-bounds.minY));
    const containsDiagram=[...positions.values()].some(p=>diagramOf(p.n));
    scale=Math.max(.025,readable&&!containsDiagram?Math.max(viewport.clientWidth<600?.62:.65,scale):scale);
    const cx=readable&&viewport.clientWidth<600&&!containsDiagram?0:(bounds.minX+bounds.maxX)/2;
    pan={x:viewport.clientWidth/2-cx*scale,y:viewport.clientHeight/2-(bounds.minY+bounds.maxY)/2*scale};transform();
  }
  function zoomTo(next,point={x:viewport.clientWidth/2,y:viewport.clientHeight/2}){
    next=Math.min(3,Math.max(.025,next));pan={x:point.x-(point.x-pan.x)*next/scale,y:point.y-(point.y-pan.y)*next/scale};scale=next;transform();
  }
  function draw(anchorId){
    if(disposed)return;
    const old=positions.get(anchorId),anchor=old?{x:pan.x+old.x*scale,y:pan.y+old.y*scale}:null;
    layout();let edges='';
    nodeLayer.innerHTML=[...positions.values()].map(p=>{
      const {n}=p,children=childrenOf(n),open=expanded.has(n.id),color=colors.get(n.id)||'#176857';
      if(p.parent){const parent=positions.get(p.parent),from={x:parent.x+p.side*parent.w/2,y:parent.y},to={x:p.x-p.side*p.w/2,y:p.y};const bend=Math.abs(to.x-from.x)*.52;
        edges+=`<path d="M ${from.x} ${from.y} C ${from.x+p.side*bend} ${from.y}, ${to.x-p.side*bend} ${to.y}, ${to.x} ${to.y}" stroke="${color}" stroke-width="${parent.n.kind==='root'?2.2:1.5}"/>`;
      }
      const diagram=diagramOf(n);
      if(diagram&&shownDiagrams.has(n.id)){
        const toggle=`<button class="mm-toggle" data-mm-toggle="${n.id}" aria-label="收起${esc(n.title)}的图示及子节点" aria-expanded="true">${symbols.minus}</button>`;
        return `<div class="mm-node mm-concept mm-diagram${hitSet?.has(n.id)?' mm-match':''}" data-mm-id="${n.id}" style="--branch-color:${color};left:${p.x-p.w/2}px;top:${p.y-p.h/2}px;width:${p.w}px;min-height:${p.h}px"><div class="mm-diagram-header"><button class="mm-label" data-mm-toggle="${n.id}" aria-label="收起${esc(n.title)}图示" aria-expanded="true"><span class="mm-title">${esc(n.title)}</span><span class="mm-diagram-subtitle">${esc(diagram.title)}</span></button>${toggle}</div>${diagram.render()}<div class="mm-diagram-footer"><span>原图结构${diagram.interactive===false?'':' · 点击图中条目查看'}</span><button data-mm-open="${n.id}" aria-label="放大${esc(diagram.title)}图示">放大图示</button><button data-photo="${n.photo}">原图对照</button></div></div>`;
      }
      if(diagram){
        return `<div class="mm-node mm-concept mm-diagram-collapsed${hitSet?.has(n.id)?' mm-match':''}" data-mm-id="${n.id}" style="--branch-color:${color};left:${p.x-p.w/2}px;top:${p.y-p.h/2}px;width:${p.w}px;min-height:${p.h}px"><button class="mm-label" data-mm-toggle="${n.id}" aria-label="展开${esc(n.title)}图示" aria-expanded="false"><span class="mm-title">${esc(n.title)}</span></button><button class="mm-toggle" data-mm-toggle="${n.id}" aria-label="展开${esc(n.title)}的图示及子节点" aria-expanded="false" title="展开图示${children.length?'及 '+children.length+' 个子节点':''}">${symbols.plus}</button></div>`;
      }
      const nodeText=`<span class="mm-title">${esc(n.title)}${n.note?'<span class="mm-note-indicator" title="含整理说明，可在详情中核对" aria-label="含整理说明">i</span>':''}</span>${n.sourceText?`<span class="mm-description" id="mm-desc-${n.id}">${esc(n.sourceText)}</span>`:''}`;
      const title=n.kind==='concept'?`<button class="mm-label" data-mm-open="${n.id}" aria-label="查看${esc(n.title)}" ${n.sourceText?`aria-describedby="mm-desc-${n.id}"`:''}>${nodeText}</button>`:n.kind==='domain'?`<button class="mm-label" data-mm-domain="${n.domain}" aria-label="进入${esc(n.title)}">${nodeText}</button>`:`<span class="mm-label">${nodeText}</span>`;
      return `<div class="mm-node mm-${n.kind}${n.sourceText?' mm-annotated':''}${hitSet?.has(n.id)?' mm-match':''}${p.side<0?' mm-left':''}" data-mm-id="${n.id}" style="--branch-color:${color};left:${p.x-p.w/2}px;top:${p.y-p.h/2}px;width:${p.w}px;min-height:${p.h}px">${title}${children.length?`<button class="mm-toggle" data-mm-toggle="${n.id}" aria-label="${open?'收起':'展开'}${esc(n.title)}的分支" aria-expanded="${open}" title="${open?'收起':'展开'} ${children.length} 个子分支">${open?symbols.minus:`<span>${children.length}</span>`}</button>`:''}</div>`;
    }).join('');
    edgeGroup.innerHTML=edges;shell.querySelector('.mm-visible').textContent=`显示 ${positions.size-1} 个节点`;
    if(initial){initial=false;fit(true);}else if(anchor){const p=positions.get(anchorId);pan={x:anchor.x-p.x*scale,y:anchor.y-p.y*scale};transform();}else transform();
  }
  function toggle(id){
    const diagram=diagramOf(all.get(id));
    if(diagram){
      const opening=!shownDiagrams.has(id);
      if(opening){diagramScales.set(id,scale);shownDiagrams.add(id);expanded.add(id);}
      else{shownDiagrams.delete(id);expanded.delete(id);}
      draw(id);
      const point=positions.get(id);
      if(opening)frameDiagram(point);
      else if(point)zoomTo(diagramScales.get(id)||1,{x:pan.x+point.x*scale,y:pan.y+point.y*scale});
    }else{if(expanded.has(id))expanded.delete(id);else expanded.add(id);draw(id);}
  }
  function frameDiagram(point){
    if(!point)return;
    scale=Math.max(.025,Math.min(1,(viewport.clientWidth-48)/point.w,(viewport.clientHeight-80)/point.h));
    pan={x:viewport.clientWidth/2-point.x*scale,y:(viewport.clientHeight-30)/2-point.y*scale};transform();
  }
  function focusNode(id){
    const n=all.get(id);if(!n)return;
    const path=[];let p=n;while(p){path.push(p.id);p=all.get(p.parent);}
    expanded.add(root.id);expanded.add('domain:'+n.domain);path.forEach(p=>expanded.add(p));
    if(diagramOf(n)){diagramScales.set(id,scale);shownDiagrams.add(id);}
    draw();const point=positions.get(id);if(!point)return;
    if(diagramOf(n))frameDiagram(point);
    else{scale=Math.max(.85,Math.min(scale,1.2));pan={x:viewport.clientWidth/2-point.x*scale,y:viewport.clientHeight/2-point.y*scale};transform();}
    const element=nodeLayer.querySelector(`[data-mm-id="${id}"]`);element?.classList.add('mm-located');element?.querySelector('button')?.focus({preventScroll:true});
  }
  shell.addEventListener('click',async ev=>{
    if(dragged){dragged=false;if(performance.now()<suppressClickUntil&&ev.detail!==0){ev.preventDefault();ev.stopPropagation();return;}}
    const b=ev.target.closest('button');if(!b)return;
    if(b.dataset.mmOpen)onOpenNode(b.dataset.mmOpen);
    if(b.dataset.mmDomain)onOpenDomain(b.dataset.mmDomain);
    if(b.dataset.mmToggle){const id=b.dataset.mmToggle;toggle(id);nodeLayer.querySelector(`[data-mm-toggle="${id}"]`)?.focus({preventScroll:true});}
    switch(b.dataset.mapAction){case'in':zoomTo(scale*1.25);break;case'out':zoomTo(scale/1.25);break;case'fit':fit();break;case'actual':zoomTo(1);break;case'full':if(document.fullscreenElement===shell)await document.exitFullscreen();else if(shell.requestFullscreen)await shell.requestFullscreen();break;}
  },{signal});
  const pointers=new Map();let gesture=null;
  const local=ev=>{const r=viewport.getBoundingClientRect();return{x:ev.clientX-r.left,y:ev.clientY-r.top};};
  function startGesture(){
    const points=[...pointers.values()];if(points.length>=2){const [a,b]=points,mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};gesture={kind:'pinch',distance:Math.hypot(a.x-b.x,a.y-b.y),scale,world:{x:(mid.x-pan.x)/scale,y:(mid.y-pan.y)/scale}};}
    else if(points.length)gesture={kind:'pan',from:{...points[0]},pan:{...pan}};else gesture=null;
  }
  viewport.addEventListener('pointerdown',ev=>{
    if(ev.button!==0||ev.pointerType==='mouse'&&ev.target.closest('button,a'))return;
    pointers.set(ev.pointerId,local(ev));dragged=false;startGesture();
    if(!ev.target.closest('button,a'))viewport.setPointerCapture(ev.pointerId);
  },{signal});
  viewport.addEventListener('pointermove',ev=>{
    if(!pointers.has(ev.pointerId)||!gesture)return;pointers.set(ev.pointerId,local(ev));
    if(gesture.kind==='pinch'&&pointers.size>=2){const [a,b]=[...pointers.values()],next=Math.min(3,Math.max(.025,gesture.scale*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(gesture.distance,1)));scale=next;pan={x:(a.x+b.x)/2-gesture.world.x*next,y:(a.y+b.y)/2-gesture.world.y*next};dragged=true;}
    else{const point=local(ev),dx=point.x-gesture.from.x,dy=point.y-gesture.from.y;if(!dragged&&Math.hypot(dx,dy)<5)return;dragged=true;pan={x:gesture.pan.x+dx,y:gesture.pan.y+dy};}
    suppressClickUntil=performance.now()+300;viewport.classList.add('mm-dragging');viewport.setPointerCapture(ev.pointerId);transform();
  },{signal});
  for(const type of ['pointerup','pointercancel'])viewport.addEventListener(type,ev=>{pointers.delete(ev.pointerId);if(dragged)suppressClickUntil=performance.now()+80;if(viewport.hasPointerCapture(ev.pointerId))viewport.releasePointerCapture(ev.pointerId);viewport.classList.remove('mm-dragging');startGesture();if(type==='pointercancel')dragged=false;},{signal});
  viewport.addEventListener('wheel',ev=>{ev.preventDefault();if(ev.ctrlKey||ev.metaKey)zoomTo(scale*Math.exp(-ev.deltaY*.008),local(ev));else{pan.x-=ev.deltaX;pan.y-=ev.deltaY;transform();}},{passive:false,signal});
  viewport.addEventListener('keydown',ev=>{
    if(ev.target!==viewport)return;const deltas={ArrowLeft:[55,0],ArrowRight:[-55,0],ArrowUp:[0,55],ArrowDown:[0,-55]};
    if(deltas[ev.key]){ev.preventDefault();pan.x+=deltas[ev.key][0];pan.y+=deltas[ev.key][1];transform();}
    if(ev.key==='+'||ev.key==='='){ev.preventDefault();zoomTo(scale*1.25);}if(ev.key==='-'){ev.preventDefault();zoomTo(scale/1.25);}if(ev.key==='Home'||ev.key==='0'){ev.preventDefault();fit();}
  },{signal});
  let lastSize={width:viewport.clientWidth,height:viewport.clientHeight};
  const resize=new ResizeObserver(()=>{if(disposed)return;const width=viewport.clientWidth,height=viewport.clientHeight;if(initial)draw();else if((lastSize.width<900)!==(width<900)){fit(true);}else{pan.x+=(width-lastSize.width)/2;pan.y+=(height-lastSize.height)/2;transform();}lastSize={width,height};});resize.observe(viewport);
  frame=requestAnimationFrame(()=>draw());
  return {
    expandAll(){for(const [id,n] of all){expanded.add(id);if(diagramOf(n))shownDiagrams.add(id);}draw(root.id);fit();},
    collapseAll(){expanded.clear();shownDiagrams.clear();diagramScales.clear();expanded.add(root.id);draw();fit(true);},
    focusNode,
    destroy(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();controller.abort();},
  };
};
