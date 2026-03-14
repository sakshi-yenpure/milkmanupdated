import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "milkman.settings")

import django
django.setup()

from decimal import Decimal
from category.models import Category
from product.models import Product

CATALOG = [
    ("Milk", [
        ("Whole Milk 1L", "Fresh full-cream milk", Decimal("1.49")),
        ("Toned Milk 1L", "Balanced fat content", Decimal("1.29")),
        ("Skim Milk 1L", "Low fat milk", Decimal("1.19")),
        ("Almond Milk 1L", "Fresh almond milk", Decimal("1.49")),
    ]),
    ("Curd", [
        ("Fresh Curd 500g", "Traditional set curd", Decimal("1.09")),
        ("Greek Yogurt 400g", "High protein yogurt", Decimal("2.49")),
    ]),
    ("Butter", [
        ("Salted Butter 250g", "Creamy salted butter", Decimal("2.99")),
        ("Unsalted Butter 250g", "Pure unsalted butter", Decimal("3.19")),
    ]),
    ("Ghee", [
        ("Cow Ghee 500ml", "Aromatic clarified butter", Decimal("6.99")),
    ]),
    ("Paneer", [
        ("Fresh Paneer 500g", "Soft cottage cheese", Decimal("3.49")),
    ]),
    ("Cheese", [
        ("Cheddar 200g", "Sharp and flavorful", Decimal("3.99")),
        ("Mozzarella 200g", "Perfect for melting", Decimal("3.79")),
    ]),
]


def run():
    total = 0
    for cat_name, items in CATALOG:
        cat, _ = Category.objects.get_or_create(
            name=cat_name,
            defaults={"description": f"{cat_name} products", "is_active": True},
        )
        for name, desc, price in items:
            _, created = Product.objects.update_or_create(
                name=name,
                defaults={
                    "description": desc,
                    "price": price,
                    "category": cat,
                    "is_active": True,
                },
            )
            if created:
                total += 1
    print(f"Seeded {total} new products")


if __name__ == "__main__":
    run()
