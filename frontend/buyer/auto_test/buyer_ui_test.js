import { Builder, By, Key, until } from 'selenium-webdriver';

async function loginTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // 1. Mở trang đăng nhập
        await driver.get('http://34.58.241.34:8000/login');

        // 2. Đợi trang tải
        await driver.sleep(2000);

        // 3. Kiểm tra các thành phần UI có tồn tại không
        let isLoginFormDisplayed = await driver.findElement(By.tagName('form')).isDisplayed();
        console.log("Form đăng nhập hiển thị:", isLoginFormDisplayed);

        let usernameField = await driver.findElement(By.name('username')); // Thay đổi nếu input có ID khác
        let passwordField = await driver.findElement(By.name('password'));
        let loginButton = await driver.findElement(By.xpath("//button[contains(text(),'ĐĂNG NHẬP')]"));

        console.log("Trường nhập username tồn tại:", await usernameField.isDisplayed());
        console.log("Trường nhập password tồn tại:", await passwordField.isDisplayed());
        console.log("Nút đăng nhập tồn tại:", await loginButton.isDisplayed());

        // 4. Nhập username và mật khẩu
        await usernameField.sendKeys('test_user');
        await passwordField.sendKeys('test_password');

        // 5. Nhấn nút đăng nhập
        await loginButton.click();

        // 6. Đợi phản hồi từ UI (thành công hoặc lỗi)
        await driver.sleep(3000);

        // 7. Kiểm tra xem có lỗi hiển thị không
        try {
            let errorMessage = await driver.findElement(By.className('error-message'));
            console.log("Lỗi đăng nhập hiển thị:", await errorMessage.getText());
        } catch (error) {
            console.log("Không có lỗi đăng nhập, có thể đã thành công!");
        }

    } finally {
        // 8. Đóng trình duyệt
        await driver.quit();
    }
}

// Chạy script
loginTest();
