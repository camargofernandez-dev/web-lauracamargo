/* Web de Laura Camargo Fernández
   El contenido se edita en la carpeta /content (desde el panel de edición).
   Este archivo solo se encarga de mostrarlo. */

const NAV = [
  ["index.html", "Inicio", "inicio"],
  ["investigacion.html", "Investigación", "investigacion"],
  ["libro.html", "El libro", "libro"],
  ["medios.html", "Medios", "medios"],
  ["conferencias.html", "Conferencias", "conferencias"],
  ["sobre-mi.html", "Sobre mí", "sobre-mi"],
  ["contacto.html", "Contacto", "contacto"],
];

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const paras = (txt) =>
  String(txt || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

const safeUrl = (u) => {
  u = String(u || "").trim();
  if (!u) return "";
  if (/^(https?:|mailto:|\/|media\/)/i.test(u)) return u;
  return "https://" + u;
};

const img = (src) => {
  const u = String(src || "").trim();
  if (!u) return "";
  return u.startsWith("http") ? u : u.replace(/^\/+/, "");
};

const fmtFecha = (f) => {
  if (!f) return "";
  const d = new Date(f);
  if (isNaN(d)) return esc(f);
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
};

const iniciales = (nombre) =>
  String(nombre || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const slug = (_s, i) => "linea-" + (i + 1);

const youtubeId = (u) => {
  const m = String(u || "").match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
};

async function load(name) {
  const r = await fetch(`content/${name}.json`, { cache: "no-cache" });
  if (!r.ok) throw new Error("No se pudo cargar " + name);
  return r.json();
}

function header(sitio, page) {
  const links = NAV.map(
    ([href, label, key]) =>
      `<a href="${href === "index.html" ? "./" : href}" ${key === page ? 'aria-current="page"' : ""}>${label}</a>`
  ).join("");
  return `
  <div class="wrap header-inner">
    <a class="brand" href="./">${esc(sitio.nombre)}</a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
    <nav id="nav">${links}</nav>
  </div>`;
}

function footer(sitio) {
  const enlaces = (sitio.enlaces || [])
    .filter((e) => e.url)
    .map((e) => `<a href="${esc(safeUrl(e.url))}" target="_blank" rel="noopener">${esc(e.nombre)}</a>`)
    .join("");
  return `
  <div class="wrap footer-inner">
    <div>
      <strong>${esc(sitio.nombre)}</strong><br>
      ${sitio.email ? `<a href="mailto:${esc(sitio.email)}">${esc(sitio.email)}</a>` : ""}
    </div>
    <div class="footer-links">${enlaces}</div>
    <div class="legal">
      <a href="aviso-legal.html">Aviso legal y privacidad</a>
      <span>© ${new Date().getFullYear()} ${esc(sitio.nombre)}</span>
    </div>
  </div>`;
}

function retrato(sitio, cls = "") {
  return sitio.foto
    ? `<img class="retrato ${cls}" src="${esc(img(sitio.foto))}" alt="${esc(sitio.nombre)}">`
    : `<div class="retrato retrato-vacio ${cls}" aria-hidden="true">${esc(iniciales(sitio.nombre))}</div>`;
}

function portada(libro, cls = "") {
  return libro.portada
    ? `<img class="portada ${cls}" src="${esc(img(libro.portada))}" alt="Portada de ${esc(libro.titulo)}">`
    : `<div class="portada portada-vacia ${cls}"><span>${esc(libro.titulo)}</span><small>${esc(libro.editorial)}</small></div>`;
}

function botonesCompra(libro) {
  return (libro.compra || [])
    .filter((c) => c.url)
    .map((c) => `<a class="btn" href="${esc(safeUrl(c.url))}" target="_blank" rel="noopener">Comprar en ${esc(c.tienda)}</a>`)
    .join("");
}

const ICONOS = {
  tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
  radio: '<rect x="3" y="8" width="18" height="12" rx="2"/><circle cx="8.5" cy="14" r="2.8"/><path d="M14 12h4M14 16h4M7 8l10-5"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
  prensa: '<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><path d="M7 8h7M7 12h7M7 16h4"/>',
  cita: '<path d="M6 7h5v5c0 3-2 5-5 6M14 7h5v5c0 3-2 5-5 6"/>',
  atril: '<rect x="3" y="4" width="18" height="11" rx="1.5"/><path d="M12 15v5M8 21l4-3 4 3M7 11l3-2.5 3 2 4-3.5"/>',
  libro: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
};
const icono = (n, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n] || ""}</svg>`;

const esPresentacion = (a) => a.tipo === "Conferencia" && /^presentaci/i.test(a.titulo || "");
const esConferencia = (a) => a.tipo === "Conferencia";

function estilo(a) {
  if (esPresentacion(a)) return { c1: "#6e2a20", c2: "#9a4334", i: "libro", cta: "Más información", etiqueta: "Presentación" };
  return (
    {
      "Televisión": { c1: "#1f3a5f", c2: "#33598a", i: "tv", cta: "Ver programa" },
      "Radio": { c1: "#7a2e22", c2: "#a34a3b", i: "radio", cta: "Escuchar" },
      "Podcast": { c1: "#45325f", c2: "#6a5190", i: "mic", cta: "Escuchar" },
      "Prensa": { c1: "#1d2433", c2: "#3b465c", i: "prensa", cta: "Leer artículo" },
      "Entrevista": { c1: "#24504d", c2: "#387571", i: "cita", cta: "Leer entrevista" },
      "Conferencia": { c1: "#1f3a5f", c2: "#2e6177", i: "atril", cta: "Más información" },
    }[a.tipo] || { c1: "#1d2433", c2: "#3b465c", i: "cita", cta: "Ver" }
  );
}

function itemMedio(a) {
  const e = estilo(a);
  const yt = youtubeId(a.enlace);
  const foto = a.imagen ? img(a.imagen) : yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : "";
  const etiqueta = e.etiqueta || a.tipo;
  const cover = foto
    ? `<div class="cover cover-foto"><img src="${esc(foto)}" alt="" loading="lazy">${yt ? `<span class="cover-play">${icono("play")}</span>` : ""}</div>`
    : `<div class="cover cover-gen" style="--c1:${e.c1};--c2:${e.c2}">
        ${icono(e.i, "cover-fondo")}
        <span class="cover-icono">${icono(e.i)}</span>
        <span class="cover-medio">${esc(a.medio)}</span>
      </div>`;
  const cuerpo = `
    ${cover}
    <div class="medio-cuerpo">
      <div class="medio-meta"><span class="etiqueta" style="--c1:${e.c1}">${esc(etiqueta)}</span><time>${fmtFecha(a.fecha)}</time></div>
      <h3>${esc(a.titulo)}</h3>
      ${foto ? `<p class="medio-fuente">${esc(a.medio)}</p>` : ""}
      ${a.descripcion ? `<p class="medio-desc">${esc(a.descripcion)}</p>` : ""}
      ${a.enlace ? `<span class="medio-cta">${yt ? "Ver vídeo" : e.cta} <span aria-hidden="true">→</span></span>` : ""}
    </div>`;
  const attrs = `class="medio${a.enlace ? " con-enlace" : ""}" data-tipo="${esc(a.tipo)}" data-cat="${esPresentacion(a) ? "presentacion" : "conferencia"}"`;
  return a.enlace
    ? `<a ${attrs} href="${esc(safeUrl(a.enlace))}" target="_blank" rel="noopener">${cuerpo}</a>`
    : `<article ${attrs}>${cuerpo}</article>`;
}

function filtrosConEfecto(selector, campo) {
  setTimeout(() => {
    document.querySelectorAll(".filtro").forEach((b) =>
      b.addEventListener("click", () => {
        document.querySelectorAll(".filtro").forEach((x) => x.setAttribute("aria-pressed", x === b));
        const f = b.dataset.filtro;
        document.querySelectorAll(selector).forEach((el) => {
          el.hidden = f !== "todo" && el.dataset[campo] !== f;
        });
        document.querySelectorAll(".anio-grupo").forEach((g) => {
          g.hidden = ![...g.querySelectorAll(".medio")].some((m) => !m.hidden);
        });
      })
    );
  });
}

function cabeceraPagina(kicker, titulo, intro, cifras, filtros) {
  return `
    <section class="pagina-hero">
      <div class="wrap">
        <p class="kicker">${esc(kicker)}</p>
        <h1>${esc(titulo)}</h1>
        <div class="lead">${paras(intro)}</div>
        <div class="cifras">${cifras.map(([n, t]) => `<div class="cifra"><strong>${n}</strong><span>${esc(t)}</span></div>`).join("")}</div>
        <div class="filtros">${filtros}</div>
      </div>
    </section>`;
}

const ordenar = (lista) =>
  [...(lista || [])].sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));

/* ---------- Páginas ---------- */

const PAGES = {
  async inicio(sitio) {
    const [inv, libro, medios] = await Promise.all([load("investigacion"), load("libro"), load("medios")]);
    const tarjetas = (inv.lineas || [])
      .map(
        (l, i) => `
        <a class="tarjeta" href="investigacion.html#${slug(l.titulo, i)}">
          <span class="num">${String(i + 1).padStart(2, "0")}</span>
          <h3>${esc(l.titulo)}</h3>
          <p>${esc(l.resumen)}</p>
          <span class="mas">Leer más →</span>
        </a>`
      )
      .join("");
    const ultimas = ordenar(medios.apariciones).slice(0, 3).map(itemMedio).join("");
    return `
    <section class="hero">
      <div class="wrap hero-inner">
        <div class="hero-text">
          <p class="kicker">${esc(sitio.cargo)}</p>
          <h1>${esc(sitio.nombre)}</h1>
          <p class="lead">${esc(sitio.titular)}</p>
          <div class="acciones">
            <a class="btn" href="investigacion.html">Ver mi investigación</a>
            <a class="btn btn-ghost" href="contacto.html">Contacto</a>
          </div>
        </div>
        ${retrato(sitio, "hero-retrato")}
      </div>
    </section>

    <section class="libro-destacado">
      <div class="wrap libro-inner">
        ${portada(libro, "libro-portada")}
        <div>
          <p class="kicker">Nuevo libro · ${esc(libro.editorial)} ${esc(libro.anio)}</p>
          <h2>${esc(libro.titulo)}</h2>
          ${libro.subtitulo ? `<p class="subtitulo">${esc(libro.subtitulo)}</p>` : ""}
          <p class="gancho">${esc(libro.gancho)}</p>
          <div class="acciones">
            <a class="btn btn-claro" href="libro.html">Descubre el libro</a>
            ${(() => {
              const c = (libro.compra || []).find((x) => x.url);
              return c ? `<a class="btn btn-ghost-claro" href="${esc(safeUrl(c.url))}" target="_blank" rel="noopener">Comprar</a>` : "";
            })()}
          </div>
        </div>
      </div>
    </section>

    <section class="wrap seccion">
      <div class="presentacion">${paras(sitio.presentacion)}</div>
      <div class="seccion-cab">
        <h2>Líneas de investigación</h2>
        <a href="investigacion.html">Ver todas →</a>
      </div>
      <div class="tarjetas">${tarjetas}</div>
    </section>

    <section class="wrap seccion">
      <div class="seccion-cab">
        <h2>Últimas apariciones</h2>
        <span class="enlaces-cab"><a href="medios.html">Medios →</a> · <a href="conferencias.html">Conferencias →</a></span>
      </div>
      <div class="medios-lista">${ultimas}</div>
    </section>`;
  },

  async investigacion() {
    const inv = await load("investigacion");
    const indice = (inv.lineas || [])
      .map((l, i) => `<li><a href="#${slug(l.titulo, i)}">${esc(l.titulo)}</a></li>`)
      .join("");
    const bloques = (inv.lineas || [])
      .map((l, i) => {
        const pubs = (l.publicaciones || [])
          .filter((p) => p.referencia)
          .map(
            (p) =>
              `<li>${esc(p.referencia)}${p.enlace ? ` <a href="${esc(safeUrl(p.enlace))}" target="_blank" rel="noopener">Enlace ↗</a>` : ""}</li>`
          )
          .join("");
        return `
        <article class="linea" id="${slug(l.titulo, i)}">
          <span class="num">${String(i + 1).padStart(2, "0")}</span>
          <div>
            <h2>${esc(l.titulo)}</h2>
            <p class="lead">${esc(l.resumen)}</p>
            ${paras(l.descripcion)}
            ${pubs ? `<h3>Publicaciones relacionadas</h3><ul class="pubs">${pubs}</ul>` : ""}
          </div>
        </article>`;
      })
      .join("");
    return `
    <header class="cabecera wrap">
      <p class="kicker">Investigación</p>
      <h1>Líneas de investigación</h1>
      <div class="lead">${paras(inv.introduccion)}</div>
      <ol class="indice">${indice}</ol>
    </header>
    <section class="wrap">${bloques}</section>`;
  },

  async libro() {
    const libro = await load("libro");
    const resenas = (libro.resenas || [])
      .filter((r) => r.cita)
      .map(
        (r) =>
          `<blockquote><p>${r.enlace ? `<a href="${esc(safeUrl(r.enlace))}" target="_blank" rel="noopener">${esc(r.cita)} ↗</a>` : esc(r.cita)}</p><cite>${esc(r.fuente)}</cite></blockquote>`
      )
      .join("");
    return `
    <section class="libro-pagina">
      <div class="wrap libro-inner">
        ${portada(libro, "libro-portada grande")}
        <div>
          <p class="kicker">${esc(libro.editorial)} · ${esc(libro.anio)}</p>
          <h1>${esc(libro.titulo)}</h1>
          ${libro.subtitulo ? `<p class="subtitulo">${esc(libro.subtitulo)}</p>` : ""}
          <p class="gancho">${esc(libro.gancho)}</p>
          <div class="acciones">${botonesCompra(libro).replace(/class="btn"/g, 'class="btn btn-claro"')}</div>
        </div>
      </div>
    </section>
    <section class="wrap seccion estrecha">
      <h2>Sinopsis</h2>
      ${paras(libro.sinopsis)}
      ${libro.fragmento ? `<p><a class="btn" href="${esc(img(libro.fragmento))}" target="_blank" rel="noopener">Leer un fragmento (PDF)</a></p>` : ""}
      ${resenas ? `<h2>Reseñas y críticas</h2><div class="resenas">${resenas}</div>` : ""}
    </section>`;
  },

  async medios() {
    const m = await load("medios");
    const lista = ordenar(m.apariciones).filter((a) => !esConferencia(a));
    const orden = ["Televisión", "Radio", "Prensa", "Entrevista", "Podcast"];
    const tipos = [...new Set(lista.map((a) => a.tipo).filter(Boolean))].sort((a, b) => orden.indexOf(a) - orden.indexOf(b));
    const cuenta = (t) => lista.filter((a) => a.tipo === t).length;
    const filtros = [["todo", "Todo"], ...tipos.map((t) => [t, t])]
      .map(([v, t], i) => `<button class="filtro" data-filtro="${esc(v)}" aria-pressed="${i === 0}">${esc(t)}</button>`)
      .join("");
    filtrosConEfecto(".medio", "tipo");
    const cifras = [[lista.length, "apariciones"], ...tipos.slice(0, 3).map((t) => [cuenta(t), t === "Televisión" ? "en televisión" : t === "Radio" ? "en radio" : t === "Prensa" ? "en prensa" : t.toLowerCase()])];
    return `
    ${cabeceraPagina("Medios", "En los medios", m.introduccion || "Entrevistas y apariciones en televisión, radio, prensa y pódcast.", cifras, filtros)}
    <section class="wrap medios-lista medios-pagina">${lista.map(itemMedio).join("")}</section>`;
  },

  async conferencias() {
    const m = await load("medios");
    const lista = ordenar(m.apariciones).filter(esConferencia);
    const pres = lista.filter(esPresentacion).length;
    const filtros = [["todo", "Todas"], ["presentacion", "Presentaciones del libro"], ["conferencia", "Conferencias y seminarios"]]
      .map(([v, t], i) => `<button class="filtro" data-filtro="${v}" aria-pressed="${i === 0}">${esc(t)}</button>`)
      .join("");
    filtrosConEfecto(".medio", "cat");
    const anios = [...new Set(lista.map((a) => String(a.fecha || "").slice(0, 4)))];
    const grupos = anios
      .map((y) => `
      <section class="anio-grupo">
        <h2 class="anio"><span>${esc(y || "Sin fecha")}</span></h2>
        <div class="medios-lista">${lista.filter((a) => String(a.fecha || "").slice(0, 4) === y).map(itemMedio).join("")}</div>
      </section>`)
      .join("");
    const cifras = [[lista.length, "intervenciones"], [pres, "presentaciones del libro"], [lista.length - pres, "conferencias y seminarios"]];
    return `
    ${cabeceraPagina("Conferencias", "Conferencias y presentaciones", m.introduccion_conferencias || "Conferencias, seminarios, debates y presentaciones de «Trumpismo discursivo» en universidades, librerías y centros culturales de España y América Latina.", cifras, filtros)}
    <div class="wrap conferencias-pagina">${grupos}</div>`;
  },

  async "sobre-mi"(sitio) {
    return `
    <section class="wrap seccion sobre">
      ${retrato({ ...sitio, foto: sitio.foto_secundaria || sitio.foto }, "sobre-retrato")}
      <div>
        <p class="kicker">Sobre mí</p>
        <h1>${esc(sitio.nombre)}</h1>
        ${paras(sitio.biografia)}
        ${sitio.cv ? `<p><a class="btn" href="${esc(img(sitio.cv))}" target="_blank" rel="noopener">Descargar CV (PDF)</a></p>` : ""}
      </div>
    </section>`;
  },

  async contacto(sitio) {
    const enlaces = (sitio.enlaces || [])
      .filter((e) => e.url)
      .map((e) => `<li><a href="${esc(safeUrl(e.url))}" target="_blank" rel="noopener">${esc(e.nombre)} ↗</a></li>`)
      .join("");
    const motivos = ["Entrevista o medios de comunicación", "Conferencia, charla o presentación", "Investigación o colaboración académica", "El libro «Trumpismo discursivo»", "Otro motivo"];
    return `
    <section class="contacto-hero">
      <div class="wrap contacto-grid">
        <div class="contacto-info">
          <p class="kicker">Contacto</p>
          <h1>Hablemos</h1>
          ${paras(sitio.texto_contacto) || "<p>Para entrevistas, conferencias, presentaciones del libro o colaboraciones de investigación, escríbeme a través del formulario o directamente por correo.</p>"}
          <div class="contacto-dato">
            <span class="contacto-icono" aria-hidden="true">✉</span>
            <div><small>Correo</small><a href="mailto:${esc(sitio.email)}">${esc(sitio.email)}</a></div>
          </div>
          <div class="contacto-dato">
            <span class="contacto-icono" aria-hidden="true">⌂</span>
            <div><small>Universidad</small><span>Universitat de les Illes Balears · Palma</span></div>
          </div>
          ${enlaces ? `<h2>También en</h2><ul class="enlaces">${enlaces}</ul>` : ""}
        </div>
        <form class="form-contacto" id="form-contacto" novalidate>
          <h2>Envíame un mensaje</h2>
          <div class="campo">
            <label for="fc-nombre">Nombre</label>
            <input id="fc-nombre" name="nombre" type="text" autocomplete="name" required placeholder="Tu nombre">
          </div>
          <div class="campo">
            <label for="fc-email">Correo electrónico</label>
            <input id="fc-email" name="email" type="email" autocomplete="email" required placeholder="tu@correo.com">
          </div>
          <div class="campo">
            <label>Motivo</label>
            <div class="motivos">
              ${motivos.map((m, i) => `<label class="chip"><input type="radio" name="motivo" value="${esc(m)}" ${i === 0 ? "required" : ""}><span>${esc(m)}</span></label>`).join("")}
            </div>
          </div>
          <div class="campo">
            <label for="fc-mensaje">Mensaje</label>
            <textarea id="fc-mensaje" name="mensaje" rows="5" required placeholder="Cuéntame brevemente…"></textarea>
          </div>
          <input type="text" name="_honey" class="oculto" tabindex="-1" autocomplete="off">
          <label class="acepto"><input type="checkbox" name="privacidad" required><span>He leído la <a href="aviso-legal.html">política de privacidad</a> y acepto que se usen mis datos para responderme.</span></label>
          <button class="btn" type="submit">Enviar mensaje</button>
          <p class="form-estado" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>`;
  },

  async "aviso-legal"(sitio) {
    return `
    <section class="wrap seccion estrecha">
      <h1>Aviso legal y privacidad</h1>
      <h2>Titular</h2>
      <p>Esta web es un sitio personal e informativo cuya titular es ${esc(sitio.nombre)}. Contacto: <a href="mailto:${esc(sitio.email)}">${esc(sitio.email)}</a>.</p>
      <h2>Datos personales</h2>
      <p>Los datos que envíes por el formulario de contacto o por correo (nombre, correo electrónico y mensaje) se usarán solo para responderte y no se cederán a terceros con otros fines. El formulario se entrega a través del servicio FormSubmit, que reenvía el mensaje a la dirección de contacto. Puedes pedir que se borren tus datos escribiendo a ese mismo correo.</p>
      <h2>Cookies</h2>
      <p>Esta web no utiliza cookies propias de seguimiento ni de publicidad. Los vídeos insertados se cargan en el modo de privacidad mejorada de YouTube.</p>
      <h2>Enlaces externos</h2>
      <p>La web contiene enlaces a sitios de terceros (medios, editoriales, tiendas), cuyos contenidos y políticas son responsabilidad de sus titulares.</p>
    </section>`;
  },
};

/* ---------- Estilos añadidos (v1.0) ---------- */

document.head.insertAdjacentHTML(
  "beforeend",
  `<style>
  .medio-img{width:calc(100% + 3rem);margin:-1.5rem -1.5rem 1rem;max-width:none;aspect-ratio:16/9;object-fit:cover;border-radius:var(--radio) var(--radio) 0 0}
  blockquote p a{color:var(--libro);text-decoration:none}
  blockquote p a:hover{text-decoration:underline}
  .retrato{box-shadow:0 18px 40px rgba(29,36,51,.12)}
  .contacto-hero{background:linear-gradient(180deg,#f1ebe1 0%,var(--papel) 100%);padding:4.5rem 0 5rem}
  .contacto-grid{display:grid;grid-template-columns:1fr 1.15fr;gap:3.5rem;align-items:start}
  .contacto-info h1{margin-top:.2rem}
  .contacto-dato{display:flex;gap:.9rem;align-items:center;margin:1.1rem 0}
  .contacto-dato small{display:block;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;opacity:.6}
  .contacto-dato a{color:var(--acento);font-weight:600;text-decoration:none}
  .contacto-icono{width:2.6rem;height:2.6rem;border-radius:50%;background:var(--acento);color:#fff;display:grid;place-items:center;font-size:1.1rem;flex:none}
  .form-contacto{background:#fff;border-radius:18px;padding:2.2rem;box-shadow:0 24px 60px rgba(29,36,51,.10);border-top:4px solid var(--libro)}
  .form-contacto h2{margin:0 0 1.4rem;font-size:1.45rem}
  .campo{margin-bottom:1.15rem}
  .campo>label{display:block;font-size:.82rem;font-weight:600;margin-bottom:.4rem}
  .campo input,.campo textarea{width:100%;font:inherit;padding:.8rem .95rem;border:1px solid #ddd5c8;border-radius:10px;background:var(--papel);transition:border-color .2s,box-shadow .2s;box-sizing:border-box}
  .campo input:focus,.campo textarea:focus{outline:none;border-color:var(--acento);box-shadow:0 0 0 3px rgba(31,58,95,.15);background:#fff}
  .campo textarea{resize:vertical;min-height:7rem}
  .motivos{display:flex;flex-wrap:wrap;gap:.5rem}
  .chip input{position:absolute;opacity:0;pointer-events:none}
  .chip span{display:inline-block;padding:.5rem .9rem;border:1px solid #ddd5c8;border-radius:999px;font-size:.85rem;cursor:pointer;transition:all .15s;background:var(--papel)}
  .chip:hover span{border-color:var(--acento)}
  .chip input:checked+span{background:var(--acento);border-color:var(--acento);color:#fff}
  .chip input:focus-visible+span{box-shadow:0 0 0 3px rgba(31,58,95,.25)}
  .acepto{display:flex;gap:.55rem;align-items:flex-start;font-size:.82rem;line-height:1.45;margin:.4rem 0 1.3rem}
  .acepto input{margin-top:.2rem}
  .form-contacto .btn{width:100%;text-align:center;cursor:pointer;font-family:inherit;font-weight:600}
  .form-contacto .btn[disabled]{opacity:.6;cursor:wait}
  .form-estado{margin:.9rem 0 0;font-size:.9rem;min-height:1.2em}
  .form-estado.ok{color:#2c6e49}.form-estado.error{color:var(--libro)}
  .form-ok{text-align:center;padding:2.5rem 1rem}
  .form-ok .check{width:3.5rem;height:3.5rem;border-radius:50%;background:#2c6e49;color:#fff;display:grid;place-items:center;font-size:1.6rem;margin:0 auto 1rem}
  .oculto{position:absolute;left:-9999px}
  @media (max-width:820px){.contacto-grid{grid-template-columns:1fr;gap:2.2rem}.contacto-hero{padding:2.5rem 0 3rem}.form-contacto{padding:1.5rem}}
  </style>`
);

/* ---------- Formulario de contacto ---------- */

function activarFormulario(sitio) {
  const f = document.getElementById("form-contacto");
  if (!f) return;
  const estado = f.querySelector(".form-estado");
  f.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    estado.className = "form-estado";
    const d = Object.fromEntries(new FormData(f));
    if (!d.nombre?.trim() || !d.email?.trim() || !d.mensaje?.trim()) return aviso("Rellena tu nombre, tu correo y el mensaje.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return aviso("Revisa la dirección de correo.");
    if (!d.motivo) return aviso("Elige un motivo.");
    if (!d.privacidad) return aviso("Debes aceptar la política de privacidad.");
    if (d._honey) return;
    const boton = f.querySelector("button");
    boton.disabled = true; boton.textContent = "Enviando…";
    const destino = sitio.formulario_destino || sitio.email;
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(destino)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Web · ${d.motivo} · ${d.nombre}`,
          _template: "table", _captcha: "false", _replyto: d.email,
          Nombre: d.nombre, Correo: d.email, Motivo: d.motivo, Mensaje: d.mensaje,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || String(j.success) !== "true") throw new Error(j.message || r.status);
      f.innerHTML = `<div class="form-ok"><div class="check">✓</div><h2>¡Mensaje enviado!</h2><p>Gracias, ${esc(d.nombre.split(" ")[0])}. Te responderé lo antes posible.</p></div>`;
    } catch (e) {
      console.error(e);
      boton.disabled = false; boton.textContent = "Enviar mensaje";
      const asunto = encodeURIComponent(`Web · ${d.motivo} · ${d.nombre}`);
      const cuerpo = encodeURIComponent(`${d.mensaje}\n\n— ${d.nombre} (${d.email})`);
      estado.className = "form-estado error";
      estado.innerHTML = `No se ha podido enviar ahora mismo. <a href="mailto:${esc(sitio.email)}?subject=${asunto}&body=${cuerpo}">Envíalo por correo</a> con un clic.`;
    }
  });
  function aviso(t) { estado.className = "form-estado error"; estado.textContent = t; }
}

/* ---------- Arranque ---------- */

(async function () {
  const page = document.body.dataset.page || "inicio";
  const main = document.getElementById("main");
  try {
    const sitio = await load("sitio");
    document.getElementById("cabecera").innerHTML = header(sitio, page);
    document.getElementById("pie").innerHTML = footer(sitio);
    main.innerHTML = await PAGES[page](sitio);

    const btn = document.querySelector(".menu-btn");
    btn?.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-abierto");
      btn.setAttribute("aria-expanded", open);
    });

    if (page === "contacto") activarFormulario(sitio);

    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  } catch (e) {
    main.innerHTML = `<div class="wrap seccion"><p>No se ha podido cargar el contenido. Recarga la página.</p></div>`;
    console.error(e);
  }
})();
