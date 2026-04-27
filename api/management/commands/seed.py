import json
from pathlib import Path
from django.core.management.base import BaseCommand
from api.models import Product


class Command(BaseCommand):
    help = 'Load products from simba_products.json into the database'

    def handle(self, *args, **kwargs):
        json_path = Path(r'D:\Simba 2.0\Simba-2.0\simba_products.json')

        self.stdout.write(f'Loading from: {json_path}')

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        products = data['products']
        created_count = 0
        updated_count = 0

        for p in products:
            obj, created = Product.objects.update_or_create(
                product_id=p['id'],
                defaults={
                    'name': p['name'],
                    'price': p['price'],
                    'category': p['category'],
                    'subcategory_id': p['subcategoryId'],
                    'in_stock': p['inStock'],
                    'image': p['image'],
                    'unit': p['unit'],
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done! {created_count} products created, {updated_count} updated.'
        ))