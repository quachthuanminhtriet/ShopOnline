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


def send_notification_to_staff(order_id, message, user_email):
    staff_email = "triet123az@gmail.com"
    subject = f"Yêu cầu hủy đơn hàng #{order_id}"
    body = f"{message} (Đơn hàng ID: {order_id})\n\nGửi từ: {user_email}"

    send_mail(
        subject,
        body,
        user_email,
        [staff_email],
        fail_silently=False,
    )


def send_notification_to_user(user_email, message, order_id):
    subject = f"Cập nhật đơn hàng #{order_id}"
    body = f"{message}\n\nThông tin về đơn hàng của bạn ID: {order_id}"
    send_mail(
        subject,
        body,
        'triet123az@example.com',
        [user_email],
        fail_silently=False,
    )
