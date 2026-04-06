from django.core.management.base import BaseCommand
from core.models import GeoContinent, GeoCountry

class Command(BaseCommand):
    help = 'Populate initial geographic data (continents and countries)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating geographic data...')
        
        # Create Continents
        continents_data = [
            {'name': 'Africa', 'code': 'AF'},
            {'name': 'Antarctica', 'code': 'AN'},
            {'name': 'Asia', 'code': 'AS'},
            {'name': 'Europe', 'code': 'EU'},
            {'name': 'North America', 'code': 'NA'},
            {'name': 'Oceania', 'code': 'OC'},
            {'name': 'South America', 'code': 'SA'},
        ]
        
        continents = {}
        for continent_data in continents_data:
            continent, created = GeoContinent.objects.get_or_create(
                name=continent_data['name'],
                defaults={'code': continent_data['code']}
            )
            continents[continent.name] = continent
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created continent: {continent.name}'))
            else:
                self.stdout.write(f'Continent already exists: {continent.name}')
        
        # Create some major countries (you can expand this list)
        countries_data = [
            {'name': 'India', 'code': 'IN', 'continent': 'Asia'},
            {'name': 'United States', 'code': 'US', 'continent': 'North America'},
            {'name': 'United Kingdom', 'code': 'GB', 'continent': 'Europe'},
            {'name': 'China', 'code': 'CN', 'continent': 'Asia'},
            {'name': 'Japan', 'code': 'JP', 'continent': 'Asia'},
            {'name': 'Germany', 'code': 'DE', 'continent': 'Europe'},
            {'name': 'France', 'code': 'FR', 'continent': 'Europe'},
            {'name': 'Canada', 'code': 'CA', 'continent': 'North America'},
            {'name': 'Australia', 'code': 'AU', 'continent': 'Oceania'},
            {'name': 'Brazil', 'code': 'BR', 'continent': 'South America'},
            {'name': 'South Africa', 'code': 'ZA', 'continent': 'Africa'},
            {'name': 'Russia', 'code': 'RU', 'continent': 'Europe'},
            {'name': 'Mexico', 'code': 'MX', 'continent': 'North America'},
            {'name': 'Italy', 'code': 'IT', 'continent': 'Europe'},
            {'name': 'Spain', 'code': 'ES', 'continent': 'Europe'},
            {'name': 'South Korea', 'code': 'KR', 'continent': 'Asia'},
            {'name': 'Indonesia', 'code': 'ID', 'continent': 'Asia'},
            {'name': 'Saudi Arabia', 'code': 'SA', 'continent': 'Asia'},
            {'name': 'Turkey', 'code': 'TR', 'continent': 'Asia'},
            {'name': 'Netherlands', 'code': 'NL', 'continent': 'Europe'},
        ]
        
        for country_data in countries_data:
            continent = continents.get(country_data['continent'])
            country, created = GeoCountry.objects.get_or_create(
                name=country_data['name'],
                defaults={
                    'code': country_data['code'],
                    'continent_ref': continent,
                    'continent': country_data['continent']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created country: {country.name}'))
            else:
                # Update continent_ref if it was missing
                if not country.continent_ref and continent:
                    country.continent_ref = continent
                    country.continent = continent.name
                    country.save()
                    self.stdout.write(self.style.WARNING(f'Updated country: {country.name}'))
                else:
                    self.stdout.write(f'Country already exists: {country.name}')
        
        self.stdout.write(self.style.SUCCESS('Geographic data population complete!'))
