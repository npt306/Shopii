import "../../../css/user/profile.css";
import React, { useState, useEffect } from "react";
export const Profile = () => {
    return (
        <div className="CAysXD" role="main">
            <div style={{ display: "contents" }}>
                <div className="utB99K">
                <div className="SFztPl">
                    <h1 className="BVrKV_">Hồ sơ của tôi</h1>
                    <div className="QcW5xy">Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
                </div>
                <div className="RCnc9v">
                    <div className="HrBg9Q">
                    <form>
                        <table className="bQkdAY">
                        <tbody>
                            <tr>
                            <td className="f1ZOv_">
                                <label>Tên đăng nhâp</label>
                            </td>
                            <td className="o6L4e0">
                                <div className="e_Vt__">
                                <div className="PBfYlq">username</div>
                                <button className="clo49Q" />
                                </div>
                            </td>
                            </tr>
                            <tr>
                            <td className="f1ZOv_">
                                <label>Tên</label>
                            </td>
                            <td className="o6L4e0">
                                <div>
                                <div className="NGoa5Z">
                                    <input
                                    type="text"
                                    placeholder=""
                                    className="kKnR04"
                                    defaultValue="dtententen"
                                    />
                                </div>
                                </div>
                            </td>
                            </tr>
                            <tr>
                            <td className="f1ZOv_">
                                <label>Email</label>
                            </td>
                            <td className="o6L4e0">
                                <div className="e_Vt__">
                                <div className="PBfYlq">us************@gmail.com</div>
                                <button className="clo49Q">Thay đổi</button>
                                </div>
                            </td>
                            </tr>
                            <tr>
                            <td className="f1ZOv_">
                                <label>Số điện thoại</label>
                            </td>
                            <td className="o6L4e0">
                                <div className="e_Vt__">
                                <div className="PBfYlq">*********21</div>
                                <button className="clo49Q">Thay đổi</button>
                                </div>
                            </td>
                            </tr>
                            <tr>
                            <td className="f1ZOv_">
                                <label>Giới tính</label>
                            </td>
                            <td className="o6L4e0">
                                <div className="prDHtK">
                                <div className="stardust-radio-group" role="radiogroup">
                                    <div
                                    className="stardust-radio"
                                    tabIndex={0}
                                    role="radio"
                                    aria-checked="false"
                                    >
                                    <div className="stardust-radio-button">
                                        <div className="stardust-radio-button__outer-circle">
                                        <div className="stardust-radio-button__inner-circle" />
                                        </div>
                                    </div>
                                    <div className="stardust-radio__content">
                                        <div className="stardust-radio__label">Nam</div>
                                    </div>
                                    </div>
                                    <div
                                    className="stardust-radio"
                                    tabIndex={0}
                                    role="radio"
                                    aria-checked="false"
                                    >
                                    <div className="stardust-radio-button">
                                        <div className="stardust-radio-button__outer-circle">
                                        <div className="stardust-radio-button__inner-circle" />
                                        </div>
                                    </div>
                                    <div className="stardust-radio__content">
                                        <div className="stardust-radio__label">Nữ</div>
                                    </div>
                                    </div>
                                    <div
                                    className="stardust-radio stardust-radio--checked"
                                    tabIndex={0}
                                    role="radio"
                                    aria-checked="true"
                                    >
                                    <div className="stardust-radio-button stardust-radio-button--checked">
                                        <div className="stardust-radio-button__outer-circle">
                                        <div className="stardust-radio-button__inner-circle" />
                                        </div>
                                    </div>
                                    <div className="stardust-radio__content">
                                        <div className="stardust-radio__label">Khác</div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </td>
                            </tr>
                            <tr>
                            <td className="f1ZOv_">
                                <label>Ngày sinh</label>
                            </td>
                            <td className="o6L4e0">
                                <div className="e_Vt__">
                                <div className="PBfYlq">**/01/20**</div>
                                <button className="clo49Q">Thay đổi</button>
                                </div>
                            </td>
                            </tr>
                            <tr>
                            <td className="f1ZOv_">
                                <label />
                            </td>
                            <td className="o6L4e0">
                                <button
                                type="button"
                                className="btn btn-solid-primary btn--m btn--inline"
                                aria-disabled="false"
                                >
                                Lưu
                                </button>
                            </td>
                            </tr>
                        </tbody>
                        </table>
                    </form>
                    </div>
                    <div className="nv7bOz">
                    <div className="TJWfNh">
                        <div className="nMPYiw" role="header">
                        <div
                            className="cW0oBM"
                            style={{
                            backgroundImage:
                                'url("src/assets/avatar_default.png")'
                            }}
                        />
                        </div>
                        <input className="XbWdh7" type="file" accept=".jpg,.jpeg,.png" />
                        <button type="button" className="btn btn-light btn--m btn--inline">
                        Chọn ảnh
                        </button>
                        <div className="T_8sqN">
                        <div className="JIExfq">Dụng lượng file tối đa 1 MB</div>
                        <div className="JIExfq">Định dạng:.JPEG, .PNG</div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>

    );
};