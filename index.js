// blk/index.js

document.addEventListener("DOMContentLoaded", function () {
  // Copy current page URL to clipboard with Bootstrap tooltip (for #shareLink)
  const shareLink = document.getElementById("shareLink");
  if (shareLink && typeof bootstrap !== "undefined") {
    const tooltip = new bootstrap.Tooltip(shareLink, { trigger: "manual" });
    shareLink.addEventListener("click", async function (e) {
      e.preventDefault();
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
      } catch (err) {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      tooltip.show();
      setTimeout(() => tooltip.hide(), 2000);
    });
  }

  // Copy input field text to clipboard for elements with data-copy-target
  const copyButtons = document.querySelectorAll("[data-copy-target]");
  copyButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const targetId = btn.getAttribute("data-copy-target");
      const input = document.getElementById(targetId);
      if (input) {
        input.select();
        document.execCommand("copy");
      }
    });
  });
});

// Fallback global function for backward compatibility with inline onclick handlers
window.copyToClipboard = function (id) {
  const el = document.getElementById(id);
  if (el) {
    el.select();
    document.execCommand("copy");
  }
};
