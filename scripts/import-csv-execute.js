// Imports the 136 new emails (NEWSLETTER + SUBSTACK CSVs, deduped against
// what's already in Sender NG) into the Sender.net "Newsletter NeoGeneralista"
// group. Skips anyone already there (re-checks at runtime).
//
// Run: node --env-file .env.local scripts/import-csv-execute.js [--dry]

const SENDER_API = "https://api.sender.net/v2";
const NEWSLETTER_GROUP = "b8gqwj";
const DRY = process.argv.includes("--dry");

// Combined NEWSLETTER + SUBSTACK CSV data (email → {firstName, lastName}).
// Names extracted from the user-supplied CSVs; empty for entries without one.
const ENTRIES = [
  // NEWSLETTER (88)
  ["p.araujo.pinto@gmail.com","Pedro","Pinto"],
  ["sofiarochadecastro@gmail.com","Sofia","Castro"],
  ["lidiaaccastro@gmail.com","Lídia","Castro"],
  ["andreiasilvasantos.psi@gmail.com","Andreia","Santos"],
  ["shaini.ditt@gmail.com","Shaini","Dittberner"],
  ["ronnygasilo@gmail.com","Ronny","Gabriel Silva Lobato"],
  ["martaramos.neves@gmail.com","Marta","Neves"],
  ["imdanielamonteiro@gmail.com","Daniela","Monteiro"],
  ["al@serona.app","Armando","Leite"],
  ["msrogerio.santos@gmail.com","Rogerio","Santos"],
  ["ritamcorreia@gmail.com","Rita","Correia"],
  ["karmasoda9@gmail.com","Ana","Padilha"],
  ["lazaroplanche@gmail.com","lazaro","planche"],
  ["clarameireles@gmail.com","clara","meireles mendes"],
  ["darlyrf@gmail.com","Darly","RF"],
  ["anavilhena_2811@hotmail.com","Ana","Vilhena"],
  ["rute.grh@gmail.com","Rute","Domingues"],
  ["joanasmaia@gmail.com","Joana","Maia"],
  ["masbarroca@gmail.com","marisa","barroca"],
  ["alexandremeirelesmachado@gmail.com","Alexandre","Meireles Machado"],
  ["inesrochacastro5@gmail.com","Inês","Castro"],
  ["calvesporto79@gmail.com","Cristina","Alves"],
  ["pedromonteiro2001@gmail.com","Pedro","Monteiro"],
  ["joanasbba@gmail.com","Joana","Braga de Andrade"],
  ["renatogwt1234@gmail.com","Renato","Sousa Mesquita"],
  ["wczsaozqu@mozmail.com","José","Medeiros"],
  ["armando.leite@gmail.com","Armando","Leite"],
  ["barbaradamaso16@gmail.com","Bárbara","Roma"],
  ["valeriaribeirodiniz@gmail.com","Valéria","Ribeiro"],
  ["vascocostapinho@gmail.com","Vasco","Pinho"],
  ["bscruzpt@gmail.com","Bruno","Cruz"],
  ["perfilmgp@gmail.com","Marisa","Pedrosa"],
  ["miguel.carrapatoso@gmail.com","Miguel","Carrapatoso"],
  ["joelvfaria@gmail.com","Joel","Faria"],
  ["joana.lirio@gmail.com","Joana","Lírio"],
  // SUBSTACK (142, minus dedup)
  ["luisa.ferreira@fricon.pt","",""],
  ["silvamarianemota@gmail.com","Mari","Mota"],
  ["eduardo.gomes@infineon.com","Eduardo","Gomes"],
  ["elis.ponce@contasimples.com","",""],
  ["alicia.soares93@gmail.com","",""],
  ["ana.bighi@grupofleury.com.br","",""],
  ["raquel.almeida@pontual.pt","",""],
  ["ana.pires@pt.mcd.com","",""],
  ["ana.vicente@luzimeca.pt","",""],
  ["anairasuos@gmail.com","Ariana",""],
  ["anaivoliveirap@gmail.com","",""],
  ["andrefelippetrajano@gmail.com","André","Silva"],
  ["andreia31068@gmail.com","",""],
  ["andrenovasilva@gmail.com","",""],
  ["rafaela.silva@gran.com","",""],
  ["tomas.p.fernandes@hotmail.com","",""],
  ["barros.susana@gmail.com","Susana","Barros"],
  ["bruna.tavares@celcoin.com.br","",""],
  ["brunorocha.hr@gmail.com","",""],
  ["carina.teixeira85@gmail.com","",""],
  ["carina_afonso@live.com","",""],
  ["carla.madeira@axians.com","",""],
  ["tinderelladoporto@gmail.com","Miss","Lolita von Tease"],
  ["tina.biron@gmail.com","Tina","Biron"],
  ["cavalcantalines@gmail.com","Aline","Cavalcante"],
  ["teresajesus@loba.com","",""],
  ["cristiana.silva@portodigital.pt","",""],
  ["cristinasfferreira@hotmail.com","",""],
  ["crlisboa@gmail.com","",""],
  ["cunha.p.beatriz@gmail.com","Beatriz","Pereira Cunha"],
  ["daniel.costa_92@hotmail.com","",""],
  ["danielsilvayaguas@gmail.com","Daniel","Yaguas"],
  ["david.rosa2107@gmail.com","",""],
  ["davidcerqueira@untile.pt","",""],
  ["aiazevedo.work@gmail.com","Ana","Azevedo"],
  ["alexandra.qr.sousa@gmail.com","",""],
  ["alexassantos@gmail.com","",""],
  ["elmarfborges@hotmail.com","",""],
  ["evelinedias@gmail.com","Eveline",""],
  ["fabio_outubro@hotmail.com","",""],
  ["fernanda.pereira@wsut.com.br","",""],
  ["susanabeato@gmail.com","Susana","Beato"],
  ["fnahas25@hotmail.com","",""],
  ["fomarketingdigital@gmail.com","",""],
  ["fsilva@resinorte.pt","",""],
  ["gizah.tissot@ecommercepuro.com.br","",""],
  ["h2hformacao@gmail.com","Patrícia","Ferrão"],
  ["helenamoraisantos@gmail.com","Helena","M Santos"],
  ["susana.rocha-ribeiro@axians.com","Susana","Ribeiro"],
  ["inesdiana@gmail.com","",""],
  ["isabelazevedocpereira@gmail.com","",""],
  ["isabeltempero@gmail.com","",""],
  ["italodiegodesouza@gmail.com","",""],
  ["ivetepatricia@gmail.com","",""],
  ["ivyivyfialho@gmail.com","Ivy","Fialho"],
  ["izadoraaraujo9108@gmail.com","Izadora","Araujo"],
  ["suelendafranca@gmail.com","Suelen",""],
  ["jmarianateixeirag@gmail.com","",""],
  ["joana.hollerbusch@wechange.com.pt","",""],
  ["jorge.sousa@primor.pt","",""],
  ["josy.melo1302@gmail.com","",""],
  ["juanita_lirio@hotmail.com","Joana","Lírio"],
  ["julia.ribeiro@dotgroup.com.br","",""],
  ["julianasegallafindes@gmail.com","",""],
  ["kayanjoy@icloud.com","KayanJoy",""],
  ["stellafeitosa@gmail.com","Stella","Conte"],
  ["sousaliliana28@gmail.com","",""],
  ["lilyanelynhares2@hotmail.com","",""],
  ["dinispereira_5@hotmail.com","Dinis","Pereira"],
  ["pjmartinsrodrigues@gmail.com","Pedro","Rodrigues"],
  ["luisa.vieira@vrc.pt","",""],
  ["luispedroroque@gmail.com","Luís","Domingues"],
  ["m.burmesterc@gmail.com","",""],
  ["macedoarezesstephanie@gmail.com","Stephanie","Macedo"],
  ["sonia00moreira@gmail.com","Sonia","Duarte"],
  ["marcosfpvaz@gmail.com","",""],
  ["mariainesdamas21@gmail.com","Ines","Damas"],
  ["mariajoao.teixeira@gmail.com","",""],
  ["sonia.silva@turismodeportugal.pt","",""],
  ["mariana-21-ramos@hotmail.com","",""],
  ["marianaairespires@gmail.com","Mariana",""],
  ["marianabalmeida@live.com.pt","",""],
  ["marinasophia19@gmail.com","",""],
  ["markelo.mc@gmail.com","",""],
  ["marta_racf@hotmail.com","",""],
  ["meireles.cunha+neogeneralista@gmail.com","",""],
  ["miguel.reis@me.com","",""],
  ["miguel.riverteixeira@gmail.com","",""],
  ["mkt.dsantos.rh@gmail.com","Daniel","Filipe Ferreira Santos"],
  ["monica.m.silv@gmail.com","",""],
  ["mscs1974@gmail.com","",""],
  ["murilo.tiera@grupo3778.com.br","",""],
  ["nalexsilva.pt@gmail.com","",""],
  ["sonia.azevedo@tecnogial.pt","",""],
  ["newsreely@gmail.com","",""],
  ["patricia.nunes.lacerda@gmail.com","",""],
  ["patricia.ortiz@somostera.com","",""],
  ["patricia1029@gmail.com","",""],
  ["patriciaaa.pimentel@gmail.com","",""],
  ["sofiaviegas2020@gmail.com","",""],
  ["pedro.nuno.marques.silva@gmail.com","",""],
  ["perfeito.vanessa@gmail.com","Vanessa","Perfeito"],
  ["vifsantos@gmail.com","Vanda","Santos"],
  ["vmendes29@gmail.com","Vitor","Mendes"],
  ["soaresgabriela042@gmail.com","",""],
  ["rita.alvito@gmail.com","",""],
  ["ritanad1@gmail.com","Ana","Rita Rodrigues"],
  ["rogerioppsoares@gmail.com","Rogerio","soares"],
  ["sm.moreira2@gmail.com","",""],
  ["silviacosta.formadoraconsultora@gmail.com","",""],
  ["sandra.ferrao@magmastudio.pt","",""],
  ["sandra.mg.moreira@outlook.pt","",""],
  ["sandrasilvateixeira81@gmail.com","Sandra","Teixeira"],
  ["sara.marques@hfa.pt","",""],
  ["silviacfmoreira@gmail.com","",""],
  ["sarapereira.rh@gmail.com","Sara","Pereira"],
  ["scardoso@growin.com","",""],
  ["luanaflmartins@gmail.com","",""],
  ["sarafscastro@gmail.com","",""],
  ["ruicepeda16@gmail.com","",""],
  ["ruben.cunha@fyld.pt","Rúben","Cunha"],
  ["xana.m.f@hotmail.com","",""],
  ["paulita.sousa2@gmail.com","",""],
  ["nataliarodrigues73@outlook.pt","Nat",""],
  ["marialuisaescreve@gmail.com","Maria","Luísa"],
  ["manuela.seixas@sapo.pt","",""],
  ["lidiamartins.lm@gmail.com","",""],
  ["laraserra@gmail.com","",""],
  ["jcmeinedo@gmail.com","",""],
  ["ineschaves88@hotmail.com","",""],
  ["filiperolocruz@gmail.com","",""],
  ["claudiaferreirahenriques@gmail.com","Cláudia","Ferreira Henriques"],
  ["catia.cunha@pt.mcd.com","",""],
  ["catarinamouratopsi@gmail.com","",""],
  ["awonderfuldayblog@gmail.com","Ana",""],
  ["98.thay@gmail.com","",""],
  ["ana.leal@cm-pacosdeferreira.pt","",""],
];

async function fetchSenderGroupSubscribers(groupId) {
  const emails = new Set();
  let page = 1;
  while (true) {
    const r = await fetch(`${SENDER_API}/groups/${groupId}/subscribers?page=${page}`, {
      headers: { Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`, Accept: "application/json" },
    });
    const d = await r.json();
    if (!d.data || d.data.length === 0) break;
    for (const s of d.data) if (s.email) emails.add(s.email.toLowerCase());
    if (!d.links?.next) break;
    page++;
  }
  return emails;
}

async function addSubscriber({ email, firstname, lastname }) {
  const r = await fetch(`${SENDER_API}/subscribers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      firstname: firstname || "",
      lastname: lastname || "",
      groups: [NEWSLETTER_GROUP],
      trigger_automation: false,
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
  }
  return r.json();
}

(async () => {
  console.log(`MODE: ${DRY ? "DRY-RUN (sem mutação)" : "EXECUTE"}`);
  console.log(`Sender group target: ${NEWSLETTER_GROUP} (Newsletter NeoGeneralista)`);
  console.log("");

  // Dedupe input
  const seen = new Set();
  const entries = [];
  for (const [email, fn, ln] of ENTRIES) {
    const lc = email.toLowerCase().trim();
    if (!lc || seen.has(lc)) continue;
    seen.add(lc);
    entries.push({ email: lc, firstname: fn, lastname: ln });
  }
  console.log(`Input deduped: ${entries.length}`);

  // Fetch current Sender state
  console.log("A puxar subscritores actuais do Sender NG...");
  const inSender = await fetchSenderGroupSubscribers(NEWSLETTER_GROUP);
  console.log(`Sender NG actual: ${inSender.size}`);

  const toAdd = entries.filter((e) => !inSender.has(e.email));
  const skipped = entries.length - toAdd.length;
  console.log(`A adicionar: ${toAdd.length} · skip: ${skipped}`);

  if (DRY) {
    console.log("\n--- DRY RUN: não faz POSTs ---");
    console.log("Primeiros 10 a adicionar:");
    toAdd.slice(0, 10).forEach((e, i) => console.log(`  ${i + 1}. ${e.email} (${e.firstname} ${e.lastname})`.trim()));
    return;
  }

  let ok = 0, fail = 0;
  const failed = [];
  for (let i = 0; i < toAdd.length; i++) {
    const e = toAdd[i];
    try {
      await addSubscriber(e);
      ok++;
      if ((i + 1) % 20 === 0) console.log(`  …${i + 1}/${toAdd.length} processados (ok=${ok})`);
    } catch (err) {
      fail++;
      failed.push({ email: e.email, err: err.message });
      console.log(`  ❌ ${e.email}: ${err.message.slice(0, 100)}`);
    }
    // Throttle
    await new Promise((r) => setTimeout(r, 120));
  }

  console.log("\n" + "=".repeat(50));
  console.log(`RESULTADO: ${ok} adicionados, ${fail} falharam`);
  console.log("=".repeat(50));
  if (failed.length > 0) {
    console.log("\nFalhas:");
    failed.forEach((f) => console.log(`  - ${f.email}: ${f.err}`));
  }
})().catch((e) => {
  console.error("\n💥", e);
  process.exit(1);
});
