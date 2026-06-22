import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type Lang = "fr" | "en";

type Dict = Record<string, string>;

const FR: Dict = {
  "app.tag": "écrire · mettre en forme · publier",
  "palette.placeholder": "Chercher un feuillet, lancer une action…",
  "palette.actions": "Actions",
  "palette.posts": "Vos feuillets",
  "palette.published": "Publiés",
  "palette.empty": "Aucun résultat.",
  "palette.hint": "↵ ouvrir · ⌘K fermer",
  "action.new": "Nouveau feuillet",
  "action.publish": "Publier ce feuillet",
  "action.preview": "Aperçu lecture",
  "action.copyHtml": "Copier en HTML",
  "action.exportHtml": "Exporter en .html",
  "action.rename": "Renommer",
  "action.delete": "Supprimer",
  "action.tighten": "Resserrer le paragraphe (IA)",
  "action.suggestTitle": "Proposer un titre (IA)",
  "action.published": "Voir les publiés",
  "title.placeholder": "Titre du feuillet",
  "body.placeholder": "Commencez à écrire. Tapez « / » pour insérer…",
  "save.saving": "Enregistrement…",
  "save.saved": "Enregistré",
  "save.never": "Nouveau",
  "meta.words": "mots",
  "meta.read": "min de lecture",
  "slash.heading1": "Titre 1",
  "slash.heading2": "Titre 2",
  "slash.heading3": "Titre 3",
  "slash.bullet": "Liste à puces",
  "slash.ordered": "Liste numérotée",
  "slash.quote": "Citation",
  "slash.code": "Bloc de code",
  "slash.rule": "Filet horizontal",
  "slash.image": "Image…",
  "slash.placeholder": "Insérer…",
  "confirm.delete": "Supprimer ce feuillet ? Cette action est définitive.",
  "rename.prompt": "Nouveau titre :",
  "published.title": "Feuillets publiés",
  "published.empty": "Rien de publié pour l'instant. Publiez un feuillet pour le voir ici.",
  "published.download": "Télécharger",
  "published.copy": "Copier le HTML",
  "published.open": "Aperçu",
  "published.unpublish": "Retirer",
  "published.back": "Retour à l'écriture",
  "published.at": "Publié le",
  "reader.back": "Fermer l'aperçu",
  "reader.download": "Télécharger le .html",
  "toast.published": "Feuillet publié.",
  "toast.copied": "HTML copié.",
  "toast.exported": "Fichier .html téléchargé.",
  "toast.tightened": "Paragraphe resserré.",
  "toast.titled": "Titre proposé.",
  "toast.aiError": "L'IA n'a pas répondu. Réessayez.",
  "toast.aiNeedSelect": "Placez le curseur dans un paragraphe d'abord.",
  "toast.aiNeedText": "Écrivez un peu avant de demander un titre.",
  "ai.thinking": "L'IA réfléchit…",
  "link.prompt": "Adresse du lien (laisser vide pour retirer) :",
  "onboard.skip": "Passer",
  "onboard.next": "Suivant",
  "onboard.start": "Commencer à écrire",
  "onboard.t1": "Bienvenue dans Le Feuillet",
  "onboard.b1":
    "Un seul écran pour écrire, mettre en forme et publier. Pas de tableau de bord, pas de second mode — juste la page.",
  "onboard.t2": "Écrivez, la mise en forme est vivante",
  "onboard.b2":
    "Sélectionnez du texte : une barre flottante apparaît. Tapez « / » en début de ligne pour insérer un titre, une liste, une image. Aucune syntaxe à apprendre.",
  "onboard.t3": "⌘K fait tout le reste",
  "onboard.b3":
    "Ouvrez la palette avec ⌘K pour retrouver un feuillet, en créer un, publier, exporter. Tout est sauvegardé sur votre appareil.",
  "onboard.t4": "Publier = une belle page autonome",
  "onboard.b4":
    "« Publier » transforme votre feuillet en une page HTML complète et soignée, à télécharger ou à prévisualiser. Vos images sont incluses dans le fichier.",
  "lang.toggle": "EN",
};

const EN: Dict = {
  "app.tag": "write · format · publish",
  "palette.placeholder": "Find a leaf, run an action…",
  "palette.actions": "Actions",
  "palette.posts": "Your leaves",
  "palette.published": "Published",
  "palette.empty": "No results.",
  "palette.hint": "↵ open · ⌘K close",
  "action.new": "New leaf",
  "action.publish": "Publish this leaf",
  "action.preview": "Reader preview",
  "action.copyHtml": "Copy as HTML",
  "action.exportHtml": "Export as .html",
  "action.rename": "Rename",
  "action.delete": "Delete",
  "action.tighten": "Tighten paragraph (AI)",
  "action.suggestTitle": "Suggest a title (AI)",
  "action.published": "See published",
  "title.placeholder": "Title of the leaf",
  "body.placeholder": "Start writing. Type “/” to insert…",
  "save.saving": "Saving…",
  "save.saved": "Saved",
  "save.never": "New",
  "meta.words": "words",
  "meta.read": "min read",
  "slash.heading1": "Heading 1",
  "slash.heading2": "Heading 2",
  "slash.heading3": "Heading 3",
  "slash.bullet": "Bullet list",
  "slash.ordered": "Numbered list",
  "slash.quote": "Quote",
  "slash.code": "Code block",
  "slash.rule": "Horizontal rule",
  "slash.image": "Image…",
  "slash.placeholder": "Insert…",
  "confirm.delete": "Delete this leaf? This cannot be undone.",
  "rename.prompt": "New title:",
  "published.title": "Published leaves",
  "published.empty": "Nothing published yet. Publish a leaf to see it here.",
  "published.download": "Download",
  "published.copy": "Copy HTML",
  "published.open": "Preview",
  "published.unpublish": "Remove",
  "published.back": "Back to writing",
  "published.at": "Published",
  "reader.back": "Close preview",
  "reader.download": "Download .html",
  "toast.published": "Leaf published.",
  "toast.copied": "HTML copied.",
  "toast.exported": ".html file downloaded.",
  "toast.tightened": "Paragraph tightened.",
  "toast.titled": "Title suggested.",
  "toast.aiError": "The AI didn't answer. Try again.",
  "toast.aiNeedSelect": "Put the cursor in a paragraph first.",
  "toast.aiNeedText": "Write a little before asking for a title.",
  "ai.thinking": "The AI is thinking…",
  "link.prompt": "Link address (leave empty to remove):",
  "onboard.skip": "Skip",
  "onboard.next": "Next",
  "onboard.start": "Start writing",
  "onboard.t1": "Welcome to Le Feuillet",
  "onboard.b1":
    "One screen to write, format and publish. No dashboard, no second mode — just the page.",
  "onboard.t2": "Write, the formatting is live",
  "onboard.b2":
    "Select text: a floating bar appears. Type “/” at the start of a line to insert a heading, list or image. No syntax to learn.",
  "onboard.t3": "⌘K does everything else",
  "onboard.b3":
    "Open the palette with ⌘K to find a leaf, create one, publish, export. Everything is saved on your device.",
  "onboard.t4": "Publish = a handsome standalone page",
  "onboard.b4":
    "“Publish” turns your leaf into a complete, polished HTML page to download or preview. Your images are embedded in the file.",
  "lang.toggle": "FR",
};

const DICTS: Record<Lang, Dict> = { fr: FR, en: EN };

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

const STORE_KEY = "feuillet.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORE_KEY);
    return saved === "en" ? "en" : "fr";
  });
  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORE_KEY, l);
    document.documentElement.lang = l;
    setLangState(l);
  }, []);
  const t = useCallback(
    (key: string) => DICTS[lang][key] ?? DICTS.fr[key] ?? key,
    [lang],
  );
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n outside provider");
  return ctx;
}
