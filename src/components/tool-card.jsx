import React from "react";
import { Link } from "react-router-dom";

export default function ToolCard({ to, title, desc }) {
  return (
    <Link className="card" to={to}>
      <strong>{title}</strong>
      <div>{desc}</div>
    </Link>
  );
}
