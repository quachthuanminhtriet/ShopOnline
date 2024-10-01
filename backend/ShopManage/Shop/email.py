from django.core.mail import send_mail

def send_confirmation_email(order):
    subject = 'Xác nhận đơn hàng của bạn'
    message = f"""
    Chào {order.customer.full_name},

    Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi.

    **Mã đơn hàng:** {order.id}
    **Danh sách sản phẩm:**
    {", ".join([f"{item.product.name} x {item.quantity}" for item in order.items.all()])}
    **Tổng tiền:** {order.total_price}

    Chúng tôi sẽ sớm liên hệ để xác nhận thông tin giao hàng.

    Trân trọng,
    [Tên cửa hàng của bạn]
    """
    email_from = 'your_email@example.com'
    recipient_list = [order.customer.email]
    send_mail(subject, message, email_from, recipient_list)