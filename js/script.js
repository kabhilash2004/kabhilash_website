document.addEventListener('DOMContentLoaded', () => {
    // --- AI Project Description Modal Logic ---
    const modal = document.getElementById('ai-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalBody = document.getElementById('modal-body');
    const aiDescriptionEl = document.getElementById('ai-description');
    const loader = modalBody.querySelector('.loader');
    const generateButtons = document.querySelectorAll('.generate-desc-btn');

    const showModal = () => modal.classList.add('visible');
    const hideModal = () => modal.classList.remove('visible');

    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    generateButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const card = e.currentTarget.closest('.card');
            const title = card.querySelector('h3').innerText;
            const listItems = Array.from(card.querySelectorAll('li')).map(li => li.innerText);
            
            showModal();
            loader.style.display = 'block';
            aiDescriptionEl.textContent = '';

            const prompt = `
                As an expert project manager and technical writer, generate a professional and engaging project description for a portfolio.
                The project is titled "${title}".
                Key accomplishments and technologies used are:
                ${listItems.map(p => `- ${p}`).join('\n')}

                Combine these points into a fluid, impressive paragraph of about 4-6 sentences. Highlight the key technologies and the business impact of the project.
            `;

            const description = await getAIResponse(prompt);
            
            loader.style.display = 'none';
            aiDescriptionEl.textContent = description;
        });
    });

    // --- AI Chatbot Logic ---
    const chatWindow = document.getElementById('chat-window');
    const chatButton = document.getElementById('chat-button');
    const chatForm = document.getElementById('chat-form');
    const chatInputField = document.getElementById('chat-input-field');
    const chatMessages = document.getElementById('chat-messages');
    let resumeContext = '';

    // Function to extract text from the main content to build context
    const buildResumeContext = () => {
        const mainContent = document.getElementById('main-content');
        resumeContext = mainContent.innerText.replace(/\s+/g, ' ').trim();
    };

    chatButton.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open') && !resumeContext) {
            buildResumeContext();
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userQuery = chatInputField.value.trim();
        if (!userQuery) return;

        appendMessage(userQuery, 'user');
        chatInputField.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai-message';
        typingIndicator.innerHTML = '<span class="animate-pulse">...</span>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const prompt = `
            You are a helpful AI assistant for K. Abhilash's portfolio. Your name is Abby.
            Your goal is to answer questions from visitors and potential recruiters based *strictly* on the provided resume information.
            Do not invent any details or provide information not present in the context.
            If the answer is not in the resume, politely state that the information is not available in the provided context.
            Keep your answers concise and professional.

            --- Resume Context ---
            ${resumeContext}
            --------------------

            User Question: "${userQuery}"
        `;

        const aiResponse = await getAIResponse(prompt);
        
        chatMessages.removeChild(typingIndicator);
        appendMessage(aiResponse, 'ai');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    const appendMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
    };


    // --- Generic Gemini API Caller (Secure Version) ---
    async function getAIResponse(prompt) {
        // This now points to your local backend server
        const localApiUrl = 'http://localhost:3000/api/generate';

        try {
            const response = await fetch(localApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt }) // Send the prompt to your backend
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            return text || "Sorry, I couldn't generate a response. Please try again.";
        } catch (error) {
            console.error("Error calling local backend:", error);
            return "An error occurred while connecting to the AI service. Make sure the local server is running.";
        }
    }
});

// Intersection Observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up-active');
        }
    });
});

const elements = document.querySelectorAll('.fade-in-up');
elements.forEach(el => observer.observe(el));
