let key = "",
  guests = [];
const $ = (s) => document.querySelector(s),
  el = (tag, text) => {
    const e = document.createElement(tag);
    if (text) e.textContent = text;
    return e;
  };
$("#base").value = location.origin;
async function load() {
  const r = await fetch("/api/admin", { headers: { "X-Admin-Key": key } });
  if (!r.ok) throw Error("წვდომის გასაღები არასწორია.");
  guests = (await r.json()).guests;
  render();
}
function render() {
  const root = $("#guests");
  root.replaceChildren();
  $("#summary").textContent =
    `სულ ${guests.length} სტუმარი · მოდის ${guests.filter((g) => g.response?.attendance === "yes").length} · ვერ მოდის ${guests.filter((g) => g.response?.attendance === "no").length} · პასუხს ველოდებით ${guests.filter((g) => !g.response).length}`;
  guests.forEach((g, i) => {
    const card = el("article");
    card.className = "guest";
    card.append(el("h2", String(i + 1).padStart(2, "0") + " / " + g.name));
    const form = el("form"),
      label = el("label", "სტუმრის სახელი"),
      name = el("input");
    name.value = g.name;
    name.required = true;
    name.maxLength = 80;
    label.append(name);
    const gl = el("label", "პირადი მისალმება"),
      greeting = el("textarea");
    greeting.value = g.greeting;
    greeting.maxLength = 400;
    gl.append(greeting);
    const save = el("button", "ცვლილების შენახვა");
    save.className = "outline";
    form.append(label, gl, save);
    form.onsubmit = async (e) => {
      e.preventDefault();
      save.disabled = true;
      try {
        const r = await fetch("/api/admin", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-Admin-Key": key },
          body: JSON.stringify({
            id: g.id,
            name: name.value,
            greeting: greeting.value,
          }),
        });
        if (!r.ok) throw Error();
        await load();
        $("#adminStatus").textContent = "ცვლილება შენახულია.";
      } catch {
        $("#adminStatus").textContent = "ვერ შეინახა. სცადე ხელახლა.";
      } finally {
        save.disabled = false;
      }
    };
    card.append(form);
    let base;
    try {
      base = new URL($("#base").value);
      if (!["http:", "https:"].includes(base.protocol)) throw Error();
    } catch {
      base = new URL(location.origin);
    }
    const link = el("a", "პირადი მოსაწვევის გახსნა ↗");
    const url = new URL("/", base);
    url.searchParams.set("invite", g.id);
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    card.append(link);
    const copy = el("button", "ბმულის კოპირება");
    copy.className = "outline";
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(url.href);
        $("#adminStatus").textContent = g.name + " — ბმული დაკოპირებულია.";
      } catch {
        $("#adminStatus").textContent =
          "კოპირება ვერ მოხერხდა. ბმულზე მარჯვენა კლიკით აირჩიე ბმულის კოპირება.";
      }
    };
    card.append(copy);
    const r = g.response;
    card.append(
      el(
        "p",
        r
          ? `პასუხი: ${r.attendance === "yes" ? "მოვდივარ ✨" : "ვერ მოვდივარ"}\nსახელი: ${r.name}\nსიმღერა: ${r.song || "—"}\nკვება / ალერგია: ${r.diet || "—"}\nგანახლდა: ${new Date(r.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Tbilisi" })} (თბილისი)`
          : "პასუხს ველოდებით.",
      ),
    );
    card.lastChild.className = "response";
    root.append(card);
  });
}
$("#login").onsubmit = async (e) => {
  e.preventDefault();
  key = $("#key").value;
  try {
    await load();
    $("#key").value = "";
    $("#login").hidden = true;
    $("#dashboard").hidden = false;
    $("#adminStatus").textContent = "";
  } catch (e) {
    key = "";
    $("#adminStatus").textContent = e.message;
  }
};
$("#refresh").onclick = () =>
  load()
    .then(() => ($("#adminStatus").textContent = "პასუხები განახლებულია."))
    .catch(() => ($("#adminStatus").textContent = "განახლება ვერ მოხერხდა."));
$("#base").onchange = render;
$("#logout").onclick = () => {
  key = "";
  guests = [];
  $("#guests").replaceChildren();
  $("#dashboard").hidden = true;
  $("#login").hidden = false;
  $("#adminStatus").textContent = "";
};
