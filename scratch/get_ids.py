from core.models import GeoContinent, GeoCountry, GeoState
def get_ids():
    asia = GeoContinent.objects.filter(name__iexact='ASIA').first()
    india = GeoCountry.objects.filter(name__iexact='INDIA').first()
    ap = GeoState.objects.filter(name__iexact='ANDHRA PRADESH').first()
    print(f"ASIA: {asia.id if asia else 'None'}")
    print(f"INDIA: {india.id if india else 'None'}")
    print(f"AP: {ap.id if ap else 'None'}")

if __name__ == "__main__":
    get_ids()
