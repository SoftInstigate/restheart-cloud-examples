// Progressive enhancement: Form works without this script
// This script adds better UX with AJAX submission and error handling
(function () {
  "use strict";

  const form = document.getElementById("contactForm");
  const emailInput = document.getElementById("_id");
  const messageInput = document.getElementById("message");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Check if config.js is loaded and has a valid URL
  const setupRequiredAlert = document.getElementById("setupRequiredAlert");
  const serviceUrl =
    typeof RESTHEART_SERVICE_URL !== "undefined"
      ? RESTHEART_SERVICE_URL.trim()
      : "";

  if (!serviceUrl) {
    // No URL configured - disable form and show setup message
    console.warn(
      "No service URL configured in config.js. Please edit config.js first.",
    );

    // Show setup required alert
    if (setupRequiredAlert) {
      setupRequiredAlert.style.display = "block";
    }

    // Disable all form inputs
    emailInput.disabled = true;
    messageInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Setup Required";

    // Add visual indication that form is disabled
    form.style.opacity = "0.6";
    form.style.pointerEvents = "none";

    return; // Exit early - don't set up form handlers
  }

  // Set the form action from config
  form.action = `${serviceUrl}/contacts`;
  console.log("Using service URL:", form.action);

  // Create and insert feedback elements
  const feedbackHTML = `
        <div class="alert success" id="successAlert" style="display: none;">
            <strong>Success!</strong> Your message has been sent successfully.
        </div>
        <div class="alert error" id="errorAlert" style="display: none;">
            <strong>Error!</strong> <span id="errorMessage"></span>
        </div>
    `;

  const formContainer = document.querySelector(".form-container");
  form.insertAdjacentHTML("afterend", feedbackHTML);

  const successAlert = document.getElementById("successAlert");
  const errorAlert = document.getElementById("errorAlert");
  const errorMessage = document.getElementById("errorMessage");

  // Hide alerts
  function hideAlerts() {
    successAlert.style.display = "none";
    errorAlert.style.display = "none";
  }

  // Show success message
  function showSuccess() {
    hideAlerts();
    successAlert.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      successAlert.style.display = "none";
    }, 5000);
  }

  // Show error message
  function showError(msg) {
    hideAlerts();
    errorMessage.textContent = msg;
    errorAlert.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Set loading state
  function setLoading(loading) {
    submitBtn.disabled = loading;
    if (loading) {
      submitBtn.textContent = "Sending...";
      submitBtn.style.opacity = "0.7";
    } else {
      submitBtn.textContent = "Send Message";
      submitBtn.style.opacity = "1";
    }
  }

  // Handle form submission with AJAX
  async function handleSubmit(e) {
    e.preventDefault();
    hideAlerts();

    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // HTML5 validation should handle this, but double-check
    if (!email || !message) {
      showError("Please fill in all required fields.");
      return;
    }

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append("_id", email);
    formData.append("message", message);

    setLoading(true);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        // Try to parse error message from response
        let errorMsg = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMsg = errorData.message;
          }
        } catch (e) {
          // Response wasn't JSON, use default error message
        }
        throw new Error(errorMsg);
      }

      // Success
      showSuccess();
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      showError(error.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Attach event listener for enhanced submission
  form.addEventListener("submit", handleSubmit);

  // Clear alerts when user starts typing
  emailInput.addEventListener("input", hideAlerts);
  messageInput.addEventListener("input", hideAlerts);

  console.log("Contact form: JavaScript enhancements loaded");
})();
