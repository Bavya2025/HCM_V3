from django.core.management.base import BaseCommand
from core.models import OrganizationLevel


class Command(BaseCommand):
    help = 'Create the complete 9-level organizational hierarchy (L1-L9)'

    def handle(self, *args, **options):
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("  CREATING 9-LEVEL ORGANIZATIONAL HIERARCHY"))
        self.stdout.write("="*80 + "\n")

        levels_data = [
            {
                'name': 'Group',
                'level_code': 'L1',
                'rank': 1.0,
                'description': 'Top-most corporate group level'
            },
            {
                'name': 'Business Vertical',
                'level_code': 'L2',
                'rank': 2.0,
                'description': 'Business divisions/verticals within group'
            },
            {
                'name': 'Head Office',
                'level_code': 'L3',
                'rank': 3.0,
                'description': 'Corporate headquarters for each vertical'
            },
            {
                'name': 'Regional Office',
                'level_code': 'L4',
                'rank': 4.0,
                'description': 'Regional operational centers'
            },
            {
                'name': 'Zonal Office',
                'level_code': 'L5',
                'rank': 5.0,
                'description': 'Zonal offices within regions'
            },
            {
                'name': 'Circle Office',
                'level_code': 'L6',
                'rank': 6.0,
                'description': 'Circle offices within zones'
            },
            {
                'name': 'Divisional Office',
                'level_code': 'L7',
                'rank': 7.0,
                'description': 'Divisional offices within circles'
            },
            {
                'name': 'Branch Office',
                'level_code': 'L8',
                'rank': 8.0,
                'description': 'Local branch offices'
            },
            {
                'name': 'Facilities',
                'level_code': 'L9',
                'rank': 9.0,
                'description': 'Field facilities, mobile units, and camps'
            },
        ]

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for level_data in levels_data:
            try:
                # Try to get by level_code first
                level = OrganizationLevel.objects.filter(level_code=level_data['level_code']).first()
                
                if level:
                    # Update existing level
                    level.name = level_data['name']
                    level.rank = level_data['rank']
                    level.description = level_data['description']
                    level.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"🔄 Updated: {level.level_code} - {level.name} (Rank {float(level.rank)})"
                        )
                    )
                else:
                    # Check if a level with this name exists (might have different code)
                    existing_by_name = OrganizationLevel.objects.filter(name=level_data['name']).first()
                    
                    if existing_by_name:
                        # Update the code to match
                        existing_by_name.level_code = level_data['level_code']
                        existing_by_name.rank = level_data['rank']
                        existing_by_name.description = level_data['description']
                        existing_by_name.save()
                        updated_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"🔄 Updated: {existing_by_name.level_code} - {existing_by_name.name} (Rank {float(existing_by_name.rank)})"
                            )
                        )
                    else:
                        # Create new level
                        level = OrganizationLevel.objects.create(
                            name=level_data['name'],
                            level_code=level_data['level_code'],
                            rank=level_data['rank'],
                            description=level_data['description']
                        )
                        created_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"✅ Created: {level.level_code} - {level.name} (Rank {float(level.rank)})"
                            )
                        )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"❌ Error processing {level_data['level_code']} - {level_data['name']}: {str(e)}"
                    )
                )


        # Summary
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("  SUMMARY"))
        self.stdout.write("="*80 + "\n")
        
        self.stdout.write(f"✅ Created:  {created_count} level(s)")
        self.stdout.write(f"🔄 Updated:  {updated_count} level(s)")
        self.stdout.write(f"📊 Total:    {created_count + updated_count} level(s) processed")


        # Verify all levels
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("  VERIFICATION - ALL ORGANIZATIONAL LEVELS"))
        self.stdout.write("="*80 + "\n")

        all_levels = OrganizationLevel.objects.all().order_by('rank')
        
        self.stdout.write(f"{'Code':<8} {'Name':<25} {'Rank':<10} {'Description':<40}")
        self.stdout.write("-" * 83)
        
        for level in all_levels:
            self.stdout.write(
                f"{level.level_code:<8} {level.name:<25} {float(level.rank):<10.1f} {level.description[:40]:<40}"
            )

        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("\n✅ 9-LEVEL HIERARCHY SETUP COMPLETE!"))
        self.stdout.write("\n📋 Next Steps:")
        self.stdout.write("   1. Review ORGANIZATIONAL_HIERARCHY_STRUCTURE.md")
        self.stdout.write("   2. Start creating offices at each level")
        self.stdout.write("   3. Follow END_TO_END_TESTING_WORKFLOW.md")
        self.stdout.write("\n" + "="*80 + "\n")
