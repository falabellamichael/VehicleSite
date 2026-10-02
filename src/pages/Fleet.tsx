import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Heart, X, CarFront } from "lucide-react";
import { vehicles, categories } from "../data";
import { Intro, VehicleCard, JourneyCTA } from "../components/UI";
import { useSite } from "../SiteContext";
export default function Fleet() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "All vehicles";
  const [query, setQuery] = useState(""),
    [sort, setSort] = useState("curated"),
    [onlySaved, setOnlySaved] = useState(false);
  const { saved } = useSite();
  const result = vehicles
    .filter(
      (v) =>
        (category === "All vehicles" || v.category === category) &&
        (!onlySaved || saved.includes(v.id)) &&
        `${v.name} ${v.category} ${v.power}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "seats"
          ? b.seats - a.seats
          : vehicles.indexOf(a) - vehicles.indexOf(b),
    );
  const reset = () => {
    setParams({});
    setQuery("");
    setSort("curated");
    setOnlySaved(false);
  };
  return (
    <>
      <Intro
        number="01"
        label="The collection"
        title="A vehicle for"
        italic="every version of you."
        copy="A carefully considered placeholder collection. Discover your next drive, compare the details, and save the vehicles that speak to you."
      />
      <section className="container fleet-section">
        <div className="fleet-toolbar">
          <label className="search-field">
            <Search size={18} />
            <input
              aria-label="Search vehicles"
              placeholder="Search the collection"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                aria-label="Clear vehicle search"
                onClick={() => setQuery("")}
              >
                <X size={15} />
              </button>
            )}
          </label>
          <div className="toolbar-right">
            <button
              className={`button button-subtle ${onlySaved ? "selected" : ""}`}
              aria-pressed={onlySaved}
              onClick={() => setOnlySaved(!onlySaved)}
            >
              <Heart size={15} fill={onlySaved ? "currentColor" : "none"} />
              Saved <span>{saved.length}</span>
            </button>
            <label className="sort-label">
              Sort by
              <select
                aria-label="Sort vehicles"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="curated">Curated order</option>
                <option value="name">Name A–Z</option>
                <option value="seats">Guest capacity</option>
              </select>
            </label>
          </div>
        </div>
        <div className="filter-chips" aria-label="Vehicle categories">
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "active" : ""}
              aria-pressed={category === c}
              onClick={() =>
                setParams(c === "All vehicles" ? {} : { category: c })
              }
            >
              {c}
              {c === "All vehicles" && <span>06</span>}
            </button>
          ))}
        </div>
        <div className="results-summary">
          <span role="status">
            {String(result.length).padStart(2, "0")}{" "}
            {result.length === 1 ? "vehicle" : "vehicles"} to discover
          </span>
          <span className="micro">
            FICTIONAL COLLECTION · ILLUSTRATIVE SPECS
          </span>
        </div>
        {result.length ? (
          <div className="vehicle-grid">
            {result.map((v) => (
              <VehicleCard key={v.id} vehicle={v} index={vehicles.indexOf(v)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <CarFront size={38} />
            <h2>A different road awaits.</h2>
            <p>
              No vehicles match this selection. Try another category or clear
              the filters.
            </p>
            <button className="button button-gold" onClick={reset}>
              Reset all filters
            </button>
          </div>
        )}
        <p className="disclaimer">
          All vehicle names, features, and capacities are sample content.
          Photography, videos, live availability, and pricing will be added
          before launch.
        </p>
      </section>
      <JourneyCTA />
    </>
  );
}
