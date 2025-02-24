import "../../../css/user/banks_and_cards.css";
import React, { useState, useEffect } from "react";
export const BanksAndCards = () => {
    return (
        <div className="CAysXD" role="main">
            <div style={{ display: "contents" }}>
                <div>
                <div className="my-account-section">
                    <div className="my-account-section__header">
                    <div className="my-account-section__header-left">
                        <div className="my-account-section__header-title">
                        Thẻ Tín dụng/Ghi nợ
                        </div>
                        <div className="my-account-section__header-subtitle" />
                    </div>
                    <div className="my-account-section__header-button">
                        <button className="shopee-button-solid shopee-button-solid--primary shopee-button-solid--bacc-tab">
                        <div className="button-with-icon">
                            <div className="button-with-icon__icon">
                            <svg
                                enableBackground="new 0 0 10 10"
                                viewBox="0 0 10 10"
                                x={0}
                                y={0}
                                className="shopee-svg-icon icon-plus-sign"
                            >
                                <polygon points="10 4.5 5.5 4.5 5.5 0 4.5 0 4.5 4.5 0 4.5 0 5.5 4.5 5.5 4.5 10 5.5 10 5.5 5.5 10 5.5" />
                            </svg>
                            </div>
                            <div>Thêm thẻ mới</div>
                        </div>
                        </button>
                    </div>
                    </div>
                    <div className="bacc-centered-msg">Bạn chưa liên kết thẻ.</div>
                </div>
                <div className="my-account-section">
                    <div className="my-account-section__header">
                    <div className="my-account-section__header-left">
                        <div className="my-account-section__header-title">
                        Tài khoản ngân hàng của tôi
                        </div>
                        <div className="my-account-section__header-subtitle" />
                    </div>
                    <div className="my-account-section__header-button">
                        <button className="shopee-button-solid shopee-button-solid--primary shopee-button-solid--bacc-tab">
                        <div className="button-with-icon">
                            <div className="button-with-icon__icon">
                            <svg
                                enableBackground="new 0 0 10 10"
                                viewBox="0 0 10 10"
                                x={0}
                                y={0}
                                className="shopee-svg-icon icon-plus-sign"
                            >
                                <polygon points="10 4.5 5.5 4.5 5.5 0 4.5 0 4.5 4.5 0 4.5 0 5.5 4.5 5.5 4.5 10 5.5 10 5.5 5.5 10 5.5" />
                            </svg>
                            </div>
                            <div id="label_add_new_bank_account">
                            Thêm Tài khoản Ngân hàng liên kết
                            </div>
                        </div>
                        </button>
                    </div>
                    </div>
                    <div className="bacc-centered-msg">
                    Bạn chưa có tài khoản ngân hàng.
                    </div>
                </div>
                <div />
                </div>
            </div>
        </div>

    );
};