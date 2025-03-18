import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civil_materials_store.settings')
django.setup()

# Now import the models
from products.models import Product, Category

def add_sample_products():
    # Dictionary of category names and their sample products
    products_by_category = {
        "Cement": [
            {"name": "OPC 53 Grade Cement", "description": "Ordinary Portland Cement for general construction", "price": 350.00, "stock": 200},
            {"name": "PPC Cement", "description": "Portland Pozzolana Cement for durable structures", "price": 340.00, "stock": 150},
            {"name": "White Cement", "description": "Premium white cement for decorative finishes", "price": 450.00, "stock": 100},
        ],
        "Sand and Aggregates": [
            {"name": "River Sand", "description": "Fine quality river sand for concrete mixing", "price": 80.00, "stock": 1000},
            {"name": "Crushed Stone Aggregate", "description": "20mm aggregates for concrete production", "price": 65.00, "stock": 2000},
            {"name": "M Sand", "description": "Manufactured sand alternative to river sand", "price": 75.00, "stock": 1500},
        ],
        "TMT Steel Bars": [
            {"name": "8mm TMT Bars", "description": "High strength 8mm TMT steel reinforcement", "price": 65.00, "stock": 500},
            {"name": "10mm TMT Bars", "description": "Durable 10mm TMT rebars for construction", "price": 75.00, "stock": 450},
            {"name": "12mm TMT Bars", "description": "Premium quality 12mm TMT steel bars", "price": 85.00, "stock": 400},
        ],
        "Bricks and Blocks": [
            {"name": "Red Clay Bricks", "description": "Standard size clay bricks for walls", "price": 10.00, "stock": 5000},
            {"name": "Concrete Hollow Blocks", "description": "6-inch concrete blocks for faster construction", "price": 35.00, "stock": 1000},
            {"name": "AAC Blocks", "description": "Lightweight autoclaved aerated concrete blocks", "price": 55.00, "stock": 800},
        ],
        "Electrical Wires": [
            {"name": "2.5 sq mm Copper Wire", "description": "Flame-retardant copper wire for residential use", "price": 2800.00, "stock": 50},
            {"name": "4.0 sq mm Copper Wire", "description": "High-quality copper wire for heavy loads", "price": 4500.00, "stock": 40},
            {"name": "1.5 sq mm Copper Wire", "description": "Flexible copper wire for light circuits", "price": 1800.00, "stock": 60},
        ],
        "Tiles": [
            {"name": "Ceramic Floor Tiles", "description": "Durable 2x2 ft ceramic tiles for floors", "price": 45.00, "stock": 1200},
            {"name": "Vitrified Tiles", "description": "Glossy vitrified tiles for living areas", "price": 65.00, "stock": 1000},
            {"name": "Wall Tiles", "description": "Decorative wall tiles for bathrooms and kitchens", "price": 40.00, "stock": 1500},
        ],
        "Paints and Finishes": [
            {"name": "Interior Emulsion Paint", "description": "Premium interior wall paint, washable", "price": 220.00, "stock": 100},
            {"name": "Exterior Acrylic Paint", "description": "Weather-resistant exterior paint", "price": 250.00, "stock": 90},
            {"name": "Primer", "description": "General purpose primer for walls", "price": 180.00, "stock": 120},
        ],
        "Construction Chemicals": [
            {"name": "Waterproofing Compound", "description": "Effective waterproofing solution for roofs and bathrooms", "price": 550.00, "stock": 80},
            {"name": "Concrete Admixture", "description": "Performance enhancer for concrete", "price": 320.00, "stock": 60},
            {"name": "Tile Adhesive", "description": "Strong adhesive for tile installation", "price": 280.00, "stock": 100},
        ]
    }
    
    # Add products for each category
    total_products_added = 0
    
    for category_name, products in products_by_category.items():
        # Try to get the category
        try:
            category = Category.objects.get(name=category_name)
            print(f"\nAdding products for category: {category_name}")
            
            # Add products for this category
            for product_data in products:
                product, created = Product.objects.get_or_create(
                    name=product_data["name"],
                    defaults={
                        "description": product_data["description"],
                        "price": product_data["price"],
                        "stock": product_data["stock"],
                        "category": category
                    }
                )
                
                if created:
                    print(f"  - Created product: {product.name}")
                    total_products_added += 1
                else:
                    print(f"  - Product already exists: {product.name}")
            
        except Category.DoesNotExist:
            print(f"Category '{category_name}' does not exist. Skipping products for this category.")
    
    print(f"\nTotal new products added: {total_products_added}")
    print(f"Total products in database: {Product.objects.count()}")

if __name__ == "__main__":
    add_sample_products() 