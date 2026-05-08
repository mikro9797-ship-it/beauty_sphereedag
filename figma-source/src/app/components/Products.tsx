import { ArrowRight } from 'lucide-react';

const products = [
  {
    name: 'MonaLisa Premium Filler',
    brand: 'MonaLisa',
    category: 'Филлеры',
    image: 'https://images.unsplash.com/photo-1580680509485-700d2765662f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Arkana Bio Complex',
    brand: 'Arkana',
    category: 'Биоревитализация',
    image: 'https://images.unsplash.com/photo-1580680509470-366c82aac5d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Harmony Castle Serum',
    brand: 'Harmony Castle',
    category: 'Космецевтика',
    image: 'https://images.unsplash.com/photo-1580680639308-36ecfd3608b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

export function Products() {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-16 items-center mb-20">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-primary"></div>
              <span className="text-xs tracking-widest text-muted-foreground uppercase">Featured</span>
            </div>
            <h2 className="text-5xl font-light text-foreground">Популярные продукты</h2>
            <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-lg">
              Тщательно отобранные препараты от ведущих мировых производителей для достижения выдающихся результатов
            </p>
          </div>
          <div className="lg:col-span-6 flex justify-end">
            <button className="group flex items-center gap-3 text-foreground hover:text-primary transition-colors">
              <span className="text-sm tracking-wide uppercase">Весь каталог</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.map((product, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-widest text-muted-foreground uppercase">{product.category}</span>
                  <span className="text-xs tracking-wider text-muted-foreground">{product.brand}</span>
                </div>
                <h3 className="text-xl font-light text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="h-px w-0 group-hover:w-12 bg-primary transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
