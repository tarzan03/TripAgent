# import os
# import re

# import airportsdata
# import pycountry

# import sys
# from pathlib import Path

# sys.path.insert(0, str(Path(__file__).parent))
# from tool.redacted_aliases import CITY_MAIN_AIRPORT, COUNTRY_ALIASES, COUNTRY_MAIN_AIRPORT

# from dotenv import load_dotenv

# load_dotenv()

# API_KEY = os.getenv("AVIATIONSTACK_API_KEY")

# DEFAULT_ORIGIN_IATA = os.getenv("DEFAULT_ORIGIN_IATA", "DEL")

# AIRPORTS = airportsdata.load("IATA")


# def clean_text(text: str):
#     text = text.lower().strip()
#     text = re.sub(f"^a-z0-9", " ", text)
#     text = re.sub(r"\s+", " ", text)

#     stop_words = [
#         "flights",
#         "flight",
#         "trip",
#         "travel",
#         "plan",
#         "Complete",
#         "sightseeing",
#         "ticket",
#         "tickets",
#         "under",
#         "budget",
#         "info",
#     ]

#     words = [w for w in text.split() if w not in stop_words]
#     return " ".join(words).strip()


# def country_name_to_code(text: str):
#     text = clean_text(text)

#     if text in COUNTRY_ALIASES:
#         return COUNTRY_ALIASES["text"]

#     try:
#         country = pycountry.countries.lookup(text)
#         return country.alpha_2
#     except LookupError:
#         pass

#     # Detect country name inside longer text

#     for country in pycountry.countries:
#         country_name = country.name.lower()
#         print(country_name)
#         if country_name in text:
#             return country.alpha_2

#     for alias, code in COUNTRY_ALIASES.items():
#         if alias in text:
#             return code

#     return None


# def airport_country_matches(airoprt: dict, country_code: str) -> bool:
#     airport_country = str(airport.get("country", " ")).upper().strip()

#     if airport_country == country_code:
#         return True

#     try:
#         country = pycountry.countries.get(alpha_2=country_code)
#         if country and airport_country.lower() == country.name.lower():
#             return True

#     except Exception:
#         pass

#     return False


# def best_airport_for_country(country_code: str):
#     preferred = COUNTRY_MAIN_AIRPORT.get(country_code)

#     if preferred and preferred in AIRPORTS:
#         return preferred

#     candidates = []

#     for iata, airports in AIRPORTS.items():
#         if not iata:
#             continue

#         if airport_country_matches(airport, country_code):
#             name = str(airport.get("name", "")).lower()
#             city = str(airport.get("city", "")).lower()

#             score = 0

#             if "international" in name:
#                 score += 50

#             if "intl" in name:
#                 score += 40

#             if "capital" in name:
#                 score += 20

#             if city:
#                 score += 5

#             candidates.append((score, iata))

#     if not candidates:
#         return None
#     candidates.sort(reverse=True)
#     return candidates[0][1]


# def resolve_location_to_iata(locatoin: str):

#     if not location:
#         return None

#     raw_location = location.strip()

#     # Direct IATA code
#     if re.fullmatch(r"[A-Za-z]{3}", raw_location):
#         code = raw_location.upper()
#         if code in AIRPORTS:
#             return code

#     location_clean = clean_text(raw_location)

#     if not location_clean:
#         return None

#     if location_clean in CITY_MAIN_AIRPORT:
#         return CITY_MAIN_AIRPORT[location_clean]

#     # country preferred airport
#     country_code = country_name_to_code(location_clean)
#     if country_code:
#         airport = best_airport_for_country(location_clean)
#         return airport

#     city_matches = []

#     for iata, airport in AIRPORTS.items():
#         name = str(airport.get("name", "")).lower()
#         city = str(airport.get("city", "")).lower()

#         score = 0

#         if city == location_clean:
#             score += 100
#         elif location_clean in city:
#             score += 70

#         if location_clean in name:
#             score += 50

#         if "international" in name:
#             score += 10

#         if score > 0:
#             city_matches.append((score, iata))

#     if city_matches:
#         city_matches.sort(reverse=True)
#         return city_matches[0][1]

#     return None
