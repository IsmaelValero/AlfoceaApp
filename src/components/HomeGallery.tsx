"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PHOTOS = [
  "/galeria/01.png",
  "/galeria/02.png",
  "/galeria/03.png",
  "/galeria/04.png",
  "/galeria/05.png",
  "/galeria/06.png",
  "/galeria/07.png",
  "/galeria/08.png",
  "/galeria/09.png",
];

export function HomeGallery() {
  const scroller = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [phone, setPhone] = useState<HTMLElement | null>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const pointerStart = useRef<number | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const width = el.clientWidth || 1;
      setIndex(Math.min(PHOTOS.length - 1, Math.max(0, Math.round(el.scrollLeft / width))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setPhone(document.querySelector(".phone") as HTMLElement | null);
  }, []);

  useEffect(() => {
    if (open === null) return;
    const scroll = document.querySelector(".phone-scroll");
    if (!(scroll instanceof HTMLElement)) return;
    const previous = scroll.style.overflow;
    scroll.style.overflow = "hidden";
    return () => {
      scroll.style.overflow = previous;
    };
  }, [open]);

  function onPointerDown(event: React.PointerEvent<HTMLUListElement>) {
    moved.current = false;
    pointerStart.current = event.clientX;
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = scroller.current;
    if (!el) return;
    drag.current = { x: event.clientX, left: el.scrollLeft };
    el.classList.add("is-dragging");
    el.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLUListElement>) {
    if (pointerStart.current !== null && Math.abs(event.clientX - pointerStart.current) > 10) moved.current = true;
    const el = scroller.current;
    const start = drag.current;
    if (!el || !start) return;
    el.scrollLeft = start.left - (event.clientX - start.x);
  }

  function onPointerUp(event: React.PointerEvent<HTMLUListElement>) {
    const el = scroller.current;
    const start = drag.current;
    drag.current = null;
    pointerStart.current = null;
    if (!el || !start) return;
    el.classList.remove("is-dragging");
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    const width = el.clientWidth || 1;
    const startIndex = Math.round(start.left / width);
    const dx = event.clientX - start.x;
    let next = startIndex;
    if (dx <= -48) next = Math.min(PHOTOS.length - 1, startIndex + 1);
    else if (dx >= 48) next = Math.max(0, startIndex - 1);
    el.scrollTo({ left: next * width, behavior: "smooth" });
  }

  function openPhoto(photoIndex: number) {
    if (moved.current) {
      moved.current = false;
      return;
    }
    setOpen(photoIndex);
  }

  function closePhoto() {
    if (open === null) return;
    const el = scroller.current;
    if (el) el.scrollTo({ left: open * el.clientWidth, behavior: "auto" });
    setIndex(open);
    setOpen(null);
  }

  return (
    <section className="home-gallery mb-5" aria-label="Galeria de fotos">
      <ul
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {PHOTOS.map((src, photoIndex) => (
          <li key={src}>
            <button
              type="button"
              className="home-gallery-open"
              onClick={() => openPhoto(photoIndex)}
              aria-label={`Ampliar foto ${photoIndex + 1}`}
            >
              <img src={src} alt="" draggable={false} />
              <div className="home-gallery-shade" />
              <p className="home-gallery-kicker">Galeria</p>
              <p className="home-gallery-count">
                {photoIndex + 1} / {PHOTOS.length}
              </p>
            </button>
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">
        Foto {index + 1} de {PHOTOS.length}.
      </p>
      {open !== null && phone
        ? createPortal(
            <PhotoViewer index={open} onClose={closePhoto} onChange={(next) => setOpen(next)} />,
            phone,
          )
        : null}
    </section>
  );
}

function PhotoViewer({
  index,
  onClose,
  onChange,
}: {
  index: number;
  onClose: () => void;
  onChange: (next: number) => void;
}) {
  const src = PHOTOS[index];
  const startX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onChange(Math.min(PHOTOS.length - 1, index + 1));
      if (event.key === "ArrowLeft") onChange(Math.max(0, index - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onChange, onClose]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    startX.current = event.clientX;
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (startX.current === null) return;
    const dx = event.clientX - startX.current;
    startX.current = null;
    if (dx <= -48) onChange(Math.min(PHOTOS.length - 1, index + 1));
    else if (dx >= 48) onChange(Math.max(0, index - 1));
  }

  return (
    <div
      className="photo-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} de ${PHOTOS.length}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <button
        ref={closeRef}
        type="button"
        className="photo-viewer-close"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onClose}
      >
        Cerrar
      </button>
      <img src={src} alt="" draggable={false} />
      <p className="photo-viewer-caption">
        <span>
          {index + 1} / {PHOTOS.length}
        </span>
      </p>
    </div>
  );
}

