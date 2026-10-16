'use client';
/**
 * Section 4: Bottom CTA and Global Footer
 *
 * Setup:  npm i framer-motion lucide-react
 * Needs:  Tailwind CSS v3.4+ (arbitrary values + bg-white/[0.02] syntax)
 *
 * Swap BRAND and FOOTER_COLUMNS to retheme. Everything else reads from them.
 */
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowRight } from "lucide-react";

const BRAND = "Vantora";
const TAGLINE = "Intelligence infrastructure for teams that ship.";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: ["Agents", "Workflows", "Integrations", "Pricing", "Changelog"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API reference", "Guides", "Community", "Status"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Contact", "Privacy"],
  },
];

const SPRING = { type: "spring", stiffness: 90, damping: 18, mass: 0.9 };
const FADE = { duration: 0.6, ease: "easeOut" };

/* ------------------------------------------------------------------ */
/* Logo                                                                */
/* ------------------------------------------------------------------ */
function Logo() {
  return (
    <a
      href="#top"
      className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-950"
      aria-label={`${BRAND} home`}
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="16" className="fill-zinc-50" />
        <path
          d="M9.5 11.5 16 22l6.5-10.5"
          stroke="#09090b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xl font-semibold tracking-[-0.04em] text-zinc-50">
        {BRAND}
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Pulsating radial glow (transform + opacity only)                    */
/* ------------------------------------------------------------------ */
function Glow({ className, color, delay = 0, reduce }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{
        background: `radial-gradient(closest-side, ${color}, transparent)`,
        willChange: "transform, opacity",
      }}
      initial={false}
      animate={
        reduce
          ? { opacity: 0.75, scale: 1 }
          : { opacity: [0.55, 1, 0.55], scale: [1, 1.14, 1] }
      }
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 7, ease: "easeInOut", repeat: Infinity, delay }
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic primary button                                             */
/* The padded wrapper catches the pointer early so the pull starts     */
/* before the cursor reaches the button itself.                        */
/* ------------------------------------------------------------------ */
function MagneticButton({ href, children, reduce }) {
  const wrapRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const handleMove = (e) => {
    if (reduce || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.35);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.35);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="-m-8 inline-block p-8"
    >
      <motion.a
        href={href}
        style={{ x: springX, y: springY }}
        whileTap={{ scale: 0.97 }}
        className="group inline-flex items-center gap-3 rounded-full bg-zinc-50 px-8 py-4 text-base font-medium tracking-tight text-zinc-950 transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 sm:px-10 sm:py-5 sm:text-lg"
      >
        {children}
        <ArrowRight
          className="h-5 w-5 transition-transform duration-300 ease-out group-hover:translate-x-1"
          aria-hidden="true"
        />
      </motion.a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */
function FinalCta({ reduce }) {
  const container = {
    hidden: { opacity: 0, y: reduce ? 0 : 96, scale: reduce ? 1 : 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        y: SPRING,
        scale: SPRING,
        opacity: FADE,
        staggerChildren: 0.09,
        delayChildren: 0.2,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: reduce ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { y: SPRING, opacity: { duration: 0.5, ease: "easeOut" } },
    },
  };

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative isolate overflow-hidden px-4 py-28 sm:px-6 sm:py-40 lg:py-48"
    >
      <div className="relative mx-auto max-w-6xl">
        {/* Energy behind the glass */}
        <Glow
          reduce={reduce}
          color="rgba(139, 92, 246, 0.6)"
          className="left-[4%] top-[-25%] h-[95%] w-[65%]"
        />
        <Glow
          reduce={reduce}
          color="rgba(59, 130, 246, 0.5)"
          delay={3.5}
          className="bottom-[-30%] right-[2%] h-[95%] w-[65%]"
        />
        <Glow
          reduce={reduce}
          color="rgba(99, 102, 241, 0.35)"
          delay={1.8}
          className="left-[25%] top-[10%] h-[80%] w-[50%]"
        />

        {/* Glass container */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] px-6 py-20 text-center backdrop-blur-2xl sm:rounded-[2.5rem] sm:px-12 sm:py-28 lg:py-36"
        >
          {/* Top sheen, the glass catching light */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_0%,rgba(255,255,255,0.07),transparent)]"
          />

          <div className="relative">
            <motion.h2
              id="final-cta-heading"
              variants={child}
              className="text-5xl font-semibold leading-[0.95] tracking-[-0.045em] text-zinc-50 sm:text-7xl lg:text-8xl xl:text-[9rem]"
            >
              <span className="block">Scale your</span>
              <span className="block">intelligence.</span>
            </motion.h2>

            <motion.p
              variants={child}
              className="mx-auto mt-8 max-w-xl text-lg leading-relaxed tracking-tight text-zinc-300 sm:mt-10 sm:text-xl"
            >
              Connect your data, deploy your first agent today, and keep full
              control of every model call.
            </motion.p>

            <motion.div variants={child} className="mt-10 sm:mt-12">
              <MagneticButton href="#signup" reduce={reduce}>
                Start building free
              </MagneticButton>
            </motion.div>

            <motion.p
              variants={child}
              className="mt-6 text-sm tracking-tight text-zinc-400"
            >
              14 days free. No card required.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */
function Footer({ reduce }) {
  const year = new Date().getFullYear();

  const group = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { y: SPRING, opacity: { duration: 0.5, ease: "easeOut" } },
    },
  };

  return (
    <footer className="relative px-6 pb-16 pt-4 sm:pb-20">
      <motion.div
        variants={group}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24"
      >
        {/* Left: logo and copyright */}
        <motion.div
          variants={item}
          className="flex flex-col justify-between gap-10"
        >
          <div className="space-y-5">
            <Logo />
            <p className="max-w-xs text-base leading-relaxed tracking-tight text-zinc-400">
              {TAGLINE}
            </p>
          </div>
          <p className="text-sm tracking-tight text-zinc-400">
            &copy; {year} {BRAND}, Inc. All rights reserved.
          </p>
        </motion.div>

        {/* Right: three link columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
          {FOOTER_COLUMNS.map((col) => (
            <motion.nav
              key={col.title}
              variants={item}
              aria-label={col.title}
              className="last:col-span-2 sm:last:col-span-1"
            >
              <h3 className="text-base font-medium tracking-tight text-zinc-200">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {col.links.map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="rounded text-base tracking-tight text-zinc-500 transition-colors duration-200 hover:text-zinc-200 focus-visible:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-950"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ))}
        </div>
      </motion.div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Section 4 export                                                    */
/* ------------------------------------------------------------------ */
export default function CtaFooter() {
  const reduce = useReducedMotion();

  return (
    <div className="bg-zinc-950 font-sans text-zinc-50 antialiased selection:bg-violet-500/30">
      <FinalCta reduce={reduce} />
      <Footer reduce={reduce} />
    </div>
  );
}