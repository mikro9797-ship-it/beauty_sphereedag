const reasons = [
  {
    number: '01',
    title: 'Официальное дистрибьюторство',
    description: 'Прямые контракты с производителями. Документальное подтверждение партнерства с каждым брендом.'
  },
  {
    number: '02',
    title: 'Гарантия подлинности',
    description: 'Все препараты сертифицированы. Каждая единица товара имеет подтверждение оригинальности.'
  },
  {
    number: '03',
    title: 'Экспертное обучение',
    description: 'Более 150 семинаров проведено. Повышение квалификации от ведущих специалистов индустрии.'
  },
  {
    number: '04',
    title: 'Персональная поддержка',
    description: 'Индивидуальный менеджер для каждого клиента. Консультации по выбору препаратов и протоколам.'
  }
];

export function WhyUs() {
  return (
    <section id="about" className="py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-primary"></div>
              <span className="text-xs tracking-widest text-muted-foreground uppercase">Why Choose Us</span>
            </div>
            <h2 className="text-5xl font-light text-foreground">Наши преимущества</h2>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Комплексная экосистема для профессионального роста косметологов
            </p>
          </div>

          <div className="lg:col-span-7 space-y-16">
            {reasons.map((reason, index) => (
              <div key={index} className="group">
                <div className="flex gap-8">
                  <span className="text-6xl font-light text-primary/20 group-hover:text-primary transition-colors">
                    {reason.number}
                  </span>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-light text-foreground">{reason.title}</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">{reason.description}</p>
                    <div className="h-px w-0 group-hover:w-16 bg-primary transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
