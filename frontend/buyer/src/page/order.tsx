import  { useEffect, useState } from "react";
import "../css/orderPage.css";
import { HomeLayout } from "../layout/home";

const RadioButton = ({ label, checked, onChange }) => {
  return (
    <div
      className={`stardust-radio ${checked ? "stardust-radio--checked" : ""}`}
      tabIndex={0}
      role="radio"
      onClick={onChange}
    >
      <div className="stardust-radio-button">
        <div className="stardust-radio-button__outer-circle">
          <div className="stardust-radio-button__inner-circle" />
        </div>
      </div>
      <div className="stardust-radio__content">{label}</div>
    </div>
  );
};


export const OrderPage = () => {
  const [selectedRadio, setSelectedRadio] = useState("option1");
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  useEffect(() => {
    document.title = "Demo Thanh toán";
  }, []);
    return (
        <HomeLayout>
        <div className="App">
          {/* ORDER */}
            <div className="flex-1">
              <div className="order-header">
                    <a className="order-title" href="/home">
                      <svg
                        viewBox="0 0 192 65"
                        className="shopee-svg-icon icon-shopee-logo"
                      >
                        <g fillRule="evenodd">
                          <path d="M35.6717403 44.953764c-.3333497 2.7510509-2.0003116 4.9543414-4.5823845 6.0575984-1.4379707.6145919-3.36871.9463856-4.896954.8421628-2.3840266-.0911143-4.6237865-.6708937-6.6883352-1.7307424-.7375522-.3788551-1.8370513-1.1352759-2.6813095-1.8437757-.213839-.1790053-.239235-.2937577-.0977428-.4944671.0764015-.1151823.2172535-.3229831.5286218-.7791994.45158-.6616533.5079208-.7446018.5587128-.8221779.14448-.2217688.3792333-.2411091.6107855-.0588804.0243289.0189105.0243289.0189105.0426824.0333083.0379873.0294402.0379873.0294402.1276204.0990653.0907002.0706996.14448.1123887.166248.1287205 2.2265285 1.7438508 4.8196989 2.7495466 7.4376251 2.8501162 3.6423042-.0496401 6.2615109-1.6873341 6.7308041-4.2020035.5160305-2.7675977-1.6565047-5.1582742-5.9070334-6.4908212-1.329344-.4166762-4.6895175-1.7616869-5.3090528-2.1250697-2.9094471-1.7071043-4.2697358-3.9430584-4.0763845-6.7048539.296216-3.8283059 3.8501677-6.6835796 8.340785-6.702705 2.0082079-.004083 4.0121475.4132378 5.937338 1.2244562.6816382.2873109 1.8987274.9496089 2.3189359 1.2633517.2420093.1777159.2898136.384872.1510957.60836-.0774686.12958-.2055158.3350171-.4754821.7632974l-.0029878.0047276c-.3553311.5640922-.3664286.5817134-.447952.7136572-.140852.2144625-.3064598.2344475-.5604202.0732783-2.0600669-1.3839063-4.3437898-2.0801572-6.8554368-2.130442-3.126914.061889-5.4706057 1.9228561-5.6246892 4.4579402-.0409751 2.2896772 1.676352 3.9613243 5.3858811 5.2358503 7.529819 2.4196871 10.4113092 5.25648 9.869029 9.7292478M26.3725216 5.42669372c4.9022893 0 8.8982174 4.65220288 9.0851664 10.47578358H17.2875686c.186949-5.8235807 4.1828771-10.47578358 9.084953-10.47578358m25.370857 11.57065968c0-.6047069-.4870064-1.0948761-1.0875481-1.0948761h-11.77736c-.28896-7.68927544-5.7774923-13.82058185-12.5059489-13.82058185-6.7282432 0-12.2167755 6.13130641-12.5057355 13.82058185l-11.79421958.0002149c-.59136492.0107446-1.06748731.4968309-1.06748731 1.0946612 0 .0285807.00106706.0569465.00320118.0848825H.99995732l1.6812605 37.0613963c.00021341.1031483.00405483.2071562.01173767.3118087.00170729.0236381.003628.0470614.00554871.0704847l.00362801.0782207.00405483.004083c.25545428 2.5789222 2.12707837 4.6560709 4.67201764 4.7519129l.00576212.0055872h37.4122078c.0177132.0002149.0354264.0004298.0531396.0004298.0177132 0 .0354264-.0002149.0531396-.0004298h.0796027l.0017073-.0015043c2.589329-.0706995 4.6867431-2.1768587 4.9082648-4.787585l.0012805-.0012893.0017073-.0350275c.0021341-.0275062.0040548-.0547975.0057621-.0823037.0040548-.065757.0068292-.1312992.0078963-.1964115l1.8344904-37.207738h-.0012805c.001067-.0186956.0014939-.0376062.0014939-.0565167M176.465457 41.1518926c.720839-2.3512494 2.900423-3.9186779 5.443734-3.9186779 2.427686 0 4.739107 1.6486899 5.537598 3.9141989l.054826.1556978h-11.082664l.046506-.1512188zm13.50267 3.4063683c.014933.0006399.014933.0006399.036906.0008531.021973-.0002132.021973-.0002132.044372-.0008531.53055-.0243144.950595-.4766911.950595-1.0271786 0-.0266606-.000853-.0496953-.00256-.0865936.000427-.0068251.000427-.020262.000427-.0635588 0-5.1926268-4.070748-9.4007319-9.09145-9.4007319-5.020488 0-9.091235 4.2081051-9.091235 9.4007319 0 .3871116.022399.7731567.067838 1.1568557l.00256.0204753.01408.1013102c.250022 1.8683731 1.047233 3.5831812 2.306302 4.9708108-.00064-.0006399.00064.0006399.007253.0078915 1.396026 1.536289 3.291455 2.5833031 5.393601 2.9748936l.02752.0053321v-.0027727l.13653.0228215c.070186.0119439.144211.0236746.243409.039031 2.766879.332724 5.221231-.0661182 7.299484-1.1127057.511777-.2578611.971928-.5423827 1.37064-.8429007.128211-.0968312.243622-.1904632.34346-.2781231.051412-.0452164.092372-.083181.114131-.1051493.468898-.4830897.498124-.6543572.215249-1.0954297-.31146-.4956734-.586228-.9179769-.821744-1.2675504-.082345-.1224254-.154023-.2267215-.214396-.3133151-.033279-.0475624-.033279-.0475624-.054399-.0776356-.008319-.0117306-.008319-.0117306-.013866-.0191956l-.00256-.0038391c-.256208-.3188605-.431565-.3480805-.715933-.0970445-.030292.0268739-.131624.1051493-.14997.1245582-1.999321 1.775381-4.729508 2.3465571-7.455854 1.7760208-.507724-.1362888-.982595-.3094759-1.419919-.5184948-1.708127-.8565509-2.918343-2.3826022-3.267563-4.1490253l-.02752-.1394881h13.754612zM154.831964 41.1518926c.720831-2.3512494 2.900389-3.9186779 5.44367-3.9186779 2.427657 0 4.739052 1.6486899 5.537747 3.9141989l.054612.1556978h-11.082534l.046505-.1512188zm13.502512 3.4063683c.015146.0006399.015146.0006399.037118.0008531.02176-.0002132.02176-.0002132.044159-.0008531.530543-.0243144.950584-.4766911.950584-1.0271786 0-.0266606-.000854-.0496953-.00256-.0865936.000426-.0068251.000426-.020262.000426-.0635588 0-5.1926268-4.070699-9.4007319-9.091342-9.4007319-5.020217 0-9.091343 4.2081051-9.091343 9.4007319 0 .3871116.022826.7731567.068051 1.1568557l.00256.0204753.01408.1013102c.250019 1.8683731 1.04722 3.5831812 2.306274 4.9708108-.00064-.0006399.00064.0006399.007254.0078915 1.396009 1.536289 3.291417 2.5833031 5.393538 2.9748936l.027519.0053321v-.0027727l.136529.0228215c.070184.0119439.144209.0236746.243619.039031 2.766847.332724 5.22117-.0661182 7.299185-1.1127057.511771-.2578611.971917-.5423827 1.370624-.8429007.128209-.0968312.243619-.1904632.343456-.2781231.051412-.0452164.09237-.083181.11413-.1051493.468892-.4830897.498118-.6543572.215246-1.0954297-.311457-.4956734-.586221-.9179769-.821734-1.2675504-.082344-.1224254-.154022-.2267215-.21418-.3133151-.033492-.0475624-.033492-.0475624-.054612-.0776356-.008319-.0117306-.008319-.0117306-.013866-.0191956l-.002346-.0038391c-.256419-.3188605-.431774-.3480805-.716138-.0970445-.030292.0268739-.131623.1051493-.149969.1245582-1.999084 1.775381-4.729452 2.3465571-7.455767 1.7760208-.507717-.1362888-.982582-.3094759-1.419902-.5184948-1.708107-.8565509-2.918095-2.3826022-3.267311-4.1490253l-.027733-.1394881h13.754451zM138.32144123 49.7357905c-3.38129629 0-6.14681004-2.6808521-6.23169343-6.04042014v-.31621743c.08401943-3.35418649 2.85039714-6.03546919 6.23169343-6.03546919 3.44242097 0 6.23320537 2.7740599 6.23320537 6.1960534 0 3.42199346-2.7907844 6.19605336-6.23320537 6.19605336m.00172791-15.67913203c-2.21776751 0-4.33682838.7553485-6.03989586 2.140764l-.19352548.1573553V34.6208558c0-.4623792-.0993546-.56419733-.56740117-.56419733h-2.17651376c-.47409424 0-.56761716.09428403-.56761716.56419733v27.6400724c0 .4539841.10583425.5641973.56761716.5641973h2.17651376c.46351081 0 .56740117-.1078454.56740117-.5641973V50.734168l.19352548.1573553c1.70328347 1.3856307 3.82234434 2.1409792 6.03989586 2.1409792 5.27140956 0 9.54473746-4.2479474 9.54473746-9.48802964 0-5.239867-4.2733279-9.48781439-9.54473746-9.48781439M115.907646 49.5240292c-3.449458 0-6.245805-2.7496948-6.245805-6.1425854 0-3.3928907 2.79656-6.1427988 6.245805-6.1427988 3.448821 0 6.24538 2.7499081 6.24538 6.1427988 0 3.3926772-2.796346 6.1425854-6.24538 6.1425854m.001914-15.5438312c-5.28187 0-9.563025 4.2112903-9.563025 9.4059406 0 5.1944369 4.281155 9.4059406 9.563025 9.4059406 5.281657 0 9.562387-4.2115037 9.562387-9.4059406 0-5.1946503-4.280517-9.4059406-9.562387-9.4059406M94.5919049 34.1890939c-1.9281307 0-3.7938902.6198995-5.3417715 1.7656047l-.188189.1393105V23.2574169c0-.4254677-.1395825-.5643476-.5649971-.5643476h-2.2782698c-.4600414 0-.5652122.1100273-.5652122.5643476v29.2834155c0 .443339.1135587.5647782.5652122.5647782h2.2782698c.4226187 0 .5649971-.1457701.5649971-.5647782v-9.5648406c.023658-3.011002 2.4931278-5.4412923 5.5299605-5.4412923 3.0445753 0 5.516841 2.4421328 5.5297454 5.4630394v9.5430935c0 .4844647.0806524.5645628.5652122.5645628h2.2726775c.481764 0 .565212-.0824666.565212-.5645628v-9.5710848c-.018066-4.8280677-4.0440197-8.7806537-8.9328471-8.7806537M62.8459442 47.7938061l-.0053397.0081519c-.3248668.4921188-.4609221.6991347-.5369593.8179812-.2560916.3812097-.224267.551113.1668119.8816949.91266.7358184 2.0858968 1.508535 2.8774525 1.8955369 2.2023021 1.076912 4.5810275 1.646045 7.1017886 1.6975309 1.6283921.0821628 3.6734936-.3050536 5.1963734-.9842376 2.7569891-1.2298679 4.5131066-3.6269626 4.8208863-6.5794607.4985136-4.7841067-2.6143125-7.7747902-10.6321784-10.1849709l-.0021359-.0006435c-3.7356476-1.2047686-5.4904836-2.8064071-5.4911243-5.0426086.1099976-2.4715346 2.4015793-4.3179454 5.4932602-4.4331449 2.4904317.0062212 4.6923065.6675996 6.8557356 2.0598624.4562232.2767364.666607.2256796.9733188-.172263.035242-.0587797.1332787-.2012238.543367-.790093l.0012815-.0019308c.3829626-.5500403.5089793-.7336731.5403767-.7879478.258441-.4863266.2214903-.6738208-.244985-1.0046173-.459427-.3290803-1.7535544-1.0024722-2.4936356-1.2978721-2.0583439-.8211991-4.1863175-1.2199998-6.3042524-1.1788111-4.8198184.1046878-8.578747 3.2393171-8.8265087 7.3515337-.1572005 2.9703036 1.350301 5.3588174 4.5000778 7.124567.8829712.4661613 4.1115618 1.6865902 5.6184225 2.1278667 4.2847814 1.2547527 6.5186944 3.5630343 6.0571315 6.2864205-.4192725 2.4743234-3.0117991 4.1199394-6.6498372 4.2325647-2.6382344-.0549182-5.2963324-1.0217793-7.6043603-2.7562084-.0115337-.0083664-.0700567-.0519149-.1779185-.1323615-.1516472-.1130543-.1516472-.1130543-.1742875-.1300017-.4705335-.3247898-.7473431-.2977598-1.0346184.1302162-.0346012.0529875-.3919333.5963776-.5681431.8632459" />
                        </g>
                      </svg>
                      <h1 className="order-header-title">Thanh toán</h1>
                    </a>
              </div>
              <div className="order-main">
                {/* ADDRESS-CONTAINER */}
                <div className="order-address">
                  <div className="address-decor" />
                  <div className="p-7">
                    <div className="items-center flex">
                      <div className="address-title">
                        <div className="flex mr-3">
                          <svg
                            height={16}
                            viewBox="0 0 12 16"
                            width={12}
                            className="shopee-svg-icon icon-location-marker"
                          >
                            <path
                              d="M6 3.2c1.506 0 2.727 1.195 2.727 2.667 0 1.473-1.22 2.666-2.727 2.666S3.273 7.34 3.273 5.867C3.273 4.395 4.493 3.2 6 3.2zM0 6c0-3.315 2.686-6 6-6s6 2.685 6 6c0 2.498-1.964 5.742-6 9.933C1.613 11.743 0 8.498 0 6z"
                              fillRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h2>Địa chỉ nhận hàng</h2>
                      </div>
                    </div>
                    <div className="items-center flex">
                      <div>
                        <div className="items-center flex text-base">
                          <div className="font-semibold">Họ tên (+84) 123456789</div>
                          <div className="ms-5">
                          227 Đ. Nguyễn Văn Cừ, Phường 4, Quận 5, Hồ Chí Minh
                          </div>
                          <div className="address-default-tag">Mặc định</div>
                        </div>
                      </div>
                      <button className="change-button" onClick={() => setOpenAddressModal(true)}>Thay đổi</button>
                    </div>
                    <div />
                  </div>
                </div>
                {/* ORDER-ITEMS */}
                <div className="order-list">
                  <div className="order-list-bg">
                    <div className="order-list-tag grid grid-cols-6">
                      <div className=" col-span-2">
                        <h2 className="items-center text-black text-xl">Sản phẩm</h2>
                      </div>
                      <div className="tag-item" />
                      <div className="tag-item">Đơn giá</div>
                      <div className="tag-item">Số lượng</div>
                      <div className="tag-item">Thành tiền</div>
                    </div>
                  </div>
                  <div>
                    {/* SHOP-ITEMS */}
                    <div className="shop-items">
                          <div className="shop-title">
                            <div className="mall-icon">
                                <svg viewBox="0 0 24 11" height={11} width={24}>
                                <title>Mall</title>
                                <g fill="#fff" fillRule="evenodd">
                                    <path d="M19.615 7.143V1.805a.805.805 0 0 0-1.611 0v5.377H18c0 1.438.634 2.36 1.902 2.77V9.95c.09.032.19.05.293.05.444 0 .805-.334.805-.746a.748.748 0 0 0-.498-.69v-.002c-.59-.22-.885-.694-.885-1.42h-.002zm3 0V1.805a.805.805 0 0 0-1.611 0v5.377H21c0 1.438.634 2.36 1.902 2.77V9.95c.09.032.19.05.293.05.444 0 .805-.334.805-.746a.748.748 0 0 0-.498-.69v-.002c-.59-.22-.885-.694-.885-1.42h-.002zm-7.491-2.985c.01-.366.37-.726.813-.726.45 0 .814.37.814.742v5.058c0 .37-.364.73-.813.73-.395 0-.725-.278-.798-.598a3.166 3.166 0 0 1-1.964.68c-1.77 0-3.268-1.456-3.268-3.254 0-1.797 1.497-3.328 3.268-3.328a3.1 3.1 0 0 1 1.948.696zm-.146 2.594a1.8 1.8 0 1 0-3.6 0 1.8 1.8 0 1 0 3.6 0z" />
                                    <path
                                    d="M.078 1.563A.733.733 0 0 1 .565.89c.423-.15.832.16 1.008.52.512 1.056 1.57 1.88 2.99 1.9s2.158-.85 2.71-1.882c.19-.356.626-.74 1.13-.537.342.138.477.4.472.65a.68.68 0 0 1 .004.08v7.63a.75.75 0 0 1-1.5 0V3.67c-.763.72-1.677 1.18-2.842 1.16a4.856 4.856 0 0 1-2.965-1.096V9.25a.75.75 0 0 1-1.5 0V1.648c0-.03.002-.057.005-.085z"
                                    fillRule="nonzero"
                                    />
                                </g>
                                </svg>
                            </div>
                            <h3 className="pl-2">Tên shop</h3>
                            <button className="chat-button">
                              <svg
                                viewBox="0 0 16 16"                            
                                height={15}
                                width={20}
                                className="shopee-svg-icon ml-3 mr-1"
                              >
                                <g fillRule="evenodd">
                                  <path d="M15 4a1 1 0 01.993.883L16 5v9.932a.5.5 0 01-.82.385l-2.061-1.718-8.199.001a1 1 0 01-.98-.8l-.016-.117-.108-1.284 8.058.001a2 2 0 001.976-1.692l.018-.155L14.293 4H15zm-2.48-4a1 1 0 011 1l-.003.077-.646 8.4a1 1 0 01-.997.923l-8.994-.001-2.06 1.718a.5.5 0 01-.233.108l-.087.007a.5.5 0 01-.492-.41L0 11.732V1a1 1 0 011-1h11.52zM3.646 4.246a.5.5 0 000 .708c.305.304.694.526 1.146.682A4.936 4.936 0 006.4 5.9c.464 0 1.02-.062 1.608-.264.452-.156.841-.378 1.146-.682a.5.5 0 10-.708-.708c-.185.186-.445.335-.764.444a4.004 4.004 0 01-2.564 0c-.319-.11-.579-.258-.764-.444a.5.5 0 00-.708 0z" />
                                </g>
                              </svg>
                              Chat ngay
                            </button>
                          </div>
                          <div className="border-b border-black/10 pb-5">
                            {/* ONE ITEM CONTAINER */}
                            <div className="item-container grid grid-cols-6">
                                <div className="col-span-2 item-container-col">
                                  <picture className="contents">
                                    <source
                                      srcSet="https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk7xq5jxlgac94@resize_w40_nl.webp 1x, https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk7xq5jxlgac94@resize_w80_nl.webp 2x"
                                      type="image/webp"
                                      className="contents"
                                    />
                                    <img
                                      width={40}
                                      loading="lazy"
                                      className="align-bottom"
                                      srcSet="https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk7xq5jxlgac94@resize_w40_nl 1x, https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk7xq5jxlgac94@resize_w80_nl 2x"
                                      src="https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk7xq5jxlgac94"
                                      height={40}
                                      alt="product image"
                                      style={{}}
                                    />
                                  </picture>
                                  <span className="item-name">
                                    <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
                                      Item nameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee 
                                    </span>
                                  </span>
                                </div>
                              <div className="item-container-col">
                                <span className="overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-500">
                                  Item typeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
                                </span>
                              </div>
                              <div className="item-container-col ">₫500.000</div>
                              <div className="item-container-col">1</div>
                              <div className="item-container-col">₫500.000</div>
                            </div>                           
                          </div>
                          {/* SHOP VOUCHER  */}
                          <div className="border-b border-black/10 grid grid-cols-10 p-6">
                            <div className="col-span-4" />
                            <div className="whitespace-nowrap col-span-5">
                              <div className="text-sm items-center flex">
                                <svg
                                  fill="none"
                                  viewBox="0 0 23 22"
                                  width={10}
                                  height={10}
                                  className="shopee-svg-icon icon-voucher-applied-line"
                                >
                                  <rect
                                    x={13}
                                    y={9}
                                    width={10}
                                    height={10}
                                    rx={5}
                                    fill="#EE4D2D"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M20.881 11.775a.54.54 0 00-.78.019l-2.509 2.765-1.116-1.033a.542.542 0 00-.74.793l1.5 1.414a.552.552 0 00.844-.106l2.82-3.109a.54.54 0 00-.019-.743z"
                                    fill="#fff"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.488 16.178h.858V14.57h-.858v1.607zM6.488 13.177h.858v-1.605h-.858v1.605zM6.488 10.178h.858V8.572h-.858v1.606zM6.488 7.178h.858V5.572h-.858v1.606z"
                                    fill="#EE4D2D"
                                  />
                                  <g filter="url(#voucher-filter1_d)">
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M1 4v2.325a1.5 1.5 0 01.407 2.487l-.013.012c-.117.103-.25.188-.394.251v.65c.145.063.277.149.394.252l.013.012a1.496 1.496 0 010 2.223l-.013.012c-.117.103-.25.188-.394.251v.65c.145.063.277.149.394.252l.013.012A1.5 1.5 0 011 15.876V18h12.528a6.018 6.018 0 01-.725-1H2v-.58c.55-.457.9-1.147.9-1.92a2.49 2.49 0 00-.667-1.7 2.49 2.49 0 00.667-1.7 2.49 2.49 0 00-.667-1.7A2.49 2.49 0 002.9 7.7c0-.773-.35-1.463-.9-1.92V5h16v.78a2.494 2.494 0 00-.874 2.283 6.05 6.05 0 011.004-.062A1.505 1.505 0 0119 6.325V4H1z"
                                      fill="#EE4D3D"
                                    />
                                  </g>
                                  <defs>
                                    <filter
                                      id="voucher-filter1_d"
                                      x={0}
                                      y={3}
                                      width={20}
                                      height={16}
                                      filterUnits="userSpaceOnUse"
                                      colorInterpolationFilters="sRGB"
                                    >
                                      <feFlood
                                        floodOpacity={0}
                                        result="BackgroundImageFix"
                                      />
                                      <feColorMatrix
                                        in="SourceAlpha"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                      />
                                      <feOffset />
                                      <feGaussianBlur stdDeviation=".5" />
                                      <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0" />
                                      <feBlend
                                        in2="BackgroundImageFix"
                                        result="effect1_dropShadow"
                                      />
                                      <feBlend
                                        in="SourceGraphic"
                                        in2="effect1_dropShadow"
                                        result="shape"
                                      />
                                    </filter>
                                  </defs>
                                </svg>
                                <div>Voucher của Shop</div>
                              </div>
                            </div>
                              <div className="whitespace-nowrap">
                                <div className="items-center flex justify-end"> 
                                    <div className="shop-voucher-sale mr-3">
                                      <span>-₫25k</span>
                                      <div className="sale-svg right-[0] rotate-180">
                                        <svg
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 1 5 35"
                                          style={{ fill: "rgb(238, 77, 45)" }}
                                        >
                                          <path d="M0 0v2.27a2 2 0 010 3.46v2.54a2 2 0 010 3.46v2.54a2 2 0 010 3.46V19h2v-1h-.76A2.99 2.99 0 001 13.76v-1.52a3 3 0 000-4.48V6.24a3 3 0 000-4.48V1h1V0H0z" />
                                        </svg>
                                      </div>
                                      <div className="sale-svg left-0">
                                        <svg
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 1 5 35"
                                          style={{ fill: "rgb(238, 77, 45)" }}
                                        >
                                          <path d="M0 0v2.27a2 2 0 010 3.46v2.54a2 2 0 010 3.46v2.54a2 2 0 010 3.46V19h2v-1h-.76A2.99 2.99 0 001 13.76v-1.52a3 3 0 000-4.48V6.24a3 3 0 000-4.48V1h1V0H0z" />
                                        </svg>
                                      </div>
                                    </div>                                    
                                  <div>
                                    <div>
                                      <button className="!text-sky-700">
                                        <span>Chọn Voucher khác</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              <div />
                            </div>
                          </div>
                        
                        <div className="order-shop-settings">
                          <div className="flex flex-col text-sm p-6">
                            <div className="flex ">
                              <span className="pt-2 items-center justify-center">Lời nhắn:</span>
                              <div className="flex-1">
                                <div className="relative ml-4">
                                  <div className="shop-note-input">
                                    <input
                                      className=" px-3 py-1 w-full"
                                      type="text"
                                      placeholder="Lưu ý cho Người bán..."
                                      defaultValue=""
                                    />
                                  </div>
                                  <div />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col text-sm">
                            <div className="shipping-container">
                              <div className="">Phương thức vận chuyển:</div>
                              <div className="col-start-2 whitespace-nowrap">
                                <div>Nhanh</div>
                              </div>
                              <div className="col-end-2 col-start-1" />
                              <div className="col-end-5 col-start-2 text-teal-500">
                                <div className="content-center flex flex-wrap">
                                  <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/checkout/a714965e439d493ba00c.svg" />
                                  <div className="pl-2">Đảm bảo nhận hàng từ 11 Tháng 3 - 13 Tháng 3</div>
                                </div>
                                <div className="voucher-note">
                                  <div>
                                    Nhận Voucher trị giá ₫15.000 nếu đơn hàng được
                                    giao đến bạn sau ngày 13 Tháng 3 2025.
                                  </div>
                                  <div>
                                    <svg
                                      enableBackground="new 0 0 15 15"
                                      viewBox="0 0 15 15"
                                      x={0}
                                      y={0}
                                      className="shopee-svg-icon icon-help"
                                    >
                                      <g>
                                        <circle
                                          cx="7.5"
                                          cy="7.5"
                                          fill="none"
                                          r="6.5"
                                          strokeMiterlimit={10}
                                        />
                                        <path
                                          d="m5.3 5.3c.1-.3.3-.6.5-.8s.4-.4.7-.5.6-.2 1-.2c.3 0 .6 0 .9.1s.5.2.7.4.4.4.5.7.2.6.2.9c0 .2 0 .4-.1.6s-.1.3-.2.5c-.1.1-.2.2-.3.3-.1.2-.2.3-.4.4-.1.1-.2.2-.3.3s-.2.2-.3.4c-.1.1-.1.2-.2.4s-.1.3-.1.5v.4h-.9v-.5c0-.3.1-.6.2-.8s.2-.4.3-.5c.2-.2.3-.3.5-.5.1-.1.3-.3.4-.4.1-.2.2-.3.3-.5s.1-.4.1-.7c0-.4-.2-.7-.4-.9s-.5-.3-.9-.3c-.3 0-.5 0-.7.1-.1.1-.3.2-.4.4-.1.1-.2.3-.3.5 0 .2-.1.5-.1.7h-.9c0-.3.1-.7.2-1zm2.8 5.1v1.2h-1.2v-1.2z"
                                          stroke="none"
                                        />
                                      </g>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <button className="row-end-2 cursor-pointer col-end-4 capitalize !text-sky-700">Thay đổi</button>
                              <div className="row-start-1 col-start-4 text-right">
                                {/* {" "} */}
                                <span>₫32.700</span>
                              </div>
                            </div>
                            <div className="border-b border-black/10 pb-5" />
                            <div className="items-center flex px-7 py-2.5">
                              <div className="">Được đồng kiểm.</div>
                              <svg
                                enableBackground="new 0 0 15 15"
                                viewBox="0 0 15 15"
                                x={0}
                                y={0}
                                className="shopee-svg-icon cursor-pointer icon-help"
                              >
                                <g>
                                  <circle
                                    cx="7.5"
                                    cy="7.5"
                                    fill="none"
                                    r="6.5"
                                    strokeMiterlimit={10}
                                  />
                                  <path
                                    d="m5.3 5.3c.1-.3.3-.6.5-.8s.4-.4.7-.5.6-.2 1-.2c.3 0 .6 0 .9.1s.5.2.7.4.4.4.5.7.2.6.2.9c0 .2 0 .4-.1.6s-.1.3-.2.5c-.1.1-.2.2-.3.3-.1.2-.2.3-.4.4-.1.1-.2.2-.3.3s-.2.2-.3.4c-.1.1-.1.2-.2.4s-.1.3-.1.5v.4h-.9v-.5c0-.3.1-.6.2-.8s.2-.4.3-.5c.2-.2.3-.3.5-.5.1-.1.3-.3.4-.4.1-.2.2-.3.3-.5s.1-.4.1-.7c0-.4-.2-.7-.4-.9s-.5-.3-.9-.3c-.3 0-.5 0-.7.1-.1.1-.3.2-.4.4-.1.1-.2.3-.3.5 0 .2-.1.5-.1.7h-.9c0-.3.1-.7.2-1zm2.8 5.1v1.2h-1.2v-1.2z"
                                    stroke="none"
                                  />
                                </g>
                              </svg>
                            </div>
                          </div>
                        </div>
                      <div className="shop-total  !text-xl">
                        <div className="flex items-center">
                          <h3 className="title-total ">
                            <div>Tổng số tiền (2 sản phẩm):</div>
                          </h3>
                          <div className="title-total pl-2.5 pr-6  font-weight-500 !text-orange-600">
                            ₫507.700
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* SHOPEE VOUCHER */}
                <div className="!mt-[20px]">
                  <div className="shopee-voucher-container">
                    <div className="flex-grow">
                        <div className="title">
                          <svg
                            fill="none"
                            viewBox="0 -2 23 22"
                            className="shopee-svg-icon icon-voucher-line"
                          >
                            <g filter="url(#voucher-filter0_d)">
                              <mask id="a" fill="#fff">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M1 2h18v2.32a1.5 1.5 0 000 2.75v.65a1.5 1.5 0 000 2.75v.65a1.5 1.5 0 000 2.75V16H1v-2.12a1.5 1.5 0 000-2.75v-.65a1.5 1.5 0 000-2.75v-.65a1.5 1.5 0 000-2.75V2z"
                                />
                              </mask>
                              <path
                                d="M19 2h1V1h-1v1zM1 2V1H0v1h1zm18 2.32l.4.92.6-.26v-.66h-1zm0 2.75h1v-.65l-.6-.26-.4.91zm0 .65l.4.92.6-.26v-.66h-1zm0 2.75h1v-.65l-.6-.26-.4.91zm0 .65l.4.92.6-.26v-.66h-1zm0 2.75h1v-.65l-.6-.26-.4.91zM19 16v1h1v-1h-1zM1 16H0v1h1v-1zm0-2.12l-.4-.92-.6.26v.66h1zm0-2.75H0v.65l.6.26.4-.91zm0-.65l-.4-.92-.6.26v.66h1zm0-2.75H0v.65l.6.26.4-.91zm0-.65l-.4-.92-.6.26v.66h1zm0-2.75H0v.65l.6.26.4-.91zM19 1H1v2h18V1zm1 3.32V2h-2v2.32h2zm-.9 1.38c0-.2.12-.38.3-.46l-.8-1.83a2.5 2.5 0 00-1.5 2.29h2zm.3.46a.5.5 0 01-.3-.46h-2c0 1.03.62 1.9 1.5 2.3l.8-1.84zm.6 1.56v-.65h-2v.65h2zm-.9 1.38c0-.2.12-.38.3-.46l-.8-1.83a2.5 2.5 0 00-1.5 2.29h2zm.3.46a.5.5 0 01-.3-.46h-2c0 1.03.62 1.9 1.5 2.3l.8-1.84zm.6 1.56v-.65h-2v.65h2zm-.9 1.38c0-.2.12-.38.3-.46l-.8-1.83a2.5 2.5 0 00-1.5 2.29h2zm.3.46a.5.5 0 01-.3-.46h-2c0 1.03.62 1.9 1.5 2.3l.8-1.84zM20 16v-2.13h-2V16h2zM1 17h18v-2H1v2zm-1-3.12V16h2v-2.12H0zm1.4.91a2.5 2.5 0 001.5-2.29h-2a.5.5 0 01-.3.46l.8 1.83zm1.5-2.29a2.5 2.5 0 00-1.5-2.3l-.8 1.84c.18.08.3.26.3.46h2zM0 10.48v.65h2v-.65H0zM.9 9.1a.5.5 0 01-.3.46l.8 1.83A2.5 2.5 0 002.9 9.1h-2zm-.3-.46c.18.08.3.26.3.46h2a2.5 2.5 0 00-1.5-2.3L.6 8.65zM0 7.08v.65h2v-.65H0zM.9 5.7a.5.5 0 01-.3.46l.8 1.83A2.5 2.5 0 002.9 5.7h-2zm-.3-.46c.18.08.3.26.3.46h2a2.5 2.5 0 00-1.5-2.3L.6 5.25zM0 2v2.33h2V2H0z"
                                mask="url(#a)"
                              />
                            </g>
                            <path
                              clipRule="evenodd"
                              d="M6.49 14.18h.86v-1.6h-.86v1.6zM6.49 11.18h.86v-1.6h-.86v1.6zM6.49 8.18h.86v-1.6h-.86v1.6zM6.49 5.18h.86v-1.6h-.86v1.6z"
                            />
                            <defs>
                              <filter
                                id="voucher-filter0_d"
                                x={0}
                                y={1}
                                width={20}
                                height={16}
                                filterUnits="userSpaceOnUse"
                                colorInterpolationFilters="sRGB"
                              >
                                <feFlood
                                  floodOpacity={0}
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                />
                                <feOffset />
                                <feGaussianBlur stdDeviation=".5" />
                                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0" />
                                <feBlend
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow"
                                />
                                <feBlend
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow"
                                  result="shape"
                                />
                              </filter>
                            </defs>
                          </svg>
                          <h2 className="text-[18px] font-normal mx-2">Shopee Voucher</h2>
                        </div>
                    </div>
                    <div className="">
                      <button className="!text-sky-700" onClick={()=> setOpenVoucherModal(true)}>Chọn Voucher</button>
                    </div>
                  </div>
                </div>
                {/* ALL TOTAL */}
                <div className="">
                  <div className="bg-white mt-[20px]">                    
                    <div className="items-center flex min-h-[90px] px-8 ">
                      <div className="text-lg flex-1">Phương thức thanh toán</div>
                      <div className="">Thanh toán khi nhận hàng</div>
                      <button className="!text-sky-700 cursor-pointer !ml-[110px] !uppercase">Thay đổi</button>
                    </div>
                  </div>
                  
                  <div className="total-total-bg ">                    
                    <h3 className="title-total">Tổng tiền hàng</h3>
                    <div className="title-total total-total">₫932.000</div>
                    <h3 className="title-total">
                      Tổng tiền phí vận chuyển
                    </h3>
                    <div className="title-total total-total">₫83.800</div>
                    <h3 className="title-total">
                      Tổng cộng Voucher giảm giá
                    </h3>
                    <div className="title-total total-total">-₫25.000</div>
                    <h3 className="title-total">Tổng thanh toán</h3>
                    <div className="title-total total-total !text-orange-600 text-3xl font-medium">₫990.800</div>
                  </div>
                  <div className="total-total-bg ">            
                    <div className="order-button-out">
                      <button className="bg-orange-600 px-9 py-3 !text-white !text-xl">
                        Đặt hàng
                      </button>
                    </div>
                  </div>    
                </div>
              </div>
            </div>

          {/* Voucher modal */}
          {/* {openVoucherModal &&  */}


              <div className="voucher-modal">
                <div className="z-1">
                  <div className="voucher-modal-container">
                    <div className="voucher-modal-header grid grid-cols-8 ">
                      <div className="col-span-7 text-lg">Chọn Shopee Voucher</div>
                      <div className="text-gray-300"> Hỗ trợ</div>

                    </div>
                    <div className="voucher-modal-code">
                      <div className="label">Mã voucher</div>
                      <input
                        className="voucher-input"
                        type="text"
                        placeholder="Nhập mã voucher..."
                      />
                      <button className="apply-btn">Áp dụng</button>
                    </div>

                    <div className="voucher-scroll-list">
                    <div className="voucher-item">
                        <div className="voucher-badge">x2</div>
                        <div className="voucher-img">
                          <img
                            src="https://down-vn.img.susercontent.com/file/e6a3b7beffa95ca492926978d5235f79"
                            alt="Voucher"
                          />
                        </div>
                        <div className="voucher-content">
                          <div className="text-lg font-semibold">Giảm tối đa 100k</div>
                          <div className="text-sm text-gray-600">Đơn từ 100k</div>

                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: "86%" }}></div>
                          </div>

                          <div className="text-xs text-gray-500">Đã dùng: 86%</div>
                          <div className="text-xs text-gray-500">HSD: dd/MM/yyyy</div>
                        </div>
                        <RadioButton
                              label=""
                              checked={selectedRadio === "option1"}
                              onChange={() => setSelectedRadio("option1")}
                        />
                      </div>
                    <div className="voucher-item">
                        <div className="voucher-badge">x2</div>
                        <div className="voucher-img">
                          <img
                            src="https://down-vn.img.susercontent.com/file/e6a3b7beffa95ca492926978d5235f79"
                            alt="Voucher"
                          />
                        </div>
                        <div className="voucher-content">
                          <div className="text-lg font-semibold">Giảm tối đa 100k</div>
                          <div className="text-sm text-gray-600">Đơn từ 100k</div>

                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: "86%" }}></div>
                          </div>

                          <div className="text-xs text-gray-500">Đã dùng: 86%</div>
                          <div className="text-xs text-gray-500">HSD: dd/MM/yyyy</div>
                        </div>
                        <RadioButton
                              label=""
                              checked={selectedRadio === "option2"}
                              onChange={() => setSelectedRadio("option2")}
                        />
                      </div>                    </div>

                    <div className="voucher-modal-footer">
                      <button className="gray-button !mr-3">
                        Trở lại
                      </button>
                      <button className="color-button">
                        OK
                      </button>                  
                    </div>
                  </div>
                </div>

                <div className="modal-bg" onClick={() => setOpenVoucherModal(false)} />
              </div>            
          {/* } */}

          
          {/* Address modal */}
          {openAddressModal &&                             
            <div>
              <div className="address-modal" >
                <div className="z-1">
                  <div className="address-container">
                    <div className="flex-col flex h-[600px] relative justify-center">
                      <div className="title">
                        <div>Địa Chỉ Của Tôi</div>
                      </div>
                      <div className="bodyparts">
                        <div role="radiogroup">
                          <div className="address-info">
                            <div className="pr-2">
                            <RadioButton
                              label=""
                              checked={selectedRadio === "option1"}
                              onChange={() => setSelectedRadio("option1")}
                            />
                            </div>
                            <div className="min-w-[0] w-full">
                              <div role="heading" className="mb-2 flex justify-between">
                                <div
                                  id="address-card-1-header"
                                  className="mr-4 flex flex-grow overflow-x-hidden"
                                >
                                  <span className="text-[1rem] inline-flex">
                                    <div className="overflow-x-hidden overflow-ellipsis whitespace-nowrap">HCMUS</div>
                                  </span>
                                  <div className="straight-line" />
                                  <div role="row" className="addr-info flex items-center">
                                    (+84) 123 456 789
                                  </div>
                                </div>
                                <div className="[flex-basis:40px] flex justify-end">
                                  <button className="addr-change">Cập nhật</button>
                                </div>
                              </div>
                              <div
                                id="address-card-1-content"
                                role="heading"
                                className="mb-2 flex justify-between"
                              >
                                <div className="mr-4 flex flex-grow overflow-x-hidden">
                                  <div className="text-[0.875rem] leading-5 text-gray-500">
                                    <div role="row" className="flex items-center">
                                      227 Đ. Nguyễn Văn Cừ
                                    </div>
                                    <div role="row" className="flex items-center">
                                      Phường 4, Quận 5, Hồ Chí Minh
                                    </div>
                                  </div>
                                </div>
                                <div className="pt-2 [flex-basis:40px] flex justify-end" />
                              </div>
                              <div
                                id="address-card-1-badge"
                                role="row"
                                className="mt-2 flex-wrap flex items-center"
                              >
                                <span role="mark" className="address-type default">
                                  Mặc định
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="address-info">
                            <div className="pr-2">
                            <RadioButton
                              label=""
                              checked={selectedRadio === "option2"}
                              onChange={() => setSelectedRadio("option2")}
                            />
                            </div>
                            <div className="min-w-[0] w-full">
                              <div role="heading" className="mb-2 flex justify-between">
                                <div
                                  id="address-card-2-header"
                                  className="mr-4 flex flex-grow overflow-x-hidden"
                                >
                                  <span className="text-[1rem] inline-flex">
                                    <div className="overflow-x-hidden overflow-ellipsis whitespace-nowrap">HMCUS</div>
                                  </span>
                                  <div className="straight-line" />
                                  <div role="row" className="addr-info flex items-center">
                                    (+84) 123 456 789
                                  </div>
                                </div>
                                <div className="[flex-basis:40px] flex justify-end">
                                  <button className="addr-change">Cập nhật</button>
                                </div>
                              </div>
                              <div
                                id="address-card-2-content"
                                role="heading"
                                className="mb-2 flex justify-between"
                              >
                                <div className="mr-4 flex flex-grow overflow-x-hidden">
                                  <div className="text-[0.875rem] leading-5 text-gray-500">
                                    <div role="row" className="flex items-center">
                                    227 Đ. Nguyễn Văn Cừ
                                    </div>
                                    <div role="row" className="flex items-center">
                                      Phường 4, Quận 5, Hồ Chí Minh
                                    </div>
                                  </div>
                                </div>
                                <div className="pt-2 [flex-basis:40px] flex justify-end" />
                              </div>
                              <div
                                id="address-card-2-badge"
                                role="row"
                                className="mt-2 flex-wrap flex items-center"
                              >
                                <span role="mark" className="address-type">
                                  Địa chỉ lấy hàng
                                </span>
                                <span role="mark" className="address-type">
                                  Địa chỉ trả hàng
                                </span>
                              </div>
                              <div
                                id="address-card-2-invalid-flag"
                                className="bg-amber-50 p-3 mt-2"
                              >
                                Số điện thoại hoặc địa chỉ nhận hàng chưa chính xác. Vui
                                lòng kiểm tra và cập nhật.
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-black/10 pb-5 " />
                        <button className="gray-button">
                          <svg 
                            viewBox="0 0 10 10" className="mr-2 fill-gray-500"
                            width={16}
                            height={16}
                          >
                            <path
                              stroke="none"
                              d="m10 4.5h-4.5v-4.5h-1v4.5h-4.5v1h4.5v4.5h1v-4.5h4.5z"
                            />
                          </svg>
                          Thêm Địa Chỉ Mới
                        </button>
                      </div>
                      <div className="border-t border-black/10 pb-5 bottom-0 h-[64px] px-6 pt-3 justify-end !items-center flex">
                        <button 
                          className="!mr-2 gray-button" 
                          onClick={() => setOpenAddressModal(false)}
                        >
                          Huỷ
                        </button>
                        <button 
                          className="color-button" 
                          onClick={() => setOpenAddressModal(false)}
                        >
                          Xác nhận
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-bg" onClick={() => setOpenAddressModal(false)}/>
              </div>
            </div>
          }

        </div>
        </HomeLayout>
      );
}