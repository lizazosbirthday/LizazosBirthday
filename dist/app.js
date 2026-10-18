const c = window.INVITATION,
  $ = (s) => document.querySelector(s);
const pathSlug = decodeURIComponent(location.pathname).split("/").filter(Boolean).at(-1);
const inviteToken = new URLSearchParams(location.search).get("invite") || (c.guests.some(g=>g.slug===pathSlug) ? pathSlug : null);
let personalReady = false,
  guestName = "",
  selectedGuest = null;
history.scrollRestoration = "manual";
document.body.style.overflow = "hidden";
window.scrollTo(0, 0);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const safeGet = (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  safeSet = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  };
$("#title").textContent = c.title;
$("#coverName").textContent = c.coverTitle || c.title;
document.querySelectorAll('.photostrip img').forEach((img,i)=>{const photo=(c.boothPhotos||c.photos)[i];if(photo){img.src=photo.src||photo;img.alt=photo.alt||'ლიზას მოგონება';img.style.objectPosition=photo.position||'50% 40%'}});
$("#intro").textContent = c.intro;
$("#message").textContent = c.message;
$("#venue").textContent = c.venue;
$("#address").textContent = c.address;


$("#map").href = c.mapUrl;
document.title = c.title + " · პირადი მოსაწვევი";
const date = new Date(c.date),
  fmt = (o) => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: c.timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .formatToParts(date)
        .map((p) => [p.type, p.value]),
    );
    const months = [
      "იანვარი",
      "თებერვალი",
      "მარტი",
      "აპრილი",
      "მაისი",
      "ივნისი",
      "ივლისი",
      "აგვისტო",
      "სექტემბერი",
      "ოქტომბერი",
      "ნოემბერი",
      "დეკემბერი",
    ];
    const days = {
      Mon: "ორშაბათი",
      Tue: "სამშაბათი",
      Wed: "ოთხშაბათი",
      Thu: "ხუთშაბათი",
      Fri: "პარასკევი",
      Sat: "შაბათი",
      Sun: "კვირა",
    };
    if (o.hour) return parts.hour + ":" + parts.minute;
    if (o.weekday) return days[parts.weekday];
    if (o.day && o.month === "2-digit") return parts.day + "." + parts.month;
    if (o.month === "2-digit") return parts.month;
    if (o.day && !o.month)
      return o.day === "2-digit" ? parts.day : String(+parts.day);
    return (
      (o.day ? +parts.day + " " : "") +
      months[+parts.month - 1] +
      (o.year ? ", " + parts.year : "")
    );
  };
$(".day").textContent = fmt({ day: "numeric" });
$(".hero-date div").replaceChildren(
  document.createTextNode(fmt({ month: "long", year: "numeric" })),
  document.createElement("br"),
);
const time = document.createElement("span");
time.textContent =
  fmt({ weekday: "long" }) +
  " · " +
  fmt({ hour: "2-digit", minute: "2-digit", hour12: false });
$(".hero-date div").append(time);
$(".detail-list h3").textContent = fmt({
  day: "numeric",
  month: "long",
  year: "numeric",
});
$(".detail-list article p").textContent =
  time.textContent + " · თბილისის დროით";
$(".brand").lastChild.textContent = fmt({ day: "2-digit", month: "2-digit" });
$(".art-number").textContent =
  fmt({ day: "2-digit" }) + " / " + fmt({ month: "2-digit" });
$("footer span:last-of-type").textContent =
  fmt({ day: "numeric", month: "long" }) + " · თბილისი";
function openInvite(skip = false) {
  window.scrollTo(0, 0);
  $("#site").inert = false;
  $("#site").removeAttribute("aria-hidden");
  $("#gate").classList.add("opening");
  setTimeout(
    () => {
      $("#gate").hidden = true;
      document.documentElement.classList.remove("cover-open");
      document.body.style.overflow = "";
      $("#title").tabIndex = -1;
      $("#title").focus({ preventScroll: true });
    },
    skip || reduce ? 0 : 1600,
  );
}
function printPhotos(){
 const gate=$('#gate');gate.classList.remove('printing');
 requestAnimationFrame(()=>requestAnimationFrame(()=>gate.classList.add('printing')));
}
async function loadCoverImage(img){
 if(!img.complete){await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',()=>reject(new Error('image load failed')),{once:true})})}
 if(!img.naturalWidth)throw new Error('image unavailable');
 if(img.decode)await img.decode();
}
async function prepareCover(){
 const frame=new Image();frame.src=new URL('photos/photobooth-steel.png',document.baseURI).href;
 await Promise.all([loadCoverImage(frame),...[...document.querySelectorAll('.photostrip img')].map(loadCoverImage),document.fonts?document.fonts.ready:Promise.resolve()]);
 document.documentElement.classList.remove('cover-loading');
 $('#coverLoader').remove();
 printPhotos();
}
$('#coverRetry').onclick=()=>location.reload();
prepareCover().catch(()=>{
 $('#coverLoadingText').textContent='ფოტოები ვერ ჩაიტვირთა. გადაამოწმე ინტერნეტი და სცადე ხელახლა.';
 $('#coverRetry').hidden=false;
});
$("#open").onclick = () => { startInvitationMusic(); openInvite(); };

$("#reopen").onclick = () => {
  document.documentElement.classList.add("cover-open");
  $("#gate").hidden = false;
  document.body.style.overflow = "hidden";
  $("#gate").classList.remove("opening");
  printPhotos();
  $("#site").inert = true;
  $("#site").setAttribute("aria-hidden", "true");
  $("#open").focus();
};
function theme(v) {
  if (!["paper", "disco"].includes(v)) v = "paper";
  document.body.dataset.theme = v;
  document.querySelectorAll("[data-theme]").forEach((b) => {
    if (b.tagName === "BUTTON")
      b.setAttribute("aria-pressed", b.dataset.theme === v);
  });
  safeSet("birthday-paper-theme", v);
}
theme(safeGet("birthday-paper-theme") || "paper");
document
  .querySelectorAll("button[data-theme]")
  .forEach((b) => (b.onclick = () => theme(b.dataset.theme)));
function count() {
  const diff = date.getTime() - Date.now();
  if (!Number.isFinite(diff)) {
    $("#countdown").textContent = "თარიღი დაზუსტდება";
    return;
  }
  if (diff <= 0) {
    $("#countdown").hidden = true;
    $("#started").hidden = false;
    return;
  }
  let n = Math.floor(diff / 1000);
  const vals = [
      Math.floor(n / 86400),
      Math.floor(n / 3600) % 24,
      Math.floor(n / 60) % 60,
      n % 60,
    ],
    labels = ["დღე", "საათი", "წუთი", "წამი"];
  $("#countdown").innerHTML = vals
    .map(
      (v, i) =>
        `<div><strong>${String(v).padStart(2, "0")}</strong><span>${labels[i]}</span></div>`,
    )
    .join("");
}
count();
setInterval(count, 1000);
const escapeICS = (v) =>
  String(v)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
const utc = (v) =>
  new Date(v)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
$("#calendar").onclick = () => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Birthday Invitation//KA",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:liza-" + date.getTime() + "@invitation",
    "DTSTAMP:" + utc(new Date()),
    "DTSTART:" + utc(c.date),
    "DTEND:" + utc(c.endDate),
    "SUMMARY:" + escapeICS(c.title),
    "LOCATION:" + escapeICS(c.venue + ", " + c.address),
    "DESCRIPTION:" + escapeICS(c.intro + "\n" + c.mapUrl),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const url = URL.createObjectURL(
      new Blob([lines.join("\r\n") + "\r\n"], {
        type: "text/calendar;charset=utf-8",
      }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = "birthday.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
function confetti() {
  if (reduce) return;
  const box = $("#confetti");
  for (let i = 0; i < 35; i++) {
    const el = document.createElement("b");
    el.style.left = Math.random() * 100 + "%";
    el.style.animationDelay = Math.random() * 0.4 + "s";
    el.style.background = ["#c4b5b9", "#9f4667", "#edd8bc"][i % 3];
    box.append(el);
    setTimeout(() => el.remove(), 2400);
  }
}
if(c.heroPhoto){$('#heroPhoto').src=c.heroPhoto.src;$('#heroPhoto').alt=c.heroPhoto.alt;}
if (c.photos.length) {
  document.querySelectorAll(".photo").forEach((p, i) => {
    if (!c.photos[i]) return;
    p.replaceChildren();
    const img = document.createElement("img");
    img.src = c.photos[i].src || c.photos[i];
    img.alt = c.photos[i].alt || "ჩვენი მოგონება";
    img.loading = "lazy";
    p.append(img);
    const caption=document.createElement('span');caption.className='photo-label';caption.textContent=c.photos[i].caption||'ჩვენი პატარა მოგონება';p.append(caption);
  });
  $(".photo-caption").textContent = "ზოგი რამ არ იცვლება. მაგალითად, ეს ღიმილი. ♡";
}
selectedGuest = c.guests.find(g => g.id === inviteToken || g.slug === inviteToken) || null;
if(selectedGuest){
 personalReady=true;guestName=selectedGuest.name;
 $("#gate h1").textContent=guestName+", შენ მოწვეული ხარ";

 $(".hero-copy .eyebrow").textContent=guestName+", ეს მოსაწვევი შენთვისაა";
 $("#personalGuest").textContent=guestName+", პატარა სიურპრიზი შენთვის.";
 $("#personalNote").textContent=selectedGuest.attending?"შენი ადგილი ჩვენს საღამოზე შენახულია. ♡":"შენთვისაც გვაქვს ერთი განსაკუთრებული გზავნილი. ✧";
 $("#heroSurprise").hidden=false;$("#surprise").hidden=false;$("#open").hidden=false;
}else if(inviteToken){
 $("#gate h1").textContent="ეს პირადი ბმული ვერ მოიძებნა";

 $("#personalNote").textContent="ეს პირადი ბმული ვერ მოიძებნა. სთხოვე ორგანიზატორს შენი მოსაწვევი.";
}
const launchSurprise=()=>{if(selectedGuest)showDeportAnimation(selectedGuest.attending)};
$("#surprise").onclick=launchSurprise;
$("#heroSurprise").onclick=()=>{
 const target=$("#surprise");
 target.closest('.reveal')?.classList.add('visible');
 target.scrollIntoView({behavior:reduce?'instant':'smooth',block:'center'});
 target.focus({preventScroll:true});
};
const invitationAudio = c.musicUrl ? new Audio(c.musicUrl) : null;
if(invitationAudio){invitationAudio.loop=true;invitationAudio.preload='auto';}
function startInvitationMusic(){
 if(invitationAudio && invitationAudio.paused)invitationAudio.play().catch(()=>{});
}
const obs = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    }),
  { threshold: 0.08 },
);
document.querySelectorAll(".reveal").forEach((e) => obs.observe(e));

function showDeportAnimation(attending = false) {
  document.querySelector("#deportSurprise")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "deportSurprise";
  overlay.className =
    "deport-surprise" + (attending ? " invitation-accepted" : "");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute(
    "aria-label",
    attending ? "შენი პირადი მოსაწვევი" : "პატარა სიურპრიზი დეპორტისთვის",
  );
  const content = document.createElement("div");
  content.className = "deport-content";
  const hand = document.createElement("div");
  hand.className = "deport-hand";
  hand.textContent = attending ? "🥂" : "🖕";
  hand.setAttribute("aria-hidden", "true");
  const word = document.createElement("div");
  word.className = "deport-stamp";
  word.textContent = attending ? "მოწვეული ხარ" : "დეპორტი";
  const note = document.createElement("p");
  note.textContent = attending
    ? "შენი ადგილი შენახულია — საღამო შენთან ერთად იწყება! ✨"
    : "ეს კი პირადად შენ — სიყვარულით! 🖕";
  const close = document.createElement("button");
  close.className = "outline";
  close.textContent = attending
    ? "შევხვდებით წვეულებაზე ✨"
    : "კარგი, გავიგე 😂";
  const visa = document.createElement("div");
  visa.className = "visa-card";
  visa.setAttribute(
    "aria-label",
    attending
      ? "პირადი მოსაწვევი ოქროსფერი შტამპით"
      : "სახუმრო ვიზა დეპორტის შტამპით",
  );
  const visaTop = document.createElement("div");
  visaTop.className = "visa-top";
  visaTop.textContent = attending
    ? "შენი პირადი მოსაწვევი"
    : "საღამოს შესვლის ვიზა";
  const visaBody = document.createElement("div");
  visaBody.className = "visa-body";
  const visaPortrait = document.createElement("div");
  visaPortrait.className = "visa-portrait";
  visaPortrait.textContent = attending ? "♡" : "✧";
  const visaInfo = document.createElement("div");
  visaInfo.className = "visa-info";
  for (const text of [
    attending ? guestName+", გელოდებით!" : "სახელი / "+guestName,
    c.title,
    fmt({day:"numeric",month:"long",year:"numeric"})+" · "+fmt({hour:"2-digit"}),
  ]) {
    const line = document.createElement("p");
    line.textContent = text;
    visaInfo.append(line);
  }
  const visaCode = document.createElement("div");
  visaCode.className = "visa-code";
  visaCode.textContent = "LIZA << 23102026 << PARTY << 12";
  visaBody.append(visaPortrait, visaInfo);
  visa.append(visaTop, visaBody, visaCode, word);
  const ring = document.createElement("div");
  ring.className = "impact-ring";
  ring.setAttribute("aria-hidden", "true");
  content.append(visa, ring, hand, note, close);
  overlay.append(content);
  document.body.append(overlay);
  const previous = document.activeElement,
    previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  $("#site").inert = true;
  let timer;
  const dismiss = () => {
    clearTimeout(timer);
    overlay.remove();
    $("#site").inert = false;
    document.body.style.overflow = previousOverflow;
    document.removeEventListener("keydown", onKey);
    previous?.focus({ preventScroll: true });
  };
  const onKey = (e) => {
    if (e.key === "Escape") dismiss();
    if (e.key === "Tab") {
      e.preventDefault();
      close.focus();
    }
  };
  document.addEventListener("keydown", onKey);
  close.onclick = dismiss;
  overlay.onclick = (e) => {
    if (e.target === overlay) dismiss();
  };
  close.focus({ preventScroll: true });
  if (attending && !reduce) {
    for (let i = 0; i < 48; i++) {
      const spark = document.createElement("span");
      spark.className = "accepted-spark";
      spark.textContent = i % 3 === 0 ? "✦" : "·";
      spark.style.setProperty("--x", Math.random() * 100 + "%");
      spark.style.setProperty("--delay", 1.3 + Math.random() * 0.9 + "s");
      spark.style.setProperty("--drift", (Math.random() - 0.5) * 220 + "px");
      overlay.append(spark);
    }
  }
  if (!attending) {
    const burst = document.createElement('div');
    burst.className = 'deport-hands-burst';
    burst.setAttribute('aria-hidden', 'true');
    const positions = [[9,15,-24],[78,12,22],[15,37,-18],[81,42,25],[8,66,-30],[78,72,16],[30,9,-12],[54,84,20],[33,78,-22],[66,25,28],[5,87,-15],[88,88,25]];
    positions.forEach(([x,y,rotation],i)=>{
      const extra=document.createElement('span');extra.textContent='🖕';
      extra.style.setProperty('--hand-x',x+'%');extra.style.setProperty('--hand-y',y+'%');
      extra.style.setProperty('--hand-rotation',rotation+'deg');
      extra.style.setProperty('--hand-delay',(1.5+i*.09)+'s');
      burst.append(extra);
    });
    overlay.append(burst);
  }
  timer = setTimeout(dismiss, 9500);
}

// Playful cover lettering without changing the accessible heading.
const coverTitle = document.querySelector('#coverName');
const coverWords = coverTitle.textContent.split(' ');
coverTitle.setAttribute('aria-label', coverTitle.textContent);
coverTitle.replaceChildren();
coverWords.forEach((word,index)=>{
 const span=document.createElement('span');span.className='cover-word';
 span.textContent=word;span.setAttribute('aria-hidden','true');
 span.style.setProperty('--word-delay',(.15+index*.22)+'s');coverTitle.append(span);
});

// Keep section navigation on the current guest URL despite the shared asset base.
document.querySelectorAll('a[href^="#"]').forEach(link=>{
 link.addEventListener('click',event=>{
  const target=document.getElementById(link.getAttribute('href').slice(1));
  if(!target)return;
  event.preventDefault();
  target.classList.add('visible');
  target.scrollIntoView({behavior:reduce?'instant':'smooth',block:'start'});
 });
});

// Stagger the contents of each section without a permanent animation loop.
document.querySelectorAll('.reveal').forEach(section=>{
 const items=section.querySelectorAll(':scope > .eyebrow, :scope > h2, .detail-list article, .photo, .section-heading, .personal-card, .countdown > div');
 items.forEach((item,index)=>{
  if(!item.classList.contains('photo'))item.classList.add('motion-item');
  item.style.setProperty('--motion-delay',Math.min(index*110,440)+'ms');
 });
});
if(!reduce){
 const photos=[...document.querySelectorAll('.portrait-frame img,.gallery .photo img')];
 const activePhotos=new Set();let photoFrame=0;
 const paintPhotoDepth=()=>{
  photoFrame=0;
  if(document.documentElement.classList.contains('cover-open'))return;
  const viewport=window.innerHeight;
  activePhotos.forEach(img=>{
   const rect=img.getBoundingClientRect();
   const position=(rect.top+rect.height/2-viewport/2)/viewport;
   img.style.setProperty('--photo-drift',Math.max(-6,Math.min(6,-position*12)).toFixed(2)+'px');
  });
 };
 const queuePhotoDepth=()=>{if(!photoFrame)photoFrame=requestAnimationFrame(paintPhotoDepth)};
 const photoObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting)activePhotos.add(entry.target);else activePhotos.delete(entry.target)});
  queuePhotoDepth();
 },{rootMargin:'80px'});
 photos.forEach(img=>photoObserver.observe(img));
 window.addEventListener('scroll',queuePhotoDepth,{passive:true});
 window.addEventListener('resize',queuePhotoDepth,{passive:true});
}

// Word-by-word headings and a gentle rotation as photo prints pass the viewport.
if(!reduce){
 document.querySelectorAll('.reveal h2:not([aria-live])').forEach(heading=>{
  const label=heading.textContent.replace(/\s+/g,' ').trim();
  heading.setAttribute('aria-label',label);
  const original=[...heading.childNodes];heading.replaceChildren();let index=0;
  original.forEach(node=>{
   if(node.nodeName==='BR'){heading.append(document.createElement('br'));return}
   node.textContent.split(/(\s+)/).filter(Boolean).forEach(word=>{
    if(/^\s+$/.test(word)){heading.append(document.createTextNode(' '));return}
    const span=document.createElement('span');span.className='heading-word';span.textContent=word;span.setAttribute('aria-hidden','true');span.style.setProperty('--word-delay',Math.min(index++*90,450)+'ms');heading.append(span);
   });
  });
 });
 const prints=[...document.querySelectorAll('.gallery .photo')];let tiltFrame=0;
 const updateTilts=()=>{tiltFrame=0;if(document.documentElement.classList.contains('cover-open'))return;prints.forEach((print,i)=>{const r=print.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const progress=(r.top+r.height/2-innerHeight/2)/innerHeight;print.style.setProperty('--scroll-tilt',(Math.max(-3.5,Math.min(3.5,progress*7))*(i%2?-1:1)).toFixed(2)+'deg')})};
 window.addEventListener('scroll',()=>{if(!tiltFrame)tiltFrame=requestAnimationFrame(updateTilts)},{passive:true});
}
