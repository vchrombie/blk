import { Link } from "react-router-dom";

export default function Header({ crumbs }) {
  const handleCopyLink = (event) => {
    event.preventDefault();
    const currentUrl = window.location.href;

    navigator.clipboard.writeText(currentUrl).then(() => {
      const linkElement = document.getElementById("shareLink");
      if (linkElement && window.bootstrap) {
        const tooltip =
          window.bootstrap.Tooltip.getInstance(linkElement) ||
          new window.bootstrap.Tooltip(linkElement);

        const originalTitle =
          linkElement.getAttribute("data-bs-original-title") || "copy link";
        tooltip.hide();

        // Show "Link copied!" feedback
        linkElement.setAttribute("data-bs-title", "Link copied!");
        tooltip.setContent({ ".tooltip-inner": "Link copied!" });
        tooltip.show();

        // Reset tooltip after 1.5 seconds
        setTimeout(() => {
          tooltip.hide();
          linkElement.setAttribute("data-bs-title", originalTitle);
          tooltip.setContent({ ".tooltip-inner": originalTitle });
        }, 1500);
      }
    });
  };

  return (
    <header className="header bg-black p-2 mb-4 fs-2 text-white fw-semibold d-flex align-items-center">
      <div className="ms-4">
        {crumbs.map((c, i) => (
          <span key={c.to}>
            {i > 0 && " / "}
            <Link className="header-link text-white mx-2" to={c.to}>
              {c.label}
            </Link>
          </span>
        ))}
      </div>

      <div className="ms-auto d-flex align-items-center me-4">
        <a
          href="#"
          id="shareLink"
          onClick={handleCopyLink} // Added onClick handler
          className="me-3 text-white"
          title="copy link"
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          data-bs-title="copy link" // Initial tooltip message
          data-bs-original-title="copy link" // Used for resetting the message
        >
          <i className="bi bi-link-45deg fs-4"></i>
        </a>
        <a
          href="https://github.com/vchrombie/blk/blob/master/README.md"
          target="_blank"
          rel="noreferrer"
          className="me-3 text-white"
          title="readme.md"
        >
          <i className="bi bi-info-circle fs-4"></i>
        </a>
        <a
          href="https://github.com/vchrombie/blk"
          target="_blank"
          rel="noreferrer"
          className="me-3 text-white"
          title="github"
        >
          <i className="bi bi-github fs-4"></i>
        </a>
      </div>
    </header>
  );
}
