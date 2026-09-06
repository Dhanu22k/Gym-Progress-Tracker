import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  CalendarDays,
  Check,
  ChevronLeft,
  Dumbbell,
  Edit3,
  History,
  Moon,
  Plus,
  Search,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "gym-progress-tracker:v1";
const THEME_KEY = "gym-progress-tracker:theme";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const STARTING_WEIGHTS = {
  "Machine Chest Press": 25,
  "Incline Dumbbell Press": 12,
  "Machine Shoulder Press": 20,
  "Dumbbell Lateral Raises": 5,
  "Cable Tricep Pushdown": 15,
  "Overhead Dumbbell Tricep Extension": 10,
  "Lat Pulldown": 30,
  "Seated Cable Row": 28,
  "Machine Row": 25,
  "Face Pulls": 12,
  "Dumbbell Bicep Curls": 8,
  "Hammer Curls": 8,
  "Leg Press": 50,
  "Goblet Squat": 16,
  "Leg Curl": 20,
  "Leg Extension": 20,
  "Standing Calf Raises": 25,
  "Walking Lunges": 10,
  "Dumbbell Bench Press": 14,
  "Machine Incline Chest Press": 22,
  "Dumbbell Shoulder Press": 10,
  "Front Raises": 5,
  "Bench Dips": 0,
  "Lat Pulldown (different grip)": 28,
  "Single-arm Dumbbell Row": 14,
  "Rear Delt Fly": 7,
  "EZ-Bar / Dumbbell Curls": 12,
  "Cable Bicep Curls": 12,
};

const PROGRAM = {
  Monday: [
    "Machine Chest Press",
    "Incline Dumbbell Press",
    "Machine Shoulder Press",
    "Dumbbell Lateral Raises",
    "Cable Tricep Pushdown",
    "Overhead Dumbbell Tricep Extension",
  ],
  Tuesday: [
    "Lat Pulldown",
    "Seated Cable Row",
    "Machine Row",
    "Face Pulls",
    "Dumbbell Bicep Curls",
    "Hammer Curls",
  ],
  Wednesday: [
    "Leg Press",
    "Goblet Squat",
    "Leg Curl",
    "Leg Extension",
    "Standing Calf Raises",
    "Walking Lunges",
  ],
  Thursday: [
    "Dumbbell Bench Press",
    "Machine Incline Chest Press",
    "Dumbbell Shoulder Press",
    "Front Raises",
    "Cable Tricep Pushdown",
    "Bench Dips",
  ],
  Friday: [
    "Lat Pulldown (different grip)",
    "Seated Cable Row",
    "Single-arm Dumbbell Row",
    "Rear Delt Fly",
    "EZ-Bar / Dumbbell Curls",
    "Cable Bicep Curls",
  ],
};

function nowIso() {
  return new Date().toISOString();
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function makeExercise(name, day, index) {
  return {
    id: `${day.toLowerCase()}-${index}-${crypto.randomUUID()}`,
    name,
    weight: STARTING_WEIGHTS[name] ?? 10,
    sets: 3,
    reps: 12,
    notes: "",
    updatedAt: nowIso(),
    history: [],
  };
}

function seedData() {
  return DAYS.reduce((acc, day) => {
    acc[day] = PROGRAM[day].map((name, index) => makeExercise(name, day, index));
    return acc;
  }, {});
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return seedData();
    return DAYS.reduce((acc, day) => {
      acc[day] = Array.isArray(saved[day]) ? saved[day] : [];
      return acc;
    }, {});
  } catch {
    return seedData();
  }
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200/70 bg-white/70 px-3 py-2 dark:border-slate-700/80 dark:bg-slate-900/55">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{value}</div>
    </div>
  );
}

function Stepper({ label, value, min = 0, step = 1, onChange, suffix }) {
  const update = (next) => onChange(Math.max(min, Number(next) || 0));
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <div className="grid grid-cols-[52px_1fr_52px] overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          className="touch-target border-r border-slate-200 text-2xl font-semibold text-slate-700 active:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:active:bg-slate-800"
          onClick={() => update(value - step)}
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        <div className="flex items-center">
          <input
            className="h-full w-full bg-transparent px-3 py-3 text-center text-lg font-bold text-slate-950 outline-none dark:text-white"
            inputMode="decimal"
            type="number"
            min={min}
            step={step}
            value={value}
            onChange={(event) => update(event.target.value)}
          />
          {suffix && (
            <span className="pr-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {suffix}
            </span>
          )}
        </div>
        <button
          type="button"
          className="touch-target border-l border-slate-200 text-2xl font-semibold text-slate-700 active:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:active:bg-slate-800"
          onClick={() => update(value + step)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </label>
  );
}

function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <section className="max-h-[92dvh] w-full overflow-y-auto rounded-t-lg bg-slate-50 shadow-soft dark:bg-slate-950 sm:mx-auto sm:max-w-xl sm:rounded-lg">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function ExerciseForm({ initial, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(
    initial ?? {
      name: "",
      weight: 10,
      sets: 3,
      reps: 12,
      notes: "",
      history: [],
      updatedAt: nowIso(),
    },
  );

  const setField = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));

  function submit(event) {
    event.preventDefault();
    const trimmedName = draft.name.trim();
    if (!trimmedName) return;
    onSave({
      ...draft,
      id: draft.id ?? crypto.randomUUID(),
      name: trimmedName,
      weight: Number(draft.weight) || 0,
      sets: Math.max(0, Number(draft.sets) || 0),
      reps: Math.max(0, Number(draft.reps) || 0),
      notes: draft.notes.trim(),
    });
  }

  return (
    <form className="space-y-5 p-4" onSubmit={submit}>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Exercise Name
        </span>
        <input
          className="field"
          value={draft.name}
          onChange={(event) => setField("name", event.target.value)}
          placeholder="Exercise name"
          autoFocus
        />
      </label>
      <div className="space-y-4">
        <Stepper
          label="Current Weight"
          value={draft.weight}
          step={2.5}
          suffix="kg"
          onChange={(value) => setField("weight", value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Stepper label="Sets" value={draft.sets} onChange={(value) => setField("sets", value)} />
          <Stepper label="Reps" value={draft.reps} onChange={(value) => setField("reps", value)} />
        </div>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Notes
        </span>
        <textarea
          className="field min-h-28 resize-none"
          value={draft.notes}
          onChange={(event) => setField("notes", event.target.value)}
          placeholder="Felt strong today, form cue, deload note..."
        />
      </label>
      <div className="flex gap-3 pb-2">
        {onDelete && (
          <button
            className="touch-target rounded-md border border-red-200 px-4 font-semibold text-red-600 active:bg-red-50 dark:border-red-900/70 dark:text-red-300 dark:active:bg-red-950"
            type="button"
            onClick={onDelete}
          >
            <Trash2 size={18} />
          </button>
        )}
        <button
          className="touch-target flex-1 rounded-md bg-emerald-500 px-5 font-bold text-white shadow-lg shadow-emerald-950/20 active:bg-emerald-600"
          type="submit"
        >
          <Check size={19} />
          Save
        </button>
      </div>
    </form>
  );
}

function HistoryView({ exercise }) {
  return (
    <div className="space-y-3 p-4">
      {exercise.history.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No progress changes saved yet.
        </div>
      ) : (
        exercise.history.map((entry) => (
          <article
            key={entry.id}
            className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <time className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {formatDate(entry.date)}
            </time>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
                <div className="text-slate-500 dark:text-slate-400">Weight</div>
                <div className="mt-1 font-bold text-slate-950 dark:text-white">
                  {entry.old.weight} kg {"->"} {entry.next.weight} kg
                </div>
              </div>
              <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
                <div className="text-slate-500 dark:text-slate-400">Volume</div>
                <div className="mt-1 font-bold text-slate-950 dark:text-white">
                  {entry.old.sets} x {entry.old.reps} {"->"} {entry.next.sets} x {entry.next.reps}
                </div>
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}

function ExerciseCard({ exercise, onEdit, onHistory }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-bold text-slate-950 dark:text-white">
            {exercise.name}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Updated {formatDate(exercise.updatedAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button className="icon-button" type="button" onClick={onHistory} aria-label="History" title="History">
            <History size={19} />
          </button>
          <button className="icon-button" type="button" onClick={onEdit} aria-label="Edit" title="Edit">
            <Edit3 size={19} />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Weight" value={`${exercise.weight} kg`} />
        <Stat label="Sets x Reps" value={`${exercise.sets} x ${exercise.reps}`} />
      </div>
      {exercise.notes && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-950 dark:bg-amber-400/10 dark:text-amber-100">
          {exercise.notes}
        </p>
      )}
    </article>
  );
}

function App() {
  const today = DAYS[new Date().getDay() - 1] || "Monday";
  const [data, setData] = useState(loadData);
  const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : "Monday");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");
  const [editing, setEditing] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const exercises = useMemo(() => {
    const list = data[activeDay] ?? [];
    if (!query.trim()) return list;
    return list.filter((exercise) =>
      `${exercise.name} ${exercise.notes}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [activeDay, data, query]);

  const totalSets = (data[activeDay] ?? []).reduce((sum, exercise) => sum + Number(exercise.sets || 0), 0);

  function saveExercise(nextExercise) {
    setData((prev) => {
      const dayList = prev[activeDay] ?? [];
      const existing = dayList.find((item) => item.id === nextExercise.id);
      const didProgressChange =
        existing &&
        (existing.weight !== nextExercise.weight ||
          existing.sets !== nextExercise.sets ||
          existing.reps !== nextExercise.reps);

      const updatedExercise = {
        ...nextExercise,
        updatedAt: nowIso(),
        history: didProgressChange
          ? [
              {
                id: crypto.randomUUID(),
                date: nowIso(),
                old: {
                  weight: existing.weight,
                  sets: existing.sets,
                  reps: existing.reps,
                },
                next: {
                  weight: nextExercise.weight,
                  sets: nextExercise.sets,
                  reps: nextExercise.reps,
                },
              },
              ...(existing.history ?? []),
            ].slice(0, 30)
          : nextExercise.history ?? [],
      };

      return {
        ...prev,
        [activeDay]: existing
          ? dayList.map((item) => (item.id === nextExercise.id ? updatedExercise : item))
          : [...dayList, updatedExercise],
      };
    });
    setEditing(null);
  }

  function deleteExercise(id) {
    setData((prev) => ({
      ...prev,
      [activeDay]: (prev[activeDay] ?? []).filter((exercise) => exercise.id !== id),
    }));
    setEditing(null);
  }

  const currentHistoryExercise =
    historyFor && (data[activeDay] ?? []).find((exercise) => exercise.id === historyFor.id);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-7">
        <header className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-emerald-500/12 px-3 py-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
              <Dumbbell size={16} />
              Gym Progress Tracker
            </div>
            <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
              {activeDay} Workout
            </h1>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Exercises" value={(data[activeDay] ?? []).length} />
          <Stat label="Total Sets" value={totalSets} />
          <Stat label="Day" value={activeDay.slice(0, 3)} />
          <Stat label="History" value={(data[activeDay] ?? []).reduce((sum, item) => sum + item.history.length, 0)} />
        </section>

        <nav className="sticky top-0 z-20 -mx-4 mt-5 bg-slate-100/95 px-4 py-3 backdrop-blur dark:bg-slate-950/95 sm:static sm:-mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DAYS.map((day) => (
              <button
                key={day}
                className={`touch-target shrink-0 rounded-md px-4 text-sm font-bold transition ${
                  activeDay === day
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/20"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800"
                }`}
                type="button"
                onClick={() => setActiveDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-3 flex gap-3">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="field pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search exercises or notes"
            />
          </label>
          <button
            className="touch-target rounded-md bg-emerald-500 px-4 font-bold text-white shadow-lg shadow-emerald-950/20 active:bg-emerald-600"
            type="button"
            onClick={() => setEditing({})}
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEdit={() => setEditing(exercise)}
              onHistory={() => setHistoryFor(exercise)}
            />
          ))}
        </section>

        {exercises.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <CalendarDays className="mx-auto text-slate-400" size={32} />
            <p className="mt-3 font-semibold text-slate-600 dark:text-slate-300">
              No exercises match this view.
            </p>
          </div>
        )}
      </div>

      {editing && (
        <Modal
          title={editing.id ? "Update Exercise" : "Add Exercise"}
          onClose={() => setEditing(null)}
        >
          <ExerciseForm
            initial={editing.id ? editing : undefined}
            onSave={saveExercise}
            onDelete={editing.id ? () => deleteExercise(editing.id) : undefined}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}

      {currentHistoryExercise && (
        <Modal title={`${currentHistoryExercise.name} History`} onClose={() => setHistoryFor(null)}>
          <HistoryView exercise={currentHistoryExercise} />
        </Modal>
      )}

      <button
        className="fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-soft active:bg-emerald-600 sm:hidden"
        type="button"
        onClick={() => setEditing({})}
        aria-label="Add exercise"
      >
        <Plus size={24} />
      </button>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
