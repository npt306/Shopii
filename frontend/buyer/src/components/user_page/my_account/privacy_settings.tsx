import "../../../css/user/privacy_settings.css";
import React, { useState, useEffect } from "react";
export const PrivacySettings = () => {
    const [clicking, setClicking] = useState(false);
    
    return (
        <div className="CAysXD" role="main">
            <div style={{ display: "contents" }}>
                {clicking ? (
                    <div className="LPQWko">
                        <div className="P6L8Hs">Important</div>
                        <div className="bwZlGe">
                            By clicking on “Proceed”, you agree to the following:
                        </div>
                        <ul className="JirkjZ">
                            <li className="mw9Atq">
                            •  Sau khi xác nhận xóa tài khoản, bạn sẽ không thể đăng nhập cũng như khôi
                                phục lại tài khoản. Vui lòng cân nhắc trước khi xác nhận xóa.
                            </li>
                            <li className="mw9Atq">Toàn bộ Xu trong kho Shopee Xu của bạn sẽ mất</li>
                            <li className="mw9Atq">
                            •  Việc xóa tài khoản sẽ không thực hiện được nếu bạn có đơn hàng mua/bán chưa
                                hoàn tất, hoặc các vấn đề liên quan đến pháp lý chưa được xử lý xong (nếu
                                có).
                            </li>
                            <li className="mw9Atq">
                            •  Sau khi xoá tài khoản, Shopee có thể lưu trữ một số dữ liệu của bạn theo quy
                                định tại Chính sách bảo mật của Shopee và quy định pháp luật có liên quan.
                            </li>
                            <li className="mw9Atq">
                            •  Shopee bảo lưu quyền từ chối bất cứ yêu cầu tạo tài khoản mới nào từ bạn
                                trong tương lai.
                            </li>
                            <li className="mw9Atq">
                            •  Việc xoá tài khoản không đồng nghĩa với việc loại bỏ tất cả trách nhiệm và
                                nghĩa vụ liên quan của bạn trên tài khoản đã xóa.
                            </li>
                        </ul>

                        <button className="YizJLs At8WCe Kh0CNz zfuDOD">Proceed</button>
                    </div>
                ) : (
                    <div className="vvfL40">
                    <div className="xDoUO6">
                        <div className="DV7dNx">Privacy Settings</div>
                    </div>
                    <div>
                        <div className="u1uzIg">
                        <div className="AuGF7S">
                            <div className="Mk0PuA">Yêu cầu xóa tài khoản</div>
                            <div className="BfRa4M">
                            <button className="XICjC3 h8fA8B OTkbB4 Z77qH5" onClick={() => setClicking(true)}>Xóa bỏ</button>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </div>

    );
};