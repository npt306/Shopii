import { Builder, By, Key, until } from 'selenium-webdriver';

(async function loginTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Mở trang đăng nhập
        await driver.get('http://34.58.241.34:8000/login');

        // Điền username
        await driver.findElement(By.name('username')).sendKeys('test@example.com');

        // Điền mật khẩu
        await driver.findElement(By.name('password')).sendKeys('123456', Key.RETURN);

        // Đợi phản hồi
        await driver.wait(until.elementLocated(By.className('error-message')), 5000);
        
        // Kiểm tra có thông báo lỗi không
        let errorMessage = await driver.findElement(By.className('error-message')).getText();
        console.log("Thông báo lỗi:", errorMessage);
    } catch (error) {
        console.error("Có lỗi xảy ra:", error);
    } finally {
        // Đóng trình duyệt
        await driver.quit();
    }
})();
