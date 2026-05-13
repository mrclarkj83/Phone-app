async function loadDragonMath() {
  try {
    const response = await fetch(new URL("app.bundle.gz.b64", import.meta.url), {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Could not load app bundle.");
    if (!("DecompressionStream" in globalThis)) {
      throw new Error("This browser needs a current Chrome, Edge, Firefox, or Safari version.");
    }
    const base64 = (await response.text()).replace(/\s/g, "");
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    const code = await new Response(stream).text();
    await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`);
  } catch (error) {
    console.error(error);
    const banner = document.querySelector(".status-banner");
    if (banner) {
      banner.textContent = error.message || "DragonMath could not start.";
      banner.dataset.tone = "danger";
    }
  }
}

loadDragonMath();
