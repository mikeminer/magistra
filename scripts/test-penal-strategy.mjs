import assert from "node:assert/strict";
import { analizzaScenarioPenale, pianificaUrnNormattivaPerRecupero } from "../packages/backend/dist/index.js";
import { fontiCatalogabili } from "../packages/sources/dist/index.js";

function includesUrn(urns, fragment) {
  return urns.some((urn) => urn.includes(fragment));
}

const truffaUrns = pianificaUrnNormattivaPerRecupero(
  "truffa online con bonifico e restituzione parziale"
);
assert.ok(includesUrn(truffaUrns, "regio.decreto:1930-10-19;1398~art640"));
assert.ok(includesUrn(truffaUrns, "regio.decreto:1930-10-19;1398~art62"));
assert.ok(includesUrn(truffaUrns, "regio.decreto:1930-10-19;1398~art133"));

const scenarioUrns = pianificaUrnNormattivaPerRecupero(
  "Conviene patteggiare o fare opposizione al decreto penale, valutando continuazione ex art. 81 c.p., incidente di esecuzione ex art. 671 c.p.p. e prescrizione?"
);
for (const expected of [
  "regio.decreto:1930-10-19;1398~art81",
  "regio.decreto:1930-10-19;1398~art157",
  "regio.decreto:1930-10-19;1398~art160",
  "regio.decreto:1930-10-19;1398~art161",
  "decreto.presidente.repubblica:1988-09-22;447~art444",
  "decreto.presidente.repubblica:1988-09-22;447~art445",
  "decreto.presidente.repubblica:1988-09-22;447~art459",
  "decreto.presidente.repubblica:1988-09-22;447~art461",
  "decreto.presidente.repubblica:1988-09-22;447~art671"
]) {
  assert.ok(includesUrn(scenarioUrns, expected), `missing ${expected}`);
}

const cassazione = fontiCatalogabili().find((fonte) => fonte.id === "cassazione-penale");
assert.equal(cassazione?.fonte, "Cassazione penale");
assert.equal(cassazione?.tipo, "giurisprudenza");

const scenario = analizzaScenarioPenale(
  "Scenario penale: decreto penale notificato il 10/06/2026, patteggiamento con pena base di 2 anni e 6 mesi, prescrizione per fatto commesso il 10/11/2024 con pena massima 3 anni. Il cliente ha precedenti specifici."
);
assert.equal(scenario?.materia, "penale");
assert.ok(scenario.opzioni.some((opzione) => opzione.id === "patteggiamento"));
assert.ok(scenario.opzioni.some((opzione) => opzione.id === "opposizione-decreto-penale"));
assert.ok(scenario.opzioni.some((opzione) => opzione.id === "prescrizione"));
assert.ok(scenario.calcoli.some((calcolo) => calcolo.nome === "Riduzione massima teorica patteggiamento"));
assert.ok(scenario.calcoli.some((calcolo) => calcolo.nome === "Scadenza indicativa opposizione decreto penale" && calcolo.risultato === "2026-06-25"));
assert.ok(scenario.calcoli.some((calcolo) => calcolo.nome === "Prescrizione base del delitto" && calcolo.risultato === "2030-11-10"));

console.log("Penal strategy tests: ok");
