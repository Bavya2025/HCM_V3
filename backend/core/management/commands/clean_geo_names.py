from django.core.management.base import BaseCommand
from core.models import GeoCluster, GeoMandal, VisitingLocation, Landmark, Office, Facility, OrganizationLevel
import re

class Command(BaseCommand):
    help = 'Cleans up cluster names and performs deep tagging for all operational entities (Offices, Facilities, VLs, Landmarks)'

    def handle(self, *args, **options):
        self.stdout.write('Starting Detailed Operational Tagging & Cleanup...')

        # 1. Clean Cluster Names (Remove Suffixes & Fix Category)
        clusters = GeoCluster.objects.all()
        for c in clusters:
            old_name = c.name
            
            # Clean common suffixes
            new_name = re.sub(r'\s+(Municipality|Municipal Corporation|Corporation|Cluster)\b', '', old_name, flags=re.IGNORECASE).strip()
            
            # Category assignment (User: Kurnool = City)
            if any(w in old_name.upper() for w in ['MUNICIPAL', 'CORPORATION']):
                if c.cluster_type != 'CITY':
                    c.cluster_type = 'CITY'
                    self.stdout.write(f'Updated Type: {new_name} -> CITY')
            
            if new_name != old_name:
                self.stdout.write(f'Cleaned Cluster: "{old_name}" -> "{new_name}"')
                c.name = new_name
            c.save()

        # Re-fetch for matching
        all_clusters = list(GeoCluster.objects.all())

        # 2. Tag Offices (Propagating from Top-Level)
        # Sort by rank to propagate from top levels to bottom (L1 down to L9)
        offices = Office.objects.all().order_by('level__rank')
        for o in offices:
                c_match = None
                self.stdout.write(f'Checking: {o.name}')
                if not o.cluster:
                    # Tagging logic (same as before)
                    o_name_up = o.name.upper()
                    c_match = None
                    if any(w in o_name_up for w in ['BAVYA GROUP GLOBAL HQ', 'AP STATE HQ', 'VIJAYAWADA', 'NTR']):
                        c_match = next((c for c in all_clusters if 'VIJAYAWADA' in c.name.upper()), None)
                    elif 'KURNOOL' in o_name_up:
                        c_match = next((c for c in all_clusters if 'KURNOOL' in c.name.upper()), None)
                    elif 'GUNTUR' in o_name_up:
                        c_match = next((c for c in all_clusters if 'GUNTUR' in c.name.upper()), None)
                    elif 'NELLORE' in o_name_up:
                        c_match = next((c for c in all_clusters if 'NELLORE' in c.name.upper()), None)
                    
                    if not c_match and o.parent:
                        c_match = o.parent.cluster
                    
                    if c_match:
                        o.cluster = c_match
                        self.stdout.write(f'Tagged Office: "{o.name}" -> "{c_match.name}"')

                # NOW ALWAYS SYNC IF CLUSTER EXISTS
                if o.cluster:
                    c_obj = o.cluster
                    changed = False
                    if not o.mandal_name and c_obj.mandal:
                        o.mandal_name = c_obj.mandal.name
                        changed = True
                    if not o.district_name and c_obj.mandal and c_obj.mandal.district:
                        o.district_name = c_obj.mandal.district.name
                        changed = True
                    if not o.state_name and c_obj.mandal and c_obj.mandal.district and c_obj.mandal.district.state:
                        o.state_name = c_obj.mandal.district.state.name
                        changed = True
                    
                    if changed:
                        o.save()
                        self.stdout.write(f'Synced Geo Details for: "{o.name}"')
                    elif c_match: # If it was just tagged, we still need to save even if no geo names changed
                        o.save()
        
        # 3. Tag Facilities (Inherit from Office parent)
        facilities = Facility.objects.all()
        for f in facilities:
            if not f.cluster and f.parent:
                if f.parent.cluster:
                    f.cluster = f.parent.cluster
                    f.save()
                    self.stdout.write(f'Tagged Facility (from parent): "{f.name}" -> "{f.parent.cluster.name}"')

        # 4. Tag Visiting Locations by Office (Most reliable sync)
        vls = VisitingLocation.objects.all()
        for v in vls:
            if not v.cluster and v.office_ref:
                if v.office_ref.cluster:
                    v.cluster = v.office_ref.cluster
                    v.save()
                    self.stdout.write(f'Tagged VL (from office_ref): "{v.name}" -> "{v.office_ref.cluster.name}"')
            elif not v.cluster:
                # Fuzzy match rename
                keyword = v.name.lower()
                c_match = next((c for c in all_clusters if c.name.lower() in keyword or keyword in c.name.lower()), None)
                if c_match:
                    v.cluster = c_match
                    v.save()
                    self.stdout.write(f'Tagged VL (fuzzy): "{v.name}" -> "{c_match.name}"')

        # 5. Tag Landmarks by cluster name or address
        lms = Landmark.objects.all()
        for l in lms:
            if not l.cluster:
                l_name_dec = l.name.lower()
                c_match = next((c for c in all_clusters if c.name.lower() in l_name_dec), None)
                if c_match:
                    l.cluster = c_match
                    l.save()
                    self.stdout.write(f'Tagged Landmark: "{l.name}" -> "{c_match.name}"')

        self.stdout.write(self.style.SUCCESS('Deep cleanup and propagation complete!'))
