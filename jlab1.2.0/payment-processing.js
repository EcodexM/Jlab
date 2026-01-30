(() => {
    const STRIPE_SCRIPT_SRC = "https://js.stripe.com/v3/pricing-table.js";
    const PRICING_TABLE_SELECTOR = "stripe-pricing-table";

    function ensureStripePricingTableScript() {
        if (document.querySelector(`script[src="${STRIPE_SCRIPT_SRC}"]`)) {
            return;
        }
        const script = document.createElement("script");
        script.async = true;
        script.src = STRIPE_SCRIPT_SRC;
        document.head.appendChild(script);
    }

    async function subscribe(plan) {
        if (!plan) return;
        const response = await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || error.message || "Subscription failed.");
        }

        const payload = await response.json();
        if (payload && payload.url) {
            window.location.href = payload.url;
            return;
        }
        throw new Error("Missing checkout URL.");
    }

    function initPricingTable() {
        const table = document.querySelector(PRICING_TABLE_SELECTOR);
        if (!table) return;
        ensureStripePricingTableScript();
    }

    window.JLabPayments = {
        initPricingTable,
        subscribe
    };

    document.addEventListener("DOMContentLoaded", () => {
        initPricingTable();
    });
})();
