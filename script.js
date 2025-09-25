// script.js
class StorageAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupTitleAnimation();
        this.setupCounterAnimation();
        this.setupStarfieldAnimation();
        this.setupScrollAnimations();
        this.setupSmoothScrolling();
    }

    // Анимация заголовка STORAGE - движение от левого края к центру
    setupTitleAnimation() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        // Сохраняем исходные стили
        const originalHTML = heroTitle.innerHTML;

        // Создаем анимированную версию
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateX(-100px)';
        heroTitle.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';

        // Запускаем анимацию после загрузки
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateX(0)';
        }, 500);
    }

    // Анимация счетчиков с ростом показателей
    setupCounterAnimation() {
        const counters = document.querySelectorAll('.text-4xl.font-black');
        if (!counters.length) return;

        const targetValues = {
            0: 67,   // Сохраненных игр
            1: 23,   // Культурных региона
            2: 1200, // Хранителей традиций
            3: '∞'   // Бесконечность
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(counters).indexOf(entry.target);
                    this.animateCounter(entry.target, targetValues[index]);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // Функция анимации счетчика
    animateCounter(element, target) {
        if (target === '∞') {
            // Для бесконечности - просто показываем символ
            setTimeout(() => {
                element.textContent = '∞';
                element.style.transform = 'scale(1.2)';
                setTimeout(() => element.style.transform = 'scale(1)', 300);
            }, 500);
            return;
        }

        let current = 0;
        const duration = 2000; // 2 секунды
        const increment = target / (duration / 16); // 60fps
        const isDecimal = target % 1 !== 0;

        const timer = setInterval(() => {
            current += increment;

            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            if (isDecimal) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.floor(current);
            }

            // Добавляем эффект "пульсации" при достижении цели
            if (current === target) {
                element.style.transform = 'scale(1.1)';
                setTimeout(() => element.style.transform = 'scale(1)', 200);
            }
        }, 16);
    }

    // Анимация звездного поля на фоне
    setupStarfieldAnimation() {
        const heroSection = document.querySelector('.relative.py-16.px-4');
        if (!heroSection) return;

        // Создаем контейнер для звезд
        const starfield = document.createElement('div');
        starfield.className = 'starfield absolute inset-0 overflow-hidden pointer-events-none';
        starfield.style.zIndex = '0';

        // Генерируем звезды
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star absolute rounded-full';

            // Случайные параметры звезд
            const size = Math.random() * 2 + 1;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const opacity = Math.random() * 0.7 + 0.3;
            const duration = Math.random() * 5 + 3;
            const delay = Math.random() * 2;

            star.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                top: ${top}%;
                background: #6cc3ee;
                opacity: ${opacity};
                animation: twinkle ${duration}s infinite ${delay}s;
            `;

            starfield.appendChild(star);
        }

        heroSection.appendChild(starfield);

        // Добавляем стили для анимации мерцания
        if (!document.querySelector('#starfield-styles')) {
            const style = document.createElement('style');
            style.id = 'starfield-styles';
            style.textContent = `
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }

                .starfield {
                    background: transparent !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Анимации при скролле
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // Наблюдаем за карточками игр
        document.querySelectorAll('.game-card').forEach(card => {
            observer.observe(card);
        });
    }

    // Плавная прокрутка с учетом хедера
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Дополнительные утилиты
class StorageUtils {
    // Форматирование больших чисел
    static formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Проверка поддержки reduced motion
    static prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
}

// Инициализация при полной загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем настройки доступности
    if (!StorageUtils.prefersReducedMotion()) {
        new StorageAnimations();
    }

    // Добавляем классы для CSS анимаций
    document.body.classList.add('loaded');
});

// Обработчик изменения настройки движения
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    location.reload();
});