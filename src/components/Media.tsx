import { publicAsset } from "../lib";
import { useId, useState, type CSSProperties } from "react";
import type { Vehicle } from "../data";
import { Maximize2 } from "lucide-react";

/** Original vector silhouettes stand in for actual vehicle photography. */
export function CarArtwork({ kind = "coupe" }: { kind?: Vehicle["kind"] }) {
  const id = useId().replace(/:/g, "");
  const roof =
    kind === "suv" || kind === "van"
      ? "M83 239 L99 151 Q110 138 159 135 L207 77 Q217 62 257 60 L607 61 Q641 60 673 96 L746 159 Q802 166 830 189 L850 243 L834 266 L790 273 Q783 204 737 204 Q677 206 676 273 L302 273 Q302 205 243 205 Q183 207 180 273 L110 264 Z"
      : kind === "sedan"
        ? "M79 244 L107 188 L192 169 L290 104 Q314 91 360 91 L541 92 Q576 91 611 112 L699 164 L805 181 Q832 190 850 244 L831 266 L790 274 Q783 204 737 204 Q677 206 676 274 L302 274 Q302 205 243 205 Q183 207 180 274 L104 264 Z"
        : "M77 244 L104 200 L183 181 L330 115 Q361 102 404 102 L529 107 Q561 109 595 129 L674 171 L797 187 Q837 194 856 239 L837 265 L790 274 Q783 204 737 204 Q677 206 676 274 L302 274 Q302 205 243 205 Q183 207 180 274 L103 264 Z";
  const glass =
    kind === "suv" || kind === "van"
      ? "M197 141 L242 82 L600 82 Q626 82 651 109 L694 151 Z"
      : kind === "sedan"
        ? "M241 168 L310 118 Q326 109 360 109 L540 110 Q562 110 590 130 L641 163 Z"
        : "M259 170 L343 129 Q365 118 402 120 L520 123 Q541 123 575 143 L620 167 Z";
  return (
    <svg
      className={`car-art car-art--${kind}`}
      viewBox="0 0 920 380"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}body`}
          x1="450"
          y1="70"
          x2="475"
          y2="290"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--vehicle-accent, #c8ad82)" stopOpacity=".48" />
          <stop offset=".34" stopColor="#353936" />
          <stop offset=".6" stopColor="#111513" />
          <stop offset="1" stopColor="#050807" />
        </linearGradient>
        <linearGradient
          id={`${id}edge`}
          x1="90"
          y1="160"
          x2="850"
          y2="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--vehicle-accent, #c8ad82)" stopOpacity=".2" />
          <stop offset=".55" stopColor="#e0e4db" stopOpacity=".8" />
          <stop
            offset="1"
            stopColor="var(--vehicle-accent, #c8ad82)"
            stopOpacity=".4"
          />
        </linearGradient>
        <radialGradient id={`${id}wheel`}>
          <stop stopColor="#626761" />
          <stop offset=".55" stopColor="#242a26" />
          <stop offset=".75" stopColor="#0a0c0b" />
          <stop offset="1" stopColor="#030504" />
        </radialGradient>
        <filter id={`${id}shadow`}>
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <ellipse
        cx="468"
        cy="319"
        rx="361"
        ry="17"
        fill="#000"
        opacity=".8"
        filter={`url(#${id}shadow)`}
      />
      <path
        d={roof}
        fill={`url(#${id}body)`}
        stroke={`url(#${id}edge)`}
        strokeWidth="1.8"
      />
      <path
        d={glass}
        fill="#0b1311"
        stroke={`url(#${id}edge)`}
        strokeWidth="1.5"
      />
      <path
        d={
          kind === "suv" || kind === "van"
            ? "M401 82 L407 146 M558 82 L572 149"
            : "M437 120 L467 165"
        }
        stroke="#70796c"
        strokeOpacity=".6"
        strokeWidth="4"
      />
      <path
        d="M113 207 Q426 181 810 204 M314 257 L660 257 M504 179 L499 250 M510 188 L536 188"
        stroke={`url(#${id}edge)`}
        strokeWidth="1.4"
      />
      <path d="M777 198 L830 209 L836 216 L781 210" fill="#ede9cf" />
      <path d="M107 203 L145 202 L138 210 L101 214" fill="#a6724b" />
      <path
        d="M104 249 L162 254 M814 245 L842 242"
        stroke="#89928a"
        strokeWidth="3"
      />
      {[243, 737].map((x) => (
        <g key={x}>
          <circle
            cx={x}
            cy="267"
            r="60"
            fill={`url(#${id}wheel)`}
            stroke="#424b43"
            strokeWidth="2"
          />
          <circle
            cx={x}
            cy="267"
            r="44"
            fill="#121814"
            stroke="#92978a"
            strokeWidth="1.5"
          />
          {Array.from({ length: 10 }, (_, i) => (
            <path
              key={i}
              d={`M${x - 3} 259 L${x - 7} 225 L${x + 5} 225 L${x + 4} 257`}
              transform={`rotate(${i * 36} ${x} 267)`}
              fill="#7d8277"
              opacity=".75"
            />
          ))}
          <circle cx={x} cy="267" r="12" fill="#2c342c" stroke="#979e90" />
          <circle cx={x} cy="267" r="4" fill="var(--vehicle-accent, #c8ad82)" />
        </g>
      ))}
    </svg>
  );
}

export function MediaSlot({
  vehicle,
  kind = "vehicle",
  label = "IMAGE PLACEHOLDER",
  className = "",
  src = "",
  children,
}: {
  vehicle?: Vehicle;
  kind?: string;
  label?: string;
  className?: string;
  src?: string;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const source = src || vehicle?.image;
  const conceptLabel = vehicle ? "AI-GENERATED VEHICLE CONCEPT" : label;
  return (
    <div
      className={`media-slot media-${kind} ${className}`}
      style={
        { "--vehicle-accent": vehicle?.color ?? "#c8ad82" } as CSSProperties
      }
    >
      {source && !failed ? (
        <>
          <img
            src={publicAsset(source)}
            alt={vehicle ? `AI-generated concept image of fictional ${vehicle.name}, a ${vehicle.category.toLowerCase()}.` : label}
            loading={className.includes("hero-media") ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailed(true)}
          />
          <span className="media-concept-tag" aria-hidden="true"><span className="tiny-square" />{conceptLabel}</span>
        </>
      ) : (
        <>
          <div className="scene-grid" aria-hidden="true" />
          <div className="scene-halo" aria-hidden="true" />
          {kind === "vehicle" ? (
            <CarArtwork kind={vehicle?.kind} />
          ) : (
            <div className={`scene scene-${kind}`} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          )}
          <span className="media-caption">
            <span className="tiny-square" />
            {label}
          </span>
          <span className="media-corner" aria-hidden="true">
            <Maximize2 size={13} />
          </span>
        </>
      )}
      {children}
    </div>
  );
}
