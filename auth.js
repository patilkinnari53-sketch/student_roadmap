/**
 * Simple Client-Side Authentication Logic - v2.1.0
 * Uses localStorage to simulate a logged-in user.
 */
console.log("Auth.js v2.1.0 loaded successfully");

const AUTH_KEY = 'studentRoadmap_isLoggedIn';
const USER_KEY = 'studentRoadmap_user';

const Auth = {
    // Check if user is logged in
    check: () => {
        return localStorage.getItem(AUTH_KEY) === 'true';
    },

    // Login function
    login: async (email, password) => {
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            const response = await fetch('backend/login.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.status === 'success') {
                localStorage.setItem(AUTH_KEY, 'true');
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                Auth.redirectIfAuthenticated();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },

    // Signup function
    signup: async (name, email, password) => {
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);

            const response = await fetch('backend/signup.php', {
                method: 'POST',
                body: formData
            });
            const text = await response.text();

            return text.trim() === 'success';
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    },

    // Get current user info
    getUser: () => {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY));
        } catch (e) {
            return null;
        }
    },

    // Logout function
    logout: async () => {
        try { await fetch('backend/logout.php'); } catch (e) { }
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = 'index.php';
    },

    // Redirect to login if not authenticated
    requireAuth: () => {
        if (!Auth.check()) {
            // Store current URL to redirect back after login
            sessionStorage.setItem('redirectUrl', window.location.href);
            window.location.href = 'login.php';
        }
    },

    // Redirect to home or intended page if already authenticated
    redirectIfAuthenticated: () => {
        if (Auth.check()) {
            const redirectUrl = sessionStorage.getItem('redirectUrl') || 'index.php';
            sessionStorage.removeItem('redirectUrl'); // Clear it
            window.location.href = redirectUrl;
        }
    },

    // Navigate to a protected URL
    navigateTo: (url) => {
        if (Auth.check()) {
            window.location.href = url;
        } else {
            sessionStorage.setItem('redirectUrl', url);
            window.location.href = 'login.php';
        }
    },

    // Initialize Header UI and Mobile Menu
    initHeader: (retryCount = 0) => {
        // Use setTimeout to ensure the DOM has finished updating after loadInclude
        setTimeout(() => {
            const authContainer = document.getElementById('desktopAuthContainer');
            const mobileAuthContainer = document.getElementById('mobileAuthContainer');
            const mobileProfileIcon = document.getElementById('mobileProfileIcon');

            // If containers aren't found yet, retry up to 5 times (total 500ms)
            if (!authContainer && !mobileAuthContainer && retryCount < 5) {
                console.log(`Auth.initHeader: Containers not found, retrying... (${retryCount + 1}/5)`);
                Auth.initHeader(retryCount + 1);
                return;
            }

            console.group("Auth.initHeader Diagnostics");
            const menuButton = document.getElementById('menuButton');
            const mobileMenu = document.getElementById('mobileMenu');
            const closeMenu = document.getElementById('closeMenu');

            console.log("Auth Status:", Auth.check());
            console.log("Header elements found:", {
                desktop: !!authContainer,
                mobileMenu: !!mobileAuthContainer,
                mobileSticky: !!mobileProfileIcon,
                menuBtn: !!menuButton
            });

            // Handle Auth State
            if (Auth.check()) {
                const user = Auth.getUser();
                console.log("User detected, updating UI:", user ? user.firstName : 'No Name');
                const initials = user && user.firstName ? user.firstName[0].toUpperCase() : 'U';

                const profileHtml = `
                    <div class="relative group ml-4">
                        <button class="flex items-center space-x-2 focus:outline-none">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                                ${initials}
                            </div>
                            <i class="fas fa-chevron-down text-xs text-slate-500"></i>
                        </button>
                        <!-- Dropdown -->
                        <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                            <div class="px-4 py-2 border-b border-slate-100">
                                <p class="text-sm font-semibold text-slate-800">${user && user.firstName ? user.firstName : 'User'}</p>
                                <p class="text-xs text-slate-500 truncate">${user && user.email ? user.email : ''}</p>
                            </div>
                            <a href="#" class="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                <i class="fas fa-user-circle mr-2"></i> Profile
                            </a>
                            <a href="#" onclick="Auth.logout(); return false;" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                <i class="fas fa-sign-out-alt mr-2"></i> Logout
                            </a>
                        </div>
                    </div>
                `;

                if (authContainer) {
                    authContainer.innerHTML = profileHtml;
                    authContainer.classList.remove('hidden');
                    authContainer.classList.add('flex');
                }

                if (mobileAuthContainer) {
                    mobileAuthContainer.innerHTML = `
                        <div class="flex items-center space-x-3 p-4 mb-4 bg-slate-50 rounded-xl">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                ${initials}
                            </div>
                            <div>
                                 <p class="font-semibold text-slate-800">${user && user.firstName ? user.firstName : 'User'}</p>
                                 <p class="text-xs text-slate-500" onclick="Auth.logout()" style="cursor: pointer;">Tap to Logout</p>
                            </div>
                        </div>
                    `;
                }

                // Mobile profile icon removed to avoid duplicate profile images in mobile view
                // Profile is now only shown inside the mobile menu for a cleaner look
                if (mobileProfileIcon) {
                    mobileProfileIcon.innerHTML = ''; // Clear any existing content
                }
            } else {
                console.log("No user session found.");
            }

            // Handle Mobile Menu (Re-initialize listeners)
            if (menuButton && mobileMenu && closeMenu) {
                // Remove existing listeners to avoid duplicates
                const newMenuButton = menuButton.cloneNode(true);
                menuButton.parentNode.replaceChild(newMenuButton, menuButton);

                const newCloseMenu = closeMenu.cloneNode(true);
                closeMenu.parentNode.replaceChild(newCloseMenu, closeMenu);

                newMenuButton.addEventListener('click', () => {
                    mobileMenu.classList.remove('-translate-x-full');
                    document.body.style.overflow = 'hidden';
                });

                newCloseMenu.addEventListener('click', () => {
                    mobileMenu.classList.add('-translate-x-full');
                    document.body.style.overflow = '';
                });

                mobileMenu.addEventListener('click', (e) => {
                    if (e.target === mobileMenu) {
                        mobileMenu.classList.add('-translate-x-full');
                        document.body.style.overflow = '';
                    }
                });
            }
            console.groupEnd();
        }, retryCount === 0 ? 0 : 100); // 0ms for first call, 100ms for retries
    }
};

// Initial call on script load to catch any existing header
Auth.initHeader();

// Fallback: Re-init on window load to catch late rendering
// Quiz Persistence Extension
Auth.checkQuizPersistence = () => {
    // Only show popup if:
    // 1. Saved state exists
    // 2. We are NOT already on quiz.php

    const savedState = localStorage.getItem('quiz_persistence');
    const currentPath = window.location.pathname.toLowerCase();
    const isQuizPage = currentPath.endsWith('quiz.php') || currentPath.includes('/quiz.php');

    if (savedState && !isQuizPage) {
        try {
            const state = JSON.parse(savedState);

            // Validation & Expiry (24 hours)
            if (typeof state.currentQuestion !== 'number' || !state.scores || (state.timestamp && Date.now() - state.timestamp > 86400000)) {
                localStorage.removeItem('quiz_persistence');
                return;
            }

            // Avoid double injection
            if (document.getElementById('quiz-resume-modal')) return;

            // Create Backdrop and Modal
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'quiz-resume-modal';
            modalOverlay.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 opacity-0';

            modalOverlay.innerHTML = `
                <div class="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-95 opacity-0">
                    <div class="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"></div>
                    
                    <div class="p-8 text-center">
                        <div class="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6 animate-bounce">
                            <i class="fas fa-rocket text-3xl"></i>
                        </div>
                        
                        <h3 class="text-2xl font-bold text-slate-900 mb-2">Resume Your Journey?</h3>
                        <p class="text-slate-500 mb-8">
                            You were right in the middle of your <b>Career Pathfinder Quiz</b>! 
                            We saved your progress at question ${state.currentQuestion + 1}.
                        </p>
                        
                        <div class="flex flex-col space-y-3">
                            <a href="quiz.php" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                                <i class="fas fa-play-circle text-lg"></i> Continue Quiz
                            </a>
                            <button onclick="localStorage.removeItem('quiz_persistence'); Auth.closeQuizModal();" class="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold py-3 px-6 rounded-2xl transition-all">
                                Start Over Instead
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modalOverlay);

            // Function to close the modal
            Auth.closeQuizModal = () => {
                const overlay = document.getElementById('quiz-resume-modal');
                const content = overlay.querySelector('div');
                content.classList.add('scale-95', 'opacity-0');
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.remove(), 300);
            };

            // Trigger animation
            requestAnimationFrame(() => {
                setTimeout(() => {
                    modalOverlay.classList.remove('opacity-0');
                    modalOverlay.querySelector('div').classList.remove('scale-95', 'opacity-0');
                }, 100);
            });

        } catch (e) {
            console.error("Quiz persistence error:", e);
            localStorage.removeItem('quiz_persistence');
        }
    }
};

// Listeners
window.addEventListener('load', () => {
    if (window.Auth && Auth.initHeader) Auth.initHeader();
    // Small delay to ensure everything is ready
    setTimeout(() => {
        if (Auth.checkQuizPersistence) Auth.checkQuizPersistence();
    }, 500);
});

// Expose Auth globally
window.Auth = Auth;
