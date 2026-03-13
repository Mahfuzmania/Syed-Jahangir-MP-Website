import crypto from "crypto";
import { normalizeBanglaDigits } from "@/lib/contactValidation";

type CaptchaEntry = {
  answer: string;
  expiresAt: number;
};

const CAPTCHA_TTL_MS = 1000 * 60 * 5;
const captchaStore = new Map<string, CaptchaEntry>();

function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of captchaStore.entries()) {
    if (value.expiresAt <= now) {
      captchaStore.delete(key);
    }
  }
}

export function createCaptchaChallenge() {
  cleanupExpired();
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 2;
  const answer = String(left + right);
  const captchaId = crypto.randomUUID();

  captchaStore.set(captchaId, {
    answer,
    expiresAt: Date.now() + CAPTCHA_TTL_MS
  });

  return {
    captchaId,
    question: `${left} + ${right} = ?`,
    expiresInSeconds: Math.floor(CAPTCHA_TTL_MS / 1000)
  };
}

export function verifyCaptchaAnswer(input: { captchaId?: string; captchaAnswer?: string }) {
  cleanupExpired();

  if (!input.captchaId || !input.captchaAnswer) {
    return false;
  }

  const saved = captchaStore.get(input.captchaId);
  if (!saved) {
    return false;
  }

  captchaStore.delete(input.captchaId);
  const normalizedAnswer = normalizeBanglaDigits(input.captchaAnswer).trim();
  return normalizedAnswer === saved.answer;
}
