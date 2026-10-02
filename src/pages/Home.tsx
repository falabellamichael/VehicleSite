import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  ChevronDown,
  MoveUpRight,
} from "lucide-react";
import { vehicles, media } from "../data";
import { MediaSlot } from "../components/Media";
import {
  Eyebrow,
  SectionHeading,
  VehicleCard,
  JourneyCTA,
} from "../components/UI";
import { useSite } from "../SiteContext";
export default function Home() {
  const [slide, setSlide] = useState(0),
    [paused, setPaused] = useState(false);
  const { setModal, motion } = useSite();
  const vehicle = vehicles[slide];
  useEffect(() => {
    if (!motion || paused) return;
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % 3), 8500);
    return () => window.clearInterval(timer);
  }, [motion, paused]);
  return (
    <>
      <section
        className="hero container"
        aria-label="Featured vehicle collection"
      >
        <div className="hero-overline">
          <Eyebrow>The art of arrival</Eyebrow>
          <span className="micro hero-edition">
            A NEW PERSPECTIVE ON THE JOURNEY <span>—</span> VOL. 001
          </span>
        </div>
        <div className="hero-main">
          <div className="hero-copy">
            <h1>
              Presence.
              <br />
              <em>In motion.</em>
            </h1>
            <p>
              Extraordinary vehicles. Considered experiences.
              <br />A journey that feels entirely your own.
            </p>
            <div className="hero-actions">
              <Link className="button button-gold" to="/fleet">
                Explore the collection
                <ArrowUpRight size={18} />
              </Link>
              <button
                className="film-link"
                onClick={() => setModal({ type: "film" })}
              >
                <span>
                  <Play size={13} fill="currentColor" />
                </span>
                Discover the feeling
              </button>
            </div>
            <div className="hero-footnote">
              <span className="fine-line" />
              <span>
                NOT JUST THE DESTINATION.
                <br />
                <strong>EVERY MOMENT IN BETWEEN.</strong>
              </span>
            </div>
          </div>
          <div
            className="hero-stage"
            onPointerMove={(e) => {
              if (!motion || e.pointerType !== "mouse") return;
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty(
                "--pointer-x",
                `${((e.clientX - rect.left) / rect.width - 0.5) * 14}px`,
              );
              e.currentTarget.style.setProperty(
                "--pointer-y",
                `${((e.clientY - rect.top) / rect.height - 0.5) * 8}px`,
              );
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.setProperty("--pointer-x", "0px");
              e.currentTarget.style.setProperty("--pointer-y", "0px");
            }}
          >
            <span className="hero-watermark" aria-hidden="true">
              VS
            </span>
            <div className="hero-orbit" aria-hidden="true" />
            <div className="hero-orbit orbit-two" aria-hidden="true" />
            <span className="hero-coordinate micro">DESIGNED TO MOVE YOU.</span>
            {media.heroVideo ? (
              <video
                className="hero-real-video"
                src={media.heroVideo}
                poster={media.heroPoster || undefined}
                muted
                autoPlay={motion}
                loop
                playsInline
                controls
                aria-label="Collection hero film"
              />
            ) : (
              <MediaSlot
                key={vehicle.id}
                vehicle={vehicle}
                className="hero-media"
                label="HERO IMAGE / VIDEO PLACEHOLDER"
              />
            )}
            <div className="hero-car-tag" key={`tag-${vehicle.id}`}>
              <span className="micro">{vehicle.edition}</span>
              <strong>
                {vehicle.name}
                <MoveUpRight size={17} />
              </strong>
              <span className="hero-tag-line" />
            </div>
            <div className="hero-slide-controls">
              <span className="slide-number">
                0{slide + 1}
                <span> / 03</span>
              </span>
              <div className="slide-dots">
                {vehicles.slice(0, 3).map((v, i) => (
                  <button
                    key={v.id}
                    aria-label={`Show ${v.name}`}
                    aria-pressed={slide === i}
                    className={slide === i ? "active" : ""}
                    onClick={() => {
                      setSlide(i);
                      setPaused(true);
                    }}
                  />
                ))}
              </div>
              <button
                className="icon-button"
                aria-label={paused ? "Play carousel" : "Pause carousel"}
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button
                className="icon-button"
                aria-label="Previous vehicle"
                onClick={() => {
                  setSlide((slide + 2) % 3);
                  setPaused(true);
                }}
              >
                <ArrowLeft size={17} />
              </button>
              <button
                className="icon-button"
                aria-label="Next vehicle"
                onClick={() => {
                  setSlide((slide + 1) % 3);
                  setPaused(true);
                }}
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
        <div className="hero-base">
          <a href="#collection" className="scroll-cue">
            <span>
              <ChevronDown size={14} />
            </span>
            SCROLL TO DISCOVER
          </a>
          <div>
            <span>01 /</span> EXCEPTIONAL VEHICLES
          </div>
          <div>
            <span>02 /</span> PERSONAL EXPERIENCES
          </div>
          <div>
            <span>03 /</span> EFFORTLESS ARRIVALS
          </div>
        </div>
      </section>
      <div className="category-strip">
        <div className="container">
          {[
            "Grand touring",
            "Executive",
            "SUV",
            "Electric",
            "Open top",
            "Group travel",
          ].map((c, i) => (
            <Link key={c} to={`/fleet?category=${encodeURIComponent(c)}`}>
              <span className="micro">0{i + 1}</span>
              {c}
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </div>
      </div>
      <section className="section container" id="collection">
        <SectionHeading
          label="01 / The collection"
          title="An expression of"
          italic="you."
          to="/fleet"
          link="View all vehicles"
        />
        <p className="section-subtitle">
          Find the one that feels right. Six concepts. Endless possibilities.
        </p>
        <div className="vehicle-grid">
          {vehicles.slice(0, 3).map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} index={i} />
          ))}
        </div>
      </section>
      <section className="editorial-section container reveal">
        <div className="editorial-visual">
          <MediaSlot kind="architecture" label="LIFESTYLE IMAGE PLACEHOLDER" />
          <div className="editorial-stamp">
            THE
            <br />
            <em>considered</em>
            <br />
            JOURNEY <span>V / S</span>
          </div>
        </div>
        <div className="editorial-copy">
          <Eyebrow>More than the keys</Eyebrow>
          <h2>
            Some journeys
            <br />
            stay <em>with you.</em>
          </h2>
          <p>
            The right vehicle is only the beginning. It is the way the day
            unfolds. The freedom to take a different turn. The small details
            that make a moment feel exceptional.
          </p>
          <p>
            From your first idea to the final arrival, this is travel with a
            little more intention.
          </p>
          <Link to="/experiences" className="text-link">
            Discover the experiences
            <ArrowUpRight size={17} />
          </Link>
          <div className="editorial-signature">
            Made for the moments that matter.
            <span>VEHICLESITE / CONCEPT PHILOSOPHY</span>
          </div>
        </div>
      </section>
      <div className="marquee" aria-hidden="true">
        <div>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              THE JOURNEY IS THE EXPERIENCE <i>✳</i> ARRIVE AS YOURSELF{" "}
              <i>✳</i>{" "}
            </span>
          ))}
        </div>
      </div>
      <section className="section container">
        <SectionHeading
          label="02 / A different kind of itinerary"
          title="Choose the"
          italic="feeling."
          to="/experiences"
          link="All experiences"
        />
        <div className="experience-teasers">
          <Link to="/experiences?experience=city" className="teaser reveal">
            <MediaSlot kind="city" label="CITY FILM / IMAGE PLACEHOLDER" />
            <div>
              <span className="micro">01 / CITY & NIGHTLIFE</span>
              <h3>
                The city, <em>after hours.</em>
              </h3>
              <span className="teaser-arrow">
                <ArrowUpRight />
              </span>
            </div>
          </Link>
          <Link to="/experiences?experience=escape" className="teaser reveal">
            <MediaSlot
              kind="landscape"
              label="ESCAPE FILM / IMAGE PLACEHOLDER"
            />
            <div>
              <span className="micro">02 / WEEKEND ESCAPES</span>
              <h3>
                Take the <em>longer way.</em>
              </h3>
              <span className="teaser-arrow">
                <ArrowUpRight />
              </span>
            </div>
          </Link>
        </div>
      </section>
      <section className="process-section container reveal">
        <div>
          <Eyebrow>Beautifully uncomplicated</Eyebrow>
          <h2>
            Your journey.
            <br />
            <em>Three considered steps.</em>
          </h2>
        </div>
        <div className="process-list">
          {[
            [
              "01",
              "Find your vehicle",
              "Explore the collection. Save your favorites. Discover your perfect starting point.",
            ],
            [
              "02",
              "Make it personal",
              "Choose the experience, the details, and the pace that feels right for you.",
            ],
            [
              "03",
              "Imagine the arrival",
              "Preview your journey brief. Every detail in one beautifully simple place.",
            ],
          ].map(([n, t, c]) => (
            <div key={n}>
              <span>{n}</span>
              <div>
                <h3>{t}</h3>
                <p>{c}</p>
              </div>
              <ArrowUpRight size={18} />
            </div>
          ))}
        </div>
      </section>
      <JourneyCTA />
    </>
  );
}
