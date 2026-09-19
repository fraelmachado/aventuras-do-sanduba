/* Pure level descriptions. Shared by browser and Node tests. */
(function(root){
function build(level,P){
 let platforms,sections,width,starIndices,goalIndex,bow,winds=[],bells=[],currents=[],animals=[],checkpoints=[];
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
  sections=[{x:0,name:'O primeiro voo',hint:'No ar, segure ↑ (ou Espaço/W) para abrir o guarda-chuva. Solte para descer!'},{x:1590,name:'Os moinhos do vento',hint:'Abra o guarda-chuva nas correntes de ar para subir.'},{x:3570,name:'Ilhas do pôr do sol',hint:'Escolha quando planar e quando pousar. A Gota de Nuvem está bem alta!'}];
 }else if(level===2){
  const coords=[[0,530,250],[350,500,120],[550,470,120],[750,500,120],[960,510,250],[1320,450,130],[1560,390,130],[1800,450,130],[2040,400,130],[2310,440,250],[2780,500,150],[3100,400,150],[3460,330,150],[3880,430,150],[4270,390,250],[4620,340,190],[4930,410,330]];
  platforms=coords.map(([x,y,w],i)=>P(x,y,w,{kind:[0,4,9,14,15,16].includes(i)?'moon':'bridge',checkpoint:[0,4,9,14].includes(i),group:i<4?0:i<9?1:2}));
  bells=[{x:180,y:480,group:0,duration:7,near:false},{x:1150,y:460,group:1,duration:9,near:false},{x:2490,y:390,group:2,duration:13,near:false}];
  winds=[{x:2960,y:130,w:125,h:470,lift:165},{x:3300,y:80,w:140,h:420,lift:165}];
  platforms.push(P(1750,265,220,{kind:'moon',optional:true}));
  bow={x:1840,y:210,taken:false};width=5290;goalIndex=16;starIndices=[2,6,8,{i:11,dx:-153,dy:-145},15];
  sections=[{x:0,name:'Sininhos na escuridão',hint:'Encoste no sininho para acender a ponte. Você pode tocar de novo!'},{x:960,name:'A melodia das estrelas',hint:'A luz tem seu tempo. Observe o caminho antes de sair.'},{x:2310,name:'O último voo',hint:'Pontes de luz e guarda-chuva levam até a chegada brilhante.'}];
 }else{
  // Open swimming corridor. Checkpoints are buoys, independent of the decorative reef ledges.
  width=4600;platforms=[];goalIndex=-1;
  checkpoints=[{x:70,y:310},{x:1510,y:320},{x:3070,y:340}];
  sections=[
   {x:0,name:'Recife das Bolhas',hint:'Segure ↑ (ou Espaço/W) para subir. Solte para descer devagar entre as bolhas.'},
   {x:1510,name:'Bosque de Algas',hint:'Observe o vaivém dos peixes e das águas-vivas. Encostar neles leva você à última boia.'},
   {x:3070,name:'Gruta da Pérola',hint:'As correntes ajudam a encontrar a Pérola-Coração antes do arco de coral.'}
  ];
  currents=[{x:650,y:130,w:290,h:360,vx:18,vy:-40},{x:1850,y:120,w:320,h:400,vx:-45,vy:38},{x:3300,y:110,w:310,h:390,vx:52,vy:-40},{x:3950,y:150,w:260,h:330,vx:-40,vy:35}];
  animals=[
   {kind:'fish',x:1740,y:250,ax:75,ay:20,speed:1.1,phase:0,r:35},
   {kind:'jelly',x:2200,y:410,ax:25,ay:85,speed:.8,phase:1,r:33},
   {kind:'fish',x:2650,y:300,ax:90,ay:24,speed:.9,phase:2,r:38},
   {kind:'jelly',x:3530,y:210,ax:30,ay:70,speed:.72,phase:3,r:33},
   {kind:'fish',x:3910,y:390,ax:65,ay:35,speed:1,phase:4,r:35}
  ];
  starIndices=[];bow={x:4140,y:245,taken:false};
 }
 return {platforms,sections,width,starIndices,goalIndex,bow,winds,bells,currents,animals,checkpoints};
}
if(typeof module!=='undefined')module.exports=build;else root.SandubaWorlds=build;
})(typeof window!=='undefined'?window:globalThis);
