import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, MoveHorizontal } from "lucide-react";
import { cld, cldSrcSet, isVideo, videoPoster } from "../lib/site";

/** Full-screen viewer: arrows, swipe, Esc, focus trap, background scroll locked. */
export function Lightbox({ items, index, onIndex, onClose, label }) {
  const closeRef = useRef(null);
  const boxRef = useRef(null);
  const touch = useRef(null);
  const count = items.length;
  const go = useCallback((d) => onIndex((index + d + count) % count), [index, count, onIndex]);

  const keys = useRef({ go, onClose });
  keys.current = { go, onClose };

  // Mount only: lock page scroll, move focus in, restore both on close.
  useEffect(() => {
    const prevFocus = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") keys.current.onClose();
      else if (e.key === "ArrowRight") keys.current.go(1);
      else if (e.key === "ArrowLeft") keys.current.go(-1);
      else if (e.key === "Tab") {
        const f = boxRef.current?.querySelectorAll("button, video, a[href]");
        if (!f || !f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; prevFocus?.focus?.(); };
  }, []);

  const src = items[index];
  return (
    <div className="sx-lb" role="dialog" aria-modal="true" aria-label={label || "Media viewer"} ref={boxRef}
      onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={(e) => {
        const t = touch.current; if (!t) return;
        const dx = e.changedTouches[0].clientX - t.x, dy = e.changedTouches[0].clientY - t.y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) onClose();
        touch.current = null;
      }}>
      <div className="sx-lb-top">
        <span>{label} · {index + 1} / {count}</span>
        <button ref={closeRef} type="button" className="sx-lb-btn" onClick={onClose} aria-label="Close viewer"><X size={20} /></button>
      </div>
      <div className="sx-lb-stage">
        {isVideo(src)
          ? <video key={src} src={src} controls playsInline preload="metadata" poster={videoPoster(src)} />
          : <img key={src} src={cld(src, 1800)} srcSet={cldSrcSet(src, [800, 1200, 1800, 2400])} sizes="100vw" alt={`${label} — ${index + 1} of ${count}`} />}
        {count > 1 && <>
          <button type="button" className="sx-lb-btn sx-lb-nav prev" onClick={() => go(-1)} aria-label="Previous"><ChevronLeft size={22} /></button>
          <button type="button" className="sx-lb-btn sx-lb-nav next" onClick={() => go(1)} aria-label="Next"><ChevronRight size={22} /></button>
        </>}
      </div>
      <div className="sx-lb-bottom">{count > 1 ? "Swipe or use ← → to browse · Esc to close" : "Esc to close"}</div>
    </div>
  );
}

/** Grid of photos and videos that opens the lightbox. */
export function MediaGrid({ items, label, limit }) {
  const [open, setOpen] = useState(-1);
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <>
      <div className="sx-mgrid">
        {shown.map((src, i) => (
          <button key={src} type="button" className="sx-mitem" onClick={() => setOpen(i)} aria-label={`Open ${isVideo(src) ? "video" : "photo"} ${i + 1} of ${items.length} — ${label}`}>
            <img src={isVideo(src) ? videoPoster(src) : cld(src, 600)} srcSet={isVideo(src) ? undefined : cldSrcSet(src, [320, 600, 900])} sizes="(max-width: 640px) 50vw, 25vw"
              alt={isVideo(src) ? "" : `${label} construction photo ${i + 1}`} loading="lazy" decoding="async" width="600" height="600" />
            {isVideo(src) && <span className="sx-play" aria-hidden="true"><span><Play size={22} fill="currentColor" /></span></span>}
          </button>
        ))}
      </div>
      {open >= 0 && <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} label={label} />}
    </>
  );
}

/** Drag / touch / keyboard before-after comparison. Both photos are shown uncropped over a blurred copy. */
export function BeforeAfterSlider({ before, after, label = "Before and after" }) {
  const [pos, setPos] = useState(50);
  const box = useRef(null);
  const dragging = useRef(false);
  const fromEvent = (clientX) => {
    const r = box.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div className="sx-ba" ref={box} style={{ "--pos": `${pos}%` }}
      onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); fromEvent(e.clientX); }}
      onPointerMove={(e) => { if (dragging.current) fromEvent(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}>
      <div className="sx-ba-layer">
        <img className="bg" src={cld(before, 400)} alt="" aria-hidden="true" />
        <img className="fg" src={cld(before, 1600)} srcSet={cldSrcSet(before, [800, 1200, 1600])} sizes="(max-width: 900px) 100vw, 1100px" alt={`${label}: before — the site at the start of work`} loading="lazy" decoding="async" />
      </div>
      <div className="sx-ba-layer sx-ba-after">
        <img className="bg" src={cld(after, 400)} alt="" aria-hidden="true" />
        <img className="fg" src={cld(after, 1600)} srcSet={cldSrcSet(after, [800, 1200, 1600])} sizes="(max-width: 900px) 100vw, 1100px" alt={`${label}: after — the finished building`} loading="lazy" decoding="async" />
      </div>
      <span className="sx-ba-label before">Before</span>
      <span className="sx-ba-label after">After</span>
      <span className="sx-ba-handle" aria-hidden="true"><span className="sx-ba-knob"><MoveHorizontal size={20} /></span></span>
      <input type="range" min="0" max="100" value={Math.round(pos)} onChange={(e) => setPos(Number(e.target.value))} aria-label="Drag to compare before and after" />
    </div>
  );
}

/** Responsive Cloudinary image with fixed aspect box (no layout shift). */
export function Img({ src, alt, w = 1200, sizes = "100vw", eager = false, ...rest }) {
  if (!src) return <div className="sx-placeholder">Photos coming soon</div>;
  return <img src={cld(src, w)} srcSet={cldSrcSet(src)} sizes={sizes} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" fetchpriority={eager ? "high" : undefined} {...rest} />;
}
