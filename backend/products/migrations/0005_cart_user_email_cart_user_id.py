# Generated by Django 5.1.6 on 2025-03-16 20:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_category_updated_at_order_user_email_order_user_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='cart',
            name='user_email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='cart',
            name='user_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
