import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Plus,
  Check,
  ArrowRight,
  Users,
  Briefcase,
  X,
} from "lucide-react";
import type { Vehicle } from "../data";
import { MediaSlot } from "./Media";
import { useSite } from "../SiteContext";

export function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <div className={`eyebrow ${light ? "eyebrow-light" : ""}`}>
      <span />
      {children}
    </div>
  );
}
export function Intro({
  number,
  label,
  title,
  italic,
  copy,
}: {
  number: string;
  label: string;
  title: string;
  italic: string;
  copy: string;
}) {
  return (
    <section className="page-intro container">
      <div className="intro-top">
        <Eyebrow>
          {number} / {label}
        </Eyebrow>
        <span className="micro">VEHICLESITE — CONCEPT EDITION</span>
      </div>
      <div className="intro-main">
        <h1>
          {title}
          <br />
          <em>{italic}</em>
        </h1>
        <p>{copy}</p>
      </div>
    </section>
  );
}
export function SectionHeading({
  label,
  title,
  italic,
  to,
  link,
}: {
  label: string;
  title: string;
  italic?: string;
  to?: string;
  link?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <Eyebrow>{label}</Eyebrow>
        <h2>
          {title} {italic && <em>{italic}</em>}
        </h2>
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {link ?? "Explore"}
          <ArrowUpRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function VehicleCard({
  vehicle,
  index = 0,
}: {
  vehicle: Vehicle;
  index?: number;
}) {
  const { saved, toggleSaved, comparison, toggleComparison, setModal } =
    useSite();
  const favorite = saved.includes(vehicle.id),
    compared = comparison.includes(vehicle.id);
  return (
    <article
      className="vehicle-card reveal"
      style={{ "--delay": `${(index % 3) * 75}ms` } as React.CSSProperties}
    >
      <div className="vehicle-image">
        <button
          className="vehicle-visual-button"
          aria-label={`View ${vehicle.name}`}
          onClick={() => setModal({ type: "vehicle", vehicle })}
        >
          <MediaSlot vehicle={vehicle} />
        </button>
        <span className="vehicle-type">{vehicle.category}</span>
        <button
          className={`icon-button save-button ${favorite ? "is-saved" : ""}`}
          aria-label={`${favorite ? "Unsave" : "Save"} ${vehicle.name}`}
          aria-pressed={favorite}
          onClick={() => toggleSaved(vehicle.id)}
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="vehicle-copy">
        <div className="vehicle-copy-top">
          <p className="micro">{vehicle.mood}</p>
          <span className="micro muted">
            CONCEPT {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <button
          className="vehicle-title"
          onClick={() => setModal({ type: "vehicle", vehicle })}
        >
          <h3>{vehicle.name}</h3>
          <ArrowUpRight size={20} />
        </button>
        <div className="vehicle-specs">
          <span>
            <Users size={13} />
            {vehicle.seats} guests
          </span>
          <span>
            <Briefcase size={13} />
            {vehicle.bags} bags
          </span>
          <span>{vehicle.transmission}</span>
        </div>
        <div className="vehicle-bottom">
          <span>
            Quote on request <small>Placeholder</small>
          </span>
          <button
            className={`compare-button ${compared ? "active" : ""}`}
            onClick={() => toggleComparison(vehicle.id)}
            aria-pressed={compared}
            aria-label={`${compared ? "Remove" : "Add"} ${vehicle.name} ${compared ? "from" : "to"} comparison`}
          >
            {compared ? <Check size={14} /> : <Plus size={14} />}Compare
          </button>
        </div>
      </div>
    </article>
  );
}
export function JourneyCTA() {
  return (
    <section className="journey-cta container reveal">
      <div>
        <Eyebrow>Your next chapter</Eyebrow>
        <h2>
          Where will we
          <br />
          <em>take you next?</em>
        </h2>
      </div>
      <div>
        <p>
          A considered journey starts with a conversation.
          <br />
          Shape yours with the interactive brief builder.
        </p>
        <Link to="/concierge" className="button button-gold">
          Design your journey
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="cta-orbit" aria-hidden="true" />
    </section>
  );
}
export function Dialog({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-inner">
        <div className="dialog-header">
          <span className="micro">{title}</span>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function BackLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="text-link back-link" to={to}>
      <ArrowRight size={16} style={{ transform: "rotate(180deg)" }} />
      {children}
    </Link>
  );
}
