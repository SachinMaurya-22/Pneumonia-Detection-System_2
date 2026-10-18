
document.addEventListener("DOMContentLoaded", () => {
    // ---------- 1. Select HTML Elements ----------

    const uploadForm = document.getElementById("upload-form");
    const fileInput = document.getElementById("xray-upload");
    const uploadZone = document.getElementById("upload-zone");

    const previewCard = document.getElementById("preview-card");
    const previewImage = document.getElementById("xray-preview");
    const fileName = document.getElementById("file-name");
    const fileSize = document.getElementById("file-size");

    const clearButton = document.getElementById("clear-upload");
    const removeButton = document.getElementById("remove-image");
    const analyzeButton = document.getElementById("analyze-button");
    const formMessage = document.getElementById("form-message");

    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebar-overlay");

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const ALLOWED_TYPES = [
        "image/jpeg",
        "image/png"
    ];

    let currentObjectUrl = null;


    // ---------- 2. Show Messages ----------

    function showMessage(message) {
        if (!formMessage) return;

        formMessage.textContent = message;
        formMessage.hidden = false;
    }

    function clearMessage() {
        if (!formMessage) return;

        formMessage.textContent = "";
        formMessage.hidden = true;
    }


    // ---------- 3. Format File Size ----------

    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return `${bytes} bytes`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }


    // ---------- 4. Release Previous Preview ----------

    function releasePreview() {
        if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
            currentObjectUrl = null;
        }

        if (previewImage) {
            previewImage.removeAttribute("src");
        }
    }


    // ---------- 5. Validate Selected File ----------

    function validateFile(file) {
        if (!file) {
            return "Please select a chest X-ray image.";
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return "Please select a JPG, JPEG or PNG image.";
        }

        if (file.size <= 0) {
            return "The selected file is empty.";
        }

        if (file.size > MAX_FILE_SIZE) {
            return "File size must not exceed 10 MB.";
        }

        return null;
    }


    // ---------- 6. Reset Upload ----------

    function resetUpload() {
        if (fileInput) {
            fileInput.value = "";
        }

        releasePreview();

        if (previewCard) {
            previewCard.hidden = true;
        }

        if (fileName) {
            fileName.textContent = "";
        }

        if (fileSize) {
            fileSize.textContent = "";
        }

        if (analyzeButton) {
            analyzeButton.disabled = false;
        }

        clearMessage();
    }


    // ---------- 7. Display Image Preview ----------

    function displayFile(file) {
        clearMessage();

        const error = validateFile(file);

        if (error) {
            resetUpload();
            showMessage(error);
            return;
        }

        releasePreview();

        currentObjectUrl = URL.createObjectURL(file);

        if (previewImage) {
            previewImage.onload = () => {
                if (previewCard) {
                    previewCard.hidden = false;
                }
            };

            previewImage.onerror = () => {
                resetUpload();
                showMessage(
                    "Unable to read this image. Please choose another file."
                );
            };

            previewImage.src = currentObjectUrl;
        }

        if (fileName) {
            fileName.textContent = file.name;
            fileName.title = file.name;
        }

        if (fileSize) {
            fileSize.textContent = formatFileSize(file.size);
        }
    }


    // ---------- 8. File Selection ----------

    if (fileInput) {
        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];

            if (file) {
                displayFile(file);
            } else {
                resetUpload();
            }
        });
    }


    // ---------- 9. Drag and Drop ----------

    if (uploadZone) {
        ["dragenter", "dragover"].forEach(eventName => {
            uploadZone.addEventListener(eventName, event => {
                event.preventDefault();
                event.stopPropagation();

                uploadZone.classList.add("drag-over");
            });
        });

        ["dragleave", "dragend", "drop"].forEach(eventName => {
            uploadZone.addEventListener(eventName, event => {
                event.preventDefault();
                event.stopPropagation();

                uploadZone.classList.remove("drag-over");
            });
        });

        uploadZone.addEventListener("drop", event => {
            const file = event.dataTransfer?.files?.[0];

            if (!file || !fileInput) {
                showMessage("Please drop a valid image file.");
                return;
            }

            try {
                const transfer = new DataTransfer();
                transfer.items.add(file);
                fileInput.files = transfer.files;

                displayFile(file);
            } catch {
                showMessage(
                    "Unable to select this file. Please use Browse Files."
                );
            }
        });
    }


    // ---------- 10. Clear and Remove Buttons ----------

    if (clearButton) {
        clearButton.addEventListener("click", resetUpload);
    }

    if (removeButton) {
        removeButton.addEventListener("click", resetUpload);
    }


    // ---------- 11. Validate Before Submission ----------

    if (uploadForm && fileInput) {
        uploadForm.addEventListener("submit", event => {
            const file = fileInput.files[0];
            const error = validateFile(file);

            if (error) {
                event.preventDefault();
                showMessage(error);
                return;
            }

            clearMessage();

            if (analyzeButton) {
                analyzeButton.disabled = true;

                const buttonText = analyzeButton.querySelector("span");

                if (buttonText) {
                    buttonText.textContent = "Processing...";
                }
            }
        });
    }


    // ---------- 12. Mobile Sidebar ----------

    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("active");
        }

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }

        document.body.style.overflow = "";
    }

    function toggleSidebar() {
        if (!sidebar || !sidebarOverlay || !menuToggle) {
            return;
        }

        const isOpen = sidebar.classList.toggle("open");

        sidebarOverlay.classList.toggle("active", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));

        document.body.style.overflow = isOpen ? "hidden" : "";
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", toggleSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    if (sidebar) {
        sidebar.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", closeSidebar);
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeSidebar();
        }
    });
});
