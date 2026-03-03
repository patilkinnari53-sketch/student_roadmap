/**
 * Roadmap Page JavaScript
 * Handles category filtering, animations, and interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const categoryTabs = document.querySelectorAll('.category-tab');
    const careerSections = document.querySelectorAll('.career-section');
    const allCards = document.querySelectorAll('.career-card');
    
    // State
    let activeCategory = 'all';
    let isAnimating = false;

    /**
     * Initialize the roadmap page
     */
    function init() {
        setupCategoryFilters();
        setupInitialAnimations();
        setupIntersectionObserver();
        setupCardHoverEffects();
        setupSearchFilter(); // Optional: if you want to add search
    }

    /**
     * Category filter functionality with smooth animations
     */
    function setupCategoryFilters() {
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => handleCategoryClick(tab));
            
            // Add keyboard accessibility
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategoryClick(tab);
                }
            });
        });
    }

    /**
     * Handle category tab click
     */
    function handleCategoryClick(tab) {
        if (isAnimating) return; // Prevent multiple clicks during animation
        
        const category = tab.dataset.category;
        if (category === activeCategory) return; // No change needed
        
        isAnimating = true;
        activeCategory = category;

        // Update tab styles
        updateActiveTab(tab);

        // Animate cards out
        animateCardsOut().then(() => {
            // Filter sections
            filterSections(category);
            
            // Animate cards in
            return animateCardsIn(category);
        }).then(() => {
            isAnimating = false;
        }).catch(error => {
            console.error('Animation error:', error);
            isAnimating = false;
        });

        // Update URL hash for shareable links (optional)
        if (category !== 'all') {
            window.location.hash = category;
        } else {
            window.location.hash = '';
        }
    }

    /**
     * Update active tab styling
     */
    function updateActiveTab(activeTab) {
        categoryTabs.forEach(tab => {
            tab.classList.remove(
                'bg-white', 
                'shadow-md', 
                'text-slate-800', 
                'scale-105',
                'active'
            );
            tab.classList.add('text-slate-500', 'hover:bg-white/50');
        });
        
        activeTab.classList.remove('text-slate-500', 'hover:bg-white/50');
        activeTab.classList.add(
            'bg-white', 
            'shadow-md', 
            'text-slate-800', 
            'scale-105',
            'active'
        );
    }

    /**
     * Animate all cards out
     */
    function animateCardsOut() {
        return new Promise(resolve => {
            allCards.forEach(card => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
            });
            
            setTimeout(resolve, 300);
        });
    }

    /**
     * Filter career sections based on category
     */
    function filterSections(category) {
        careerSections.forEach(section => {
            if (category === 'all' || section.dataset.category === category) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    }

    /**
     * Animate cards in with stagger effect
     */
    function animateCardsIn(category) {
        return new Promise(resolve => {
            const visibleSections = category === 'all' 
                ? careerSections 
                : document.querySelectorAll(`.career-section[data-category="${category}"]`);
            
            let totalCards = 0;
            
            visibleSections.forEach(section => {
                const cards = section.querySelectorAll('.career-card');
                cards.forEach((card, index) => {
                    totalCards++;
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                        
                        // Add entrance animation class
                        card.classList.add('animate-fade-in-up');
                        setTimeout(() => {
                            card.classList.remove('animate-fade-in-up');
                        }, 500);
                    }, index * 100); // 100ms stagger
                });
            });
            
            // Resolve after last card animation
            setTimeout(resolve, (totalCards * 100) + 500);
        });
    }

    /**
     * Setup initial animations for cards on page load
     */
    function setupInitialAnimations() {
        // Set initial state
        allCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });

        // Check URL hash for category
        const hash = window.location.hash.substring(1);
        if (hash) {
            const targetTab = document.querySelector(`.category-tab[data-category="${hash}"]`);
            if (targetTab) {
                setTimeout(() => handleCategoryClick(targetTab), 100);
                return;
            }
        }

        // Animate cards in with stagger
        setTimeout(() => {
            allCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                    card.classList.add('animate-fade-in-up');
                    
                    setTimeout(() => {
                        card.classList.remove('animate-fade-in-up');
                    }, 500);
                }, index * 100);
            });
        }, 200);
    }

    /**
     * Intersection Observer for scroll animations
     */
    function setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    
                    // Animate cards within section
                    const cards = entry.target.querySelectorAll('.career-card');
                    cards.forEach((card, index) => {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                            card.classList.add('animate-fade-in-up');
                            
                            setTimeout(() => {
                                card.classList.remove('animate-fade-in-up');
                            }, 500);
                        }, index * 100);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '50px'
        });

        careerSections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Setup card hover effects with smooth transitions
     */
    function setupCardHoverEffects() {
        allCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
    }

    /**
     * Optional: Setup search filter functionality
     */
    function setupSearchFilter() {
        const searchInput = document.getElementById('careerSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', debounce((e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            allCards.forEach(card => {
                const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
                
                if (title.includes(searchTerm) || desc.includes(searchTerm)) {
                    card.style.display = 'flex';
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show/hide empty sections
            careerSections.forEach(section => {
                const visibleCards = section.querySelectorAll('.career-card[style*="display: flex"]');
                if (visibleCards.length === 0) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });
        }, 300));
    }

    /**
     * Debounce utility for search input
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Reset to show all categories
     */
    window.resetFilters = () => {
        const allTab = document.querySelector('.category-tab[data-category="all"]');
        if (allTab) {
            handleCategoryClick(allTab);
        }
    };

    /**
     * Smooth scroll to section
     */
    window.scrollToSection = (category) => {
        const section = document.querySelector(`.career-section[data-category="${category}"]`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Highlight section temporarily
            section.classList.add('highlight-section');
            setTimeout(() => {
                section.classList.remove('highlight-section');
            }, 2000);
        }
    };

    // Initialize everything
    init();

    // Handle responsive behavior
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Recalculate any responsive layouts if needed
            if (window.innerWidth < 768) {
                // Mobile specific adjustments
            }
        }, 250);
    });

    // Add CSS for highlight animation
    const style = document.createElement('style');
    style.textContent = `
        .highlight-section {
            animation: highlightPulse 2s ease;
        }
        
        @keyframes highlightPulse {
            0%, 100% {
                background-color: transparent;
            }
            30%, 70% {
                background-color: rgba(14, 165, 233, 0.1);
            }
        }
        
        .career-card {
            will-change: transform, opacity;
            backface-visibility: hidden;
        }
        
        .category-tab {
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
        }
        
        .category-tab:focus-visible {
            outline: 2px solid #0ea5e9;
            outline-offset: 2px;
        }
        
        .category-tab.active {
            position: relative;
        }
        
        .category-tab.active::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 24px;
            height: 2px;
            background: #0ea5e9;
            border-radius: 2px;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .career-card,
            .category-tab,
            .animate-fade-in-up {
                animation: none !important;
                transition: none !important;
            }
        }
    `;
    document.head.appendChild(style);
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init: document.addEventListener('DOMContentLoaded') };
}
