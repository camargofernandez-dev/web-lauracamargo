/* Web de Laura Camargo Fernández
   El contenido se edita en la carpeta /content (desde el panel de edición).
   Este archivo solo se encarga de mostrarlo. */

const NAV = [
  ["index.html", "Inicio", "inicio"],
  ["investigacion.html", "Investigación", "investigacion"],
  ["libro.html", "El libro", "libro"],
  ["medios.html", "Medios y conferencias", "medios"],
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
  return u.startsWith("http") || u.startsWith("/") ? u : "/" + u;
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
  const r = await fetch(`/content/${name}.json`, { cache: "no-cache" });
  if (!r.ok) throw new Error("No se pudo cargar " + name);
  return r.json();
}

function header(sitio, page) {
  const links = NAV.map(
    ([href, label, key]) =>
      `<a href="/${href === "index.html" ? "" : href}" ${key === page ? 'aria-current="page"' : ""}>${label}</a>`
  ).join("");
  return `
  <div class="wrap header-inner">
    <a class="brand" href="/">${esc(sitio.nombre)}</a>
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
      <a href="/aviso-legal.html">Aviso legal y privacidad</a>
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

function itemMedio(a) {
  const yt = youtubeId(a.enlace);
  const media = yt
    ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${yt}" title="${esc(a.titulo)}" loading="lazy" allowfullscreen></iframe></div>`
    : "";
  const titulo = a.enlace && !yt
    ? `<a href="${esc(safeUrl(a.enlace))}" target="_blank" rel="noopener">${esc(a.titulo)} <span aria-hidden="true">↗</span></a>`
    : esc(a.titulo);
  const foto = a.imagen && !yt
    ? `<img class="medio-img" src="${esc(img(a.imagen))}" alt="" loading="lazy">`
    : "";
  return `
  <article class="medio" data-tipo="${esc(a.tipo)}">
    ${foto}
    <div class="medio-meta"><span class="etiqueta">${esc(a.tipo)}</span><time>${fmtFecha(a.fecha)}</time></div>
    <h3>${titulo}</h3>
    <p class="medio-fuente">${esc(a.medio)}</p>
    ${a.descripcion ? `<p>${esc(a.descripcion)}</p>` : ""}
    ${media}
  </article>`;
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
        <a class="tarjeta" href="/investigacion.html#${slug(l.titulo, i)}">
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
            <a class="btn" href="/investigacion.html">Ver mi investigación</a>
            <a class="btn btn-ghost" href="/contacto.html">Contacto</a>
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
            <a class="btn btn-claro" href="/libro.html">Descubre el libro</a>
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
        <a href="/investigacion.html">Ver todas →</a>
      </div>
      <div class="tarjetas">${tarjetas}</div>
    </section>

    <section class="wrap seccion">
      <div class="seccion-cab">
        <h2>Últimas apariciones</h2>
        <a href="/medios.html">Medios y conferencias →</a>
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
    const lista = ordenar(m.apariciones);
    const tipos = [...new Set(lista.map((a) => a.tipo).filter(Boolean))];
    const filtros = ["Todo", ...tipos]
      .map((t, i) => `<button class="filtro" data-filtro="${esc(t)}" aria-pressed="${i === 0}">${esc(t)}</button>`)
      .join("");
    setTimeout(() => {
      document.querySelectorAll(".filtro").forEach((b) =>
        b.addEventListener("click", () => {
          document.querySelectorAll(".filtro").forEach((x) => x.setAttribute("aria-pressed", x === b));
          const f = b.dataset.filtro;
          document.querySelectorAll(".medio").forEach((el) => {
            el.hidden = f !== "Todo" && el.dataset.tipo !== f;
          });
        })
      );
    });
    return `
    <header class="cabecera wrap">
      <p class="kicker">Medios</p>
      <h1>Medios y conferencias</h1>
      <div class="lead">${paras(m.introduccion)}</div>
      <div class="filtros">${filtros}</div>
    </header>
    <section class="wrap medios-lista">${lista.map(itemMedio).join("")}</section>`;
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
    return `
    <section class="wrap seccion estrecha">
      <p class="kicker">Contacto</p>
      <h1>Hablemos</h1>
      ${paras(sitio.texto_contacto)}
      <p class="email-grande"><a href="mailto:${esc(sitio.email)}">${esc(sitio.email)}</a></p>
      ${enlaces ? `<h2>También en</h2><ul class="enlaces">${enlaces}</ul>` : ""}
    </section>`;
  },

  async "aviso-legal"(sitio) {
    return `
    <section class="wrap seccion estrecha">
      <h1>Aviso legal y privacidad</h1>
      <h2>Titular</h2>
      <p>Esta web es un sitio personal e informativo cuya titular es ${esc(sitio.nombre)}. Contacto: <a href="mailto:${esc(sitio.email)}">${esc(sitio.email)}</a>.</p>
      <h2>Datos personales</h2>
      <p>Esta web no utiliza formularios ni recoge datos personales. Si escribes al correo de contacto, tus datos se usarán solo para responderte y no se cederán a terceros. Puedes pedir que se borren escribiendo a ese mismo correo.</p>
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
  </style>`
);

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

    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  } catch (e) {
    main.innerHTML = `<div class="wrap seccion"><p>No se ha podido cargar el contenido. Recarga la página.</p></div>`;
    console.error(e);
  }
})();
