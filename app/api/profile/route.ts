import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_NAME_LENGTH = 200;
const MAX_PHONE_LENGTH = 30;
const MAX_CRECI_LENGTH = 30;
const MAX_CRECI_UF_LENGTH = 2;
const MAX_CITY_LENGTH = 100;
const MAX_STATE_LENGTH = 100;

const ALLOWED_PROFESSIONAL_TYPES = ["autonomo", "imobiliaria"] as const;
type ProfessionalType = (typeof ALLOWED_PROFESSIONAL_TYPES)[number];

// Os documentos-base ainda não têm um número de versão formal (Sprint
// 15-19) — usamos a data desta implementação como identificador
// provisório, só para registrar QUAL versão foi aceita (auditoria), nunca
// exibido ao usuário.
const TERMS_VERSION = "2026-08-15";
const PRIVACY_VERSION = "2026-08-15";

const INVALID_PAYLOAD_ERROR = "Dados inválidos enviados para o cadastro.";
const PROFILE_ERROR = "Não foi possível salvar seu cadastro. Tente novamente.";

function isProfessionalType(value: unknown): value is ProfessionalType {
  return (
    typeof value === "string" &&
    (ALLOWED_PROFESSIONAL_TYPES as readonly string[]).includes(value)
  );
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" && value.trim() !== "" && value.length <= maxLength
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return NextResponse.json(
      { error: "Sessão não encontrada. Faça login novamente." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: INVALID_PAYLOAD_ERROR }, { status: 400 });
  }

  const {
    fullName,
    phone,
    creciNumber,
    creciUf,
    city,
    state,
    professionalType,
    termsAccepted,
    privacyAccepted,
    marketingConsent,
  } = (body ?? {}) as {
    fullName?: unknown;
    phone?: unknown;
    creciNumber?: unknown;
    creciUf?: unknown;
    city?: unknown;
    state?: unknown;
    professionalType?: unknown;
    termsAccepted?: unknown;
    privacyAccepted?: unknown;
    marketingConsent?: unknown;
  };

  if (
    !isNonEmptyString(fullName, MAX_NAME_LENGTH) ||
    !isNonEmptyString(creciNumber, MAX_CRECI_LENGTH) ||
    !isNonEmptyString(creciUf, MAX_CRECI_UF_LENGTH) ||
    !isNonEmptyString(city, MAX_CITY_LENGTH) ||
    !isNonEmptyString(state, MAX_STATE_LENGTH) ||
    !isProfessionalType(professionalType) ||
    termsAccepted !== true ||
    privacyAccepted !== true
  ) {
    return NextResponse.json({ error: INVALID_PAYLOAD_ERROR }, { status: 400 });
  }

  // Telefone é opcional: undefined/null/string vazia viram `null` no banco.
  // Se algo foi enviado, precisa ser uma string válida dentro do limite.
  let phoneValue: string | null = null;
  if (phone !== undefined && phone !== null && phone !== "") {
    if (!isNonEmptyString(phone, MAX_PHONE_LENGTH)) {
      return NextResponse.json({ error: "Telefone inválido." }, { status: 400 });
    }
    phoneValue = phone.trim();
  }

  const acceptedAt = new Date().toISOString();
  const marketingConsentValue = marketingConsent === true;

  const { error } = await supabase.from("profiles").upsert({
    id: data.claims.sub,
    full_name: fullName.trim(),
    phone: phoneValue,
    creci_number: creciNumber.trim(),
    creci_uf: creciUf.trim().toUpperCase(),
    city: city.trim(),
    state: state.trim(),
    professional_type: professionalType,
    marketing_consent: marketingConsentValue,
    marketing_consent_at: marketingConsentValue ? acceptedAt : null,
    terms_accepted_at: acceptedAt,
    terms_version: TERMS_VERSION,
    privacy_accepted_at: acceptedAt,
    privacy_version: PRIVACY_VERSION,
  });

  if (error) {
    console.error(
      "[api/profile] Falha ao salvar perfil (tipo:",
      error.code ?? typeof error,
      ")",
    );
    return NextResponse.json({ error: PROFILE_ERROR }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
