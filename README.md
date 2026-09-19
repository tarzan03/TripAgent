# Wanderer AI

Wanderer AI is an AI-powered travel planning companion. Describe the trip you have in mind and it creates a tailored plan with suggested itineraries, flights, and stays.

The project pairs a FastAPI backend and PostgreSQL persistence layer with a responsive travel-planning interface. Its results area supports Markdown, so recommendations are easy to scan and act on.

## Features

- Natural-language trip requests, such as “Plan a five-day Nepal trip from Delhi under ₹50,000.”
- AI-generated travel answers and itinerary suggestions.
- Flight and hotel result sections, with support for returned image URLs.
- Date picker, traveler selector, popular-destination shortcuts, and loading feedback.
- Safe Markdown rendering for readable itineraries.
- PostgreSQL-backed application state.
- Docker-ready deployment for Render.

## Project structure

```text
TripAgent/
├── app.py                 # FastAPI routes and web application
├── backend.py             # Travel-agent orchestration
├── Dockerfile             # Production container image
├── docker-compose.yaml    # Optional local PostgreSQL setup
├── pyproject.toml         # uv dependency configuration
├── uv.lock                # Locked dependency versions
├── static/
│   ├── script.js          # Browser-side API and result rendering
│   └── style.css          # Wanderer visual design
└── templates/
    └── index.html         # Main interface
```

## Requirements

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- PostgreSQL (local Docker database or Render Postgres)
- API keys required by the travel-agent backend

## Local development

Create your local environment and install locked dependencies:

```bash
uv sync
```

Create a `.env` file. Do not put spaces around `=` and do not commit this file.

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/tripagent
GROQ_API_KEY=your_key_here
LANGSMITH_API_KEY=your_key_here
```

Start the application with hot reload:

```bash
uv run uvicorn app:app --reload
```

Visit - https://wanderer-ai.onrender.com/.

## Local PostgreSQL with Docker Compose

If `docker-compose.yaml` defines the local `db` service, start it with:

```bash
docker compose up -d db
```

When the FastAPI app runs directly on your computer, use this local connection URL:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/tripagent
```

When the FastAPI app and database both run through Docker Compose, the database hostname is the Compose service name:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/tripagent
```

## API

### `POST /api/travel`

Send a travel request:

```json
{
  "message": "Plan a five-day trip to Nepal from Delhi under ₹50,000.",
  "thread_id": null
}
```

The API returns a travel-agent response, itinerary, and optional flight and hotel results:

```json
{
  "success": true,
  "thread_id": "...",
  "answer": "# Your Nepal Trip\n...",
  "flight_results": [],
  "hotel_results": [],
  "itinerary": "...",
  "llm_calls": 0
}
```

## Docker

Build the web application image:

```bash
docker build -t wanderer-ai .
```

Run it locally (with a valid `.env` file):

```bash
docker run --rm -p 8000:8000 --env-file .env -e PORT=8000 wanderer-ai
```

If PostgreSQL is in a separate Docker Compose service, run the application through Compose so it can reach the database at the `db` hostname.

## Deploying to Render

1. Push the project to GitHub.
2. Create a Render Postgres database.
3. Create a Render Web Service from the repository and select the **Docker** runtime.
4. Keep the database and web service in the same Render region.
5. Add environment variables to the web service, including API keys and `DATABASE_URL`.
6. Set `DATABASE_URL` to the **Internal Database URL** from the Render Postgres Connect menu.

Use the internal URL for the deployed Render service. It connects through Render’s private network. Use the external URL only for tools outside Render, such as local development clients.

## Security notes

- Keep `.env`, API keys, and database URLs out of Git.
- Use Render environment variables for production secrets.
- The frontend sanitizes AI-generated Markdown before displaying it.
- URL-encode special characters in database passwords when placing them in a PostgreSQL URL.

## License

Add a license appropriate for your project before publishing or sharing the repository.
