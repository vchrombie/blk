import React from "react";
import { TOOLS } from "../tools.js";
import ToolCard from "../components/tool-card.jsx";

export default function Home() {
  return (
    <div className="container-fluid mt-3 pb-5 col-md-10">
      <h2 className="text-center">tools</h2>
      <div className="grid mt-4">
        {TOOLS.map((t) => (
          <ToolCard key={t.key} to={t.path} title={t.title} desc={t.desc} />
        ))}
      </div>
    </div>
  );
}
