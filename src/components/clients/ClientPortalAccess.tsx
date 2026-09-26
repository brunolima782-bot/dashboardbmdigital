"use client";

import { useState, useEffect } from "react";
import { KeyRound, Loader2, Save, Trash2, Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Access = { id: string; email: string } | null;

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export default function ClientPortalAccess({
  clientId,
  suggestedEmail,
}: {
  clientId: string;
  suggestedEmail: string;
}) {
  const { showToast } = useToast();
  const [access, setAccess] = useState<Access>(null);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(suggestedEmail);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [lastCreated, setLastCreated] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${clientId}/portal-access`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setAccess(data);
          setEmail(data.email);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  function startEdit() {
    setPassword(generatePassword());
    setEditing(true);
    setLastCreated(null);
  }

  async function handleSave() {
    if (!password || password.length < 6) {
      showToast("A senha precisa ter pelo menos 6 caracteres", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/portal-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao criar acesso", "error");
        return;
      }
      setAccess(data);
      setLastCreated({ email, password });
      setEditing(false);
      showToast("Acesso do cliente salvo!", "success");
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/portal-access`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Erro ao remover acesso", "error");
        return;
      }
      setAccess(null);
      setLastCreated(null);
      showToast("Acesso removido", "success");
      setRemoveOpen(false);
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setRemoving(false);
    }
  }

  function copyCredentials() {
    if (!lastCreated) return;
    const text = `Acesso ao portal: ${typeof window !== "undefined" ? window.location.origin : ""}/login\nE-mail: ${lastCreated.email}\nSenha: ${lastCreated.password}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4.5 w-4.5 text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Portal do cliente</h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Crie um login para o cliente acessar sozinho o relatório dele — sem ver os outros clientes nem as
        telas de gestão da agência.
      </p>

      {!editing && access && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">Acesso ativo</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{access.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-sm" onClick={startEdit}>
              Redefinir senha
            </button>
            <button className="btn-danger text-sm" onClick={() => setRemoveOpen(true)}>
              <Trash2 className="h-4 w-4" /> Remover
            </button>
          </div>
        </div>
      )}

      {!editing && !access && (
        <button className="btn-primary" onClick={startEdit}>
          <KeyRound className="h-4 w-4" /> Criar acesso do cliente
        </button>
      )}

      {editing && (
        <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div>
            <label className="label">E-mail de login</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@empresa.com" />
          </div>
          <div>
            <label className="label">Senha</label>
            <div className="flex items-center gap-2">
              <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="btn-secondary px-3 py-2.5"
                title="Gerar senha aleatória"
              >
                <Wand2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setEditing(false)} disabled={saving}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar acesso
            </button>
          </div>
        </div>
      )}

      {lastCreated && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-500/5 p-4 space-y-2">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Envie esses dados para o cliente (a senha não aparece de novo depois):
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            E-mail: <span className="font-mono">{lastCreated.email}</span>
            <br />
            Senha: <span className="font-mono">{lastCreated.password}</span>
          </p>
          <button className="btn-secondary text-sm" onClick={copyCredentials}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado!" : "Copiar dados de acesso"}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={removeOpen}
        title="Remover acesso do cliente?"
        description="O cliente não vai mais conseguir entrar no portal com esse login."
        confirmLabel="Remover"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setRemoveOpen(false)}
      />
    </div>
  );
}
