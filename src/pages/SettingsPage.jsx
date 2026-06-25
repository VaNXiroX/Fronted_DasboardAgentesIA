import React, { useState } from "react";
import { Admin } from "../lib/api";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import { RotateCw, Bell, Database, Shield } from "lucide-react";

export default function SettingsPage() {
  const [busy, setBusy] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [errorThreshold, setErrorThreshold] = useState(true);
  const [autoRestart, setAutoRestart] = useState(false);

  const reseed = async () => {
    setBusy(true);
    try {
      await Admin.resetSeed();
      toast.success("Datos de demostración regenerados");
    } catch {
      toast.error("Error al regenerar los datos");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl fade-up">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
          Espacio de trabajo
        </div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-white mt-1">
          Configuración
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Configura cómo Sentinel supervisa y envía alertas sobre tu flota de agentes.
        </p>
      </div>

      <Section icon={Bell} title="Notificaciones">
        <Toggle
          label="Alertas por correo"
          desc="Recibe un correo cuando algún agente entre en estado de error"
          value={emailAlerts}
          onChange={setEmailAlerts}
          testid="setting-email-alerts"
        />
        <Toggle
          label="Umbral de tasa de error"
          desc="Alerta cuando la tasa de error de un agente supera el 10% en 1 hora"
          value={errorThreshold}
          onChange={setErrorThreshold}
          testid="setting-error-threshold"
        />
      </Section>

      <Section icon={Shield} title="Ejecución">
        <Toggle
          label="Reinicio automático ante error"
          desc="Reinicia automáticamente los agentes que entren en estado de error"
          value={autoRestart}
          onChange={setAutoRestart}
          testid="setting-auto-restart"
        />
      </Section>

      <Section icon={Database} title="Datos de demostración">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-200">Regenerar agentes de ejemplo</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              Reinicia todos los agentes y el uso a un conjunto de datos de demostración limpio.
            </div>
          </div>
          <Button
            onClick={reseed}
            disabled={busy}
            data-testid="settings-reseed"
            variant="ghost"
            className="border border-zinc-800 text-zinc-200 hover:bg-zinc-900"
          >
            <RotateCw className={`h-4 w-4 mr-2 ${busy ? "animate-spin" : ""}`} />
            Regenerar
          </Button>
        </div>
      </Section>
    </div>
  );
}

const Section = ({ icon: Icon, title, children }) => (
  <div className="rounded-md border border-zinc-800 bg-zinc-900/40">
    <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800">
      <Icon className="h-4 w-4 text-zinc-400" strokeWidth={1.6} />
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">{title}</div>
    </div>
    <div className="p-5 space-y-5">{children}</div>
  </div>
);

const Toggle = ({ label, desc, value, onChange, testid }) => (
  <div className="flex items-start justify-between gap-6">
    <div>
      <div className="text-sm text-zinc-200">{label}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
    </div>
    <Switch checked={value} onCheckedChange={onChange} data-testid={testid} />
  </div>
);
