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

const LINEA_ESTILOS = [
  { c1: "#6e2a20", c2: "#9a4334", i: "megafono" },
  { c1: "#1f3a5f", c2: "#33598a", i: "mapa" },
  { c1: "#2f4858", c2: "#4b6a7d", i: "cita" },
  { c1: "#24504d", c2: "#387571", i: "dialogo" },
  { c1: "#45325f", c2: "#6a5190", i: "musica" },
  { c1: "#7a5524", c2: "#a5763a", i: "puzle" },
];
Object.assign(ICONOS, {
  megafono: '<path d="M3 10v4h3l6 4V6l-6 4z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>',
  mapa: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  dialogo: '<path d="M4 4h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-4-3h-3"/>',
  musica: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  puzle: '<path d="M4 4h6v2a2 2 0 1 0 4 0V4h6v6h-2a2 2 0 1 0 0 4h2v6h-6v-2a2 2 0 1 0-4 0v2H4v-6h2a2 2 0 1 0 0-4H4z"/>',
  articulo: '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h6"/>',
  capitulo: '<path d="M2 5c3-1.5 6-1.5 10 1 4-2.5 7-2.5 10-1v14c-3-1.5-6-1.5-10 1-4-2.5-7-2.5-10-1z"/><path d="M12 6v14"/>',
});

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
        <h2>Participaciones recientes</h2>
        <span class="enlaces-cab"><a href="medios.html">Medios →</a> · <a href="conferencias.html">Conferencias →</a></span>
      </div>
      <div class="medios-lista">${ultimas}</div>
    </section>`;
  },

  async investigacion(sitio) {
    const inv = await load("investigacion");
    const lineas = inv.lineas || [];
    const pubs = [...(inv.publicaciones || [])]
      .filter((p) => p.titulo)
      .sort((a, b) => String(b.anio || "").localeCompare(String(a.anio || "")));
    const proyectos = (inv.proyectos || []).filter((p) => p.titulo);
    const lineaDe = (p) => lineas.findIndex((l) => l.titulo === p.linea);
    const est = (i) => LINEA_ESTILOS[(i < 0 ? LINEA_ESTILOS.length - 1 : i) % LINEA_ESTILOS.length];
    const nPubs = (i) => pubs.filter((p) => lineaDe(p) === i).length;

    const tarjetas = lineas
      .map((l, i) => {
        const e = est(i);
        return `
        <a class="linea-card" href="#${slug(l.titulo, i)}" style="--c1:${e.c1};--c2:${e.c2}">
          <span class="linea-card-top">${icono(e.i)}</span>
          <h3>${esc(l.titulo)}</h3>
        </a>`;
      })
      .join("");

    const bloques = lineas
      .map((l, i) => {
        const e = est(i);
        const n = nPubs(i);
        return `
        <article class="linea-bloque" id="${slug(l.titulo, i)}" style="--c1:${e.c1};--c2:${e.c2}">
          <div class="linea-panel">
            ${icono(e.i, "linea-icono")}
          </div>
          <div class="linea-texto">
            <h2>${esc(l.titulo)}</h2>
            <p class="lead">${esc(l.resumen)}</p>
            ${paras(l.descripcion)}
            ${n ? `<button class="btn btn-linea" data-ver-linea="${i}">Ver ${n === 1 ? "su publicación destacada" : "sus publicaciones destacadas"} ↓</button>` : ""}
          </div>
        </article>`;
      })
      .join("");

    const ordenTipos = ["Libro", "Artículo", "Capítulo de libro", "Tesis doctoral"];
    const tipos = [...new Set(pubs.map((p) => p.tipo).filter(Boolean))].sort((a, b) => (ordenTipos.indexOf(a) + 9) % 9 - (ordenTipos.indexOf(b) + 9) % 9);
    const plural = { "Libro": "Libros", "Artículo": "Artículos", "Capítulo de libro": "Capítulos de libro", "Tesis doctoral": "Tesis doctoral" };
    const filtrosLinea = [`<button class="filtro" data-grupo="linea" data-filtro="todo" aria-pressed="true">Todas las líneas</button>`]
      .concat(lineas.map((l, i) => `<button class="filtro" data-grupo="linea" data-filtro="${i}" aria-pressed="false"><span class="punto" style="background:${est(i).c1}"></span>${esc(l.titulo)}</button>`))
      .join("");
    const filtrosTipo = [`<button class="filtro" data-grupo="tipo" data-filtro="todo" aria-pressed="true">Todos los tipos</button>`]
      .concat(tipos.map((t) => `<button class="filtro" data-grupo="tipo" data-filtro="${esc(t)}" aria-pressed="false">${esc(plural[t] || t)}</button>`))
      .join("");

    const enlacePub = (u) => (/^[\w-]+\.html/.test(u || "") ? u : safeUrl(u));
    const tarjetaPub = (p) => {
      const i = lineaDe(p);
      const e = est(i);
      const ic = p.tipo === "Libro" || p.tipo === "Tesis doctoral" ? "libro" : p.tipo === "Artículo" ? "articulo" : "capitulo";
      const interno = /^[\w-]+\.html/.test(p.enlace || "");
      return `
      <article class="pub" data-linea="${i}" data-tipo="${esc(p.tipo)}" style="--c1:${e.c1};--c2:${e.c2}">
        <span class="pub-icono">${icono(ic)}</span>
        <div class="pub-cuerpo">
          <div class="pub-meta"><span class="etiqueta">${esc(p.tipo)}</span>${i >= 0 ? `<span class="pub-linea">${esc(lineas[i].titulo)}</span>` : ""}</div>
          <h3>${esc(p.titulo)}</h3>
          <p class="pub-autores">${esc(p.autores)} (${esc(p.anio)})</p>
          <p class="pub-fuente">${esc(p.fuente)}</p>
          ${p.enlace ? `<a class="pub-enlace" href="${esc(enlacePub(p.enlace))}"${interno ? "" : ' target="_blank" rel="noopener"'}>${interno ? "Ver el libro →" : "Leer en línea ↗"}</a>` : ""}
        </div>
      </article>`;
    };
    const anios = [...new Set(pubs.map((p) => String(p.anio || "")))];
    const listaPubs = anios
      .map((y) => `
      <section class="anio-grupo pub-anio">
        <h3 class="anio"><span>${esc(y)}</span></h3>
        <div class="pubs-lista">${pubs.filter((p) => String(p.anio || "") === y).map(tarjetaPub).join("")}</div>
      </section>`)
      .join("");

    const listaProy = proyectos
      .map((p) => `
      <article class="proyecto">
        <span class="proyecto-periodo">${esc(p.periodo)}</span>
        <h3>${esc(p.titulo)}</h3>
        ${p.investigadores ? `<p><small>Investigación principal</small>${esc(p.investigadores)}</p>` : ""}
        ${p.financiacion ? `<p><small>Financiación</small>${esc(p.financiacion)}</p>` : ""}
        ${p.codigo ? `<p class="proyecto-codigo">${esc(p.codigo)}</p>` : ""}
      </article>`)
      .join("");

    setTimeout(() => {
      const estado = { linea: "todo", tipo: "todo" };
      const aplicar = () => {
        document.querySelectorAll(".pub").forEach((el) => {
          el.hidden = (estado.linea !== "todo" && el.dataset.linea !== estado.linea) || (estado.tipo !== "todo" && el.dataset.tipo !== estado.tipo);
        });
        document.querySelectorAll(".pub-anio").forEach((g) => (g.hidden = ![...g.querySelectorAll(".pub")].some((m) => !m.hidden)));
        document.querySelectorAll(".filtro").forEach((b) => b.setAttribute("aria-pressed", estado[b.dataset.grupo] === b.dataset.filtro));
      };
      document.querySelectorAll(".filtro").forEach((b) =>
        b.addEventListener("click", () => {
          estado[b.dataset.grupo] = b.dataset.filtro;
          aplicar();
        })
      );
      document.querySelectorAll("[data-ver-linea]").forEach((b) =>
        b.addEventListener("click", () => {
          estado.linea = b.dataset.verLinea;
          estado.tipo = "todo";
          aplicar();
          document.getElementById("publicaciones").scrollIntoView({ behavior: "smooth" });
        })
      );
    });

    const cifras = [[pubs.length, "publicaciones"], [lineas.length, "líneas de investigación"], [proyectos.length, "proyectos financiados"]];
    return `
    ${cabeceraPagina("Investigación", "Investigación", inv.introduccion, cifras, "")}
    <section class="wrap">
      <div class="lineas-grid">${tarjetas}</div>
    </section>
    <section class="wrap lineas-detalle">${bloques}</section>
    <section class="publicaciones-sec" id="publicaciones">
      <div class="wrap">
        <h2 class="sec-titulo">Publicaciones destacadas</h2>
        <p class="lead nota-seleccion">Una selección de mi producción científica. ${(() => { const e = (sitio.enlaces || []).filter((x) => x.url && /orcid|dialnet|researchgate/i.test(x.url)); return e.length ? `La relación completa puede consultarse en ${e.map((x) => `<a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${esc(x.nombre)}</a>`).join(", ").replace(/, ([^,]*)$/, " y $1")}.` : ""; })()}</p>
        <div class="filtros">${filtrosLinea}</div>
        <div class="filtros filtros-tipo">${filtrosTipo}</div>
        ${listaPubs}
      </div>
    </section>
    ${listaProy ? `
    <section class="wrap proyectos-sec">
      <h2 class="sec-titulo">Proyectos de investigación financiados</h2>
      <p class="lead">Participo como miembro del equipo de investigación en estos proyectos competitivos.</p>
      <div class="proyectos-lista">${listaProy}</div>
    </section>` : ""}`;
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
    ${cabeceraPagina("Medios", "Participaciones destacadas en medios", m.introduccion || "Entrevistas y apariciones en televisión, radio, prensa y pódcast.", cifras, filtros)}
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
    ${cabeceraPagina("Conferencias", "Conferencias y presentaciones destacadas", m.introduccion_conferencias || "Conferencias, seminarios, debates y presentaciones de «Trumpismo discursivo» en universidades, librerías y centros culturales de España y América Latina.", cifras, filtros)}
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
        <button class="bkc-trigger" data-bkc title="¿Cara B?" aria-label="Descubre la cara B">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6.5" opacity=".45"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r=".7" fill="currentColor"/></svg>
          <span>Cara B</span>
        </button>
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

/* ---------- Easter egg: BKC ---------- */

const vinilo = (portada, disco) => `
<div class="lp sin-funda">
<div class="tocadiscos">
  <svg class="vinilo" viewBox="0 0 200 200" role="button" tabindex="0" aria-label="Reproducir o pausar">
    <defs><clipPath id="bkc-etiqueta"><circle cx="100" cy="100" r="52"/></clipPath></defs>
    <g class="disco">
      <circle cx="100" cy="100" r="98" fill="#111114"/>
      <g fill="none" stroke="#2c2c33" stroke-width=".8">
        <circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="86"/><circle cx="100" cy="100" r="80"/><circle cx="100" cy="100" r="74"/><circle cx="100" cy="100" r="68"/><circle cx="100" cy="100" r="62"/><circle cx="100" cy="100" r="56"/><circle cx="100" cy="100" r="50"/><circle cx="100" cy="100" r="44"/>
      </g>
      ${portada
        ? `<image href="${esc(portada)}" x="48" y="48" width="104" height="104" preserveAspectRatio="xMidYMid slice" clip-path="url(#bkc-etiqueta)"/>`
        : `<circle cx="100" cy="100" r="52" fill="#e8c547"/>
      <text x="100" y="105" text-anchor="middle" font-family="'Permanent Marker', cursive" font-size="20" fill="#7a2e22">BKC</text>
      <text x="100" y="120" text-anchor="middle" font-family="Inter, sans-serif" font-size="6.5" font-weight="800" letter-spacing="1.2" fill="#1b1b1f">CARA B</text>`}
      <circle cx="100" cy="100" r="52" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1"/>
      <circle cx="100" cy="100" r="2.6" fill="#111114"/>
    </g>
    <path d="M100 100 L100 2 A98 98 0 0 1 169.3 30.7 Z" fill="#fff" opacity=".05"/>
    <path d="M100 100 L100 198 A98 98 0 0 1 30.7 169.3 Z" fill="#fff" opacity=".05"/>
  </svg>
  <svg class="brazo" viewBox="0 0 200 200" aria-hidden="true">
    <g class="brazo-g">
      <rect x="196" y="6" width="14" height="22" rx="3" fill="#8c8c94"/>
      <line x1="192" y1="22" x2="158" y2="124" stroke="#dcdce2" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="158" y1="124" x2="146" y2="150" stroke="#dcdce2" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="139" y="143" width="14" height="20" rx="2" fill="#2a2a30" stroke="#dcdce2" stroke-width="1.5" transform="rotate(25 146 153)"/>
      <circle cx="192" cy="22" r="11" fill="#b9b9c0" stroke="#6d6d75" stroke-width="2"/>
      <circle cx="192" cy="22" r="4" fill="#4a4a52"/>
    </g>
  </svg>
</div>
</div>`;

function spotifyAPI() {
  return new Promise((res) => {
    if (window.__spotifyAPI) return res(window.__spotifyAPI);
    window.onSpotifyIframeApiReady = (api) => { window.__spotifyAPI = api; res(api); };
    if (!document.getElementById("spotify-api")) {
      const sc = document.createElement("script");
      sc.id = "spotify-api";
      sc.src = "https://open.spotify.com/embed/iframe-api/v1";
      sc.async = true;
      document.body.appendChild(sc);
    }
  });
}

async function abrirBKC() {
  if (document.getElementById("bkc")) return;
  if (!document.getElementById("fuente-bkc"))
    document.head.insertAdjacentHTML("beforeend", '<link id="fuente-bkc" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap">');
  let b = {};
  try { b = await load("bkc"); } catch (e) { console.error(e); }
  const enlaces = (b.enlaces || []).filter((e) => e.url)
    .map((e) => `<a class="bkc-btn" href="${esc(safeUrl(e.url))}" target="_blank" rel="noopener">${esc(e.nombre)} ↗</a>`).join("");
  const id = String(b.spotify_album || "").replace(/[^\w]/g, "");
  document.body.insertAdjacentHTML("beforeend", `
  <div class="bkc" id="bkc" role="dialog" aria-modal="true" aria-labelledby="bkc-titulo">
    <div class="bkc-caja">
      <button class="bkc-cerrar" aria-label="Cerrar">×</button>
      <div class="bkc-izq${b.foto ? " con-foto" : ""}">
        ${b.foto ? `<figure class="bkc-foto"><img src="${esc(img(b.foto))}" alt="${esc(b.foto_texto || "")}" style="object-position:${esc(b.foto_encuadre || "50% 50%")}"></figure>` : ""}
        <p class="bkc-pista">Has encontrado la cara B</p>
        ${vinilo(b.portada ? img(b.portada) : "", b.disco)}
      </div>
      <div class="bkc-der">
        <p class="bkc-kicker">Cara B</p>
        <h2 id="bkc-titulo" class="bkc-tag">${esc(b.titulo || "BKC")}</h2>
        <p class="bkc-sub">${esc(b.subtitulo || "")}${b.disco ? ` · «${esc(b.disco)}» (${esc(b.anio)})` : ""}</p>
        <div class="bkc-texto">${paras(b.texto)}</div>
        ${id ? `<div class="bkc-spotify-wrap"><div id="bkc-spotify"></div></div>` : ""}
        <div class="bkc-enlaces">${enlaces}</div>
      </div>
    </div>
  </div>`);
  const el = document.getElementById("bkc");
  document.body.classList.add("bkc-abierto");
  requestAnimationFrame(() => el.classList.add("visible"));
  const cerrar = () => {
    el.classList.remove("visible");
    document.body.classList.remove("bkc-abierto");
    setTimeout(() => el.remove(), 300);
    if (location.hash === "#bkc") history.replaceState(null, "", location.pathname + location.search);
    document.removeEventListener("keydown", esc_);
  };
  const esc_ = (ev) => ev.key === "Escape" && cerrar();
  document.addEventListener("keydown", esc_);
  el.addEventListener("click", (ev) => { if (ev.target === el) cerrar(); });
  el.querySelector(".bkc-cerrar").addEventListener("click", cerrar);
  el.querySelector(".bkc-cerrar").focus();

  const izq = el.querySelector(".bkc-izq");
  if (!id) { izq.classList.add("sonando"); return; }
  const iframeSimple = () => {
    const h = document.getElementById("bkc-spotify");
    if (h) h.outerHTML = `<iframe class="bkc-spotify" title="${esc(b.disco || "BKC")} en Spotify" src="https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0" width="100%" height="352" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    izq.classList.add("sonando");
  };
  const plazo = setTimeout(iframeSimple, 7000);
  spotifyAPI().then((api) => {
    const h = document.getElementById("bkc-spotify");
    if (!h) return;
    api.createController(h, { uri: `spotify:album:${id}`, width: "100%", height: 352 }, (ctrl) => {
      clearTimeout(plazo);
      ctrl.addListener("playback_update", (e) => izq.classList.toggle("sonando", !e.data.isPaused));
      const disco = izq.querySelector(".vinilo");
      const alternar = () => ctrl.togglePlay();
      disco.addEventListener("click", alternar);
      disco.addEventListener("keydown", (ev) => (ev.key === "Enter" || ev.key === " ") && (ev.preventDefault(), alternar()));
      const quitar = new MutationObserver(() => { if (!document.body.contains(el)) { ctrl.destroy?.(); quitar.disconnect(); } });
      quitar.observe(document.body, { childList: true });
    });
  });
}

function activarBKC() {
  let buf = "";
  document.addEventListener("keydown", (ev) => {
    if (/input|textarea|select/i.test(ev.target.tagName)) return;
    buf = (buf + ev.key.toLowerCase()).slice(-3);
    if (buf === "bkc") abrirBKC();
  });
  document.querySelectorAll("[data-bkc]").forEach((b) => b.addEventListener("click", abrirBKC));
  if (location.hash === "#bkc") abrirBKC();
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
    activarBKC();

    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  } catch (e) {
    main.innerHTML = `<div class="wrap seccion"><p>No se ha podido cargar el contenido. Recarga la página.</p></div>`;
    console.error(e);
  }
})();
