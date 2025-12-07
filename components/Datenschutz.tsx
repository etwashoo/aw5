
import React from 'react';

export const Datenschutz: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-stone-50 min-h-[70vh]">
      <h2 className="text-3xl font-serif text-stone-900 mb-10 pb-4 border-b border-stone-200">Datenschutzerklärung</h2>
      
      <div className="space-y-8 text-stone-700 font-light leading-relaxed">
        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">1. Datenschutz auf einen Blick</h3>
            <h4 className="font-medium text-stone-800 mt-4 mb-1">Allgemeine Hinweise</h4>
            <p className="text-sm">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>
            <h4 className="font-medium text-stone-800 mt-4 mb-1">Datenerfassung auf dieser Website</h4>
            <p className="text-sm">
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br/>
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
            </p>
            <p className="text-sm mt-2">
                <strong>Wie erfassen wir Ihre Daten?</strong><br/>
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z.B. per E-Mail). Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.
            </p>
        </section>

        <div className="border-t border-stone-200 my-8"></div>

        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">2. Hosting</h3>
            <p className="text-sm">
                Wir hosten die Inhalte unserer Website bei einem externen Anbieter (z.B. GitHub Pages). Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Meta- und Kommunikationsdaten, Webseitenaufrufe und sonstige Daten handeln, die über eine Website generiert werden.
                <br/><br/>
                Das Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
        </section>

        <div className="border-t border-stone-200 my-8"></div>

        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">3. Allgemeine Hinweise und Pflichtinformationen</h3>
            <h4 className="font-medium text-stone-800 mt-4 mb-1">Datenschutz</h4>
            <p className="text-sm">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>

            <h4 className="font-medium text-stone-800 mt-4 mb-1">Hinweis zur verantwortlichen Stelle</h4>
            <p className="text-sm">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist im Impressum aufgeführt.
            </p>

            <h4 className="font-medium text-stone-800 mt-4 mb-1">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h4>
            <p className="text-sm">
                Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
            </p>

            <h4 className="font-medium text-stone-800 mt-4 mb-1">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h4>
            <p className="text-sm">
                Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu.
            </p>

            <h4 className="font-medium text-stone-800 mt-4 mb-1">SSL- bzw. TLS-Verschlüsselung</h4>
            <p className="text-sm">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://“ auf „https://“ wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
            </p>
        </section>

        <div className="border-t border-stone-200 my-8"></div>

        <section>
            <h3 className="text-lg font-medium text-stone-900 mb-2">4. Datenerfassung auf dieser Website</h3>
            <h4 className="font-medium text-stone-800 mt-4 mb-1">Server-Log-Dateien</h4>
            <p className="text-sm">
                Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
            </p>
            <ul className="list-disc list-inside text-sm mt-2 ml-2 space-y-1">
                <li>Browsertyp und Browserversion</li>
                <li>Verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
            </ul>
            <p className="text-sm mt-2">
                Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und der Optimierung seiner Website – hierzu müssen die Server-Log-Files erfasst werden.
            </p>
        </section>
      </div>
    </div>
  );
};
