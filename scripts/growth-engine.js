// GSAP animation setup
const slider = document.getElementById("growth-slider");
const emailMetric = document.getElementById("email-metric");
const revenueMetric = document.getElementById("revenue-metric");
const returnMetric = document.getElementById("return-metric");

// Initial animation
gsap.from(".growth-engine", {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
});

// Update values dynamically
slider.addEventListener("input", function() {
    let value = parseInt(slider.value);
    
    // Calculate metrics with exact start and end values
    const emailValue = value === 100 ? 100000 : Math.round(1 + (value / 100) * 99999); // Linear scale from 1 to 100,000
    console.log('Slider value:', value);
    console.log('Email calculation:', emailValue);
    
    const revenueValue = Math.round(15 + (value / 100) * 45); // Start: $15, End: $60
    const returnValue = Math.round(10 + (value / 100) * 35); // Start: 10%, End: 45%

    // Update email metric directly
    emailMetric.textContent = emailValue.toLocaleString();
    
    // Animate other metrics
    gsap.to(revenueMetric, {
        textContent: revenueValue.toString(),
        duration: 0.5,
        snap: { textContent: 1 }
    });
    
    gsap.to(returnMetric, {
        textContent: returnValue.toString() + "%",
        duration: 0.5,
        snap: { textContent: 1 }
    });

    // Adjust opacity of the struggling vs engineered visuals
    gsap.to(".struggling", {
        opacity: 1 - (value / 100) * 0.9,
        scale: 1 - (value / 100) * 0.1,
        duration: 0.5
    });
    
    gsap.to(".engineered", {
        opacity: 0.1 + (value / 100) * 0.9,
        scale: 0.9 + (value / 100) * 0.1,
        duration: 0.5
    });
}); 