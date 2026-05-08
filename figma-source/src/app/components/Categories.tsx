const categories = [
  { name: 'Биоревитализация', count: '45', image: 'https://images.unsplash.com/photo-1580680509485-700d2765662f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Филлеры', count: '32', image: 'https://images.unsplash.com/photo-1580680509470-366c82aac5d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Мезотерапия', count: '28', image: 'https://images.unsplash.com/photo-1580680639308-36ecfd3608b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Пилинги', count: '38', image: 'https://images.unsplash.com/photo-1772987714654-2df39af2c658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Космецевтика', count: '56', image: 'https://images.unsplash.com/photo-1633793566189-8e9fe6f817fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'PLA-препараты', count: '18', image: 'https://images.unsplash.com/photo-1633793566063-52465a148cc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080' }
];

export function Categories() {
  return (
    <section id="catalog" className="py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-primary"></div>
            <span className="text-xs tracking-widest text-muted-foreground uppercase">Каталог</span>
          </div>
          <h2 className="text-5xl font-light text-foreground">Категории</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="group relative aspect-[3/4] overflow-hidden cursor-pointer">
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light text-white">{category.count}</span>
                  <span className="text-xs tracking-wider text-white/60 uppercase">Products</span>
                </div>
                <h3 className="text-xl tracking-wide text-white">{category.name}</h3>
                <div className="h-px w-0 group-hover:w-16 bg-primary transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
