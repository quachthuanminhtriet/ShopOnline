# Generated by Django 5.0.1 on 2024-10-07 09:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Shop', '0004_rename_product_imageproduct_product_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='imageproduct',
            old_name='product_id',
            new_name='product',
        ),
    ]
