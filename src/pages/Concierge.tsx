import { useState, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  ShieldCheck,
  ChevronDown,
  Plus,
  Minus,
  RotateCcw,
  FileText,
} from "lucide-react";
import { vehicles, experiences, faqs } from "../data";
import { Intro, Eyebrow } from "../components/UI";
import { MediaSlot } from "../components/Media";
import { localToday, saveText } from "../lib";
import { useSite } from "../SiteContext";
const options = ["Self-drive", "Chauffeured", "Extended journey"];
export default function Concierge() {
  const [params] = useSearchParams();
  const { notify } = useSite();
  const initialVehicle =
    vehicles.find((v) => v.id === params.get("vehicle"))?.id ?? vehicles[0].id;
  const [step, setStep] = useState(1),
    [error, setError] = useState("");
  const [draft, setDraft] = useState({
    vehicle: initialVehicle,
    service: "Self-drive",
    date: "",
    time: "18:00",
    guests: 2,
    experience:
      experiences.find((e) => e.id === params.get("experience"))?.id ?? "",
    pickup: "",
    name: "",
    email: "",
    notes: "",
    accepted: false,
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const vehicle = vehicles.find((v) => v.id === draft.vehicle)!;
  function advance(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (draft.date < localToday()) {
      setError("Choose today or a future date for this preview.");
      setStep(1);
      return;
    }
    if (draft.guests < 1 || draft.guests > vehicle.seats) {
      setError(
        `Choose between 1 and ${vehicle.seats} guests for this sample vehicle.`,
      );
      return;
    }
    if (step === 2 && (!draft.name.trim() || !draft.pickup.trim())) {
      setError("Please add a name and a pick-up area for the sample brief.");
      return;
    }
    setError("");
    setStep((s) => Math.min(3, s + 1));
  }
  const output = {
    status: "DEMO ONLY — NOT A RESERVATION",
    vehicle: vehicle.name,
    sampleSpecification: true,
    service: draft.service,
    date: draft.date,
    time: draft.time,
    guests: draft.guests,
    experience:
      experiences.find((e) => e.id === draft.experience)?.subtitle ??
      "Personal itinerary",
    pickup: draft.pickup,
    contact: { name: draft.name, email: draft.email },
    notes: draft.notes,
    notice:
      "Nothing was transmitted. This file is a local preview. Pricing, availability, legal terms, and service delivery are not confirmed.",
  };
  return (
    <>
      <Intro
        number="03"
        label="The concierge"
        title="Every detail."
        italic="Entirely yours."
        copy="A beautiful journey begins with an idea. Explore the interactive brief builder and turn yours into a personalized local preview."
      />
      <section className="container concierge-layout">
        <div className="journey-builder">
          <div className="builder-top">
            <Eyebrow>Your journey, designed</Eyebrow>
            <span className="demo-badge">INTERACTIVE DEMO</span>
          </div>
          <ol className="stepper" aria-label="Journey builder progress">
            {["The journey", "The details", "Your preview"].map((label, i) => (
              <li
                key={label}
                className={
                  step === i + 1 ? "current" : step > i + 1 ? "complete" : ""
                }
                aria-current={step === i + 1 ? "step" : undefined}
              >
                <span>{step > i + 1 ? <Check size={14} /> : `0${i + 1}`}</span>
                {label}
              </li>
            ))}
          </ol>
          <form onSubmit={advance}>
            {step === 1 && (
              <div className="builder-step">
                <h2>Set the scene.</h2>
                <p>
                  Start with the vehicle, the day, and the way you like to
                  travel.
                </p>
                <label>
                  Your vehicle
                  <select
                    value={draft.vehicle}
                    onChange={(e) => {
                      const v = vehicles.find((v) => v.id === e.target.value)!;
                      setDraft({
                        ...draft,
                        vehicle: v.id,
                        guests: Math.min(draft.guests, v.seats),
                      });
                    }}
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.category}
                      </option>
                    ))}
                  </select>
                </label>
                <fieldset>
                  <legend>How would you like to travel?</legend>
                  <div className="option-tiles">
                    {options.map((option) => (
                      <label
                        key={option}
                        className={draft.service === option ? "selected" : ""}
                      >
                        <input
                          type="radio"
                          name="service"
                          value={option}
                          checked={draft.service === option}
                          onChange={() =>
                            setDraft({ ...draft, service: option })
                          }
                        />
                        <span>{option}</span>
                        <Check size={15} />
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="form-two">
                  <label>
                    Journey date
                    <input
                      aria-label="Journey date"
                      type="date"
                      required
                      min={localToday()}
                      value={draft.date}
                      onChange={(e) =>
                        setDraft({ ...draft, date: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Preferred time
                    <input
                      type="time"
                      required
                      value={draft.time}
                      onChange={(e) =>
                        setDraft({ ...draft, time: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="form-two">
                  <div className="guest-field">
                    <label id="guests-label">
                      Guests <small>Sample capacity: {vehicle.seats}</small>
                    </label>
                    <div
                      className="stepper-input"
                      role="group"
                      aria-labelledby="guests-label"
                    >
                      <button
                        type="button"
                        aria-label="Fewer guests"
                        disabled={draft.guests <= 1}
                        onClick={() =>
                          setDraft({ ...draft, guests: draft.guests - 1 })
                        }
                      >
                        <Minus size={16} />
                      </button>
                      <output aria-live="polite">{draft.guests}</output>
                      <button
                        type="button"
                        aria-label="More guests"
                        disabled={draft.guests >= vehicle.seats}
                        onClick={() =>
                          setDraft({ ...draft, guests: draft.guests + 1 })
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <label>
                    The occasion
                    <select
                      value={draft.experience}
                      onChange={(e) =>
                        setDraft({ ...draft, experience: e.target.value })
                      }
                    >
                      <option value="">A personal itinerary</option>
                      {experiences.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.subtitle}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="builder-step">
                <h2>Make it personal.</h2>
                <p>
                  Use sample information. These details are never submitted or
                  saved to a server.
                </p>
                <button
                  type="button"
                  className="text-link sample-fill"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      name: "Alex Example",
                      email: "alex@example.com",
                      pickup: "Your preferred meeting point",
                      notes:
                        "A relaxed journey, with a scenic route along the way.",
                    })
                  }
                >
                  Fill with sample details
                  <ArrowUpRight size={15} />
                </button>
                <div className="form-two">
                  <label>
                    Your name
                    <input
                      required
                      autoComplete="off"
                      value={draft.name}
                      maxLength={100}
                      placeholder="Alex Example"
                      onChange={(e) =>
                        setDraft({ ...draft, name: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Email address
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      value={draft.email}
                      maxLength={254}
                      placeholder="alex@example.com"
                      onChange={(e) =>
                        setDraft({ ...draft, email: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label>
                  Pick-up area
                  <input
                    required
                    autoComplete="off"
                    value={draft.pickup}
                    maxLength={200}
                    placeholder="A hotel, neighborhood, or meeting point"
                    onChange={(e) =>
                      setDraft({ ...draft, pickup: e.target.value })
                    }
                  />
                </label>
                <label>
                  Anything that would make it special? <small>Optional</small>
                  <textarea
                    rows={4}
                    value={draft.notes}
                    maxLength={1000}
                    placeholder="An occasion, a preference, a little detail…"
                    onChange={(e) =>
                      setDraft({ ...draft, notes: e.target.value })
                    }
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    required
                    checked={draft.accepted}
                    onChange={(e) =>
                      setDraft({ ...draft, accepted: e.target.checked })
                    }
                  />
                  <span>
                    I understand this is a local demo. Nothing will be sent and
                    no booking will be made.
                  </span>
                </label>
              </div>
            )}
            {step === 3 && (
              <div className="builder-step preview-step">
                <span className="preview-check">
                  <Check size={28} />
                </span>
                <Eyebrow>A possibility, beautifully outlined</Eyebrow>
                <h2>Your journey preview.</h2>
                <p>
                  This is your local concept brief—not a booking confirmation.
                  No information has been sent.
                </p>
                <dl className="brief-list">
                  {[
                    ["Vehicle", vehicle.name],
                    ["Experience", output.experience],
                    ["Travel style", draft.service],
                    ["Date & time", `${draft.date} · ${draft.time}`],
                    ["Guests", String(draft.guests)],
                    ["Pick-up", draft.pickup],
                    ["Contact", `${draft.name} · ${draft.email}`],
                    ["Pricing", "Not set — placeholder only"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                {draft.notes && (
                  <div className="brief-notes">
                    <span className="micro">YOUR PERSONAL TOUCHES</span>
                    <p>{draft.notes}</p>
                  </div>
                )}
                <button
                  type="button"
                  className="button button-gold"
                  onClick={() => {
                    saveText(
                      "vehiclesite-journey-preview.json",
                      JSON.stringify(output, null, 2),
                      "application/json",
                    );
                    notify("Your local journey preview has been downloaded.");
                  }}
                >
                  <Download size={17} />
                  Download your brief
                </button>
              </div>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="builder-actions">
              {step > 1 ? (
                <button
                  className="text-link"
                  type="button"
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                  }}
                >
                  <ArrowLeft size={16} />
                  Back to {step === 3 ? "details" : "journey"}
                </button>
              ) : (
                <span className="micro">NO PAYMENT. NO RESERVATION.</span>
              )}
              {step < 3 ? (
                <button className="button button-gold" type="submit">
                  {step === 1
                    ? "Personalize the details"
                    : "Create local preview"}
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  className="text-link"
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setDraft({
                      vehicle: vehicles[0].id,
                      service: "Self-drive",
                      date: "",
                      time: "18:00",
                      guests: 2,
                      experience: "",
                      pickup: "",
                      name: "",
                      email: "",
                      notes: "",
                      accepted: false,
                    });
                  }}
                >
                  <RotateCcw size={14} />
                  Start a new journey
                </button>
              )}
            </div>
          </form>
        </div>
        <aside className="journey-summary">
          <div className="summary-card">
            <MediaSlot vehicle={vehicle} />
            <div>
              <Eyebrow>Your chosen companion</Eyebrow>
              <h3>{vehicle.name}</h3>
              <p>
                {vehicle.category} · {vehicle.seats} guests
              </p>
              <hr />
              <dl>
                <div>
                  <dt>Experience</dt>
                  <dd>{draft.service}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{draft.date || "Your preferred day"}</dd>
                </div>
                <div>
                  <dt>Guests</dt>
                  <dd>{draft.guests}</dd>
                </div>
              </dl>
              <div className="summary-quote">
                <span>Pricing</span>
                <strong>To be added</strong>
                <span className="micro">NO LIVE QUOTE OR AVAILABILITY</span>
              </div>
            </div>
          </div>
          <div className="privacy-note">
            <ShieldCheck size={21} />
            <p>
              <strong>Your preview stays with you.</strong>Details are only held
              in this page’s memory. Nothing is emailed, submitted, or stored
              remotely.
            </p>
          </div>
          <Link to="/documents/booking-options" className="text-link">
            <FileText size={16} />
            Explore the booking options
            <ArrowUpRight size={16} />
          </Link>
        </aside>
      </section>
      <section className="faq-section container">
        <div>
          <Eyebrow>A little clarity</Eyebrow>
          <h2>
            Before the
            <br />
            <em>journey begins.</em>
          </h2>
        </div>
        <div>
          {faqs.map(([q, a], i) => (
            <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={q}>
              <h3>
                <button
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {q}
                  <ChevronDown size={19} />
                </button>
              </h3>
              <div id={`faq-${i}`} hidden={openFaq !== i}>
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
