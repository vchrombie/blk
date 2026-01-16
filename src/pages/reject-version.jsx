import React, { useState } from "react";

const BASE_URL =
  "https://webster.bfm.com/weblications/smog/rejectVersion.epl";

function buildUrl(name, version, reason) {
  const url = new URL(BASE_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("version", version);
  url.searchParams.set("reason", reason);
  return url.toString();
}

export default function RejectVersion() {
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [reason, setReason] = useState("");

  const clear = () => {
    setName("");
    setVersion("");
    setReason("");
  };

  const submit = (e) => {
    e.preventDefault();
    const url = buildUrl(name.trim(), version.trim(), reason.trim());
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="container-fluid mt-3">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label fw-semibold fs-4">appserver</label>
              <input
                className="form-control"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold fs-4">version</label>
              <input
                className="form-control"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold fs-4">reason</label>
              <input
                className="form-control"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                type="button"
                onClick={clear}
              >
                clear
              </button>
              <button className="btn btn-sm btn-primary" type="submit">
                submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
