import { Builder, By, Key } from "selenium-webdriver"; // ES module

(async function loginTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Mở trang đăng nhập
        await driver.get('http://34.58.241.34:8000/login');

        // Điền username
        await driver.findElement(By.name('username')).sendKeys('nptai8386@gmail.com');

        // Điền mật khẩu
        await driver.findElement(By.name('password')).sendKeys('npt12345', Key.RETURN);

        console.log('\n');
        // Chờ chuyển hướng hoặc xuất hiện thông báo lỗi
        await driver.wait(async () => {
            let currentUrl = await driver.getCurrentUrl();
            return currentUrl.includes('/home') || 
                   (await driver.findElements(By.className('error-message'))).length > 0;
        }, 5000);

        // Kiểm tra kết quả
        let currentUrl = await driver.getCurrentUrl();
        
        if (currentUrl.includes('/home')) {
            console.log("Đăng nhập thành công!.");
        } else {
            let errorMessage = await driver.findElement(By.className('error-message')).getText();
            console.log("Đăng nhập thất bại với thông báo lỗi:", errorMessage);
        }
    } catch (error) {
        console.error("Có lỗi xảy ra trong quá trình kiểm thử:", error);
    } finally {
        // Đóng trình duyệt
        await driver.quit();
        console.log("Test kết thúc!");
    }
})();