from django.core.management.base import BaseCommand
from core.models import OrganizationLevel


class Command(BaseCommand):
    help = 'Check current organizational levels in the database'

    def handle(self, *args, **options):
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("  CURRENT ORGANIZATIONAL LEVELS"))
        self.stdout.write("="*80 + "\n")

        levels = OrganizationLevel.objects.all().order_by('rank')
        
        if not levels.exists():
            self.stdout.write(self.style.WARNING("❌ NO LEVELS FOUND IN DATABASE"))
            return

        self.stdout.write(f"\n✅ Found {levels.count()} level(s):\n")
        self.stdout.write(f"{'ID':<6} {'Code':<8} {'Name':<25} {'Rank':<10} {'Description':<35}")
        self.stdout.write("-" * 90)
        
        for level in levels:
            self.stdout.write(
                f"{level.id:<6} {level.level_code:<8} {level.name:<25} {float(level.rank):<10.1f} {level.description[:35]:<35}"
            )

        self.stdout.write("\n" + "="*80 + "\n")
