import assert from "node:assert/strict";
import { creaGeneratoreRispostaDaEnv } from "../packages/llm/dist/index.js";

const calls = [];
const previousFetch = globalThis.fetch;

globalThis.fetch = async (url, options) => {
  calls.push({
    body: JSON.parse(String(options.body)),
    headers: options.headers,
    url: String(url)
  });

  return new Response(
    JSON.stringify({
      choices: [
        {
          message: {
            content: "La fonte recuperata conferma il punto richiesto [F1]."
          }
        }
      ]
    }),
    {
      headers: {
        "content-type": "application/json"
      },
      status: 200
    }
  );
};

try {
  const generatore = creaGeneratoreRispostaDaEnv({
    MAGISTRA_IUREXA_BASE_URL: "http://127.0.0.1:4141/v1",
    MAGISTRA_IUREXA_MODEL: "iurexa-test",
    MAGISTRA_LLM_MAX_OUTPUT_TOKENS: "123",
    MAGISTRA_LLM_PROVIDER: "iurexa",
    MAGISTRA_LLM_TEMPERATURE: "0.2"
  });

  assert.equal(generatore.nome, "iurexa-local:iurexa-test");

  const risposta = await generatore.genera({
    domanda: "Quale termine si applica?",
    fonti: [
      {
        eli: "urn:nir:test",
        label: "Fonte test art. 1 comma 1",
        metadati: {
          articolo: "1",
          comma: "1",
          dataAtto: "2026-06-25",
          eli: "urn:nir:test",
          fonte: "Normattiva",
          numeroAtto: "1"
        },
        testo: "Il termine applicabile e di sessanta giorni.",
        urlFonte: "https://example.test/fonte"
      }
    ]
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "http://127.0.0.1:4141/v1/chat/completions");
  assert.equal(calls[0].body.model, "iurexa-test");
  assert.equal(calls[0].body.max_tokens, 123);
  assert.equal(calls[0].body.temperature, 0.2);
  assert.match(calls[0].body.messages[0].content, /fonti normative recuperate/);
  assert.match(calls[0].body.messages[1].content, /Fonte test art\. 1 comma 1/);
  assert.equal(risposta.modello, "iurexa-local:iurexa-test");
  assert.equal(risposta.testo, "La fonte recuperata conferma il punto richiesto [F1].");

  console.log("LLM provider tests: ok");
} finally {
  globalThis.fetch = previousFetch;
}
