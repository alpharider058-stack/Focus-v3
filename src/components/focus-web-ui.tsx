import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { FOCUS } from "@/constants/theme";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[760px] mx-auto px-4 sm:px-6 pt-6 pb-28 sm:pb-24 flex flex-col gap-5"
    >
      {children}
    </motion.div>
  );
}

export function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 rounded-full border-3 border-[#262631] border-t-[#FF5A1F]"
      />
      <span className="text-xs uppercase tracking-widest text-[#A1A1AE] font-bold">Cargando...</span>
    </div>
  );
}

export function Header({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-1 mb-1"
    >
      {eyebrow && (
        <span className="text-xs font-black tracking-[0.2em] text-[#FF5A1F] uppercase">
          {eyebrow}
        </span>
      )}
      <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F7] tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-[#A1A1AE] leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export function Card({
  children,
  className = "",
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      style={accent ? { borderColor: `${accent}66` } : undefined}
      className={`bg-[#16161E] rounded-2xl p-4 sm:p-5 border border-[#262631] flex flex-col gap-3 relative shadow-lg shadow-black/40 transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-black tracking-[0.16em] uppercase text-[#A1A1AE]">
      {children}
    </span>
  );
}

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  icon,
}: {
  label: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-extrabold text-sm rounded-xl py-3 px-5 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none transition-shadow";

  const variants = {
    primary: "bg-[#FF5A1F] text-[#08080C] shadow-md shadow-[#FF5A1F]/20 hover:shadow-lg hover:shadow-[#FF5A1F]/30 hover:bg-[#FF723F]",
    secondary: "bg-[#1D1D27] hover:bg-[#252533] border border-[#262631] text-[#F5F5F7]",
    danger: "bg-transparent hover:bg-[#FF4D5E]/10 border border-[#FF4D5E] text-[#FF4D5E]",
    ghost: "bg-transparent hover:bg-[#1D1D27] text-[#A1A1AE] hover:text-[#F5F5F7]",
  };

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.015 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

export function Chip({
  label,
  active = false,
  onClick,
  color = FOCUS.ember,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      style={active ? { borderColor: color, backgroundColor: `${color}22`, color } : undefined}
      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
        active
          ? "border-[#FF5A1F] bg-[#FF5A1F]/15 text-[#FF5A1F]"
          : "border-[#262631] bg-[#111117] text-[#A1A1AE] hover:border-[#383848] hover:text-[#F5F5F7]"
      }`}
    >
      {label}
    </motion.button>
  );
}

export function ProgressBar({
  value,
  color = FOCUS.ember,
  height = 8,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.min(100, Math.max(0, Math.round((Number.isFinite(value) ? value : 0) * 100)));

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ height }}
      className="w-full bg-[#111117] rounded-full overflow-hidden"
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        style={{ backgroundColor: color, height }}
        className="rounded-full shadow-sm"
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  suffix,
  color = FOCUS.text,
}: {
  label: string;
  value: string;
  suffix?: string;
  color?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex-1 min-w-[90px] bg-[#16161E] rounded-2xl border border-[#262631] p-3.5 flex flex-col gap-1 transition-colors hover:border-[#383848]"
    >
      <div className="flex items-baseline gap-1">
        <span style={{ color }} className="text-xl sm:text-2xl font-black tabular-nums tracking-tight">
          {value}
        </span>
        {suffix && (
          <span className="text-xs font-bold text-[#A1A1AE]">
            {suffix}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-[#A1A1AE]">
        {label}
      </span>
    </motion.div>
  );
}

export function HabitRow({
  title,
  meta,
  done,
  onPress,
  onDelete,
}: {
  title: string;
  meta?: string;
  done: boolean;
  onPress: () => void;
  onDelete?: () => void;
}) {
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      className={`group flex items-center justify-between bg-[#16161E] rounded-2xl border transition-all ${
        done
          ? "border-[#2ED47A]/35 bg-[#16161E]/70"
          : "border-[#262631] hover:border-[#383848]"
      }`}
    >
      <button
        type="button"
        onClick={onPress}
        className="flex-1 flex items-center gap-3.5 p-3.5 sm:p-4 text-left cursor-pointer select-none"
      >
        <motion.div
          animate={{ scale: done ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-colors ${
            done
              ? "bg-[#2ED47A] border-[#2ED47A] text-[#08080C] shadow-sm shadow-[#2ED47A]/40"
              : "border-[#7C7C8A] group-hover:border-[#FF5A1F] text-transparent"
          }`}
        >
          {done ? (
            <svg className="w-4 h-4 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#FF5A1F]/30" />
          )}
        </motion.div>
        <div className="flex flex-col flex-1 min-w-0">
          <span
            className={`text-sm sm:text-base font-bold truncate transition-colors ${
              done ? "line-through text-[#A1A1AE]" : "text-[#F5F5F7]"
            }`}
          >
            {title}
          </span>
          {meta && (
            <span className="text-xs text-[#A1A1AE] mt-0.5">
              {meta}
            </span>
          )}
        </div>
      </button>

      {onDelete && (
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          aria-label={`Eliminar ${title}`}
          onClick={onDelete}
          className="mr-2 w-8 h-8 rounded-lg flex items-center justify-center text-[#7C7C8A] hover:text-[#FF4D5E] hover:bg-[#FF4D5E]/10 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
}

export function Field({
  value,
  onChange,
  placeholder,
  maxLength,
  multiline = false,
  className = "",
  autoFocus = false,
  onKeyDown,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const common = `bg-[#111117] rounded-xl border border-[#262631] px-4 py-3 text-sm text-[#F5F5F7] placeholder-[#7C7C8A] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all ${className}`;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        rows={3}
        className={`${common} resize-none`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      className={common}
    />
  );
}

export function BarChart({
  items,
  color = FOCUS.ember,
  height = 96,
}: {
  items: { key: string; label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="flex items-end gap-2 pt-2 pb-1">
      {items.map((item) => {
        const heightPct = item.value > 0 ? Math.max(8, Math.round((item.value / max) * 100)) : 4;
        return (
          <div key={item.key} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#A1A1AE] h-4 flex items-center tabular-nums">
              {item.value > 0 ? item.value : ""}
            </span>
            <div
              style={{ height }}
              className="w-full bg-[#111117] rounded-lg overflow-hidden flex flex-col justify-end p-0.5"
            >
              <motion.div
                initial={{ height: "4%" }}
                animate={{ height: `${heightPct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                style={{
                  backgroundColor: item.value > 0 ? color : "#262631",
                }}
                className="w-full rounded-md shadow-sm"
              />
            </div>
            <span className="text-[11px] font-black text-[#A1A1AE]">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
