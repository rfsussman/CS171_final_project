document.addEventListener("DOMContentLoaded", () => {
    // select all dots and steps
    const dots = document.querySelectorAll(".dot");
    const steps = document.querySelectorAll(".step");

    // create a tooltip element to add text to the dots

    // initialize tooltip
    const tooltip = document.createElement("div");

    // add dot-tooltip class
    tooltip.classList.add("dot-tooltip");

    // append tooltip to DOM
    document.body.appendChild(tooltip);

    // when a dot is clicked, switch to that section of the webpage
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            // note current step
            const step = steps[index];

            // if the step exists, scroll smoothly into it
            if (step) {
                step.scrollIntoView({ behavior: "smooth" });

                // highlight the active dot
                dots.forEach(d => d.classList.remove("active-dot"));
                dot.classList.add("active-dot");
            }
        });
    });

    // for each dot, add mouseover event
    dots.forEach((dot) => {
        const previewText = dot.getAttribute("data-preview"); // extract text

        dot.addEventListener("mouseover", (e) => {
            tooltip.textContent = previewText; // assign text to tooltip text content
            tooltip.style.display = "block";
            tooltip.style.left = `${e.pageX - 150}px`; // position tooltip to the right of the cursor
            tooltip.style.top = `${e.pageY - 50}px`; // position tooltip below the cursor
        });

        dot.addEventListener("mouseout", () => {
            tooltip.style.display = "none"; // hide tooltip on mouseout
        });
    });
});



