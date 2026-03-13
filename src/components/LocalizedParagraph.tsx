import { Lang, LocalizedText } from "@/lib/types";
import { translate } from "@/lib/i18n";

export function LocalizedParagraph({ lang, text }: { lang: Lang; text: LocalizedText }) {
  return <p className="leading-relaxed text-brand-ink/85">{translate(lang, text)}</p>;
}
