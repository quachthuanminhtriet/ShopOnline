from django.core.mail import send_mail
from django.utils.html import format_html


def change_order_status(order, new_status, staff_message, user_message):
    order.status = new_status
    order.save()

    user_email = order.customer_id.email
    send_notification_to_staff(order.id, staff_message, user_email)
    send_notification_to_user(user_email, user_message, order.id)


def send_notification_to_staff(order_id, message, user_email):
    staff_email = "triet123az@gmail.com"
    subject = f"Yêu cầu hủy đơn hàng #{order_id}"
    body = f"""
    <html>
        <body>
            <h1>Thông báo từ hệ thống</h1>
            <p>{message} (Đơn hàng ID: <strong>{order_id}</strong>)</p>
            <p>Gửi từ: <strong>{user_email}</strong></p>
            <br>
            <p>Trân trọng,</p>
            <p>Đội ngũ hỗ trợ khách hàng</p>
        </body>
    </html>
    """

    send_mail(
        subject,
        '',
        user_email,
        [staff_email],
        fail_silently=False,
        html_message=body
    )


def send_notification_to_user(user_email, message, order_id):
    subject = f"Cập nhật đơn hàng #{order_id}"
    body = f"""
    <html>
        <body>
            <h1>Thông báo cập nhật đơn hàng</h1>
            <p>{message}</p>
            <p>Thông tin về đơn hàng của bạn ID: <strong>{order_id}</strong></p>
            <br>
            <p>Trân trọng,</p>
            <p>Đội ngũ hỗ trợ khách hàng</p>
        </body>
    </html>
    """

    send_mail(
        subject,
        '',
        'triet123az@gmail.com',
        [user_email],
        fail_silently=False,
        html_message=body
    )


def send_payment_waiting_to_staff(order_id, customer_email):
    staff_email = "triet123az@gmail.com"
    subject = f"Đơn hàng #{order_id} đang chờ thanh toán"
    body = f"""
    <html>
        <body>
            <h1>Thông báo đơn hàng mới</h1>
            <p>Khách hàng với email <strong>{customer_email}</strong> đã đặt đơn hàng <strong>#{order_id}</strong> và đang chờ xác nhận thanh toán.</p>
            <br>
            <p>Trân trọng,</p>
            <p>Đội ngũ hỗ trợ khách hàng</p>
        </body>
    </html>
    """

    send_mail(
        subject,
        '',
        'triet123az@gmail.com',
        [staff_email],
        fail_silently=False,
        html_message=body
    )
