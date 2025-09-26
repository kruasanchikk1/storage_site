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
        this.setupGameCards();
        this.debugAnchors(); // Добавляем отладку
    }

    // Отладка якорных ссылок
    debugAnchors() {
        console.log('🔍 Проверка якорных ссылок:');
        const anchors = ['#mission', '#artifacts', '#form'];
        anchors.forEach(anchor => {
            const element = document.querySelector(anchor);
            console.log(`${anchor}:`, element ? '✅ найден' : '❌ не найден');
            if (element) {
                console.log('   Позиция:', element.offsetTop, 'Высота:', element.offsetHeight);
            }
        });
    }

    // Анимация заголовка STORAGE
    setupTitleAnimation() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateX(-100px)';
        heroTitle.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';

        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateX(0)';
        }, 100);
    }

    // Анимация счетчиков
    setupCounterAnimation() {
        const counters = document.querySelectorAll('.text-4xl.font-black');
        if (!counters.length) return;

        const targetValues = [67, 23, 1200, '∞'];

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

    animateCounter(element, target) {
        if (target === '∞') {
            setTimeout(() => {
                element.textContent = '∞';
                element.style.transform = 'scale(1.2)';
                setTimeout(() => element.style.transform = 'scale(1)', 300);
            }, 500);
            return;
        }

        let current = 0;
        const duration = 2000;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
                element.style.transform = 'scale(1.1)';
                setTimeout(() => element.style.transform = 'scale(1)', 200);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Звездное поле
    setupStarfieldAnimation() {
        const heroSection = document.querySelector('.relative.py-16.px-4');
        if (!heroSection) return;

        const starfield = document.createElement('div');
        starfield.className = 'starfield absolute inset-0 overflow-hidden pointer-events-none';
        starfield.style.zIndex = '0';

        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star absolute rounded-full';

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

        if (!document.querySelector('#starfield-styles')) {
            const style = document.createElement('style');
            style.id = 'starfield-styles';
            style.textContent = `
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                .starfield { background: transparent !important; }
            `;
            document.head.appendChild(style);
        }
    }

    // Анимации при скролле
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.game-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            observer.observe(card);
        });
    }

    // Плавная прокрутка - ОСНОВНОЙ ИСПРАВЛЕНИЕ
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    // Более точный расчет позиции с учетом фиксированного хедера
                    const header = document.querySelector('header');
                    const headerHeight = header ? header.offsetHeight : 0;

                    // Получаем позицию элемента относительно документа
                    const targetRect = target.getBoundingClientRect();
                    const targetPosition = targetRect.top + window.pageYOffset - headerHeight - 20;

                    console.log(`🎯 Прокрутка к ${targetId}:`, {
                        headerHeight,
                        targetTop: targetRect.top,
                        pageYOffset: window.pageYOffset,
                        finalPosition: targetPosition
                    });

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Обновляем URL без перезагрузки страницы
                    history.pushState(null, null, targetId);
                } else {
                    console.warn(`❌ Элемент с id "${targetId}" не найден`);
                }
            });
        });

        // Обработка якорных ссылок при загрузке страницы
        this.handleInitialAnchor();
    }

    // Обработка якорных ссылок при загрузке страницы
    handleInitialAnchor() {
        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    const header = document.querySelector('header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }

    // Карточки игр
    setupGameCards() {
        document.querySelectorAll('.game-card').forEach(card => {
            // Клик по карточке
            card.addEventListener('click', (e) => {
                // Проверяем, есть ли у карточки обработчик onclick
                if (card.onclick) {
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.transform = 'scale(1)';
                        card.onclick(); // Вызываем оригинальный обработчик
                    }, 150);
                }
            });

            // Hover эффекты
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
}

// Утилиты
class StorageUtils {
    static formatNumber(num) {
        return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();
    }

    static prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 STORAGE: Инициализация...');

    // Быстрая проверка ключевых элементов
    console.log('📋 Проверка структуры:');
    console.log('Header:', document.querySelector('header') ? '✅' : '❌');
    console.log('Hero section:', document.querySelector('.hero-title') ? '✅' : '❌');
    console.log('Mission section:', document.querySelector('#mission') ? '✅' : '❌');
    console.log('Artifacts section:', document.querySelector('#artifacts') ? '✅' : '❌');

    if (!StorageUtils.prefersReducedMotion()) {
        new StorageAnimations();
        console.log('✨ Анимации активированы');
    } else {
        console.log('⚡ Анимации отключены (reduced motion)');
        // Принудительно включаем плавную прокрутку даже при reduced motion
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });
    }

    document.body.classList.add('loaded');
    console.log('✅ STORAGE готов к работе');
});

// Обработчик изменения настроек движения
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    console.log('🔄 Обновление настроек движения...');
    location.reload();
});

// Резервный обработчик для якорных ссылок (на случай если основной не сработает)
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link && !e.defaultPrevented) {
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            e.preventDefault();
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            const targetPosition = target.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});