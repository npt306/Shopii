import "../../../css/user/change_passwords.css";
import React, { useState, useEffect } from "react";
export const ChangePasswords = () => {
    return (
        <div className="CAysXD" role="main">
            <div className="KzNULh">
                <form>
                <div className="hb4PvG">
                    <div className="A_JT4m">
                    <h1 className="X1CGaZ">Đổi mật khẩu</h1>
                    <div className="vl3MQO">
                        Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
                    </div>
                    </div>
                    <div className="WCPTTM">
                    <div className="W3TVhV fAGxa7">
                        <div className="rg6KSG aba8P1">
                        <div className="A320is">
                            <label className="y8JFc7">Mật khẩu mới</label>
                        </div>
                        </div>
                        <div className="YvBKvJ">
                        <div className="boYWWk">
                            <div className="YxyuDT">
                            <input
                                className="X0Jdtz"
                                type="password"
                                placeholder=""
                                autoComplete="off"
                                name="newPassword"
                                maxLength={16}
                                aria-invalid="false"
                                defaultValue=""
                            />
                            <button className="px6VFi" type="button">
                                <svg fill="none" viewBox="0 0 20 10" className="adOaXi">
                                <path
                                    stroke="none"
                                    fill="#000"
                                    fillOpacity=".54"
                                    d="M19.834 1.15a.768.768 0 00-.142-1c-.322-.25-.75-.178-1 .143-.035.036-3.997 4.712-8.709 4.712-4.569 0-8.71-4.712-8.745-4.748a.724.724 0 00-1-.071.724.724 0 00-.07 1c.07.106.927 1.07 2.283 2.141L.631 5.219a.69.69 0 00.036 1c.071.142.25.213.428.213a.705.705 0 00.5-.214l1.963-2.034A13.91 13.91 0 006.806 5.86l-.75 2.535a.714.714 0 00.5.892h.214a.688.688 0 00.679-.535l.75-2.535a9.758 9.758 0 001.784.179c.607 0 1.213-.072 1.785-.179l.75 2.499c.07.321.392.535.677.535.072 0 .143 0 .179-.035a.714.714 0 00.5-.893l-.75-2.498a13.914 13.914 0 003.248-1.678L18.3 6.147a.705.705 0 00.5.214.705.705 0 00.499-.214.723.723 0 00.036-1l-1.82-1.891c1.463-1.071 2.32-2.106 2.32-2.106z"
                                />
                                </svg>
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="fAGxa7">
                        <div className="rg6KSG aba8P1">
                        <div className="A320is">
                            <label className="y8JFc7">Xác nhận mật khẩu</label>
                        </div>
                        </div>
                        <div className="YvBKvJ">
                        <div className="boYWWk">
                            <div className="YxyuDT">
                            <input
                                className="X0Jdtz"
                                type="password"
                                placeholder=""
                                autoComplete="off"
                                name="newPasswordRepeat"
                                maxLength={16}
                                aria-invalid="false"
                                defaultValue=""
                            />
                            <button className="px6VFi" type="button">
                                <svg fill="none" viewBox="0 0 20 10" className="adOaXi">
                                <path
                                    stroke="none"
                                    fill="#000"
                                    fillOpacity=".54"
                                    d="M19.834 1.15a.768.768 0 00-.142-1c-.322-.25-.75-.178-1 .143-.035.036-3.997 4.712-8.709 4.712-4.569 0-8.71-4.712-8.745-4.748a.724.724 0 00-1-.071.724.724 0 00-.07 1c.07.106.927 1.07 2.283 2.141L.631 5.219a.69.69 0 00.036 1c.071.142.25.213.428.213a.705.705 0 00.5-.214l1.963-2.034A13.91 13.91 0 006.806 5.86l-.75 2.535a.714.714 0 00.5.892h.214a.688.688 0 00.679-.535l.75-2.535a9.758 9.758 0 001.784.179c.607 0 1.213-.072 1.785-.179l.75 2.499c.07.321.392.535.677.535.072 0 .143 0 .179-.035a.714.714 0 00.5-.893l-.75-2.498a13.914 13.914 0 003.248-1.678L18.3 6.147a.705.705 0 00.5.214.705.705 0 00.499-.214.723.723 0 00.036-1l-1.82-1.891c1.463-1.071 2.32-2.106 2.32-2.106z"
                                />
                                </svg>
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="K5FD1h fAGxa7">
                        <div className="aba8P1" />{" "}
                        <div className="YvBKvJ">
                        <button
                            type="button"
                            className="btn btn-solid-primary btn--m btn--inline btn-solid-primary"
                            aria-disabled="true"
                        >
                            Xác nhận
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
                </form>
            </div>
        </div>
    );
};