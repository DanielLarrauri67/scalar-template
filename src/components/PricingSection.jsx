'use client';
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/*
  Annual price = monthly price with 20% off, rounded to the nearest dollar.
  Starter: 29 * 0.8 = 23.2 -> 23   (23 * 12 = 276 per year)
  Scale:   99 * 0.8 = 79.2 -> 79   (79 * 12 = 948 per year)
*/
const PLANS = {
  starter: {
    name: "Licencia Estándar",
    blurb: "Para proyectos personales o pruebas locales.",
    monthly: 990,
    annual: 990,
    cta: "Próximamente",
    features: [
      "1 solo proyecto",
      "Componentes básicos",
      "Soporte de la comunidad",
    ],
  },
  scale: {
    name: "FluidReact-Core",
    blurb: "Librería completa de componentes para producción.",
    monthly: 1990,
    annual: 1990,
    cta: "Comprar ahora",
    features: [
      "Proyectos ilimitados",
      "Todos los componentes UI",
      "Código fuente en React/Next.js",
      "Actualizaciones de por vida",
      "Integración fácil con Tailwind",
    ],
  },
};

const BILLING = [
  { annual: true, label: "Pago Único", note: "Acceso de por vida" },
];

/* Background glows: transform-only drift, static when reduced motion is on. */
const GLOWS = [
  {
    className:
      "-left-40 -top-32 h-[44rem] w-[44rem] bg-[radial-gradient(closest-side,rgba(124,58,237,0.26),transparent)]",
    animate: { x: [0, 80, -30, 0], y: [0, 50, -40, 0], scale: [1, 1.08, 0.96, 1] },
    duration: 32,
  },
  {
    className:
      "-right-48 top-1/4 h-[40rem] w-[40rem] bg-[radial-gradient(closest-side,rgba(79,70,229,0.24),transparent)]",
    animate: { x: [0, -70, 40, 0], y: [0, -60, 30, 0], scale: [1, 0.94, 1.06, 1] },
    duration: 38,
  },
  {
    className:
      "bottom-[-14rem] left-1/3 h-[36rem] w-[36rem] bg-[radial-gradient(closest-side,rgba(59,130,246,0.16),transparent)]",
    animate: { x: [0, 60, -50, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] },
    duration: 44,
  },
];

function AnimatedPrice({ value, reduce }) {
  return (
    <span className="relative inline-block h-[1.1em] overflow-hidden align-bottom tabular-nums leading-[1.1]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          className="inline-block"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: "55%" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: "0%" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-55%" }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function BillingToggle({ annual, onChange, reduce }) {
  return (
    <div
      role="group"
      aria-label="Billing period"
      className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1"
    >
      {BILLING.map((option) => {
        const active = option.annual === annual;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.annual)}
            className={`relative rounded-full px-5 py-2.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-violet-400/70 ${
              active ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId="billing-pill"
                className="absolute inset-0 rounded-full bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            )}
            <span className="relative flex items-center gap-2">
              {option.label}
              {option.note && (
                <span className="text-xs font-normal text-violet-300">
                  {option.note}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FeatureList({ items, tone }) {
  return (
    <ul className="mt-10 space-y-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-6 text-zinc-200">
          <Check
            aria-hidden="true"
            strokeWidth={2.25}
            className={`mt-1 size-4 shrink-0 ${tone}`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

const PLANS = {
  starter: {
    name: "Licencia Estándar",
    blurb: "Para proyectos personales o pruebas locales.",
    monthly: 990,
    annual: 990,
    cta: "Próximamente",
    features: [
      "1 solo proyecto",
      "Componentes básicos",
      "Soporte de la comunidad",
    ],
  },
  scale: {
    name: "FluidReact-Core",
    blurb: "Librería completa de componentes para producción.",
    monthly: 1990,
    annual: 1990,
    cta: "Comprar ahora",
    features: [
      "Proyectos ilimitados",
      "Todos los componentes UI",
      "Código fuente en React/Next.js",
      "Actualizaciones de por vida",
      "Integración fácil con Tailwind",
    ],
  },
};

const BILLING = [
  { annual: true, label: "Pago Único", note: "Acceso de por vida" },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.12 } },
  };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.2 : 0.85, ease: EASE },
    },
  };

  const { starter, scale } = PLANS;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative isolate overflow-hidden bg-zinc-950 px-5 py-32 font-sans text-white sm:px-8 md:py-44"
    >
      {/* Slow violet and indigo glows, matching the Hero and Bento sections */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {GLOWS.map((glow, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${glow.className}`}
            animate={reduce ? undefined : glow.animate}
            transition={{
              duration: glow.duration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        ))}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <div className="mx-auto max-w-5xl text-center">
          <motion.h2
            id="pricing-heading"
            variants={item}
            className="text-balance bg-gradient-to-b from-white to-white/60 bg-clip-text pb-[0.12em] text-[2.5rem] font-semibold leading-[0.95] tracking-[-0.04em] text-transparent sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Invierte en código. Ahorra semanas de desarrollo.
          </motion.h2>
          <motion.p
            variants={item}
            className="mx-auto mt-8 max-w-xl text-lg leading-8 text-zinc-300"
          >
            Adquiere la librería y obtén acceso instantáneo a todo el código fuente.
          </motion.p>
        </div>

        {/* Toggle */}
        <motion.div variants={item} className="mt-12 flex justify-center">
          <BillingToggle annual={annual} onChange={setAnnual} reduce={reduce} />
        </motion.div>

        {/* Cards */}
        <div className="mx-auto mt-16 grid max-w-4xl items-stretch gap-6 md:grid-cols-2 md:gap-8">
          {/* Starter: flat, recedes */}
          <motion.div variants={item} className="flex">
            <div className="flex w-full flex-col rounded-3xl border border-white/[0.06] bg-zinc-900/40 p-8 md:scale-[0.97] md:p-10">
              <h3 className="text-2xl font-semibold tracking-tight text-zinc-100">
                {starter.name}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-zinc-400">{starter.blurb}</p>
              <PlanPrice plan={starter} annual={annual} reduce={reduce} />
              <motion.a
                href="#signup"
                whileHover={reduce ? undefined : { scale: 1.02 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-white/[0.07] px-6 py-3.5 text-[15px] font-medium text-white outline-none transition-colors duration-200 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-violet-400/70"
              >
                {starter.cta}
              </motion.a>
              <FeatureList items={starter.features} tone="text-zinc-500" />
            </div>
          </motion.div>

          {/* Scale: severe glass, floats */}
          <motion.div variants={item} className="relative flex">
            {/* Light source behind the glass so the blur has something to refract */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-12 -z-10 bg-[radial-gradient(closest-side,rgba(99,102,241,0.34),rgba(124,58,237,0.12)_60%,transparent)]"
            />
            <motion.div
              animate={reduce ? undefined : { y: [0, -4, 0] }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              className="flex w-full flex-col rounded-3xl border border-white/10 bg-white/[0.02] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl md:p-10"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  {scale.name}
                </h3>
                <span className="text-sm text-violet-300">Most chosen</span>
              </div>
              <p className="mt-2 text-[15px] leading-6 text-zinc-300">{scale.blurb}</p>
              <PlanPrice plan={scale} annual={annual} reduce={reduce} large />
              <motion.a
                  href="https://mpago.la/12GvrKZ"
  target="_blank"
  rel="noopener noreferrer"

                whileHover={reduce ? undefined : { scale: 1.02 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="group mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-medium text-zinc-950 outline-none transition-colors duration-200 hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-violet-300"
              >
                {scale.cta}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </motion.a>
              <FeatureList items={scale.features} tone="text-violet-300" />
            </motion.div>
          </motion.div>
        </div>

        <motion.p
          variants={item}
          className="mt-14 text-center text-sm text-zinc-400"
        >
          Every plan starts with a 14 day trial. All prices in USD.
        </motion.p>
      </motion.div>
    </section>
  );
}