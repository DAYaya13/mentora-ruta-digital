/* PDF generation using browser APIs only. No answers leave the browser. */
'use strict';
window.MentoraPDF=(()=>{
const dec=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const bytes=s=>new TextEncoder().encode(s);
const join=items=>{const out=new Uint8Array(items.reduce((n,a)=>n+a.length,0));let p=0;for(const a of items){out.set(a,p);p+=a.length;}return out;};
let fontPromise;
async function loadFont(){
 const source=dec(window.MENTORA_PDF_ASSETS.font),v=new DataView(source.buffer),count=v.getUint16(12),tables={},records=[];
 let offset=12+count*16;
 for(let i=0;i<count;i++){
  const p=44+i*20,tag=String.fromCharCode(...source.slice(p,p+4)),start=v.getUint32(p+4),len=v.getUint32(p+8),original=v.getUint32(p+12);
  let data=source.slice(start,start+len);
  if(len<original)data=new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer());
  if(data.length!==original)throw Error('Fuente incompleta');
  tables[tag]=new DataView(data.buffer,data.byteOffset,data.byteLength);records.push({tag,data,offset,checksum:v.getUint32(p+16)});offset+=(original+3)&~3;
 }
 const ttf=new Uint8Array(offset),tv=new DataView(ttf.buffer);tv.setUint32(0,v.getUint32(4));tv.setUint16(4,count);const pow=2**Math.floor(Math.log2(count));tv.setUint16(6,pow*16);tv.setUint16(8,Math.log2(pow));tv.setUint16(10,count*16-pow*16);
 records.forEach((r,i)=>{const p=12+i*16;ttf.set(bytes(r.tag),p);tv.setUint32(p+4,r.checksum);tv.setUint32(p+8,r.offset);tv.setUint32(p+12,r.data.length);ttf.set(r.data,r.offset);});
 const cmap=tables.cmap,units=tables.head.getUint16(18),metrics=tables.hhea.getUint16(34);let chosen=null;
 for(let i=0;i<cmap.getUint16(2);i++){const p=4+i*8,o=cmap.getUint32(p+4),f=cmap.getUint16(o);if(f===12||f===4&&chosen?.f!==12)chosen={o,f};}
 if(!chosen)throw Error('Fuente incompatible');
 function glyph(cp){const {o,f}=chosen;if(f===12){for(let i=0;i<cmap.getUint32(o+12);i++){const p=o+16+i*12,a=cmap.getUint32(p),b=cmap.getUint32(p+4);if(cp>=a&&cp<=b)return cmap.getUint32(p+8)+cp-a;}return 0;}
  const n=cmap.getUint16(o+6)/2;for(let i=0;i<n;i++){const end=cmap.getUint16(o+14+i*2),start=cmap.getUint16(o+16+n*2+i*2);if(cp<start||cp>end)continue;const delta=cmap.getInt16(o+16+n*4+i*2),rp=o+16+n*6+i*2,range=cmap.getUint16(rp);if(!range)return(cp+delta)&65535;const g=cmap.getUint16(rp+range+(cp-start)*2);return g?(g+delta)&65535:0;}return 0;
 }
 const width=g=>tables.hmtx.getUint16(Math.min(g,metrics-1)*4)/units*1000;
 return {ttf,glyph,width,units,bbox:[36,38,40,42].map(p=>tables.head.getInt16(p)/units*1000),ascent:tables.hhea.getInt16(4)/units*1000,descent:tables.hhea.getInt16(6)/units*1000};
}
async function build(data){
 const font=await(fontPromise||(fontPromise=loadFont().catch(e=>{fontPromise=null;throw e;}))),assets=window.MENTORA_PDF_ASSETS;
 const glyphs=new Map(),audit=[],pages=[],links=[];let commands=[],y=0,page=0;
 const navy='0.043 0.145 0.271',teal='0.18 0.769 0.714',ink='0.188 0.259 0.329';
 const normalized=s=>String(s).normalize('NFC').replace(/[\r\n\t]+/g,' ');
 const glyph=ch=>font.glyph(ch.codePointAt(0))||font.glyph(63);
 const width=(s,size)=>[...s].reduce((n,ch)=>n+font.width(glyph(ch))*size/1000,0);
 const hex=s=>[...s].map(ch=>{const g=glyph(ch);glyphs.set(g,ch);return g.toString(16).padStart(4,'0');}).join('');
 function line(text,x,top,size=11,color=ink){if(top<0||top+size>832)throw Error('El contenido supera el espacio de la página');commands.push(`${color} rg BT /F1 ${size} Tf 1 0 0 1 ${x} ${(841.89-top-size).toFixed(2)} Tm <${hex(text)}> Tj ET`);audit.push({page,text,x,top,size,right:x+width(text,size),bottom:top+size});}
 function wrap(text,max,size){let result=[],current='';for(const word of normalized(text).split(/\s+/)){if(!word)continue;if(width(word,size)>max){if(current){result.push(current);current='';}let part='';for(const ch of word){if(width(part+ch,size)>max){result.push(part);part='';}part+=ch;}current=part;}else if(width((current?current+' ':'')+word,size)>max){result.push(current);current=word;}else current+=(current?' ':'')+word;}if(current)result.push(current);return result;}
 function paragraph(text,{size=11,x=44,max=507,color=ink,gap=9}={}){for(const s of wrap(text,max,size)){line(s,x,y,size,color);y+=size*1.42;}y+=gap;}
 function label(text){paragraph(text,{size:13,color:navy,gap:8});}
 function rect(x,top,w,h,color,stroke=false){commands.push(`${color} ${stroke?'RG':'rg'} ${x} ${841.89-top-h} ${w} ${h} re ${stroke?'S':'f'}`);}
 function start(n){page=n;commands=[];y=0;rect(0,0,595.28,5,teal);commands.push(`q 150 0 0 150 25 ${841.89-112} cm /Logo Do Q`);line('MI RUTA DIGITAL',375,38,10,navy);line(`Página ${n} de 2`,464,57,9,ink);y=101;}
 function finish(){if(y>770)throw Error('El contenido supera el espacio disponible; vuelve a intentar con un área más breve.');line('Mentora 360 · Conocimiento que transforma',44,798,9,navy);line('Orientación inicial basada en tus respuestas',44,814,8,ink);pages.push(commands.join('\n'));}
 start(1);paragraph('Mi ruta digital',{size:25,color:navy,gap:9});paragraph(data.name,{size:19,color:navy,gap:15});label('Tu objetivo');paragraph(data.objective);label('Por qué esta ruta');paragraph(data.why);paragraph(data.support,{size:10.5});label('Tus tres primeros pasos');paragraph('Marca cada casilla cuando completes el paso.',{size:10,gap:10});
 data.steps.forEach((s,i)=>{rect(45,y+3,10,10,navy,true);paragraph(`${i+1}. ${s}`,{x:66,max:485,size:11,gap:14});});finish();
 start(2);paragraph('De tu ruta a la práctica',{size:21,color:navy,gap:10});label(data.exercise.title);paragraph(data.exercise.context,{gap:7});label('Cómo hacerlo');data.exercise.instructions.forEach((s,i)=>paragraph(`${i+1}. ${s}`,{size:11,gap:6}));label('Resultado esperado');paragraph(data.exercise.expected,{gap:8});
 label('Mi próximo paso');const writingLines=y>550?1:2;for(let i=0;i<writingLines;i++){commands.push(`0.77 0.83 0.84 RG 44 ${841.89-y-16} m 551 ${841.89-y-16} l S`);y+=22;}
 if(y>600)throw Error('El ejercicio supera el espacio disponible para los contactos.');
 line('¿Quieres aplicar esta ruta a tu trabajo? Trabajémosla contigo.',44,610,11,navy);
 y=635;label('Sigamos en contacto');
 function contactLine(text,url,x,top,size=10.5){line(text,x,top,size,navy);links.push({url,rect:[x,841.89-top-size-3,Math.min(551,x+width(text,size)),841.89-top+2]});}
 if(data.contactUrl){
  const label=data.contactKind==='whatsapp'?'WhatsApp · '+data.contactPhone:data.contactUrl.startsWith('mailto:')?'Correo: '+data.contactUrl.slice(7):'Contacto principal: '+data.contactUrl.replace(/^https?:\/\//,'');
  const parts=wrap(label,304,10.5);for(const part of parts){contactLine(part,data.contactUrl,44,y);y+=15;}
 }
 const contacts=data.officialLinks||window.MENTORA_CONFIG.officialLinks;
 for(const contact of contacts){contactLine(contact.name+' · '+contact.display,contact.url,44,y);y+=17;}
 function drawQR(matrix,url,x,top,size,label){
  const n=matrix.length,module=size/n;rect(x-3,top-3,size+6,size+6,'1 1 1');
  for(let row=0;row<n;row++)for(let col=0;col<n;col++)if(matrix[row][col])rect(x+col*module,top+row*module,module+0.005,module+0.005,'0 0 0');
  contactLine(label,url,x,top+size+8,9.5);links.push({url,rect:[x,841.89-top-size,x+size,841.89-top]});
 }
 const web=window.MENTORA_CONTACT_QR;if(!web||web.url!=='https://360-mentora.com/')throw Error('Código QR web no disponible');
 if(data.contactKind==='whatsapp'){
  const qr=qrcodegen.QrCode.encodeText(data.contactUrl,qrcodegen.QrCode.Ecc.LOW),quiet=4,n=qr.size+quiet*2;
  const matrix=Array.from({length:n},(_,row)=>Array.from({length:n},(_,col)=>qr.getModule(col-quiet,row-quiet)?1:0));
  drawQR(matrix,data.contactUrl,360,660,90,'WhatsApp');
 }
 drawQR([...web.rows].reverse(),web.url,461,660,90,'Visita nuestra web');
 y=Math.max(y,768);finish();
 const objects=[];const add=value=>{objects.push(value);return objects.length;};const stream=(dict,content)=>join([bytes(`<< ${dict} /Length ${content.length} >>\nstream\n`),content,bytes('\nendstream')]);
 const catalog=add(''),tree=add('');const fontFile=add(stream(`/Length1 ${font.ttf.length}`,font.ttf));const descriptor=add(`<< /Type /FontDescriptor /FontName /MentoraOpenSans /Flags 32 /FontBBox [${font.bbox.join(' ')}] /ItalicAngle 0 /Ascent ${font.ascent} /Descent ${font.descent} /CapHeight 714 /StemV 80 /FontFile2 ${fontFile} 0 R >>`);
 const widths=[...glyphs.keys()].sort((a,b)=>a-b).map(g=>`${g} [${font.width(g).toFixed(3)}]`).join(' ');
 const cid=add(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /MentoraOpenSans /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptor} 0 R /CIDToGIDMap /Identity /W [${widths}] >>`);
 const utf16=s=>[...s].map(ch=>{const n=ch.codePointAt(0);return n<=65535?n.toString(16).padStart(4,'0'):((n-65536>>10)+0xd800).toString(16)+((n-65536&1023)+0xdc00).toString(16);}).join('');
 let cmap='/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def /CMapName /MentoraUnicode def /CMapType 2 def 1 begincodespacerange <0000> <FFFF> endcodespacerange\n';const entries=[...glyphs];for(let i=0;i<entries.length;i+=90){const chunk=entries.slice(i,i+90);cmap+=`${chunk.length} beginbfchar\n`+chunk.map(([g,ch])=>`<${g.toString(16).padStart(4,'0')}> <${utf16(ch)}>`).join('\n')+'\nendbfchar\n';}cmap+='endcmap CMapName currentdict /CMap defineresource pop end end';
 const unicode=add(stream('',bytes(cmap))),type0=add(`<< /Type /Font /Subtype /Type0 /BaseFont /MentoraOpenSans /Encoding /Identity-H /DescendantFonts [${cid} 0 R] /ToUnicode ${unicode} 0 R >>`);
 const mask=add(stream(`/Type /XObject /Subtype /Image /Width ${assets.width} /Height ${assets.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode`,dec(assets.logoAlpha)));
 const logo=add(stream(`/Type /XObject /Subtype /Image /Width ${assets.width} /Height ${assets.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask ${mask} 0 R`,dec(assets.logoRGB)));
 const annotations=links.map(link=>{const escaped=link.url.replace(/[^\x21-\x7e]/g,c=>encodeURIComponent(c)).replace(/[\\()]/g,'\\$&');return add(`<< /Type /Annot /Subtype /Link /Rect [${link.rect.join(' ')}] /Border [0 0 0] /A << /S /URI /URI (${escaped}) >> >>`);});
 const pageIds=pages.map((content,i)=>{const c=add(stream('',bytes(content)));return add(`<< /Type /Page /Parent ${tree} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${type0} 0 R >> /XObject << /Logo ${logo} 0 R >> >> /Contents ${c} 0 R ${i===1?`/Annots [${annotations.map(id=>id+' 0 R').join(' ')}]`:''} >>`);});
 objects[catalog-1]=`<< /Type /Catalog /Pages ${tree} 0 R /Lang (es-MX) >>`;objects[tree-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] /Count 2 >>`;
 const chunks=[bytes('%PDF-1.7\n%Mentora360\n')],offsets=[0];let position=chunks[0].length;objects.forEach((obj,i)=>{offsets.push(position);const c=join([bytes(`${i+1} 0 obj\n`),typeof obj==='string'?bytes(obj):obj,bytes('\nendobj\n')]);chunks.push(c);position+=c.length;});chunks.push(bytes(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${position}\n%%EOF`));
 return {bytes:join(chunks),audit};
}
return {build};
})();
