import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Obchodní podmínky a ochrana osobních údajů | Revizone',
  description:
    'Obchodní podmínky, zásady ochrany osobních údajů (GDPR) a informace pro uživatele mobilní aplikace Revizone v souladu s požadavky Google Play.',
  robots: { index: true, follow: true },
};

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-gray-300 sm:text-base">{children}</div>
  </section>
);

export default function ObchodniPodminkyPage() {
  return (
    <div className="min-h-dvh bg-[#111111] text-gray-200">
      <div className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/login"
            className="flex shrink-0 items-center gap-2 rounded-lg p-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Zpět</span>
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-5 w-5 shrink-0 text-brand-yellow" />
            <h1 className="truncate text-base font-bold text-white sm:text-lg">
              Obchodní podmínky &amp; ochrana údajů
            </h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8 pb-16 sm:px-6">
        <p className="mb-2 text-xs uppercase tracking-wider text-brand-yellow/90">Platné od 16. 4. 2026</p>
        <p className="mb-10 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400">
          Tento dokument slouží jako přehled pravidel používání služby <strong className="text-gray-300">Revizone</strong>{' '}
          (webová aplikace a související mobilní klient / PWA) a jako informace o zpracování osobních údajů ve smyslu nařízení
          Evropského parlamentu a Rady (EU) 2016/679 (GDPR). Text nenahrazuje individuální právní poradenství.
        </p>

        <div className="mb-10 rounded-xl border border-brand-yellow/20 bg-brand-yellow/5 p-4 sm:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-white">
            <Shield className="h-5 w-5 text-brand-yellow" />
            Identifikace vydavatele a poskytovatele služeb
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-gray-300">
            <li>
              <strong className="text-white">Vydavatel aplikace</strong> (název / vývojář uvedený v záznamu aplikace Revizone v
              obchodě Google Play): <strong className="text-white">Ludvík Remešek</strong>
            </li>
            <li>
              <strong className="text-white">Poskytovatel služeb</strong> (provozní část Služby):{' '}
              <strong className="text-white">ASPERSUN, s.r.o.</strong>
            </li>
            <li>
              <strong className="text-white">Kontaktní e-mail:</strong>{' '}
              <a href="mailto:info@revizone.cz" className="text-brand-yellow hover:underline">
                info@revizone.cz
              </a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            Pro účely GDPR může být vůči uživatelům v postavení <strong>správce osobních údajů</strong> zejména poskytovatel
            služeb, případně vydavatel — podle toho, kdo určuje účely a prostředky zpracování u konkrétního zpracování. V
            některých vztazích může být role vymezena jinak — viz níže.
          </p>
        </div>

        <div className="space-y-12">
          <Section id="uvod" title="1. Úvod a rozsah">
            <p>
              Tyto obchodní podmínky („<strong>Podmínky</strong>“) upravují používání digitální platformy Revizone, která
              umožňuje zejména správu objednávek revizí, komunikaci mezi účastníky a související služby (dále jen{' '}
              <strong>„Služba“</strong>).
            </p>
            <p>
              Službu můžete využívat prostřednictvím webového rozhraní a/nebo jako <strong>mobilní aplikaci</strong> (včetně
              instalace přes prohlížeč / PWA nebo distribuce přes Google Play, pokud je k dispozici). Používáním Služby
              vyjadřujete souhlas s těmito Podmínkami a se zásadami ochrany osobních údajů uvedenými v téže dokumentaci.
            </p>
            <p>
              Pokud s Podmínkami nesouhlasíte, Službu nevyužívejte. U některých funkcí může být vyžadován samostatný souhlas
              (např. marketing, analytika) — vždy výslovně v rozhraní Služby.
            </p>
          </Section>

          <Section id="sluzby" title="2. Popis Služby a role uživatelů">
            <p>
              Služba propojuje zejména <strong>objednatele revizí</strong> (např. majitele nemovitostí, SVJ, realitní
              subjekty) a <strong>poskytovatele</strong> (revizní techniky, firmy). Konkrétní rozsah funkcí závisí na typu
              účtu (zákazník, technik, firma, administrátor apod.).
            </p>
            <p>
              Revizone <strong>není</strong> samostatným poskytovatelem odborné revizní činnosti, pokud není výslovně uvedeno
              jinak. Smluvní vztah ohledně provedení revize vzniká primárně mezi objednatelem a zvoleným technikem / firmou
              podle jejich vzájemné dohody a platné legislativy.
            </p>
          </Section>

          <Section id="ucet" title="3. Registrace, účet a bezpečnost">
            <p>
              K využití části Služby je nutná registrace. Uživatel je povinen uvádět pravdivé údaje a chránit přístupové
              údaje. Za aktivitu pod svým účtem odpovídá uživatel, pokud neprokáže opak.
            </p>
            <p>
              Účet může být po porušení Podmínky, zákona nebo oprávněného zájmu provozovatele <strong>omezen nebo
              ukončen</strong>. Uživatel může o zrušení účtu požádat prostřednictvím kontaktu uvedeného výše, funkce v
              nastavení účtu (Nastavení → Osobní údaje → smazání účtu) nebo na stránce{' '}
              <Link href="/smazatucet" className="text-brand-yellow hover:underline">
                /smazatucet
              </Link>
              .
            </p>
            <p>
              <strong>Mazání účtu (Google Play):</strong> Uživatel může požádat o smazání účtu a souvisejících osobních údajů
              v rozsahu stanoveném zákonem a provozními důvody (např. dokončené objednávky mohou být uchovány po dobu
              vyžadovanou zákonem nebo oprávněným zájmem). Žádost lze podat v aplikaci (po ověření hesla), na stránce{' '}
              <Link href="/smazatucet" className="text-brand-yellow hover:underline">
                Smazání účtu
              </Link>{' '}
              nebo e-mailem na kontaktní adresu. Žádost podléhá schválení v administraci. O vyřízení budete informováni v
              přiměřené lhůtě. Podrobný popis postupu a uchovávání dat je na stránce{' '}
              <Link href="/smazatucet" className="text-brand-yellow hover:underline">
                /smazatucet
              </Link>
              .
            </p>
          </Section>

          <Section id="objednavky" title="4. Objednávky, ceny a platby">
            <p>
              Objednávky vznikají odesláním poptávky nebo objednávky v rámci Služby, pokud je proces dokončen. Ceny jsou
              uvedeny informativně nebo závazně podle zobrazení v konkrétním kroku objednávky.
            </p>
            <p>
              Platební podmínky (zálohy, fakturace, splatnost) se řídí dohodou mezi stranami a případně samostatnými obchodními
              podmínkami technika či firmy. Provozovatel může zprostředkovávat komunikaci nebo technické zobrazení stavu
              zakázky.
            </p>
            <p>
              Storno podmínek jednotlivé objednávky se řídí dohodou stran a občanským zákoníkem, pokud není sjednáno jinak.
            </p>
          </Section>

          <Section id="obsah" title="5. Chování uživatelů a zakázané jednání">
            <p>Uživatel se zavazuje zejména:</p>
            <ul className="list-inside list-disc space-y-1 pl-1 text-gray-300">
              <li>nezasahovat do bezpečnosti nebo dostupnosti Služby, neobcházet technická opatření;</li>
              <li>nenahrávat škodlivý kód, nešířit malware;</li>
              <li>neporušovat práva třetích osob (osobní údaje třetích osob zpracovávat jen s právním titulem);</li>
              <li>nepoužívat Službu k podvodům, spamu nebo nekalosoutěžnímu jednání.</li>
            </ul>
          </Section>

          <Section id="odpovednost" title="6. Odpovědnost a omezení">
            <p>
              Služba je poskytována v stavu „jak je“ (as-is) v rozsahu přiměřeném povaze online platformy. Provozovatel
              neodpovídá za nepřetržitou dostupnost, výpadky třetích stran (hosting, platební brány, e-mail) ani za škodu
              vzniklou vyšší mocí.
            </p>
            <p>
              Odpovědnost provozovatele vůči uživateli je v maximálním rozsahu přípustném právem omezena na újmu vzniklou
              úmyslně nebo hrubou nedbalostí, není-li zákonem stanoveno jinak.
            </p>
          </Section>

          <Section id="dusevni-vlastnictvi" title="7. Duševní vlastnictví">
            <p>
              Rozhraní Služby, texty, grafika, loga a software jsou chráněny právy duševního vlastnictví. Bez předchozího
              souhlasu provozovatele není dovoleno je kopírovat, rozšiřovat ani zneužívat k obchodním účelům mimo běžné
              osobní užití Služby.
            </p>
          </Section>

          <Section id="zmeny" title="8. Změny Podmínek">
            <p>
              Provozovatel může Podmínky měnit. O podstatných změnách je vhodné uživatele informovat (např. e-mailem nebo
              oznámením v aplikaci). Dalším používáním Služby po účinnosti změny vyjadřujete souhlas, pokud zákon nevyžaduje
              výslovný souhlas jiný.
            </p>
          </Section>

          <Section id="gdpr" title="9. Zpracování osobních údajů (GDPR)">
            <p className="font-medium text-white">9.1 Správce a zpracovatelé</p>
            <p>
              Správcem osobních údajů uživatelů Služby je provozovatel uvedený v záhlaví tohoto dokumentu. Provozovatel může
              pověřit zpracováním zpracovatele (např. poskytovatele hostingu, e-mailové infrastruktury, analytických nástrojů
              v rozsahu nezbytném). Seznam zpracovatelů lze vyžádat na kontaktním e-mailu.
            </p>
            <p className="font-medium text-white">9.2 Kategorie osobních údajů</p>
            <p>Můžeme zpracovávat zejména:</p>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>identifikační a kontaktní údaje (jméno, e-mail, telefon);</li>
              <li>údaje o objednávkách a komunikaci v rámci Služby;</li>
              <li>technické údaje (IP adresa, logy, typ zařízení, cookies / lokální úložiště pro přihlášení);</li>
              <li>v případě nahrání dokumentů k revizím také přílohy obsahující osobní údaje, pokud je uživatel vloží.</li>
            </ul>
            <p className="font-medium text-white">9.3 Účely a právní základy</p>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>
                <strong>Poskytování Služby, smlouva</strong> (čl. 6 odst. 1 písm. b) GDPR) — vedení účtu, objednávky,
                komunikace.
              </li>
              <li>
                <strong>Oprávněné zájmy</strong> (čl. 6 odst. 1 písm. f) GDPR) — bezpečnost, prevence zneužití, statistiky
                provozu, vymáhání práv.
              </li>
              <li>
                <strong>Právní povinnost</strong> (čl. 6 odst. 1 písm. c) GDPR) — účetní a daňové doklady, odpovědi na
                žádosti úřadů.
              </li>
              <li>
                <strong>Souhlas</strong> (čl. 6 odst. 1 písm. a) GDPR) — např. marketingové zprávy nebo nepovinné cookies —
                pouze po výslovném souhlasu a s možností odvolání.
              </li>
            </ul>
            <p className="font-medium text-white">9.4 Doba uchování</p>
            <p>
              Údaje uchováváme po dobu trvání účtu a následně po dobu nezbytnou pro splnění závazků a oprávněných zájmů,
              nejdéle však po dobu stanovenou zákonem (např. archivace účetních dokladů). Logy mohou být uchovány kratší
              dobu podle rotace systému.
            </p>
            <p className="font-medium text-white">9.5 Předávání a třetí země</p>
            <p>
              Pokud využíváme služby s infrastrukturou mimo EU/EHP, zajistíme odpovídající záruky (např. standardní smluvní
              doložky EU) v souladu s čl. 46 GDPR.
            </p>
            <p className="font-medium text-white">9.6 Vaše práva</p>
            <p>Máte právo na:</p>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>přístup k osobním údajům;</li>
              <li>opravu nepřesných údajů;</li>
              <li>výmaz („právo být zapomenut“), pokud nejsou dány jiné převažující důvody;</li>
              <li>omezení zpracování za podmínek GDPR;</li>
              <li>přenositelnost údajů u údajů zpracovávaných automatizovaně na základě smlouvy nebo souhlasu;</li>
              <li>námitku proti zpracování z oprávněného zájmu;</li>
              <li>odvolat souhlas se zpracováním založeným na souhlasu.</li>
            </ul>
            <p>
              Žádosti podávejte na kontaktní e-mail provozovatele. Odpovíme bez zbytečného odkladu, obvykle do jednoho měsíce.
            </p>
            <p className="font-medium text-white">9.7 Právo podat stížnost</p>
            <p>
              Máte právo podat stížnost u dozorového úřadu:{' '}
              <a
                href="https://www.uoou.cz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-yellow hover:underline"
              >
                Úřad pro ochranu osobních údajů (ÚOOÚ)
              </a>
              , Pplk. Sochora 27, 170 00 Praha 7.
            </p>
          </Section>

          <Section id="cookies" title="10. Cookies a podobné technologie">
            <p>
              Webová část Služby může používat cookies nezbytné pro fungování přihlášení a preferencí a — po souhlasu —
              analytické či marketingové cookies. Podrobnosti lze rozšířit samostatným „Cookie lišta“ rozhraním. V mobilní
              aplikaci / PWA platí obdobné principy ukládání tokenů pro session.
            </p>
          </Section>

          <Section id="google-play" title="11. Mobilní aplikace a Google Play">
            <p>
              Pokud je Služba distribuována prostřednictvím <strong>Google Play</strong>, berete na vědomí, že platí také{' '}
              <a
                href="https://play.google.com/about/play-terms/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-yellow hover:underline"
              >
                podmínky služby Google Play
              </a>{' '}
              a příslušné zásady Google (včetně zásad pro vývojáře a pravidel obsahu). V případě rozporu mezi těmito Podmínkami
              a pravidly Google pro konkrétní otázku distribuce aplikace mají přednost ustanovení vyžadovaná Googlem v
              nezbytném rozsahu.
            </p>
            <p>
              <strong>Oprávnění aplikace:</strong> Služba žádá pouze oprávnění nezbytná pro funkce, které popisujeme v
              obchodě aplikací (např. přístup k souborům pro nahrání dokumentů, fotoaparát pouze pokud uživatel funkci
              aktivuje). Nepožadujeme nepřiměřený přístup k kontaktům ani poloze, pokud to není pro danou funkci nutné.
            </p>
            <p>
              <strong>Data safety (bezpečnost údajů):</strong> Shromažďované údaje odpovídají popisu v sekci GDPR výše.
              Údaje neprodáváme. Přístup mají pouze oprávněné osoby a techničtí zpracovatelé v nezbytném rozsahu.
            </p>
            <p>
              <strong>Děti:</strong> Služba není určena osobám mladším 16 let bez souhlasu zákonného zástupce. Pokud
              zjistíme, že zpracováváme údaje dítěte bez právního základu, provedeme jejich výmaz.
            </p>
          </Section>

          <Section id="zaver" title="12. Závěrečná ustanovení">
            <p>
              Tyto Podmínky se řídí právem <strong>České republiky</strong>. Příslušnost k řešení sporů mají věcně a místně
              příslušné soudy České republiky, pokud zákon nestanoví jinak pro spotřebitele.
            </p>
            <p>
              Pokud některé ustanovení bude neplatné, zůstává platnost ostatních ustanovení nedotčena.
            </p>
          </Section>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          <p className="mb-4">
            Máte dotaz? Napište na{' '}
            <a href="mailto:info@revizone.cz" className="text-brand-yellow hover:underline">
              info@revizone.cz
            </a>
            .
          </p>
          <Link href="/login" className="text-brand-yellow hover:underline">
            Přihlášení do Revizone
          </Link>
        </div>
      </main>
    </div>
  );
}
