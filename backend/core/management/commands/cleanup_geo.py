from django.core.management.base import BaseCommand
from core.models import (
    GeoContinent, GeoCountry, GeoState, GeoDistrict, GeoMandal,
    GeoCluster
)

class Command(BaseCommand):
    help = 'Wipe all geographic data for a fresh start'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🚀 Starting FULL Geo Data Wipe...'))

        # Order matters for foreign keys, deleting children first
        models_to_clear = [
            GeoCluster, GeoMandal, GeoDistrict, GeoState, GeoCountry, GeoContinent
        ]

        total_deleted = 0
        for model in models_to_clear:
            count, _ = model.objects.all().delete()
            if count > 0:
                self.stdout.write(f"Cleared {count} records from {model.__name__}")
                total_deleted += count

        self.stdout.write(self.style.SUCCESS(f'✨ Database is clean! Total records removed: {total_deleted}'))
        self.stdout.write(self.style.INFO('You can now start uploading your Continents.'))
