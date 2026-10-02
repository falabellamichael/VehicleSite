import { publicAsset } from "../lib";
import { useEffect, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  Search,
  ArrowUpRight,
  ArrowLeft,
  Download,
  FileText,
  Shield,
  CarFront,
  KeyRound,
  Eye,
  X,
  FolderOpen,
} from "lucide-react";
import { documentGroups, type DocumentGroup } from "../data";
import { Intro, Eyebrow, Dialog } from "../components/UI";
type Doc = DocumentGroup["docs"][number];
const icons = { car: CarFront, key: KeyRound, shield: Shield, file: FileText };
function DocPreview({ doc, close }: { doc: Doc; close: () => void }) {
  const [text, setText] = useState("Loading the placeholder document…");
  useEffect(() => {
    const abort = new AbortController();
    fetch(publicAsset(`/documents/${doc.id}.txt`), { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Unavailable");
        return r.text();
      })
      .then(setText)
      .catch((e) => {
        if (e.name !== "AbortError")
          setText(
            "This placeholder could not be loaded. Close the preview and try downloading the file directly.",
          );
      });
    return () => abort.abort();
  }, [doc.id]);
  return (
    <Dialog
      title="Document preview · Placeholder"
      onClose={close}
      className="document-modal"
    >
      <div className="document-preview-head">
        <span className="demo-badge">DRAFT / NOT FOR USE</span>
        <h2>{doc.title}</h2>
        <p>{doc.description}</p>
      </div>
      <pre className="document-text">{text}</pre>
      <a
        className="button button-gold"
        href={publicAsset(`/documents/${doc.id}.txt`)}
        download
      >
        <Download size={16} />
        Download placeholder (.txt)
      </a>
    </Dialog>
  );
}
function DocumentRow({
  doc,
  preview,
  group,
}: {
  doc: Doc;
  preview: (doc: Doc) => void;
  group?: DocumentGroup;
}) {
  return (
    <article className="document-row">
      <span className="document-icon">
        <FileText size={21} />
      </span>
      <div>
        <button className="document-name" onClick={() => preview(doc)}>
          {doc.title}
        </button>
        <p>{doc.description}</p>
        <span className="micro">
          {group ? `${group.name} · ` : ""}
          {doc.pages} / TXT PLACEHOLDER
        </span>
      </div>
      <div className="document-row-actions">
        <button
          className="icon-button"
          onClick={() => preview(doc)}
          aria-label={`Preview ${doc.title}`}
        >
          <Eye size={18} />
        </button>
        <a
          className="icon-button"
          href={publicAsset(`/documents/${doc.id}.txt`)}
          download
          aria-label={`Download ${doc.title} placeholder`}
        >
          <Download size={18} />
        </a>
      </div>
    </article>
  );
}
export default function Documents({ subpage = false }: { subpage?: boolean }) {
  const { group: slug } = useParams();
  const group = documentGroups.find((g) => g.id === slug);
  const [query, setQuery] = useState(""),
    [preview, setPreview] = useState<Doc | null>(null);
  useEffect(() => {
    setQuery("");
    setPreview(null);
  }, [slug]);
  const all = documentGroups.flatMap((g) =>
    g.docs.map((doc) => ({ doc, group: g })),
  );
  const filtered = (
    subpage && group ? all.filter((d) => d.group.id === group.id) : all
  ).filter(({ doc, group: g }) =>
    `${doc.title} ${doc.description} ${g.name}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  if (subpage && !group)
    return (
      <section className="container empty-state">
        <FolderOpen size={42} />
        <h1>This folder is still unwritten.</h1>
        <p>The requested document category does not exist.</p>
        <Link className="button button-gold" to="/documents">
          Return to Documents
          <ArrowLeft size={16} />
        </Link>
      </section>
    );
  return (
    <>
      <Intro
        number="04"
        label={group?.name ?? "The document library"}
        title={
          group
            ? group.name.split(" & ")[0] +
              (group.name.includes(" & ") ? " &" : ".")
            : "Everything you need."
        }
        italic={
          group
            ? group.name.split(" & ")[1]
              ? `${group.name.split(" & ")[1]}.`
              : "Considered in detail."
            : "Beautifully organized."
        }
        copy={
          group?.description ??
          "A thoughtful home for the details. Explore vehicle guides, compare your options, and find every essential in one curated document library."
        }
      />
      <section className="container documents-section">
        <div className="document-notice">
          <Shield size={19} />
          <p>
            <strong>These are placeholder documents.</strong> No policies,
            coverage, legal terms, or bookings are in effect. Replace every
            draft with reviewed, approved content before launch.
          </p>
          <span className="demo-badge">DEMO LIBRARY</span>
        </div>
        <div className={subpage ? "document-layout" : ""}>
          {subpage && (
            <aside className="document-sidebar">
              <Link to="/documents" className="text-link">
                <ArrowLeft size={15} />
                All documents
              </Link>
              <span className="micro">BROWSE THE LIBRARY</span>
              {documentGroups.map((g) => (
                <NavLink key={g.id} to={`/documents/${g.id}`}>
                  <span>{g.number}</span>
                  {g.name}
                  <ArrowUpRight size={14} />
                </NavLink>
              ))}
            </aside>
          )}
          <div>
            <div className="document-search-row">
              <label className="search-field">
                <Search size={18} />
                <input
                  placeholder={
                    group
                      ? `Search ${group.name.toLowerCase()}`
                      : "Find a guide, an option, a detail…"
                  }
                  aria-label="Search documents"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    aria-label="Clear document search"
                    onClick={() => setQuery("")}
                  >
                    <X size={15} />
                  </button>
                )}
              </label>
              <span className="micro" role="status">
                {String(filtered.length).padStart(2, "0")} DOCUMENTS
              </span>
            </div>
            {!subpage && !query.trim() ? (
              <>
                <div className="document-categories">
                  {documentGroups.map((g) => {
                    const Icon = icons[g.icon as keyof typeof icons];
                    return (
                      <Link
                        className="document-category reveal"
                        key={g.id}
                        to={`/documents/${g.id}`}
                      >
                        <div>
                          <Icon size={26} />
                          <span className="micro">FOLDER {g.number}</span>
                        </div>
                        <h2>{g.name}</h2>
                        <p>{g.description}</p>
                        <footer>
                          <span>
                            {String(g.docs.length).padStart(2, "0")} DOCUMENTS
                          </span>
                          <ArrowUpRight size={21} />
                        </footer>
                      </Link>
                    );
                  })}
                </div>
                <div className="document-featured">
                  <Eyebrow>A good place to start</Eyebrow>
                  <DocumentRow
                    doc={documentGroups[0].docs[0]}
                    preview={setPreview}
                  />
                  <DocumentRow
                    doc={documentGroups[1].docs[0]}
                    preview={setPreview}
                  />
                </div>
              </>
            ) : filtered.length ? (
              <div className="document-list">
                {filtered.map((item) => (
                  <DocumentRow
                    key={item.doc.id}
                    doc={item.doc}
                    group={!subpage ? item.group : undefined}
                    preview={setPreview}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Search size={32} />
                <h2>That detail is not here yet.</h2>
                <p>Try another search, or explore the document categories.</p>
                <button
                  className="button button-gold"
                  onClick={() => setQuery("")}
                >
                  Clear search
                </button>
              </div>
            )}
            {group?.id === "booking-options" && (
              <div className="options-comparison">
                <Eyebrow>At a glance / Sample framework</Eyebrow>
                <h2>
                  Different ways.
                  <br />
                  <em>The same intention.</em>
                </h2>
                <div className="options-table-wrap">
                  <table>
                    <caption className="sr-only">
                      Illustrative booking option comparison
                    </caption>
                    <thead>
                      <tr>
                        <th>Option</th>
                        <th>Your starting point</th>
                        <th>Designed around</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>Self-drive</th>
                        <td>You take the wheel</td>
                        <td>Independent journeys</td>
                      </tr>
                      <tr>
                        <th>Chauffeured</th>
                        <td>A driver-led experience</td>
                        <td>Considered arrivals</td>
                      </tr>
                      <tr>
                        <th>Extended</th>
                        <td>More time to explore</td>
                        <td>Multi-day itineraries</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Link className="text-link" to="/concierge">
                  Explore the journey builder
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      {preview && <DocPreview doc={preview} close={() => setPreview(null)} />}
    </>
  );
}
