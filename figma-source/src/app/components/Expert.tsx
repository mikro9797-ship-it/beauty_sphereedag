import { Instagram } from 'lucide-react';

export function Expert() {
  return (
    <section className="py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1761718210055-e83ca7e2c9ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Dr. Gulnara Rash"
              className="w-full h-full object-cover grayscale"
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-primary"></div>
                <span className="text-xs tracking-widest text-muted-foreground uppercase">Founder & Expert</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-5xl font-light text-foreground">Dr. Gulnara Rash</h2>
                <p className="text-lg text-muted-foreground font-light italic">
                  Основатель и главный эксперт
                </p>
              </div>

              <div className="h-px w-16 bg-primary"></div>

              <blockquote className="text-xl font-light text-foreground leading-relaxed border-l-2 border-primary pl-6">
                "За 15 лет работы в индустрии я убедилась: качество препаратов и правильное обучение —
                это основа успеха каждого косметолога"
              </blockquote>

              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="space-y-2">
                  <p className="text-4xl font-light text-foreground">15+</p>
                  <p className="text-sm tracking-wider text-muted-foreground uppercase">Лет опыта</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-light text-foreground">2000+</p>
                  <p className="text-sm tracking-wider text-muted-foreground uppercase">Специалистов</p>
                </div>
              </div>
            </div>

            <a
              href="https://instagram.com/dr.gulnara_rash"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-5 h-5" />
              <span className="text-sm tracking-wide uppercase">@dr.gulnara_rash</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
