import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  Heart,
  Check,
  SlidersHorizontal,
  Play,
  Pause,
  Command,
  Download,
  Plus,
} from "lucide-react";
import { SiteContext, type ModalState, useSite } from "./SiteContext";
import { vehicles, documentGroups, media } from "./data";
import { isBoolean, isStrings, isTheme, useStored } from "./lib";
import { Dialog, Eyebrow } from "./components/UI";
import { MediaSlot } from "./components/Media";
import Home from "./pages/Home";
import Fleet from "./pages/Fleet";
import Experiences from "./pages/Experiences";
import Concierge from "./pages/Concierge";
import Documents from "./pages/Documents";

const navigation = [
  ["/", "Home"],
  ["/fleet", "The fleet"],
  ["/experiences", "Experiences"],
  ["/concierge", "Concierge"],
  ["/documents", "Documents"],
];
const validSaved = (x: unknown): x is string[] =>
  isStrings(x) &&
  x.every((id) => vehicles.some((v) => v.id === id)) &&
  new Set(x).size === x.length;
function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      className={`brand ${footer ? "brand-footer" : ""}`}
      to="/"
      aria-label="VehicleSite home"
    >
      <svg className="brand-mark" viewBox="0 0 44 36" aria-hidden="true">
        <path d="M1 1h10l11 28-6 6zM32 1h10L24 35l-5-11z" fill="currentColor" />
      </svg>
      <span>
        VEHICLESITE<small>THE ART OF ARRIVAL</small>
      </span>
    </Link>
  );
}
function RouteEffects({ motion }: { motion: boolean }) {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  useEffect(() => {
    const page =
      navigation.find(([path]) => path === pathname)?.[1] ??
      documentGroups.find((g) => pathname === `/documents/${g.id}`)?.name ??
      "Not found";
    document.title = `${page === "Home" ? "The art of arrival" : page} — VehicleSite`;
    if (previous.current !== pathname) {
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
    previous.current = pathname;
  }, [pathname]);
  useEffect(() => {
    if (!motion || !("IntersectionObserver" in window)) {
      document
        .querySelectorAll(".will-reveal")
        .forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.06 },
    );
    const scan = () =>
      document.querySelectorAll(".reveal:not(.will-reveal)").forEach((el) => {
        el.classList.add("will-reveal");
        observer.observe(el);
      });
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.getElementById("main-content")!, {
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      document
        .querySelectorAll(".will-reveal")
        .forEach((el) => el.classList.remove("will-reveal"));
    };
  }, [motion, pathname]);
  return null;
}
function Header({
  theme,
  changeTheme,
}: {
  theme: "dark" | "light";
  changeTheme: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { setModal } = useSite();
  const location = useLocation();
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        menuRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open]);
  return (
    <header className="site-header">
      <div className="scroll-progress" />
      <div className="header-inner container">
        <Brand />
        <nav
          id="primary-navigation"
          className={`primary-nav ${open ? "mobile-open" : ""}`}
          aria-label="Main navigation"
        >
          {navigation.map(([path, label]) => (
            <div className="nav-item" key={path}>
              <NavLink
                to={path}
                end={path === "/"}
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
              {path === "/documents" && (
                <div className="nav-submenu">
                  {documentGroups.map((g) => (
                    <Link
                      key={g.id}
                      to={`/documents/${g.id}`}
                      onClick={() => setOpen(false)}
                    >
                      {g.name}
                      <ArrowUpRight size={13} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button search-trigger"
            aria-label="Search website"
            title="Search (Ctrl / ⌘ K)"
            onClick={() => {
              setOpen(false);
              setModal({ type: "search" });
            }}
          >
            <Search size={17} />
          </button>
          <button
            className="icon-button theme-toggle"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            onClick={changeTheme}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link className="button button-gold header-cta" to="/concierge">
            Your journey
            <ArrowUpRight size={15} />
          </Link>
          <button
            ref={menuRef}
            className="icon-button menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
function Footer() {
  const { motion, setMotion, setModal } = useSite();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Brand footer />
            <p>
              Exceptional vehicles.
              <br />
              Considered experiences.
              <br />
              Entirely your own.
            </p>
            <span className="micro">A PREMIUM AUTOMOTIVE CONCEPT</span>
          </div>
          <div>
            <h2>Explore</h2>
            {navigation.slice(1).map(([path, label]) => (
              <Link key={path} to={path}>
                {label}
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </div>
          <div>
            <h2>The details</h2>
            {documentGroups.map((g) => (
              <Link key={g.id} to={`/documents/${g.id}`}>
                {g.name}
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </div>
          <div className="footer-note">
            <span className="micro">A WORK IN POSSIBILITY.</span>
            <p>
              All imagery, films, vehicles, and documents are placeholders. This
              is a private development concept, not a live booking service.
            </p>
            <button
              className="text-link"
              onClick={() => setModal({ type: "search" })}
            >
              <Command size={14} />
              Find your way around <kbd>⌘ K</kbd>
            </button>
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          VEHICLESITE<span>®</span>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} VehicleSite. Concept edition.
          </span>
          <div>
            <button
              onClick={() => setMotion(!motion)}
              aria-label={motion ? "Pause animations" : "Enable animations"}
            >
              {motion ? <Pause size={12} /> : <Play size={12} />}MOTION{" "}
              {motion ? "ON" : "OFF"}
            </button>
            <span className="footer-status">
              <i />
              PLACEHOLDER CONTENT
            </span>
            <a href="#top" className="back-top" aria-label="Back to top">
              BACK TO TOP
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
function Palette({ close }: { close: () => void }) {
  const [query, setQuery] = useState(""),
    [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { setModal } = useSite();
  const entries = [
    ...navigation.map(([to, label]) => ({
      id: to,
      label,
      section: "Page",
      action: () => {
        close();
        navigate(to);
      },
    })),
    ...documentGroups.map((g) => ({
      id: g.id,
      label: g.name,
      section: "Document folder",
      action: () => {
        close();
        navigate(`/documents/${g.id}`);
      },
    })),
    ...vehicles.map((v) => ({
      id: v.id,
      label: v.name,
      section: v.category,
      action: () => setModal({ type: "vehicle", vehicle: v }),
    })),
  ]
    .filter((e) =>
      `${e.label} ${e.section}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
    )
    .slice(0, 9);
  return (
    <Dialog
      title="Find your way around"
      onClose={close}
      className="palette-modal"
    >
      <label className="palette-search">
        <Search size={22} />
        <input
          autoFocus
          role="combobox"
          aria-label="Search pages, vehicles, and documents"
          aria-autocomplete="list"
          aria-controls="palette-results"
          aria-expanded="true"
          aria-activedescendant={
            entries.length ? `palette-${active}` : undefined
          }
          placeholder="A vehicle, a page, a little detail…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(entries.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              entries[active]?.action();
            }
          }}
        />
        <kbd>ESC</kbd>
      </label>
      <div
        id="palette-results"
        role="listbox"
        aria-label="Search results"
        className="palette-results"
      >
        {entries.map((entry, i) => (
          <button
            key={entry.id}
            id={`palette-${i}`}
            role="option"
            aria-selected={i === active}
            className={i === active ? "active" : ""}
            onMouseEnter={() => setActive(i)}
            onClick={entry.action}
          >
            <span>
              {entry.label}
              <small>{entry.section}</small>
            </span>
            <ArrowUpRight size={18} />
          </button>
        ))}
      </div>
      {!entries.length && (
        <p className="palette-empty" role="status">
          No matches yet. Try “fleet”, “Apex”, or “booking”.
        </p>
      )}
      <div className="palette-footer micro">
        <span>↑ ↓ TO EXPLORE</span>
        <span>↵ TO OPEN</span>
        <span>ESC TO CLOSE</span>
      </div>
    </Dialog>
  );
}
function Modal({
  modal,
  close,
}: {
  modal: NonNullable<ModalState>;
  close: () => void;
}) {
  const { saved, toggleSaved, comparison, toggleComparison } = useSite();
  if (modal.type === "search") return <Palette close={close} />;
  if (modal.type === "film")
    return (
      <Dialog
        title="The brand film · Media placeholder"
        onClose={close}
        className="film-modal"
      >
        {media.brandVideo ? (
          <video
            src={media.brandVideo}
            poster={media.brandPoster || undefined}
            controls
            playsInline
            className="brand-video"
          />
        ) : (
          <div className="film-placeholder">
            <MediaSlot kind="city" label="VIDEO PLACEHOLDER / 16:9" />
            <div>
              <span className="film-placeholder-icon">
                <Play size={29} />
              </span>
              <Eyebrow>A space for your story</Eyebrow>
              <h2>
                The feeling.
                <br />
                <em>Coming into focus.</em>
              </h2>
              <p>
                Your brand film belongs here.
                <br />
                This is an animated placeholder—not a playable video.
              </p>
            </div>
          </div>
        )}
        <div className="film-caption">
          <span className="micro">BRAND FILM / CONTENT TO COME</span>
          <span>
            Add your footage in <code>src/data.ts</code>
          </span>
        </div>
      </Dialog>
    );
  if (modal.type === "vehicle") {
    const v = modal.vehicle;
    return (
      <Dialog
        title="The collection · Vehicle preview"
        onClose={close}
        className="vehicle-modal"
      >
        <div className="vehicle-detail-media">
          <MediaSlot vehicle={v} />
          <span className="demo-badge">FICTIONAL VEHICLE / SAMPLE SPECS</span>
        </div>
        <div className="vehicle-detail-copy">
          <Eyebrow>{v.edition}</Eyebrow>
          <h2>{v.name}</h2>
          <p>{v.description}</p>
          <div className="spec-grid">
            {[
              ["Category", v.category],
              ["Guests", `${v.seats} people`],
              ["Luggage", `${v.bags} bags`],
              ["Drive", v.power],
              ["Transmission", v.transmission],
              ["Pricing", "To be added"],
            ].map(([k, val]) => (
              <div key={k}>
                <span className="micro">{k}</span>
                <strong>{val}</strong>
              </div>
            ))}
          </div>
          <div className="detail-actions">
            <Link
              className="button button-gold"
              onClick={close}
              to={`/concierge?vehicle=${v.id}`}
            >
              Design a journey
              <ArrowUpRight size={17} />
            </Link>
            <button
              className="button button-subtle"
              onClick={() => toggleSaved(v.id)}
              aria-pressed={saved.includes(v.id)}
            >
              <Heart
                size={16}
                fill={saved.includes(v.id) ? "currentColor" : "none"}
              />
              {saved.includes(v.id) ? "Saved" : "Save vehicle"}
            </button>
            <button
              className="button button-subtle"
              onClick={() => toggleComparison(v.id)}
              aria-pressed={comparison.includes(v.id)}
            >
              {comparison.includes(v.id) ? (
                <Check size={16} />
              ) : (
                <Plus size={16} />
              )}
              Compare
            </button>
          </div>
          <Link
            to="/documents/vehicle-guides"
            onClick={close}
            className="text-link"
          >
            Explore the vehicle guides
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </Dialog>
    );
  }
  const selected = vehicles.filter((v) => comparison.includes(v.id));
  return (
    <Dialog
      title="The collection · Side-by-side comparison"
      onClose={close}
      className="comparison-modal"
    >
      <Eyebrow>A closer look</Eyebrow>
      <h2>Different by design.</h2>
      <p className="muted">
        Compare up to three fictional vehicles. All specifications are
        illustrative.
      </p>
      {selected.length ? (
        <div className="comparison-scroll">
          <table className="comparison-table">
            <caption className="sr-only">
              Vehicle comparison — placeholder specifications
            </caption>
            <thead>
              <tr>
                <th scope="col">The details</th>
                {selected.map((v) => (
                  <th scope="col" key={v.id}>
                    <MediaSlot vehicle={v} />
                    <h3>{v.name}</h3>
                    <button
                      className="text-link"
                      aria-label={`Remove ${v.name} from comparison`}
                      onClick={() => toggleComparison(v.id)}
                    >
                      Remove
                      <X size={13} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Category", (v: (typeof vehicles)[number]) => v.category],
                ["Guests", (v: (typeof vehicles)[number]) => v.seats],
                ["Bags", (v: (typeof vehicles)[number]) => v.bags],
                ["Power", (v: (typeof vehicles)[number]) => v.power],
                [
                  "Transmission",
                  (v: (typeof vehicles)[number]) => v.transmission,
                ],
                ["Pricing", () => "Placeholder / not set"],
              ].map(([label, fn]) => (
                <tr key={String(label)}>
                  <th scope="row">{String(label)}</th>
                  {selected.map((v) => (
                    <td key={v.id}>
                      {(fn as (v: (typeof vehicles)[number]) => ReactNode)(v)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">Next step</th>
                {selected.map((v) => (
                  <td key={v.id}>
                    <Link
                      className="text-link"
                      to={`/concierge?vehicle=${v.id}`}
                      onClick={close}
                    >
                      Choose vehicle
                      <ArrowUpRight size={15} />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>Your comparison is empty.</p>
          <button className="button button-gold" onClick={close}>
            Keep exploring
          </button>
        </div>
      )}
    </Dialog>
  );
}
function NotFound() {
  return (
    <section className="container not-found">
      <Eyebrow>404 / A different road</Eyebrow>
      <h1>
        This turn is
        <br />
        <em>still unwritten.</em>
      </h1>
      <p>The page you are looking for is not in this collection.</p>
      <Link to="/" className="button button-gold">
        Back to the beginning
        <ArrowLeft size={17} />
      </Link>
    </section>
  );
}
export default function App() {
  const [theme, setTheme] = useStored<"dark" | "light">(
    "vehiclesite.theme.v1",
    "dark",
    isTheme,
  );
  const [motion, setMotion] = useStored(
    "vehiclesite.motion.v1",
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    isBoolean,
  );
  const [saved, setSaved] = useStored<string[]>(
    "vehiclesite.saved.v1",
    [],
    validSaved,
  );
  const [comparison, setComparison] = useState<string[]>([]),
    [modal, setModal] = useState<ModalState>(null),
    [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);
  const notify = (text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = window.setTimeout(() => setToast(""), 3800);
  };
  const toggleSaved = (id: string) => {
    const exists = saved.includes(id);
    setSaved(exists ? saved.filter((v) => v !== id) : [...saved, id]);
    notify(
      exists
        ? "Vehicle removed from your saved collection."
        : "Vehicle saved to this browser.",
    );
  };
  const toggleComparison = (id: string) => {
    if (comparison.includes(id))
      setComparison(comparison.filter((v) => v !== id));
    else if (comparison.length >= 3)
      notify("Choose up to three vehicles. Remove one to add another.");
    else setComparison([...comparison, id]);
  };
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#111211" : "#f5f2eb");
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setModal((m) => (m?.type === "search" ? null : { type: "search" }));
      }
    };
    window.addEventListener("keydown", handle);
    return () => {
      window.removeEventListener("keydown", handle);
      window.clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        document.documentElement.style.setProperty(
          "--scroll-progress",
          `${max > 0 ? window.scrollY / max : 0}`,
        );
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <SiteContext.Provider
      value={{
        saved,
        toggleSaved,
        comparison,
        toggleComparison,
        clearComparison: () => setComparison([]),
        setModal,
        notify,
        motion,
        setMotion,
      }}
    >
      <div id="top" />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <RouteEffects motion={motion} />
      <Header
        theme={theme}
        changeTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/experiences" element={<Experiences />} />
          <Route path="/concierge" element={<Concierge />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:group" element={<Documents subpage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {comparison.length > 0 && (
        <div className="compare-tray" aria-label="Comparison selection">
          <span className="compare-tray-icon">
            <SlidersHorizontal size={19} />
          </span>
          <div>
            <strong>
              {comparison.length}{" "}
              {comparison.length === 1 ? "vehicle" : "vehicles"} selected
            </strong>
            <span>See the difference, side by side.</span>
          </div>
          <button
            className="button button-gold"
            onClick={() => setModal({ type: "compare" })}
          >
            Compare
            <ArrowRight size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Clear comparison"
            onClick={() => setComparison([])}
          >
            <X size={17} />
          </button>
        </div>
      )}
      <div
        className={`toast ${toast ? "show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <Check size={16} />
            {toast}
          </>
        )}
      </div>
      {modal && (
        <Modal key={modal.type} modal={modal} close={() => setModal(null)} />
      )}
    </SiteContext.Provider>
  );
}
