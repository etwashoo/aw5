import React from 'react';

export const Impressum: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-stone-50 min-h-[70vh]">
      <h2 className="text-3xl font-serif text-stone-900 mb-10 pb-4 border-b border-stone-200">Impressum</h2>
      
      <div className="space-y-8 text-stone-700 font-light leading-relaxed">
        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">Angaben gemäß § 5 TMG</h3>
            <p>
                Anna Maria Wilkemeyer<br />
                Atelier 4B<br />
                Musterstraße 123<br />
                10115 Berlin<br />
                Deutschland
            </p>
        </section>

        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">Kontakt</h3>
            <p>
                E-Mail: kontakt@annamariawilkemeyer.de<br />
                Telefon: +49 (0) 123 456789
            </p>
        </section>

        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">Umsatzsteuer-ID</h3>
            <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE 123 456 789 (Muster)
            </p>
        </section>

        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
            <p>
                Anna Maria Wilkemeyer<br />
                Musterstraße 123<br />
                10115 Berlin
            </p>
        </section>

        <div className="border-t border-stone-200 my-8"></div>

        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">Haftung für Inhalte</h3>
            <p className="text-sm text-stone-600">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
        </section>

        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">Haftung für Links</h3>
            <p className="text-sm text-stone-600">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
        </section>

        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">Urheberrecht</h3>
            <p className="text-sm text-stone-600">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
        </section>
      </div>
    </div>
  );
};