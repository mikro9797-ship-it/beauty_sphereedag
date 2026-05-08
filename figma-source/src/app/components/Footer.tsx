import { Phone, Mail, MapPin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-white/60">
      <div className="container mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-primary"></div>
                <h3 className="text-lg tracking-widest font-light text-white">BEAUTY SPHERE</h3>
              </div>
              <p className="text-xs tracking-wider uppercase">Professional Cosmetics</p>
            </div>
            <p className="text-sm font-light leading-relaxed max-w-sm">
              Официальный дистрибьютор премиальных брендов космецевтики для специалистов индустрии красоты с 2011 года
            </p>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs tracking-widest text-white uppercase mb-6">Каталог</h4>
            <ul className="space-y-3 text-sm font-light">
              <li><a href="#" className="hover:text-white transition-colors">Филлеры</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Биоревитализация</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Мезотерапия</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Космецевтика</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs tracking-widest text-white uppercase mb-6">Компания</h4>
            <ul className="space-y-3 text-sm font-light">
              <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Обучение</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Партнёрам</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-xs tracking-widest text-white uppercase mb-6">Контакты</h4>
            <ul className="space-y-4 text-sm font-light">
              <li>
                <a href="tel:+79882933999" className="hover:text-white transition-colors">
                  +7 988 293-39-99
                </a>
              </li>
              <li>
                <a href="mailto:info@beautysphere.ru" className="hover:text-white transition-colors">
                  info@beautysphere.ru
                </a>
              </li>
              <li>
                <span>ул. Азиза Алиева, 18<br/>Махачкала, Дагестан</span>
              </li>
              <li>
                <a href="https://instagram.com/dr.gulnara_rash" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  @dr.gulnara_rash
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 Beauty Sphere DAG. Все права защищены.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white transition-colors">Оферта</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
