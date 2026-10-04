const form = document.getElementById("predictionForm");

const inputGrid = document.getElementById("inputGrid");

const predictBtn = document.getElementById("predictBtn");

const resetBtn = document.getElementById("resetBtn");

const resultSection = document.getElementById("resultSection");

const predictionValue =
    document.getElementById("predictionValue");

const qualityMessage =
    document.getElementById("qualityMessage");

const qualityBadge =
    document.getElementById("qualityBadge");

const errorMessage =
    document.getElementById("errorMessage");

const errorText =
    document.getElementById("errorText");

const closeError =
    document.getElementById("closeError");

/* =====================================
Pretty feature names
===================================== */

function formatFeatureName(name) {

    return name
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}

/* =====================================
Icons for common wine features
===================================== */

function getFeatureIcon(name) {

    const feature = name.toLowerCase();

    if (feature.includes("alcohol"))
        return "fa-wine-glass";

    if (feature.includes("acid"))
        return "fa-flask";

    if (feature.includes("sugar"))
        return "fa-cubes-stacked";

    if (feature.includes("density"))
        return "fa-weight-scale";

    if (feature.includes("ph"))
        return "fa-vial";

    if (feature.includes("sulfur"))
        return "fa-cloud";

    if (feature.includes("chloride"))
        return "fa-droplet";

    if (feature.includes("citric"))
        return "fa-lemon";

    return "fa-chart-simple";

}

/* =====================================
Show Error
===================================== */

function showError(message) {

    errorText.textContent = message;

    errorMessage.classList.remove("hidden");

    errorMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

function hideError() {

    errorMessage.classList.add("hidden");

}

/* =====================================
Generate Input Fields
===================================== */

function createInput(feature, index) {

    const wrapper =
        document.createElement("div");

    wrapper.className = "input-group";


    const label =
        document.createElement("label");

    label.setAttribute(
        "for",
        `feature-${index}`
    );

    label.textContent =
        formatFeatureName(feature);


    const inputWrapper =
        document.createElement("div");

    inputWrapper.className =
        "input-wrapper";


    const icon =
        document.createElement("i");

    icon.className =
        `fa-solid ${getFeatureIcon(feature)} input-icon`;


    const input =
        document.createElement("input");

    input.type = "number";

    input.step = "any";

    input.id = `feature-${index}`;

    input.name = feature;

    input.placeholder = "Enter value";

    input.autocomplete = "off";

    input.required = true;


    input.addEventListener(
        "input",
        () => {

            input.setCustomValidity("");

        }
    );


    inputWrapper.appendChild(icon);

    inputWrapper.appendChild(input);


    wrapper.appendChild(label);

    wrapper.appendChild(inputWrapper);


    return wrapper;

}

/* =====================================
Load Model Columns
===================================== */

async function loadColumns() {

    try {

        const response =
            await fetch("/cols");


        if (!response.ok) {

            throw new Error(
                "Unable to load model features."
            );

        }


        const columns =
            await response.json();


        if (
            !Array.isArray(columns) ||
            columns.length === 0
        ) {

            throw new Error(
                "No model features were found."
            );

        }


        inputGrid.innerHTML = "";


        columns.forEach(
            (column, index) => {

                const input =
                    createInput(
                        column,
                        index
                    );

                inputGrid.appendChild(input);

            }
        );


    } catch (error) {

        inputGrid.innerHTML = "";

        showError(
            error.message ||
            "Unable to connect to the prediction server."
        );

    }

}

/* =====================================
Quality Interpretation
===================================== */

function getQualityInfo(score) {

    if (score >= 8) {

        return {
            label: "Excellent",
            message:
                "The model predicts an exceptionally high-quality wine.",
            color: "excellent"
        };

    }


    if (score >= 7) {

        return {
            label: "Very Good",
            message:
                "The model predicts a very good quality wine.",
            color: "very-good"
        };

    }


    if (score >= 6) {

        return {
            label: "Good",
            message:
                "The model predicts a good quality wine.",
            color: "good"
        };

    }


    if (score >= 5) {

        return {
            label: "Average",
            message:
                "The model predicts an average quality wine.",
            color: "average"
        };

    }


    return {
        label: "Low",
        message:
            "The predicted quality is relatively low.",
        color: "low"
    };

}

/* =====================================
Display Result
===================================== */

function showResult(score) {

    const numericScore =
        Number(score);


    predictionValue.textContent =
        Number.isInteger(numericScore)
            ? numericScore
            : numericScore.toFixed(2);


    const info =
        getQualityInfo(numericScore);


    qualityMessage.textContent =
        info.message;


    qualityBadge.textContent =
        info.label;


    qualityBadge.className =
        `quality-badge ${info.color}`;


    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

/* =====================================
Submit Prediction
===================================== */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        hideError();


        if (!form.checkValidity()) {

            form.reportValidity();

            return;

        }


        predictBtn.classList.add(
            "loading"
        );


        try {

            const formData =
                new FormData(form);


            const response =
                await fetch(
                    "/predict",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Prediction failed."
                );

            }


            if (
                data.prediction === undefined
            ) {

                throw new Error(
                    "The server returned an invalid prediction."
                );

            }


            showResult(
                data.prediction
            );


        } catch (error) {

            showError(
                error.message ||
                "Unable to generate prediction."
            );

        } finally {

            predictBtn.classList.remove(
                "loading"
            );

        }

    }

);

/* =====================================
Reset
===================================== */

resetBtn.addEventListener(
    "click",
    () => {

        form.reset();

        resultSection.classList.add(
            "hidden"
        );

        hideError();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

);

/* =====================================
Close Error
===================================== */

closeError.addEventListener(
    "click",
    hideError
);

/* =====================================
Initialize
===================================== */

loadColumns();