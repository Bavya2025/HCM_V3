from django.core.management.base import BaseCommand
from core.models import GeoCluster, GeoMandal, VisitingLocation, Landmark, Office, Project

class Command(BaseCommand):
    help = 'Seeds missing GeoClusters and tags existing locations'

    def handle(self, *args, **options):
        self.stdout.write('Starting Geo seeding and tagging process...')

        # 1. Seed Clusters for mandals that don't have them
        mandals = GeoMandal.objects.filter(clusters__isnull=True)
        self.stdout.write(f'Found {mandals.count()} mandals without clusters. Seeding...')
        
        for m in mandals:
            c_type = 'VILLAGE'
            name_up = m.name.upper()
            if any(w in name_up for w in ['MUNICIPAL', 'CORPORATION', 'CITY']):
                c_type = 'CITY'
            elif any(w in name_up for w in ['TOWN', 'URBAN']):
                c_type = 'TOWN'
            
            
            GeoCluster.objects.create(
                name=f"{m.name} Cluster",
                mandal=m,
                cluster_type=c_type
            )
        self.stdout.write(self.style.SUCCESS(f'Seeded clusters for {mandals.count()} mandals.'))

        # 2. Re-fetch all clusters for tagging
        all_clusters = list(GeoCluster.objects.all())

        # 3. Tag Visiting Locations
        v_locations = VisitingLocation.objects.filter(cluster__isnull=True)
        v_count = 0
        for v in v_locations:
            for c in all_clusters:
                keyword = c.name.lower().replace(' cluster','').replace(' municipality','').replace(' municipal corporation','').strip()
                if keyword and (keyword in v.name.lower() or (v.address and keyword in v.address.lower())):
                    v.cluster = c
                    v.save()
                    v_count += 1
                    break
        self.stdout.write(f'Tagged {v_count} Visiting Locations.')

        # 4. Tag Landmarks
        landmarks = Landmark.objects.filter(cluster__isnull=True)
        l_count = 0
        for l in landmarks:
            for c in all_clusters:
                keyword = c.name.lower().replace(' cluster','').replace(' municipality','').replace(' municipal corporation','').strip()
                if keyword and (keyword in l.name.lower() or (l.address and keyword in l.address.lower())):
                    l.cluster = c
                    l.save()
                    l_count += 1
                    break
        self.stdout.write(f'Tagged {l_count} Landmarks.')

        # 5. Tag Offices
        offices = Office.objects.filter(cluster__isnull=True)
        o_count = 0
        for o in offices:
            for c in all_clusters:
                keyword = c.name.lower().replace(' cluster','').replace(' municipality','').replace(' municipal corporation','').strip()
                # Special logic for VJA
                if ('vja' in o.name.lower() or 'vaja' in o.name.lower()) and 'vijayawada' in c.name.lower():
                    o.cluster = c
                    o.save()
                    o_count += 1
                    break
                if keyword and keyword in o.name.lower():
                    o.cluster = c
                    o.save()
                    o_count += 1
                    break
        self.stdout.write(f'Tagged {o_count} Offices.')

        # 6. Final Category Check for key clusters
        for c in GeoCluster.objects.all():
            changed = False
            if 'municipality' in c.name.lower() or 'corporation' in c.name.lower():
                if c.cluster_type != 'CITY':
                    c.cluster_type = 'CITY'
                    changed = True
            
            if changed:
                c.save()

        self.stdout.write(self.style.SUCCESS('Geo seeding and tagging complete!'))
