import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const MoMoQrCode = ({ amount, orderIdQr }) => {
    const qrValue = `momo://payment?amount=${amount}&orderId=${orderIdQr}&description=Thanh toán cho đơn hàng ${orderIdQr}`;

    return (
        <div className="text-center mt-4">
            <h5>Mã QR Thanh Toán MoMo:</h5>
            <QRCodeCanvas value={qrValue} size={256} />
            <p>Quét mã QR để thanh toán</p>
        </div>
    );
};

export default MoMoQrCode;