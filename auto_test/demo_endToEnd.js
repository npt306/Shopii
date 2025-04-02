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
    await driver.findElement(By.name('product-name')).sendKeys('Áo thi đấu ĐTQG Việt Nam 2025');
    await driver.findElement(By.name('product-description')).sendKeys('Mẫu áo đấu từ Jogarbola sẽ đồng hành cùng ĐTQG Việt Nam trong năm 2025');
    await driver.findElement(By.name('product-price')).sendKeys('234000');
    await driver.findElement(By.name('product-quantity')).sendKeys('100');

    let productImage = driver.findElement(By.name('product-images'));
    await productImage.sendKeys(path.resolve(__dirname, 'test_sources/ao_DTQG_trang.png'));

    let coverImage = driver.findElement(By.name('product-cover-image'));
    await coverImage.sendKeys(path.resolve(__dirname, 'test_sources/ao_DTQG_do.png'));
    console.log('\n✅ Đã thêm ảnh sản phẩm!');

    // Mở menu chọn ngành hàng và đợi phần tử xuất hiện
    await driver.wait(until.elementLocated(By.css('[data-name="category-list-container"]')), 10000, 'Không tìm thấy menu chọn ngành hàng!');

    await driver.findElement(By.css('[data-name="category-list-container"]')).click();
    console.log('\n✅ Đã mở menu chọn ngành hàng!');

    // Tìm tất cả các mục trong danh sách ngành hàng
    const categoryItems = await driver.findElements(By.css('[data-name="category-item"]'));

    let found = false;
    for (const category of categoryItems) {
        const categoryText = await category.getText();
        
        if (categoryText === 'Sport & Outdoor') {
            await category.click(); // Chọn ngành hàng
            console.log('\n✅ Đã chọn ngành hàng Sport & Outdoor!');
            found = true;
            break;
        }
    }

    if (!found) {
        const categoryListContainer = await driver.findElement(By.css('[data-name="category-list-container"]'));
        
        await driver.executeScript('arguments[0].scrollTop = arguments[0].scrollHeight', categoryListContainer);
        console.log('\n🔄 Đang cuộn xuống để tìm ngành hàng...');
        
        await addProduct(driver);  // Gọi lại hàm nếu không tìm thấy ngành hàng
    } else {
        await driver.findElement(By.name('save-new-product')).click();
        console.log('\n✅ Đã thêm sản phẩm thành công!');
    }
}

async function completePurchase(driver) {
    // Chuyển hướng sang trang homepage của buyer
    await driver.get('http://34.58.241.34:8000/home');
    console.log('\n✅ Đã vào trang homepage của buyer!');

    // Chọn sản phẩm đầu tiên trong danh sách sản phẩm gợi ý hôm nay
    const firstProduct = await driver.findElement(By.css('.today-products .product-item:first-child a'));
    await firstProduct.click();
    console.log('\n✅ Đã vào trang chi tiết sản phẩm đầu tiên!');

    // Chọn màu sắc có thể chọn (tránh các màu bị disable)
    const availableColors = await driver.findElements(By.css('.color-options .color-item:not(.disabled)'));
    if (availableColors.length > 0) {
        await availableColors[0].click();  // Chọn màu sắc đầu tiên có thể chọn
        console.log('\n✅ Đã chọn màu sắc!');
    } else {
        console.log('\n❌ Không có màu sắc có thể chọn!');
    }

    // Chọn kích cỡ có thể chọn
    const availableSizes = await driver.findElements(By.css('.size-options .size-item:not(.disabled)'));
    if (availableSizes.length > 0) {
        await availableSizes[0].click();  // Chọn kích cỡ đầu tiên có thể chọn
        console.log('\n✅ Đã chọn kích cỡ!');
    } else {
        console.log('\n❌ Không có kích cỡ có thể chọn!');
    }

    // Chọn số lượng (nhập số lượng hoặc bấm nút tăng)
    const quantityInput = await driver.findElement(By.name('quantity'));
    await quantityInput.clear();
    await quantityInput.sendKeys('2');  // Nhập số lượng là 2 sản phẩm
    console.log('\n✅ Đã chọn số lượng sản phẩm!');

    // Thêm sản phẩm vào giỏ hàng
    const addToCartButton = await driver.findElement(By.css('.add-to-cart-button'));
    await addToCartButton.click();
    console.log('\n✅ Đã thêm sản phẩm vào giỏ hàng!');

    // Bấm vào nút giỏ hàng
    const cartButton = await driver.findElement(By.css('.cart-icon'));
    await cartButton.click();
    console.log('\n✅ Đã vào giỏ hàng!');

    // Đánh dấu tick vào checkbox của sản phẩm vừa chọn
    const productCheckbox = await driver.findElement(By.css('.cart-item input[type="checkbox"]'));
    await productCheckbox.click();
    console.log('\n✅ Đã đánh dấu vào checkbox của sản phẩm!');

    // Bấm mua hàng
    const checkoutButton = await driver.findElement(By.css('.checkout-button'));
    await checkoutButton.click();
    console.log('\n✅ Đã bấm mua hàng!');
}

(async function runTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);
        await navigateToSellerChannel(driver);
        await addProduct(driver);
        await completePurchase(driver);
    } catch (error) {
        console.error('\n❌ Lỗi kiểm thử:', error);
    } finally {
        await driver.quit();
        console.log('\n🚀 Test kết thúc!');
    }
})();

