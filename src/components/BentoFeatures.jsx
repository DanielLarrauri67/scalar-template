'use client';
import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight, Check, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Motion tokens                                                       */
/* ------------------------------------------------------------------ */

const EASE_OUT = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: "-100px" };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

// Cards and supporting copy: Y-axis rise on spring physics.
const rise = {
  hidden: { opacity: 0, y: 48 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 18, mass: 0.9 },
  },
};

// Headline lines: masked slide-up.
const lineUp = {
  hidden: { y: "110%" },
  show: {
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 20, mass: 1 },
  },
};

const ringDraw = {
  hidden: { pathLength: 0 },
  show: {
    pathLength: 0.98,
    transition: { duration: 1.4, delay: 0.6, ease: EASE_OUT },
  },
};

const spanGrow = {
  hidden: { scaleX: 0 },
  show: (i) => ({
    scaleX: 1,
    transition: { duration: 0.9, delay: 0.55 + i * 0.09, ease: EASE_OUT },
  }),
};

const termContainer = {
  hidden: {},
  show: { transition: { delayChildren: 0.8, staggerChildren: 0.26 } },
};

const termLine = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/* ------------------------------------------------------------------ */
/* Glass card                                                          */
/* ------------------------------------------------------------------ */

function Card({
  href,
  title,
  body,
  className = "",
  visualClass = "",
  split = false,
  children,
}) {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, rgba(129,140,248,0.16), transparent 70%)`;

  return (
    <motion.article
      variants={rise}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      className={[
        "group relative isolate flex overflow-hidden rounded-3xl p-6 sm:p-7",
        "border border-white/10 bg-white/[0.02] backdrop-blur-xl",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
        "transition-[border-color,background-color,box-shadow] duration-300",
        "hover:border-indigo-300/30 hover:bg-white/[0.04]",
        "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_0_48px_-16px_rgba(129,140,248,0.55)]",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-indigo-400/60",
        split ? "flex-col gap-8 lg:flex-row lg:items-center" : "flex-col",
        className,
      ].join(" ")}
    >
      {/* Inner top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(165,180,252,0.13),transparent)]"
      />
      {/* Cursor-following hover glow */}
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className={split ? "lg:w-[34%] lg:shrink-0" : ""}>
        <h3 className="flex items-center gap-1.5 text-xl font-medium tracking-tight text-white">
          <a
            href={href}
            className="outline-none after:absolute after:inset-0 after:z-10 after:content-['']"
          >
            {title}
          </a>
          <ArrowUpRight
            aria-hidden
            className="size-4 -translate-x-1 text-indigo-300 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
          />
        </h3>
        <p className="mt-2 max-w-[44ch] text-[15px] leading-relaxed text-zinc-400">
          {body}
        </p>
      </div>

      <div
        aria-hidden
        className={[
          "relative",
          split ? "lg:min-w-0 lg:flex-1" : "mt-6 flex flex-1 flex-col justify-end",
          visualClass,
        ].join(" ")}
      >
        {children}
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* Micro-visual: agent graph                                           */
/* ------------------------------------------------------------------ */

const INDIGO = "#818cf8";
const VIOLET = "#a78bfa";
const BLUE = "#60a5fa";

const NODES = {
  in: { x: 50, y: 170, label: "prompt", tone: INDIGO },
  a: { x: 170, y: 70, label: "retrieve", tone: VIOLET },
  b: { x: 170, y: 170, label: "reason", tone: INDIGO },
  c: { x: 170, y: 270, label: "tools", tone: BLUE },
  d: { x: 300, y: 110, label: "rank", tone: VIOLET },
  e: { x: 300, y: 230, label: "verify", tone: BLUE },
  out: { x: 430, y: 170, label: "reply", tone: INDIGO },
};

const EDGES = [
  ["in", "a"],
  ["in", "b"],
  ["in", "c"],
  ["a", "d"],
  ["a", "e"],
  ["b", "d"],
  ["b", "e"],
  ["c", "d"],
  ["c", "e"],
  ["d", "out"],
  ["e", "out"],
];

const curve = (p, q) => {
  const mx = (p.x + q.x) / 2;
  return `M${p.x} ${p.y} C${mx} ${p.y} ${mx} ${q.y} ${q.x} ${q.y}`;
};

function AgentGraph() {
  const reduce = useReducedMotion();
  const paths = EDGES.map(([from, to]) => curve(NODES[from], NODES[to]));
  const packetEdges = [1, 4, 5, 10];

  return (
    <svg
      viewBox="0 0 480 320"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
    >
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          <path
            d={d}
            fill="none"
            stroke={INDIGO}
            strokeOpacity="0.8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="2 14"
            className="bento-anim"
            style={{
              animation: `bento-flow ${1.6 + (i % 3) * 0.4}s linear infinite`,
              animationDelay: `${(i % 4) * -0.3}s`,
            }}
          />
        </g>
      ))}

      {!reduce &&
        packetEdges.map((edgeIndex, k) => (
          <circle key={edgeIndex} r="3" fill="#c7d2fe" style={{ filter: "drop-shadow(0 0 5px #a5b4fc)" }}>
            <animateMotion
              dur={`${2.4 + k * 0.35}s`}
              begin={`${k * 0.6}s`}
              repeatCount="indefinite"
              path={paths[edgeIndex]}
            />
          </circle>
        ))}

      {Object.entries(NODES).map(([id, n], i) => (
        <g key={id}>
          <circle
            cx={n.x}
            cy={n.y}
            r="14"
            fill={n.tone}
            className="bento-anim"
            style={{
              animation: "bento-pulse 3s ease-out infinite",
              animationDelay: `${i * -0.45}s`,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          />
          <circle
            cx={n.x}
            cy={n.y}
            r="9"
            fill="#09090b"
            stroke={n.tone}
            strokeWidth="1.5"
            style={{ filter: `drop-shadow(0 0 6px ${n.tone})` }}
          />
          <circle cx={n.x} cy={n.y} r="3.5" fill="#e0e7ff" />
          <text x={n.x} y={n.y + 30} textAnchor="middle" fill="#a1a1aa" fontSize="12">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Micro-visual: latency + waveform                                    */
/* ------------------------------------------------------------------ */

function CountUp({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, VIEWPORT);
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.4,
      delay: 0.6,
      ease: EASE_OUT,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {val}
    </span>
  );
}

const BARS = Array.from({ length: 36 }, (_, i) => ({
  h: 28 + Math.abs(Math.sin(i * 1.7) * 0.7 + Math.cos(i * 0.6) * 0.3) * 72,
  hue: 232 + (i / 35) * 44,
}));

function LatencyVisual() {
  return (
    <div className="flex items-end gap-5">
      <div className="shrink-0">
        <p className="text-5xl font-medium leading-none tracking-tight text-white">
          <CountUp to={78} />
          <span className="ml-0.5 text-2xl text-zinc-400">ms</span>
        </p>
        <p className="mt-2 text-xs text-zinc-500">median first token</p>
      </div>
      <div className="flex h-24 min-w-0 flex-1 items-end gap-[3px]">
        {BARS.map((b, i) => (
          <span
            key={i}
            suppressHydrationWarning
            className="bento-anim w-full origin-bottom rounded-full"
            style={{
              height: `${b.h}%`,
              background: `hsl(${b.hue} 90% 72% / 0.8)`,
              animation: `bento-wave ${1.4 + (i % 5) * 0.15}s ease-in-out infinite`,
              animationDelay: `${-i * 0.12}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Micro-visual: eval ring                                             */
/* ------------------------------------------------------------------ */

function EvalRing() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-[88px] shrink-0">
        <svg viewBox="0 0 96 96" className="size-full -rotate-90">
          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={INDIGO}
            strokeWidth="7"
            strokeLinecap="round"
            variants={ringDraw}
            style={{ filter: "drop-shadow(0 0 6px rgba(129,140,248,0.8))" }}
          />
        </svg>
        <p className="absolute inset-0 grid place-items-center text-xl font-medium tracking-tight text-white">
          <span>
            <CountUp to={98} />
            <span className="text-sm text-zinc-400">%</span>
          </span>
        </p>
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm text-white">
          <Check className="size-4 text-indigo-300" /> 24 of 24
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">checks passing</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Micro-visual: terminal                                              */
/* ------------------------------------------------------------------ */

const TERM = [
  { t: "cmd", text: "lumen deploy --prod" },
  { t: "ok", text: "Built in 4.2s" },
  { t: "ok", text: "24 evals passed" },
  { t: "ok", text: "Live in 14 regions" },
  { t: "gap" },
  { t: "cmd", text: "lumen logs --follow" },
  { t: "log", time: "12:04:11", name: "agent.route", ms: "74ms" },
  { t: "log", time: "12:04:11", name: "agent.route", ms: "81ms" },
  { t: "log", time: "12:04:12", name: "tool.search", ms: "212ms" },
  { t: "log", time: "12:04:12", name: "agent.route", ms: "69ms" },
  { t: "log", time: "12:04:13", name: "eval.guard", ms: "33ms" },
  { t: "log", time: "12:04:14", name: "agent.route", ms: "77ms" },
];

function Terminal() {
  return (
    <motion.div
      variants={termContainer}
      className="flex-1 overflow-hidden rounded-2xl bg-black/50 p-4 font-mono text-[12.5px] leading-6 ring-1 ring-white/10"
    >
      {TERM.map((l, i) => {
        if (l.t === "gap") return <div key={i} className="h-3" />;
        if (l.t === "cmd")
          return (
            <motion.div key={i} variants={termLine} className="flex items-center gap-1.5 whitespace-nowrap text-zinc-100">
              <ChevronRight className="size-3.5 shrink-0 text-indigo-300" />
              {l.text}
            </motion.div>
          );
        if (l.t === "ok")
          return (
            <motion.div key={i} variants={termLine} className="flex items-center gap-1.5 whitespace-nowrap pl-1 text-zinc-300">
              <Check className="size-3.5 shrink-0 text-indigo-300" />
              {l.text}
            </motion.div>
          );
        return (
          <motion.div key={i} variants={termLine} className="flex gap-2 whitespace-nowrap pl-1 text-zinc-500">
            <span>{l.time}</span>
            <span className="text-zinc-300">{l.name}</span>
            <span className="text-indigo-300">{l.ms}</span>
          </motion.div>
        );
      })}
      <motion.div variants={termLine} className="mt-1 flex items-center gap-1.5">
        <ChevronRight className="size-3.5 shrink-0 text-indigo-300" />
        <span
          className="bento-anim inline-block h-4 w-2 bg-indigo-300"
          style={{ animation: "bento-blink 1.1s steps(1) infinite" }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Micro-visual: trace waterfall                                       */
/* ------------------------------------------------------------------ */

const SPANS = [
  { name: "plan", from: 0, to: 16, tone: "bg-indigo-400" },
  { name: "retrieve", from: 10, to: 42, tone: "bg-violet-400" },
  { name: "generate", from: 30, to: 86, tone: "bg-indigo-400" },
  { name: "search", from: 44, to: 68, tone: "bg-blue-400" },
  { name: "validate", from: 80, to: 94, tone: "bg-violet-400" },
  { name: "respond", from: 90, to: 100, tone: "bg-blue-400" },
];

function Waterfall() {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between text-xs text-zinc-500">
        <span>Request trace</span>
        <span>
          <span className="text-zinc-200">1.24s</span> total, <span className="text-zinc-200">$0.004</span> per call
        </span>
      </div>
      <div className="space-y-3">
        {SPANS.map((s, i) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-zinc-400">{s.name}</span>
            <div className="relative h-2.5 flex-1 rounded-full bg-white/[0.05]">
              <motion.div
                custom={i}
                variants={spanGrow}
                className={`absolute inset-y-0 rounded-full ${s.tone} shadow-[0_0_14px_rgba(129,140,248,0.55)]`}
                style={{
                  left: `${s.from}%`,
                  width: `${s.to - s.from}%`,
                  transformOrigin: "left center",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function BentoFeatures() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="features"
        aria-labelledby="features-heading"
        className="relative isolate overflow-hidden bg-zinc-950 px-6 py-28 sm:py-36"
      >
        <style>{`
          @keyframes bento-flow { to { stroke-dashoffset: -32; } }
          @keyframes bento-pulse { 0% { opacity: .5; transform: scale(.6); } 100% { opacity: 0; transform: scale(2.2); } }
          @keyframes bento-wave { 0%, 100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
          @keyframes bento-blink { 50% { opacity: 0; } }
          @keyframes bento-drift { 0%, 100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(48px,-36px,0); } }
          @media (prefers-reduced-motion: reduce) { .bento-anim { animation: none !important; } }
        `}</style>

        {/* Mesh background, continuing the hero */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="bento-anim absolute -left-40 top-24 h-[520px] w-[520px] rounded-full bg-indigo-600/25 blur-[120px]"
            style={{ animation: "bento-drift 22s ease-in-out infinite" }}
          />
          <div
            className="bento-anim absolute -right-40 top-1/3 h-[560px] w-[560px] rounded-full bg-violet-600/20 blur-[130px]"
            style={{ animation: "bento-drift 28s ease-in-out infinite reverse" }}
          />
          <div
            className="bento-anim absolute bottom-0 left-1/3 h-[480px] w-[480px] rounded-full bg-blue-600/20 blur-[120px]"
            style={{ animation: "bento-drift 25s ease-in-out infinite" }}
          />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-zinc-950 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>

        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="max-w-4xl"
          >
            <h2
              id="features-heading"
              className="text-4xl font-medium leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl"
            >
              <span className="block overflow-hidden pb-[0.12em]">
                <motion.span variants={lineUp} className="block">
                  Ship the model.
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.12em]">
                <motion.span variants={lineUp} className="block">
                  Skip the plumbing.
                </motion.span>
              </span>
            </h2>
            <motion.p variants={rise} className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
              Orchestration, evals, and tracing arrive as one runtime. Your team spends the week on the product, not the glue.
            </motion.p>
          </motion.div>

          {/* Bento grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:auto-rows-[300px] lg:grid-cols-4"
          >
            <Card
              href="#agents"
              title="Agents that route themselves"
              body="Chain models, tools, and memory into graphs that branch, retry, and recover without a pager."
              className="md:col-span-2 lg:row-span-2"
              visualClass="min-h-[320px]"
            >
              <AgentGraph />
            </Card>

            <Card
              href="#inference"
              title="First token in under 80ms"
              body="Edge inference streams by default, so replies start before anyone looks away."
              className="md:col-span-2"
              visualClass="min-h-[112px]"
            >
              <LatencyVisual />
            </Card>

            <Card
              href="#evals"
              title="Evals on every push"
              body="A regression fails the build, not the demo."
              visualClass="min-h-[88px]"
            >
              <EvalRing />
            </Card>

            <Card
              href="#cli"
              title="One command to production"
              body="Deploy, tail, and roll back from your terminal."
              className="lg:row-span-2"
              visualClass="min-h-[260px]"
            >
              <Terminal />
            </Card>

            <Card
              href="#tracing"
              title="Traces down to the token"
              body="See cost, latency, and drift for every call in a single waterfall."
              className="md:col-span-2 lg:col-span-3"
              visualClass="min-h-[170px]"
              split
            >
              <Waterfall />
            </Card>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}