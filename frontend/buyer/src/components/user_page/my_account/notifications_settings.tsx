import "../../../css/user/notification_settings.css";
import React, { useState, useEffect } from "react";
export const NotificationSettings = () => {
    return (
        <div className="CAysXD" role="main">
            <div style={{ display: "contents" }}>
                <div className="dT8Y7r">
                <div className="nEmyrP">
                    <div className="B7gGv">
                    <label className="_1adxB">
                        <div className="QRoDAL LQ01C8">Email thông báo</div>
                        <div className="XQAdNM">
                        Thông báo và nhắc nhở quan trọng về tài khoản sẽ không thể bị tắt
                        </div>
                    </label>
                    <div className="_3jPok">
                        <input className="_3pPCj" type="checkbox" />
                        <span className="_2IQS1" />
                    </div>
                    </div>
                </div>
                <div className="VWFsrJ" />
                </div>
                <div className="dT8Y7r">
                <div className="nEmyrP">
                    <div className="B7gGv">
                    <label className="_1adxB">
                        <div className="QRoDAL LQ01C8">Thông báo SMS</div>
                        <div className="XQAdNM">
                        Thông báo và nhắc nhở quan trọng về tài khoản sẽ không thể bị tắt
                        </div>
                    </label>
                    <div className="_3jPok">
                        <input className="_3pPCj" type="checkbox" defaultChecked="" />
                        <span className="_2IQS1" />
                    </div>
                    </div>
                </div>
                <div className="VWFsrJ">
                    <div className="nEmyrP">
                    <div className="B7gGv">
                        <label className="_1adxB">
                        <div className="QRoDAL">Khuyến mãi</div>
                        <div className="XQAdNM">
                            Cập nhật về các ưu đãi và khuyến mãi sắp tới
                        </div>
                        </label>
                        <div className="_3jPok">
                        <input className="_3pPCj" type="checkbox" />
                        <span className="_2IQS1" />
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                <div className="dT8Y7r">
                <div className="nEmyrP">
                    <div className="B7gGv">
                    <label className="_1adxB">
                        <div className="QRoDAL LQ01C8">Thông báo Zalo</div>
                        <div className="XQAdNM">
                        Thông báo và nhắc nhở quan trọng về tài khoản sẽ không thể bị tắt
                        </div>
                    </label>
                    <div className="_3jPok">
                        <input className="_3pPCj" type="checkbox" defaultChecked="" />
                        <span className="_2IQS1" />
                    </div>
                    </div>
                </div>
                <div className="VWFsrJ">
                    <div className="nEmyrP">
                    <div className="B7gGv">
                        <label className="_1adxB">
                        <div className="QRoDAL">Khuyến mãi (Shopee Việt Nam)</div>
                        <div className="XQAdNM">
                            Cập nhật về các ưu đãi và khuyến mãi sắp tới
                        </div>
                        </label>
                        <div className="_3jPok">
                        <input className="_3pPCj" type="checkbox" defaultChecked="" />
                        <span className="_2IQS1" />
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};