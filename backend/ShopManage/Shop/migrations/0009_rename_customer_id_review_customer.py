# Generated by Django 5.0.1 on 2024-10-07 12:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Shop', '0008_alter_order_status_payment'),
    ]

    operations = [
        migrations.RenameField(
            model_name='review',
            old_name='customer_id',
            new_name='customer',
        ),
    ]