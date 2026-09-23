import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  // Tests poke into loosely-typed JSON-LD objects.
  { files: ["tests/**"], rules: { "@typescript-eslint/no-explicit-any": "off" } },
  { ignores:[".next/**", "node_modules/**", "walkem-market-africa-main/**", "next-env.d.ts"] },
];

export default config;
