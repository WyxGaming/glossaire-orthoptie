import { LICENCE_CC, urlPartenaire } from "@/data/partenaires";

export default function PiedDePageInstitutionnel() {
  const annee = new Date().getFullYear();

  return (
    <footer className="og-site-footer">
      <div className="og-site-footer-inner">
        <div className="og-site-footer-legal">
          <p>
            © {annee} Simon BARBARAY, Maxence RATEAUX et Alice LECLERCQ. Tous droits réservés.
          </p>
          <p>
            Contenu diffusé sous licence{" "}
            <a href={LICENCE_CC} target="_blank" rel="noopener noreferrer">
              Creative Commons Attribution — Pas d&apos;utilisation commerciale — Pas de
              Modification 4.0 International
            </a>
            . Toute reproduction, diffusion ou adaptation sans autorisation est interdite.
          </p>
        </div>

        <a
          href={LICENCE_CC}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Licence Creative Commons BY-NC-ND 4.0"
          className="og-cc-badge-link"
        >
          <img
            src={urlPartenaire("cc-by-nc-nd.png")}
            alt="Licence CC BY-NC-ND 4.0"
            className="og-cc-badge"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
    </footer>
  );
}
