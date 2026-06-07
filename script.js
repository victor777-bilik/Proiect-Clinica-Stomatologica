/* ── PAGE TRANSITIONS ── */
(function () {
  var navigating = false;

  /* Intrare: .hero/.page-hero pornesc ascunse din CSS (opacity:0 translateY:28px)
     și urcă lin — inversul exact al ieșirii, fără niciun blit posibil */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      var els = document.querySelectorAll('.hero,.page-hero');
      els.forEach(function (el) {
        el.style.transition = 'opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1)';
        el.style.opacity    = '1';
        el.style.transform  = 'translateY(0)';
      });
    });
  });

  /* Ieșire: tot conținutul cade jos și dispare.
     Flag navigating blochează orice click ulterior — fără race condition. */
  document.addEventListener('click', function (e) {
    if (navigating) { e.preventDefault(); return; }
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || /^(#|http|mailto|tel)/.test(href)) return;
    e.preventDefault();
    navigating = true;

    document.querySelectorAll('.hero,.page-hero,section,footer').forEach(function (el) {
      el.style.transition = 'opacity 0.5s ease-in, transform 0.5s ease-in';
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(28px)';
    });

    setTimeout(function () { window.location.href = href; }, 540);
  });
})();

/* ── BURGER MENU ── */
(function () {
  var nav    = document.querySelector('nav');
  var burger = document.querySelector('.nav-burger');
  if (!nav || !burger) return;

  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    nav.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); });
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) nav.classList.remove('open');
  });
})();

/* ── WARP SHADER BACKGROUND ── */
(function () {
  var canvas = document.getElementById('mesh-bg');
  if (!canvas) return;
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  var VS = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main(){
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  var FS = `
    precision mediump float;
    uniform float u_time;
    uniform vec2  u_res;
    varying vec2  v_uv;

    /* Dark-indigo palette — toate sub 30% lightness */
    const vec3 C0 = vec3(0.035, 0.035, 0.043);
    const vec3 C1 = vec3(0.055, 0.060, 0.112);
    const vec3 C2 = vec3(0.080, 0.090, 0.178);
    const vec3 C3 = vec3(0.118, 0.135, 0.262);

    float hash(vec2 p){
      p  = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 19.19);
      return fract(p.x * p.y);
    }
    float vnoise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(
        mix(hash(i),           hash(i+vec2(1,0)), f.x),
        mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p){
      float v=0.0, a=0.5;
      mat2  m = mat2(1.6,1.2,-1.2,1.6);
      for(int i=0;i<5;i++){
        v += a*vnoise(p); p = m*p; a *= 0.5;
      }
      return v;
    }

    void main(){
      vec2 uv = v_uv;
      uv.x *= u_res.x / u_res.y;

      float t = u_time * 0.055;

      /* Domain warp — primul strat, mai amplu */
      vec2 q = vec2(fbm(uv + t),
                    fbm(uv + vec2(5.2, 1.3) + t * 0.8));

      /* Al doilea strat — warp pe warp (efectul de swirl) */
      vec2 r = vec2(fbm(uv + 6.0*q + vec2(1.7, 9.2) + t*0.15),
                    fbm(uv + 6.0*q + vec2(8.3, 2.8) + t*0.12));

      /* Componenta checks distorsionata */
      vec2 sw = uv + 3.0*r;
      float chk = smoothstep(0.35, 0.65,
                    fract(dot(sin(sw * 3.0), vec2(0.7, 0.7))));

      float f = fbm(uv + 4.0*r);
      f = clamp(f*1.2 - 0.1, 0.0, 1.0);
      f = mix(f, chk, 0.28);

      vec3 col;
      if      (f < 0.40) col = mix(C0, C1,  f / 0.40);
      else if (f < 0.70) col = mix(C1, C2, (f-0.40)/0.30);
      else if (f < 0.92) col = mix(C2, C3, (f-0.70)/0.22);
      else               col = C3;

      float vig = 1.0 - smoothstep(0.5, 1.5,
                    length((v_uv - 0.5) * vec2(1.0, u_res.y/u_res.x)));
      col *= vig;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uRes  = gl.getUniformLocation(prog, 'u_res');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  var start = null;
  function frame(ts) {
    if (!start) start = ts;
    gl.uniform1f(uTime, (ts - start) * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();


/* ── GYRO ROBOT ── */
(function () {
  if (!window.DeviceOrientationEvent) return;

  var viewer = document.querySelector('spline-viewer');
  if (!viewer) return;

  var tX = 0, tY = 0, cX = 0, cY = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }

  (function tick() {
    cX = lerp(cX, tX, 0.09);
    cY = lerp(cY, tY, 0.09);
    viewer.style.transform =
      'rotateX(' + cX + 'deg) rotateY(' + cY + 'deg)' +
      ' translateX(' + (cY * -4) + 'px) translateY(' + (cX * -3) + 'px)';
    requestAnimationFrame(tick);
  })();

  function onOrientation(e) {
    var beta  = e.beta  || 0;
    var gamma = e.gamma || 0;
    tX = Math.max(-30, Math.min(30, (beta - 75) * 0.5));
    tY = Math.max(-30, Math.min(30, gamma * 0.5));
  }

  function startGyro() {
    window.addEventListener('deviceorientation', onOrientation);
  }

  /* iOS 13+ cere permisiune explicită la primul click pe chat */
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    var chatBtn = document.querySelector('.chat-trigger');
    if (chatBtn) {
      chatBtn.addEventListener('click', function () {
        DeviceOrientationEvent.requestPermission()
          .then(function (r) { if (r === 'granted') startGyro(); })
          .catch(function () {});
      }, { once: true });
    }
  } else {
    startGyro();
  }
})();

/* ── FADE-IN ON SCROLL ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('section:not(.hero), .sync-wrap, .feature-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

/* hero visibility handled by page transition entrance above */


/* ── CHAT WIDGET ── */
(function () {
  let open = false, started = false;

  const BOT = {
    salut: [
      'Buna ziua! Ma bucur ca esti aici. &#128522;',
      'Sunt asistentul virtual Med Life Dental &mdash; te pot ajuta cu programari, preturi, informatii despre tratamente sau orice intrebare despre clinica noastra.',
      'Cu ce te pot ajuta astazi?'
    ],
    multumesc: [
      'Cu drag! &#128522; Suntem aici pentru tine oricand.',
      'Daca mai ai intrebari, nu ezita sa scrii. Te asteptam la clinica!'
    ],
    programare: [
      'Programarile se fac rapid si simplu! &#128197;',
      'Poti programa <strong>online</strong> completand formularul din pagina Contact, sau telefonic la <strong>0800 123 456</strong> (linie gratuita, L-V 08:00&ndash;20:00, Sam 09:00&ndash;15:00).',
      'Confirmare in maxim <strong>2 ore</strong> si consultatia initiala este <strong>100% GRATUITA</strong>. Vrei sa te ajut cu un serviciu anume?'
    ],
    implant: [
      'Implanturile dentare sunt specialitatea noastra! &#129463;',
      'Lucram exclusiv cu branduri premium: <strong>Straumann SLA Active</strong> de la 1.200&euro; si <strong>Nobel Biocare</strong> de la 1.400&euro;. Pretul include CBCT 3D, consultatie gratuita si planul de tratament.',
      'Avem si solutia <strong>All-on-4</strong> (arcada completa pe 4 implanturi) de la 4.500&euro;. Finantare in rate 0% disponibila. Vrei sa programam o consultatie gratuita?'
    ],
    invisalign: [
      'Oferim <strong>Invisalign</strong> &mdash; aparatul dentar invizibil preferat de adulti! &#128578;',
      'Preturile incep de la <strong>2.800&euro;</strong> (Invisalign Lite) si <strong>5.500&euro;</strong> (Invisalign Comprehensive pentru cazuri complexe).',
      'Durata medie a tratamentului: 6&ndash;18 luni. Includem consultatia de evaluare GRATUITA cu scanner 3D. Vrei sa afli daca esti candidat potrivit?'
    ],
    ortodontie: [
      'Oferim toate tipurile de aparate dentare! &#128578;',
      '<strong>Aparat metalic</strong> de la 1.500&euro; &bull; <strong>Aparat ceramic</strong> de la 2.200&euro; &bull; <strong>Invisalign</strong> de la 2.800&euro; &bull; <strong>Aparat lingual</strong> (invizibil complet) de la 3.500&euro;.',
      'Consultatia de evaluare ortodontica este GRATUITA. Ortodontistul nostru are 11 ani experienta. Programam?'
    ],
    albire: [
      'Albirea profesionala la clinica da rezultate spectaculoase! &#10024;',
      'Oferim <strong>Zoom Whitening</strong> (sedinta 45 min, 8&ndash;12 nuante mai deschis) la <strong>350 lei</strong> si albire acasa cu gutiere personalizate la <strong>280 lei</strong>.',
      'Rezultatul dureaza 1&ndash;2 ani cu intretinere minima. Procedura este sigura si nedureroasa. Vrei sa programam o sedinta?'
    ],
    fatete: [
      'Fatetele ceramice transforma complet zambetul! &#128522;',
      '<strong>Fatete din portelan</strong>: 800&ndash;1.200&euro;/dinte &bull; <strong>Fatete compozit</strong>: 300&ndash;500&euro;/dinte &bull; <strong>Smile Design 3D</strong> complet (10 fatete): de la 7.500&euro;.',
      'Inainte de orice tratament facem un <strong>mock-up digital</strong> &mdash; vezi exact cum va arata zambetul tau. Consultatia Smile Design este GRATUITA!'
    ],
    smiledesign: [
      'Smile Design 3D este serviciul nostru premium de transformare a zambetului! &#127775;',
      'Procesul: consultatie + fotografii &rarr; design digital 3D &rarr; mock-up (proba) &rarr; tratament. Poti vedea rezultatul INAINTE sa inceapa tratamentul.',
      'Un Smile Design complet (8&ndash;10 fatete + albire) pleaca de la <strong>6.500&euro;</strong>. Consultatia initiala este GRATUITA. Cati dinti vrei sa transformi?'
    ],
    canal: [
      'Tratamentul de canal (endodontie) nu mai este dureros cu tehnologia noastra moderna! &#128138;',
      'Lucram cu <strong>microscopul dentar</strong> si <strong>apex locator digital</strong> pentru precizie maxima. Dinti monoradiculari: 700&ndash;900 lei &bull; Pluriradiculari: 1.000&ndash;1.400 lei.',
      'Tratamentul se face de obicei intr-o singura sedinta. Anestezie locala moderna &mdash; procedura complet nedureroasa. Programam?'
    ],
    gingii: [
      'Problemele cu gingiile (parodontoza) se trateaza eficient daca sunt depistate la timp! &#128139;',
      'Oferim <strong>detartraj profesional</strong> (150&ndash;200 lei), <strong>chiuretaj subgingival</strong> si <strong>tratament laser Fotona</strong> pentru dezinfectie profunda.',
      'Recomandam un control parodontal anual. Consultatia parodontala este inclusa in consultatia generala GRATUITA. Vrei sa programam?'
    ],
    copii: [
      'Avem cabinet dedicat stomatologiei pediatrice! &#128118;',
      'Medicul nostru pediatru are 8 ani experienta cu copii de la <strong>2 ani</strong>. Cabinet decorat special, atmosfera prietenoasa, fara stres pentru copil.',
      'Sigilari: 120 lei/dinte &bull; Obturatie copii: 150&ndash;250 lei &bull; Prima vizita (acomodare): GRATUITA. La ce varsta are copilul tau?'
    ],
    asigurare: [
      'Acceptam <strong>30+ asiguratori</strong> de sanatate! &#128203;',
      'Printre partenerii nostri: <strong>Regina Maria, Medicover, Signal Iduna, Groupama, Allianz, Generali, Omniasig, Uniqa, BCR Asigurari, AXA, Gothaer, MedExtra</strong>.',
      'Verifica acoperirea cu asiguratorul tau si spune-ne numele acestuia la programare &mdash; ne ocupam noi de decontare. Ce asigurator ai?'
    ],
    sedare: [
      'Intelegem perfect anxietatea dentara &mdash; suntem specializati in pacienti cu frica de dentist! &#128138;',
      'Oferim <strong>sedare constienta intravenoasa</strong> (esti relaxat si cooperant, nu adormit) la 300&ndash;500 lei/sedinta. Sub sedare putem face mai multe tratamente intr-o singura vizita.',
      'De asemenea avem <strong>anestezie topica</strong> (crema) inainte de injectie &mdash; nu vei simti nimic. Spune-ne de teama ta la programare si ne adaptam 100%.'
    ],
    laser: [
      'Clinica noastra are laserul dentar <strong>Fotona LightWalker</strong> &mdash; cel mai avansat din Romania! &#128165;',
      'Aplicatii: tratament parodontal fara bisturiu &bull; albire accelerata laser &bull; chirurgie gingivala fara suturi &bull; dezinfectie canale radiculare &bull; afte si leziuni moi.',
      'Tratamentul laser este <strong>nedureros, fara sangerare, recuperare rapida</strong>. Vrei sa afli daca laserul e recomandat pentru problema ta?'
    ],
    protetica: [
      'Oferim toate solutiile de protetica dentara! &#128521;',
      '<strong>Coroana ceramica</strong>: 600&ndash;900&euro; &bull; <strong>Coroana zirconiu</strong>: 400&ndash;600&euro; &bull; <strong>Punte ceramica</strong> (3 elemente): 1.200&ndash;1.800&euro; &bull; <strong>Proteza mobila</strong>: 800&ndash;1.400 lei.',
      'Coronoanele noastre se fac in laborator propriu &mdash; garantie <strong>5 ani</strong>. Culoarea si forma se aleg impreuna cu tine. Vrei o evaluare gratuita?'
    ],
    rate: [
      'Oferim finantare flexibila pentru tratamente! &#128176;',
      '<strong>Rate 0% dobanda</strong> prin partenerii nostri bancari: pana la <strong>48 de rate</strong>, aprobare in 30 minute, suma minima 1.000 lei.',
      'Acceptam si carduri de credit, plata in avans (5% reducere) si decontare asigurari. Nici un tratament nu trebuie amanat din motive financiare. Ce tratament te intereseaza?'
    ],
    locatie: [
      'Ne gasesti in centrul Bucurestiului! &#128205;',
      '<strong>Str. Mihai Eminescu 42, Sector 2, Bucuresti</strong> &mdash; la 2 minute de statie metrou <strong>Piata Romana</strong> (linia M2).',
      'Program: <strong>L&ndash;V 08:00&ndash;20:00</strong> &bull; <strong>Sambata 09:00&ndash;15:00</strong>. Parcare disponibila in zona (strada si parcarea Intercontinental). Vrei sa-ti trimit indicatii pe Google Maps?'
    ],
    program: [
      'Programul nostru de lucru: &#128337;',
      '<strong>Luni &ndash; Vineri: 08:00 &ndash; 20:00</strong><br><strong>Sambata: 09:00 &ndash; 15:00</strong><br><strong>Urgente: 24/7</strong> la 0800 456 789.',
      'In zilele de sarbatoare legala avem program redus (08:00&ndash;14:00). Suntem inchisi duminica (cu exceptia urgentelor). Vrei sa programam o vizita?'
    ],
    urgenta: [
      '&#128680; Urgenta dentara? Actionam imediat!',
      'Suna acum la <strong>0800 456 789</strong> &mdash; linie de urgente <strong>NON-STOP 24/7</strong>, inclusiv weekend si sarbatori legale.',
      'Tratam in aceeasi zi: durere acuta &bull; abces dentar &bull; dinte spart/cazut &bull; trauma faciala &bull; umflaturi. Cabinetul de urgente este mereu disponibil &mdash; vino direct!'
    ],
    pret: [
      'Consultatia initiala este <strong>100% GRATUITA</strong> la Med Life Dental! &#127881;',
      'Cateva preturi orientative: Albire Zoom <strong>350 lei</strong> &bull; Obturatie <strong>200&ndash;450 lei</strong> &bull; Detartraj <strong>150 lei</strong> &bull; Fateta ceramica <strong>800&ndash;1.200&euro;</strong> &bull; Implant Straumann <strong>1.200&euro;</strong>.',
      'Acceptam 30+ asiguratori si oferim rate 0% dobanda. Toate preturile sunt transparente &mdash; primesti deviz scris inainte de orice tratament. Ce te intereseaza?'
    ],
    servicii: [
      'Oferim toate specialitatile stomatologice sub un singur acoperis! &#127968;',
      '<strong>Implantologie</strong> Straumann/Nobel &bull; <strong>Smile Design 3D</strong> &bull; <strong>Invisalign</strong> &bull; <strong>Chirurgie Laser</strong> Fotona &bull; <strong>Endodontie</strong> cu microscop &bull; <strong>Sedare</strong> intravenoasa &bull; <strong>Stomatologie pediatrica</strong> &bull; <strong>Protetica</strong> zirconiu.',
      'Avem 12 specialitati, 15 ani experienta si peste 20.000 de pacienti tratati. Scrie-mi despre ce problema te confrunti si iti spun ce serviciu ti se potriveste!'
    ],
    implant_all4: [
      'All-on-4 este solutia revolutionara pentru dintii lipsa pe o arcada intreaga! &#129331;',
      'Pe <strong>4 implanturi</strong> se monteaza o arcada completa fixa &mdash; iesi din clinica in aceeasi zi cu dinti noi. Pret: <strong>4.500&euro;/arcada</strong> (ambele arcade: 8.500&euro;).',
      'Procedura dureaza 3&ndash;4 ore, sub sedare constienta. Garantie 10 ani pe implanturi. Vrei o consultatie de evaluare GRATUITA?'
    ],
    default: [
      'Multumesc pentru mesaj! &#128522; Nu am inteles exact intrebarea ta.',
      'Pot sa te ajut cu: <strong>programari</strong> &bull; <strong>preturi</strong> &bull; <strong>implante</strong> &bull; <strong>Invisalign</strong> &bull; <strong>albire</strong> &bull; <strong>urgente</strong> &bull; <strong>locatie</strong> &bull; <strong>program</strong> &bull; <strong>asigurari</strong> &bull; <strong>rate</strong>.',
      'Scrie orice dintre aceste subiecte sau suna direct la <strong>0800 123 456</strong> (gratuit, L-V 08:00&ndash;20:00).'
    ]
  };

  function ts() {
    return new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  }

  function addMsg(html, isBot) {
    const wrap = document.getElementById('chatMsgs');
    const d = document.createElement('div');
    d.className = 'cmsg ' + (isBot ? 'bot' : 'usr');
    d.innerHTML = '<div class="cmsg-bubble">' + html + '</div><div class="cmsg-time">' + ts() + '</div>';
    wrap.appendChild(d);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function showTyping() {
    const wrap = document.getElementById('chatMsgs');
    const d = document.createElement('div');
    d.className = 'cmsg bot';
    d.id = 'chatTyping';
    d.innerHTML = '<div class="typing-ind"><div class="tdot"></div><div class="tdot"></div><div class="tdot"></div></div>';
    wrap.appendChild(d);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function killTyping() {
    const t = document.getElementById('chatTyping');
    if (t) t.remove();
  }

  function botReply(msgs) {
    let delay = 700;
    msgs.forEach(function (m) {
      setTimeout(function () { showTyping(); }, delay);
      setTimeout(function () { killTyping(); addMsg(m, true); }, delay + 800 + m.length * 12);
      delay += 900 + m.length * 14;
    });
  }

  function classify(txt) {
    const l = txt.toLowerCase()
      .replace(/ă/g,'a').replace(/â/g,'a').replace(/î/g,'i')
      .replace(/ș/g,'s').replace(/ş/g,'s')
      .replace(/ț/g,'t').replace(/ţ/g,'t');

    if (/bun[a]?|salut|hello|hei|hey|buna ziua/.test(l))           return BOT.salut;
    if (/multumesc|mersi|merci|ms|super|perfect|ok/.test(l))        return BOT.multumesc;
    if (/urgent|doare|durere|abces|umflat|spart|trauma|caz|ajutor/.test(l)) return BOT.urgenta;
    if (/all.?on.?4|all on|arcada|dinti lipsa|toti dintii/.test(l)) return BOT.implant_all4;
    if (/implant/.test(l))                                          return BOT.implant;
    if (/invisalign|invizibil|transparent/.test(l))                 return BOT.invisalign;
    if (/ortodont|aparat dentar|aparat fix|dinti strambi|indrept/.test(l)) return BOT.ortodontie;
    if (/albi|whitening|zoom|dinti galbeni|culoare dinti/.test(l))  return BOT.albire;
    if (/fateta|fatete|portelan|smile design|zambet nou|transform/.test(l)) return BOT.fatete;
    if (/smile|design/.test(l))                                     return BOT.smiledesign;
    if (/canal|endodont|radacin|nerv dinte/.test(l))                return BOT.canal;
    if (/gingii|parodon|tartru|sangerare|detartraj/.test(l))        return BOT.gingii;
    if (/copil|copii|pediatr|bebelus|bebe|varsta mica/.test(l))     return BOT.copii;
    if (/asigur|regina maria|medicover|signal|groupama|allianz|decontare/.test(l)) return BOT.asigurare;
    if (/frica|anxietate|teama|spaima|sedar|anestezie|adormit|nu suport/.test(l))  return BOT.sedare;
    if (/laser|fotona|fara bisturiu/.test(l))                       return BOT.laser;
    if (/coroana|punte|proteza|zirconiu|protetica/.test(l))         return BOT.protetica;
    if (/rate|finant|credit|dobanda|platesc|plata/.test(l))         return BOT.rate;
    if (/unde|adresa|locatie|cum ajung|metrou|parcare|strada/.test(l)) return BOT.locatie;
    if (/program|orar|ore|deschis|inchis|sambata|duminica/.test(l)) return BOT.program;
    if (/program|programez|programar|rezerv|vizita|consultatie|vin/.test(l)) return BOT.programare;
    if (/pret|cost|cat costa|scump|ieftin|euro|lei|tarif|oferta/.test(l)) return BOT.pret;
    if (/servicii|oferi|ce faceti|specialitat|tratament/.test(l))   return BOT.servicii;
    return BOT.default;
  }

  window.chatSend = function () {
    const ta = document.getElementById('chatTA');
    const txt = ta.value.trim();
    if (!txt) return;
    addMsg(txt, false);
    ta.value = '';
    ta.style.height = 'auto';
    document.getElementById('chatQR').style.display = 'none';
    botReply(classify(txt));
  };

  window.sendQR = function (_btn, txt) {
    document.getElementById('chatQR').style.display = 'none';
    addMsg(txt, false);
    botReply(classify(txt));
  };

  function initChat() {
    if (started) return;
    started = true;
    const greets = [
      'Buna! Sunt asistentul virtual al clinicii Med Life Dental. &#128075;',
      'Te pot ajuta cu programari, informatii despre tratamente sau urgente dentare.',
      'Alege una din optiunile de mai jos sau scrie direct intrebarea ta:'
    ];
    greets.forEach(function (g, i) {
      setTimeout(function () { addMsg(g, true); }, 350 + i * 1100);
    });
  }

  function hideSplineLogo() {
    const sv = document.querySelector('.chat-scene spline-viewer');
    if (!sv) return;
    let attempts = 0;
    const timer = setInterval(function () {
      attempts++;
      const root = sv.shadowRoot;
      if (root) {
        const targets = root.querySelectorAll(
          '#logo, [id*="logo"], a[href*="spline"], [class*="logo"], [class*="watermark"], [class*="brand"]'
        );
        targets.forEach(function (el) { el.style.setProperty('display', 'none', 'important'); });
        if (targets.length > 0 || attempts > 20) clearInterval(timer);
      }
      if (attempts > 30) clearInterval(timer);
    }, 300);
  }

  window.toggleChat = function () {
    open = !open;
    document.getElementById('chatPanel').classList.toggle('visible', open);
    document.getElementById('chatIconOpen').style.display  = open ? 'none'  : 'block';
    document.getElementById('chatIconClose').style.display = open ? 'block' : 'none';
    const n = document.getElementById('chatNotif');
    if (n) n.style.display = 'none';
    if (open) { initChat(); hideSplineLogo(); }
  };
})();
