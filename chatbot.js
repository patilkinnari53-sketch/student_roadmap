
/**
 * Chatbot Logic - v2.5.0
 * Optimized for both desktop and mobile reliability.
 */

(function() {
    const initChatbot = () => {
        const chatbotToggle = document.getElementById('chatbotToggle');
        const chatbotWindow = document.getElementById('chatbotWindow');
        const closeChatbot = document.getElementById('closeChatbot');
        const chatbotForm = document.getElementById('chatbotForm');
        const chatbotInput = document.getElementById('chatbotInput');
        const chatbotMessages = document.getElementById('chatbotMessages');

        if (!chatbotToggle || !chatbotWindow) return;

        console.log("Chatbot initialized successfully.");

        const botResponses = {
            "greeting": "Hello! I'm your StudentRoadmap assistant. How can I help you today?",
            "roadmap": "We have comprehensive roadmaps for various careers like Engineering, Medical, Software Development, CA, and more. You can explore them on our Roadmaps page!",
            "quiz": "Not sure which career to pick? Take our Career Assessment Quiz to find the perfect path for you!",
            "contact": "You can reach us through the Contact page or email us at help@studentroadmap.com.",
            "about": "StudentRoadmap is a personalized career guidance platform designed for Indian students.",
            "default": "I'm not sure I understand. Could you try rephrasing? You can ask about 'roadmaps', 'quiz', 'contact', or 'about us'."
        };

        const toggleChat = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log("Toggle clicked");
            const isActive = chatbotWindow.classList.toggle('active');
            
            if (isActive) {
                setTimeout(() => chatbotInput.focus(), 300);
                if (window.innerWidth <= 480) {
                    document.body.style.overflow = 'hidden';
                }
            } else {
                document.body.style.overflow = '';
            }
        };

        // Use standard event listeners for better cross-browser support
        chatbotToggle.addEventListener('click', toggleChat);
        
        closeChatbot.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            chatbotWindow.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Outside click detection
        document.addEventListener('click', (e) => {
            if (chatbotWindow.classList.contains('active')) {
                const isClickInside = chatbotWindow.contains(e.target) || chatbotToggle.contains(e.target);
                if (!isClickInside) {
                    chatbotWindow.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });

        // Message Handling
        chatbotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatbotInput.value.trim();
            if (message) {
                addMessage(message, 'user');
                chatbotInput.value = '';
                
                setTimeout(() => {
                    const response = getBotResponse(message);
                    addMessage(response, 'bot');
                }, 600);
            }
        });

        const addMessage = (text, sender) => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            messageDiv.textContent = text;
            chatbotMessages.appendChild(messageDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        };

        const getBotResponse = (input) => {
            const text = input.toLowerCase();
            if (text.includes('hi') || text.includes('hello')) return botResponses.greeting;
            if (text.includes('roadmap')) return botResponses.roadmap;
            if (text.includes('quiz')) return botResponses.quiz;
            if (text.includes('contact')) return botResponses.contact;
            if (text.includes('about')) return botResponses.about;
            return botResponses.default;
        };

        // Initial greeting
        setTimeout(() => {
            if (chatbotMessages.children.length === 0) {
                addMessage(botResponses.greeting, 'bot');
            }
        }, 1000);
    };

    // Run init on both DOMContentLoaded and immediate load as a fallback
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
