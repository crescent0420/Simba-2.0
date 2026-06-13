# products/management/commands/seed_products.py
import json
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Category, Product


class Command(BaseCommand):
    help = 'Load categories and products from simba_products.json into the products app.'

    def add_arguments(self, parser):
        default_path = Path(settings.BASE_DIR) / 'Simba-2.0' / 'simba_products.json'
        parser.add_argument('--path', default=str(default_path),
                            help='Path to simba_products.json')
        parser.add_argument('--limit', type=int, default=None,
                            help='Optional cap on number of products (for quick seeding/testing).')

    def handle(self, *args, **opts):
        path = Path(opts['path'])
        if not path.exists():
            self.stderr.write(self.style.ERROR(f'File not found: {path}'))
            return

        data = json.loads(path.read_text(encoding='utf-8'))
        products = data['products'] if isinstance(data, dict) else data
        if opts['limit']:
            products = products[:opts['limit']]

        cat_cache = {}
        created_c = created_p = updated_p = 0

        for p in products:
            cat_name = (p.get('category') or 'Uncategorized').strip()
            category = cat_cache.get(cat_name)
            if category is None:
                category, was_created = Category.objects.get_or_create(
                    name=cat_name,
                    defaults={'slug': slugify(cat_name) or f'cat-{len(cat_cache)+1}'},
                )
                cat_cache[cat_name] = category
                created_c += int(was_created)

            slug = f"{slugify(p['name'])}-{p['id']}"[:320]
            obj, was_created = Product.objects.update_or_create(
                product_id=p['id'],
                defaults={
                    'name': p['name'],
                    'slug': slug,
                    'price': p['price'],
                    'category': category,
                    'in_stock': p.get('inStock', True),
                    'image': p.get('image', ''),
                    'unit': p.get('unit', 'Pcs'),
                },
            )
            created_p += int(was_created)
            updated_p += int(not was_created)

        self.stdout.write(self.style.SUCCESS(
            f'Done. Categories +{created_c}; Products created {created_p}, updated {updated_p}.'
        ))
