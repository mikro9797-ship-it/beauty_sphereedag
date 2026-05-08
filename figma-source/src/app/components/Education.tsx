import { ArrowRight } from 'lucide-react';

const courses = [
  {
    title: 'Протоколы работы с филлерами MonaLisa',
    date: '15 мая',
    duration: '2 дня',
    expert: 'Dr. Gulnara Rash',
    image: 'https://images.unsplash.com/photo-1761718210055-e83ca7e2c9ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    title: 'Биоревитализация: современные подходы',
    date: '22 мая',
    duration: '1 день',
    expert: 'Ведущий эксперт',
    image: 'https://images.unsplash.com/photo-1633793566189-8e9fe6f817fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxjb3NtZXRpY3MlMjBwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzczNjI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

export function Education() {
  return (
    <section id="education" className="py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-primary"></div>
            <span className="text-xs tracking-widest text-muted-foreground uppercase">Education</span>
          </div>
          <h2 className="text-5xl font-light text-foreground">Обучение</h2>
          <p className="text-lg text-muted-foreground font-light max-w-xl">
            Экспертные программы для профессионального роста
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {courses.map((course, index) => (
            <div key={index} className="group bg-white overflow-hidden hover:shadow-2xl transition-all">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 relative aspect-square md:aspect-auto overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="md:col-span-3 p-10 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-light text-foreground">{course.date}</span>
                        <span className="text-xs tracking-wider text-muted-foreground uppercase">{course.duration}</span>
                      </div>
                      <div className="h-px w-12 bg-primary"></div>
                    </div>
                    <h3 className="text-2xl font-light text-foreground leading-tight">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.expert}</p>
                  </div>
                  <button className="group/btn flex items-center gap-3 text-foreground hover:text-primary transition-colors mt-6">
                    <span className="text-sm tracking-wide uppercase">Подробнее</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
