// আপনার পাসওয়ার্ড (এখানে ইচ্ছেমতো পাল্টাতে পারেন)
const MADRASA_PASSWORD = "123456";

// ১. লগইন করার ফাংশন
function handleLogin(event) {
    event.preventDefault(); // পেজ রিলোড হওয়া আটকাবে
    
    const inputPassword = document.getElementById('passwordInput').value;
    const errorMessage = document.getElementById('errorMessage');

    if (inputPassword === MADRASA_PASSWORD) {
        // পাসওয়ার্ড সঠিক হলে ড্যাশবোর্ড দেখাবে
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'flex';
        errorMessage.style.display = 'none';
        document.getElementById('passwordInput').value = '';
    } else {
        // ভুল পাসওয়ার্ড হলে এরর মেসেজ দেখাবে
        errorMessage.style.display = 'block';
    }
}

// ২. লগআউট করার ফাংশন
function handleLogout() {
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}
