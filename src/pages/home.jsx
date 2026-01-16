import React from "react";
import { TOOLS } from "../tools.js";
import ToolCard from "../components/tool-card.jsx";

export default function Home() {
  return (
    <div className="container-fluid mt-3 pb-5 col-md-12">
      {/* make tools text larger */}
      <h2 className="text-center fs-1">tools</h2>
      <div className="tools-grid mt-4 fs-4 gap-4">
        {TOOLS.map((t) => (
          <ToolCard key={t.key} to={t.path} title={t.title} desc={t.desc} />
        ))}
      </div>
    </div>
  );
}
