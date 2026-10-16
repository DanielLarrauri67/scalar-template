'use client';
import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * Scalar: AI startup hero section
 * React 18 + Tailwind CSS 3 + Framer Motion 11
 *
 * Setup: add the `grain` and `gutter` rules from hero.css to your global
 * stylesheet, and load "Bricolage Grotesque" (display) and "Geist" (text),
 * then map them to `font-display` and `font-sans` in tailwind.config.
 */

const EASE = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------ */
/* Chart data: 24 hourly samples, normalised 0..1                       */
/* ------------------------------------------------------------------ */

const W = 600;
const H = 160;

const REQUESTS = [
  0.32, 0.3, 0.28, 0.31, 0.35, 0.4, 0.46, 0.44, 0.52, 0.58, 0.55, 0.62, 0.68,
  0.66, 0.72, 0.7, 0.78, 0.74, 0.82, 0.8, 0.88, 0.85, 0.92, 0.95,
];
const CACHED = [
  0.14, 0.15, 0.15, 0.17, 0.2, 0.22, 0.26, 0.25, 0.3, 0.34, 0.33, 0.38, 0.42,
  0.41, 0.46, 0.45, 0.52, 0.5, 0.57, 0.56, 0.63, 0.62, 0.68, 0.7,
];

const yOf = (v) => H - 8 - v * (H - 16);

function linePath(values) {
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, yOf(v)]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += ` Q${x},${y} ${(x + nx) / 2},${(y + ny) / 2}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d} L${lx},${ly}`;
}

const REQUESTS_D = linePath(REQUESTS);
const CACHED_D = linePath(CACHED);
const AREA_D = `${REQUESTS_D} L${W},${H} L0,${H} Z`;
const END_Y_PCT = (yOf(REQUESTS[REQUESTS.length - 1]) / H) * 100;

const STATS = [
  { label: "Requests / min", value: "48,210", delta: "+12.4%" },
  { label: "p95 latency", value: "212 ms", delta: "−38 ms" },
  { label: "Cost / 1M tokens", value: "$0.42", delta: "−31%" },
];

const SIDEBAR = ["Overview", "Routing", "Caching", "Evals", "API keys"];
const NAV_LINKS = ["Product", "Pricing", "Docs", "Changelog"];

/* ------------------------------------------------------------------ */
/* Small pieces                                                         */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 shadow-[0_0_20px_rgba(129,140,248,0.55)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M5 19a14 14 0 0 1 14-14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M5 19a7 7 0 0 1 7-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="5.2" cy="18.8" r="1.6" fill="#fff" />
      </svg>
    </span>
  );
}

function Orb({ className, drift, duration }) {
  const rm = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-3xl will-change-transform ${className}`}
      animate={
        rm ? undefined : { x: drift.x, y: drift.y, scale: [1, 1.12, 0.94, 1] }
      }
      transition={{ duration, ease: "easeInOut", repeat: Infinity }}
    />
  );
}

function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Orb
        className="-left-40 -top-32 h-[34rem] w-[34rem] bg-indigo-600/35"
        drift={{ x: [0, 70, -30, 0], y: [0, 50, 90, 0] }}
        duration={22}
      />
      <Orb
        className="-right-32 top-1/3 h-[30rem] w-[30rem] bg-violet-600/30"
        drift={{ x: [0, -60, 20, 0], y: [0, 70, -40, 0] }}
        duration={26}
      />
      <Orb
        className="bottom-[-12rem] left-1/2 -ml-[20rem] h-[40rem] w-[40rem] bg-blue-600/25"
        drift={{ x: [0, 80, -60, 0], y: [0, -40, 20, 0] }}
        duration={30}
      />
      <div className="grain" />
    </div>
  );
}

function MagneticButton({ children, href = "#" }) {
  const rm = useReducedMotion();
  const field = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  const labelX = useTransform(sx, (v) => v * 0.45);
  const labelY = useTransform(sy, (v) => v * 0.45);

  const onMove = (e) => {
    if (rm || e.pointerType !== "mouse") return;
    const r = field.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const release = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={field}
      onPointerMove={onMove}
      onPointerLeave={release}
      className="-m-4 p-4"
    >
      <motion.a
        href={href}
        style={{ x: sx, y: sy }}
        whileHover={rm ? undefined : { scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group inline-flex items-center rounded-full bg-white px-7 py-3.5 text-base font-medium text-zinc-950 shadow-[0_0_44px_-4px_rgba(129,140,248,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
      >
        <motion.span style={{ x: labelX, y: labelY }} className="inline-flex items-center gap-2">
          {children}
          <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" aria-hidden="true">
            <path d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </motion.a>
    </div>
  );
}

const WORDS = ["Intelligence", "that", "scales."];

function Headline({ rm }) {
  return (
    <motion.h1
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
      className="max-w-5xl text-balance font-display text-[clamp(3rem,9vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.045em]"
    >
      {WORDS.map((word) => (
        <React.Fragment key={word}>
          <span className="-mb-[0.16em] -mt-[0.08em] inline-block overflow-hidden pb-[0.16em] pt-[0.08em] align-top">
            <motion.span
              variants={{
                hidden: rm ? { opacity: 0 } : { y: "110%" },
                show: rm
                  ? { opacity: 1, transition: { duration: 0.6 } }
                  : { y: "0%", transition: { duration: 1.05, ease: EASE } },
              }}
              className="inline-block bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
            >
              {word}
            </motion.span>
          </span>{" "}
        </React.Fragment>
      ))}
    </motion.h1>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

function Chart({ rm, fade }) {
  return (
    <motion.div variants={fade} className="relative mt-4 flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#818cf8" stopOpacity="0.38" />
              <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="line-stroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#60a5fa" />
              <stop offset="0.55" stopColor="#818cf8" />
              <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
            <clipPath id="reveal">
              <motion.rect
                x="-20"
                y="-30"
                height={H + 60}
                variants={{
                  hidden: { width: rm ? W + 40 : 0 },
                  show: { width: W + 40, transition: { duration: rm ? 0 : 2.1, ease: EASE, delay: 0.35 } },
                }}
              />
            </clipPath>
          </defs>

          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1="0"
              x2={W}
              y1={H * f}
              y2={H * f}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <g clipPath="url(#reveal)">
            <path d={AREA_D} fill="url(#area-fill)" />
            <path
              d={CACHED_D}
              fill="none"
              stroke="#60a5fa"
              strokeOpacity="0.6"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "drop-shadow(0 0 5px rgba(96,165,250,0.8))" }}
            />
            <path
              d={REQUESTS_D}
              fill="none"
              stroke="url(#line-stroke)"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "drop-shadow(0 0 8px rgba(129,140,248,0.95))" }}
            />
          </g>
        </svg>

        <div className="absolute left-0 top-0 flex items-center gap-4 text-xs text-zinc-300">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,1)]" />
            Requests
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]" />
            Served from cache
          </span>
        </div>

        <div className="absolute right-0 h-0 w-0" style={{ top: `${END_Y_PCT}%` }}>
          <motion.span
            variants={{
              hidden: { opacity: 0, scale: rm ? 1 : 0 },
              show: { opacity: 1, scale: 1, transition: { delay: rm ? 0 : 2.2, duration: 0.5, ease: EASE } },
            }}
            className="absolute -ml-[5px] -mt-[5px] block h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_14px_3px_rgba(192,132,252,0.9)]"
          >
            <motion.span
              className="absolute inset-0 rounded-full bg-violet-400/70"
              animate={rm ? undefined : { scale: [1, 3.2], opacity: [0.7, 0] }}
              transition={{ duration: 2, ease: "easeOut", repeat: Infinity, delay: 2.6 }}
            />
          </motion.span>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-zinc-400 tabular-nums">
        {["00:00", "06:00", "12:00", "18:00", "Now"].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </motion.div>
  );
}

function Dashboard({ rm }) {
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.9 } },
  };
  const fade = {
    hidden: { opacity: 0, y: rm ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  };
  const row = {
    hidden: { opacity: 0, x: rm ? 0 : -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
  };
  const chip = {
    hidden: { opacity: 0, scale: rm ? 1 : 0.85 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: EASE, delay: 1.8 } },
  };

  return (
    <div className="mt-16 w-full sm:mt-20" style={{ perspective: 1400 }}>
      <motion.div
        className="relative mx-auto w-full max-w-4xl"
        style={{ transformOrigin: "50% 100%" }}
        variants={{
          hidden: { opacity: 0, y: rm ? 0 : 90, rotateX: rm ? 0 : 16, scale: rm ? 1 : 0.94 },
          show: { opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { duration: 1.3, ease: EASE } },
        }}
      >
        {/* continuous float */}
        <motion.div
          className="relative"
          animate={rm ? undefined : { y: [0, -14, 0] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, delay: 1.6 }}
        >
          <motion.div
            variants={stagger}
            role="img"
            aria-label="Preview of the Scalar traffic dashboard: 48,210 requests per minute, 212 millisecond p95 latency, $0.42 per million tokens"
            className="relative flex h-96 w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_40px_140px_-30px_rgba(99,102,241,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
          >
            <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.07] to-transparent" />
            <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

            {/* top bar */}
            <motion.div variants={fade} className="relative flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-5">
              <p className="text-xs text-zinc-300">
                Production <span className="mx-1.5 text-zinc-500">/</span>
                <span className="text-white">Traffic</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-zinc-300">
                <span>Last 24 hours</span>
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Live
                </span>
              </div>
            </motion.div>

            <div className="relative flex min-h-0 flex-1">
              {/* sidebar */}
              <motion.div
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
                className="hidden w-44 shrink-0 flex-col justify-between border-r border-white/10 p-3 sm:flex"
              >
                <ul className="flex flex-col gap-1">
                  {SIDEBAR.map((label, i) => (
                    <motion.li
                      key={label}
                      variants={row}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        i === 0 ? "bg-white/10 text-white" : "text-zinc-300"
                      }`}
                    >
                      {label}
                    </motion.li>
                  ))}
                </ul>
                <motion.div variants={row} className="px-1 pb-1">
                  <div className="flex items-baseline justify-between text-xs text-zinc-300">
                    <span>Free tier</span>
                    <span className="tabular-nums">6.2M / 10M</span>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.9)]"
                      variants={{
                        hidden: { width: rm ? "62%" : "0%" },
                        show: { width: "62%", transition: { duration: 1.4, ease: EASE, delay: 0.3 } },
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* main */}
              <div className="flex min-w-0 flex-1 flex-col p-5">
                <motion.div variants={fade} className="grid grid-cols-3 gap-3 sm:gap-6">
                  {STATS.map((s) => (
                    <div key={s.label} className="min-w-0">
                      <p className="truncate text-[11px] text-zinc-300 sm:text-xs">{s.label}</p>
                      <p className="mt-1 font-display text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                        {s.value}
                      </p>
                      <p className="mt-0.5 text-[11px] text-emerald-300 tabular-nums sm:text-xs">{s.delta}</p>
                    </div>
                  ))}
                </motion.div>
                <Chart rm={rm} fade={fade} />
              </div>
            </div>
          </motion.div>

          {/* floating glass chips */}
          <motion.div variants={chip} className="absolute -right-5 -top-6 z-10 hidden md:block">
            <motion.div
              animate={rm ? undefined : { y: [0, 10, 0] }}
              transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity, delay: 1 }}
              className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.7)] backdrop-blur-xl"
            >
              <span className="font-display text-xl font-semibold tabular-nums">92%</span>
              <span className="text-xs leading-tight text-zinc-200">
                cache
                <br />
                hit rate
              </span>
            </motion.div>
          </motion.div>

          <motion.div variants={chip} className="absolute -left-7 bottom-16 z-10 hidden md:block">
            <motion.div
              animate={rm ? undefined : { y: [0, -9, 0] }}
              transition={{ duration: 6.5, ease: "easeInOut", repeat: Infinity, delay: 0.4 }}
              className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-[0_20px_60px_-20px_rgba(168,85,247,0.7)] backdrop-blur-xl"
            >
              <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(192,132,252,1)]" />
              <span className="text-sm text-zinc-100">
                Routed in <span className="font-semibold tabular-nums">4 ms</span>
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */

export default function Hero() {
  const rm = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
  };
  const rise = {
    hidden: { opacity: 0, y: rm ? 0 : 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  };
  const fade = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
  };

  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-black font-sans text-white">
      <Backdrop />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="gutter relative z-10 pb-24 sm:pb-32"
      >
        <motion.nav
          variants={fade}
          aria-label="Primary"
          className="mx-auto flex max-w-6xl items-center justify-between py-6"
        >
          <a
            href="#"
            className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
          >
            <Logo />
            Scalar
          </a>
          <ul className="hidden items-center gap-9 text-sm text-zinc-300 md:flex">
            {NAV_LINKS.map((l) => (
              <li key={l}>
                <a href="#" className="transition-colors hover:text-white">
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-white/10"
          >
            Sign in
          </a>
        </motion.nav>

        <div className="mx-auto flex max-w-6xl flex-col items-center pt-14 text-center sm:pt-24">
          <Headline rm={rm} />

          <motion.p
            variants={rise}
            className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-zinc-300 sm:text-xl"
          >
            Scalar routes every request to the right model, caches what repeats, and holds p95
            latency under 250 ms while your traffic grows tenfold.
          </motion.p>

          <motion.div
            variants={rise}
            className="mt-9 flex flex-col items-center gap-2 sm:flex-row sm:gap-4"
          >
            <MagneticButton href="#">Start building</MagneticButton>
            <a
              href="#"
              className="rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-base text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
            >
              Book a demo
            </a>
          </motion.div>

          <motion.p variants={rise} className="mt-3 text-sm text-zinc-400">
            Free tier includes 10M tokens a month. No card needed.
          </motion.p>
        </div>

        <Dashboard rm={rm} />
      </motion.div>
    </section>
  );
}