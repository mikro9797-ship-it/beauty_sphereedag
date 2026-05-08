import { Search, ShoppingCart, User, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-primary"></div>
            <div>
              <h1 className="text-lg tracking-widest font-light text-foreground">BEAUTY SPHERE</h1>
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Professional Cosmetics</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-10">
            <a href="#catalog" className="text-sm tracking-wide text-foreground/60 hover:text-foreground transition-colors uppercase">Каталог</a>
            <a href="#brands" className="text-sm tracking-wide text-foreground/60 hover:text-foreground transition-colors uppercase">Бренды</a>
            <a href="#education" className="text-sm tracking-wide text-foreground/60 hover:text-foreground transition-colors uppercase">Обучение</a>
            <a href="#about" className="text-sm tracking-wide text-foreground/60 hover:text-foreground transition-colors uppercase">О нас</a>
          </nav>

          <div className="flex items-center gap-6">
            <button className="text-foreground/60 hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-foreground/60 hover:text-foreground transition-colors">
              <User className="w-5 h-5" />
            </button>
            <button className="text-foreground/60 hover:text-foreground transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button className="lg:hidden text-foreground/60 hover:text-foreground transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
