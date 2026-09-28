import { useState } from "react";
import { Button, Chip, Field, ProgressBar } from "./focus-web-ui";
import { createHabit, saveHabits, saveProfile, SUGGESTED_HABITS, type Profile } from "@/lib/focus-storage";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";

const STEPS = 3;
const IDENTITY_PLACEHOLDERS = [
  "Soy alguien que cumple su palabra",
  "Soy alguien que entrena aunque no tenga ganas",
  "Soy alguien que no se rinde",
];

export default function OnboardingWeb({ onFinished }: { onFinished: (profile: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [identity, setIdentity] = useState<string[]>(["", "", ""]);
  const [selected, setSelected] = useState<string[]>(SUGGESTED_HABITS.slice(0, 3));
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);

  const canContinue =
    step === 0
      ? name.trim().length >= 2
      : step === 1
        ? goal.trim().length >= 3 && identity.some((item) => item.trim().length > 0)
        : selected.length > 0;

  const options = [...SUGGESTED_HABITS, ...selected.filter((item) => !SUGGESTED_HABITS.includes(item))];

  const toggleHabit = (title: string) => {
    sound.playClick();
    setSelected((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]));
  };

  const addCustom = () => {
    const clean = custom.trim().slice(0, 80);
    if (!clean || selected.includes(clean)) return;
    sound.playClick();
    setSelected((prev) => [...prev, clean]);
    setCustom("");
  };

  const updateIdentity = (index: number, value: string) => {
    setIdentity((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    const profile: Profile = {
      name: name.trim(),
      goal: goal.trim(),
      identity: identity.map((item) => item.trim()).filter(Boolean),
      createdAt: Date.now(),
    };
    await saveHabits(selected.map((title) => createHabit(title)));
    await saveProfile(profile);
    sound.playLevelUp();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onFinished(profile);
  };

  const next = () => {
    if (!canContinue) return;
    sound.playClick();
    if (step < STEPS - 1) setStep(step + 1);
    else void finish();
  };

  return (
    <div className="min-h-screen bg-[#08080C] text-[#F5F5F7] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-[560px] flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black tracking-[0.3em] text-[#FF5A1F]">FOCUS</span>
            <span className="text-xs font-bold text-[#A1A1AE]">Paso {step + 1} de {STEPS}</span>
          </div>
          <ProgressBar value={(step + 1) / STEPS} />
        </div>

        {step === 0 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h1 className="text-3xl sm:text-4xl font-black text-[#F5F5F7] tracking-tight">
              Aquí se forja tu mejor versión.
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1AE] leading-relaxed">
              Disciplina diaria, enfoque profundo y un ego que se gana a base de cumplir. Empecemos por lo básico.
            </p>
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-[#F5F5F7] uppercase tracking-wider">
                ¿Cómo te llamas?
              </label>
              <Field
                value={name}
                onChange={setName}
                placeholder="Tu nombre"
                autoFocus
                maxLength={30}
                onKeyDown={(e) => {
                  if (e.key === "Enter") next();
                }}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h1 className="text-3xl sm:text-4xl font-black text-[#F5F5F7] tracking-tight">
              ¿Quién decides ser?
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1AE] leading-relaxed">
              Tu objetivo marca el rumbo. Tus frases de identidad te recuerdan cada día quién eres.
            </p>

            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-xs font-bold text-[#F5F5F7] uppercase tracking-wider">
                Tu gran objetivo
              </label>
              <Field
                value={goal}
                onChange={setGoal}
                placeholder="Ej: Ser la persona más disciplinada que conozco"
                maxLength={100}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-bold text-[#F5F5F7] uppercase tracking-wider">
                Tu identidad (al menos una frase)
              </label>
              {identity.map((item, index) => (
                <Field
                  key={index}
                  value={item}
                  onChange={(val) => updateIdentity(index, val)}
                  placeholder={IDENTITY_PLACEHOLDERS[index]}
                  maxLength={90}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h1 className="text-3xl sm:text-4xl font-black text-[#F5F5F7] tracking-tight">
              Tus juramentos diarios
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1AE] leading-relaxed">
              Elige los hábitos que vas a cumplir cada día. Empieza con pocos y cúmplelos siempre.
            </p>

            <div className="flex flex-wrap gap-2 py-1">
              {options.map((title, idx) => (
                <Chip
                  key={`habit-opt-${title}-${idx}`}
                  label={title}
                  active={selected.includes(title)}
                  onClick={() => toggleHabit(title)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-[#F5F5F7] uppercase tracking-wider">
                Añade el tuyo propio
              </label>
              <div className="flex gap-2">
                <Field
                  value={custom}
                  onChange={setCustom}
                  placeholder="Ej: Estudiar 1 hora"
                  maxLength={80}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCustom();
                  }}
                />
                <Button
                  label="Añadir"
                  variant="secondary"
                  onClick={addCustom}
                  disabled={!custom.trim()}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-[#262631]">
          {step > 0 && (
            <Button
              label="Atrás"
              variant="secondary"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            />
          )}
          <Button
            label={step === STEPS - 1 ? "Empezar" : "Continuar"}
            onClick={next}
            disabled={!canContinue || saving}
            className={step > 0 ? "flex-[2]" : "w-full"}
          />
        </div>
      </div>
    </div>
  );
}
