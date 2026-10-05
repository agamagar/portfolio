// Live prompt builder for the Teams half of the library (promptLibrary/teams). Pick
// a role, pick one of its tasks, type what the model is being asked about, and the
// same assembler that renders every catalog block composes the prompt here, so the
// picker and the page cannot drift.
import { useState } from "react";
import { TEAMS, TASK_SETS, buildTeamPrompt, uncite } from "./promptLibrary/teams/index.js";

export default function TeamsPromptBuilder() {
  if (!TEAMS.length) return null;
  return <Picker />;
}

function Picker() {
  const [teamId, setTeamId] = useState(TEAMS[0].id);
  const team = TEAMS.find((t) => t.id === teamId) || TEAMS[0];
  const set = TASK_SETS.find((s) => s.team === team.id);
  const taskNames = Object.keys(set.tasks);
  const [taskName, setTaskName] = useState(taskNames[0]);
  const name = taskNames.includes(taskName) ? taskName : taskNames[0];
  const task = set.tasks[name];
  const [topic, setTopic] = useState("");
  const [copied, setCopied] = useState(false);

  const prompt = buildTeamPrompt(team, name, task, { topic: topic.trim() || undefined });

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="prd-builder prd-teams">
      <div className="prd-builder__row">
        <label className="prd-builder__field">
          <span className="prd-field__label">Team</span>
          <select
            className="prd-builder__select"
            value={team.id}
            onChange={(e) => {
              const next = TEAMS.find((t) => t.id === e.target.value);
              setTeamId(next.id);
              const nextSet = TASK_SETS.find((s) => s.team === next.id);
              setTaskName(Object.keys(nextSet.tasks)[0]);
            }}
          >
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>{t.eyebrow}</option>
            ))}
          </select>
        </label>
        <label className="prd-builder__field">
          <span className="prd-field__label">Task</span>
          <select className="prd-builder__select" value={name} onChange={(e) => setTaskName(e.target.value)}>
            {taskNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="prd-builder__field prd-teams__topic">
          <span className="prd-field__label">What it is about</span>
          <input
            className="prd-builder__select"
            type="text"
            value={topic}
            placeholder={task.example || "one line: the thing being decided, built or reviewed"}
            onChange={(e) => setTopic(e.target.value)}
          />
        </label>
      </div>
      <p className="prd-teams__job">
        <strong>{name}.</strong> {uncite(task.job)}
      </p>
      <div className="prd-pre">
        <button type="button" className="prd-pre__copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
        <pre>{prompt}</pre>
      </div>
    </div>
  );
}
