document.addEventListener("DOMContentLoaded", () => {
    // Select all dots and steps
    const dots = document.querySelectorAll(".dot");
    const steps = document.querySelectorAll(".step");

    // Create a tooltip element
    const tooltip = document.createElement("div");
    tooltip.classList.add("dot-tooltip");
    document.body.appendChild(tooltip);

    // Add click event listener for each dot
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            // Scroll to the corresponding step
            const step = steps[index];
            if (step) {
                step.scrollIntoView({ behavior: "smooth" });

                // Optional: Highlight the active dot
                dots.forEach(d => d.classList.remove("active-dot"));
                dot.classList.add("active-dot");
            }
        });
    });

    // Add mouseover and mouseout events for each dot
    dots.forEach((dot) => {
        const previewText = dot.getAttribute("data-preview"); // Get preview text from data-preview attribute

        dot.addEventListener("mouseover", (e) => {
            tooltip.textContent = previewText; // Set tooltip content
            tooltip.style.display = "block";
            tooltip.style.left = `${e.pageX - 200}px`; // Position tooltip to the right of the cursor
            tooltip.style.top = `${e.pageY - 50}px`; // Position tooltip below the cursor
        });

        dot.addEventListener("mousemove", (e) => {
            tooltip.style.left = `${e.pageX - 200}px`; // Update tooltip position as the mouse moves
            tooltip.style.top = `${e.pageY - 50}px`;
        });

        dot.addEventListener("mouseout", () => {
            tooltip.style.display = "none"; // Hide tooltip on mouseout
        });
    });
});



