import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, Download,
  KeyRound, CarFront, Clock3, ClipboardList, FileText, Info, MapPin, ChevronDown,
} from "lucide-react";
import { vehicles, pickupChecklist, testDriveChecklist } from "../data";
import { dayFromToday, formatDay, visitDateValid, makeCalendar } from "../sales";
import { saveText } from "../lib";
import { Intro, Eyebrow, DemoNote } from "../components/UI";
import { MediaSlot } from "../components/Media";
import "./Pickup.css";

const purposes = [
  { id: "test-drive", title: "Test drive", caption: "Get a feel for your next car.", detail: "Explore before you decide", Icon: CarFront },
  { id: "pickup", title: "Vehicle pickup", caption: "Plan the handover day.", detail: "Prepare for your first drive home", Icon: KeyRound },
];
const steps = [
  { title: "Your visit", detail: "Choose the details" },
  { title: "Get ready", detail: "A little preparation" },
  { title: "Your draft", detail: "Review & keep a copy" },
];
const timeOptions = ["10:00", "11:30", "13:00", "14:30", "16:00"];

export default function Pickup() {
  const [params, setParams] = useSearchParams();
  const purpose = params.get("purpose") === "pickup" ? "pickup" : "test-drive";
  const purposeName = purpose === "pickup" ? "Vehicle pickup" : "Test drive";
  const vehicle = vehicles.find(v => v.id === params.get("vehicle")) || vehicles[0];
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(() => dayFromToday(1));
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [checked, setChecked] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [invalidField, setInvalidField] = useState<"date" | "vehicle" | null>(null);
  const [exported, setExported] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(1);
  const checklist = purpose === "pickup" ? pickupChecklist : testDriveChecklist;
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "your device's local time zone";
  const dateObject = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00`) : null;
  const hasDate = dateObject !== null && Number.isFinite(dateObject.getTime());
  const shortDate = hasDate ? dateObject.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "Choose a date";
  const documentPath = purpose === "pickup" ? "/documents/pickup-essentials" : "/documents/vehicle-records";

  useEffect(() => {
    setStep(1); setChecked([]); setError(""); setInvalidField(null); setExported(false);
  }, [purpose, vehicle.id]);
  useEffect(() => {
    if (previousStep.current !== step) {
      heading.current?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 980px)").matches) {
        heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
      }
    }
    previousStep.current = step;
  }, [step]);
  const query = (key: string, value: string) => {
    const next = new URLSearchParams(window.location.search);
    next.set(key, value);
    setParams(next, { replace: true });
  };
  const changeDate = (value: string) => { setDate(value); setError(""); setInvalidField(null); setExported(false); };
  const changeStep = (value: number) => { setStep(value); setError(""); setInvalidField(null); setExported(false); };
  const validate = () => {
    if (vehicle.stock !== "Available") return "This sample car is not available for visit planning. Choose an available example.";
    if (!visitDateValid(date, time) || date > dayFromToday(90)) return "Choose a valid future date and time within the next 90 days.";
    return "";
  };
  const showValidation = (message: string) => {
    setError(message);
    const field = vehicle.stock !== "Available" ? "vehicle" : "date";
    setInvalidField(field);
    setStep(1);
    requestAnimationFrame(() => document.getElementById(`pickup-${field}`)?.focus({ preventScroll: false }));
  };
  const next = () => {
    const message = validate();
    if (message) { showValidation(message); return; }
    setError(""); setInvalidField(null); setStep(s => Math.min(3, s + 1));
  };
  const draftText = () => [
    "VEHICLESITE / PERSONAL VISIT DRAFT", "UNCONFIRMED — NOT A BOOKING", "",
    `Purpose: ${purposeName}`,
    `Fictional car: ${vehicle.year} ${vehicle.name} (${vehicle.stockNumber})`,
    `Preferred date: ${date}`, `Preferred time: ${time}`, `Time zone: ${zone}`,
    "Location: To be confirmed with the seller", "",
    "Preparation checklist (discussion points, not official requirements):",
    ...checklist.map((item, i) => `${checked.includes(i) ? "[x]" : "[ ]"} ${item}`),
    "", `Notes: ${notes || "None entered"}`, "",
    "DEMO ONLY. No appointment, vehicle hold, purchase, or dealer notification has been created. Confirm the actual vehicle, date, time, location, and requirements directly with the seller.",
  ].join("\n");
  const exportDraft = (calendar: boolean) => {
    const message = validate();
    if (message) { showValidation(message); return; }
    try {
      if (calendar) saveText(`vehiclesite-unconfirmed-${purpose}.ics`, makeCalendar(date, time, purposeName, vehicle.name, notes), "text/calendar");
      else saveText("vehiclesite-visit-draft.txt", draftText());
      setExported(true); setError("");
    } catch {
      setError("Your file could not be prepared. Your draft is still here; please try again.");
    }
  };

  return (
    <div className="pickup-page">
      <Intro number="03" label="Pickup & test drives" title="The keys." italic="A date to remember."
        copy="From a first impression to your first drive home. Choose the visit, consider the details, and make a plan that feels like yours." />
      <section className="container sales-pickup">
        <div className="pickup-intro-rail" aria-label="About visit planning">
          <span><CalendarDays size={15} />Choose your preferred date</span>
          <span><ClipboardList size={15} />Arrive a little more prepared</span>
          <span><Download size={15} />Keep a copy of your plan</span>
        </div>
        <DemoNote>Dates and times are preferences, not real availability. Nothing is booked, reserved, or sent to a dealership.</DemoNote>
        <div className="sales-visit-grid">
          <div className="sales-visit-builder pickup-workspace">
            <ol className="sales-stepper pickup-stepper" aria-label="Visit planning progress">
              {steps.map((item, i) => (
                <li key={item.title} className={step === i + 1 ? "current" : step > i + 1 ? "complete" : ""} aria-current={step === i + 1 ? "step" : undefined}>
                  <button type="button" disabled={i + 1 >= step} aria-label={`Return to ${item.title.toLowerCase()}`} onClick={() => changeStep(i + 1)}>
                    <span className="pickup-step-number" aria-hidden="true">{step > i + 1 ? <Check size={14} /> : `0${i + 1}`}</span>
                    <span className="pickup-step-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="pickup-workspace-body">
              {step === 1 && (
                <div className="sales-visit-step pickup-visit-step">
                  <div className="pickup-tool-intro"><Eyebrow>01 / Picture the moment</Eyebrow><h2 ref={heading} tabIndex={-1}>What brings<br /><em>you in?</em></h2><p>A closer look, or the start of something new. Let's plan your visit.</p></div>
                  <div className="sales-purpose pickup-purpose" role="group" aria-label="Visit purpose">
                    {purposes.map(({ id, title, caption, detail, Icon }) => (
                      <button key={id} type="button" aria-label={title} className={purpose === id ? "active" : ""} aria-pressed={purpose === id} onClick={() => query("purpose", id)}>
                        <span className="pickup-purpose-top"><span className="pickup-purpose-icon"><Icon size={24} /></span><span className="pickup-selected-mark" aria-hidden="true">{purpose === id && <Check size={12} />}</span></span>
                        <strong>{title}</strong><span className="pickup-purpose-caption">{caption}</span><small>{detail}</small>
                      </button>
                    ))}
                  </div>
                  <fieldset className="pickup-fieldset">
                    <legend><span aria-hidden="true">01</span>The car you have in mind</legend>
                    <label className="sales-field">Your sample vehicle
                      <select id="pickup-vehicle" value={vehicle.id} aria-invalid={invalidField === "vehicle" || undefined} aria-describedby={invalidField === "vehicle" ? "pickup-validation" : "pickup-vehicle-note"} onChange={e => query("vehicle", e.target.value)}>
                        {vehicles.map(v => <option key={v.id} value={v.id} disabled={v.stock !== "Available"}>{v.year} {v.name}{v.stock !== "Available" ? ` · ${v.stock} (visits disabled)` : ""}</option>)}
                      </select>
                    </label>
                    <p className="pickup-field-note" id="pickup-vehicle-note">Fictional inventory. Choose an available example to explore the planner.</p>
                  </fieldset>
                  <fieldset className="pickup-fieldset pickup-date-fieldset">
                    <legend><span aria-hidden="true">02</span>A date to look forward to</legend>
                    <div className="pickup-date-input-row"><label className="sales-field">Preferred date
                      <input id="pickup-date" type="date" value={date} min={dayFromToday(0)} max={dayFromToday(90)} required aria-invalid={invalidField === "date" || undefined} aria-describedby={invalidField === "date" ? "pickup-validation pickup-date-note" : "pickup-date-note"} onChange={e => changeDate(e.target.value)} />
                    </label><span className="pickup-date-range"><CalendarDays size={18} /><span>A date within<br /><strong>the next 90 days</strong></span></span></div>
                    <div className="pickup-date-caption"><span>The next seven days</span><span>Suggestions only</span></div>
                    <div className="sales-date-rail pickup-date-rail" role="group" aria-label="Suggested dates, not availability">
                      {Array.from({ length: 7 }, (_, i) => dayFromToday(i + 1)).map(day => {
                        const d = new Date(`${day}T12:00:00`);
                        return <button type="button" key={day} aria-label={formatDay(day)} aria-pressed={date === day} className={date === day ? "active" : ""} onClick={() => changeDate(day)}><span>{d.toLocaleDateString("en-CA", { weekday: "short" })}</span><strong>{d.getDate()}</strong><small>{d.toLocaleDateString("en-CA", { month: "short" })}</small></button>;
                      })}
                    </div>
                    <p className="pickup-field-note" id="pickup-date-note">Choose a date here or in the calendar above. These are not confirmed appointment slots.</p>
                  </fieldset>
                  <fieldset className="sales-time-field pickup-fieldset">
                    <legend><span aria-hidden="true">03</span>Your preferred time</legend>
                    <div className="pickup-time-heading"><span><Clock3 size={14} />Suggested visit times</span><span>Local to your device</span></div>
                    <div className="sales-time-options pickup-time-options">
                      {timeOptions.map(slot => <label key={slot} className={time === slot ? "active" : ""}><input type="radio" aria-label={slot} name="preferred-time" value={slot} checked={time === slot} onChange={() => { setTime(slot); setError(""); setInvalidField(null); setExported(false); }} /><span>{slot}</span></label>)}
                    </div>
                    <p className="pickup-timezone"><Clock3 size={13} /><span>Time zone: <strong>{zone}</strong></span></p>
                  </fieldset>
                  <div className="pickup-info-note"><Info size={17} /><p>A preferred date is a starting point. Confirm the vehicle, opening hours, location, and appointment with the actual seller before travelling.</p></div>
                  <a className="pickup-mobile-summary" href="#pickup-summary"><span>Your visit at a glance<strong>{shortDate} · {time}</strong></span><ArrowRight size={18} /></a>
                </div>
              )}

              {step === 2 && (
                <div className="sales-visit-step pickup-visit-step">
                  <div className="pickup-tool-intro"><Eyebrow>02 / A little preparation</Eyebrow><h2 ref={heading} tabIndex={-1}>{purpose === "pickup" ? "Make the handover" : "Make the first drive"}<br /><em>feel easy.</em></h2><p>Keep the useful questions close. These are optional discussion prompts, not official requirements.</p></div>
                  <div className="sales-readiness pickup-readiness">
                    <span className="sales-readiness-ring" style={{ "--ready": `${checked.length / checklist.length * 100}%` } as CSSProperties} aria-hidden="true">{checked.length}/{checklist.length}</span>
                    <div><span className="micro">A LITTLE MORE PREPARED</span><strong>Your preparation checklist</strong><p role="status">{checked.length} of {checklist.length} points considered</p></div>
                  </div>
                  <div className="sales-checklist pickup-checklist">
                    {checklist.map((item, i) => <label key={item} className={checked.includes(i) ? "is-checked" : ""}><input type="checkbox" aria-label={item} checked={checked.includes(i)} onChange={e => { const isChecked = e.target.checked; setChecked(current => isChecked ? [...new Set([...current, i])] : current.filter(n => n !== i)); setExported(false); }} /><span>{item}</span><small aria-hidden="true">0{i + 1}</small></label>)}
                  </div>
                  <div className="pickup-notes-box"><label className="sales-field">Notes for your own visit draft<textarea rows={4} maxLength={800} value={notes} aria-describedby="pickup-notes-help" onChange={e => { setNotes(e.target.value); setExported(false); }} placeholder="Questions to ask, features to try, details to confirm…" /></label><div className="pickup-notes-footer"><span id="pickup-notes-help">Avoid sensitive personal information.</span><span>{notes.length}/800</span></div></div>
                  <Link className="pickup-document-link" to={documentPath}><FileText size={20} /><span><strong>Keep the right details with you.</strong><small>Browse preparation templates</small></span><ArrowUpRight size={17} /></Link>
                  <div className="pickup-info-note"><Info size={17} /><p>You can continue with any number of items checked. Your preparation progress does not confirm an appointment or a purchase.</p></div>
                </div>
              )}

              {step === 3 && (
                <div className="sales-visit-step sales-draft pickup-visit-step" id="visit-draft">
                  <div className="pickup-tool-intro"><Eyebrow>03 / Ready to keep</Eyebrow><h2 ref={heading} tabIndex={-1}>Your plan.<br /><em>Not a booking.</em></h2><p>A thoughtful starting point for a conversation with the seller. Review the details below and keep your own copy.</p></div>
                  <div className="sales-visit-ticket pickup-visit-ticket">
                    <div className="pickup-ticket-top"><span className="micro">VEHICLESITE / PERSONAL VISIT PLAN</span><span className="pickup-draft-badge">UNCONFIRMED DRAFT</span></div>
                    <div className="pickup-ticket-main"><div><span className="micro">{purposeName.toUpperCase()}</span><h3>{vehicle.year} {vehicle.name}</h3><p>{vehicle.stockNumber} · Fictional vehicle</p></div><KeyRound size={35} aria-hidden="true" /></div>
                    <div className="pickup-ticket-details"><div><CalendarDays size={17} /><span><small>PREFERRED DATE</small><strong>{formatDay(date)}</strong></span></div><div><Clock3 size={17} /><span><small>PREFERRED TIME</small><strong>{time} · {zone}</strong></span></div><div><MapPin size={17} /><span><small>LOCATION</small><strong>To be confirmed with the seller</strong></span></div></div>
                    <p className="pickup-ticket-foot">A personal draft. Not an appointment, reservation, or dealer notification.</p>
                  </div>
                  <div className="sales-draft-checklist pickup-review-checklist"><div className="pickup-review-heading"><h3>Preparation notes</h3><span>{checked.length}/{checklist.length} considered</span></div>{checklist.map((item, i) => <p key={item}><span role="img" className={checked.includes(i) ? "checked" : ""} aria-label={checked.includes(i) ? "Checked" : "Not checked"}>{checked.includes(i) ? <Check size={13} /> : <span aria-hidden="true">○</span>}</span>{item}</p>)}</div>
                  {notes && <div className="sales-draft-notes pickup-draft-notes"><h3>Your notes</h3><p>{notes}</p></div>}
                  <div className="pickup-export-heading"><h3>Take your plan with you.</h3><p>Choose a personal calendar reminder or a readable visit draft.</p></div>
                  <div className="sales-export-actions pickup-export-actions">
                    <button className="pickup-export-card" type="button" aria-label="Download unconfirmed reminder" onClick={() => exportDraft(true)}><CalendarDays size={23} /><span className="pickup-filetype">.ICS / CALENDAR</span><strong>Keep the date in view.</strong><span>A tentative personal reminder. No invitation is sent.</span><span className="pickup-export-link">Download unconfirmed reminder<Download size={15} /></span></button>
                    <button className="pickup-export-card" type="button" aria-label="Download visit draft" onClick={() => exportDraft(false)}><FileText size={23} /><span className="pickup-filetype">.TXT / YOUR NOTES</span><strong>Keep the details close.</strong><span>Your preferred visit, preparation checklist, and notes.</span><span className="pickup-export-link">Download visit draft<Download size={15} /></span></button>
                  </div>
                  <details className="pickup-export-details"><summary><Info size={14} />About these downloads<ChevronDown size={15} /></summary><p>The .ics file creates a tentative, personal 45-minute placeholder when you import it into your calendar. It is not an invitation and does not notify the seller. Both exported files contain any notes you entered. Confirm the actual appointment and requirements separately.</p></details>
                  {exported && <p className="sales-export-notice pickup-export-notice" role="status"><Check size={16} />Draft exported. No appointment has been booked.</p>}
                </div>
              )}

              {error && <div className="pickup-error"><Info size={18} /><p id="pickup-validation" className="form-error" role="alert">{error}</p></div>}
              <div className="sales-builder-actions pickup-builder-actions">
                {step > 1 ? <button className="text-link" type="button" onClick={() => changeStep(step - 1)}><ArrowLeft size={15} />{step === 3 ? "Edit preparation" : "Back"}</button> : <span className="pickup-action-note">A plan, without a commitment.</span>}
                {step < 3 ? <button className="button button-gold" type="button" onClick={next}>{step === 1 ? "Prepare my visit" : "Review my plan"}<ArrowUpRight size={16} /></button> : <button className="text-link" type="button" onClick={() => changeStep(1)}>Edit date or vehicle<CalendarDays size={15} /></button>}
              </div>
            </div>
          </div>

          <aside className="sales-visit-summary pickup-summary" id="pickup-summary" aria-label="Live visit summary">
            <div className="pickup-summary-header"><span className="micro">YOUR VISIT, TAKING SHAPE</span><span className="pickup-draft-badge">NOT BOOKED</span></div>
            <div className="pickup-summary-visual"><MediaSlot key={`summary-${vehicle.id}`} vehicle={vehicle} /><span className="pickup-summary-visual-note">ILLUSTRATIVE VEHICLE</span></div>
            <div className="pickup-summary-content">
              <div className="pickup-summary-car"><span className="micro">{vehicle.year} · {vehicle.condition} · {vehicle.stockNumber}</span><h3>{vehicle.name}</h3><p>{purposeName}<span>Preferred visit</span></p></div>
              <div className="pickup-date-feature"><div className="pickup-date-stamp" aria-hidden="true"><span>{hasDate ? dateObject.toLocaleDateString("en-CA", { month: "short" }) : "DATE"}</span><strong>{hasDate ? dateObject.getDate() : "—"}</strong></div><div><span className="micro">YOUR PREFERRED MOMENT</span><strong>{hasDate ? dateObject.toLocaleDateString("en-CA", { weekday: "long" }) : "Choose your date"} · {time}</strong><small>{shortDate}</small></div></div>
              <dl className="sales-breakdown"><div><dt>Purpose</dt><dd>{purposeName}</dd></div><div><dt>Preferred date</dt><dd>{shortDate}</dd></div><div><dt>Preferred time</dt><dd>{time}</dd></div><div><dt>Time zone</dt><dd>{zone}</dd></div><div><dt>Location</dt><dd>To be confirmed</dd></div><div><dt>Preparation</dt><dd>{checked.length}/{checklist.length} considered</dd></div><div className="pickup-status-row"><dt>Appointment status</dt><dd>Not booked</dd></div></dl>
              <div className="pickup-summary-tip"><Info size={15} /><p>Your preferred date and time are not confirmed availability. Contact the seller before travelling.</p></div>
              <Link className="button button-subtle" to={`/buying?vehicle=${vehicle.id}`}>Explore this car's numbers<ArrowUpRight size={15} /></Link>
              <details className="pickup-storage-details"><summary><FileText size={14} />Where your draft is saved<ChevronDown size={15} /></summary><p>Your date, notes, and checklist stay in page memory. Nothing is sent to a dealership. Reloading or leaving this page clears the draft unless you downloaded it.</p></details>
              <span className="pickup-private-note"><Check size={13} />Your draft. Nothing submitted.</span>
            </div>
          </aside>
        </div>
        <section className="pickup-next-steps" aria-labelledby="pickup-next-heading">
          <div className="pickup-next-copy"><Eyebrow>Keep the details close</Eyebrow><h2 id="pickup-next-heading">A little more ready.<br /><em>A little more you.</em></h2><p>Take the next step with a clearer picture of the paperwork and the numbers.</p></div>
          <Link className="pickup-next-card" to={documentPath}><ClipboardList size={25} /><span className="micro">THE PREPARATION</span><h3>The right questions.</h3><p>{purpose === "pickup" ? "Explore pickup checklists and handover templates before the big day." : "Explore vehicle-record templates and inspection questions before your visit."}</p><span className="text-link">Open the document library<ArrowUpRight size={16} /></span></Link>
          <Link className="pickup-next-card" to={`/buying?vehicle=${vehicle.id}`}><KeyRound size={25} /><span className="micro">THE BIGGER PICTURE</span><h3>Make the numbers yours.</h3><p>Explore a payment scenario or prepare a trade-in conversation for this car.</p><span className="text-link">Open buying tools<ArrowUpRight size={16} /></span></Link>
        </section>
      </section>
    </div>
  );
}
