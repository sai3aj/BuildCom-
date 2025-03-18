import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civil_materials_store.settings')
django.setup()

# Now import the models
from products.models import Category

def add_categories():
    # List of categories to add
    categories = [
        {
            "name": "Cement",
            "description": "High-quality cement for various construction applications"
        },
        {
            "name": "Sand and Aggregates",
            "description": "Different types of sand and aggregates for concrete mixing and other uses"
        },
        {
            "name": "TMT Steel Bars",
            "description": "Premium quality TMT steel reinforcement bars for construction"
        },
        {
            "name": "Bricks and Blocks",
            "description": "Clay bricks, concrete blocks, and other masonry units"
        },
        {
            "name": "Electrical Wires",
            "description": "Safe and durable electrical wires for residential and commercial projects"
        },
        {
            "name": "Tiles",
            "description": "Floor and wall tiles in various designs, materials, and sizes"
        },
        {
            "name": "Paints and Finishes",
            "description": "Interior and exterior paints, primers, and finishing materials"
        },
        {
            "name": "Construction Chemicals",
            "description": "Waterproofing solutions, admixtures, adhesives, and other specialty chemicals"
        }
    ]
    
    # Add categories to database
    for category_data in categories:
        category, created = Category.objects.get_or_create(
            name=category_data["name"],
            defaults={"description": category_data["description"]}
        )
        
        if created:
            print(f"Created category: {category.name}")
        else:
            # Update the description if the category already exists
            category.description = category_data["description"]
            category.save()
            print(f"Updated category: {category.name}")
    
    print("\nTotal categories in database:", Category.objects.count())
    
    # List all categories
    print("\nAll categories:")
    for category in Category.objects.all():
        print(f"- {category.name}")

if __name__ == "__main__":
    add_categories() 