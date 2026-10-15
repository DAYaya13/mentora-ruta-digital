'use strict';
const questions = [
 {title:'¿En qué área te gustaría aplicar la tecnología?',options:['Educación y capacitación.','Seguridad, salud y medio ambiente.','Administración y oficina.','Negocio o emprendimiento.','Otra área.'],other:4},
 {title:'¿Qué actividad te gustaría hacer más fácil?',hint:'Elige la que más tiempo te quita.',options:['Organizar archivos, pendientes e información.','Crear presentaciones, documentos o materiales.','Entender datos y preparar reportes.','Hacer tareas repetitivas y dar seguimiento.','Buscar información y resolver dudas.']},
 {title:'¿Qué herramientas utilizas actualmente?',hint:'Puedes elegir varias opciones.',multiple:true,options:['Correo electrónico y WhatsApp.','Word, Excel o PowerPoint.','Google Drive, Documentos o Hojas de cálculo.','Canva u otras herramientas de diseño.','ChatGPT, Gemini u otros asistentes de IA.','Apenas estoy empezando.','Otras.'],other:6},
 {title:'¿Cómo te sientes al usar una herramienta nueva?',options:['Necesito que me acompañen paso a paso.','Puedo usarla si tengo una guía sencilla.','Me gusta explorar y aprender por mi cuenta.','Tengo experiencia y quiero avanzar más.']},
 {title:'¿Qué te gustaría conseguir primero?',options:['Ahorrar tiempo en mi trabajo.','Organizarme mejor y evitar olvidos.','Crear materiales más claros y profesionales.','Tomar decisiones con mis datos.','Aprender algo útil y aplicarlo con confianza.']}
];
// Reglas locales: la respuesta 2 fija la ruta; las demás adaptan contexto,
// herramientas, nivel y ejercicio. No se puntúa ni se infiere dominio por uso.
const routes=[
 {name:'Organización digital',why:'Quieres reunir archivos, pendientes e información para encontrarlos y darles seguimiento.',steps:['Reúne cinco archivos o pendientes de una sola actividad.','Crea tres categorías claras y usa nombres con tema y fecha.','Añade una lista con responsable, fecha y estado; comprueba que puedes encontrar un archivo.'],examples:['los materiales de un curso, separados por sesión y fecha','las listas de inspección, separadas por área y fecha, sin datos personales','los documentos de una reunión, con acuerdos y fechas de entrega','los pedidos de una semana, con fecha y estado','los archivos y pendientes de una actividad de tu trabajo']},
 {name:'Creación de materiales',why:'Quieres convertir ideas en documentos o materiales fáciles de comprender.',steps:['Elige un mensaje y escribe a quién va dirigido y qué necesita saber.','Prepara una página o tres diapositivas con título, tres ideas y una acción final.','Revisa el tamaño de letra, el contraste y la exactitud; pide a alguien que explique el mensaje con sus palabras.'],examples:['una guía de una página para explicar una actividad de capacitación','una ficha de prevención basada en un procedimiento vigente, revisada por la persona responsable','un resumen de reunión con decisiones y próximas acciones','una ficha de producto con descripción, precio confirmado y condiciones','una guía breve para explicar una tarea de tu área']},
 {name:'Análisis de datos',why:'Quieres comprender datos y preparar reportes que ayuden a decidir.',steps:['Escribe una pregunta concreta y reúne cinco filas de datos de ejemplo sin información personal.','Organiza una tabla con encabezados, fechas y unidades; revisa duplicados y celdas vacías.','Calcula un total o compara dos categorías; redacta una conclusión y lo que los datos todavía no permiten afirmar.'],examples:['una tabla de asistencia ficticia por sesión para detectar qué sesión tuvo menos participación','un registro ficticio de inspecciones por área para comparar pendientes, sin emitir conclusiones clínicas','una tabla de gastos por categoría para explicar la diferencia entre dos semanas','una tabla de ventas de ejemplo por producto para comparar cantidades e importes','una tabla de ejemplo con cantidades y fechas de una actividad de tu trabajo']},
 {name:'Automatización',why:'Quieres hacer más llevaderas las tareas repetitivas y su seguimiento.',steps:['Elige una tarea que se repite y escribe cuándo empieza, qué necesita y cómo termina.','Ordena sus pasos en una lista y marca dónde necesitas revisar o decidir tú.','Crea una plantilla y prueba el recorrido con un caso ficticio. Antes de integrar herramientas, comprueba permisos, errores y quién revisará el resultado.'],examples:['el seguimiento de una capacitación: lista de participantes ficticios, confirmación y recordatorio revisado','el seguimiento de una inspección: hallazgo de ejemplo, responsable y fecha de revisión, sin automatizar decisiones de seguridad','el seguimiento de solicitudes: recepción, revisión y respuesta con una plantilla','el seguimiento de un pedido ficticio: recepción, confirmación y aviso de entrega','el seguimiento de una solicitud habitual: recepción, revisión y cierre']},
 {name:'Inteligencia artificial para consulta y apoyo',why:'Quieres buscar información y resolver dudas con un apoyo que puedas revisar.',steps:['Elige una duda concreta y escribe el contexto, sin nombres, datos personales ni información confidencial.','Pide una explicación breve con un ejemplo y solicita las fuentes originales; trata la respuesta como un borrador.','Abre y verifica las fuentes, su fecha y si respaldan la respuesta. Corrige errores antes de aplicar o compartir lo aprendido.'],examples:['pedir ideas para explicar un concepto de clase y contrastarlas con el material del curso','pedir una explicación de un término de prevención y contrastarla con fuentes oficiales; las decisiones de salud y seguridad requieren revisión profesional','pedir un esquema de un documento con información ficticia y comprobar cada dato','pedir ideas de preguntas frecuentes de un producto y contrastarlas con sus condiciones reales','pedir una explicación de un concepto de tu área y verificarla en fuentes originales']}
];
const benefits=['ahorrar tiempo en tu trabajo','organizarte mejor y evitar olvidos','crear materiales más claros y profesionales','tomar decisiones con tus datos','aprender algo útil y aplicarlo con confianza'];
const exerciseFocus=['Haz una prueba pequeña y anota qué pasos te resultan más sencillos; mide el tiempo solo si quieres comparar después.','Deja una fecha y una próxima acción visibles para retomar el ejercicio sin olvidos.','Presenta el resultado en una página clara con título, tres ideas y una acción final.','Anota un dato que puedas comprobar y la decisión que ayuda a tomar; si falta información, señálalo.','Repite el ejercicio con un segundo caso y escribe qué aprendiste y qué duda quieres resolver.'];
const support=['Hazlo con acompañamiento paso a paso, una acción a la vez, y pide revisar cada paso antes de continuar.','Usa una guía corta como lista de verificación y revisa el resultado al terminar.','Explora con una copia de prueba y anota qué cambios te ayudan a resolver la tarea.','Empieza con este caso acotado; después compara dos maneras de resolverlo y documenta sus límites antes de ampliarlo.'];
let step=0;
let answers=[null,null,[],null,null];
let details={0:'',2:''};
const quiz=document.querySelector('#quiz');
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function focusHeading(){quiz.querySelector('[data-heading]').focus({preventScroll:true});}
function renderQuestion(moveFocus=false){
 const q=questions[step];
 quiz.innerHTML=`<div class="progress-label"><span>Pregunta ${step+1} de 5</span><span>Tu punto de partida</span></div><progress value="${step+1}" max="5" aria-label="Pregunta ${step+1} de 5"></progress><form novalidate><fieldset aria-describedby="hint error"><legend><h2 data-heading tabindex="-1">${q.title}</h2></legend><p id="hint" class="hint">${q.hint||'Elige una opción.'}</p><div class="options">${q.options.map((label,i)=>`<label class="option"><input type="${q.multiple?'checkbox':'radio'}" name="answer" value="${i}" ${q.multiple?answers[step].includes(i)?'checked':'':answers[step]===i?'checked':''}><span>${label}</span></label>`).join('')}</div>${q.other!==undefined?`<div class="other-field" ${hasOther()?'':'hidden'}><label for="other">${step===0?'¿Qué otra área?':'¿Qué otras herramientas?'} <span>(opcional)</span></label><input id="other" type="text" maxlength="120" autocomplete="off" value="${escapeHTML(details[step])}"></div>`:''}<p id="error" class="error" role="alert"></p></fieldset><div class="quiz-actions"><button type="button" id="previous" class="button secondary" ${step===0?'disabled':''}>← Anterior</button><button type="submit" class="button primary">${step===4?'Ver mi ruta digital':'Continuar'} <span aria-hidden="true">→</span></button></div></form>`;
 quiz.querySelectorAll('[name="answer"]').forEach(input=>input.addEventListener('change',()=>{
  const value=Number(input.value);
  if(q.multiple){if(input.checked){answers[step]=value===5?[5]:[...answers[step].filter(v=>v!==5),value];}else answers[step]=answers[step].filter(v=>v!==value);quiz.querySelectorAll('[name="answer"]').forEach(el=>el.checked=answers[step].includes(Number(el.value)));}
  else answers[step]=value;
  const other=quiz.querySelector('.other-field');if(other)other.hidden=!hasOther();quiz.querySelector('#error').textContent='';
 }));
 quiz.querySelector('#other')?.addEventListener('input',e=>details[step]=e.target.value);
 quiz.querySelector('#previous').addEventListener('click',()=>{if(step>0){step--;renderQuestion(true);}});
 quiz.querySelector('form').addEventListener('submit',e=>{e.preventDefault();if(q.multiple?!answers[step].length:answers[step]===null){quiz.querySelector('#error').textContent=q.multiple?'Selecciona al menos una opción para continuar. Si estás comenzando, también hay una opción para ti.':'Elige la opción que más se parezca a ti para continuar.';quiz.querySelector('input').focus();return;}if(step<4){step++;renderQuestion(true);}else renderResult();});
 if(moveFocus){focusHeading();window.scrollTo({top:0});}
}
function hasOther(){const q=questions[step];return q.multiple?answers[step].includes(q.other):answers[step]===q.other;}
function chooseTools(route,selected){
 const office=selected.includes(1),google=selected.includes(2),design=selected.includes(3),ai=selected.includes(4),messaging=selected.includes(0);
 if(route===0||route===3)return google?['Google Drive','Hojas de cálculo de Google']:office?['Carpetas de tu equipo','Excel']:messaging?['Carpetas de tu equipo','Calendario del correo']:['Carpetas de tu equipo','Una lista de tareas'];
 if(route===1)return design?['Canva']:office?['Word','PowerPoint']:google?['Documentos de Google','Presentaciones de Google']:['Un editor de documentos'];
 if(route===2)return office?['Excel']:google?['Hojas de cálculo de Google']:['Una hoja de cálculo'];
 return ai?['El asistente de IA que ya utilizas','Tu navegador']:['Tu navegador','Un asistente de IA como ChatGPT o Gemini'];
}
function recommendation(a,other){const r=routes[a[1]],beginner=a[2].includes(5)||a[3]===0;
 const area=a[0]===4?(other[0].trim()||'tu área profesional'):questions[0].options[a[0]].replace(/\.$/,'').toLowerCase();
 const steps=[...r.steps];if(beginner)steps[0]='Empieza con un solo caso sencillo. '+steps[0];steps[2]+=' '+exerciseFocus[a[4]];
 return {name:r.name,why:`${r.why} En ${area}, puedes empezar con un caso pequeño para ${benefits[a[4]]}.`,steps,example:`Prueba con ${r.examples[a[0]]}. ${exerciseFocus[a[4]]}`,support:support[beginner?0:a[3]],tools:chooseTools(a[1],a[2]),familiar:a[2].includes(5)?'Empieza por reconocer la herramienta y completar una sola acción con ayuda.':a[2].every(v=>v===6)?`Parte de una herramienta que ya conozcas${other[2].trim()?': '+other[2].trim():''}; si no permite el ejercicio, usa una de estas alternativas.`:'Parte de las herramientas que has indicado cuando encajen con la tarea. Haberlas usado no implica dominar sus funciones.'};}
function renderResult(){
 const r=recommendation(answers,details);
 setView('result');
 quiz.innerHTML=`<p class="result-tag">TU RUTA DIGITAL SUGERIDA</p><h2 class="result-heading" data-heading tabindex="-1">${r.name}</h2><div class="result-grid"><div><p class="result-why">${escapeHTML(r.why)}</p><p class="result-support">${r.support}</p></div><div class="result-steps"><h3>Tus tres primeros pasos</h3><ol class="steps">${r.steps.map(s=>`<li>${s}</li>`).join('')}</ol></div></div><details class="result-details"><summary>Una idea para tu trabajo</summary><p>${r.example}</p></details><details class="result-details"><summary>Herramientas para comenzar</summary><p>${escapeHTML(r.familiar)}</p><div class="tools">${r.tools.map(t=>`<span class="tool">${t}</span>`).join('')}</div><p class="note">La disponibilidad, los planes y las funciones pueden variar. Revisa las condiciones de cada herramienta antes de usarla.</p></details><div class="download-gift"><button type="button" id="download-route" class="button primary">Descargar gratis mi ruta digital</button><p>Llévate tus primeros pasos y un ejercicio práctico para comenzar.</p><p id="download-status" class="note" role="status" aria-live="polite"></p><p id="download-error" class="error" role="alert"></p></div><div class="result-contact"><p>¿Quieres aplicar esta ruta a tu trabajo? Contacta a Mentora 360</p><a class="button secondary" href="${escapeHTML(primaryContact().url)}">${primaryContact().label}</a></div><p class="note">Esta ruta es una orientación inicial basada en tus respuestas.</p><button id="reset" class="button secondary result-reset">Volver a responder</button>`;
 quiz.querySelector('#download-route').addEventListener('click',()=>downloadRoute(r,[...answers.slice(0,2),[...answers[2]],...answers.slice(3)],{...details}));
 quiz.querySelector('#reset').addEventListener('click',()=>{answers=[null,null,[],null,null];details={0:'',2:''};step=0;startDiagnosis();});
 focusHeading();window.scrollTo({top:0});
}
const routeSlugs=['organizacion-digital','creacion-de-materiales','analisis-de-datos','automatizacion','inteligencia-artificial'];
function downloadData(r,a,other){
 const area=a[0]===4?(other[0].trim()||'tu área profesional'):questions[0].options[a[0]].replace(/\.$/,'').toLowerCase();
 const context=['una actividad de capacitación','una inspección de prevención con datos ficticios','una reunión de oficina','un pedido ficticio de tu negocio','una actividad de '+area][a[0]];
 const activities=['preparar los materiales de una sesión','dar seguimiento a una inspección ficticia','revisar una solicitud interna','confirmar un pedido ficticio','dar seguimiento a una solicitud de '+area];
 const topics=['explicar un tema de capacitación','explicar un procedimiento de prevención vigente, con revisión de la persona responsable','resumir los acuerdos de una reunión','describir un producto con condiciones verificadas','explicar una tarea de '+area];
 const exercises=[
 {title:'Una carpeta que puedas volver a encontrar',context:'Trabaja con '+context+'. Usa copias de prueba o archivos ficticios.',instructions:['Crea una carpeta de trabajo con tres subcarpetas: Por revisar, En proceso y Terminado.','Coloca cinco archivos de prueba en la subcarpeta que corresponda. Acuerda una regla: AAAA-MM-DD_tema_version.','Renombra un archivo con esa regla y comprueba que puedes encontrarlo por tema y fecha.'],expected:'Una carpeta con tres subcarpetas, cinco archivos clasificados y una regla de nombres escrita.'},
 {title:'Un mensaje breve y fácil de entender',context:'Prepara una pieza para '+topics[a[0]]+'.',instructions:['Escribe el objetivo de la pieza: qué debe comprender o hacer la persona que la lea.','Prepara una página o tres diapositivas: un título, tres ideas clave y una acción final. Usa información pública o ficticia.','Revisa los datos, el tamaño de letra y el contraste. Comprueba que la acción final sea clara.'],expected:'Una pieza breve con objetivo, tres ideas clave y una acción final identificables.'},
 {title:'Cinco registros para responder una pregunta',context:'Crea datos ficticios sobre '+context+'. No uses nombres ni información personal.',instructions:['Haz una tabla con cinco registros y columnas de fecha, actividad y cantidad. Usa cantidades de ejemplo: 2, 4, 1, 3 y 5.','Pregunta: ¿qué registro tiene la mayor cantidad? Revisa las cinco filas y señala el registro correspondiente.','Escribe una frase con la respuesta y aclara que estos datos ficticios sirven para practicar, no para decidir sobre casos reales.'],expected:'Una tabla de cinco registros y una respuesta comprobable: el quinto registro tiene la mayor cantidad, 5.'},
 {title:'Antes de automatizar, describe la tarea',context:'Elige la tarea repetitiva de '+activities[a[0]]+'. No necesitas instalar herramientas.',instructions:['Escribe qué inicia la tarea: por ejemplo, recibir una solicitud. Anota qué información necesitas, con datos ficticios.','Enumera sus pasos en orden y marca las revisiones o decisiones que debe hacer una persona.','Describe el resultado esperado y recorre la lista con un caso de prueba. Corrige el orden si falta algo.'],expected:'Una ficha con el inicio de la tarea, los pasos, los puntos de revisión humana y el resultado esperado.'},
 {title:'Una consulta que puedas verificar',context:'Practica cómo '+r.example.replace(/^Prueba con /,'').split('. ')[0]+'. Usa únicamente información pública o ficticia.',instructions:['Prueba esta instrucción: «Explica en tres ideas un concepto relacionado con '+area+'. Usa información pública, da un ejemplo ficticio y cita una fuente original que pueda consultar».','Abre la fuente citada, revisa su fecha y comprueba si respalda las tres ideas. Si la fuente no existe o no coincide, no uses la afirmación.','Corrige la respuesta y escribe qué verificaste y qué sigue siendo incierto. No introduzcas datos personales ni información confidencial.'],expected:'Una consulta, una fuente revisada y tres ideas anotadas como verificadas, corregidas o pendientes de comprobar.'}
 ];
 const beginner=a[2].includes(5)||a[3]===0;
 const objective='Practicar en '+area+' para '+benefits[a[4]]+', '+(beginner?'con un caso pequeño y acompañamiento paso a paso.':a[3]===1?'siguiendo una guía sencilla.':a[3]===2?'explorando con una copia de prueba.':'comparando alternativas en un caso acotado antes de ampliarlo.');
 return {name:r.name,why:r.why,steps:[...r.steps],support:r.support,objective,exercise:exercises[a[1]],contactUrl:validUrl?url:null,officialLinks:window.MENTORA_CONFIG.officialLinks,filename:'mentora360-mi-ruta-'+routeSlugs[a[1]]+'.pdf'};
}
async function downloadRoute(r,a,other){
 const button=quiz.querySelector('#download-route'),status=quiz.querySelector('#download-status'),error=quiz.querySelector('#download-error');
 button.disabled=true;button.setAttribute('aria-busy','true');error.textContent='';status.textContent='Preparando tu PDF de dos páginas…';
 try{
  const data=downloadData(r,a,other);const result=await window.MentoraPDF.build(data);
  const blob=new Blob([result.bytes],{type:'application/pdf'}),href=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=href;link.download=data.filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(href),60000);
  status.textContent='Tu PDF está listo. Revisa las descargas de tu navegador.';button.textContent='Descargar gratis mi ruta digital';
 }catch(e){status.textContent='';error.textContent='No pudimos generar el PDF. Tus respuestas siguen aquí. Pulsa «Reintentar descarga» para volver a intentarlo.';button.textContent='Reintentar descarga';}
 finally{button.disabled=false;button.removeAttribute('aria-busy');}
}
function setView(view){
 document.body.dataset.view=view;
 document.body.className=view+'-view';
 document.querySelector('#presentation').hidden=view!=='intro';
 document.querySelector('#diagnostico').hidden=view==='intro';
 document.querySelector('.nav-cta').hidden=view!=='intro';
 document.querySelector('.intro-nav').hidden=view!=='intro';
 document.querySelector('.back-home').hidden=view==='intro';
 document.querySelector('#acompanamiento').hidden=view!=='intro';
 document.querySelector('.skip').href=view==='intro'?'#contenido':'#diagnostico';
}
function startDiagnosis(){setView('quiz');renderQuestion(true);window.scrollTo({top:0});}
function goHome(){setView('intro');document.querySelector('h1').focus({preventScroll:true});window.scrollTo({top:0});}
document.querySelector('h1').setAttribute('tabindex','-1');
document.querySelectorAll('a[href="#diagnostico"]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();startDiagnosis();}));
document.querySelectorAll('a[href="#inicio"]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();goHome();}));

const officialLinks=window.MENTORA_CONFIG.officialLinks;
const url=window.MENTORA_CONFIG?.contactUrl?.trim();
const validUrl=url&&/^(https:\/\/|mailto:)[^\s]+$/i.test(url);
function primaryContact(){return validUrl?{url,label:url.startsWith('mailto:')?'Escríbenos por correo':/https:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(url)?'Escríbenos por WhatsApp':'Contacta a Mentora 360'}:{url:officialLinks.find(link=>link.name==='Instagram').url,label:'Escríbenos por Instagram'};}
const contact=primaryContact();
document.querySelector('#contact').className='contact-block';
document.querySelector('#contact').innerHTML=`<a class="button primary" href="${escapeHTML(contact.url)}">${contact.label}</a>`;
const socialIcons={
 web:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/>',
 instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
 facebook:'<path d="M14 21v-8h3l.5-4H14V7c0-1 .5-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8"/>',
 youtube:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/>',
 linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M11 17v-7h3v1c1-2 4-1 4 2v4M7 7v.1"/>'
};
document.querySelector('#official-links').innerHTML=officialLinks.map(link=>`<a href="${escapeHTML(link.url)}" aria-label="${link.name} oficial de Mentora 360"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${socialIcons[link.icon]}</svg><span>${link.name}</span></a>`).join('');
renderQuestion();
if(window.location.hash==='#diagnostico')startDiagnosis();
