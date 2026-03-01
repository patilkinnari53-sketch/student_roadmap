
document.addEventListener('DOMContentLoaded', () => {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const careerSections = document.querySelectorAll('.career-section');
    const allCards = document.querySelectorAll('.career-card');

    // Filter Logic
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state for tabs
            categoryTabs.forEach(t => {
                t.classList.remove('bg-white', 'shadow-md', 'text-slate-800', 'scale-105');
                t.classList.add('text-slate-500', 'hover:bg-white/50');
            });
            tab.classList.remove('text-slate-500', 'hover:bg-white/50');
            tab.classList.add('bg-white', 'shadow-md', 'text-slate-800', 'scale-105');

            const category = tab.dataset.category;

            // Animate cards out
            allCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
            });

            setTimeout(() => {
                careerSections.forEach(section => {
                    if (category === 'all' || section.dataset.category === category) {
                        section.classList.remove('hidden');
                        // Animate cards in with stagger
                        const cards = section.querySelectorAll('.career-card');
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'scale(1)';
                            }, index * 50);
                        });
                    } else {
                        section.classList.add('hidden');
                    }
                });
            }, 300);
        });
    });

    // Initial Animation
    setTimeout(() => {
        allCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, index * 50);
        });
    }, 100);

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.career-section').forEach(section => {
        observer.observe(section);
    });
});
