const VERCEL_PRIVACY = "https://vercel.com/legal/privacy-policy";

export default function PolitiqueConfidentialite() {
  return (
    <article className="og-legal-page">
      <h1 className="og-legal-title">Politique de confidentialité</h1>
      <p className="og-legal-updated">
        <strong>Dernière mise à jour : 28/09/2026</strong>
      </p>

      <section>
        <h2>1. Notre engagement</h2>
        <p>La protection de la vie privée des utilisateurs constitue un principe important du projet.</p>
        <p>
          Le site a été conçu pour permettre une consultation libre et anonyme du lexique d&apos;ophtalmologie et
          d&apos;orthoptie.
        </p>
        <p>
          Aucune inscription, aucun compte utilisateur et aucun renseignement nominatif ne sont nécessaires pour
          accéder au contenu du site.
        </p>
      </section>

      <section>
        <h2>2. Données personnelles</h2>
        <p>
          Dans le cadre de son fonctionnement normal, le site ne demande pas aux utilisateurs de renseigner leur nom,
          prénom, adresse postale, numéro de téléphone, adresse e-mail ou autre information permettant de les
          identifier.
        </p>
        <p>
          Aucune création de compte n&apos;est proposée et aucune donnée nominative relative aux étudiants n&apos;est
          demandée pour consulter le site.
        </p>
        <p>
          Lorsque des utilisateurs souhaitent nous contacter ou nous signaler une erreur, ils peuvent utiliser les
          coordonnées indiquées sur le site. Les informations transmises volontairement dans ce cadre sont uniquement
          utilisées afin de répondre à leur demande.
        </p>
      </section>

      <section>
        <h2>3. Hébergement et données techniques</h2>
        <p>Le site est hébergé par Vercel.</p>
        <p>
          Comme tout service accessible en ligne, certaines informations techniques peuvent être susceptibles
          d&apos;être traitées par l&apos;infrastructure d&apos;hébergement afin d&apos;assurer le fonctionnement, la
          sécurité et la disponibilité du site.
        </p>
        <p>
          Vercel indique notamment traiter certaines informations techniques et de télémétrie liées à
          l&apos;utilisation de ses services. Les modalités de traitement applicables par Vercel sont détaillées dans{" "}
          <a href={VERCEL_PRIVACY} target="_blank" rel="noopener noreferrer">
            sa politique de confidentialité
          </a>
          .
        </p>
        <p>Les responsables du site ne constituent pas de fichier nominatif à partir des visiteurs du site.</p>
      </section>

      <section>
        <h2>4. Cookies et traceurs</h2>
        <p>
          Le site n&apos;a pas vocation à utiliser de cookies publicitaires ou de dispositifs de suivi destinés à
          établir un profil des utilisateurs.
        </p>
        <p>
          À notre connaissance, aucune solution de publicité, de profilage ou de suivi individuel n&apos;est mise en
          œuvre sur le site.
        </p>
        <p>
          Le fonctionnement technique de l&apos;hébergement peut toutefois impliquer certains traitements techniques
          relevant de l&apos;infrastructure de Vercel. Pour plus d&apos;informations concernant les traitements
          opérés par Vercel, les utilisateurs peuvent consulter{" "}
          <a href={VERCEL_PRIVACY} target="_blank" rel="noopener noreferrer">
            sa politique de confidentialité
          </a>
          .
        </p>
        <p>
          Si de nouveaux cookies ou outils de mesure d&apos;audience nécessitant une information ou un consentement
          sont ultérieurement intégrés au site, cette politique sera mise à jour en conséquence.
        </p>
      </section>

      <section>
        <h2>5. Finalité du site</h2>
        <p>
          Les éventuelles informations techniques nécessaires au fonctionnement du site peuvent uniquement être
          utilisées dans le cadre de la fourniture, de la sécurité et de l&apos;amélioration technique du service.
        </p>
        <p>Le site n&apos;a aucune finalité commerciale et ne procède à aucune vente de données personnelles.</p>
      </section>

      <section>
        <h2>6. Vos droits</h2>
        <p>
          Lorsque des données personnelles sont traitées, les personnes concernées disposent, dans les conditions
          prévues par la réglementation applicable, de droits concernant notamment l&apos;accès, la rectification,
          l&apos;effacement, la limitation ou l&apos;opposition au traitement de leurs données.
        </p>
        <p>Pour toute question relative à la protection des données ou à la confidentialité, vous pouvez nous contacter :</p>
        <ul className="og-legal-contact">
          <li>
            <strong>Simon Barbaray</strong>
            <br />
            <a href="mailto:simon.barbaray@aphp.fr">✉️ simon.barbaray@aphp.fr</a>
          </li>
          <li>
            <strong>Maxence Rateaux</strong>
            <br />
            <a href="mailto:maxence.rateaux@aphp.fr">✉️ maxence.rateaux@aphp.fr</a>
          </li>
        </ul>
      </section>
    </article>
  );
}
