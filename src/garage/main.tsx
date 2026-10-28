import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Lightbulb,
  Move,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Wrench,
} from "lucide-react";
import "@fontsource-variable/sofia-sans-extra-condensed";
import "@fontsource-variable/reddit-mono";
import { useSite } from "../SiteContext";
import { publicAsset } from "../lib";
import { vehicles } from "../data";
import { VehicleCard } from "../components/UI";
import { createShopAudio } from "./audio";
import { createLamp, type Point } from "./lamp";
import { findings, scenes, type Finding, type SceneId } from "./data";
import { FindingsHook, InspectionTag, useInspection } from "./tags";
import { Estimate, LaborGuide, Pickup } from "./paperwork";
import "./style.css";

type Relighter = Awaited<
  ReturnType<(typeof import("./relight"))["createRelighter"]>
>;
function project(
  point: Point,
  width: number,
  height: number,
  imageAspect: number,
): Point {
  const aspect = width / Math.max(1, height);
  return {
    x: (point.x - 0.5) / Math.min(1, aspect / imageAspect) + 0.5,
    y: (point.y - 0.5) / Math.min(1, imageAspect / aspect) + 0.5,
  };
}

function InspectionScene({
  sceneId,
  motion,
  shopLights,
  lightHeight,
  found,
  active,
  inspect,
  dismiss,
  children,
}: {
  sceneId: SceneId;
  motion: boolean;
  shopLights: boolean;
  lightHeight: number;
  found: string[];
  active: Finding | null;
  inspect: (finding: Finding) => void;
  dismiss: () => void;
  children?: ReactNode;
}) {
  const scene = scenes[sceneId];
  const container = useRef<HTMLDivElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cord = useRef<SVGPathElement>(null);
  const bulb = useRef<SVGGElement>(null);
  const target = useRef<Point>({ x: 0.73, y: 0.32 });
  const input = useRef({ time: performance.now(), engaged: false });
  const kick = useRef<() => void>(() => {});
  const settings = useRef({ motion, shopLights, lightHeight, inspect });
  settings.current = { motion, shopLights, lightHeight, inspect };
  const [size, setSize] = useState({ width: 1440, height: 900 });
  const [ready, setReady] = useState(false);
  const points = findings.filter((item) => item.scene === sceneId);

  useEffect(() => {
    const element = visual.current!,
      host = container.current!,
      surface = canvas.current!;
    const lamp = createLamp(target.current, sceneId !== "engine");
    let renderer: Relighter | undefined,
      requested = false,
      disposed = false,
      visible = false,
      lost = false;
    let frame = 0,
      previous = 0,
      width = 1,
      height = 1;
    let hovered = "",
      hoverStarted = 0,
      lastInspection = "",
      idlePart = -1;
    const scenePoints = findings.filter((item) => item.scene === sceneId);
    const render = (now: number) => {
      frame = 0;
      if (disposed || !visible || document.hidden || lost) return;
      const options = settings.current;
      if (options.motion && now - input.current.time > 4000) {
        const index =
          Math.floor((now - input.current.time - 4000) / 2600) %
          scenePoints.length;
        if (idlePart !== index) {
          idlePart = index;
          const location = project(
            scenePoints[index],
            width,
            height,
            scene.aspect,
          );
          target.current = {
            x: Math.min(0.92, Math.max(0.1, location.x)),
            y: Math.min(0.8, Math.max(0.2, location.y)),
          };
          input.current.engaged = false;
        }
      }
      const result = lamp.step(
        target.current,
        previous ? (now - previous) / 1000 : 1 / 60,
        !options.motion,
      );
      previous = now;
      cord.current?.setAttribute(
        "d",
        result.nodes
          .map(
            (point, index) =>
              `${index ? "L" : "M"}${(point.x * width).toFixed(1)},${(point.y * height).toFixed(1)}`,
          )
          .join(" "),
      );
      bulb.current?.setAttribute(
        "transform",
        `translate(${result.position.x * width},${result.position.y * height}) rotate(${result.angle})`,
      );
      renderer?.draw(
        result.position.x,
        result.position.y,
        options.lightHeight,
        options.shopLights,
      );
      if (input.current.engaged) {
        const nearest = scenePoints.find((point) => {
          const projected = project(point, width, height, scene.aspect);
          return (
            Math.hypot(
              (projected.x - result.position.x) * width,
              (projected.y - result.position.y) * height,
            ) < 48
          );
        });
        if (nearest?.id !== hovered) {
          hovered = nearest?.id ?? "";
          hoverStarted = now;
          lastInspection = "";
        }
        if (
          nearest &&
          now - hoverStarted >= 600 &&
          nearest.id !== lastInspection
        ) {
          lastInspection = nearest.id;
          options.inspect(nearest);
        }
      }
      if (
        options.motion ||
        (input.current.engaged && hovered && !lastInspection)
      )
        frame = requestAnimationFrame(render);
    };
    const start = () => {
      if (!frame && visible && !document.hidden && !disposed)
        frame = requestAnimationFrame(render);
    };
    kick.current = start;
    const resize = () => {
      width = element.clientWidth;
      height = element.clientHeight;
      setSize({ width, height });
      renderer?.resize(width, height, scene.aspect);
      start();
    };
    const initialize = async () => {
      if (requested || disposed) return;
      requested = true;
      try {
        const { createRelighter } = await import("./relight");
        if (disposed) return;
        const instance = await createRelighter(
          surface,
          publicAsset(scene.photo),
          publicAsset(scene.depth),
        );
        if (disposed) {
          instance.dispose();
          return;
        }
        renderer = instance;
        renderer.resize(width, height, scene.aspect);
        renderer.draw(
          target.current.x,
          target.current.y,
          settings.current.lightHeight,
          settings.current.shopLights,
        );
        setReady(true);
        start();
      } catch {
        if (!disposed) setReady(false);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          void initialize();
          start();
        } else {
          cancelAnimationFrame(frame);
          frame = 0;
          previous = 0;
        }
      },
      { threshold: 0 },
    );
    observer.observe(host);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
      } else start();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      setReady(false);
      cancelAnimationFrame(frame);
      frame = 0;
    };
    document.addEventListener("visibilitychange", visibility);
    surface.addEventListener("webglcontextlost", contextLost);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      renderer?.dispose();
      document.removeEventListener("visibilitychange", visibility);
      surface.removeEventListener("webglcontextlost", contextLost);
      kick.current = () => {};
    };
  }, [sceneId, scene]);
  useEffect(() => {
    kick.current();
  }, [motion, shopLights, lightHeight]);

  function aim(event: PointerEvent<HTMLDivElement>) {
    if (event.type === "pointermove" && event.pointerType !== "mouse") return;
    if (
      (event.target as HTMLElement).closest(
        "button, a, input, label, summary, aside",
      )
    )
      return;
    const rect = visual.current!.getBoundingClientRect();
    target.current = {
      x: Math.max(
        0.04,
        Math.min(0.96, (event.clientX - rect.left) / rect.width),
      ),
      y: Math.max(
        0.12,
        Math.min(0.88, (event.clientY - rect.top) / rect.height),
      ),
    };
    input.current = { time: performance.now(), engaged: true };
    kick.current();
  }
  function aimAt(point: Finding) {
    const location = project(point, size.width, size.height, scene.aspect);
    target.current = {
      x: Math.min(0.93, Math.max(0.07, location.x)),
      y: Math.min(0.9, Math.max(0.1, location.y)),
    };
    input.current = { time: performance.now(), engaged: true };
    kick.current();
  }
  return (
    <div
      ref={container}
      className={`hg-inspection-scene hg-scene-${sceneId} ${shopLights ? "hg-lights-on" : ""}`}
      onPointerMove={aim}
      onPointerDown={aim}
    >
      <div className="hg-scene-visual" ref={visual}>
        <img
          className="hg-scene-photo"
          src={publicAsset(scene.photo)}
          alt={scene.alt}
          loading={sceneId === "engine" ? "eager" : "lazy"}
          fetchPriority={sceneId === "engine" ? "high" : "auto"}
          width={sceneId === "engine" ? 1600 : 1400}
          height={sceneId === "engine" ? 1201 : sceneId === "lift" ? 788 : 933}
        />
        <div className="hg-static-light" aria-hidden="true" />
        <canvas
          ref={canvas}
          className={`hg-relight ${ready ? "is-ready" : ""}`}
          aria-hidden="true"
        />
        <svg className="hg-lamp" width="100%" height="100%" aria-hidden="true">
          <path ref={cord} className="hg-cord" />
          <g ref={bulb}>
            <path
              d="M0 -83v17c0 8 10 6 10 13"
              fill="none"
              stroke="#6b5b40"
              strokeWidth="4"
            />
            <rect
              x="-10"
              y="-58"
              width="20"
              height="30"
              rx="5"
              fill="#b07c35"
            />
            <rect
              x="-15"
              y="-30"
              width="30"
              height="59"
              rx="14"
              className="hg-bulb-glow"
            />
            <path
              d="M-18 -28q-9 28 0 59h36q9-31 0-59zM-18 -12h36M-18 11h36M-7 -28v59M7 -28v59"
              fill="none"
              stroke="#31291e"
              strokeWidth="2.5"
            />
            <rect x="-19" y="29" width="38" height="6" rx="2" fill="#ad8149" />
          </g>
        </svg>
        <div className="hg-scene-shade" aria-hidden="true" />
        <div
          className="hg-hotspots"
          aria-label={`${scene.label} inspection points`}
        >
          {points.map((point, index) => {
            const p = project(point, size.width, size.height, scene.aspect);
            const outside =
              p.x < 0.03 || p.x > 0.94 || p.y < 0.05 || p.y > 0.95;
            return (
              <button
                key={point.id}
                className={`hg-hotspot ${found.includes(point.id) ? "is-found" : ""}`}
                hidden={outside}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                onFocus={() => aimAt(point)}
                onPointerEnter={() => aimAt(point)}
                onClick={() => {
                  aimAt(point);
                  inspect(point);
                }}
                aria-label={`Inspect ${point.name}${found.includes(point.id) ? ", finding collected" : ""}`}
                aria-pressed={found.includes(point.id)}
              >
                <span>
                  {found.includes(point.id) ? (
                    <Check size={14} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                <small>{point.name}</small>
              </button>
            );
          })}
        </div>
      </div>
      <div
        className="hg-mobile-parts"
        aria-label={`${scene.label}: select a part to inspect`}
      >
        <span>INSPECT A PART</span>
        <div>
          {points.map((point) => (
            <button
              key={point.id}
              onClick={() => {
                aimAt(point);
                inspect(point);
              }}
              aria-pressed={found.includes(point.id)}
            >
              {found.includes(point.id) && <Check size={11} />}
              {point.name}
            </button>
          ))}
        </div>
      </div>
      {children}
      {active?.scene === sceneId && (
        <InspectionTag finding={active} dismiss={dismiss} />
      )}
    </div>
  );
}

function RoadTest() {
  const [mile, setMile] = useState(0);
  const notes = [
    {
      mile: "00–04",
      name: "Around the block",
      note: "Cold start. Listen for that rattle. Check steering and low-speed braking.",
      path: "M120 284L120 180L218 180L218 105L330 105",
    },
    {
      mile: "04–10",
      name: "Up to speed",
      note: "A steady cruise. Watch temperatures, feel for vibration, and let everything warm up.",
      path: "M330 105L480 105L480 210L560 210L560 335L410 335",
    },
    {
      mile: "10–14",
      name: "Back to the bay",
      note: "A final stop, a second look for leaks, and one last check before the keys come back.",
      path: "M410 335L270 335L270 284L120 284",
    },
  ];
  return (
    <section
      className="hg-road-section"
      id="road-test"
      aria-labelledby="road-heading"
    >
      <div className="hg-section hg-road-grid">
        <div className="hg-section-intro reveal">
          <span className="hg-kicker">04 / THE ROAD TEST</span>
          <h2 id="road-heading">
            Checked in the bay.
            <br />
            <span>Proven on the road.</span>
          </h2>
          <p>
            Mechanical checks and a road test help explain how a car runs,
            whether you’re considering a purchase or having yours repaired.
            Explore our sample fourteen-mile inspection loop.
          </p>
          <div className="hg-mile-notes" aria-label="Road test mile notes">
            {notes.map((note, index) => (
              <button
                key={note.mile}
                onClick={() => setMile(index)}
                aria-pressed={mile === index}
              >
                <span>{note.mile} MI</span>
                <strong>{note.name}</strong>
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
          <p className="hg-road-note" aria-live="polite">
            {notes[mile].note}
          </p>
        </div>
        <div className="hg-route-paper reveal">
          <div className="hg-route-heading">
            <div>
              <span>YELLOW COPY / ROAD TEST</span>
              <h3>THE LONG WAY BACK.</h3>
            </div>
            <b>
              14<small>MILES</small>
            </b>
          </div>
          <svg viewBox="0 0 680 440" role="img" aria-labelledby="route-title">
            <title id="route-title">
              Illustrative fourteen-mile road test loop with three inspection
              stages. Not a navigation map.
            </title>
            <defs>
              <pattern
                id="hg-map-grid"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M48 0H0V48"
                  fill="none"
                  stroke="#a59b70"
                  strokeWidth=".7"
                />
              </pattern>
            </defs>
            <rect width="680" height="440" fill="url(#hg-map-grid)" />
            <path
              d="M-30 70C160 130 140 390 360 480M310 -20C210 130 390 200 720 140"
              stroke="#c7bc87"
              strokeWidth="24"
              fill="none"
            />
            <g fill="#514b36" fontSize="9" fontFamily="monospace">
              <text x="342" y="87">
                THE OPEN STRETCH
              </text>
              <text x="290" y="365">
                BACK TO HARLAN ST.
              </text>
              <text x="65" y="320">
                THE GARAGE
              </text>
              <text x="130" y="163">
                NEIGHBORHOOD
              </text>
            </g>
            {notes.map((note, index) => (
              <path
                key={note.mile}
                d={note.path}
                fill="none"
                stroke={mile === index ? "#8d3026" : "#655d3f"}
                strokeWidth={mile === index ? 5 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="1"
                className="hg-route-line"
              />
            ))}
            <circle cx="120" cy="284" r="10" fill="#29271e" />
            <circle cx="120" cy="284" r="4" fill="#e8d99c" />
            {[
              [330, 105],
              [410, 335],
            ].map(([x, y], i) => (
              <g key={x}>
                <circle cx={x} cy={y} r="12" fill="#e8d99c" stroke="#655d3f" />
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#332e21"
                >
                  {i === 0 ? "04" : "10"}
                </text>
              </g>
            ))}
          </svg>
          <div className="hg-route-footer">
            <span>
              TECHNICIAN SIGN-OFF <b>Harlan St.</b>
            </span>
            <span>
              ILLUSTRATIVE ROUTE
              <br />
              CHECKED. THEN DOUBLE-CHECKED.
            </span>
          </div>
        </div>
      </div>
      <div className="hg-signoffs reveal">
        <span className="hg-kicker">
          A FEW WORDS FROM THE DRIVER’S SEAT / FICTIONAL CUSTOMER NOTES
        </span>
        <div>
          {[
            {
              quote:
                "They showed me the part. Explained the problem. And that was that.",
              name: "M. REYNOLDS",
              car: "THE DAILY DRIVER",
            },
            {
              quote:
                "The price on the estimate was the price when I picked it up.",
              name: "J. WALKER",
              car: "THE FAMILY WAGON",
            },
            {
              quote: "My dad came here. Now I get why.",
              name: "A. MILLER",
              car: "THE HAND-ME-DOWN",
            },
          ].map((note) => (
            <figure key={note.name}>
              <span className="hg-quote-mark">“</span>
              <blockquote>{note.quote}</blockquote>
              <figcaption>
                <strong>{note.name}</strong>
                <span>{note.car}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Garage() {
  const { motion: siteMotion, setMotion } = useSite();
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const motion = siteMotion && !reduced;
  const [shopLights, setShopLights] = useState(false);
  const [lightHeight, setLightHeight] = useState(0.38);
  const [sound, setSound] = useState(false);
  const soundEngine = useRef<ReturnType<typeof createShopAudio> | null>(null);
  const inspection = useInspection(() => soundEngine.current?.click());
  const page = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState("cars");
  useEffect(() => {
    soundEngine.current = createShopAudio();
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => {
      soundEngine.current?.dispose();
      soundEngine.current = null;
      media.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.garage = "true";
    return () => {
      delete document.documentElement.dataset.garage;
    };
  }, []);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const sections = ["cars", "on-the-lift", "pickup"];
        setCurrent(
          sections
            .filter(
              (id) =>
                (document.getElementById(id)?.getBoundingClientRect().top ??
                  Infinity) <=
                innerHeight * 0.5,
            )
            .at(-1) ?? "cars",
        );
        page.current
          ?.querySelectorAll<HTMLElement>(".hg-scroll-section")
          .forEach((element) => {
            const rect = element.getBoundingClientRect();
            const progress = motion
              ? Math.max(
                  0,
                  Math.min(
                    1,
                    -rect.top / Math.max(1, rect.height - innerHeight),
                  ),
                )
              : 0;
            const eased = progress * progress * (3 - 2 * progress);
            element.style.setProperty("--scene-progress", String(eased));
          });
      });
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [motion]);
  const sceneProps = {
    motion,
    shopLights,
    lightHeight,
    found: inspection.found,
    active: inspection.active,
    inspect: inspection.inspect,
    dismiss: inspection.dismiss,
  };
  return (
    <div
      className="hg-page"
      ref={page}
      data-garage-motion={motion ? "on" : "off"}
    >
      <header className="hg-header" role="banner">
        <div className="hg-order-nav">
          <a
            href="#diagnose"
            className="hg-brand"
            aria-label="Harlan Street Garage, back to the top"
          >
            <span className="hg-brand-mark">
              <Wrench size={24} />
              <span>H</span>
            </span>
            <span>
              HARLAN STREET<strong>GARAGE</strong>
            </span>
          </a>
          <div className="hg-nav-address">
            CAR SALES & MECHANICAL SERVICES
            <br />
            <span>DAYTON, OHIO · EST. 1987</span>
          </div>
          <Link to="/showroom" className="hg-showroom-link">
            Showroom <ArrowUpRight size={17} />
          </Link>
          <span className="hg-order-label">
            SALES & SERVICE <b>Since 1987</b>
          </span>
        </div>
        <nav className="hg-copy-tabs" aria-label="Garage navigation">
          <a
            href="#cars"
            aria-current={current === "cars" ? "location" : undefined}
          >
            <b>01</b> <span>CAR SALES</span>
            <small>THE SHOWROOM</small>
          </a>
          <a
            href="#on-the-lift"
            aria-current={current === "on-the-lift" ? "location" : undefined}
          >
            <b>02</b> <span>SERVICE</span>
            <small>THE WORKSHOP</small>
          </a>
          <a
            href="#pickup"
            aria-current={current === "pickup" ? "location" : undefined}
          >
            <b>03</b> <span>VISIT US</span>
            <small>LET’S TALK</small>
          </a>
        </nav>
      </header>
      <section
        id="diagnose"
        className="hg-hero"
        aria-labelledby="garage-heading"
      >
        <InspectionScene sceneId="engine" {...sceneProps}>
          <div className="hg-bay-label">
            <span>
              <i /> BAY 01 / UNDER THE HOOD
            </span>
            <span>39°45′ N / 84°11′ W</span>
          </div>
          <div className="hg-hero-copy">
            <span className="hg-kicker">
              YOUR NEXT CAR. YOUR LOCAL MECHANIC.
            </span>
            <h1 id="garage-heading">
              CAR SALES.
              <br />
              EXPERT CARE.
              <br />
              <span>ONE GARAGE.</span>
            </h1>
            <p>
              Find your next car. Look after the one you own.
              <br />
              Car sales, servicing, and repairs — all in one place.
            </p>
            <div className="hg-hero-actions">
              <Link to="/inventory" className="hg-button">
                Browse cars <ArrowUpRight size={19} />
              </Link>
              <a href="#pickup" className="hg-button hg-button-outline">
                Book a service <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <div className="hg-hero-margin">
            <span>
              CAR SALES.
              <br />
              SERVICING.
              <br />
              REPAIRS.
            </span>
            <span className="hg-hand-note">
              Let’s have
              <br />a look. <ArrowDownRight size={26} />
            </span>
          </div>
          <div className="hg-scene-instruction">
            <Move size={16} />
            <span>
              MOVE THE LIGHT. FIND THE STORY.
              <small>
                Hold on a marker to read our notes. Or tap to inspect.
              </small>
            </span>
          </div>
        </InspectionScene>
        <div className="hg-complaint-strip">
          <div>
            <span>01 / FIND YOUR CAR</span>
            <strong>Browse, save, and compare.</strong>
          </div>
          <div>
            <span>02 / LOOK AFTER IT</span>
            <strong>Servicing, diagnostics, and repairs.</strong>
          </div>
          <div>
            <span>03 / PLAN YOUR VISIT</span>
            <strong>Talk cars. Talk maintenance.</strong>
          </div>
          <a href="#cars" aria-label="Explore the car sales collection">
            <ArrowDown size={23} />
          </a>
        </div>
      </section>
      <section
        className="hg-section hg-sales-section"
        id="cars"
        aria-labelledby="cars-heading"
      >
        <div className="hg-sales-heading reveal">
          <div className="hg-section-intro">
            <span className="hg-kicker">CAR SALES / THE SHOWROOM</span>
            <h2 id="cars-heading">
              Your next car.
              <br />
              <span>Start here.</span>
            </h2>
          </div>
          <div>
            <p>
              Something for the daily commute, more room for the family, or a
              car you’ll take the long way home in. Explore the collection,
              compare the details, and save your favourites.
            </p>
            <Link to="/inventory" className="hg-text-link">
              Explore all cars <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="hg-sales-grid">
          {vehicles.slice(0, 3).map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
          ))}
        </div>
        <p className="hg-fine hg-sales-note">
          Demo showroom: these vehicles and specifications are fictional
          examples, not live stock or confirmed offers.
        </p>
      </section>
      <div className="hg-workbench">
        <div className="hg-workbench-label">
          <Lightbulb size={19} />
          <span>YOU’RE HOLDING THE LIGHT.</span>
        </div>
        <label className="hg-height-label">
          LIGHT HEIGHT
          <input
            type="range"
            min="0.18"
            max="0.60"
            step="0.01"
            value={lightHeight}
            onChange={(event) => setLightHeight(Number(event.target.value))}
            aria-valuetext={`${Math.round(lightHeight * 100)} percent`}
          />
          <span>{Math.round(lightHeight * 100)}</span>
        </label>
        <button
          className="hg-light-switch"
          aria-pressed={shopLights}
          onClick={() => setShopLights(!shopLights)}
        >
          <span className="hg-switch">
            <i />
          </span>
          SHOP LIGHTS <b>{shopLights ? "ON" : "OFF"}</b>
        </button>
        <FindingsHook found={inspection.found} />
      </div>
      <div className="hg-shop-stats">
        <div>
          <b>1987</b>
          <span>
            FAMILY OWNED
            <br />
            FROM THE START
          </span>
        </div>
        <div>
          <b>06</b>
          <span>
            WORKING BAYS.
            <br />
            NO RUNAROUND.
          </span>
        </div>
        <div>
          <b>04</b>
          <span>
            ASE CERTIFIED
            <br />
            TECHNICIANS
          </span>
        </div>
        <div>
          <b>24 / 24</b>
          <span>
            MONTH / 1,000 MILE
            <br />
            SAMPLE WARRANTY
          </span>
        </div>
      </div>
      <section
        className="hg-scroll-section"
        id="on-the-lift"
        aria-labelledby="lift-heading"
      >
        <div className="hg-sticky-scene">
          <InspectionScene sceneId="lift" {...sceneProps}>
            <div className="hg-scene-heading">
              <span className="hg-kicker">
                MECHANICAL SERVICES / INSPECTION
              </span>
              <h2 id="lift-heading">
                THE THINGS
                <br />
                YOU DON’T SEE.
                <br />
                <span>WE DO.</span>
              </h2>
              <p>
                Routine maintenance or a problem that needs a closer look.
                <br />
                Explore how we check tires, suspension, and exhaust.
              </p>
              <a href="#brake-corner" className="hg-secondary-link">
                Next: a closer look <ArrowDown size={16} />
              </a>
            </div>
            <span className="hg-scene-index">
              02 <small>/ 03</small>
            </span>
          </InspectionScene>
        </div>
      </section>
      <section
        className="hg-scroll-section hg-brake-scroll"
        id="brake-corner"
        aria-labelledby="brake-heading"
      >
        <div className="hg-sticky-scene">
          <InspectionScene sceneId="brakes" {...sceneProps}>
            <div className="hg-scene-heading">
              <span className="hg-kicker">
                01 / DIAGNOSE · THE BRAKE CORNER
              </span>
              <h2 id="brake-heading">
                A CLOSER LOOK.
                <br />
                <span>A SAFER STOP.</span>
              </h2>
              <p>
                Brake checks, clear findings, and a repair estimate.
                <br />
                Here’s a sample inspection, with the measurements explained.
              </p>
              <a href="#estimate" className="hg-secondary-link">
                Let’s put it on paper <ArrowDown size={16} />
              </a>
            </div>
            <span className="hg-scene-index">
              03 <small>/ 03</small>
            </span>
          </InspectionScene>
        </div>
      </section>
      <Estimate
        found={inspection.found}
        stamp={() => soundEngine.current?.click(true)}
      />
      <LaborGuide />
      <RoadTest />
      <Pickup stamp={() => soundEngine.current?.click(true)} />
      <footer className="hg-footer" role="contentinfo">
        <div className="hg-footer-top">
          <a href="#diagnose" className="hg-footer-brand">
            HARLAN STREET
            <br />
            <strong>GARAGE.</strong>
          </a>
          <p>
            Your next car. Your ongoing care.
            <br />
            Since 1987. Dayton, Ohio.
          </p>
          <Link to="/showroom" className="hg-button hg-button-outline">
            Explore the showroom <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="hg-footer-bottom">
          <span>
            © {new Date().getFullYear()} HARLAN STREET GARAGE
            <br />
            <small>A FICTIONAL SHOP / A VEHICLESITE CONCEPT</small>
          </span>
          <div>
            <button
              onClick={() => {
                setSound(!sound);
                void soundEngine.current?.enable(!sound);
              }}
              aria-pressed={sound}
            >
              {sound ? <Volume2 size={15} /> : <VolumeX size={15} />} SOUND{" "}
              {sound ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => setMotion(!siteMotion)}
              aria-pressed={motion}
              disabled={reduced}
            >
              {motion ? <Pause size={15} /> : <Play size={15} />} MOTION{" "}
              {motion ? "ON" : "OFF"}
            </button>
            <a href="#diagnose">BACK TO TOP ↑</a>
          </div>
        </div>
        <details className="hg-credits">
          <summary>About this concept & photo credits</summary>
          <p>
            Harlan Street Garage is a fictional car sales and mechanical service
            business. Vehicles, findings, prices, warranties, hours, and
            customer notes are illustrative. Forms and approvals run only in
            your browser. No appointment or repair is booked. Photography
            illustrates separate vehicles, not an actual inspection.
          </p>
          <p>
            Photos:{" "}
            {Object.values(scenes).map((scene, index) => (
              <span key={scene.source}>
                {index > 0 && " · "}
                <a href={scene.source} target="_blank" rel="noreferrer">
                  {scene.credit} / Pexels
                </a>
              </span>
            ))}
            . Relative depth estimated with Depth Anything V2 Small; visual
            effects are not diagnostic measurements.
          </p>
        </details>
      </footer>
      <span className="sr-only" role="status">
        {inspection.active
          ? `${inspection.active.name}: ${inspection.active.note}`
          : `${inspection.found.length} inspection findings collected.`}
      </span>
    </div>
  );
}
