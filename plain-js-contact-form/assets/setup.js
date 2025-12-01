(function () {
  "use strict";

  const form = document.getElementById("setupForm");
  const adminJwtInput = document.getElementById("adminJwt");
  const successAlert = document.getElementById("successAlert");
  const errorAlert = document.getElementById("errorAlert");
  const errorMessage = document.getElementById("errorMessage");
  const setupProgress = document.getElementById("setupProgress");
  const submitBtn = form.querySelector('button[type="submit"]');
  const configUrlDisplay = document.getElementById("configUrlDisplay");
  const configUrlText = document.getElementById("configUrlText");
  const configRequiredAlert = document.getElementById("configRequiredAlert");

  // Check if config.js is loaded and has a valid URL
  const serviceUrl =
    typeof RESTHEART_SERVICE_URL !== "undefined"
      ? RESTHEART_SERVICE_URL.trim()
      : "";

  if (!serviceUrl) {
    // Show config required alert and disable form
    configRequiredAlert.style.display = "block";
    form.style.opacity = "0.6";
    form.style.pointerEvents = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Configuration Required";
    console.warn("RESTHEART_SERVICE_URL not configured in config.js");
    return;
  }

  // Show configured URL
  configUrlDisplay.style.display = "block";
  configUrlText.textContent = serviceUrl;

  // Progress step elements
  const steps = {
    step1: document.getElementById("step1"),
    step2: document.getElementById("step2"),
    step3: document.getElementById("step3"),
    step4: document.getElementById("step4"),
    step5: document.getElementById("step5"),
  };

  // Contact schema definition
  const contactSchema = {
    _id: "contact",
    type: "object",
    properties: {
      _id: {
        _$oid: "string",
      },
      email: {
        type: "string",
        format: "email",
      },
      message: {
        type: "string",
      },
      timestamp: {
        type: "object",
        properties: {
          _$date: {
            type: "number",
          },
        },
        required: ["$date"],
        additionalProperties: false,
      },
      _etag: {
        _$oid: "string",
      },
    },
    required: ["email", "message", "timestamp"],
    additionalProperties: false,
  };

  // Permission definition
  const permission = {
    _id: "allow-contact-form-post",
    predicate: "path(/contacts) and method(post)",
    priority: 20,
    roles: ["$unauthenticated"],
    mongo: {
      mergeRequest: {
        timestamp: "@now",
      },
    },
  };

  // Hide alerts
  function hideAlerts() {
    successAlert.style.display = "none";
    errorAlert.style.display = "none";
  }

  // Show error message
  function showError(msg) {
    hideAlerts();
    errorMessage.textContent = msg;
    errorAlert.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Show success message
  function showSuccess() {
    hideAlerts();
    successAlert.innerHTML = `
            <strong>Success!</strong> Backend setup completed successfully.
            <p style="margin-top: 12px;">
                Your RESTHeart Cloud backend is now configured with:
            </p>
            <ul style="margin-left: 20px; margin-top: 8px; line-height: 1.8;">
                <li>Contact schema with email validation</li>
                <li>JSON Schema validation on /contacts collection</li>
                <li>Permissions for unauthenticated POST requests</li>
                <li>Automatic timestamp on form submissions</li>
            </ul>
            <a href="index.html" class="back-link" style="display: inline-block; margin-top: 16px;">Go to Contact Form →</a>
        `;
    successAlert.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Set loading state
  function setLoading(loading) {
    submitBtn.disabled = loading;
    if (loading) {
      submitBtn.textContent = "Setting up...";
      submitBtn.style.opacity = "0.7";
    } else {
      submitBtn.textContent = "Setup Backend";
      submitBtn.style.opacity = "1";
    }
  }

  // Update step status
  function updateStep(stepId, status) {
    const step = steps[stepId];
    if (step) {
      step.className = `progress-item ${status}`;
    }
  }

  // Make API request
  async function apiRequest(url, method, token, body = null) {
    const options = {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {
        // Response wasn't JSON
      }
      throw new Error(errorMsg);
    }

    return response;
  }

  // Setup backend
  async function setupBackend(serviceUrl, adminJwt) {
    // Normalize service URL (remove trailing slash)
    serviceUrl = serviceUrl.replace(/\/$/, "");

    setupProgress.classList.add("active");

    try {
      // Step 1: Create _schemas collection
      updateStep("step1", "running");
      try {
        await apiRequest(`${serviceUrl}/_schemas`, "PUT", adminJwt, {});
        updateStep("step1", "success");
      } catch (error) {
        // Collection might already exist, check if it's accessible
        try {
          await apiRequest(`${serviceUrl}/_schemas`, "GET", adminJwt);
          updateStep("step1", "success");
        } catch (e) {
          throw new Error(
            `Failed to create /_schemas collection: ${error.message}`,
          );
        }
      }

      // Step 2: Add contact schema
      updateStep("step2", "running");
      await apiRequest(
        `${serviceUrl}/_schemas/contact?wm=upsert`,
        "PUT",
        adminJwt,
        contactSchema,
      );
      updateStep("step2", "success");

      // Step 3: Create contacts collection with validation
      updateStep("step3", "running");
      try {
        await apiRequest(`${serviceUrl}/contacts`, "PUT", adminJwt, {
          jsonSchema: {
            schemaId: "contact",
          },
        });
        updateStep("step3", "success");
      } catch (error) {
        // Collection might already exist, try to update it
        try {
          await apiRequest(`${serviceUrl}/contacts`, "PATCH", adminJwt, {
            jsonSchema: {
              schemaId: "contact",
            },
          });
          updateStep("step3", "success");
        } catch (e) {
          throw new Error(
            `Failed to create /contacts collection: ${error.message}`,
          );
        }
      }

      // Step 4: Configure permissions
      updateStep("step4", "running");
      await apiRequest(
        `${serviceUrl}/acl?wm=upsert`,
        "POST",
        adminJwt,
        permission,
      );
      updateStep("step4", "success");

      // Step 5: Complete setup
      updateStep("step5", "running");
      updateStep("step5", "success");

      showSuccess();
    } catch (error) {
      console.error("Setup error:", error);
      showError(
        error.message ||
          "Setup failed. Please check your credentials and try again.",
      );
      throw error;
    }
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    hideAlerts();

    const adminJwt = adminJwtInput.value.trim();

    if (!adminJwt) {
      showError("Please enter your admin JWT token.");
      return;
    }

    // Reset progress
    Object.keys(steps).forEach((stepId) => {
      updateStep(stepId, "pending");
    });

    setLoading(true);

    try {
      await setupBackend(serviceUrl, adminJwt);
    } catch (error) {
      // Error already shown
    } finally {
      setLoading(false);
    }
  }

  // Attach event listener
  form.addEventListener("submit", handleSubmit);

  console.log("Setup page: JavaScript loaded");
})();
