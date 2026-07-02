export default function LeagueFriends() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Ligue entre Amis</h1>

      <section className="bg-surface-container-lowest rounded-3xl p-8 sm:p-12 border border-surface-container-highest shadow-sm flex flex-col items-center text-center gap-4">
        <span className="material-symbols-outlined text-primary text-[40px]">emoji_events</span>
        <h2 className="font-headline text-xl font-semibold text-on-surface">Bientôt disponible</h2>
        <p className="font-body text-sm text-on-surface-variant max-w-md">
          La connexion, la création ou l'ajout à une ligue entre amis, ainsi que les pronostics
          par points arrivent avec l'authentification Firebase (Phase 3). Aucune donnée factice
          n'est affichée en attendant — et rappel : ce jeu ne fait jamais intervenir d'argent réel.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">group_add</span>
          <h3 className="font-body text-sm font-semibold text-on-surface">Créer ou rejoindre</h3>
          <p className="font-label text-xs text-on-surface-variant">
            Formez une ligue privée avec vos amis via un code d'invitation.
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">sports_soccer</span>
          <h3 className="font-body text-sm font-semibold text-on-surface">Pronostiquer</h3>
          <p className="font-label text-xs text-on-surface-variant">
            Prédisez le résultat des matchs avant le coup d'envoi pour gagner des points.
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">leaderboard</span>
          <h3 className="font-body text-sm font-semibold text-on-surface">Classement</h3>
          <p className="font-label text-xs text-on-surface-variant">
            Suivez le classement de votre ligue au fil de la saison.
          </p>
        </div>
      </section>
    </div>
  );
}
