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

def send_payment_waiting_to_staff(order_id, customer_email):
    staff_email = "triet123az@gmail.com"
    subject = f"Đơn hàng #{order_id} đang chờ thanh toán"
    body = f"Khách hàng với email {customer_email} đã đặt đơn hàng #{order_id} và đang chờ xác nhận thanh toán."

    send_mail(
        subject,
        '',
        'triet123az@gmail.com',
        [staff_email],
        fail_silently=False,
        html_message=body
    )