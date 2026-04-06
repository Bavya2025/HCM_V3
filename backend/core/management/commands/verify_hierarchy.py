from django.core.management.base import BaseCommand
from core.models import (
    OrganizationLevel, Office, Department, Section,
    GeoCountry, GeoState, GeoDistrict, GeoMandal,
    Employee, Position, Role, Job
)


class Command(BaseCommand):
    help = 'Verify the organizational hierarchy and geographic data structure'

    def handle(self, *args, **options):
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("  ORGANIZATIONAL LEVELS VERIFICATION"))
        self.stdout.write("="*80 + "\n")

        # Check Organizational Levels
        levels = OrganizationLevel.objects.all().order_by('rank')
        if levels.exists():
            self.stdout.write(self.style.SUCCESS(f"✅ Found {levels.count()} organizational level(s):\n"))
            self.stdout.write(f"{'Code':<8} {'Name':<25} {'Rank':<10} {'Description':<40}")
            self.stdout.write("-" * 83)
            for level in levels:
                self.stdout.write(
                    f"{level.level_code:<8} {level.name:<25} {float(level.rank):<10.1f} {level.description[:40]:<40}"
                )
        else:
            self.stdout.write(self.style.WARNING("❌ NO ORGANIZATIONAL LEVELS FOUND"))
            self.stdout.write("   Action: Create levels as per END_TO_END_TESTING_WORKFLOW.md Phase 1.1\n")

        # Check Offices
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("  OFFICES"))
        self.stdout.write("="*80 + "\n")

        offices = Office.objects.all().select_related('level')
        if offices.exists():
            self.stdout.write(self.style.SUCCESS(f"✅ Found {offices.count()} office(s):\n"))
            self.stdout.write(f"{'Office Name':<40} {'Level':<20} {'Location':<20}")
            self.stdout.write("-" * 80)
            for office in offices[:15]:  # Show first 15
                level_name = office.level.name if office.level else 'N/A'
                location = f"{office.state_name or 'N/A'}, {office.district_name or ''}"
                self.stdout.write(
                    f"{office.name[:39]:<40} {level_name:<20} {location[:19]:<20}"
                )
            if offices.count() > 15:
                self.stdout.write(f"... and {offices.count() - 15} more")
        else:
            self.stdout.write(self.style.WARNING("❌ NO OFFICES FOUND"))
            self.stdout.write("   Action: Create offices as per END_TO_END_TESTING_WORKFLOW.md Phase 1.2+\n")

        # Check Geographic Data
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("  GEOGRAPHIC DATA (Separate from Org Hierarchy)"))
        self.stdout.write("="*80 + "\n")

        countries = GeoCountry.objects.count()
        states = GeoState.objects.count()
        districts = GeoDistrict.objects.count()
        mandals = GeoMandal.objects.count()

        self.stdout.write(f"📍 Countries:  {countries:>5}")
        self.stdout.write(f"📍 States:     {states:>5}")
        self.stdout.write(f"📍 Districts:  {districts:>5}")
        self.stdout.write(f"📍 Mandals:    {mandals:>5}")

        if states > 0:
            self.stdout.write("\nSample States:")
            for state in GeoState.objects.all()[:5]:
                country_name = state.country.name if state.country else 'N/A'
                self.stdout.write(f"  - {state.name} ({country_name})")

        # Check Departments & Sections
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("  DEPARTMENTS & SECTIONS"))
        self.stdout.write("="*80 + "\n")

        depts = Department.objects.count()
        sections = Section.objects.count()

        self.stdout.write(f"📂 Departments: {depts:>5}")
        self.stdout.write(f"📂 Sections:    {sections:>5}")

        if depts > 0:
            self.stdout.write("\nSample Departments:")
            for dept in Department.objects.all()[:5]:
                office_name = dept.office.name if dept.office else 'N/A'
                self.stdout.write(f"  - {dept.name} @ {office_name}")

        # Check Employees & Positions
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("  EMPLOYEES & POSITIONS"))
        self.stdout.write("="*80 + "\n")

        employees = Employee.objects.count()
        positions = Position.objects.count()

        self.stdout.write(f"👥 Employees:  {employees:>5}")
        self.stdout.write(f"📍 Positions:  {positions:>5}")

        # Summary
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("  SUMMARY"))
        self.stdout.write("="*80 + "\n")

        checks = {
            'Organizational Levels': levels.exists(),
            'Offices': offices.exists(),
            'Geographic Data': countries > 0,
            'Departments': depts > 0,
            'Employees': employees > 0,
        }

        for check, passed in checks.items():
            if passed:
                self.stdout.write(self.style.SUCCESS(f"✅ {check:<30} PRESENT"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️  {check:<30} MISSING"))

        self.stdout.write("\n" + "="*80)
        self.stdout.write("\n📋 Next Steps:")
        self.stdout.write("   1. Review END_TO_END_TESTING_WORKFLOW.md")
        self.stdout.write("   2. Read LEVEL_HIERARCHY_CHANGES_EXPLANATION.md")
        self.stdout.write("   3. Start testing from Phase 0")
        self.stdout.write("\n" + "="*80 + "\n")
