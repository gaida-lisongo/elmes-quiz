import { ThemeProvider } from "@/context/ThemeContext";
import Logo from "@/components/common/Logo";
import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {children}
          {/* Colonne branding */}
          <div className="lg:w-1/2 w-full h-full relative lg:flex items-center justify-center hidden overflow-hidden">
            {/* Image de fond avec blur et overlay */}
            <div className="absolute inset-0">
              <Image
                src="/images/competition.jpg"
                alt="Quiz Genie Competition"
                fill
                className="object-cover blur-sm scale-110"
                priority
              />
              <div className="absolute inset-0 bg-brand-950/80 backdrop-blur-[2px]" />
            </div>

            {/* Contenu */}
            <div className="relative z-10 flex flex-col items-center max-w-md px-8 text-center">
              <Logo width={200} height={52} link={false} className="mb-8 drop-shadow-lg" />

              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                Apprends, Joue et Gagne !
              </h2>

              <p className="text-lg text-brand-200 mb-6 leading-relaxed">
                La plateforme qui récompense tes connaissances. Participe à nos
                compétitions chaque weekend et transforme ton savoir en argent réel.
              </p>

              {/* Cadeau de bienvenue */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mb-6 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🎁</span>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg">10 parties offertes</p>
                    <p className="text-brand-200 text-sm">Cadeau de bienvenue</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm text-left">
                  Inscris-toi gratuitement et reçois <strong>10 parties</strong> pour
                  commencer à jouer immédiatement. Aucun dépôt requis !
                </p>
              </div>

              {/* Avantages */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center">
                  <span className="text-2xl block mb-1">🏆</span>
                  <p className="text-white text-sm font-medium">Compétitions</p>
                  <p className="text-brand-200 text-xs">Chaque weekend</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center">
                  <span className="text-2xl block mb-1">💰</span>
                  <p className="text-white text-sm font-medium">Gains réels</p>
                  <p className="text-brand-200 text-xs">En Mobile Money</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center">
                  <span className="text-2xl block mb-1">📚</span>
                  <p className="text-white text-sm font-medium">Quiz variés</p>
                  <p className="text-brand-200 text-xs">Toutes les matières</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center">
                  <span className="text-2xl block mb-1">👥</span>
                  <p className="text-white text-sm font-medium">Parrainage</p>
                  <p className="text-brand-200 text-xs">Gagne des bonus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
