export default function LeagueFriends() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-headline text-2xl font-semibold tracking-tight">Ligue entre Amis</h1>
      <div className="bg-surface-container-lowest rounded-2xl p-8 border border-surface-container-highest shadow-sm font-body text-sm text-on-surface-variant">
        Connexion, création/rejoindre une ligue et pronostics arrivent en Phase 3
        (authentification Firebase + Firestore).
      </div>
    </section>
  );
}
