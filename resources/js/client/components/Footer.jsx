import React from 'react';
import { Instagram, Facebook, Mail, Phone, MapPin, Heart, Code } from 'lucide-react';

const Footer = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-neutral-900 to-black text-neutral-200">
      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* À propos */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4 tracking-wide">VIVIAS SHOP</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              Votre destination pour la mode africaine authentique et élégante au Sénégal. 
              Des créations uniques alliant tradition et modernité.
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://instagram.com/viviasshop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/viviasshop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation rapide */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => onNavigate?.('/')}
                  className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('/shop')}
                  className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block"
                >
                  Boutique
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('/categories')}
                  className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block"
                >
                  Catégories
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('/account')}
                  className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transition-transform inline-block"
                >
                  Mon Compte
                </button>
              </li>
            </ul>
          </div>

          {/* Informations légales */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Informations</h3>
            <ul className="space-y-3">
              <li className="text-neutral-400 text-sm hover:text-white cursor-pointer transition-colors">Conditions générales</li>
              <li className="text-neutral-400 text-sm hover:text-white cursor-pointer transition-colors">Politique de confidentialité</li>
              <li className="text-neutral-400 text-sm hover:text-white cursor-pointer transition-colors">Livraison & Retours</li>
              <li className="text-neutral-400 text-sm hover:text-white cursor-pointer transition-colors">FAQ</li>
              <li className="text-neutral-400 text-sm hover:text-white cursor-pointer transition-colors">Guide des tailles</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-neutral-400 text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:+221784661412" className="hover:text-white transition-colors">
                    +221 78 466 14 12
                  </a>
                  <p className="text-xs text-neutral-500 mt-1">Lun - Sam : 9h - 18h</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-neutral-400 text-sm">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <a href="mailto:contact@viviasshop.sn" className="hover:text-white transition-colors">
                    contact@viviasshop.sn
                  </a>
                  <p className="text-xs text-neutral-500 mt-1">Réponse sous 24h</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-neutral-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Dakar, Sénégal</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barre de copyright */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-neutral-500 text-center md:text-left">
              © {currentYear} VIVIAS SHOP. Tous droits réservés.
            </p>
            
            {/* Signature du développeur */}
            <div className="flex items-center gap-2 text-neutral-500 group">
              <Code className="w-3 h-3 text-neutral-400 group-hover:text-blue-400 transition-colors" />
              <span className="text-xs">Développé avec</span>
              <Heart className="w-3 h-3 text-red-500 group-hover:scale-110 transition-transform" fill="currentColor" />
              <span className="text-xs">par</span>
              <a 
                href="mailto:birameowens29@gmail.com"
                className="text-neutral-400 hover:text-white transition-colors font-medium underline decoration-dotted underline-offset-2"
                title="Birame Owens Diop - Développeur Full Stack"
              >
                Birame Owens Diop
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Méthodes de paiement */}
      <div className="border-t border-neutral-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-600">
            <span>Paiements sécurisés</span>
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-neutral-900 rounded">WAVE</span>
              <span className="px-3 py-1 bg-neutral-900 rounded">OM</span>
              <span className="px-3 py-1 bg-neutral-900 rounded">STRIPE</span>
              <span className="px-3 py-1 bg-neutral-900 rounded">Espèces</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
