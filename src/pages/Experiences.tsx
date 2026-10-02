import { useSearchParams, Link } from "react-router-dom";
import { ArrowUpRight, Play, Clock3, Sparkles, Route } from "lucide-react";
import { experiences, vehicles, media } from "../data";
import { Intro, Eyebrow, JourneyCTA } from "../components/UI";
import { MediaSlot } from "../components/Media";
import { useSite } from "../SiteContext";
export default function Experiences() {
  const [params, setParams] = useSearchParams();
  const { setModal } = useSite();
  const selected =
    experiences.find((e) => e.id === params.get("experience")) ??
    experiences[0];
  const vehicle = vehicles.find((v) => v.id === selected.vehicle)!;
  return (
    <>
      <Intro
        number="02"
        label="Experiences"
        title="Less ordinary."
        italic="More unforgettable."
        copy="Start with a feeling, not a destination. Four editorial concepts for the journeys you will remember long after you arrive."
      />
      <section className="container experience-section">
        <div
          className="experience-tabs"
          role="tablist"
          aria-label="Choose an experience"
        >
          {experiences.map((e) => (
            <button
              key={e.id}
              role="tab"
              id={`tab-${e.id}`}
              aria-selected={selected.id === e.id}
              aria-controls={`experience-${e.id}`}
              tabIndex={selected.id === e.id ? 0 : -1}
              onClick={() => setParams({ experience: e.id })}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  const i = experiences.indexOf(e);
                  const next =
                    experiences[(i + (event.key === "ArrowRight" ? 1 : 3)) % 4];
                  setParams({ experience: next.id });
                  document.getElementById(`tab-${next.id}`)?.focus();
                }
              }}
            >
              <span>{e.number}</span>
              {e.subtitle}
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
        <div
          className="experience-feature"
          role="tabpanel"
          id={`experience-${selected.id}`}
          aria-labelledby={`tab-${selected.id}`}
          key={selected.id}
        >
          <div className="experience-feature-media">
            <MediaSlot
              kind={selected.kind}
              src={media.experienceImages[selected.id]}
              label={`${selected.subtitle.toUpperCase()} / MEDIA PLACEHOLDER`}
            />
            <button
              className="round-play"
              aria-label={`Preview ${selected.subtitle} film placeholder`}
              onClick={() => setModal({ type: "film" })}
            >
              <Play size={21} fill="currentColor" />
            </button>
            <span className="scene-index" aria-hidden="true">
              {selected.number}
            </span>
          </div>
          <div className="experience-feature-copy">
            <Eyebrow>{selected.subtitle}</Eyebrow>
            <h2>{selected.title}</h2>
            <p>{selected.copy}</p>
            <div className="experience-metadata">
              <span>
                <Clock3 size={16} />
                {selected.duration}
              </span>
              <span>
                <Sparkles size={16} />
                Personally considered
              </span>
              <span>
                <Route size={16} />
                Your own itinerary
              </span>
            </div>
            <Link
              className="button button-gold"
              to={`/concierge?vehicle=${selected.vehicle}&experience=${selected.id}`}
            >
              Shape this experience
              <ArrowUpRight size={17} />
            </Link>
            <span className="micro muted">
              EDITORIAL CONCEPT · NOT A LIVE OFFER
            </span>
          </div>
        </div>
        <div className="recommended">
          <span className="micro">THE PERFECT COMPANION</span>
          <div>
            <strong>{vehicle.name}</strong>
            <span>{vehicle.category} / Sample suggestion</span>
          </div>
          <button
            className="text-link"
            onClick={() => setModal({ type: "vehicle", vehicle })}
          >
            Meet the vehicle
            <ArrowUpRight size={17} />
          </button>
        </div>
      </section>
      <section className="section container details-grid">
        <div>
          <Eyebrow>The details make the difference</Eyebrow>
          <h2>
            Thoughtfully
            <br />
            <em>put together.</em>
          </h2>
          <p>
            Leave space for the details that turn a journey into something
            personal. Each service below is a placeholder for your future
            offering.
          </p>
        </div>
        {[
          [
            "01",
            "On your terms",
            "A start time, a meeting point, and a pace that fit the way you travel.",
          ],
          [
            "02",
            "Beyond the expected",
            "Room for personal touches, occasion notes, and the little things you love.",
          ],
          [
            "03",
            "Beautifully coordinated",
            "A single journey brief brings the vehicle, the experience, and the details together.",
          ],
        ].map(([n, t, c]) => (
          <article key={n} className="detail-card reveal">
            <span>{n}</span>
            <h3>{t}</h3>
            <p>{c}</p>
            <ArrowUpRight size={21} />
          </article>
        ))}
      </section>
      <JourneyCTA />
    </>
  );
}
