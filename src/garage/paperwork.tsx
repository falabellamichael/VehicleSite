import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  MessageSquare,
  Printer,
} from "lucide-react";
import {
  daytonClock,
  guideJobs,
  guideVehicles,
  labor,
  laborRate,
  money,
  repairItems,
  taxRate,
  withTax,
} from "./data";

export function Estimate({
  found,
  stamp,
}: {
  found: string[];
  stamp: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(
    repairItems.map((item) => item.id),
  );
  const [approved, setApproved] = useState(false);
  const subtotal = repairItems.reduce(
    (sum, item) =>
      sum + (selected.includes(item.id) ? item.parts + labor(item.hours) : 0),
    0,
  );
  return (
    <section
      className="hg-section hg-estimate"
      id="estimate"
      aria-labelledby="estimate-heading"
    >
      <div className="hg-section-intro reveal">
        <span className="hg-kicker">MECHANICAL SERVICES / THE ESTIMATE</span>
        <h2 id="estimate-heading">
          No mysteries.
          <br />
          <span>No surprises.</span>
        </h2>
        <p>
          You see what we see. Photos, plain English, and a price before a
          wrench turns. You decide what happens next.
        </p>
        <div className="hg-process-note">
          <MessageSquare size={24} />
          <p>
            A photo. A price. Your say.
            <br />
            <strong>That’s how approval should work.</strong>
          </p>
        </div>
        <p className="hg-fine">
          Try the sample estimate. Uncheck a repair to see the total change.
          Your inspection findings are marked on the shop copy.
        </p>
      </div>
      <div className="hg-printer reveal">
        <div className="hg-printer-slot">
          <Printer size={16} />
          <span>HARLAN ST. / ESTIMATE PRINTER</span>
          <i />
        </div>
        <div className="hg-paper hg-estimate-sheet">
          <div className="hg-paper-heading">
            <div>
              <span>HARLAN STREET GARAGE</span>
              <h3>REPAIR ESTIMATE</h3>
            </div>
            <b>No. 0087</b>
          </div>
          <div className="hg-paper-meta">
            <span>VEHICLE / SHOP DEMONSTRATOR</span>
            <span>CUSTOMER COPY</span>
          </div>
          <table>
            <caption className="sr-only">
              Illustrative repair estimate in US dollars. Choose the repairs to
              include.
            </caption>
            <thead>
              <tr>
                <th scope="col">APPROVE / DESCRIPTION</th>
                <th scope="col" className="hg-cost-detail">
                  PARTS
                </th>
                <th scope="col" className="hg-cost-detail">
                  LABOR
                </th>
                <th scope="col">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {repairItems.map((item, index) => (
                <tr
                  key={item.id}
                  style={{ "--row": index } as React.CSSProperties}
                  className={selected.includes(item.id) ? "" : "hg-unselected"}
                >
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() => {
                          setApproved(false);
                          setSelected((current) =>
                            current.includes(item.id)
                              ? current.filter((id) => id !== item.id)
                              : [...current, item.id],
                          );
                        }}
                      />
                      <span>
                        {item.action}
                        <small>
                          {found.includes(item.id)
                            ? "✓ YOU FOUND THIS"
                            : "TECHNICIAN RECOMMENDATION"}
                        </small>
                      </span>
                    </label>
                  </td>
                  <td className="hg-cost-detail">{money(item.parts)}</td>
                  <td className="hg-cost-detail">{money(labor(item.hours))}</td>
                  <td>{money(item.parts + labor(item.hours))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="hg-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Illustrative tax ({taxRate * 100}%)</dt>
              <dd>{money(withTax(subtotal) - subtotal)}</dd>
            </div>
            <div className="hg-total">
              <dt>YOUR TOTAL</dt>
              <dd aria-live="polite">{money(withTax(subtotal))}</dd>
            </div>
          </dl>
          <button
            className="hg-button hg-approve"
            disabled={!selected.length || approved}
            onClick={() => {
              setApproved(true);
              stamp();
            }}
          >
            <MessageSquare size={17} />
            {approved ? "Sample approval recorded" : "Approve by text · demo"}
            <ArrowUpRight size={18} />
          </button>
          <div className="hg-approval-result" role="status">
            {approved && (
              <>
                <span className="hg-stamp">APPROVED</span>
                <p>
                  Demo only. No text sent, payment taken, or repair authorized.
                </p>
              </>
            )}
          </div>
          <p className="hg-paper-fine">
            ILLUSTRATIVE PRICING ONLY · NO PAYMENT DUE
            <br />
            24 MONTH / 24,000 MILE SAMPLE WARRANTY
          </p>
        </div>
      </div>
    </section>
  );
}

export function LaborGuide() {
  const [vehicleId, setVehicleId] = useState(guideVehicles[0].id);
  const [jobId, setJobId] = useState(guideJobs[0].id);
  const vehicle = guideVehicles.find((item) => item.id === vehicleId)!;
  const job = guideJobs.find((item) => item.id === jobId)!;
  const hours = Math.round(job.hours * vehicle.factor * 10) / 10;
  const laborCost = labor(hours);
  const low = Math.round(job.low * vehicle.factor),
    high = Math.round(job.high * vehicle.factor);
  return (
    <section
      className="hg-section hg-labor"
      id="repair"
      aria-labelledby="labor-heading"
    >
      <div className="hg-section-intro reveal">
        <span className="hg-kicker">03 / THE REPAIR</span>
        <h2 id="labor-heading">
          Good work.
          <br />
          <span>On the books.</span>
        </h2>
        <p>
          Book hours, an honest labor rate, and parts that make sense for your
          car. Here’s how the numbers come together.
        </p>
        <div className="hg-rate">
          <strong>$128</strong>
          <span>
            PER BOOK HOUR
            <br />
            NO GUESSWORK
          </span>
        </div>
      </div>
      <div className="hg-labor-guide reveal">
        <div className="hg-guide-title">
          <span>THE LABOR GUIDE</span>
          <span>VOL. 01 / SAMPLE</span>
        </div>
        <div className="hg-guide-inputs">
          <label>
            YOUR VEHICLE
            <select
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
            >
              {guideVehicles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            THE JOB
            <select
              value={jobId}
              onChange={(event) => setJobId(event.target.value)}
            >
              {guideJobs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="hg-guide-result" aria-live="polite">
          <dl>
            <div>
              <dt>Book time</dt>
              <dd>{hours.toFixed(1)} hours</dd>
            </div>
            <div>
              <dt>Labor · {money(laborRate)}/hr</dt>
              <dd>{money(laborCost)}</dd>
            </div>
            <div>
              <dt>Parts range</dt>
              <dd>
                {money(low)} – {money(high)}
              </dd>
            </div>
            <div className="hg-guide-total">
              <dt>
                Out the door <small>incl. illustrative 7.5% tax</small>
              </dt>
              <dd>
                {money(withTax(laborCost + low))} –{" "}
                {money(withTax(laborCost + high))}
              </dd>
            </div>
          </dl>
          <p>
            <Check size={15} />
            {job.ready}
          </p>
        </div>
        <p className="hg-fine">
          Example guide, not a quote or a live schedule. Exact hours and parts
          depend on the vehicle and diagnosis. Warranty terms are part of this
          fictional shop concept.
        </p>
        <a className="hg-text-link" href="#pickup">
          Start with a diagnosis <ArrowDown size={16} />
        </a>
      </div>
    </section>
  );
}

export function Pickup({ stamp }: { stamp: () => void }) {
  const [now, setNow] = useState(() => new Date());
  const [received, setReceived] = useState(false);
  const confirmation = useRef<HTMLDivElement>(null);
  const clock = daytonClock(now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (received) confirmation.current?.focus();
  }, [received]);
  return (
    <section
      className="hg-section hg-pickup"
      id="pickup"
      aria-labelledby="pickup-heading"
    >
      <div className="hg-section-intro reveal">
        <span className="hg-kicker">VISIT US / SALES & SERVICE</span>
        <h2 id="pickup-heading">
          Let’s talk
          <br />
          <span>cars & care.</span>
        </h2>
        <p>
          Looking for your next car? Start with the showroom. Need maintenance
          or repairs? Tell us about your vehicle in the service form.
        </p>
        <Link to="/inventory" className="hg-text-link hg-sales-visit-link">
          Browse the car collection <ArrowUpRight size={17} />
        </Link>
        <address>
          1418 Harlan Street
          <br />
          Dayton, Ohio
          <br />
          <span>(937) 555-0148 · fictional shop</span>
        </address>
        <div className="hg-hours">
          <span className={`hg-open ${clock.open ? "is-open" : ""}`}>
            <i />
            {clock.open ? "OPEN NOW" : "CLOSED NOW"} <small>DEMO HOURS</small>
          </span>
          <span>{clock.time} / DAYTON</span>
          <dl>
            <div>
              <dt>Monday–Friday</dt>
              <dd>8 am–6 pm</dd>
            </div>
            <div>
              <dt>Saturday</dt>
              <dd>9 am–1 pm</dd>
            </div>
            <div>
              <dt>Sunday</dt>
              <dd>Off the clock</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="hg-paper hg-booking reveal">
        <div className="hg-paper-heading">
          <div>
            <span>CUSTOMER SECTION / SERVICE REQUEST</span>
            <h3>BOOK A SERVICE</h3>
          </div>
          <span className="hg-order-number">No. 0087</span>
        </div>
        {received ? (
          <div
            className="hg-received"
            role="status"
            ref={confirmation}
            tabIndex={-1}
          >
            <span className="hg-stamp">RECEIVED</span>
            <h4>Your sample service request is ready.</h4>
            <p>
              This is a local demonstration. Your details have not been sent or
              saved, and no appointment is booked.
            </p>
            <button className="hg-button" onClick={() => setReceived(false)}>
              Start another sample <ArrowUpRight size={18} />
            </button>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setReceived(true);
              stamp();
            }}
          >
            <p className="hg-form-intro">
              Routine service or something that needs checking? Tell us here.
            </p>
            <div className="hg-form-row">
              <label>
                01 / YOUR NAME
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="First & last name"
                />
              </label>
              <label>
                02 / MOBILE NUMBER
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  required
                  pattern="[+()0-9 .-]{7,25}"
                  maxLength={25}
                  title="Enter 7 to 25 characters using phone digits, spaces, +, parentheses, or dashes."
                  placeholder="(937) 555-0100"
                />
              </label>
            </div>
            <label>
              03 / YOUR VEHICLE
              <input
                name="vehicle"
                required
                maxLength={120}
                placeholder="Year, make & model"
              />
            </label>
            <label>
              04 / WHAT BRINGS YOU IN?
              <textarea
                name="concern"
                required
                minLength={10}
                maxLength={1500}
                rows={4}
                placeholder="A routine service, brake check, warning light, or something you’d like us to inspect…"
              />
            </label>
            <label className="hg-consent">
              <input type="checkbox" required />
              <span>
                I understand this is a fictional shop demo. This form will not
                send my information or book an appointment.
              </span>
            </label>
            <button className="hg-button" type="submit">
              Create a sample service request <ArrowUpRight size={18} />
            </button>
            <p className="hg-paper-fine">
              NO PAYMENT. NO PRESSURE. JUST A STARTING POINT.
            </p>
          </form>
        )}
        <div className="hg-approval-steps">
          <strong>HOW TEXT APPROVAL WORKS</strong>
          <ol>
            <li>We inspect and photograph.</li>
            <li>You review the itemized estimate.</li>
            <li>You approve before work begins.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
