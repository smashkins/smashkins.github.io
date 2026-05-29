/* ===================== MONOIDX — interactions ===================== */
(function(){
  "use strict";

  /* ---- expertise cards ---- */
  const disciplines = [
    {name:"Swift",                cat:"Language Core"},
    {name:"SwiftUI",              cat:"Interface Layer"},
    {name:"iOS",                  cat:"Platform"},
    {name:"iPadOS",               cat:"Platform"},
    {name:"macOS",                cat:"Platform"},
    {name:"visionOS",             cat:"Spatial"},
    {name:"Platform Architecture",cat:"Systems"},
    {name:"AI Assisted Dev",      cat:"Autonomy"},
  ];
  const grid = document.getElementById("expGrid");
  if(grid){
    disciplines.forEach((d,i)=>{
      const c = document.createElement("div");
      c.className = "exp-card";
      c.innerHTML =
        '<span class="glyph"></span>'+
        '<span class="idx">'+String(i+1).padStart(2,"0")+'</span>'+
        '<div><div class="name">'+d.name+'</div>'+
        '<div class="cat">'+d.cat+'</div></div>';
      grid.appendChild(c);
    });
  }

  /* ---- philosophy rows ---- */
  const tenets = [
    {stmt:"Design for longevity.",       note:"Decades, not sprints"},
    {stmt:"Reduce complexity.",          note:"Subtract relentlessly"},
    {stmt:"Automate repetition.",        note:"Machines hold the loop"},
    {stmt:"Build resilient systems.",    note:"Fail quiet, recover clean"},
    {stmt:"Stay invisible. Deliver results.", note:"The work speaks"},
  ];
  const list = document.getElementById("philoList");
  if(list){
    tenets.forEach((t,i)=>{
      const r = document.createElement("div");
      r.className = "philo-row";
      r.innerHTML =
        '<span class="num">0'+(i+1)+'</span>'+
        '<span class="stmt">'+t.stmt+'</span>'+
        '<span class="note">'+t.note+'</span>';
      list.appendChild(r);
    });
  }

  /* ---- nav state on scroll ---- */
  const nav = document.getElementById("nav");
  const onScroll = ()=>{ nav.classList.toggle("scrolled", window.scrollY > 40); };
  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});

  /* ---- active nav link (scroll-spy; position-based) ---- */
  const navSections = Array.prototype.slice
    .call(document.querySelectorAll(".nav-links a"))
    .map(function(link){
      const id = (link.getAttribute("href") || "").replace(/^#/, "");
      const el = id && document.getElementById(id);
      return el ? {link:link, el:el} : null;
    })
    .filter(Boolean);
  function setActiveNav(){
    const trigger = window.innerHeight * 0.3;
    let current = null;
    for(let i = 0; i < navSections.length; i++){
      if(navSections[i].el.getBoundingClientRect().top <= trigger) current = navSections[i];
    }
    /* near the bottom, keep the last section active even if it's short */
    if(window.innerHeight + window.scrollY >= document.body.scrollHeight - 2){
      current = navSections[navSections.length - 1];
    }
    navSections.forEach(function(s){ s.link.classList.toggle("active", s === current); });
  }
  setActiveNav();
  window.addEventListener("scroll", setActiveNav, {passive:true});
  window.addEventListener("resize", setActiveNav, {passive:true});

  /* ---- reveal on scroll (position-based; robust everywhere) ---- */
  const reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function checkReveals(){
    const trigger = window.innerHeight * 0.92;
    for(let i = reveals.length - 1; i >= 0; i--){
      const el = reveals[i];
      if(el.getBoundingClientRect().top < trigger){
        el.classList.add("in");
        reveals.splice(i,1);
      }
    }
  }
  checkReveals();
  window.addEventListener("scroll", checkReveals, {passive:true});
  window.addEventListener("resize", checkReveals, {passive:true});
  window.addEventListener("load", checkReveals);

  /* ---- ambient cursor light ---- */
  const ambient = document.getElementById("ambient");
  let raf = null;
  window.addEventListener("pointermove", (e)=>{
    if(raf) return;
    raf = requestAnimationFrame(()=>{
      ambient.style.setProperty("--mx", e.clientX + "px");
      ambient.style.setProperty("--my", (e.clientY + window.scrollY*0) + "px");
      raf = null;
    });
  }, {passive:true});

})();
