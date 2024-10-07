from django.core.mail import send_mail
from django.utils.html import format_html

def send_notification_to_staff(order_id, message, user_email):
    staff_email = "triet123az@gmail.com"
    subject = f"Yêu cầu hủy đơn hàng #{order_id}"
    body = f"{message} (Đơn hàng ID: {order_id})<br><br>Gửi từ: {user_email}"

    send_mail(
        subject,
        body,
        user_email,
        [staff_email],
        fail_silently=False,
        html_message=body
    )


def send_notification_to_user(user_email, message, order_id):
    subject = f"Cập nhật đơn hàng #{order_id}"
    body = f"{message}<br><br>Thông tin về đơn hàng của bạn ID: {order_id}"

    send_mail(
        subject,
        body,
        'triet123az@gmail.com',
        [user_email],
        fail_silently=False,
        html_message=body
    )