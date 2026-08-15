import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Fluxo de e-mail/Magic Link (PKCE + SSR) — separado de app/auth/callback/route.ts
// (que continua dedicado ao OAuth) para não arriscar o Google, já validado em
// produção. Supabase envia este formato de link (token_hash + type) para
// confirmação por e-mail; é um mecanismo diferente do `code` usado pelo OAuth,
// por isso exige verifyOtp() em vez de exchangeCodeForSession().
//
// Só "email" é aceito: é o único tipo de OTP que este fluxo de login usa.
// Outros valores de EmailOtpType (signup, recovery, invite, email_change)
// não têm rota/fluxo implementado nesta aplicação e são rejeitados.
const ALLOWED_OTP_TYPES: EmailOtpType[] = ["email"];

function isAllowedOtpType(value: string | null): value is EmailOtpType {
  return value !== null && ALLOWED_OTP_TYPES.includes(value as EmailOtpType);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && isAllowedOtpType(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
