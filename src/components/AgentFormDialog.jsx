import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Agents, Models } from "../lib/api";
import { toast } from "sonner";

const DEFAULT = {
  name: "",
  description: "",
  model: "gpt-4o-mini",
  system_prompt: "Eres un asistente de IA útil y profesional.",
  temperature: 0.7,
  max_tokens: 2048,
  status: "stopped",
  tags: [],
};

export const AgentFormDialog = ({ open, onOpenChange, initial, onSaved }) => {
  const [form, setForm] = useState(initial || DEFAULT);
  const [models, setModels] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial ? { ...DEFAULT, ...initial } : DEFAULT);
  }, [initial, open]);

  useEffect(() => {
    Models.list().then(setModels).catch(() => {});
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        model: form.model,
        system_prompt: form.system_prompt,
        temperature: Number(form.temperature),
        max_tokens: Number(form.max_tokens),
        status: form.status,
        tags: typeof form.tags === "string"
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : form.tags || [],
      };
      const saved = initial?.id
        ? await Agents.update(initial.id, payload)
        : await Agents.create(payload);
      toast.success(initial?.id ? "Agente actualizado" : "Agente creado");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (e) {
      toast.error("Error al guardar: " + (e?.response?.data?.detail || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="agent-form-dialog"
        className="max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100"
      >
        <DialogHeader>
          <DialogTitle className="font-display tracking-tight">
            {initial?.id ? "Editar agente" : "Crear nuevo agente"}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm">
            Configura el modelo LLM, el comportamiento y los parámetros de ejecución de este agente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Nombre</Label>
            <Input
              data-testid="agent-form-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ej. Bot de Soporte al Cliente"
              className="mt-2 bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-600"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Descripción</Label>
            <Input
              data-testid="agent-form-description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="¿Qué hace este agente?"
              className="mt-2 bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-600"
            />
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Modelo</Label>
            <Select value={form.model} onValueChange={(v) => update("model", v)}>
              <SelectTrigger
                data-testid="agent-form-model"
                className="mt-2 bg-zinc-950 border-zinc-800 text-zinc-100"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="font-mono text-xs">
                    {m.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Estado</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v)}>
              <SelectTrigger
                data-testid="agent-form-status"
                className="mt-2 bg-zinc-950 border-zinc-800 text-zinc-100"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectItem value="running">Activo</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="stopped">Detenido</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Prompt de sistema</Label>
            <Textarea
              data-testid="agent-form-system-prompt"
              value={form.system_prompt}
              onChange={(e) => update("system_prompt", e.target.value)}
              rows={4}
              className="mt-2 bg-zinc-950 border-zinc-800 font-mono text-xs"
            />
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 flex items-center justify-between">
              Temperatura
              <span className="text-zinc-200">{Number(form.temperature).toFixed(2)}</span>
            </Label>
            <Slider
              data-testid="agent-form-temperature"
              value={[Number(form.temperature)]}
              min={0}
              max={2}
              step={0.05}
              onValueChange={(v) => update("temperature", v[0])}
              className="mt-4"
            />
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Máx. tokens</Label>
            <Input
              data-testid="agent-form-max-tokens"
              type="number"
              value={form.max_tokens}
              onChange={(e) => update("max_tokens", e.target.value)}
              className="mt-2 bg-zinc-950 border-zinc-800 font-mono"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Etiquetas (separadas por coma)</Label>
            <Input
              data-testid="agent-form-tags"
              value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="produccion, soporte"
              className="mt-2 bg-zinc-950 border-zinc-800"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="agent-form-cancel"
            className="text-zinc-300 hover:bg-zinc-900"
          >
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={saving}
            data-testid="agent-form-submit"
            className="bg-white text-zinc-950 hover:bg-zinc-200"
          >
            {saving ? "Guardando..." : initial?.id ? "Guardar cambios" : "Crear agente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
