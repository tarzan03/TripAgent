const destinationInput = document.querySelector("#destination");
const hint = document.querySelector("#destination-hint");
const form = document.querySelector("#trip-form");
const message = document.querySelector("#form-message");
const resultsContainer = document.querySelector("#trip-results");
const submitButton = form.querySelector('button[type="submit"]');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMarkdown(markdown) {
  const source = String(markdown || "");

  if (window.marked && window.DOMPurify) {
    return window.DOMPurify.sanitize(window.marked.parse(source));
  }

  return `<p>${escapeHtml(source).replace(/\n/g, "<br>")}</p>`;
}

function getText(value) {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value, null, 2);
}

function createResultCard(item, type) {
  const card = document.createElement("article");
  card.className = "result-card";

  const imageUrl =
    item.image_url || item.image || item.photo_url || item.thumbnail;

  const title =
    item.name ||
    item.hotel_name ||
    item.flight_name ||
    item.airline ||
    item.title ||
    `${type} recommendation`;

  const details =
    item.description ||
    item.price ||
    item.location ||
    item.summary ||
    "Details available in your travel plan.";

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = title;
    image.loading = "lazy";
    card.appendChild(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";
    placeholder.textContent = `${type} image`;
    card.appendChild(placeholder);
  }

  const content = document.createElement("div");
  content.className = "result-card-content";

  const heading = document.createElement("h4");
  heading.textContent = title;

  const description = document.createElement("p");
  description.textContent = getText(details);

  content.append(heading, description);
  card.appendChild(content);

  return card;
}

function addResultSection(title, items, type) {
  if (!Array.isArray(items) || items.length === 0) return;

  const section = document.createElement("section");
  section.className = "result-section";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const grid = document.createElement("div");
  grid.className = "result-grid";

  items.slice(0, 6).forEach((item) => {
    grid.appendChild(createResultCard(item, type));
  });

  section.append(heading, grid);
  resultsContainer.appendChild(section);
}

function renderResults(data) {
  resultsContainer.innerHTML = "";
  resultsContainer.hidden = false;

  const kicker = document.createElement("p");
  kicker.className = "results-kicker";
  kicker.textContent = "Your Wanderer itinerary";

  const title = document.createElement("h2");
  title.className = "results-title";
  title.textContent = "Your trip plan";

  const answer = document.createElement("div");
  answer.className = "results-answer markdown-output";
  answer.innerHTML = renderMarkdown(getText(data.answer));

  resultsContainer.append(kicker, title, answer);

  if (data.itinerary) {
    const section = document.createElement("section");
    section.className = "result-section";

    const heading = document.createElement("h3");
    heading.textContent = "Suggested itinerary";

    const itinerary = document.createElement("div");
    itinerary.className = "results-answer markdown-output";
    itinerary.innerHTML = renderMarkdown(getText(data.itinerary));

    section.append(heading, itinerary);
    resultsContainer.appendChild(section);
  }

  addResultSection("Flight options", data.flight_results, "flight");
  addResultSection("Places to stay", data.hotel_results, "hotel");

  resultsContainer.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

document.querySelectorAll("[data-destination]").forEach((button) => {
  button.addEventListener("click", () => {
    destinationInput.value = button.dataset.destination;
    hint.textContent = "A beautiful choice.";
    destinationInput.focus();
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = destinationInput.value.trim();
  const dates = document.querySelector("#dates").value;
  const travelers = document.querySelector("#travelers").value;

  if (!query) {
    hint.textContent = "Tell us where you would like to go.";
    destinationInput.focus();
    return;
  }

  submitButton.disabled = true;
  resultsContainer.hidden = true;
  message.innerHTML =
    '<span class="loading"><span class="loader"></span> Designing your journey…</span>';

  try {
    const travelMessage = [
      query,
      dates && `Travel date: ${dates}.`,
      travelers && `Travelers: ${travelers}.`,
    ]
      .filter(Boolean)
      .join("\n");

    const response = await fetch("/api/travel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: travelMessage,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Server returned ${response.status}`);
    }

    renderResults(data);
    message.textContent = "Your journey is ready.";
  } catch (error) {
    console.error("Travel-plan error:", error);
    message.textContent =
      "We could not create your trip plan. Please try again.";
  } finally {
    submitButton.disabled = false;
  }
});