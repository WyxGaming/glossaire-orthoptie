import { PARTENAIRES, urlPartenaire } from "@/data/partenaires";

export default function LogosInstitutionnels() {
  return (
    <div className="og-header-partners" aria-label="Partenaires institutionnels">
      {PARTENAIRES.map(({ fichier, alt, large }) => (
        <div
          key={fichier}
          className={`og-header-partner-wrap${large ? " og-header-partner-wrap--large" : ""}`}
        >
          <img
            src={urlPartenaire(fichier)}
            alt={alt}
            className="og-header-partner-logo"
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}
