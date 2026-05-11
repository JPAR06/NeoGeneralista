// Pure analysis (no mutations).
// Cross-checks the 3 CSV imports vs current MongoDB users + Sender groups.
//
// Run: node --env-file .env.local scripts/import-csv-analyze.js

const { MongoClient } = require("mongodb");

const SENDER_API = "https://api.sender.net/v2";
const NEWSLETTER_GROUP = "b8gqwj"; // Newsletter NeoGeneralista

// Emails extracted from the 3 CSVs the user provided.
const EVENTO = `felizardoelias@hotmail.com soniappereira4@gmail.com luisamd00@gmail.com alinemedina@everythink.com mjalves@med.up.pt silvia.soares98@gmail.com aurorammrocha@gmail.com savans.pires@gmail.com pedrodrherdeiro@gmail.com paulaguollo00@gmail.com bmassara@gmail.com bmgomes1999@hotmail.com c23inacio@hotmail.com paula.serra@my.istec.pt patcostac@gmail.com carlosmelorj@gmail.com miguelfojo@gmail.com mifidalgo@gmail.com filipersalmeida@gmail.com micaelacteixeira@gmail.com icastro98@yahoo.com melinabap@gmail.com iza.thedreamlab@gmail.com joana.rvmaia@gmail.com martinspja@gmail.com al.limerick@gmail.com katherineathie@gmail.com laurinda.a.lopes@gmail.com marta.costa.silva@gmail.com mariajose.rola@gmail.com calanhm@gmail.com cris.mparente@gmail.com lopesam@hotmail.com josefilipegomes@gmail.com helena.pereira@visual-thinking.pt elsagarciafernandes@gmail.com carla.amartins.silva@gmail.com biris.soares@gmail.com pedrotx@gmail.com pina.anamanuel@gmail.com marta.silvestre@gmail.com lrodrigues@kaizen.tech beatriz.teixeira@mota-engil.pt rita.fonseca@gmail.com asrolao@hotmail.com bea.pina.ferreira@gmail.com anisabelsousa@gmail.com inesgomescarneiro@gmail.com alexandre.p.rodrigues98@gmail.com e7imagem@gmail.com jp.pedroporto@gmail.com`.split(/\s+/);

const NEWSLETTER = `p.araujo.pinto@gmail.com sofiarochadecastro@gmail.com lidiaaccastro@gmail.com andreiasilvasantos.psi@gmail.com shaini.ditt@gmail.com ronnygasilo@gmail.com martaramos.neves@gmail.com imdanielamonteiro@gmail.com al@serona.app msrogerio.santos@gmail.com ritamcorreia@gmail.com karmasoda9@gmail.com lazaroplanche@gmail.com clarameireles@gmail.com darlyrf@gmail.com anavilhena_2811@hotmail.com rute.grh@gmail.com joanasmaia@gmail.com masbarroca@gmail.com alexandremeirelesmachado@gmail.com inesrochacastro5@gmail.com calvesporto79@gmail.com pedromonteiro2001@gmail.com joanasbba@gmail.com renatogwt1234@gmail.com wczsaozqu@mozmail.com armando.leite@gmail.com barbaradamaso16@gmail.com valeriaribeirodiniz@gmail.com vascocostapinho@gmail.com bscruzpt@gmail.com perfilmgp@gmail.com felizardoelias@hotmail.com martinspja@gmail.com marta.costa.silva@gmail.com bmassara@gmail.com bmgomes1999@hotmail.com aurorammrocha@gmail.com c23inacio@hotmail.com calanhm@gmail.com silvia.soares98@gmail.com soniappereira4@gmail.com carlosmelorj@gmail.com pedrodrherdeiro@gmail.com paulaguollo00@gmail.com filipersalmeida@gmail.com paula.serra@my.istec.pt icastro98@yahoo.com patcostac@gmail.com iza.thedreamlab@gmail.com mjalves@med.up.pt joana.rvmaia@gmail.com alinemedina@everythink.com miguelfojo@gmail.com al.limerick@gmail.com mifidalgo@gmail.com katherineathie@gmail.com laurinda.a.lopes@gmail.com micaelacteixeira@gmail.com melinabap@gmail.com luisamd00@gmail.com mariajose.rola@gmail.com savans.pires@gmail.com cris.mparente@gmail.com josefilipegomes@gmail.com lopesam@hotmail.com helena.pereira@visual-thinking.pt elsagarciafernandes@gmail.com carla.amartins.silva@gmail.com pedrotx@gmail.com biris.soares@gmail.com pina.anamanuel@gmail.com marta.silvestre@gmail.com lrodrigues@kaizen.tech beatriz.teixeira@mota-engil.pt rita.fonseca@gmail.com asrolao@hotmail.com aiazevedo.work@gmail.com miguel.carrapatoso@gmail.com joelvfaria@gmail.com joana.lirio@gmail.com ana.azevedo@my.istec.pt bea.pina.ferreira@gmail.com anisabelsousa@gmail.com inesgomescarneiro@gmail.com alexandre.p.rodrigues98@gmail.com e7imagem@gmail.com jp.pedroporto@gmail.com`.split(/\s+/);

const SUBSTACK = `luisa.ferreira@fricon.pt silvamarianemota@gmail.com eduardo.gomes@infineon.com elis.ponce@contasimples.com alicia.soares93@gmail.com ana.bighi@grupofleury.com.br raquel.almeida@pontual.pt ana.pires@pt.mcd.com ana.vicente@luzimeca.pt anairasuos@gmail.com anaivoliveirap@gmail.com andrefelippetrajano@gmail.com andreia31068@gmail.com andrenovasilva@gmail.com rafaela.silva@gran.com asrolao@hotmail.com tomas.p.fernandes@hotmail.com barros.susana@gmail.com beatriz.teixeira@mota-engil.pt bruna.tavares@celcoin.com.br brunorocha.hr@gmail.com carina.teixeira85@gmail.com carina_afonso@live.com carla.madeira@axians.com tinderelladoporto@gmail.com tina.biron@gmail.com cavalcantalines@gmail.com teresajesus@loba.com cristiana.silva@portodigital.pt cristinasfferreira@hotmail.com crlisboa@gmail.com cunha.p.beatriz@gmail.com daniel.costa_92@hotmail.com danielsilvayaguas@gmail.com david.rosa2107@gmail.com davidcerqueira@untile.pt aiazevedo.work@gmail.com alexandra.qr.sousa@gmail.com alexassantos@gmail.com elmarfborges@hotmail.com evelinedias@gmail.com fabio_outubro@hotmail.com fernanda.pereira@wsut.com.br susanabeato@gmail.com fnahas25@hotmail.com fomarketingdigital@gmail.com fsilva@resinorte.pt gizah.tissot@ecommercepuro.com.br h2hformacao@gmail.com helenamoraisantos@gmail.com susana.rocha-ribeiro@axians.com inesdiana@gmail.com isabelazevedocpereira@gmail.com isabeltempero@gmail.com italodiegodesouza@gmail.com ivetepatricia@gmail.com ivyivyfialho@gmail.com izadoraaraujo9108@gmail.com suelendafranca@gmail.com jmarianateixeirag@gmail.com joana.hollerbusch@wechange.com.pt jorge.sousa@primor.pt josy.melo1302@gmail.com juanita_lirio@hotmail.com julia.ribeiro@dotgroup.com.br julianasegallafindes@gmail.com kayanjoy@icloud.com stellafeitosa@gmail.com sousaliliana28@gmail.com lilyanelynhares2@hotmail.com lrodrigues@kaizen.tech dinispereira_5@hotmail.com pjmartinsrodrigues@gmail.com luisa.vieira@vrc.pt luispedroroque@gmail.com m.burmesterc@gmail.com macedoarezesstephanie@gmail.com sonia00moreira@gmail.com marcosfpvaz@gmail.com mariainesdamas21@gmail.com mariajoao.teixeira@gmail.com sonia.silva@turismodeportugal.pt mariana-21-ramos@hotmail.com marianaairespires@gmail.com marianabalmeida@live.com.pt marinasophia19@gmail.com markelo.mc@gmail.com marta_racf@hotmail.com meireles.cunha+neogeneralista@gmail.com miguel.reis@me.com miguel.riverteixeira@gmail.com mkt.dsantos.rh@gmail.com monica.m.silv@gmail.com mscs1974@gmail.com murilo.tiera@grupo3778.com.br nalexsilva.pt@gmail.com sonia.azevedo@tecnogial.pt newsreely@gmail.com patricia.nunes.lacerda@gmail.com patricia.ortiz@somostera.com patricia1029@gmail.com patriciaaa.pimentel@gmail.com sofiaviegas2020@gmail.com pedro.nuno.marques.silva@gmail.com perfeito.vanessa@gmail.com vifsantos@gmail.com vmendes29@gmail.com soaresgabriela042@gmail.com rita.alvito@gmail.com rita.fonseca@gmail.com ritanad1@gmail.com rogerioppsoares@gmail.com sm.moreira2@gmail.com silviacosta.formadoraconsultora@gmail.com sandra.ferrao@magmastudio.pt sandra.mg.moreira@outlook.pt sandrasilvateixeira81@gmail.com sara.marques@hfa.pt silviacfmoreira@gmail.com sarapereira.rh@gmail.com scardoso@growin.com luanaflmartins@gmail.com sarafscastro@gmail.com ruicepeda16@gmail.com ruben.cunha@fyld.pt xana.m.f@hotmail.com paulita.sousa2@gmail.com nataliarodrigues73@outlook.pt marialuisaescreve@gmail.com manuela.seixas@sapo.pt lidiamartins.lm@gmail.com laraserra@gmail.com jcmeinedo@gmail.com ineschaves88@hotmail.com filiperolocruz@gmail.com claudiaferreirahenriques@gmail.com catia.cunha@pt.mcd.com catarinamouratopsi@gmail.com awonderfuldayblog@gmail.com 98.thay@gmail.com ana.leal@cm-pacosdeferreira.pt anisabelsousa@gmail.com`.split(/\s+/);

function normalize(list) { return [...new Set(list.map(e => e.toLowerCase().trim()).filter(Boolean))]; }

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

(async () => {
  const evento = normalize(EVENTO);
  const newsletter = normalize(NEWSLETTER);
  const substack = normalize(SUBSTACK);

  console.log("=== CSV (deduped) ===");
  console.log(`EVENTO    : ${evento.length}`);
  console.log(`NEWSLETTER: ${newsletter.length}`);
  console.log(`SUBSTACK  : ${substack.length}`);

  const newsletterPlusSubstack = normalize([...newsletter, ...substack]);
  console.log(`\n=== NEWSLETTER + SUBSTACK (combined, dedup) ===`);
  console.log(`Combined unique: ${newsletterPlusSubstack.length}`);

  // MongoDB cross-check for EVENTO list
  const mongo = new MongoClient(process.env.MONGODB_URI);
  await mongo.connect();
  const allInList = new Set([...evento, ...newsletterPlusSubstack]);
  const existingMongoUsers = await mongo.db().collection("users")
    .find({ email: { $in: [...allInList] } }, { projection: { email: 1, passwordHash: 1 } })
    .toArray();
  const inMongo = new Set(existingMongoUsers.map(u => u.email.toLowerCase()));
  await mongo.close();

  const eventoExisting = evento.filter(e => inMongo.has(e));
  const eventoNew = evento.filter(e => !inMongo.has(e));
  console.log(`\n=== EVENTO → criar conta (Mongo) ===`);
  console.log(`Já em Mongo (skip): ${eventoExisting.length}`);
  console.log(`NOVOS para criar : ${eventoNew.length}`);
  if (eventoNew.length > 0) console.log(`  ${eventoNew.slice(0,5).join(", ")}${eventoNew.length > 5 ? "…" : ""}`);

  // Sender cross-check for NEWSLETTER+SUBSTACK
  console.log(`\n=== Sender NG (b8gqwj) cross-check ===`);
  console.log("A puxar subscritores actuais...");
  const senderNG = await fetchSenderGroupSubscribers(NEWSLETTER_GROUP);
  console.log(`Sender NG actual: ${senderNG.size} subscritores`);

  const nlExisting = newsletterPlusSubstack.filter(e => senderNG.has(e));
  const nlNew = newsletterPlusSubstack.filter(e => !senderNG.has(e));
  console.log(`\n=== NEWSLETTER+SUBSTACK → adicionar a Sender NG ===`);
  console.log(`Já no Sender NG (skip): ${nlExisting.length}`);
  console.log(`NOVOS para adicionar : ${nlNew.length}`);
  if (nlNew.length > 0) console.log(`  ${nlNew.slice(0,5).join(", ")}${nlNew.length > 5 ? "…" : ""}`);

  console.log(`\n${"=".repeat(50)}`);
  console.log(`PLANO DE EXECUÇÃO:`);
  console.log(`  + ${eventoNew.length} contas Mongo (ghost) criadas`);
  console.log(`  + ${nlNew.length} subscritores adicionados ao Sender NG`);
  console.log(`  ${eventoExisting.length + nlExisting.length} skips (já existem)`);
  console.log(`${"=".repeat(50)}`);
})();
