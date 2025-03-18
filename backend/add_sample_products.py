import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civil_materials_store.settings')
django.setup()

# Now import the models
from products.models import Product, Category

def add_sample_products():
    # Get the first category (or create one if none exists)
    category, created = Category.objects.get_or_create(
        name="Construction Materials",
        defaults={"description": "Basic materials for construction"}
    )
    
    if created:
        print(f"Created new category: {category.name}")
    else:
        print(f"Using existing category: {category.name}")
    
    # Sample product data
    products = [
        {"name": "Cement", "description": "High-quality Portland cement for construction", "price": 350.00, "stock": 100},
        {"name": "Steel Rebar", "description": "Reinforcement bars for concrete structures", "price": 750.00, "stock": 50},
        {"name": "Bricks", "description": "Clay bricks for walls and foundations", "price": 10.00, "stock": 1000},
        {"name": "Sand", "description": "Fine sand for mixing concrete", "price": 80.00, "stock": 200},
        {"name": "Concrete Mix", "description": "Ready-to-use concrete mix for small projects", "price": 250.00, "stock": 60},
        {"name": "Paint Brushes", "description": "Set of brushes for painting walls", "price": 120.00, "stock": 30},
        {"name": "Concrete Blocks", "description": "Hollow concrete blocks for construction", "price": 15.00, "stock": 500},
        {"name": "Plywood", "description": "High-quality plywood sheets for construction", "price": 450.00, "stock": 40},
        {"name": "Roofing Tiles", "description": "Durable clay tiles for roofing", "price": 25.00, "stock": 800},
        {"name": "PVC Pipes", "description": "Various sizes of PVC pipes for plumbing", "price": 85.00, "stock": 150},
    ]
    
    # Add products to database
    for p in products:
        product, created = Product.objects.get_or_create(
            name=p["name"],
            defaults={
                "description": p["description"],
                "price": p["price"],
                "stock": p["stock"],
                "category": category
            }
        )
        
        if created:
            print(f"Created product: {product.name}")
        else:
            print(f"Product already exists: {product.name}")
    
    print("\nTotal products in database:", Product.objects.count())

if __name__ == "__main__":
    add_sample_products() 