import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-background pt-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-tr from-secondary/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-primary"></div>
                <span className="text-xs tracking-widest text-muted-foreground uppercase">Since 2011</span>
              </div>

              <h1 className="text-6xl lg:text-7xl font-light text-foreground leading-[1.1]">
                Professional
                <br />
                <span className="italic font-serif text-primary">Cosmetics</span>
              </h1>

              <p className="text-lg text-muted-foreground font-light max-w-md leading-relaxed">
                Эксклюзивный дистрибьютор премиальных брендов космецевтики для специалистов индустрии красоты
              </p>
            </div>

            <div className="flex items-center gap-6">
              <button className="group px-8 py-4 bg-foreground text-background hover:bg-foreground/90 transition-all flex items-center gap-3">
                <span className="text-sm tracking-wide uppercase">Начать работу</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="text-sm tracking-wide text-foreground/60 hover:text-foreground transition-colors uppercase">
                Наши бренды
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1580680509470-366c82aac5d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Professional Cosmetics"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-8 border border-border">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-light text-foreground">15+</span>
                  <span className="text-sm tracking-wider text-muted-foreground uppercase">Brands</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
