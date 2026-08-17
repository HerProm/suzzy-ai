"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const PROFESSIONAL_TYPES = [
  { id: "autonomo", label: "Corretor autônomo" },
  { id: "imobiliaria", label: "Imobiliária" },
] as const;

const GENERIC_ERROR_MESSAGE =
  "Não foi possível salvar seu cadastro. Tente novamente.";

const FIELD_LABEL_CLASS = "text-sm font-medium text-slate-700";
const FIELD_INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function ProfileForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [creciNumber, setCreciNumber] = useState("");
  const [creciUf, setCreciUf] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [professionalType, setProfessionalType] = useState<
    (typeof PROFESSIONAL_TYPES)[number]["id"] | null
  >(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled =
    fullName.trim() === "" ||
    creciNumber.trim() === "" ||
    creciUf === "" ||
    city.trim() === "" ||
    state === "" ||
    professionalType === null ||
    !termsAccepted ||
    !privacyAccepted;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isDisabled || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone: phone.trim() === "" ? undefined : phone,
          creciNumber,
          creciUf,
          city,
          state,
          professionalType,
          termsAccepted,
          privacyAccepted,
          marketingConsent,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
        return;
      }

      const data = await res.json();
      setError(data.error ?? GENERIC_ERROR_MESSAGE);
    } catch {
      setError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className={FIELD_LABEL_CLASS}>
          Nome completo
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className={FIELD_INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className={FIELD_LABEL_CLASS}>
          Telefone/WhatsApp{" "}
          <span className="font-normal text-slate-400">(opcional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 91234-5678"
          className={FIELD_INPUT_CLASS}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="creciNumber" className={FIELD_LABEL_CLASS}>
            CRECI
          </label>
          <input
            id="creciNumber"
            type="text"
            value={creciNumber}
            onChange={(e) => setCreciNumber(e.target.value)}
            required
            className={FIELD_INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="creciUf" className={FIELD_LABEL_CLASS}>
            UF do CRECI
          </label>
          <select
            id="creciUf"
            value={creciUf}
            onChange={(e) => setCreciUf(e.target.value)}
            required
            className={FIELD_INPUT_CLASS}
          >
            <option value="">Selecione</option>
            {UF_OPTIONS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="-mt-4 text-xs text-slate-400">
        O número do CRECI é informado por você e não passa por verificação
        automática junto a nenhum órgão regulador nesta versão da
        plataforma.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className={FIELD_LABEL_CLASS}>
            Cidade de atuação
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className={FIELD_INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="state" className={FIELD_LABEL_CLASS}>
            Estado de atuação
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className={FIELD_INPUT_CLASS}
          >
            <option value="">Selecione</option>
            {UF_OPTIONS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={FIELD_LABEL_CLASS}>Como você atua?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PROFESSIONAL_TYPES.map(({ id, label }) => (
            <label
              key={id}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                professionalType === id
                  ? "border-slate-900 bg-slate-50 text-slate-900"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="professionalType"
                value={id}
                checked={professionalType === id}
                onChange={() => setProfessionalType(id)}
                className="h-4 w-4 accent-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
        <label className="flex items-start gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 accent-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          />
          <span>
            Li e aceito os{" "}
            <Link
              href="/termos"
              target="_blank"
              className="font-medium text-slate-900 underline underline-offset-2"
            >
              Termos de Uso
            </Link>
            .
          </span>
        </label>

        <label className="flex items-start gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 accent-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          />
          <span>
            Li e aceito a{" "}
            <Link
              href="/privacidade"
              target="_blank"
              className="font-medium text-slate-900 underline underline-offset-2"
            >
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4">
        <label className="flex items-start gap-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          />
          <span>
            Quero receber novidades e comunicações da SUZZY AI por e-mail
            (opcional — você pode mudar de ideia quando quiser).
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isDisabled || isLoading}
          aria-busy={isLoading}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Salvando..." : "Concluir cadastro"}
        </button>

        {error && (
          <p className="animate-fade-in rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
