const brands = [
  'Harmony Castle',
  'Dr. Nona',
  'Factology',
  'Arkana',
  'Skin Synergy',
  'Gemmis',
  'MonaLisa',
  'Infini Lutronic',
  'Linerase',
  'Karisma Collagen',
  'PLA Rich',
  'Reborn PLA'
];

export function Brands() {
  return (
    <section id="brands" className="py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-20 space-y-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-primary"></div>
            <span className="text-xs tracking-widest text-muted-foreground uppercase">Partners</span>
            <div className="h-px w-12 bg-primary"></div>
          </div>
          <h2 className="text-5xl font-light text-foreground">Наши бренды</h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            Официальное представительство ведущих мировых производителей
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="group bg-background p-12 hover:bg-muted/50 transition-all cursor-pointer flex items-center justify-center"
            >
              <span className="text-lg font-light text-foreground/40 group-hover:text-foreground transition-colors text-center tracking-wide">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
