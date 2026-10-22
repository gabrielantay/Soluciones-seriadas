/* Diluciones seriadas: lógica de la página.
   Qué editar: fórmulas en calc() y sim(), instrucciones en stx(), dibujo en render(). */


/* Utilidades */
const $=i=>document.getElementById(i),N=x=>(+x).toLocaleString('es',{maximumFractionDigits:2}),LET='ABCDEFGH';

/* Micropipetas disponibles y cómo se elige la adecuada */
const PP=[['P2',.2,2],['P10',1,10],['P20',2,20],['P100',10,100],['P200',20,200],['P1000',100,1000]];
const pip=v=>{for(const[n,a,b]of PP)if(v>=a&&v<=b)return n;return v>1000?'pipeta serológica':'⚠ volumen muy pequeño'};
const pr=v=>`<b>${N(v)} µL</b> <span class="t">(${pip(v)})</span>`;

/* Estado de la página y dibujos de la lectura (botón, malla, parcial) */
let rows=[],PX={n:'Control positivo',a:200},si=0,sr=0,T,S=[],C={},marks={},brush=2;
const PAT={1:'<circle cx="50" cy="50" r="17" fill="#8e1226" opacity=".22" filter="url(#rg)"/><circle cx="50" cy="50" r="12" fill="url(#gb)" filter="url(#rg)"/>',2:'<circle cx="50" cy="50" r="35" fill="url(#gm)" filter="url(#gn)"/><circle cx="38" cy="58" r="3" fill="#8a1228" opacity=".5"/><circle cx="60" cy="40" r="4" fill="#8a1228" opacity=".4"/><circle cx="55" cy="62" r="2.5" fill="#8a1228" opacity=".5"/>',3:'<circle cx="50" cy="50" r="27" fill="url(#gm)" opacity=".35" filter="url(#gn)"/><circle cx="50" cy="50" r="14" fill="url(#gb)" filter="url(#gn)"/>'};
const svg=m=>`<svg viewBox="0 0 100 100" aria-hidden="true">${PAT[m]}</svg>`;

/* Textos de cada tipo de protocolo */
const DS={cin:'Cinética de inmunización: el conejo produce suero policlonal. Usa una fila por sangrado (la semana 0 es el preinmune) y las mismas condiciones en todas, para poder comparar.',uno:'Una sola muestra de suero en una fila, con controles opcionales.',mono:'Anticuerpo monoclonal o reactivo comercial: parte de una concentración conocida de la hoja técnica. Revisa su rango de uso y su vida útil antes de diluir.'};

/* Tipo de protocolo y lista de sueros */
function pre(){const p=$('pr').value,w=Math.max(1,Math.min(6,+$('wk').value|0));
$('wkb').hidden=p!='cin';$('stk').hidden=p!='mono';$('ds').textContent=DS[p];
rows=p=='cin'?[{n:'Preinmune (sem 0)',a:500},...Array.from({length:w},(_,i)=>({n:'Semana '+(i+1),a:500}))]:p=='mono'?[{n:'Anticuerpo monoclonal',a:100}]:[{n:'Muestra',a:500}];
marks={};si=0;sr=0;box();calc()}

function box(){const L=[...rows,...($('pos').checked?[PX]:[])];
$('rb').innerHTML=L.map((r,i)=>`<div class="rw"><input value="${r.n}" data-i="${i}" data-k="n" aria-label="Nombre del suero"><input type="number" value="${r.a}" min="0" data-i="${i}" data-k="a" aria-label="Suero disponible en µL"><span class="t">µL</span><div class="t" id="s${i}"></div></div>`).join('')}
$('rb').addEventListener('input',e=>{const t=e.target,L=[...rows,...($('pos').checked?[PX]:[])],r=L[t.dataset.i];if(!r)return;r[t.dataset.k]=t.dataset.k=='a'?+t.value||0:t.value;calc()});

/* Cálculos: volúmenes, suero necesario y lista de pasos */
function calc(){
const V=+$('V').value,f=+$('f').value,n=Math.min(12,Math.max(2,+$('n').value|0)),D=Math.max(1,+$('D').value||1),ex=Math.max(0,+$('ex').value||0)/100,g=Math.max(0,+$('g').value||0),dl=$('dl').value||'PBS',md=$('md').value,neg=$('neg').checked,pos=$('pos').checked,cs=+$('cs').value||0,inc=+$('inc').value||0;
if(!(V>0)||!(f>1)){$('stt').textContent='Ingresa un volumen mayor que 0 y un factor mayor que 1.';return}
const Vt=V/(f-1),V1=V*f/(f-1);
const L=[...rows,...(pos?[PX]:[])].slice(0,neg?7:8).map((r,i)=>({...r,k:i>=rows.length?'p':'s'}));
if(neg)L.push({n:'Control negativo ('+dl+' + GR)',a:0,k:'n'});
C={V,f,n,D,ex,g,dl,md,Vt,V1,L,cs,inc,mono:$('pr').value=='mono',neg};
const st=md=='c'?V1:V*(1-Math.pow(f,-n))/(1-1/f),need=st*(1+ex)/D;
L.forEach((r,i)=>{const el=$('s'+i);if(!el||r.k=='n')return;
el.innerHTML=r.a>=need?`Necesitas ${N(need)} µL de suero: alcanza y sobran ${N(r.a-need)} µL.`:`<span class="wa">Necesitas ${N(need)} µL y tienes ${N(r.a)}.</span> Con lo que hay alcanza para ${N(V*r.a/need)} µL por pocillo. Para mantener ${N(V)} µL faltan ${N(need-r.a)} µL: unos ${N((need-r.a)/.4/1000)} mL más de sangre (el suero rinde ~40 %, es aproximado).`});
S=[];if(D>1)S.push({t:'pre'});S.push({t:'dil'},{t:'load'});
if(md=='c'){for(let k=0;k<n-1;k++)S.push({t:'x',k});S.push({t:'disc'})}
if(g>0)S.push({t:'gr'});S.push({t:'inc'},{t:'read'});
si=Math.min(si,S.length-1);
$('sr').innerHTML=L.filter(r=>r.k!='n').map((r,i)=>`<option value="${i}">${LET[i]}: ${r.n}</option>`).join('');sr=Math.min(sr,L.length-1-(neg?1:0));$('sr').value=sr;
render()}

/* Simulación del contenido de cada pocillo en cada paso */
function sim(r,i){const{V,f,n,V1,Vt,g,md}=C,v=Array(n).fill(0),d=Array(n).fill(null);
for(let j=0;j<=i;j++){const s=S[j];
if(s.t=='dil'){if(r.k=='n'){v[0]=V;d[0]=-1}else for(let c=1;c<n;c++){v[c]=md=='c'?V:V-V/Math.pow(f,c);d[c]=-1}}
else if(s.t=='load'&&r.k!='n'){if(md=='c'){v[0]=V1;d[0]=0}else for(let c=0;c<n;c++){v[c]+=V/Math.pow(f,c);d[c]=c}}
else if(s.t=='x'&&r.k!='n'){v[s.k]-=Vt;v[s.k+1]+=Vt;d[s.k+1]=s.k+1}
else if(s.t=='disc'&&r.k!='n')v[n-1]-=Vt;
else if(s.t=='gr'){for(let c=0;c<n;c++)if(d[c]!==null)v[c]+=g}}
return{v,d,gr:S.slice(0,i+1).some(s=>s.t=='gr')}}

/* Aspecto del líquido en un pocillo */
function lq(v,d,gr,mk){const mx=C.V1+C.g+.001;let sc=mk?1:Math.min(1,v/mx),bg;
if(mk)bg='radial-gradient(circle at 40% 35%,rgba(255,222,226,.7),rgba(238,168,178,.55))';
else if(gr)bg='radial-gradient(circle at 40% 35%,#e0485f,#a81b32)';
else if(d<0)bg='radial-gradient(circle at 40% 35%,rgba(190,225,245,.85),rgba(120,175,210,.6))';
else{const a=Math.max(.2,.95*Math.pow(C.f,-d)+.15).toFixed(2);bg=`radial-gradient(circle at 40% 35%,rgba(252,222,120,${a}),rgba(224,172,60,${a}))`}
return`style="--s:${(.25+.75*sc).toFixed(2)};background:${bg}"`}

/* Texto de cada paso (aquí se editan las instrucciones) */
function stx(s,R){const{V,f,n,D,Vt,V1,g,dl,md,ex,inc,neg}=C,W=c=>LET[sr]+(c+1);
const st=md=='c'?V1:V*(1-Math.pow(f,-n))/(1-1/f),nd=st*(1+ex),se=nd/D;
switch(s.t){
case'pre':return`Prepara un tubo con el suero a 1:${N(D)}: mezcla ${pr(se)} de suero con ${pr(nd-se)} de ${dl} (ya incluye el ${N(ex*100)} % extra) y homogeneiza suave. Un tubo por suero, con punta nueva.`;
case'dil':return md=='c'?`Pon ${pr(V)} de ${dl} en cada pocillo de ${W(1)} a ${W(n-1)}. ${W(0)} queda vacío por ahora. Una sola punta sirve, porque solo toca diluyente.`:`Pon ${dl} en los pocillos ${W(1)} a ${W(n-1)}: ${W(1)} lleva ${pr(V-V/f)} y cada pocillo siguiente lleva más (mira la tabla).`;
case'load':return md=='c'?`Pon ${pr(V1)} de suero 1:${N(D)} en ${W(0)}. De ahí sale toda la serie. Punta nueva para cada suero.`:`Añade a cada pocillo su volumen de suero 1:${N(D)}: ${W(0)} lleva ${pr(V)} y ${W(n-1)} solo ${N(V/Math.pow(f,n-1))} µL. Volúmenes tan chicos se miden mal, por eso se prefiere la cascada.`;
case'x':return`Homogeneiza ${W(s.k)} (aspira y dispensa unas 5 veces con ${pr(.6*V1)}, sin burbujas). Toma ${pr(Vt)} de ${W(s.k)} y pásalos a ${W(s.k+1)}. <span class="wa">Cambia de punta.</span> ${W(s.k)} queda con ${N(V)} µL; ${W(s.k+1)} sube a ${N(V1)} µL, dilución 1:${N(D*Math.pow(f,s.k+1))}.`;
case'disc':return`Homogeneiza ${W(n-1)} y descarta ${pr(Vt)}. Así todos los pocillos quedan con ${N(V)} µL.`;
case'gr':return`Añade ${pr(g)} de suspensión de GR (concentración según tu guía, a menudo 0,5–1 %) en cada pocillo${neg?', incluido el control negativo':''}. Resuspende los GR antes, y ve de la dilución mayor a la menor con la misma punta.`;
case'inc':return`Cubre la placa y déjala ${N(inc)} min sin moverla (temperatura según tu guía). <button onclick="tm()">Cuenta regresiva</button> <b id="cd"></b>`;
default:return`Compara cada pocillo con las imágenes de abajo, elige cómo se ve y tócalo. El título de cada fila es la dilución del último pocillo con malla.`}}

/* Dibujo de la placa, tabla y títulos */
function render(){if(!C.L)return;const{n,D,f,V,Vt,V1,md,L,mono,cs}=C,s=S[si],R=L[sr]||L[0];
const fu=$('fl').checked,NR=fu?8:L.length,NC=fu?12:n;$('pg').style.gridTemplateColumns=`14px repeat(${NC},1fr)`;$('pg').style.minWidth=(NC*34+14)+'px';
let h='<span></span>'+[...Array(NC)].map((_,c)=>`<span class="cl">${c+1}</span>`).join('');
for(let r=0;r<NR;r++){const Q=L[r],z=Q?sim(Q,si):null;h+=`<span class="cl">${LET[r]}</span>`;
for(let c=0;c<NC;c++){const on=Q&&c<(Q.k=='n'?1:n),m=s.t=='read'?marks[r+'-'+c]||0:0;let cl=on?'':' off';
if(on&&r==sr){if(s.t=='x'){if(c==s.k)cl+=' src';if(c==s.k+1)cl+=' dst'}else if(s.t=='disc'&&c==n-1)cl+=' src'}
h+=`<button class="well${cl}" data-r="${r}" data-c="${c}" aria-label="Pocillo ${LET[r]}${c+1}"><i class="lq" ${on&&z.d[c]!==null?lq(z.v[c],z.d[c],z.gr,m):'style="--s:0"'}>${m&&on?svg(m):''}</i></button>`}}
$('pg').innerHTML=h;
$('cnt').textContent='Paso '+(si+1)+' de '+S.length;$('pb').style.width=((si+1)/S.length*100)+'%';$('stt').innerHTML=stx(s,R);
$('pal').innerHTML=s.t=='read'?`<div class="pal">${[[1,'Botón','sin aglutinación'],[2,'Malla','aglutinación'],[3,'Parcial','dudoso']].map(([k,a,b])=>`<button class="${brush==k?'on':''}" onclick="brush=${k};render()"><div class="well"><i class="lq" style="--s:1;background:radial-gradient(circle at 40% 35%,rgba(255,222,226,.7),rgba(238,168,178,.55))">${svg(k)}</i></div>${a}<span class="t">${b}</span></button>`).join('')}</div><p class="t">Elige cómo se ve el pocillo y tócalo. Si tocas uno ya marcado igual, se borra. Son ilustraciones aproximadas: compáralas con tu placa real.</p>`:'';
let t=md=='c'?'<tr><th>Pocillo</th><th>Dilución</th><th>Recibe</th>':'<tr><th>Pocillo</th><th>Dilución</th><th>Suero 1:'+N(D)+'</th><th>'+C.dl+'</th>';
if(mono&&cs)t+='<th>µg/mL</th>';t+='</tr>';
for(let c=0;c<n;c++){const dl=D*Math.pow(f,c);t+=`<tr><td>${LET[sr]}${c+1}</td><td>1:${N(dl)}</td>`+(md=='c'?`<td>${c?N(Vt)+' µL del '+LET[sr]+c:N(V1)+' µL de suero 1:'+N(D)}</td>`:`<td>${N(V/Math.pow(f,c))} µL</td><td>${N(V-V/Math.pow(f,c))} µL</td>`)+(mono&&cs?`<td>${N(cs/dl)}</td>`:'')+'</tr>'}
$('tb').innerHTML=t;
const T2=L.map((Q,r)=>{if(Q.k=='n')return'';let b=-1,p=-1;for(let c=0;c<n;c++){if(marks[r+'-'+c]==2)b=c;if(marks[r+'-'+c]==3)p=c}return`<div>${LET[r]} · ${Q.n}: <b>${b<0?'sin marcar':'1:'+N(D*Math.pow(f,b))}</b>${p>b?` (parcial hasta 1:${N(D*Math.pow(f,p))}; decide según tu guía)`:''}</div>`}).join('');
$('ti').innerHTML=T2}

/* Navegación, temporizador y eventos */
function go(d){si=Math.max(0,Math.min(S.length-1,si+d));render()}

function tm(){clearInterval(T);let s=Math.round(C.inc*60);const o=$('cd'),sh=()=>{o.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};sh();T=setInterval(()=>{if(--s<0){clearInterval(T);o.textContent='Listo: lee la placa'}else sh()},1000)}
$('pg').addEventListener('click',e=>{const b=e.target.closest('.well');if(!b||b.classList.contains('off'))return;const r=+b.dataset.r,c=+b.dataset.c,Q=C.L[r],z=sim(Q,si);
if(S[si].t=='read'){const k=r+'-'+c;marks[k]=marks[k]==brush?0:brush}
const x=z.d[c];$('inf').textContent=`${LET[r]}${c+1} (${Q.n}): ${N(z.v[c])} µL`+(x===null?', vacío':x<0?', solo '+C.dl:', dilución 1:'+N(C.D*Math.pow(C.f,x)));render()});

/* Arranque */
document.querySelectorAll('.p').forEach(e=>e.addEventListener('input',calc));
$('pr').addEventListener('change',pre);$('wk').addEventListener('input',pre);$('pos').addEventListener('change',()=>{box();calc()});
pre();
