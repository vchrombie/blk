import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TOOLS } from "./tools.js";
import Header from "./components/header.jsx";
import Home from "./pages/home.jsx";
import Entity from "./pages/entity.jsx";
import Overdue from "./pages/overdue.jsx";
import Samsh from "./pages/samsh.jsx";
import Placeholder from "./pages/placeholder.jsx";

export default function App() {
  const { pathname } = useLocation();
  const tool = TOOLS.find((t) => t.path === pathname);

  const crumbs = tool
    ? [
        { label: "blk", to: "/" },
        { label: tool.key, to: tool.path },
      ]
    : [{ label: "blk", to: "/" }];

  return (
    <div>
      <Header crumbs={crumbs} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/entity" element={<Entity />} />
          <Route path="/overdue" element={<Overdue />} />
          <Route path="/samsh" element={<Samsh />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
