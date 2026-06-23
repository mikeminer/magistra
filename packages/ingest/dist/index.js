import { createHash } from "node:crypto";
import { createChunk } from "@italian-oss-legal-platform/domain";
import { XMLParser } from "fast-xml-parser";
export const NORMATTIVA_LEGGE_241_ESEMPIO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="legge">
    <meta>
      <identification source="#normattiva">
        <FRBRWork>
          <FRBRthis value="/eli/it/stato/legge/1990/08/07/241" />
          <FRBRdate date="1990-08-07" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="241" />
          <FRBRname value="legge" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/eli/it/stato/legge/1990/08/07/241/ita@2020-01-01" />
          <FRBRdate date="2020-01-01" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>Legge 7 agosto 1990, n. 241 - Nuove norme in materia di procedimento amministrativo</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_1">
        <num>Art. 1</num>
        <heading>Principi generali dell'attivita amministrativa</heading>
        <paragraph eId="art_1__para_1">
          <num>1.</num>
          <content>
            <p>L'attivita amministrativa persegue i fini determinati dalla legge ed e retta da criteri di economicita, efficacia, imparzialita, pubblicita e trasparenza secondo le modalita previste dalla presente legge e dalle altre disposizioni che disciplinano singoli procedimenti.</p>
          </content>
        </paragraph>
      </article>
      <article eId="art_2">
        <num>Art. 2</num>
        <heading>Conclusione del procedimento</heading>
        <paragraph eId="art_2__para_1">
          <num>1.</num>
          <content>
            <p>Ove il procedimento consegua obbligatoriamente ad una istanza, ovvero debba essere iniziato d'ufficio, le pubbliche amministrazioni hanno il dovere di concluderlo mediante l'adozione di un provvedimento espresso.</p>
          </content>
        </paragraph>
      </article>
      <article eId="art_3">
        <num>Art. 3</num>
        <heading>Motivazione del provvedimento</heading>
        <paragraph eId="art_3__para_1">
          <num>1.</num>
          <content>
            <p>Ogni provvedimento amministrativo, compresi quelli concernenti l'organizzazione amministrativa, lo svolgimento dei pubblici concorsi ed il personale, deve essere motivato, salvo che nelle ipotesi previste dal comma 2. La motivazione deve indicare i presupposti di fatto e le ragioni giuridiche che hanno determinato la decisione dell'amministrazione, in relazione alle risultanze dell'istruttoria.</p>
          </content>
        </paragraph>
      </article>
      <article eId="art_22">
        <num>Art. 22</num>
        <heading>Definizioni e principi in materia di accesso</heading>
        <paragraph eId="art_22__para_1">
          <num>1.</num>
          <content>
            <p>Ai fini del presente capo si intende per diritto di accesso il diritto degli interessati di prendere visione e di estrarre copia di documenti amministrativi, ferme restando le discipline speciali sulla trasparenza amministrativa. <ref href="/eli/it/stato/decreto-legislativo/2013/03/14/33">Riferimento al decreto trasparenza</ref></p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
export const NORMATTIVA_LEGGE_241_STORICA_ESEMPIO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="legge">
    <meta>
      <identification source="#normattiva">
        <FRBRWork>
          <FRBRthis value="/eli/it/stato/legge/1990/08/07/241" />
          <FRBRdate date="1990-08-07" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="241" />
          <FRBRname value="legge" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/eli/it/stato/legge/1990/08/07/241/ita@1990-08-07" />
          <FRBRdate date="1990-08-07" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>Legge 7 agosto 1990, n. 241 - Versione storica dimostrativa</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_3">
        <num>Art. 3</num>
        <heading>Motivazione del provvedimento</heading>
        <paragraph eId="art_3__para_1">
          <num>1.</num>
          <content>
            <p>Ogni provvedimento amministrativo deve essere motivato, salvo che nelle ipotesi previste dal comma 2. La motivazione indica i presupposti di fatto e le ragioni giuridiche che hanno determinato la decisione dell'amministrazione.</p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
export const NORMATTIVA_DECRETO_33_ESEMPIO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="decreto-legislativo">
    <meta>
      <identification source="#normattiva">
        <FRBRWork>
          <FRBRthis value="/eli/it/stato/decreto-legislativo/2013/03/14/33" />
          <FRBRdate date="2013-03-14" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="33" />
          <FRBRname value="decreto-legislativo" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/eli/it/stato/decreto-legislativo/2013/03/14/33/ita@2024-01-01" />
          <FRBRdate date="2024-01-01" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>Decreto legislativo 14 marzo 2013, n. 33 - Riordino della disciplina riguardante gli obblighi di pubblicita, trasparenza e diffusione di informazioni da parte delle pubbliche amministrazioni</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_5">
        <num>Art. 5</num>
        <heading>Accesso civico a dati e documenti</heading>
        <paragraph eId="art_5__para_1">
          <num>1.</num>
          <content>
            <p>L'obbligo previsto dalla normativa vigente in capo alle pubbliche amministrazioni di pubblicare documenti, informazioni o dati comporta il diritto di chiunque di richiederli nei casi in cui sia stata omessa la loro pubblicazione.</p>
          </content>
        </paragraph>
        <paragraph eId="art_5__para_2">
          <num>2.</num>
          <content>
            <p>Allo scopo di favorire forme diffuse di controllo sul perseguimento delle funzioni istituzionali e sull'utilizzo delle risorse pubbliche, chiunque ha diritto di accedere ai dati e ai documenti detenuti dalle pubbliche amministrazioni, ulteriori rispetto a quelli oggetto di pubblicazione, nel rispetto dei limiti relativi alla tutela di interessi giuridicamente rilevanti.</p>
          </content>
        </paragraph>
      </article>
      <article eId="art_5_bis">
        <num>Art. 5-bis</num>
        <heading>Esclusioni e limiti all'accesso civico</heading>
        <paragraph eId="art_5_bis__para_1">
          <num>1.</num>
          <content>
            <p>L'accesso civico e rifiutato se il diniego e necessario per evitare un pregiudizio concreto alla tutela di interessi pubblici inerenti, tra gli altri, la sicurezza pubblica, l'ordine pubblico e la sicurezza nazionale, ferme le garanzie procedimentali sull'accesso ai documenti amministrativi. <ref href="/eli/it/stato/legge/1990/08/07/241/articolo/22">Riferimento alla legge sul procedimento amministrativo</ref></p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
export const NORMATTIVA_CODICE_CIVILE_ESEMPIO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="codice">
    <meta>
      <identification source="#normattiva">
        <FRBRWork>
          <FRBRthis value="/eli/it/stato/codice/civile/1942/03/16" />
          <FRBRdate date="1942-03-16" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="262" />
          <FRBRname value="codice" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/eli/it/stato/codice/civile/1942/03/16/ita@2024-01-01" />
          <FRBRdate date="2024-01-01" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>Codice civile - Estratto dimostrativo</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_2043">
        <num>Art. 2043</num>
        <heading>Risarcimento per fatto illecito</heading>
        <paragraph eId="art_2043__para_1">
          <num>1.</num>
          <content>
            <p>Qualunque fatto doloso o colposo, che cagiona ad altri un danno ingiusto, obbliga colui che ha commesso il fatto a risarcire il danno.</p>
          </content>
        </paragraph>
      </article>
      <article eId="art_2697">
        <num>Art. 2697</num>
        <heading>Onere della prova</heading>
        <paragraph eId="art_2697__para_1">
          <num>1.</num>
          <content>
            <p>Chi vuol far valere un diritto in giudizio deve provare i fatti che ne costituiscono il fondamento.</p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
export const NORMATTIVA_CODICE_PENALE_ESEMPIO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="altro">
    <meta>
      <identification source="#normattiva">
        <FRBRWork>
          <FRBRthis value="/eli/it/stato/regio-decreto/1930/10/19/1398" />
          <FRBRdate date="1930-10-19" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="1398" />
          <FRBRname value="altro" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/eli/it/stato/regio-decreto/1930/10/19/1398/ita@2024-01-01" />
          <FRBRdate date="2024-01-01" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>Codice penale - Estratto dimostrativo</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_5">
        <num>Art. 5</num>
        <heading>Ignoranza della legge penale</heading>
        <paragraph eId="art_5__para_1">
          <num>1.</num>
          <content>
            <p>Nessuno puo invocare a propria scusa l'ignoranza della legge penale.</p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
export const NORMATTIVA_LEGGE_604_ESEMPIO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="legge">
    <meta>
      <identification source="#normattiva">
        <FRBRWork>
          <FRBRthis value="/eli/it/stato/legge/1966/07/15/604" />
          <FRBRdate date="1966-07-15" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="604" />
          <FRBRname value="legge" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/eli/it/stato/legge/1966/07/15/604/ita@2024-01-01" />
          <FRBRdate date="2024-01-01" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>Legge 15 luglio 1966, n. 604 - Norme sui licenziamenti individuali</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_6">
        <num>Art. 6</num>
        <heading>Impugnazione del licenziamento</heading>
        <paragraph eId="art_6__para_1">
          <num>1.</num>
          <content>
            <p>Il licenziamento deve essere impugnato a pena di decadenza entro sessanta giorni dalla ricezione della sua comunicazione in forma scritta, ovvero dalla comunicazione, anch'essa in forma scritta, dei motivi, ove non contestuale, con qualsiasi atto scritto, anche extragiudiziale, idoneo a rendere nota la volonta del lavoratore anche attraverso l'intervento dell'organizzazione sindacale diretto ad impugnare il licenziamento stesso.</p>
          </content>
        </paragraph>
        <paragraph eId="art_6__para_2">
          <num>2.</num>
          <content>
            <p>L'impugnazione e inefficace se non e seguita, entro il successivo termine di centottanta giorni, dal deposito del ricorso nella cancelleria del tribunale in funzione di giudice del lavoro o dalla comunicazione alla controparte della richiesta di tentativo di conciliazione o arbitrato. Qualora la conciliazione o l'arbitrato richiesti siano rifiutati o non sia raggiunto l'accordo necessario al relativo espletamento, il ricorso al giudice deve essere depositato entro sessanta giorni dal rifiuto o dal mancato accordo.</p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
export const NORMATTIVA_LEGGE_431_ESEMPIO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="legge">
    <meta>
      <identification source="#normattiva">
        <FRBRWork>
          <FRBRthis value="/eli/it/stato/legge/1998/12/09/431" />
          <FRBRdate date="1998-12-09" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="431" />
          <FRBRname value="legge" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/eli/it/stato/legge/1998/12/09/431/ita@2024-01-01" />
          <FRBRdate date="2024-01-01" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>Legge 9 dicembre 1998, n. 431 - Disciplina delle locazioni abitative</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_2">
        <num>Art. 2</num>
        <heading>Modalita di stipula e di rinnovo dei contratti di locazione</heading>
        <paragraph eId="art_2__para_1">
          <num>1.</num>
          <content>
            <p>Le parti possono stipulare contratti di locazione di durata non inferiore a quattro anni, decorsi i quali i contratti sono rinnovati per un periodo di quattro anni, fatti salvi i casi previsti dalla legge.</p>
          </content>
        </paragraph>
        <paragraph eId="art_2__para_3">
          <num>3.</num>
          <content>
            <p>In alternativa, le parti possono stipulare contratti di locazione definendo il valore del canone e la durata in base agli accordi locali, comunque per una durata non inferiore a tre anni; alla prima scadenza il contratto e prorogato di diritto per due anni salvo i casi previsti dalla legge.</p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
export const NORMATTIVA_LEGGE_392_ESEMPIO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="legge">
    <meta>
      <identification source="#normattiva">
        <FRBRWork>
          <FRBRthis value="/eli/it/stato/legge/1978/07/27/392" />
          <FRBRdate date="1978-07-27" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="392" />
          <FRBRname value="legge" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/eli/it/stato/legge/1978/07/27/392/ita@2024-01-01" />
          <FRBRdate date="2024-01-01" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>Legge 27 luglio 1978, n. 392 - Disciplina delle locazioni di immobili urbani</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_27">
        <num>Art. 27</num>
        <heading>Durata della locazione</heading>
        <paragraph eId="art_27__para_1">
          <num>1.</num>
          <content>
            <p>La durata delle locazioni e sublocazioni di immobili urbani non puo essere inferiore a sei anni se gli immobili sono adibiti ad attivita industriali, commerciali, artigianali o di interesse turistico.</p>
          </content>
        </paragraph>
        <paragraph eId="art_27__para_2">
          <num>2.</num>
          <content>
            <p>La durata della locazione non puo essere inferiore a nove anni se l'immobile urbano e adibito ad attivita alberghiere o assimilate.</p>
          </content>
        </paragraph>
        <paragraph eId="art_27__para_4">
          <num>4.</num>
          <content>
            <p>Se e convenuta una durata inferiore o non e convenuta alcuna durata, la locazione si intende pattuita per la durata rispettivamente prevista dai commi precedenti.</p>
          </content>
        </paragraph>
      </article>
      <article eId="art_28">
        <num>Art. 28</num>
        <heading>Rinnovazione del contratto</heading>
        <paragraph eId="art_28__para_1">
          <num>1.</num>
          <content>
            <p>Per le locazioni di immobili nei quali siano esercitate le attivita indicate nell'articolo 27, il contratto si rinnova tacitamente di sei anni in sei anni e, per gli immobili adibiti ad attivita alberghiere, di nove anni in nove anni, salvo disdetta nei termini di legge.</p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
export const EURLEX_TFUE_ART_288_ESEMPIO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="trattato-ue">
    <meta>
      <identification source="#eurlex">
        <FRBRWork>
          <FRBRthis value="/eli/treaty/tfeu_2016/art_288/oj" />
          <FRBRdate date="2016-06-07" name="generation" />
          <FRBRauthor href="/eu" as="#autorita" />
          <FRBRnumber value="12016E288" />
          <FRBRname value="trattato-ue" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/eli/treaty/tfeu_2016/art_288/oj/ita@2016-06-07" />
          <FRBRdate date="2016-06-07" name="version" />
          <FRBRauthor href="/eu" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>Articolo 288 TFUE - Atti giuridici dell'Unione europea</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_288">
        <num>Art. 288</num>
        <heading>Atti giuridici dell'Unione europea</heading>
        <paragraph eId="art_288__para_1">
          <num>1.</num>
          <content>
            <p>Per esercitare le competenze dell'Unione, le istituzioni adottano regolamenti, direttive, decisioni, raccomandazioni e pareri.</p>
          </content>
        </paragraph>
        <paragraph eId="art_288__para_2">
          <num>2.</num>
          <content>
            <p>Il regolamento ha portata generale. Esso e obbligatorio in tutti i suoi elementi e direttamente applicabile in ciascuno degli Stati membri.</p>
          </content>
        </paragraph>
        <paragraph eId="art_288__para_3">
          <num>3.</num>
          <content>
            <p>La direttiva vincola lo Stato membro cui e rivolta per quanto riguarda il risultato da raggiungere, salva restando la competenza degli organi nazionali in merito alla forma e ai mezzi.</p>
          </content>
        </paragraph>
        <paragraph eId="art_288__para_4">
          <num>4.</num>
          <content>
            <p>La decisione e obbligatoria in tutti i suoi elementi. Se designa i destinatari e obbligatoria soltanto nei confronti di questi.</p>
          </content>
        </paragraph>
        <paragraph eId="art_288__para_5">
          <num>5.</num>
          <content>
            <p>Le raccomandazioni e i pareri non sono vincolanti.</p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
const DEFAULT_SOURCE_URL = "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1990-08-07;241";
const LEGGE_241_STORICA_SOURCE_URL = "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1990-08-07;241!vig=1990-08-07";
const DECRETO_33_SOURCE_URL = "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2013-03-14;33";
const CODICE_CIVILE_SOURCE_URL = "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262";
export const CODICE_PENALE_ART_5_SOURCE_URL = "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1930-10-19;1398";
const LEGGE_604_SOURCE_URL = "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1966-07-15;604";
export const LEGGE_431_ART_2_SOURCE_URL = "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1998-12-09;431";
export const LEGGE_392_ART_27_SOURCE_URL = "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1978-07-27;392";
export const EURLEX_TFUE_ART_288_SOURCE_URL = "https://eur-lex.europa.eu/legal-content/IT/TXT/HTML/?uri=CELEX%3A12016E288";
const parser = new XMLParser({
    attributeNamePrefix: "@_",
    ignoreAttributes: false,
    parseAttributeValue: false,
    parseTagValue: false,
    preserveOrder: false,
    removeNSPrefix: true,
    textNodeName: "#text",
    trimValues: true
});
export const DOCUMENTI_NORMATTIVA_ESEMPIO = [
    {
        xml: NORMATTIVA_LEGGE_241_ESEMPIO_XML,
        fonte: "Normattiva",
        sourceUrl: DEFAULT_SOURCE_URL
    },
    {
        xml: NORMATTIVA_LEGGE_241_STORICA_ESEMPIO_XML,
        fonte: "Normattiva",
        sourceUrl: LEGGE_241_STORICA_SOURCE_URL,
        stato: "storica",
        vigenzaA: "2019-12-31"
    },
    {
        xml: NORMATTIVA_DECRETO_33_ESEMPIO_XML,
        fonte: "Normattiva",
        sourceUrl: DECRETO_33_SOURCE_URL
    },
    {
        xml: NORMATTIVA_CODICE_CIVILE_ESEMPIO_XML,
        fonte: "Normattiva",
        sourceUrl: CODICE_CIVILE_SOURCE_URL
    },
    {
        xml: NORMATTIVA_CODICE_PENALE_ESEMPIO_XML,
        fonte: "Normattiva",
        sourceUrl: CODICE_PENALE_ART_5_SOURCE_URL
    },
    {
        xml: NORMATTIVA_LEGGE_604_ESEMPIO_XML,
        fonte: "Normattiva",
        sourceUrl: LEGGE_604_SOURCE_URL
    },
    {
        xml: NORMATTIVA_LEGGE_431_ESEMPIO_XML,
        fonte: "Normattiva",
        sourceUrl: LEGGE_431_ART_2_SOURCE_URL
    },
    {
        xml: NORMATTIVA_LEGGE_392_ESEMPIO_XML,
        fonte: "Normattiva",
        sourceUrl: LEGGE_392_ART_27_SOURCE_URL
    }
];
export const DOCUMENTI_EURLEX_BASE = [
    {
        artifactId: "eurlex:tfue-art-288:ita",
        fonte: "EUR-Lex",
        sourceUrl: EURLEX_TFUE_ART_288_SOURCE_URL,
        xml: EURLEX_TFUE_ART_288_ESEMPIO_XML
    }
];
export function parseCorpusNormattivaEsempio(xml) {
    if (!xml) {
        return parseDocumentiNormattivaEsempio();
    }
    return parseAkomaNtosoDocument(xml, {
        fonte: "Normattiva",
        sourceUrl: DEFAULT_SOURCE_URL
    });
}
export function parseLegge241Esempio() {
    return parseAkomaNtosoDocument(NORMATTIVA_LEGGE_241_ESEMPIO_XML, {
        fonte: "Normattiva",
        sourceUrl: DEFAULT_SOURCE_URL
    });
}
export function parseCorpusEurLexBase(documenti = DOCUMENTI_EURLEX_BASE) {
    return parseDocumentiAkomaNtoso(documenti);
}
export function parseCorpusDimostrativo() {
    return aggregaCorporaNormativi([
        parseDocumentiNormattivaEsempio(),
        parseCorpusEurLexBase()
    ]);
}
export function parseDocumentiNormattivaEsempio(documenti = DOCUMENTI_NORMATTIVA_ESEMPIO) {
    const corpora = documenti.map((documento) => parseAkomaNtosoDocument(documento.xml, {
        artifactId: documento.artifactId,
        fonte: documento.fonte,
        sourceUrl: documento.sourceUrl,
        stato: documento.stato,
        vigenzaA: documento.vigenzaA
    }));
    return aggregaCorporaNormativi(corpora);
}
export function parseDocumentiAkomaNtoso(documenti) {
    const corpora = documenti.map((documento) => parseAkomaNtosoDocument(documento.xml, {
        artifactId: documento.artifactId,
        fonte: documento.fonte,
        sourceUrl: documento.sourceUrl,
        stato: documento.stato,
        vigenzaA: documento.vigenzaA
    }));
    return aggregaCorporaNormativi(corpora);
}
export function parseAkomaNtosoDocument(xml, options = {}) {
    const root = asRecord(parser.parse(xml), "documento XML");
    const akomaNtoso = getRecord(root, "akomaNtoso");
    const act = getRecord(akomaNtoso, "act");
    const meta = getRecord(act, "meta");
    const identification = getRecord(meta, "identification");
    const work = getRecord(identification, "FRBRWork");
    const expression = getRecord(identification, "FRBRExpression");
    const body = getRecord(act, "body");
    const hash = createHash("sha256").update(xml, "utf8").digest("hex");
    const fonte = options.fonte ?? "Normattiva";
    const sourceUrl = options.sourceUrl ?? DEFAULT_SOURCE_URL;
    const tipoAtto = toActType(readAttribute(work.FRBRname, "value") ?? readAttribute(act, "name") ?? "altro");
    const eli = requireText(readAttribute(work.FRBRthis, "value"), "ELI Work");
    const numero = requireText(readAttribute(work.FRBRnumber, "value"), "numero atto");
    const data = requireText(readAttribute(work.FRBRdate, "date"), "data atto");
    const vigenzaDa = requireText(readAttribute(expression.FRBRdate, "date"), "data versione");
    const expressionEli = readAttribute(expression.FRBRthis, "value") ?? `${eli}/ita@${vigenzaDa}`;
    const artifactId = options.artifactId ?? `normattiva:${hash.slice(0, 16)}`;
    const norma = {
        eli,
        tipoAtto,
        numero,
        data,
        titolo: extractTitle(act) ?? `${tipoAtto} ${numero} del ${data}`,
        fonte
    };
    const versione = {
        id: `versione:${expressionEli}`,
        normaEli: eli,
        vigenzaDa,
        vigenzaA: options.vigenzaA,
        stato: options.stato ?? "vigente"
    };
    const artefatto = {
        id: artifactId,
        fonte,
        formato: "akn+xml",
        sha256: hash,
        urlFonte: sourceUrl,
        dimensioneByte: Buffer.byteLength(xml, "utf8")
    };
    const manifestazione = {
        formato: "akn+xml",
        id: `manifestazione:${artifactId}`,
        sha256: hash,
        urlFonte: sourceUrl,
        versioneId: versione.id
    };
    const itemFonte = {
        dimensioneByte: artefatto.dimensioneByte,
        id: `item:${artifactId}`,
        manifestazioneId: manifestazione.id
    };
    const documentoFonte = {
        artefatto,
        contenuto: xml,
        contentType: "application/akn+xml",
        nomeFile: `${sanitizeFileName(artifactId)}.xml`
    };
    const unita = [];
    const chunks = [];
    const riferimenti = [];
    for (const article of getRecordArray(body, "article")) {
        const articolo = cleanLegalNumber(extractText(article.num), "articolo");
        const heading = normalizzaTestoGiuridico(extractText(article.heading));
        for (const paragraph of getRecordArray(article, "paragraph")) {
            const comma = cleanLegalNumber(extractText(paragraph.num), "comma");
            const content = paragraph.content ?? paragraph;
            const testo = normalizzaTestoGiuridico([heading, extractText(content)].filter(Boolean).join(". "));
            const percorso = `articolo/${articolo}/comma/${comma}`;
            const eliUnita = `${eli}/${percorso}`;
            const unitaId = `${versione.id}:${percorso}`;
            const unit = {
                id: unitaId,
                versioneId: versione.id,
                tipo: "comma",
                numero: `art. ${articolo}, comma ${comma}`,
                percorso,
                testo,
                eliUnita
            };
            const chunk = createChunk({
                id: `chunk:${unitaId}`,
                unitaId,
                testo,
                metadati: {
                    eli: eliUnita,
                    fonte,
                    tipoAtto,
                    numeroAtto: numero,
                    dataAtto: data,
                    articolo,
                    comma,
                    vigenzaDa,
                    vigenzaA: options.vigenzaA,
                    urlFonte: `${sourceUrl}#${percorso.replaceAll("/", "-")}`,
                    idArtefattoFonte: artefatto.id
                }
            });
            unita.push(unit);
            chunks.push(chunk);
            for (const riferimento of collectReferences(content, testo)) {
                riferimenti.push({
                    daEli: eliUnita,
                    aEli: riferimento.aEli,
                    confidenza: riferimento.confidenza,
                    fonteEstrazione: riferimento.fonteEstrazione,
                    testoMatch: riferimento.testoMatch,
                    tipo: riferimento.tipo
                });
            }
        }
    }
    return {
        artefatto,
        artefatti: [artefatto],
        manifestazioni: [manifestazione],
        itemsFonte: [itemFonte],
        norma,
        norme: [norma],
        versione,
        versioni: [versione],
        documentiFonte: [documentoFonte],
        unita,
        chunks,
        riferimenti
    };
}
export function creaManifestoIngest(corpus, generatoIl = new Date().toISOString()) {
    return {
        formato: "italian-oss-legal-platform.ingest.v1",
        generatoIl,
        fonte: corpus.norma.fonte,
        artefatto: corpus.artefatto,
        norma: corpus.norma,
        versione: corpus.versione,
        conteggi: {
            norme: corpus.norme.length,
            versioni: corpus.versioni.length,
            manifestazioni: corpus.manifestazioni.length,
            itemsFonte: corpus.itemsFonte.length,
            artefatti: corpus.artefatti.length,
            unita: corpus.unita.length,
            chunks: corpus.chunks.length,
            riferimenti: corpus.riferimenti.length
        },
        artefatti: corpus.artefatti,
        manifestazioni: corpus.manifestazioni,
        itemsFonte: corpus.itemsFonte,
        norme: corpus.norme,
        versioni: corpus.versioni,
        unita: corpus.unita,
        chunks: corpus.chunks,
        riferimenti: corpus.riferimenti
    };
}
export function normalizzaTestoGiuridico(input) {
    return input.replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
}
export function aggregaCorporaNormativi(corpora) {
    const primo = corpora[0];
    if (!primo) {
        throw new Error("Il corpus Normattiva di esempio richiede almeno un documento.");
    }
    return {
        artefatto: primo.artefatto,
        artefatti: uniqueBy(corpora.flatMap((corpus) => corpus.artefatti), (artefatto) => artefatto.id),
        manifestazioni: uniqueBy(corpora.flatMap((corpus) => corpus.manifestazioni), (manifestazione) => manifestazione.id),
        itemsFonte: uniqueBy(corpora.flatMap((corpus) => corpus.itemsFonte), (item) => item.id),
        norma: primo.norma,
        norme: uniqueBy(corpora.flatMap((corpus) => corpus.norme), (norma) => norma.eli),
        versione: primo.versione,
        versioni: uniqueBy(corpora.flatMap((corpus) => corpus.versioni), (versione) => versione.id),
        documentiFonte: corpora.flatMap((corpus) => corpus.documentiFonte),
        unita: corpora.flatMap((corpus) => corpus.unita),
        chunks: corpora.flatMap((corpus) => corpus.chunks),
        riferimenti: corpora.flatMap((corpus) => corpus.riferimenti)
    };
}
function uniqueBy(items, keyFor) {
    const seen = new Set();
    const output = [];
    for (const item of items) {
        const key = keyFor(item);
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        output.push(item);
    }
    return output;
}
function sanitizeFileName(value) {
    return value.replace(/[^a-z0-9._-]+/gi, "_").replace(/^_+|_+$/g, "");
}
function asRecord(value, label) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }
    throw new Error(`Nodo AKN mancante o non valido: ${label}`);
}
function getRecord(record, key) {
    return asRecord(record[key], key);
}
function getRecordArray(record, key) {
    const value = record[key];
    if (Array.isArray(value)) {
        return value.map((item) => asRecord(item, key));
    }
    if (value && typeof value === "object") {
        return [asRecord(value, key)];
    }
    return [];
}
function readAttribute(value, name) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }
    const attribute = value[`@_${name}`];
    return typeof attribute === "string" && attribute.trim().length > 0
        ? attribute.trim()
        : undefined;
}
function requireText(value, label) {
    if (!value) {
        throw new Error(`Valore AKN obbligatorio mancante: ${label}`);
    }
    return value;
}
function extractTitle(act) {
    const preface = act.preface;
    const title = findTextByKey(preface, "docTitle");
    const normalized = normalizzaTestoGiuridico(title);
    return normalized.length > 0 ? normalized : undefined;
}
function findTextByKey(value, key) {
    if (!value) {
        return "";
    }
    if (Array.isArray(value)) {
        return value.map((item) => findTextByKey(item, key)).join(" ");
    }
    if (typeof value !== "object") {
        return "";
    }
    const record = value;
    if (record[key]) {
        return extractText(record[key]);
    }
    return Object.entries(record)
        .filter(([entryKey]) => !entryKey.startsWith("@_"))
        .map(([, entryValue]) => findTextByKey(entryValue, key))
        .join(" ");
}
function extractText(value) {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map(extractText).filter(Boolean).join(" ");
    }
    if (typeof value === "object") {
        return Object.entries(value)
            .filter(([key]) => !key.startsWith("@_"))
            .sort(([left], [right]) => {
            if (left === "#text") {
                return -1;
            }
            if (right === "#text") {
                return 1;
            }
            return 0;
        })
            .map(([, entryValue]) => extractText(entryValue))
            .filter(Boolean)
            .join(" ");
    }
    return "";
}
function cleanLegalNumber(value, label) {
    const match = value.match(/\d+(?:[-\s]?[a-z]+)?/i);
    if (!match?.[0]) {
        throw new Error(`Numero ${label} non riconosciuto: ${value}`);
    }
    return match[0].replace(/\s+/g, "-").toLowerCase();
}
function collectReferences(value, testoNormalizzato) {
    const references = new Map();
    for (const reference of collectEliReferences(value)) {
        upsertReferenceCandidate(references, {
            aEli: reference.aEli,
            confidenza: 0.95,
            fonteEstrazione: "akn-ref",
            testoMatch: reference.testoMatch,
            tipo: classificaTipoRiferimento(testoNormalizzato, reference.aEli)
        });
    }
    for (const reference of collectTextReferences(testoNormalizzato)) {
        upsertReferenceCandidate(references, reference);
    }
    return [...references.values()];
}
function upsertReferenceCandidate(references, candidate) {
    const existing = references.get(candidate.aEli);
    if (!existing) {
        references.set(candidate.aEli, candidate);
        return;
    }
    references.set(candidate.aEli, {
        ...existing,
        ...candidate,
        confidenza: Math.max(existing.confidenza ?? 0, candidate.confidenza ?? 0),
        fonteEstrazione: existing.fonteEstrazione === "akn-ref" ? existing.fonteEstrazione : candidate.fonteEstrazione,
        tipo: existing.tipo === "rinvio" ? candidate.tipo : existing.tipo
    });
}
function collectEliReferences(value, references = new Map()) {
    if (!value) {
        return [];
    }
    if (Array.isArray(value)) {
        value.forEach((item) => collectEliReferences(item, references));
        return mapEliReferenceEntries(references);
    }
    if (typeof value === "object") {
        const record = value;
        const href = readAttribute(record, "href");
        if (href && isSupportedEliReference(href)) {
            const testo = normalizzaTestoGiuridico(extractText(record));
            references.set(href, testo);
        }
        Object.entries(record)
            .filter(([key]) => !key.startsWith("@_"))
            .forEach(([, entryValue]) => collectEliReferences(entryValue, references));
    }
    return mapEliReferenceEntries(references);
}
function mapEliReferenceEntries(references) {
    return [...references.entries()].map(([aEli, testoMatch]) => ({
        aEli,
        testoMatch: testoMatch === aEli ? undefined : testoMatch
    }));
}
function isSupportedEliReference(value) {
    return /^\/eli\/(?:it\/|reg\/|dir\/|dec\/|treaty\/)/.test(value);
}
function collectTextReferences(testo) {
    const references = [];
    const normReferenceRegex = /\b(legge|decreto legislativo|decreto-legislativo|decreto legge|decreto-legge|regio decreto|regolamento)\s+(\d{1,2})\s+([a-zàéèìòù]+)\s+(\d{4}),?\s+n\.?\s+([0-9]+(?:\/[A-Z]+)?)/gi;
    const euYearFirstRegex = /\b(regolamento|direttiva|decisione)\s*(?:\((UE|CE|CEE)\))?\s*(?:n\.?\s*)?(\d{4})\/(\d+)\b/gi;
    const euNumberFirstRegex = /\b(regolamento|direttiva|decisione)\s*(?:\((UE|CE|CEE)\))?\s*(?:n\.?\s*)?(\d+)\/(\d{4})\b/gi;
    for (const match of testo.matchAll(normReferenceRegex)) {
        const tipo = normalizzaTipoAttoPerEli(match[1] ?? "altro");
        const giorno = pad2(Number(match[2]));
        const mese = meseItaliano(match[3] ?? "");
        const anno = match[4];
        const numero = match[5];
        if (!anno || !mese || !numero) {
            continue;
        }
        const aEli = `/eli/it/stato/${tipo}/${anno}/${mese}/${giorno}/${numero}`;
        references.push({
            aEli,
            confidenza: 0.72,
            fonteEstrazione: "testo-regex",
            testoMatch: normalizzaTestoGiuridico(match[0] ?? ""),
            tipo: classificaTipoRiferimento(testo, aEli)
        });
    }
    for (const match of testo.matchAll(euYearFirstRegex)) {
        const tipo = normalizzaTipoAttoEuropeoPerEli(match[1] ?? "");
        const anno = match[3];
        const numero = match[4];
        if (!tipo || !anno || !numero) {
            continue;
        }
        const aEli = `/eli/${tipo}/${anno}/${numero}/oj`;
        references.push({
            aEli,
            confidenza: 0.74,
            fonteEstrazione: "testo-regex",
            testoMatch: normalizzaTestoGiuridico(match[0] ?? ""),
            tipo: classificaTipoRiferimento(testo, aEli)
        });
    }
    for (const match of testo.matchAll(euNumberFirstRegex)) {
        const tipo = normalizzaTipoAttoEuropeoPerEli(match[1] ?? "");
        const numero = match[3];
        const anno = match[4];
        if (!tipo || !anno || !numero || sembraAnno(numero)) {
            continue;
        }
        const aEli = `/eli/${tipo}/${anno}/${numero}/oj`;
        references.push({
            aEli,
            confidenza: 0.74,
            fonteEstrazione: "testo-regex",
            testoMatch: normalizzaTestoGiuridico(match[0] ?? ""),
            tipo: classificaTipoRiferimento(testo, aEli)
        });
    }
    return uniqueBy(references, (reference) => reference.aEli);
}
function sembraAnno(value) {
    const anno = Number(value);
    return Number.isInteger(anno) && anno >= 1900 && anno <= 2099;
}
function classificaTipoRiferimento(testo, targetEli) {
    const normalized = testo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    if (/\babrog\w*/.test(normalized)) {
        return "abrogazione";
    }
    if (/\b(modific\w*|sostitui\w*|integra\w*)/.test(normalized)) {
        return "modifica";
    }
    if (isEurLexEli(targetEli) &&
        /\b(recep\w*|attuaz\w*|adegu\w*|union\w* europea|ue)\b/.test(normalized)) {
        return "recepimento-ue";
    }
    return "rinvio";
}
function isEurLexEli(value) {
    return /^\/eli\/(?:reg|dir|dec|treaty)\//.test(value);
}
function normalizzaTipoAttoPerEli(value) {
    const normalized = value.toLowerCase().replace(/\s+/g, "-");
    if (normalized === "decreto-legislativo") {
        return "decreto-legislativo";
    }
    if (normalized === "decreto-legge") {
        return "decreto-legge";
    }
    if (normalized === "regio-decreto") {
        return "regio-decreto";
    }
    if (normalized === "regolamento") {
        return "regolamento";
    }
    return normalized === "legge" ? "legge" : "altro";
}
function normalizzaTipoAttoEuropeoPerEli(value) {
    const normalized = value.toLowerCase();
    if (normalized === "regolamento") {
        return "reg";
    }
    if (normalized === "direttiva") {
        return "dir";
    }
    if (normalized === "decisione") {
        return "dec";
    }
    return undefined;
}
function meseItaliano(value) {
    const months = {
        gennaio: "01",
        febbraio: "02",
        marzo: "03",
        aprile: "04",
        maggio: "05",
        giugno: "06",
        luglio: "07",
        agosto: "08",
        settembre: "09",
        ottobre: "10",
        novembre: "11",
        dicembre: "12"
    };
    return months[value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")];
}
function pad2(value) {
    return String(value ?? 1).padStart(2, "0");
}
function toActType(value) {
    const normalized = value.trim().toLowerCase();
    if (normalized === "legge") {
        return "legge";
    }
    if (normalized === "decreto-legge") {
        return "decreto-legge";
    }
    if (normalized === "decreto-legislativo") {
        return "decreto-legislativo";
    }
    if (normalized === "codice") {
        return "codice";
    }
    if (normalized === "regolamento") {
        return "regolamento";
    }
    if (normalized === "trattato-ue") {
        return "trattato-ue";
    }
    return "altro";
}
export * from "./storage.js";
