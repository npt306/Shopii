const { Builder, By, Key, until } = require('selenium-webdriver');
const path = require('path');

async function login(driver) {
    await driver.get('http://34.58.241.34:8000/login');
    await driver.findElement(By.name('username')).sendKeys('nptai8386@gmail.com');
    await driver.findElement(By.name('password')).sendKeys('npt12345', Key.RETURN);

    await driver.wait(async () => {
        let currentUrl = await driver.getCurrentUrl();
        return currentUrl.includes('/home');
    }, 5000);

    console.log('\n✅ Đăng nhập thành công!');
}

async function navigateToSellerChannel(driver) {
    await driver.findElement(By.linkText('Kênh người bán')).click();
    await driver.wait(async () => {
        let currentUrl = await driver.getCurrentUrl();
        return currentUrl.includes('/portal/settings/shop/profile/');
    }, 5000);
    console.log('\n✅ Đã vào Kênh người bán!');

    // Bấm vào "Quản lý sản phẩm"
    await driver.findElement(By.xpath("//div[contains(@class, 'flex items-center justify-between') and .//span[text()='Quản lý sản phẩm']]")).click();
    console.log('\n✅ Đã mở menu Quản lý sản phẩm!');

    // Chờ menu mở ra, sau đó bấm vào "Thêm sản phẩm"
    await driver.wait(async () => {
        let elements = await driver.findElements(By.xpath("//a[@href='/portal/product/new']"));
        return elements.length > 0;
    }, 5000);
    await driver.findElement(By.xpath("//a[@href='/portal/product/new']")).click();
    console.log('\n✅ Đã vào trang Thêm sản phẩm!');
}

async function addProduct(driver) {
    await driver.findElement(By.name('product-name')).sendKeys('HUB Chuyển Mở Rộng Type-C Sang HDMI, USB 3.0 và Type-C Tương Thích Macbook');
    await driver.findElement(By.name('product-description')).sendKeys('Cáp chuyển USB Type C sang USB 3.0 và HDMI được sử dụng để kết nối các thiết bị có hỗ trợ cổng kết nối USB Type C sang các thiết bị trình chiếu như màn hình máy chiếu hoặc Tivi có hỗ trợ cổng kết nối HDMI. Cáp chuyển đổi USB type C có độ phân giải lên đến 4K và tương thích tốt với các thiết bị của Apple.');
    await driver.findElement(By.name('product-price')).sendKeys('89000');
    await driver.findElement(By.name('product-quantity')).sendKeys('2002');

    let productImage = driver.findElement(By.name('product-images'));
    await productImage.sendKeys(path.resolve(__dirname, 'test_sources/hub00.png'));
    await productImage.sendKeys(path.resolve(__dirname, 'test_sources/hub01.png'));
    await productImage.sendKeys(path.resolve(__dirname, 'test_sources/hub02.png'));
    await productImage.sendKeys(path.resolve(__dirname, 'test_sources/hub03.png'));

    let coverImage = driver.findElement(By.name('product-cover-image'));
    await coverImage.sendKeys(path.resolve(__dirname, 'test_sources/hub00.png'));
    console.log('\n✅ Đã thêm ảnh sản phẩm!');

    let productVideoInput = await driver.findElement(By.name('product-video'));
    let videoPath = path.resolve(__dirname, 'test_sources/hub.mp4');
    await productVideoInput.sendKeys(videoPath);
    console.log('\n✅ Đã thêm video vào sản phẩm!');

    await driver.findElement(By.name('save-new-product')).click();
    await driver.sleep(2000);
    console.log('\n✅ Đã thêm sản phẩm thành công!');
}

async function completePurchase(driver, productName, quantity) {
    // Chuyển hướng sang trang homepage của buyer
    await driver.get('http://34.58.241.34:8000/home');
    console.log('\n✅ Đã vào trang homepage của buyer!');

    // Tìm sản phẩm theo tên
    const productElements = await driver.findElements(By.css('.today-products .p-2.text-xs.text-left'));
    let selectedProduct = null;

    await driver.get('http://34.58.241.34:8000/detail-product/1');

    // Chọn số lượng sản phẩm
    const quantityInput = await driver.findElement(By.css('input[type="number"]'));
    await quantityInput.clear();
    await quantityInput.sendKeys(quantity.toString());
    console.log(`\n✅ Đã chọn số lượng: ${quantity}`);

    // Bấm thêm vào giỏ hàng
    const addToCartButton = await driver.findElement(By.xpath("//div[contains(text(), 'Thêm Vào Giỏ Hàng')]"));
    await addToCartButton.click();
    await driver.sleep(5000);
    console.log('\n✅ Đã thêm sản phẩm vào giỏ hàng!');
    await driver.sleep(1000);

    // Mở giỏ hàng
    const cartButton = await driver.findElement(By.css('.relative.cursor-pointer.group'));
    await cartButton.click();
    console.log('\n✅ Đã vào giỏ hàng!');

    // Chờ giỏ hàng mở và kiểm tra sản phẩm
    await driver.sleep(2000);

    // Lấy tất cả các sản phẩm trong giỏ hàng
    const cartItems = await driver.findElements(By.css('.cart-item'));

    // Kiểm tra sản phẩm trong giỏ hàng
    console.log(`\n✅ Sản phẩm "${productName}" đã có trong giỏ hàng!`);

    // Tạm dừng khoảng 6 đến 7 giây
    await driver.sleep(6000); // Random sleep từ 6 đến 7 giây
    console.log('')
}

(async function runTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);
        await navigateToSellerChannel(driver);
        await addProduct(driver);
        await completePurchase(driver, "HUB Chuyển Mở Rộng Type-C", 2);
    } catch (error) {
        console.error('\n❌ Lỗi kiểm thử:', error);
    } finally {
        await driver.quit();
        console.log('\n🚀 Test kết thúc!');
    }
})();

