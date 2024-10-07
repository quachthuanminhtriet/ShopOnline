# Generated by Django 5.0.1 on 2024-10-07 10:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Shop', '0007_alter_order_status_payment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status_payment',
            field=models.CharField(choices=[('not-yet', 'Chưa thanh toán'), ('waiting', 'Chờ Thanh Toán'), ('paid', 'Đã thanh toán')], max_length=50),
        ),
    ]