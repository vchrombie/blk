import { Link } from "react-router-dom";

export default function Header({ crumbs }) {
  return (
    <header className="header bg-black p-3 mb-4 fs-4 text-white fw-semibold d-flex align-items-center">
      <div>
        {crumbs.map((c, i) => (
          <span key={c.to}>
            {i > 0 && " / "}
            <Link className="header-link text-white" to={c.to}>
              {c.label}
            </Link>
          </span>
        ))}
      </div>

      <div className="ms-auto d-flex align-items-center">
        <a
          href="#"
          className="me-3 text-white"
          data-bs-toggle="tooltip"
          title="copy link"
        >
          <i className="bi bi-link-45deg fs-4"></i>
        </a>
        <a
          href="https://github.com/vchrombie/blk/blob/master/README.md"
          target="_blank"
          className="me-3 text-white"
          title="readme.md"
        >
          <i className="bi bi-info-circle fs-4"></i>
        </a>
        <a
          href="https://github.com/vchrombie/blk"
          target="_blank"
          className="me-3 text-white"
          title="github"
        >
          <i className="bi bi-github fs-4"></i>
        </a>
      </div>
    </header>
  );
}
