import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-32 bg-foreground relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-primary/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-light text-white leading-tight">
              Станьте партнёром
              <br />
              <span className="italic font-serif text-primary">Beauty Sphere</span>
            </h2>
            <p className="text-lg text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
              Получите доступ к эксклюзивным условиям, оптовым ценам и персональной поддержке
              для развития вашего бизнеса
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="space-y-3 text-center">
              <div className="text-4xl font-light text-white">−30%</div>
              <div className="h-px w-12 bg-primary mx-auto"></div>
              <p className="text-sm tracking-wider text-white/60 uppercase">Оптовые цены</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="text-4xl font-light text-white">60</div>
              <div className="h-px w-12 bg-primary mx-auto"></div>
              <p className="text-sm tracking-wider text-white/60 uppercase">Дней отсрочка</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="text-4xl font-light text-white">∞</div>
              <div className="h-px w-12 bg-primary mx-auto"></div>
              <p className="text-sm tracking-wider text-white/60 uppercase">Обучение</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <button className="group px-10 py-4 bg-white text-foreground hover:bg-white/90 transition-all flex items-center gap-3">
              <span className="text-sm tracking-wide uppercase">Стать партнёром</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-4 border border-white/20 text-white hover:bg-white/5 transition-all">
              <span className="text-sm tracking-wide uppercase">Узнать условия</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
