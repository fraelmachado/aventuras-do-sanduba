/* Pure level descriptions. Shared by browser and Node tests. */
(function(root){
function build(level,P){
 let platforms,sections,width,starIndices,goalIndex,bow,winds=[],bells=[];
 if(level===1){
  const xs=[0,330,810,1220,1590,1970,2340,2790,3200,3570,3960,4340,4790,5190,5580];
  const ys=[530,500,560,440,400,340,200,260,120,100,20,-100,-30,-180,-200];
  platforms=xs.map((x,i)=>P(x,ys[i],[0,4,9,14].includes(i)?230:190,{kind:'cloud',checkpoint:[0,4,9,14].includes(i),moving:i===7,ax:i===7?20:0,ay:0,speed:.8}));
  for(const i of [2,3,4,5,7,8,9,10,12,13]){
   const q=platforms[i],n=platforms[i+1];winds.push({x:q.x+q.w+10,y:n.y-250,w:n.x-(q.x+q.w)-20,h:q.y-n.y+430,lift:170});
  }
  winds.push({x:4570,y:-510,w:130,h:660,lift:180,optional:true});
  platforms.push(P(4600,-330,140,{kind:'cloud',optional:true}));
  bow={x:4670,y:-385,taken:false};width=5850;goalIndex=14;starIndices=[1,3,{i:6,dx:-185,dy:-125},10,13];
  sections=[{x:0,name:'O primeiro voo',hint:'No ar, segure Pular para abrir o guarda-chuva. Solte para descer!'},{x:1590,name:'Os moinhos do vento',hint:'Abra o guarda-chuva nas correntes de ar para subir.'},{x:3570,name:'Ilhas do pôr do sol',hint:'Escolha quando planar e quando pousar. A touquinha está bem alta!'}];
 }else if(level===3){
  // Primeira fase vertical: 2795px de subida. O cogumelo (spring) só dispara no centro da
  // plataforma, então o salto longo parte do meio dela — e não da borda, como um pulo normal.
  // As três seções avançam em colunas da esquerda para a direita porque `activeSection` é medido por x.
  const coords=[[0,530,420],[500,455,170],[200,365,180],[470,200,160],[200,115,180],[480,-50,160],[210,-135,180],[450,-300,200],
                [760,-390,160],[1010,-480,170],[760,-645,160],[1000,-735,170],[750,-900,160],[1000,-990,170],[1250,-1155,220],
                [1560,-1245,170],[1310,-1335,170],[1580,-1500,160],[1320,-1590,170],[1560,-1755,200],[1310,-1845,170],[1580,-2010,160],[1330,-2100,170],[1520,-2265,260]];
  const springs=[2,4,6,9,11,13,16,18,20,22],leaves=[3,5,8,10,12,15,17,21],checks=[0,7,14,19,23],moving={8:{ax:40,ay:0},12:{ax:38,ay:0},15:{ax:0,ay:26}};
  platforms=coords.map(([x,y,w],i)=>P(x,y,w,{kind:leaves.includes(i)?'leaf':'island',spring:springs.includes(i),checkpoint:checks.includes(i),moving:!!moving[i],ax:moving[i]?.ax||0,ay:moving[i]?.ay||0,phase:i*0.4,speed:0.9}));
  platforms.push(P(1060,-2010,160,{kind:'leaf',optional:true}));
  bow={x:1140,y:-2100,taken:false};width=1950;goalIndex=23;starIndices=[1,5,{i:11,dx:0,dy:-130},15,{i:24,dx:-45,dy:0}];
  sections=[{x:0,name:'O chão do quintal',hint:'Pise bem no meio do cogumelo para saltar mais alto!'},{x:700,name:'O varal das folhas',hint:'As folhas passeiam. Espere a hora certa de saltar.'},{x:1200,name:'A casa da árvore',hint:'Quase lá! A casa da árvore está te esperando.'}];
 }else{
  const coords=[[0,530,250],[350,500,120],[550,470,120],[750,500,120],[960,510,250],[1320,450,130],[1560,390,130],[1800,450,130],[2040,400,130],[2310,440,250],[2780,500,150],[3100,400,150],[3460,330,150],[3880,430,150],[4270,390,250],[4620,340,190],[4930,410,330]];
  platforms=coords.map(([x,y,w],i)=>P(x,y,w,{kind:[0,4,9,14,15,16].includes(i)?'moon':'bridge',checkpoint:[0,4,9,14].includes(i),group:i<4?0:i<9?1:2}));
  bells=[{x:180,y:480,group:0,duration:7,near:false},{x:1150,y:460,group:1,duration:9,near:false},{x:2490,y:390,group:2,duration:13,near:false}];
  winds=[{x:2960,y:130,w:125,h:470,lift:165},{x:3300,y:80,w:140,h:420,lift:165}];
  platforms.push(P(1750,265,220,{kind:'moon',optional:true}));
  bow={x:1840,y:210,taken:false};width=5290;goalIndex=16;starIndices=[2,6,8,{i:11,dx:-153,dy:-145},15];
  sections=[{x:0,name:'Sininhos na escuridão',hint:'Encoste no sininho para acender a ponte. Você pode tocar de novo!'},{x:960,name:'A melodia das estrelas',hint:'A luz tem seu tempo. Observe o caminho antes de sair.'},{x:2310,name:'O último voo',hint:'Pontes de luz e guarda-chuva: a caminha está esperando por você.'}];
 }
 return {platforms,sections,width,starIndices,goalIndex,bow,winds,bells};
}
if(typeof module!=='undefined')module.exports=build;else root.SandubaWorlds=build;
})(typeof window!=='undefined'?window:globalThis);
