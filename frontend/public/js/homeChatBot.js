document.addEventListener("DOMContentLoaded", () => {
    const chatbotButton = document.getElementById("chatbotButton");
    const chatbotMenu = document.getElementById("chatbotMenu");
    const talkToMeBtn = document.getElementById("talkToMeBtn");
    const talkButtons = document.getElementById("talkButtons");
    const navMessageText = document.getElementById("navMessageText");

    let timeout;

    // Toggle chatbot menu when button is clicked
    chatbotButton.addEventListener("click", () => {
        chatbotMenu.classList.toggle("show");
    });

    // Toggle "Talk to Me" buttons
    talkToMeBtn.addEventListener("click", () => {
        if (talkButtons.classList.contains("hidden")) {
            talkButtons.classList.remove("hidden");
            talkButtons.style.display = "block"; // Show buttons
        } else {
            talkButtons.classList.add("hidden");
            talkButtons.style.display = "none"; // Hide buttons
        }
    });

    // Detect current section and update chatbot message
    function updateNavMessage() {
        const sections = document.querySelectorAll("section");
        let scrollPosition = window.scrollY + 120;

        sections.forEach((section) => {
            if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
                let message = "You are now in the Home section.";

                if (section.id === "faqs") message = "❓ You are now in the FAQ section!";
                if (section.id === "about-uss") message = "💊 You are now in the ABOUT US section!";
                if (section.id === "services") message = "🚨 You are now in the SERVICE section!";
                if (section.id === "education") message = "📚 You are now in the Education section!";
                if (section.id === "contact-us") message = "📞 You are now in the Contact Us section!";

                navMessageText.innerText = message;
            }
        });
    }

    // Listen for scroll events
    window.addEventListener("scroll", updateNavMessage);
});
