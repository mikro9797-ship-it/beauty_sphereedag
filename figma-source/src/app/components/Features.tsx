const features = [
  { number: '15+', label: 'Мировых брендов', detail: 'Официальное партнерство' },
  { number: '100%', label: 'Подлинность', detail: 'Гарантия качества' },
  { number: '150+', label: 'Семинаров', detail: 'Экспертное обучение' },
  { number: '24/7', label: 'Поддержка', detail: 'Персональный менеджер' }
];

export function Features() {
  return (
    <section className="py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="space-y-3">
              <div className="space-y-2">
                <div className="text-5xl font-light text-foreground">{feature.number}</div>
                <div className="h-px w-16 bg-primary"></div>
              </div>
              <div className="space-y-1">
                <p className="text-sm tracking-wider uppercase text-foreground">{feature.label}</p>
                <p className="text-xs text-muted-foreground font-light">{feature.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
