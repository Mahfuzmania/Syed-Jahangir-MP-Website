import { SiteContent } from "@/lib/types";

const mojibakePattern = /(?:\u00C3|\u00C2|\u00E0\u00A6|\u00E0\u00A7|\u00E2\u0080|\u00EF\u00BB\u00BF)/;
const banglaPattern = /[\u0980-\u09FF]/;

function maybeDecodeMojibake(value: string) {
  if (!mojibakePattern.test(value)) {
    return value;
  }

  const decoded = Buffer.from(value, "latin1").toString("utf8");
  if (decoded === value) {
    return value;
  }

  if (banglaPattern.test(decoded)) {
    return decoded;
  }

  return value;
}

function repairNode(node: unknown): unknown {
  if (typeof node === "string") {
    return maybeDecodeMojibake(node);
  }

  if (Array.isArray(node)) {
    return node.map((item) => repairNode(item));
  }

  if (!node || typeof node !== "object") {
    return node;
  }

  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    output[key] = repairNode(value);
  }
  return output;
}

export function repairSiteContentEncoding(content: SiteContent) {
  const repaired = repairNode(content) as SiteContent;
  const changed = JSON.stringify(repaired) !== JSON.stringify(content);
  return { repaired, changed };
}
