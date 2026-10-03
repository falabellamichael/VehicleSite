import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight, ArrowRight, Download, RotateCcw, Calculator, CarFront,
  Check, Wallet, SlidersHorizontal, FileText, CalendarDays, Info, ChevronDown,
} from "lucide-react";
import { vehicles } from "../data";
import { calculatePayment, money, type PaymentInputs } from "../sales";
import { saveText } from "../lib";
import { Intro, Eyebrow, DemoNote } from "../components/UI";
import { MediaSlot } from "../components/Media";
import "./Buying.css";

type Form = Record<keyof PaymentInputs, string>;
const defaults = (price: number): Form => ({
  price: String(price), down: "5000", trade: "0", owing: "0",
  fees: "0", tax: "0", apr: "6.9", months: "60",
});
const tabs = [
  { id: "payment", label: "Payment studio", description: "Explore your monthly picture", Icon: Calculator },
  { id: "trade", label: "Trade-in notebook", description: "Bring your current car into focus", Icon: CarFront },
  { id: "cash", label: "Cash & buying steps", description: "See the path to your next set of keys", Icon: Wallet },
];
const assumptions = "ILLUSTRATION ONLY. Fictional vehicle and sample CAD amounts. Not a quote, credit application, lender offer, approval, or appraisal. Monthly amortization with a fixed entered APR; actual lender calculations may differ. Tax is calculated on the vehicle price only; jurisdiction-specific trade-in credits and tax on fees are not modeled. Confirm all amounts and terms with the actual seller and lender.";

function NumberField({ label, name, value, onChange, max = 10000000 }: {
  label: string; name: keyof Form; value: string;
  onChange: (key: keyof Form, value: string) => void; max?: number;
}) {
  const number = Number(value);
  const invalid = value.trim() === "" || !Number.isFinite(number) || number < 0 || number > max;
  return (
    <label className="sales-field buying-number-field">
      <span>{label}</span>
      <span className="buying-input-shell">
        <input type="number" inputMode="decimal" min="0" max={max} step="0.01"
          aria-label={label} aria-invalid={invalid || undefined} value={value}
          onChange={e => onChange(name, e.target.value)} />
        <span className="buying-input-unit" aria-hidden="true">{name === "apr" || name === "tax" ? "%" : "CAD"}</span>
      </span>
    </label>
  );
}
function FieldGroup({ number, title, note, children }: {
  number: string; title: string; note?: string; children: ReactNode;
}) {
  return (
    <fieldset className="buying-fieldset">
      <legend><span aria-hidden="true">{number}</span>{title}</legend>
      {note && <p className="buying-group-note">{note}</p>}
      <div className="sales-form-grid">{children}</div>
    </fieldset>
  );
}

export default function Buying() {
  const [params, setParams] = useSearchParams();
  const vehicle = vehicles.find(v => v.id === params.get("vehicle")) || vehicles[0];
  const tab = tabs.some(t => t.id === params.get("tab")) ? params.get("tab")! : "payment";
  const [form, setForm] = useState<Form>(() => defaults(vehicle.price));
  const [tradeCar, setTradeCar] = useState("");
  const [tradeNotes, setTradeNotes] = useState("");
  const [tradeCondition, setTradeCondition] = useState("To be inspected");
  useEffect(() => { setForm(f => ({ ...f, price: String(vehicle.price) })); }, [vehicle.id, vehicle.price]);
  const change = (name: keyof Form, value: string) => setForm(f => ({ ...f, [name]: value }));
  const query = (key: string, value: string) => {
    const next = new URLSearchParams(window.location.search);
    next.set(key, value);
    setParams(next, { replace: true });
  };
  let error = "", result: ReturnType<typeof calculatePayment> | null = null;
  const input = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v)])) as unknown as PaymentInputs;
  try {
    if (Object.values(form).some(v => v.trim() === "") || Object.values(input).some(v => v > 10000000)) {
      throw new Error("Complete all amounts with valid, non-negative numbers.");
    }
    result = calculatePayment(input);
  } catch (e) { error = e instanceof Error ? e.message : "Check your amounts."; }
  const total = result ? tab === "cash" ? result.purchaseTotal : result.monthly : null;
  const principalShare = result && result.loanTotal > 0 ? Math.min(100, Math.max(0, result.principal / result.loanTotal * 100)) : 0;
  const breakdown = result ? [
    ["Entered vehicle price", input.price],
    ["Estimated tax & fees", result.taxAmount + input.fees],
    ...(tab === "cash" ? [["Illustrative purchase total", result.purchaseTotal]] : [
      ["Down payment", input.down], ["Net trade equity", result.equity],
      ["Amount financed", result.principal], ["Total loan payments", result.loanTotal],
      ["Total loan interest", result.interest],
    ]),
  ] as [string, number][] : [];
  const download = () => {
    if (!result) return;
    saveText("vehiclesite-payment-scenario.txt", [
      "VEHICLESITE / PERSONAL PAYMENT SCENARIO", "DEMO — NOT AN OFFER", "",
      `${vehicle.year} ${vehicle.name} (fictional listing)`,
      ...Object.entries(input).map(([k, v]) => `${k}: ${v}`), "",
      `Illustrative purchase total: ${money(result.purchaseTotal, 2)}`,
      `Illustrative amount financed: ${money(result.principal, 2)}`,
      `Illustrative monthly payment: ${money(result.monthly, 2)}`,
      `Total loan payments: ${money(result.loanTotal, 2)}`,
      `Total interest: ${money(result.interest, 2)}`,
      `Net trade equity: ${money(result.equity, 2)}`, "", assumptions,
    ].join("\n"));
  };
  const downloadTrade = () => {
    if (!result) return;
    saveText("vehiclesite-trade-in-notebook.txt", [
      "VEHICLESITE / TRADE-IN DISCUSSION DRAFT", "Not a valuation, appraisal, or offer.",
      `Car: ${tradeCar || "Not entered"}`, `Condition notes: ${tradeCondition}`,
      `Assumed value: ${form.trade} CAD`, `Amount owing: ${form.owing} CAD`,
      `Assumed equity: ${money(result.equity, 2)}`, `Questions: ${tradeNotes || "None entered"}`, "",
      "Ask the seller for an inspection and written appraisal. No information has been submitted.",
    ].join("\n"));
  };

  return (
    <div className="buying-page">
      <Intro number="02" label="Buying tools" title="The numbers." italic="On your terms."
        copy="A little more clarity. A lot less guesswork. Explore the numbers, prepare your trade-in, and plan your next move—all in one considered space." />
      <section className="container sales-buying">
        <div className="buying-intro-rail" aria-label="About these tools">
          <span><SlidersHorizontal size={15} />Your inputs. Your scenario.</span>
          <span><Check size={15} />No credit application</span>
          <span><Download size={15} />Keep a copy of your plan</span>
        </div>
        <DemoNote>Fictional cars and illustrative CAD amounts. These tools run locally; nothing is submitted to a seller or lender.</DemoNote>
        <div className="sales-tabs buying-tabs" role="tablist" aria-label="Buying tools">
          {tabs.map(({ id, label, description, Icon }, i) => (
            <button key={id} id={`buy-tab-${id}`} role="tab" aria-label={label}
              aria-selected={tab === id} aria-controls={`buy-panel-${id}`} tabIndex={tab === id ? 0 : -1}
              onClick={() => query("tab", id)}
              onKeyDown={e => {
                const n = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i + tabs.length - 1) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
                if (n >= 0) { e.preventDefault(); query("tab", tabs[n].id); document.getElementById(`buy-tab-${tabs[n].id}`)?.focus(); }
              }}>
              <span className="buying-tab-icon"><Icon size={22} /></span>
              <span className="buying-tab-copy"><strong>{label}</strong><small>{description}</small></span>
              <span className="buying-tab-number" aria-hidden="true">0{i + 1}</span>
            </button>
          ))}
        </div>

        <div className="sales-buy-grid">
          <div className="buying-workspace">
            <div className="buying-car-selector">
              <div className="buying-car-selection-copy">
                <span className="micro">THE CAR IN YOUR SCENARIO</span>
                <label className="sales-field">Start with a sample car
                  <select value={vehicle.id} onChange={e => query("vehicle", e.target.value)}>
                    {vehicles.map(v => <option value={v.id} key={v.id}>{v.year} {v.name} · {money(v.price)}</option>)}
                  </select>
                </label>
                <span className="buying-car-caption">{vehicle.condition} · {vehicle.power} · {vehicle.stockNumber}</span>
              </div>
              <div className="buying-car-selection-visual"><MediaSlot key={vehicle.id} vehicle={vehicle} /></div>
            </div>
            {tabs.map(({ id }) => (
              <div key={id} role="tabpanel" id={`buy-panel-${id}`} aria-labelledby={`buy-tab-${id}`}
                tabIndex={0} hidden={tab !== id} className="sales-tool-panel buying-tool-panel">
                {tab === id && <>
                  {tab === "payment" && <>
                    <div className="buying-tool-intro"><Eyebrow>Payment studio</Eyebrow><h2>A clearer view of<br /><em>your monthly picture.</em></h2><p>Adjust the details below. Your illustrative estimate updates as you go.</p></div>
                    <a className="buying-mobile-estimate" href="#buying-summary"><span>Current monthly estimate<strong>{total === null ? "—" : money(total, 2)}</strong></span><span>View breakdown<ArrowRight size={15} /></span></a>
                    <FieldGroup number="01" title="Your starting point" note="Set the purchase price and the cash you plan to put down.">
                      <NumberField label="Vehicle price (CAD)" name="price" value={form.price} onChange={change} />
                      <NumberField label="Down payment (CAD)" name="down" value={form.down} onChange={change} />
                    </FieldGroup>
                    <FieldGroup number="02" title="Bring a trade-in" note="Enter your own assumptions, or leave both amounts at zero.">
                      <NumberField label="Assumed trade-in value (CAD)" name="trade" value={form.trade} onChange={change} />
                      <NumberField label="Amount owing on trade-in (CAD)" name="owing" value={form.owing} onChange={change} />
                    </FieldGroup>
                    <FieldGroup number="03" title="Shape the loan" note="These are example inputs, not a lender's offer or approval.">
                      <NumberField label="APR (%) — illustrative" name="apr" value={form.apr} onChange={change} max={100} />
                      <label className="sales-field">Loan term<select value={form.months} onChange={e => change("months", e.target.value)}>{[24, 36, 48, 60, 72, 84].map(n => <option key={n} value={n}>{n} months</option>)}</select></label>
                      <NumberField label="Estimated fees (CAD)" name="fees" value={form.fees} onChange={change} />
                      <NumberField label="Tax rate (%) — enter your own" name="tax" value={form.tax} onChange={change} max={100} />
                    </FieldGroup>
                    <div className="buying-input-note"><Info size={17} /><p>The starting 6.9% APR is an invented example, not an available rate. Tax starts at 0% because no jurisdiction is configured. Enter your own estimate; regional tax rules are not modeled.</p></div>
                    <div className="buying-reset-row"><span>Explore without making a commitment.</span><button className="text-link" onClick={() => setForm(defaults(vehicle.price))}><RotateCcw size={14} />Reset this scenario</button></div>
                  </>}
                  {tab === "trade" && <>
                    <div className="buying-tool-intro"><Eyebrow>Your trade-in notebook</Eyebrow><h2>Your current car.<br /><em>Part of the picture.</em></h2><p>Prepare a better conversation. Record your assumptions and questions for a real appraisal—without a made-up instant valuation.</p></div>
                    <div className="buying-equity-card sales-equity" data-equity={result && result.equity < 0 ? "negative" : "positive"}>
                      <div><span className="micro">YOUR ASSUMED NET EQUITY</span><strong>{result ? money(result.equity) : "—"}</strong><small>Trade value minus amount owing · CAD</small></div>
                      <CarFront size={38} aria-hidden="true" />
                      <p>{result && result.equity < 0 ? "Your assumed balance is higher than your assumed trade value. This example adds the difference to the amount financed; a lender may not permit that." : "An illustration using your inputs, not an appraisal or guaranteed credit. A real seller must inspect and value your car."}</p>
                    </div>
                    <FieldGroup number="01" title="The car you're bringing">
                      <label className="sales-field buying-span-two">Your trade-in (optional)<input value={tradeCar} maxLength={100} placeholder="Year, make, model — no VIN or personal details" onChange={e => setTradeCar(e.target.value)} /></label>
                      <NumberField label="Your assumed trade-in value (CAD)" name="trade" value={form.trade} onChange={change} />
                      <NumberField label="Amount still owing (CAD)" name="owing" value={form.owing} onChange={change} />
                    </FieldGroup>
                    <FieldGroup number="02" title="Make a few useful notes">
                      <label className="sales-field buying-span-two">Your condition notes<select value={tradeCondition} onChange={e => setTradeCondition(e.target.value)}><option>To be inspected</option><option>Minor cosmetic wear to discuss</option><option>Repairs or damage to discuss</option><option>Service history to review</option></select></label>
                      <label className="sales-field buying-span-two">Questions for the appraiser<textarea rows={4} maxLength={800} value={tradeNotes} placeholder="Mileage, service records, tires, repairs, extra keys… Avoid personal or financial account details." onChange={e => setTradeNotes(e.target.value)} /></label>
                    </FieldGroup>
                    <div className="buying-notebook-footer"><span><FileText size={17} />Your notes stay on this page until you download them.</span><button className="button button-gold" disabled={!result} onClick={downloadTrade}><Download size={16} />Download my trade-in notes</button></div>
                    <Link className="text-link" to="/documents/purchase-options">Trade-in preparation template<ArrowUpRight size={15} /></Link>
                  </>}
                  {tab === "cash" && <>
                    <div className="buying-tool-intro"><Eyebrow>From first look to first drive</Eyebrow><h2>A clear path.<br /><em>No skipped details.</em></h2><p>Keep the important questions in view. The sample purchase total is a starting point—not a written dealer quote.</p></div>
                    <div className="buying-cash-banner"><Wallet size={25} /><div><strong>See the complete purchase picture.</strong><p>Vehicle price + your estimated tax + your estimated fees. No loan interest is included in this total.</p></div></div>
                    <div className="sales-ownership-steps buying-ownership-steps">
                      {[
                        ["01", "Find your fit", "Shortlist cars and compare the details you use every day.", "Start with the inventory"],
                        ["02", "See the actual car", "Arrange a test drive and ask about history, condition, and inspection records.", "Make space for your questions"],
                        ["03", "Get the written picture", "Ask for an itemized price, a written trade-in appraisal, and applicable terms.", "Review the actual documents"],
                        ["04", "Prepare for the handover", "Agree a pickup date and confirm the required documents and payment arrangements.", "Confirm everything with the seller"],
                      ].map(([number, title, text, note]) => <div key={number}><span>{number}</span><div><small>{note}</small><h3>{title}</h3><p>{text}</p></div><ArrowRight size={15} aria-hidden="true" /></div>)}
                    </div>
                    <div className="buying-cash-actions"><Link className="button button-gold" to="/documents/purchase-options">Explore purchase documents<ArrowUpRight size={16} /></Link><button className="text-link" onClick={() => query("tab", "payment")}>Adjust the price, tax, and fee assumptions<ArrowUpRight size={15} /></button></div>
                  </>}
                </>}
              </div>
            ))}
          </div>

          <aside id="buying-summary" className="sales-payment-summary buying-summary" aria-label="Payment scenario summary">
            <div className="buying-summary-top"><span className="micro">YOUR SCENARIO</span><span className="buying-live-badge"><span />Illustrative · CAD</span></div>
            <div className="buying-summary-title"><h2>{vehicle.name}</h2><span>{vehicle.year} · {vehicle.condition}</span></div>
            <div className="buying-result-block">
              <span className="micro">{tab === "cash" ? "ILLUSTRATIVE PURCHASE TOTAL" : "ILLUSTRATIVE MONTHLY PAYMENT"}</span>
              <output className="sales-monthly" aria-label={tab === "cash" ? "Estimated purchase total" : "Estimated monthly payment"}>
                <span>{total === null ? "—" : money(total, 2)}</span>
                <small>{tab === "cash" ? "CAD · before trade / down payment" : `CAD / month · ${form.months || "—"} months`}</small>
              </output>
              {tab !== "cash" && <div className="buying-loan-chips"><span><strong>{form.apr || "—"}%</strong> entered APR</span><span><strong>{form.months || "—"}</strong> monthly payments</span></div>}
              <span className="buying-result-caption">An estimate to explore. Not a quote or approval.</span>
            </div>
            {error ? <div className="buying-error"><Info size={18} /><p className="form-error" role="alert">{error}</p></div> : result && <>
              <div className="buying-breakdown-heading"><h3>{tab === "cash" ? "The purchase breakdown" : "Every amount, accounted for."}</h3><SlidersHorizontal size={16} /></div>
              <dl className="sales-breakdown">{breakdown.map(([label, value]) => <div key={label} className={label === "Amount financed" || label === "Illustrative purchase total" ? "buying-breakdown-total" : ""}><dt>{label}</dt><dd>{money(value, 2)}</dd></div>)}</dl>
              {tab !== "cash" && <figure className="buying-loan-composition"><figcaption>Inside your total loan payments</figcaption><div className="buying-composition-bar" aria-hidden="true"><span style={{ width: `${principalShare}%` }} /><span style={{ width: `${result.loanTotal > 0 ? 100 - principalShare : 0}%` }} /></div><div className="buying-composition-legend"><span><i />Principal <strong>{principalShare.toFixed(1)}%</strong></span><span><i />Interest <strong>{(result.loanTotal > 0 ? 100 - principalShare : 0).toFixed(1)}%</strong></span></div></figure>}
              {result.excess > 0 && <div className="buying-input-note"><Info size={17} /><p>Your down payment and equity exceed this purchase total by {money(result.excess, 2)}. Reduce an assumption; no refund is promised.</p></div>}
            </>}
            <div className="buying-summary-actions"><button className="button button-gold" disabled={!result} onClick={download}><Download size={16} />Save this scenario</button>{vehicle.stock === "Available" ? <Link className="button button-subtle" to={`/pickup?vehicle=${vehicle.id}&purpose=test-drive`}>Explore a visit draft<ArrowUpRight size={16} /></Link> : <Link className="button button-subtle" to="/inventory?available=1">Browse available examples<ArrowUpRight size={16} /></Link>}</div>
            <details className="buying-assumptions"><summary><Info size={14} />Calculation assumptions<ChevronDown size={15} /></summary><p>{assumptions}</p></details>
            <span className="sales-private"><Check size={14} />No credit check. Nothing submitted.</span>
          </aside>
        </div>
        <section className="buying-next-steps" aria-labelledby="buying-next-heading">
          <div className="buying-next-copy"><Eyebrow>Keep the next step simple</Eyebrow><h2 id="buying-next-heading">From the numbers<br /><em>to the keys.</em></h2><p>Your scenario is a starting point. Keep the paperwork and your first visit close at hand.</p></div>
          <Link className="buying-next-card" to="/documents/purchase-options"><FileText size={25} /><span className="micro">THE PAPERWORK</span><h3>A little more clarity.</h3><p>Explore purchase worksheets and build your own buyer packet.</p><span className="text-link">Open the library<ArrowUpRight size={16} /></span></Link>
          <Link className="buying-next-card" to={`/pickup?vehicle=${vehicle.id}&purpose=test-drive`}><CalendarDays size={25} /><span className="micro">THE FIRST DRIVE</span><h3>Picture the moment.</h3><p>Prepare a personal visit draft to confirm with the seller.</p><span className="text-link">Explore visit planning<ArrowUpRight size={16} /></span></Link>
        </section>
      </section>
    </div>
  );
}
