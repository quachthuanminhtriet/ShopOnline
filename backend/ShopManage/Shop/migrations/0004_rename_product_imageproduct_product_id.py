# Generated by Django 5.0.1 on 2024-10-07 08:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Shop', '0003_alter_customer_user_alter_order_customer_id_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='imageproduct',
            old_name='product',
            new_name='product_id',
        ),
    ]