import "../../../css/user/addresses.css";
import React, { useState, useEffect } from "react";
export const Addresses = () => {
    const [hasAddress, setHasAddress] = useState(false);
    useEffect(() => {
        setHasAddress(false); 
      }, []);
    return (
        <div className="CAysXD" role="main">
            <div className="xNsbSg">
                <div className="raB_LE">
                <div className="X2Fl2i">
                    <div className="_4CpLGW">Địa chỉ của tôi</div>
                    <div className="_MjOlA" />
                </div>
                <div>
                    <div className="DXtWLQ">
                    <div style={{ display: "flex" }}>
                        <button className="shopee-button-solid shopee-button-solid--primary nJYjiY">
                        <div className="WDsCi_">
                            <div className="zvkoi4">
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
                            <div>Thêm địa chỉ mới</div>
                        </div>
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            {hasAddress ? (
                <>
                    <div className="EDzeF9">
                    <div className="GLBATX">
                        <div className="acy2u2">Address</div>
                        <div className="Oy0a7C inZjsh">
                        <div className="Ln8BPM">
                            <div role="heading" className="ZP_sH4 EhiHrl">
                            <div
                                id="address-card_62a41755-5ca0-45d9-b974-5132b47d3c5f_header"
                                className="PvQ82w Bo_fXH"
                            >
                                <span className="WZoJQT sHEV0u">
                                <div className="xwB4_Q">Name</div>
                                </span>
                                <div className="qhS2mB" />
                                <div role="row" className="urSLUA SDYBn1 PoI6l8">
                                (+84) abc xyz mno
                                </div>
                            </div>
                            <div className="oQEeks">
                                <button className="JHMWU8">Edit</button>
                            </div>
                            </div>
                            <div
                            id="address-card_62a41755-5ca0-45d9-b974-5132b47d3c5f_content"
                            role="heading"
                            className="ZP_sH4 EhiHrl"
                            >
                            <div className="PvQ82w Bo_fXH">
                                <div className="W_MyuV">
                                <div role="row" className="PoI6l8">
                                    227 NVC
                                </div>
                                <div role="row" className="PoI6l8">
                                    Q5 TP HCM
                                </div>
                                </div>
                            </div>
                            <div className="JwDIHs oQEeks">
                                <button className="FIxzOe H6ESfz U4E1nT" disabled="">
                                Set as default
                                </button>
                            </div>
                            </div>
                            <div
                            id="address-card_62a41755-5ca0-45d9-b974-5132b47d3c5f_badge"
                            role="row"
                            className="Xx6fjH PoI6l8"
                            >
                            <span role="mark" className="CTpOx2 TXhBWf F4fNIN">
                                Default
                            </span>
                            </div>
                        </div>
                        </div>
                        <div className="Oy0a7C inZjsh">
                        <div className="Ln8BPM">
                            <div role="heading" className="ZP_sH4 EhiHrl">
                            <div
                                id="address-card_3167c7ea-8226-4f5a-ac16-6b1036dc77e2_header"
                                className="PvQ82w Bo_fXH"
                            >
                                <span className="WZoJQT sHEV0u">
                                <div className="xwB4_Q">Full Name</div>
                                </span>
                                <div className="qhS2mB" />
                                <div role="row" className="urSLUA SDYBn1 PoI6l8">
                                (+84) abc xyz mno
                                </div>
                            </div>
                            <div className="oQEeks">
                                <button className="JHMWU8">Edit</button>
                                <button className="JHMWU8">Delete</button>
                            </div>
                            </div>
                            <div
                            id="address-card_3167c7ea-8226-4f5a-ac16-6b1036dc77e2_content"
                            role="heading"
                            className="ZP_sH4 EhiHrl"
                            >
                            <div className="PvQ82w Bo_fXH">
                                <div className="W_MyuV">
                                <div role="row" className="PoI6l8">
                                    227 NVC
                                </div>
                                <div role="row" className="PoI6l8">
                                    Q5 HCM
                                </div>
                                </div>
                            </div>
                            <div className="JwDIHs oQEeks">
                                <button className="FIxzOe H6ESfz U4E1nT" disabled="">
                                Set as default
                                </button>
                            </div>
                            </div>
                            <div
                            id="address-card_3167c7ea-8226-4f5a-ac16-6b1036dc77e2_badge"
                            role="row"
                            className="Xx6fjH PoI6l8"
                            >
                            <span role="mark" className="CTpOx2 VRzhdb F4fNIN">
                                Pickup Address
                            </span>
                            <span role="mark" className="CTpOx2 VRzhdb F4fNIN">
                                Return Address
                            </span>
                            </div>
                            <div
                            id="address-card_3167c7ea-8226-4f5a-ac16-6b1036dc77e2_invalid-flag"
                            className="rdiT_n"
                            >
                            Some information may no longer up to date, please help us update
                            this address.
                            </div>
                        </div>
                        </div>
                        <div className="Oy0a7C inZjsh">
                        <div className="Ln8BPM">
                            <div role="heading" className="ZP_sH4 EhiHrl">
                            <div
                                id="address-card_3bb9d6df-afe6-4657-a4cc-494cefc0dced_header"
                                className="PvQ82w Bo_fXH"
                            >
                                <span className="WZoJQT sHEV0u">
                                <div className="xwB4_Q">Namee</div>
                                </span>
                                <div className="qhS2mB" />
                                <div role="row" className="urSLUA SDYBn1 PoI6l8">
                                (+84) 123 456 789
                                </div>
                            </div>
                            <div className="oQEeks">
                                <button className="JHMWU8">Edit</button>
                                <button className="JHMWU8">Delete</button>
                            </div>
                            </div>
                            <div
                            id="address-card_3bb9d6df-afe6-4657-a4cc-494cefc0dced_content"
                            role="heading"
                            className="ZP_sH4 EhiHrl"
                            >
                            <div className="PvQ82w Bo_fXH">
                                <div className="W_MyuV">
                                <div role="row" className="PoI6l8">
                                    227 NVC
                                </div>
                                <div role="row" className="PoI6l8">
                                    Q5 HCM
                                </div>
                                </div>
                            </div>
                            <div className="JwDIHs oQEeks">
                                <button className="FIxzOe H6ESfz U4E1nT">Set as default</button>
                            </div>
                            </div>
                            <div
                            id="address-card_3bb9d6df-afe6-4657-a4cc-494cefc0dced_badge"
                            role="row"
                            className="Xx6fjH PoI6l8"
                            />
                        </div>
                        </div>
                    </div>
                    </div>               
                </>
            ) : (
                <div className="ighEpc">
                    <svg fill="none" viewBox="0 0 121 120" className="VMnhZp">
                        <path
                        d="M16 79.5h19.5M43 57.5l-2 19"
                        stroke="#BDBDBD"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        />
                        <path
                        d="M56.995 78.791v-.001L41.2 38.195c-2.305-5.916-2.371-12.709.44-18.236 1.576-3.095 4.06-6.058 7.977-8 5.061-2.5 11.038-2.58 16.272-.393 3.356 1.41 7 3.92 9.433 8.43v.002c2.837 5.248 2.755 11.853.602 17.603L60.503 78.766v.001c-.617 1.636-2.88 1.643-3.508.024Z"
                        fill="#fff"
                        stroke="#BDBDBD"
                        strokeWidth={2}
                        />
                        <path
                        d="m75.5 58.5 7 52.5M13 93h95.5M40.5 82.5 30.5 93 28 110.5"
                        stroke="#BDBDBD"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        />
                        <path
                        d="M44.5 79.5c0 .55-.318 1.151-1.038 1.656-.717.502-1.761.844-2.962.844-1.2 0-2.245-.342-2.962-.844-.72-.505-1.038-1.105-1.038-1.656 0-.55.318-1.151 1.038-1.656.717-.502 1.761-.844 2.962-.844 1.2 0 2.245.342 2.962.844.72.505 1.038 1.105 1.038 1.656Z"
                        stroke="#BDBDBD"
                        strokeWidth={2}
                        />
                        <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M48.333 68H18.5a1 1 0 1 0 0 2h30.667l-.834-2Zm20.5 2H102a1 1 0 0 0 0-2H69.667l-.834 2Z"
                        fill="#BDBDBD"
                        />
                        <path
                        d="M82 73h20l3 16H84.5L82 73ZM34.5 97H76l1.5 13H33l1.5-13ZM20.5 58h18l-1 7h-18l1-7Z"
                        fill="#E8E8E8"
                        />
                        <path
                        clipRule="evenodd"
                        d="M19.5 41a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM102.5 60a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                        stroke="#E8E8E8"
                        strokeWidth={2}
                        />
                        <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M93.5 22a1 1 0 0 0-1 1v3h-3a1 1 0 1 0 0 2h3v3a1 1 0 1 0 2 0v-3h3a1 1 0 1 0 0-2h-3v-3a1 1 0 0 0-1-1Z"
                        fill="#E8E8E8"
                        />
                        <circle cx="58.5" cy={27} r={7} stroke="#BDBDBD" strokeWidth={2} />
                    </svg>
                    <div className="mXnBNJ">Bạn chưa có địa chỉ.</div>
                </div>
            )}
            </div>



        </div>
        
    );
};