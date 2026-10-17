/* Source-faithful vector diagrams. Linked labels use live node IDs. */
window.KnowledgeDiagrams = (() => {
  'use strict';
  const nodes=new Map(window.KNOWLEDGE_DATA.nodes.map(n=>[n.id,n]));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const get=id=>nodes.get(id);
  const child=(n,title)=>n.children.map(get).find(c=>c.title===title);
  const text=(x,y,label,cls='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="middle" dominant-baseline="middle">${esc(label)}</text>`;
  const cell=(x,y,w,h,label,n,blue=false)=>{
    const body=`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${blue?'kd-blue':'kd-cell'}"/>${text(x+w/2,y+h/2,label,blue?'kd-white':'')}`;
    return n?link(n,body):body;
  };
  const wire=d=>`<path d="${d}" class="kd-wire"/>`;
  const frame=(w,h,label,body)=>`<svg class="knowledge-diagram" viewBox="0 0 ${w} ${h}" role="group" aria-label="${label}"><title>${label}</title>${body}</svg>`;
  const link=(n,body)=>n?`<a href="#view=tree&amp;domain=${n.domain}&amp;node=${n.id}" data-node="${n.id}" aria-label="查看${esc(n.title)}" class="kd-link">${body}</a>`:body;
  const lines=(x,y,labels,cls='')=>labels.map((label,i)=>text(x,y+i*16,label,cls)).join('');
  const multilineCell=(x,y,w,h,labels,n,blue=false)=>link(n,cell(x,y,w,h,'',null,blue)+lines(x+w/2,y+h/2-(labels.length-1)*8,labels,blue?'kd-white kd-small':'kd-small'));
  const flow=(points)=>{
    const last=points[points.length-1],prev=points[points.length-2],angle=Math.atan2(last[1]-prev[1],last[0]-prev[0]);
    const ax=last[0]-7*Math.cos(angle),ay=last[1]-7*Math.sin(angle);
    return wire(points.map((p,i)=>`${i?'L':'M'} ${p[0]} ${p[1]}`).join(' '))+`<polygon points="${last[0]},${last[1]} ${ax-3*Math.sin(angle)},${ay+3*Math.cos(angle)} ${ax+3*Math.sin(angle)},${ay-3*Math.cos(angle)}" class="kd-arrow-tip"/>`;
  };
  function kernel(){
    // These source-photo labels remain in the drawing after their duplicate tree branch was removed.
    const sys={title:'系统调用子系统'};
    const proc={title:'进程管理子系统',labels:['调度','任务管理','同步','CPU']};
    const mem={title:'内存管理子系统'};
    const file={title:'文件子系统',labels:['VFS','缓存','文件系统']};
    const net={title:'网络子系统',labels:['套接字','协议栈','网络设备']};
    const dev={title:'设备子系统',labels:['字符设备','块设备']};
    let b=['应用 A','应用 B','应用 C'].map((title,i)=>cell(20+i*248,12,224,38,title,null,true)).join('');
    b+=`<rect x="20" y="76" width="720" height="468" class="kd-outline"/>${text(380,96,'内核','kd-section')}`;
    b+=wire('M 132 50 V 116 M 380 50 V 82 M 380 108 V 116 M 628 50 V 116');
    b+=cell(42,116,676,36,sys.title,null,true);
    b+=wire('M 139 152 V 182 M 380 152 V 182 M 620 152 V 182');
    b+=wire('M 512 152 V 422 M 238 270 H 258 M 502 270 H 522');
    b+=`<rect x="42" y="182" width="196" height="148" class="kd-outline"/>`+text(140,205,proc.title,'kd-section');
    proc.labels.forEach((title,i)=>{b+=cell(55+(i%2)*87,226+Math.floor(i/2)*43,80,32,title,null,true);});
    b+=`<rect x="258" y="182" width="244" height="176" class="kd-outline"/>`+text(380,205,mem.title,'kd-section');
    const memoryOrder=['虚拟内存','内存映射','页表','物理内存','swap','伙伴','slab'];
    memoryOrder.forEach((title,i)=>{b+=i<4?cell(270+(i%2)*116,226+Math.floor(i/2)*36,106,28,title,null,true):cell(270+(i-4)*77,298,69,28,title,null,true);});
    b+=`<rect x="522" y="182" width="196" height="176" class="kd-outline"/>`+text(620,205,file.title,'kd-section');
    file.labels.forEach((title,i)=>{b+=cell(564,229+i*38,112,29,title,null,true);});
    b+=wire('M 620 358 V 399 H 195 V 422 M 541 399 V 422');
    b+=`<rect x="42" y="422" width="306" height="96" class="kd-outline"/>`+text(195,444,net.title,'kd-section');
    net.labels.forEach((title,i)=>{b+=cell(55+i*96,466,88,31,title,null,true);});
    b+=`<rect x="380" y="422" width="338" height="96" class="kd-outline"/>`+text(549,444,dev.title,'kd-section');
    dev.labels.forEach((title,i)=>{b+=cell(411+i*142,466,134,31,title,null,true);});
    return frame(760,558,'应用与内核结构图',b);
  }
  function processes(){
    const root=get('os-c54be2eeac'),program=child(root,'程序到进程'),list=child(root,'进程列表');
    const code=child(program,'代码段'),data=child(program,'数据段'),unloaded=child(program,'不加载到内存');
    const rows=[child(program,'ELF Header'),child(program,'Segment Header Table'),...code.children.map(get),...data.children.map(get),...unloaded.children.map(get)];
    let b=cell(175,14,160,38,'程序',program,true)+cell(525,14,160,38,'进程',list,true);
    rows.forEach((n,i)=>{b+=cell(115,80+i*46,280,46,n.title,n);});
    function brace(y,h,label,n){
      b+=wire(`M 107 ${y} H 98 V ${y+h} H 107`);
      b+=cell(8,y+h/2-23,80,46,label,n,true)+wire(`M 88 ${y+h/2} H 98`);
    }
    brace(172,92,'代码段',code);brace(264,92,'数据段',data);
    b+=wire('M 107 356 H 98 V 494 H 107 M 88 425 H 98');
    b+=`<a href="#view=tree&amp;domain=os&amp;node=${unloaded.id}" data-node="${unloaded.id}" aria-label="查看不加载到内存" class="kd-link"><rect x="8" y="399" width="80" height="52" class="kd-blue"/>${text(48,417,'不加载','kd-white')}${text(48,436,'到内存','kd-white')}</a>`;
    const h=414/8,x=465,w=280;
    b+=cell(x,80,w,h,list.title,list);
    const pairs=[['任务 ID','亲缘关系'],['任务状态','权限'],['运行统计','调度相关']];
    pairs.forEach((row,i)=>row.forEach((title,j)=>{b+=cell(x+j*w/2,80+(i+1)*h,w/2,h,title,child(list,title));}));
    ['信号处理','内存管理','文件与文件系统','内核栈'].forEach((title,i)=>{b+=cell(x,80+(i+4)*h,w,h,title,child(list,title));});
    return frame(780,516,'程序与进程管理结构图',b);
  }
  function memory(){
    const root=get('os-ae1536a5fa'),space=child(root,'进程地址空间'),mapping=child(root,'虚拟内存与物理内存');
    const virtual=child(mapping,'虚拟内存'),physical=child(mapping,'物理内存'),pages=child(mapping,'页'),entries=child(mapping,'页表项');
    const linked=(n,body)=>`<a href="#view=tree&amp;domain=os&amp;node=${n.id}" data-node="${n.id}" aria-label="查看${esc(n.title)}" class="kd-link">${body}</a>`;
    const arrow=(x1,y1,x2,y2)=>{
      const angle=Math.atan2(y2-y1,x2-x1),len=8,half=3.5;
      const ax=x2-len*Math.cos(angle),ay=y2-len*Math.sin(angle);
      return wire(`M ${x1} ${y1} L ${x2} ${y2}`)+`<polygon points="${x2},${y2} ${ax-half*Math.sin(angle)},${ay+half*Math.cos(angle)} ${ax+half*Math.sin(angle)},${ay-half*Math.cos(angle)}" class="kd-arrow-tip"/>`;
    };
    const growth=(x,y,up=false)=>`<path d="M ${x} ${y} v ${up?-23:23}" class="kd-growth"/><path d="M ${x-8} ${y+(up?-16:16)} L ${x} ${y+(up?-27:27)} L ${x+8} ${y+(up?-16:16)} Z" class="kd-growth-tip"/>`;
    let b=linked(space,text(170,23,'进程地址空间','kd-section'));
    b+=`<rect x="80" y="50" width="180" height="480" class="kd-cell"/>`;
    b+=linked(child(space,'内核态'),text(35,101,'内核态'))+linked(child(space,'用户态'),text(35,142,'用户态'))+wire('M 5 120 H 282');
    b+=cell(80,145,180,70,'',null,true)+linked(child(space,'Stack 栈'),text(170,162,'Stack 栈','kd-white')+growth(170,179));
    b+=cell(80,245,180,70,'',null,true)+linked(child(space,'mmap 内存映射区'),text(170,263,'mmap 内存映射区','kd-white')+growth(170,280));
    b+=cell(80,345,180,70,'',null,true)+linked(child(space,'堆'),text(170,399,'堆','kd-white')+growth(170,382,true));
    ['BSS 区域','Data 区域','Text 区域'].forEach((title,i)=>{b+=cell(80,435+i*27,180,27,title,child(space,title),true);});
    b+='<path d="M 80 462 H 260 M 80 489 H 260" stroke="#d3e1e8" stroke-width=".7"/>';
    const vy=50,ph=40,virtualRows=[3,6,9,10],physicalRows=[2,4,7,9],entryRows=[3,5,7,9];
    function pageColumn(x,n,filled){
      for(let i=0;i<12;i++)b+=cell(x,vy+i*ph,100,ph,i===0?'页 N':i===11?'页 0':'',i===0?child(pages,'页 N'):i===11?child(pages,'页 0'):filled.includes(i)?n:null,filled.includes(i));
      b+=linked(n,text(x+50,557,n.title,'kd-section'));
    }
    pageColumn(330,virtual,virtualRows);pageColumn(745,physical,physicalRows);
    for(let i=0;i<12;i++)b+=cell(530,170+i*25,110,25,i===0?'页表项 N':i===11?'页表项 0':'',i===0?child(entries,'页表项 N'):i===11?child(entries,'页表项 0'):entryRows.includes(i)?entries:null,entryRows.includes(i));
    b+=linked(child(mapping,'内存映射'),text(585,497,'内存映射','kd-section'));
    // Four illustrated mappings, preserving the crossed connections in the source.
    [[3,3,7],[6,5,9],[9,9,4],[10,7,2]].forEach(([v,e,p])=>{b+=linked(child(mapping,'内存映射'),arrow(434,vy+v*ph+20,526,170+e*25+12.5)+arrow(644,170+e*25+12.5,741,vy+p*ph+20));});
    b+=`<path d="M 965 245 V 450 A 65 20 0 0 0 1095 450 V 245" class="kd-cell"/><ellipse cx="1030" cy="245" rx="65" ry="20" class="kd-cell"/>`;
    [268,338,408].forEach(y=>{b+=`<rect x="990" y="${y}" width="30" height="34" class="kd-blue"/><rect x="1043" y="${y+8}" width="30" height="34" class="kd-cell"/>`;});
    b+=linked(child(mapping,'换出'),arrow(850,150,981,276)+text(913,193,'换出'));
    b+=linked(child(mapping,'换入'),arrow(980,349,850,230)+text(914,274,'换入'));
    b+=linked(child(mapping,'文件映射'),arrow(850,350,981,420)+text(914,359,'文件映射'));
    return frame(1110,580,'内存管理：进程地址空间、页表映射与换入换出',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-memory"');
  }
  function filesystem(){
    const root=get('os-fd706d7a38'),calls=child(root,'系统调用'),opened=child(root,'进程打开的文件'),sub=child(root,'文件子系统'),vfs=child(root,'虚拟文件系统 VFS'),access=get('os-f9f522de10');
    const file=child(sub,'struct file'),dentry=child(vfs,'struct dentry'),inode=child(vfs,'struct inode'),cache=child(access,'Page Cache'),block=child(access,'通用块设备层'),schedule=child(access,'块设备 I/O 调度层'),driver=child(access,'块设备驱动程序'),disk=child(access,'硬盘设备');
    const types=child(root,'文件系统类型'),ext4=child(root,'ext4 文件系统');
    let b='';
    ['进程 A','进程 B'].forEach((title,i)=>{
      const n=child(opened,title),x=20+i*245;
      b+=`<rect x="${x}" y="20" width="225" height="96" class="kd-outline"/>`+link(n,text(x+112.5,43,title,'kd-section'));
      b+=cell(x+18,68,78,30,'fd',child(n,'fd'),true)+cell(x+115,68,92,30,'缓存',child(n,'缓存'),true);
      b+=`<rect x="${x}" y="278" width="225" height="82" class="kd-outline"/>`+text(x+112.5,300,title+' 打开的文件');
      b+=cell(x+18,322,189,26,'文件描述符',child(opened,'文件描述符'),true);
    });
    b+=wire('M 20 132 H 500')+text(530,116,'用户态')+text(530,151,'内核态');
    b+=cell(20,170,470,90,'',null,true)+link(calls,text(255,190,'系统调用','kd-white kd-section'));
    calls.children.forEach((id,i)=>{const n=get(id);b+=cell(36+i*151,216,135,28,n.title,n);});
    b+=`<rect x="20" y="376" width="470" height="94" class="kd-outline"/>`+link(sub,text(255,397,'文件子系统','kd-section'));
    b+=multilineCell(36,419,182,35,['打开的文件','struct file'],file,true)+cell(282,419,192,35,'file operation',child(file,'file operation'),true)+flow([[220,436.5],[279,436.5]]);
    b+=`<rect x="20" y="486" width="470" height="143" class="kd-outline"/>`+link(vfs,text(255,507,'虚拟文件系统 VFS','kd-section'));
    [[dentry,'文件夹','dir operation'],[inode,'文件','inode operation']].forEach(([n,label,op],i)=>{
      const y=531+i*48;b+=multilineCell(36,y,182,35,[label,n.title],n,true)+cell(282,y,192,35,op,child(n,op),true)+flow([[220,y+17.5],[279,y+17.5]]);
    });
    types.children.forEach((id,i)=>{const n=get(id);b+=cell(20+i*165,646,140,34,n.title,n);});
    b+=`<rect x="20" y="696" width="470" height="68" class="kd-outline"/>`+link(cache,text(255,717,'Page Cache','kd-section'))+cell(203,737,104,22,'缓存',cache);
    b+=cell(20,780,470,34,'通用块设备层',block,true)+cell(20,830,470,34,'块设备 I/O 调度层',schedule,true)+cell(20,880,470,34,'块设备驱动程序',driver,true);
    b+=cell(20,930,470,66,'',null,true)+cell(70,939,370,25,'ext4 文件系统',ext4)+link(disk,text(255,980,'硬盘设备','kd-white'));
    return frame(580,1010,'文件系统：文件访问层次',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-filesystem"');
  }
  function blockDeviceAccess(){
    const fs=get('os-fd706d7a38'),io=get('os-386a7d0298'),vfs=child(io,'虚拟文件系统'),access=child(io,'块设备访问路径');
    const file=child(child(fs,'文件子系统'),'struct file'),inode=child(child(fs,'虚拟文件系统 VFS'),'struct inode');
    const address=child(access,'struct address_space'),cache=child(access,'Page Cache'),block=child(access,'通用块设备层'),schedule=child(access,'块设备 I/O 调度层'),driver=child(access,'块设备驱动程序'),disk=child(access,'硬盘设备');
    const diskInode=child(child(fs,'ext4 文件系统'),'inode'),diskBlock=child(diskInode,'Block'),sector=child(diskBlock,'sector');
    let b='';
    // The second panel reproduces the source's VFS/cache/BIO/queue/device drawing.
    b+=`<rect x="590" y="20" width="510" height="238" class="kd-outline"/>`+link(vfs,text(845,42,'虚拟文件系统','kd-section'));
    b+=`<rect x="608" y="65" width="474" height="90" class="kd-outline"/>`+link(file,text(845,84,'struct file','kd-section'));
    b+=cell(625,108,175,30,'struct inode',inode)+cell(815,108,248,30,'struct address_space',address,true);
    for(let i=0;i<5;i++){
      const x=625+i*91;b+=flow([[940,140],[x+40,191]])+multilineCell(x,194,80,44,['Page','Cache'],cache,true);
    }
    b+=`<rect x="590" y="278" width="510" height="96" class="kd-outline"/>`+link(block,text(845,352,'通用块设备层','kd-section'));
    for(let i=0;i<5;i++)b+=cell(608+i*98,292,86,28,'BIO',child(block,'BIO'),true);
    [[0,1],[1,0],[2,3],[3,2],[4,4]].forEach(([a,c])=>{b+=flow([[665+a*91,240],[651+c*98,289]]);});
    b+=`<rect x="590" y="390" width="510" height="158" class="kd-outline"/>`+link(schedule,text(845,412,'块设备 I/O 调度层','kd-section'));
    b+=cell(780,433,130,25,'调度算法',child(schedule,'调度算法'),true)+cell(610,471,470,59,'',null,true)+link(child(schedule,'I/O 请求队列'),text(845,484,'I/O 请求队列','kd-white'));
    for(let i=0;i<5;i++){const x=623+i*91;b+=cell(x,503,72,17,'',child(schedule,'I/O 请求队列'));if(i<4)b+=flow([[x+73,511.5],[x+90,511.5]]);}
    b+=cell(590,566,510,32,'设备驱动程序',driver,true)+flow([[845,600],[845,615]]);
    b+=`<path d="M 590 640 V 881 A 255 25 0 0 0 1100 881 V 640" class="kd-outline"/><ellipse cx="845" cy="640" rx="255" ry="25" class="kd-cell"/>`+link(disk,text(845,640,'硬盘设备','kd-section'));
    b+=multilineCell(610,741,105,60,['文件','inode'],diskInode);
    b+=flow([[625,123],[566,123],[566,771],[607,771]])+wire('M 715 771 H 755 M 755 707 V 851');
    for(let i=0;i<3;i++){
      const y=692+i*72;b+=wire(`M 755 ${y+15} H 800`)+cell(800,y,100,30,'Block',diskBlock)+wire(`M 900 ${y+15} H 947 M 947 ${y-3} V ${y+23} M 947 ${y-3} H 1000 M 947 ${y+23} H 1000`);
      for(let j=0;j<2;j++)b+=cell(1000,y-14+j*26,80,22,'sector',sector,true);
    }
    return `<g transform="translate(-570 0)">${b}</g>`;
  }
  function inputOutput(){
    const root=get('os-386a7d0298'),user=child(root,'用户进程'),calls=child(user,'open / read / write / ioctl');
    let b=cell(50,30,350,95,'用户进程',user,true)+cell(50,125,350,50,'文件系统接口',child(root,'文件系统接口'),true);
    b+=`<rect x="50" y="175" width="350" height="170" class="kd-outline"/>`;
    b+=cell(90,175,270,54,'虚拟文件系统',child(root,'虚拟文件系统'),true)+link(child(root,'操作系统'),text(225,266,'操作系统','kd-section'))+cell(90,291,270,54,'块设备',child(root,'块设备'),true);
    ['设备驱动程序','中断处理器','设备控制器','硬件'].forEach((title,i)=>{b+=cell(50,345+i*55,350,55,title,child(root,title),true);});
    b+=link(calls,`<text x="440" y="78" dominant-baseline="middle">open, read, write, ioctl</text>`);
    [['虚拟文件系统',202],['设备驱动程序',372.5],['中断处理器',427.5],['设备控制器',482.5],['硬件',537.5]].forEach(([title,y])=>{
      const n=child(root,title);b+=link(n,`<text x="440" y="${y}" dominant-baseline="middle">${esc(n.sourceText.replace(/。$/,''))}</text>`);
    });
    b+='<path d="M 50 125 H 400 M 50 175 H 400 M 50 345 H 400 M 50 400 H 400 M 50 455 H 400 M 50 510 H 400" stroke="#d3e1e8" stroke-width=".7"/>';
    // Preserve the photo's expanded device path at left and the I/O layers at right.
    b=blockDeviceAccess()+`<g transform="translate(610 95)">${b}</g>`;
    const connections=[
      ['虚拟文件系统',[[700,297],[530,100]],'虚拟文件系统层 → 展开的虚拟文件系统'],
      ['块设备',[[700,413],[530,420]],'块设备 → 块设备 I/O 调度层'],
      ['设备驱动程序',[[660,467.5],[530,582]],'设备驱动程序 → 展开的设备驱动程序'],
      ['设备控制器',[[660,577.5],[275,615]],'设备控制器 → 硬盘设备控制入口'],
      ['硬件',[[660,632.5],[530,830]],'硬件 → 硬盘设备'],
    ];
    connections.forEach(([title,points,label])=>b+=link(child(root,title),`<g class="kd-cross-connection"><title>${esc(label)}</title><path d="${points.map((p,i)=>`${i?'L':'M'} ${p[0]} ${p[1]}`).join(' ')}" class="kd-connection-hit"/>${flow(points)}</g>`));
    b+=text(790,938,'箭头按原图连接展开结构与输入输出各层；点击连线可查看对应条目。','kd-small');
    return frame(1580,960,'输入输出系统：虚拟文件系统、块设备访问路径及分层交互',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-io"');
  }
  function network(){
    const root=get('os-f9054458bc'),a=child(root,'Linux 服务器 A'),bhost=child(root,'Linux 服务器 B'),router=child(root,'Linux 服务器作路由器'),sw=child(root,'交换机');
    const http=child(root,'HTTP 报文'),httpHeader=child(http,'HTTP header'),httpBody=child(http,'HTTP body');
    const headerNodes={'MAC':child(root,'MAC header'),'IP':child(root,'IP header'),'TCP':child(root,'TCP header'),'HTTP':httpHeader};
    let b='';
    const packet=(x,y,headers)=>{
      let out='';for(const name of headers){out+=multilineCell(x,y,70,42,[name,'header'],headerNodes[name],true);x+=70;}
      return out+cell(x,y,100,42,'HTTP body',httpBody);
    };
    function server(x,host,receive){
      b+=`<rect x="${x}" y="20" width="440" height="440" class="kd-outline"/>`+link(host,text(x+220,43,host.title,'kd-section'));
      const apps=receive?['nginx','tomcat']:['Firefox','Chrome'];
      apps.forEach((title,i)=>{b+=cell(x+30+i*105,68,95,28,title,child(host,title));});
      b+=packet(x+250,68,['HTTP']);
      b+=`<path d="M ${x} 154 H ${x+440}" class="kd-wire" stroke-dasharray="3 3"/>`+text(x+45,135,'用户态')+text(x+45,176,'内核态');
      b+=cell(x+120,138,95,28,'socket',child(host,'socket'));
      b+=packet(x+180,220,['TCP','HTTP'])+packet(x+110,298,['IP','TCP','HTTP'])+packet(x+40,386,['MAC','IP','TCP','HTTP']);
      if(!receive){
        b+=flow([[x+77.5,96],[x+77.5,120],[x+145,120],[x+145,138]])+flow([[x+182.5,96],[x+182.5,120],[x+185,120],[x+185,138]]);
        b+=flow([[x+167.5,166],[x+167.5,190],[x+215,190],[x+215,220]])+flow([[x+180,241],[x+145,241],[x+145,298]])+flow([[x+110,319],[x+75,319],[x+75,386]])+flow([[x+75,428],[x+75,460]]);
        b+=cell(x+35,460,80,36,'eth0',child(host,'eth0'));
      }else{
        b+=flow([[x+145,138],[x+145,120],[x+77.5,120],[x+77.5,96]])+flow([[x+185,138],[x+185,120],[x+182.5,120],[x+182.5,96]]);
        b+=flow([[x+215,220],[x+215,190],[x+167.5,190],[x+167.5,166]])+flow([[x+145,298],[x+145,241],[x+180,241]])+flow([[x+75,386],[x+75,319],[x+110,319]])+flow([[x+380,460],[x+380,444],[x+75,444],[x+75,428]]);
        b+=cell(x+340,460,80,36,'eth0',child(host,'eth0'));
      }
    }
    server(10,a,false);server(980,bhost,true);
    b+=`<rect x="505" y="20" width="420" height="440" class="kd-outline"/>`+link(router,text(715,43,'Linux 服务器作路由器','kd-section'));
    b+=`<path d="M 505 154 H 925" class="kd-wire" stroke-dasharray="3 3"/>`+text(550,135,'用户态')+text(550,176,'内核态');
    b+=packet(525,386,['MAC','IP','TCP','HTTP'])+packet(665,310,['TCP','HTTP']);
    b+=multilineCell(595,246,70,42,['IP','header'],child(router,'IP header'),true)+cell(755,216,100,40,'路由表',child(router,'路由表'),true);
    b+=flow([[570,460],[570,442],[560,442],[560,428]])+flow([[560,386],[560,325],[630,325],[630,288]])+flow([[630,246],[630,236],[755,236]])+flow([[855,236],[914,236],[914,442],[870,442],[870,460]]);
    b+=cell(530,460,80,36,'eth0',child(router,'eth0'))+cell(830,460,80,36,'eth1',child(router,'eth1'));
    function switchBox(x){
      b+=`<rect x="${x}" y="540" width="450" height="160" class="kd-outline"/>`+link(sw,text(x+225,560,'交换机','kd-section'));
      b+=multilineCell(x+22,580,70,38,['MAC','header'],headerNodes.MAC,true)+packet(x+92,626,['IP','TCP','HTTP']);
      b+=flow([[x+40,700],[x+40,650],[x+57,650],[x+57,618]])+flow([[x+92,599],[x+430,599],[x+430,700]]);
      b+=cell(x,700,80,36,'eth0',child(sw,'eth0'))+cell(x+370,700,80,36,'eth1',child(sw,'eth1'));
    }
    switchBox(160);switchBox(800);
    b+=flow([[85,496],[85,718],[160,718]])+flow([[610,718],[670,718],[670,510],[570,510],[570,496]])+flow([[870,496],[870,518],[760,518],[760,718],[800,718]])+flow([[1250,718],[1360,718],[1360,496]]);
    return frame(1440,760,'网络通信：服务器、交换机、路由器与报文封装路径',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-network"');
  }
  function operatingStages(){
    let b=cell(20,35,125,570,'',null,true);
    [...'如何把一家软件公司做上市'].forEach((character,i)=>{b+=text(61,105+i*36,character,'kd-white kd-workflow-title');});
    b+='<text x="110" y="105" class="kd-white kd-workflow-sub" style="writing-mode:vertical-rl;text-orientation:mixed">（Linux 操作系统的工作流程）</text>';
    b+=wire('M 145 345 H 245 M 195 105 V 552.5 M 195 105 H 245 M 195 552.5 H 245');
    const stages=[{"title": "初创期", "y": 35, "h": 140, "center": 105, "rows": ["要有开放的营商环境（x86 体系结构）。", "创建一家软件外包公司（系统初始化）。", "公司初创没员工，老板亲自接项目（实模式）。"]}, {"title": "发展期", "y": 235, "h": 220, "center": 345, "rows": ["公司慢慢做大，项目越接越多（保护模式和多进程）。", "建立项目管理体系（进程管理）。", "建立会议室管理体系（内存管理）。", "建立文档资料管理体系（文件系统）。", "建立售前售后体系（输入输出设备管理）。"]}, {"title": "壮大期", "y": 500, "h": 105, "center": 552.5, "rows": ["公司内部项目合作（进程间通信）。", "外部公司合作（网络通信）。"]}];
    let number=1;
    stages.forEach(({title,y,h,center,rows})=>{
      b+=cell(245,center-20,130,40,title,null,true)+wire(`M 375 ${center} H 425`);
      b+=`<rect x="425" y="${y}" width="650" height="${h}" class="kd-outline"/>`;
      rows.forEach((label,i)=>{
        const baseline=y+32+i*36;
        b+=`<text x="445" y="${baseline}" class="kd-workflow-copy" dominant-baseline="middle">${number++}. ${esc(label)}</text>`;
      });
    });
    return frame(1100,640,'操作系统工作流程：初创期、发展期、壮大期',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-workflow"');
  }
  function cpuInstructions(){
    const root=get('architecture-fdfd9eb1f1');
    const widths=[170,190,245,250,405],xs=[20];
    widths.forEach(w=>xs.push(xs[xs.length-1]+w));
    let b=text(650,28,'5 大类 CPU 指令','kd-section');
    ['上下文切换','示例指令','示例汇编代码','含义','注释'].forEach((s,i)=>b+=cell(xs[i],55,widths[i],46,s,null,true));
    const rows=[
      ['算术类指令',['add'],['add $s1, $s2, $s3'],['$s1 = $s2 + $s3'],['将 s2 和 s3 寄存器中的数相加后，','将结果放到寄存器 s1 中']],
      ['逻辑类指令',['or'],['or $s1, $s2, $s3'],['$s1 = $s2 | $s3'],['将 s2 和 s3 寄存器中的数按位取或后，','将结果放到寄存器 s1 中']],
      ['数据传输指令',['load word'],['load $s1, 10($s2)'],['$s1 = memory[$s2+10]'],['取 s2 寄存器中的数，加上 10 偏移量后，','找到内存中的字，存入 s1 寄存器中']],
      ['条件分支指令',['branch on equal'],['beq $s1, $s2, 10'],['if ($s1 == $s2) go to','PC+4+10'],['如果 s1 和 s2 寄存器内的值相等，','从程序计数器往后跳 10']],
      ['无条件跳转指令',['jump'],['j 1000'],['go to 1000'],['跳转到 1000 这个目标地址']],
    ];
    rows.forEach((r,j)=>{
      const n=child(root,r[0]),example=get(n.children[0]),y=101+j*74;
      [[r[0]],...r.slice(1)].forEach((labels,i)=>b+=multilineCell(xs[i],y,widths[i],74,labels,i===0?n:example));
    });
    b+=text(650,496,'按原表保留表头及示意写法；load 与分支偏移的说明见对应条目。','kd-small');
    return frame(1300,520,'CPU 指令分类、示例、含义与注释对照表',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-instructions"');
  }
  function mips(){
    const root=get('architecture-3f16083f23'),types=child(root,'指令类型'),fields=child(root,'指令字段'),repr=child(root,'表示方式');
    const field=title=>child(fields,title);
    let b=text(620,28,'MIPS 指令格式','kd-section');
    const x=[20,150,280,410,540,670,800,930],w=[130,130,130,130,130,130,130,290];
    ['指令类型','6 位','5 位','5 位','5 位','5 位','6 位','解释'].forEach((s,i)=>b+=cell(x[i],54,w[i],44,s,null,true));
    b+=cell(20,98,130,70,'R',child(types,'R 型'));
    ['opcode','rs','rt','rd','shamt 位移量','funct 功能码'].forEach((s,i)=>b+=multilineCell(x[i+1],98,130,70,s.split(' '),field(s)));
    b+=cell(930,98,290,70,'算术操作、逻辑操作',child(types,'R 型'));
    b+=cell(20,168,130,70,'I',child(types,'I 型'));
    ['opcode','rs','rt'].forEach((s,i)=>b+=cell(x[i+1],168,130,70,s,field(s)));
    b+=multilineCell(540,168,390,70,['address / immediate','地址 / 立即数'],field('address / immediate'));
    b+=multilineCell(930,168,290,70,['数据传输、条件分支','立即数操作'],child(types,'I 型'));
    b+=cell(20,238,130,70,'J',child(types,'J 型'))+cell(150,238,130,70,'opcode',field('opcode'));
    b+=multilineCell(280,238,650,70,['target address','目标地址'],field('target address'))+cell(930,238,290,70,'无条件跳转',child(types,'J 型'));
    b+=text(620,345,'add 指令的三种表示','kd-section');
    const widths=[170,130,150,150,150,150,150,150],cols=[20];widths.forEach(v=>cols.push(cols[cols.length-1]+v));
    ['指令','格式','opcode','rs','rt','rd','shamt','funct'].forEach((s,i)=>b+=cell(cols[i],372,widths[i],44,s,null,true));
    ['add','R','0','17','18','8','0','32'].forEach((s,i)=>b+=cell(cols[i],416,widths[i],58,s,child(repr,'汇编代码')));
    b+=cell(20,474,300,58,'二进制表示',child(repr,'二进制表示'));
    ['0','10001','10010','01000','00000','100000'].forEach((s,i)=>b+=cell(cols[i+2],474,150,58,s,child(repr,'二进制表示')));
    b+=cell(20,532,300,58,'十六进制表示',child(repr,'十六进制表示'))+cell(320,532,900,58,'0x02324020',child(repr,'十六进制表示'));
    b+=text(620,615,'按原图重绘；字段名称统一为 opcode。','kd-small');
    return frame(1240,640,'MIPS R I J 指令位宽与 add 编码表',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-mips"');
  }
  function programStack(){
    const root=get('architecture-5ccfed21db'),layout=child(root,'内存布局'),frames=child(root,'函数栈帧');
    let b=text(250,32,'程序栈：压栈与出栈','kd-section');
    [55,220,385].forEach((x,i)=>{
      b+=`<path d="M ${x} 84 V 350 H ${x+86} V 84" class="kd-stack-tube"/>`;
      [312,264].forEach(y=>b+=`<circle cx="${x+43}" cy="${y}" r="21" class="kd-stack-ball"/>`);
      if(i)b+=`<circle cx="${x+43}" cy="120" r="21" class="kd-stack-ball"/>`;
      if(i===1)b+=`<g class="kd-inverse-flow">${flow([[x+43,150],[x+43,225]])}</g>`+link(child(root,'压栈'),text(x+43,386,'压栈','kd-section'));
      if(i===2)b+=`<g class="kd-inverse-flow">${flow([[x+43,225],[x+43,150]])}</g>`+link(child(root,'出栈'),text(x+43,386,'出栈','kd-section'));
    });
    b+=flow([[180,264],[143,264]])+link(child(layout,'栈顶'),text(180,240,'栈顶'));
    b+=flow([[505,220],[575,220]])+text(535,195,'实际内存布局');
    const stackX=665,stackW=155,rowY=80,rowH=42;
    ['','','','其他参数','返回地址','','',''].forEach((label,i)=>b+=cell(stackX,rowY+i*rowH,stackW,rowH,label,label?child(layout,label):null,true));
    b+=link(child(layout,'栈底'),text(742,58,'栈底'))+link(child(layout,'栈顶'),text(742,438,'栈顶'));
    const bracket=(top,bottom,labels,n)=>link(n,wire(`M 838 ${top} H 851 V ${bottom} H 838 M 851 ${(top+bottom)/2} H 890`)+lines(1010,(top+bottom)/2-(labels.length-1)*8,labels));
    b+=bracket(80,206,['更外层的调用函数的栈帧'],child(frames,'更外层调用函数栈帧'));
    b+=bracket(206,290,['调用当前 B 函数的','A 函数的栈帧'],child(frames,'调用当前函数的栈帧'));
    b+=bracket(290,416,['当前执行的 B 函数的栈帧'],child(frames,'当前执行函数栈帧'));
    b+=link(child(root,'栈的地址方向'),flow([[625,80],[625,416]])+'<text x="600" y="120" style="writing-mode:vertical-rl;text-orientation:upright" dominant-baseline="middle">栈自底向顶内存地址逐渐变小</text>');
    return frame(1200,495,'程序栈压栈出栈、地址方向与函数栈帧',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-stack"');
  }
  function registers(){
    const root=get('architecture-45883ef215');
    let b=cell(28,220,100,50,'CPU',null,true)+flow([[128,245],[190,245]])+`<rect x="190" y="32" width="270" height="478" rx="8" class="kd-blue"/>`;
    const rows=[['PC 寄存器',['下一条指令的内存地址','例如 3F']],['指令寄存器',['当前正在执行的指令码','例如 83 7d fc 00']],['条件码寄存器',['存放条件和逻辑运算的结果','CF、ZF、SF、OF 等条件码']],['其他寄存器',['累加寄存器、向量寄存器','……、通用寄存器']]];
    rows.forEach(([title,labels],i)=>{
      const n=child(root,title),y=55+i*100;
      b+=cell(211,y,228,i===3?130:70,title,n)+flow([[460,y+(i===3?65:35)],[530,y+(i===3?65:35)]]);
      if(i<3)b+=link(n,cell(535,y,440,70,'',null)+lines(755,y+27,labels));
      else{
        b+=`<rect x="535" y="350" width="440" height="160" class="kd-cell"/>`;
        ['累加寄存器','向量寄存器','通用寄存器'].forEach((s,j)=>b+=cell(585,[357,397,465][j],340,30,s,child(n,s),true));
        b+=text(755,446,'……','kd-section');
      }
    });
    return frame(1020,535,'CPU 与 PC、指令、条件码及其他寄存器',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-registers"');
  }
  function programExecution(){
    const root=get('architecture-f5bce333d7'),n=title=>child(root,title);
    let b=text(450,28,'程序执行过程','kd-section');
    const stages=['C 语言源码','编译器','汇编代码','汇编器','目标代码'];
    stages.forEach((title,i)=>{
      const y=60+i*85;
      b+=cell(100,y,205,45,title,n(title),i%2===0);
      if(i<4)b+=flow([[202.5,y+45],[202.5,y+85]]);
    });
    b+=cell(390,400,200,45,'静态程序库',n('静态程序库'),true);
    b+=flow([[202.5,445],[360,495]])+flow([[490,445],[440,495]])+cell(320,495,160,45,'链接器',n('链接器'));
    b+=flow([[400,540],[530,610]])+cell(440,610,180,45,'可执行代码',n('可执行代码'),true);
    b+=flow([[620,632.5],[760,560]])+cell(680,515,160,45,'汇编器',get('architecture-d54f7e615e'))+flow([[760,515],[760,445]]);
    b+=cell(660,400,200,45,'内存中的程序和数据',n('内存中的程序和数据'),true);
    b+=cell(685,225,150,45,'CPU',null,true)+flow([[760,270],[760,400]])+text(810,335,'读取、执行');
    b+=text(450,715,'图中各阶段名称按原图标注保留。','kd-small');
    return frame(900,750,'源码经编译汇编链接装载进入内存并由 CPU 执行',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-execution"');
  }
  function vonNeumann(){
    const root=get('architecture-dfd9dd2057'),cpu=child(root,'CPU');
    let b=`<rect x="260" y="20" width="580" height="430" class="kd-blue"/>`;
    b+=`<rect x="280" y="40" width="540" height="225" class="kd-cell"/>`+link(cpu,lines(550,65,['Central Processing Unit','CPU'],'kd-section'));
    b+=multilineCell(305,104,490,62,['Control Unit','控制器'],child(cpu,'Control Unit 控制器'),true);
    b+=multilineCell(305,181,490,62,['Arithmetic / Logic Unit','运算器'],child(cpu,'Arithmetic / Logic Unit 运算器'),true);
    b+=`<g class="kd-inverse-flow">${flow([[480,265],[480,330]])+flow([[620,330],[620,265]])}</g>`;
    b+=multilineCell(280,330,540,100,['Memory Unit','存储器'],child(root,'Memory Unit 存储器'));
    b+=multilineCell(20,205,185,75,['Input Device','输入设备'],child(root,'Input Device 输入设备'),true)+flow([[205,242],[260,242]]);
    b+=flow([[840,242],[895,242]])+multilineCell(895,205,185,75,['Output Device','输出设备'],child(root,'Output Device 输出设备'),true);
    return frame(1100,475,'冯诺依曼结构：输入、CPU 控制器与运算器、存储器、输出',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-vonneumann"');
  }
  function engineeringPyramid(){
    const root=get('engineering-0d25359237'),elements=child(root,'三要素');
    const branches={'过程':get('engineering-783197eebe'),'方法':get('engineering-a981150253'),'工具':get('engineering-7a4c9a8351')};
    let b=text(390,30,'软件工程核心知识','kd-section');
    const levels=[['工具',[[390,70],[457.5,145],[322.5,145]],elements],['方法',[[322.5,145],[457.5,145],[525,220],[255,220]],elements],['过程',[[255,220],[525,220],[592.5,295],[187.5,295]],elements],['质量焦点',[[187.5,295],[592.5,295],[660,370],[120,370]],root]];
    levels.forEach(([title,points,parent],i)=>b+=link(branches[title]||child(parent,title),`<polygon points="${points.map(p=>p.join(',')).join(' ')}" class="kd-pyramid-level kd-pyramid-${i}"/>`+text(390,i?182.5+(i-1)*75:114,title,'kd-section')));
    b+=link(elements,wire('M 390 70 H 635 M 592.5 295 H 635')+flow([[635,165],[635,70]])+flow([[635,205],[635,295]])+text(635,185,'三要素','kd-section'));
    return frame(780,415,'软件工程金字塔：质量焦点为基础，过程方法工具为三要素',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-pyramid"');
  }
  function protocolOverview(){
    const root=get('networks-d9dcdc46d8');
    let b=text(660,28,'网络协议总览','kd-section');
    root.children.forEach((id,i)=>{
      const layer=get(id),y=54+i*72;
      b+=cell(20,y,150,72,layer.title,layer,true)+cell(170,y,1130,72,'',null);
      layer.children.forEach((id,j)=>{
        const protocol=get(id),x=186+j*136;
        b+=link(protocol,`<rect x="${x}" y="${y+14}" width="124" height="44" rx="4" class="kd-cell"/>`+text(x+62,y+36,protocol.title));
      });
    });
    return frame(1320,440,'网络协议总览：应用层、传输层、网络层、链路层与物理层',b).replace('class="knowledge-diagram"','class="knowledge-diagram kd-protocols"');
  }
  const specs={
    'os-064c686b05':{width:1100,height:640,title:'三阶段工作流程',interactive:false,render:operatingStages},
    'os-fa130d4e5c':{width:760,height:558,title:'应用与内核结构',interactive:false,render:kernel},
    'os-c54be2eeac':{width:780,height:516,title:'程序与进程管理',render:processes},
    'os-ae1536a5fa':{width:1110,height:580,title:'地址空间与内存映射',render:memory},
    'os-fd706d7a38':{width:580,height:1010,title:'文件访问层次',render:filesystem},
    'os-386a7d0298':{width:1580,height:960,title:'虚拟文件系统与输入输出分层',render:inputOutput},
    'os-f9054458bc':{width:1440,height:760,title:'网络拓扑与报文封装',render:network},
    'architecture-fdfd9eb1f1':{width:1300,height:520,title:'指令分类与示例对照',render:cpuInstructions},
    'architecture-3f16083f23':{width:1240,height:640,title:'指令格式与编码',render:mips},
    'architecture-5ccfed21db':{width:1200,height:495,title:'压栈、出栈与函数栈帧',render:programStack},
    'architecture-45883ef215':{width:1020,height:535,title:'CPU 与寄存器',render:registers},
    'architecture-f5bce333d7':{width:900,height:750,title:'编译、链接、装载与执行',render:programExecution},
    'architecture-dfd9dd2057':{width:1100,height:475,title:'输入、运算、存储与输出',render:vonNeumann},
    'engineering-0d25359237':{width:780,height:415,title:'质量焦点与三要素',render:engineeringPyramid},
    'networks-d9dcdc46d8':{width:1320,height:440,title:'五层协议对照',render:protocolOverview},
  };
  return {get:id=>specs[id],render:id=>specs[id]?.render()||''};
})();
