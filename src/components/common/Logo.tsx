"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface LogoProps {
  /** Largeur en pixels (défaut: 150) */
  width?: number;
  /** Hauteur en pixels (défaut: 40) */
  height?: number;
  /** Variante : "full" pour logo complet, "icon" pour icône seule */
  variant?: "full" | "icon";
  /** Classes CSS additionnelles */
  className?: string;
  /** Si true, le logo est un lien vers la page d'accueil */
  link?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  width = 150,
  height = 40,
  variant = "full",
  className = "",
  link = true,
}) => {
  const iconSize = variant === "icon" ? { width: 32, height: 32 } : { width, height };

  const imageElement = (
    <Image
      src="/images/logo/logo.png"
      alt="Quiz Genie"
      width={iconSize.width}
      height={iconSize.height}
      className={`object-contain ${className}`}
      priority
    />
  );

  if (link) {
    return (
      <Link href="/" className="inline-flex items-center">
        {imageElement}
      </Link>
    );
  }

  return imageElement;
};

export default Logo;