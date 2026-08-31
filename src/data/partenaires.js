export const PARTENAIRES = [
  { fichier: "universite-paris-cite.png", alt: "Université Paris Cité" },
  { fichier: "ap-hp-centre-upc.png", alt: "AP-HP Centre Université Paris Cité" },
  { fichier: "centre-borelli.jpg", alt: "Centre Borelli" },
  { fichier: "necker-enfants-malades.jpg", alt: "Necker — Enfants malades, Hôpital universitaire" },
  { fichier: "ophtara.jpg", alt: "OPHTARA — Centre de maladies rares en ophtalmologie" },
];

export const LICENCE_CC = "https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr";

export function urlPartenaire(fichier) {
  return `${import.meta.env.BASE_URL}partenaires/${fichier}`;
}
