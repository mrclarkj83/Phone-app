const PAGES_BUNDLE_REPAIR = {
  length: 15449,
  prefixLength: 14774,
  suffix:
    "COM8lLKthmYhIMgEkZTpdOQjmA2KkT/+LgyZiNPhIxlLONdvgqXwQmhKDNvXqXPUDVsIKicjqbDuhmgYcYIWHyXhTfAiEoTLwLJCDDJEBFhk6Ypc0UrEErcyACgQcXIHzYIA5sezh1KrNO7gBTGjYBizKpMtgUGZUkl1DYR/zggt9OTclLQWn7Na3yUTMuayI3MYmbagpmV57S1OJd5deieEfi0JsQCPh1WkRulkaRFoYKfwXpeoW8j1CEyEtylaUig49/Nylu1VC4ILrc2i8mH3qPnfA11S6F4qpgjv13+76wjy9nzROesR1UTyWYoVkAxdR1T+QyxQbLgGVNOvGNRwAdLgkh5nBEmlUXGlyvsk24E7jk2gteZGNkjxPN3HrTvBMlDyDqUw4q+81sK7i4M6TKDSj4AiSueETcS49tHS1juicVsjN8jrm0dAQdWBuTe7CxDJML62IyXTDL8ZiQNhbHNbMMjQNq47Gvhi1DYw349mfibkA5vhiEa6NqkM/eslA7uickcqnQdxG3Wh1SyCd+QMuWZbZCFUrGa+Qzl3QhfpEd2X1JXl2HVbuprr2m3OJ4kEjlamzJOh6DF3skD2PUOw9EsBLNlzxA0Yxm/Jn8HhRYZllVutJTnlnSrCRZsHT3s0mOaO+Im5qZLLHWiFPHeX8f3vo/EHX+XD3GAAA=",
};

async function loadDragonMath() {
  let moduleUrl;

  try {
    const response = await fetch(new URL("app.bundle.gz.b64?v=20260514-5", import.meta.url), {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Could not load app bundle.");
    if (!("DecompressionStream" in globalThis)) {
      throw new Error("This browser needs a current Chrome, Edge, Firefox, or Safari version.");
    }
    let base64 = (await response.text()).replace(/\s/g, "");
    if (base64.length === PAGES_BUNDLE_REPAIR.length) {
      base64 = base64.slice(0, PAGES_BUNDLE_REPAIR.prefixLength) + PAGES_BUNDLE_REPAIR.suffix;
    }
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    const code = await new Response(stream).text();
    moduleUrl = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
    await import(moduleUrl);
  } catch (error) {
    console.error(error);
    const banner = document.querySelector(".status-banner");
    if (banner) {
      banner.textContent = error.message || "DragonMath could not start.";
      banner.dataset.tone = "danger";
    }
  } finally {
    if (moduleUrl) {
      setTimeout(() => URL.revokeObjectURL(moduleUrl), 0);
    }
  }
}

loadDragonMath();
